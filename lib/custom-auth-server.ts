import 'server-only'

import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

export const SESSION_COOKIE_NAME = 'insolit_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7
const SESSION_DURATION_MS = SESSION_DURATION_SECONDS * 1000

interface UserRow {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  birth_date: string | null
  savings_cents: number
  offers_used: number
  reviews_count: number
  password_hash: string | null
}

type LegacyUserRow = Omit<UserRow, 'birth_date'>

const USER_SELECT_WITH_BIRTH_DATE = 'id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,password_hash'
const USER_SELECT_LEGACY = 'id,prenom,nom,email,location,savings_cents,offers_used,reviews_count,password_hash'

export interface AuthUser {
  id: string
  prenom: string
  nom: string
  email: string
  location: string
  birthDate: string | null
  savingsCents: number
  offersUsed: number
  reviewsCount: number
}

export function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export function isAtLeast16YearsOld(birthDate: string, now = new Date()) {
  if (!isValidIsoDate(birthDate)) {
    return false
  }

  const birth = new Date(`${birthDate}T00:00:00.000Z`)
  if (Number.isNaN(birth.getTime())) {
    return false
  }

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  if (birth > today) {
    return false
  }

  const cutoff = new Date(today)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 16)

  return birth <= cutoff
}

export function getSessionCookieOptions(maxAge = SESSION_DURATION_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) {
    return false
  }

  const [salt, expectedHash] = storedHash.split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const actualHashBuffer = scryptSync(password, salt, 64)
  const expectedHashBuffer = Buffer.from(expectedHash, 'hex')

  if (actualHashBuffer.length !== expectedHashBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedHashBuffer, actualHashBuffer)
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeLocation(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function normalizePersonName(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr-FR')

  return normalized.replace(/(^|[\s'\-])([A-Za-zÀ-ÖØ-öø-ÿ])/g, (_match, prefix: string, letter: string) => {
    return `${prefix}${letter.toLocaleUpperCase('fr-FR')}`
  })
}

export function createUserId() {
  return randomUUID()
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function mapUserRowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    prenom: normalizePersonName(row.prenom),
    nom: normalizePersonName(row.nom),
    email: row.email,
    location: row.location,
    birthDate: row.birth_date,
    savingsCents: row.savings_cents,
    offersUsed: row.offers_used,
    reviewsCount: row.reviews_count,
  }
}

function isBirthDateMissingColumnError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { code?: string; message?: string }
  return maybeError.code === '42703' || maybeError.message?.toLowerCase().includes('birth_date') || false
}

function toUserRow(data: UserRow | LegacyUserRow): UserRow {
  if ('birth_date' in data) {
    return data as UserRow
  }

  return {
    ...data,
    birth_date: null,
  }
}

export async function createSessionForUser(userId: string) {
  const admin = createAdminClient()
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString()

  await admin.from('user_sessions').delete().eq('user_id', userId)

  const { error } = await admin.from('user_sessions').insert({
    token_hash: tokenHash,
    user_id: userId,
    expires_at: expiresAt,
  })

  if (error) {
    throw new Error('Impossible de creer la session utilisateur.')
  }

  return { token, expiresAt }
}

export async function deleteSessionByToken(token: string | null) {
  if (!token) {
    return
  }

  const admin = createAdminClient()
  await admin.from('user_sessions').delete().eq('token_hash', hashSessionToken(token))
}

export async function deleteSessionsForUser(userId: string) {
  const admin = createAdminClient()
  await admin.from('user_sessions').delete().eq('user_id', userId)
}

export async function getCurrentUserFromCookie() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null

  if (!sessionToken) {
    return null
  }

  const admin = createAdminClient()
  const tokenHash = hashSessionToken(sessionToken)

  const { data: session, error: sessionError } = await admin
    .from('user_sessions')
    .select('user_id,expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (sessionError || !session) {
    return null
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await admin.from('user_sessions').delete().eq('token_hash', tokenHash)
    return null
  }

  const { data: userData, error: userError } = await admin
    .from('users')
    .select(USER_SELECT_WITH_BIRTH_DATE)
    .eq('id', session.user_id)
    .maybeSingle()

  if (isBirthDateMissingColumnError(userError)) {
    const { data: legacyUserData, error: legacyUserError } = await admin
      .from('users')
      .select(USER_SELECT_LEGACY)
      .eq('id', session.user_id)
      .maybeSingle()

    if (legacyUserError || !legacyUserData) {
      await admin.from('user_sessions').delete().eq('token_hash', tokenHash)
      return null
    }

    return mapUserRowToAuthUser(toUserRow(legacyUserData as LegacyUserRow))
  }

  if (userError || !userData) {
    await admin.from('user_sessions').delete().eq('token_hash', tokenHash)
    return null
  }

  return mapUserRowToAuthUser(toUserRow(userData as UserRow))
}

export async function findUserByEmail(email: string) {
  const admin = createAdminClient()
  const normalizedEmail = normalizeEmail(email)

  const { data, error } = await admin
    .from('users')
    .select(USER_SELECT_WITH_BIRTH_DATE)
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (isBirthDateMissingColumnError(error)) {
    const { data: legacyData, error: legacyError } = await admin
      .from('users')
      .select(USER_SELECT_LEGACY)
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (legacyError) {
      throw new Error('Erreur lors de la recherche utilisateur.')
    }

    return legacyData ? toUserRow(legacyData as LegacyUserRow) : null
  }

  if (error) {
    throw new Error('Erreur lors de la recherche utilisateur.')
  }

  return data ? toUserRow(data as UserRow) : null
}

export async function createUser(params: {
  prenom: string
  nom: string
  location: string
  birthDate: string
  email: string
  passwordHash: string
}) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('users')
    .insert({
      id: createUserId(),
      prenom: normalizePersonName(params.prenom),
      nom: normalizePersonName(params.nom),
      location: normalizeLocation(params.location),
      birth_date: params.birthDate,
      email: normalizeEmail(params.email),
      password_hash: params.passwordHash,
    })
    .select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,password_hash')
    .single()

  if (error || !data) {
    throw new Error('Impossible de creer le compte.')
  }

  return data as UserRow
}

export async function createOAuthUser(params: {
  email: string
  prenom: string
  nom: string
  location?: string
}) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('users')
    .insert({
      id: createUserId(),
      prenom: normalizePersonName(params.prenom),
      nom: normalizePersonName(params.nom),
      location: normalizeLocation(params.location ?? 'Paris, Ile-de-France'),
      email: normalizeEmail(params.email),
      password_hash: null,
      birth_date: null,
    })
    .select('id,prenom,nom,email,location,birth_date,savings_cents,offers_used,reviews_count,password_hash')
    .single()

  if (error || !data) {
    throw new Error('Impossible de creer le compte OAuth.')
  }

  return data as UserRow
}

export async function deleteCurrentUserFromCookie() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null

  if (!sessionToken) {
    return false
  }

  const admin = createAdminClient()
  const tokenHash = hashSessionToken(sessionToken)

  const { data: session } = await admin
    .from('user_sessions')
    .select('user_id')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!session) {
    return false
  }

  await admin.from('user_sessions').delete().eq('user_id', session.user_id)
  const { error } = await admin.from('users').delete().eq('id', session.user_id)

  return !error
}

export function toClientAuthUser(user: UserRow) {
  return mapUserRowToAuthUser(user)
}

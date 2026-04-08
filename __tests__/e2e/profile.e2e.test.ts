/**
 * E2E tests — Profile & Delete Account routes
 *
 * Tests against a real local Supabase instance.
 * Requires a running `supabase start` and a valid `.env.test.local`.
 */

import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { mockCookies, deleteUserByEmail, extractSessionCookie } from './helpers'

import { POST as register } from '@/app/api/auth/register/route'
import { GET as me } from '@/app/api/auth/me/route'
import { PATCH as updateProfile } from '@/app/api/auth/profile/route'
import { POST as deleteAccount } from '@/app/api/auth/delete-account/route'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'e2e-profile-user@insolit-test.local'

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function patchJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

async function createTestUser() {
  const res = await register(
    postJson('http://localhost/api/auth/register', {
      prenom: 'Profile',
      nom: 'Test',
      location: 'Lyon',
      birthDate: '1995-06-15',
      email: TEST_EMAIL,
      password: 'motdepasse_profile_123',
    })
  )
  const token = extractSessionCookie(res)!
  mockCookies(token)
  return token
}

afterEach(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

afterAll(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-PROFILE-01 — Mise à jour du profil (e2e)', () => {
  it('met à jour prénom, nom et date de naissance et retourne 200', async () => {
    await createTestUser()

    const res = await updateProfile(
      patchJson('http://localhost/api/auth/profile', {
        prenom: 'Nouveau',
        nom: 'Nom',
        birthDate: '1990-03-20',
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toMatchObject({
      prenom: 'Nouveau',
      nom: 'Nom',
      birthDate: '1990-03-20',
      email: TEST_EMAIL,
    })
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await updateProfile(
      patchJson('http://localhost/api/auth/profile', {
        prenom: 'Jean',
        nom: 'Dupont',
        birthDate: '1990-01-01',
      })
    )

    expect(res.status).toBe(401)
  })

  it('retourne 400 si les champs sont manquants', async () => {
    await createTestUser()

    const res = await updateProfile(
      patchJson('http://localhost/api/auth/profile', {
        prenom: '',
        nom: 'Dupont',
        birthDate: '1990-01-01',
      })
    )

    expect(res.status).toBe(400)
  })

  it('retourne 400 si l\'utilisateur a moins de 16 ans', async () => {
    await createTestUser()

    const res = await updateProfile(
      patchJson('http://localhost/api/auth/profile', {
        prenom: 'Jean',
        nom: 'Dupont',
        birthDate: '2020-01-01',
      })
    )

    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-DELETE-ACCOUNT-01 — Suppression de compte (e2e)', () => {
  it('supprime le compte et retourne 200', async () => {
    const token = await createTestUser()

    const res = await deleteAccount()

    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)

    // Vérifier que l'utilisateur n'existe plus en base
    mockCookies(token)
    const meRes = await me()
    expect(meRes.status).toBe(401)
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await deleteAccount()
    expect(res.status).toBe(401)
  })
})

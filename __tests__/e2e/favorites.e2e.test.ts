/**
 * E2E tests — Favorites routes
 *
 * Tests against a real local Supabase instance.
 * Requires a running `supabase start` and a valid `.env.test.local`.
 */

import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { mockCookies, deleteUserByEmail, extractSessionCookie } from './helpers'

import { POST as register } from '@/app/api/auth/register/route'
import { GET as getFavorites, POST as addFavorite } from '@/app/api/favorites/route'
import { DELETE as removeFavorite } from '@/app/api/favorites/[offerId]/route'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'e2e-favorites-user@insolit-test.local'
const SEED_OFFER_ID = '22222222-2222-2222-2222-222222222001' // KFC
const SEED_OFFER_ID_2 = '22222222-2222-2222-2222-222222222002' // Pizza Palace

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function getRequest(url: string) {
  return new NextRequest(url, { method: 'GET' })
}

async function createTestUser() {
  const res = await register(
    postJson('http://localhost/api/auth/register', {
      prenom: 'Favori',
      nom: 'Test',
      location: 'Marseille',
      birthDate: '1998-04-10',
      email: TEST_EMAIL,
      password: 'motdepasse_fav_123',
    })
  )
  const token = extractSessionCookie(res)!
  mockCookies(token)
}

afterEach(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

afterAll(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-FAV-01 — Ajouter un favori (e2e)', () => {
  it('ajoute un favori et retourne 201', async () => {
    await createTestUser()

    const res = await addFavorite(
      postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID })
    )

    expect(res.status).toBe(201)
    expect((await res.json()).success).toBe(true)
  })

  it('est idempotent (upsert) — retourne 201 même si déjà favori', async () => {
    await createTestUser()

    await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))
    const res = await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))

    expect(res.status).toBe(201)
  })

  it('retourne 400 si offerId est manquant', async () => {
    await createTestUser()

    const res = await addFavorite(postJson('http://localhost/api/favorites', {}))
    expect(res.status).toBe(400)
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-FAV-02 — Lister les favoris (e2e)', () => {
  it('retourne la liste des favoris de l\'utilisateur', async () => {
    await createTestUser()

    await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))
    await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID_2 }))

    const res = await getFavorites(getRequest('http://localhost/api/favorites'))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.favorites).toContain(SEED_OFFER_ID)
    expect(json.favorites).toContain(SEED_OFFER_ID_2)
  })

  it('retourne [] pour un utilisateur sans favoris', async () => {
    await createTestUser()

    const res = await getFavorites(getRequest('http://localhost/api/favorites'))
    expect(res.status).toBe(200)
    expect((await res.json()).favorites).toHaveLength(0)
  })

  it('vérifie si une offre spécifique est en favori via ?offerId=', async () => {
    await createTestUser()

    await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))

    const resYes = await getFavorites(
      getRequest(`http://localhost/api/favorites?offerId=${SEED_OFFER_ID}`)
    )
    expect((await resYes.json()).isFavorite).toBe(true)

    const resNo = await getFavorites(
      getRequest(`http://localhost/api/favorites?offerId=${SEED_OFFER_ID_2}`)
    )
    expect((await resNo.json()).isFavorite).toBe(false)
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await getFavorites(getRequest('http://localhost/api/favorites'))
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-FAV-03 — Supprimer un favori (e2e)', () => {
  it('supprime un favori existant et retourne 200', async () => {
    await createTestUser()

    await addFavorite(postJson('http://localhost/api/favorites', { offerId: SEED_OFFER_ID }))

    const res = await removeFavorite(
      new NextRequest(`http://localhost/api/favorites/${SEED_OFFER_ID}`, { method: 'DELETE' }),
      { params: { offerId: SEED_OFFER_ID } }
    )

    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)

    // Vérifie que le favori n'existe plus
    const checkRes = await getFavorites(
      getRequest(`http://localhost/api/favorites?offerId=${SEED_OFFER_ID}`)
    )
    expect((await checkRes.json()).isFavorite).toBe(false)
  })

  it('retourne 200 même si le favori n\'existait pas (idempotent)', async () => {
    await createTestUser()

    const res = await removeFavorite(
      new NextRequest(`http://localhost/api/favorites/${SEED_OFFER_ID}`, { method: 'DELETE' }),
      { params: { offerId: SEED_OFFER_ID } }
    )
    expect(res.status).toBe(200)
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await removeFavorite(
      new NextRequest(`http://localhost/api/favorites/${SEED_OFFER_ID}`, { method: 'DELETE' }),
      { params: { offerId: SEED_OFFER_ID } }
    )
    expect(res.status).toBe(401)
  })
})

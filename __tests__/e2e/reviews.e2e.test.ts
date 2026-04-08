/**
 * E2E tests — Reviews route
 *
 * Tests against a real local Supabase instance.
 * Requires a running `supabase start` and a valid `.env.test.local`.
 */

import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { mockCookies, deleteUserByEmail, extractSessionCookie } from './helpers'
import { createAdminClient } from '@/utils/supabase/admin'

import { POST as register } from '@/app/api/auth/register/route'
import { POST as postReview } from '@/app/api/reviews/route'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'e2e-reviews-user@insolit-test.local'
const SEED_OFFER_ID = '22222222-2222-2222-2222-222222222001' // KFC

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

async function createTestUser() {
  const res = await register(
    postJson('http://localhost/api/auth/register', {
      prenom: 'Avis',
      nom: 'Test',
      location: 'Bordeaux',
      birthDate: '1993-07-22',
      email: TEST_EMAIL,
      password: 'motdepasse_review_123',
    })
  )
  const token = extractSessionCookie(res)!
  mockCookies(token)
  return token
}

async function cleanupReviewsByEmail(email: string) {
  const admin = createAdminClient()
  await admin.from('reviews').delete().eq('user_email_snapshot', email)
}

afterEach(async () => {
  await cleanupReviewsByEmail(TEST_EMAIL)
  await deleteUserByEmail(TEST_EMAIL)
})

afterAll(async () => {
  await cleanupReviewsByEmail(TEST_EMAIL)
  await deleteUserByEmail(TEST_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-REVIEW-01 — Publier un avis (e2e)', () => {
  it('crée un avis et retourne 201 avec les données de la review', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 4,
        title: 'Très bien',
        text: 'Super expérience au KFC, je recommande vivement.',
      })
    )

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.review).toMatchObject({
      offerId: SEED_OFFER_ID,
      offerTitle: 'KFC Villiers-sur-Marne',
      rating: 4,
      title: 'Très bien',
      text: 'Super expérience au KFC, je recommande vivement.',
    })
    expect(json.review).toHaveProperty('id')
    expect(json.review).toHaveProperty('createdAt')
    expect(json.review.userEmail).toBe(TEST_EMAIL)
  })

  it('retourne 401 sans session', async () => {
    mockCookies(null)

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 3,
        title: 'Ok',
        text: 'Pas mal du tout.',
      })
    )
    expect(res.status).toBe(401)
  })

  it('retourne 400 si des champs sont manquants', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 3,
        // title et text manquants
      })
    )
    expect(res.status).toBe(400)
  })

  it('retourne 400 si la note est hors de [1-5]', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 6,
        title: 'Top',
        text: 'Génial.',
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message')
  })

  it('retourne 400 si le titre dépasse 120 caractères', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 3,
        title: 'A'.repeat(121),
        text: 'Commentaire normal.',
      })
    )
    expect(res.status).toBe(400)
  })

  it('retourne 400 si le texte dépasse 1000 caractères', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: SEED_OFFER_ID,
        rating: 3,
        title: 'Titre normal',
        text: 'A'.repeat(1001),
      })
    )
    expect(res.status).toBe(400)
  })

  it('retourne 404 pour un offerId inexistant', async () => {
    await createTestUser()

    const res = await postReview(
      postJson('http://localhost/api/reviews', {
        offerId: '00000000-0000-0000-0000-000000000000',
        rating: 3,
        title: 'Introuvable',
        text: 'Cette offre n\'existe pas.',
      })
    )
    expect(res.status).toBe(404)
  })
})

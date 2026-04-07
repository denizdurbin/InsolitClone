/**
 * E2E tests — Auth routes
 *
 * Ces tests utilisent une vraie instance Supabase locale (supabase start).
 * Aucun mock de base de données : les opérations (INSERT, SELECT, DELETE)
 * sont exécutées contre le vrai PostgreSQL local.
 *
 * Seul `next/headers` reste mocké car le transport cookie n'existe pas
 * en dehors d'un vrai serveur Next.js.
 */

import { describe, it, expect, afterEach, afterAll } from 'vitest'
import { NextRequest } from 'next/server'
import { mockCookies, deleteUserByEmail, extractSessionCookie } from './helpers'

import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { GET as me } from '@/app/api/auth/me/route'
import { POST as logout } from '@/app/api/auth/logout/route'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'e2e-test-user@insolit-test.local'
const TEST_PASSWORD = 'motdepasse_e2e_123'

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function registerPayload(overrides: Record<string, unknown> = {}) {
  return {
    prenom: 'E2E',
    nom: 'Test',
    location: 'Paris',
    birthDate: '2000-01-01',
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    ...overrides,
  }
}

// Clean up test user after each test so tests stay independent
afterEach(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

// Safety net
afterAll(async () => {
  await deleteUserByEmail(TEST_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-01 — Inscription réussie (e2e)', () => {
  it('crée réellement un utilisateur en base et retourne 201', async () => {
    const req = postJson('http://localhost/api/auth/register', registerPayload())

    const res = await register(req)

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.user).toMatchObject({
      email: TEST_EMAIL,
      // normalizePersonName transforme "E2E" → "E2e"
      prenom: 'E2e',
      nom: 'Test',
    })
    // Un cookie de session doit être positionné
    expect(res.headers.get('set-cookie')).toMatch(/insolit_session=/)
  })

  it('retourne 409 si l\'email est déjà utilisé', async () => {
    // Premier register
    await register(postJson('http://localhost/api/auth/register', registerPayload()))

    // Deuxième register avec le même email
    const res = await register(
      postJson('http://localhost/api/auth/register', registerPayload({
        prenom: 'Autre',
        nom: 'User',
        location: 'Lyon',
        password: 'autremotdepasse',
      }))
    )

    expect(res.status).toBe(409)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-02 — Inscription invalide (e2e)', () => {
  it('retourne 400 et ne crée aucun compte si le mot de passe est trop court', async () => {
    const res = await register(
      postJson('http://localhost/api/auth/register', registerPayload({ password: 'court' }))
    )

    expect(res.status).toBe(400)

    // Vérifie qu'aucun utilisateur n'a été créé
    const loginRes = await login(
      postJson('http://localhost/api/auth/login', {
        email: TEST_EMAIL,
        password: 'court',
      })
    )
    expect(loginRes.status).toBe(401)
  })

  it('retourne 400 si la date de naissance est manquante', async () => {
    const res = await register(
      postJson('http://localhost/api/auth/register', registerPayload({ birthDate: '' }))
    )
    expect(res.status).toBe(400)
  })

  it('retourne 400 si l\'utilisateur a moins de 16 ans', async () => {
    const res = await register(
      postJson('http://localhost/api/auth/register', registerPayload({ birthDate: '2020-01-01' }))
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-03 — Connexion réussie (e2e)', () => {
  it('retourne 200 et un cookie de session valide', async () => {
    // Créer le compte d'abord
    await register(postJson('http://localhost/api/auth/register', registerPayload()))

    const res = await login(
      postJson('http://localhost/api/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user.email).toBe(TEST_EMAIL)
    expect(res.headers.get('set-cookie')).toMatch(/insolit_session=/)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-04 — Connexion invalide (e2e)', () => {
  it('retourne 401 avec un mauvais mot de passe', async () => {
    await register(postJson('http://localhost/api/auth/register', registerPayload()))

    const res = await login(
      postJson('http://localhost/api/auth/login', {
        email: TEST_EMAIL,
        password: 'mauvais_mot_de_passe',
      })
    )

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toHaveProperty('message')
  })

  it('retourne 401 pour un email inexistant', async () => {
    const res = await login(
      postJson('http://localhost/api/auth/login', {
        email: 'inexistant@insolit-test.local',
        password: TEST_PASSWORD,
      })
    )
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-05 — Récupérer utilisateur courant sans session (e2e)', () => {
  it('retourne 401 quand aucun cookie n\'est présent', async () => {
    mockCookies(null)
    const res = await me()
    expect(res.status).toBe(401)
    expect((await res.json()).user).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-05b — Récupérer utilisateur courant connecté (e2e)', () => {
  it('retourne 200 avec les infos de l\'utilisateur via une vraie session', async () => {
    // Inscription → récupérer le vrai token de session
    const registerRes = await register(
      postJson('http://localhost/api/auth/register', registerPayload())
    )
    expect(registerRes.status).toBe(201)

    const token = extractSessionCookie(registerRes)
    expect(token).not.toBeNull()

    // Injecter ce vrai token dans le cookie mocké
    mockCookies(token!)

    const res = await me()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user.email).toBe(TEST_EMAIL)
    expect(json.user).toHaveProperty('id')
    expect(json.user).toHaveProperty('prenom')
    expect(json.user).toHaveProperty('birthDate')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-06 — Déconnexion (e2e)', () => {
  it('supprime réellement la session en base et retourne 200', async () => {
    // Créer un compte et récupérer la session
    const registerRes = await register(
      postJson('http://localhost/api/auth/register', registerPayload())
    )
    const token = extractSessionCookie(registerRes)!
    mockCookies(token)

    // Se déconnecter
    const logoutRes = await logout()
    expect(logoutRes.status).toBe(200)
    expect((await logoutRes.json()).success).toBe(true)

    // Après logout, /me doit retourner 401 avec ce même token
    mockCookies(token)
    const meRes = await me()
    expect(meRes.status).toBe(401)
  })
})

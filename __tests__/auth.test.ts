import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { MOCK_USER } from './helpers/supabase'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('@/utils/supabase/admin', () => ({
  createAdminClient: vi.fn(),
  ADMIN_ENV_ERROR_MESSAGE: 'Missing Supabase admin env vars',
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'
import { hashPassword } from '@/lib/custom-auth-server'
import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { GET as me } from '@/app/api/auth/me/route'
import { POST as logout } from '@/app/api/auth/logout/route'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeChain(overrides: Record<string, unknown> = {}) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  }
  return chain
}

function makeAdmin(chain: Record<string, unknown>) {
  return { from: vi.fn().mockReturnValue(chain) }
}

function mockNoCookies() {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  } as never)
}

function mockCookieWithToken(token: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: token }),
  } as never)
}

function postJson(url: string, body: unknown) {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-01 — Inscription réussie', () => {
  beforeEach(() => {
    const chain = makeChain()
    vi.mocked(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: null, error: null })
    vi.mocked(chain.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: MOCK_USER, error: null })
    vi.mocked(chain.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue(makeAdmin(chain) as never)
  })

  it('retourne 201 avec les données utilisateur', async () => {
    const req = postJson('http://localhost/api/auth/register', {
      prenom: 'Jean',
      nom: 'Dupont',
      location: 'Paris',
      email: 'jean@example.com',
      password: 'motdepasse123',
    })

    const res = await register(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json).toHaveProperty('user')
    expect(json.user).toHaveProperty('email', 'jean@example.com')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-02 — Inscription invalide (mot de passe court)', () => {
  it('retourne 400 si le mot de passe est inférieur à 8 caractères', async () => {
    const req = postJson('http://localhost/api/auth/register', {
      prenom: 'Jean',
      nom: 'Dupont',
      location: 'Paris',
      email: 'jean@example.com',
      password: 'court',
    })

    const res = await register(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toHaveProperty('message')
  })

  it('retourne 400 si des champs sont manquants', async () => {
    const req = postJson('http://localhost/api/auth/register', {
      email: 'jean@example.com',
      password: 'motdepasse123',
    })

    const res = await register(req)
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-03 — Connexion réussie', () => {
  beforeEach(() => {
    const chain = makeChain()
    const hash = hashPassword('motdepasse123')
    vi.mocked(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { ...MOCK_USER, password_hash: hash },
      error: null,
    })
    vi.mocked(chain.single as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: null, error: null })
    vi.mocked(createAdminClient).mockReturnValue(makeAdmin(chain) as never)
  })

  it('retourne 200 avec les données utilisateur', async () => {
    const req = postJson('http://localhost/api/auth/login', {
      email: 'jean@example.com',
      password: 'motdepasse123',
    })

    const res = await login(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('user')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-04 — Connexion invalide', () => {
  beforeEach(() => {
    const chain = makeChain()
    vi.mocked(chain.maybeSingle as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: { ...MOCK_USER, password_hash: 'fakesalt:fakehash' },
      error: null,
    })
    vi.mocked(createAdminClient).mockReturnValue(makeAdmin(chain) as never)
  })

  it('retourne 401 avec un message d\'erreur', async () => {
    const req = postJson('http://localhost/api/auth/login', {
      email: 'jean@example.com',
      password: 'mauvais_mdp',
    })

    const res = await login(req)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toHaveProperty('message')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-05 — Récupérer utilisateur courant (non connecté)', () => {
  beforeEach(() => {
    mockNoCookies()
    vi.mocked(createAdminClient).mockReturnValue(makeAdmin(makeChain()) as never)
  })

  it('retourne 401 Unauthorized', async () => {
    const res = await me()
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.user).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('TC-AUTH-06 — Déconnexion', () => {
  beforeEach(() => {
    mockCookieWithToken('fake-session-token')
    vi.mocked(createAdminClient).mockReturnValue(makeAdmin(makeChain()) as never)
  })

  it('retourne 200 et supprime la session', async () => {
    const res = await logout()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty('success', true)
    const setCookieHeader = res.headers.get('set-cookie')
    expect(setCookieHeader).toMatch(/insolit_session/)
  })
})

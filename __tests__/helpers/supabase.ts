import { vi } from 'vitest'

export function buildSupabaseMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  const admin = { from: vi.fn().mockReturnValue(chain) }

  return { admin, chain }
}

export const MOCK_USER = {
  id: 'user-uuid-1',
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean@example.com',
  location: 'Paris, Ile-de-France',
  savings_cents: 0,
  offers_used: 0,
  reviews_count: 0,
  password_hash: null,
}

/**
 * Tests unitaires — lib/supabase-data.ts
 *
 * Le client Supabase (server) est entièrement mocké.
 * On vérifie le mapping des lignes DB vers les types frontend
 * et la gestion des erreurs de requête.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

// ── Imports after mocks ───────────────────────────────────────────────────────

import { createClient } from '@/utils/supabase/server'
import {
  getOffers,
  getOfferById,
  getRelatedOffers,
  getFeatures,
  getSteps,
  getTestimonials,
  getHomePageData,
} from '@/lib/supabase-data'

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Crée un chain Supabase mocké.
 * `listResult` est retourné quand la query est awaité directement (list).
 * `singleResult` est retourné pour .maybeSingle().
 */
function makeChain(
  listResult: { data: unknown; error: unknown },
  singleResult = listResult
) {
  const chain: Record<string, unknown> = {
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    neq:    vi.fn().mockReturnThis(),
    order:  vi.fn().mockReturnThis(),
    limit:  vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(singleResult),
    // rend le chain thenable pour les list queries (await chain)
    then: (resolve: (v: unknown) => void) => Promise.resolve(listResult).then(resolve),
  }
  return chain
}

function makeSupabase(tableResults: Record<string, { data: unknown; error: unknown }>) {
  return {
    from: vi.fn().mockImplementation((table: string) =>
      makeChain(tableResults[table] ?? { data: [], error: null })
    ),
  }
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const RAW_OFFER = {
  id: 'offer-1',
  sort_order: 1,
  title: 'KFC Test',
  description: '1 burger offert',
  category: 'restaurant' as const,
  category_label: 'Restaurant',
  emoji: 'KFC',
  gradient: 'from-red-700 to-orange-500',
  rating: 4,
  distance: '1.2 km',
  badge: 'Gratuit',
  price: null,
  address: '12 Av. Gaulle',
  details: ['Détail 1', 'Détail 2'],
  latitude: 48.8284,
  longitude: 2.5423,
}

const RAW_FEATURE = {
  sort_order: 1,
  icon: 'Star',
  gradient: 'from-pink-500 to-purple-600',
  title: 'Avantage exclusif',
  description: 'Accès à des offres exclusives',
}

const RAW_STEP = {
  id: 1,
  sort_order: 1,
  emoji: '📱',
  title: 'Télécharge l\'app',
  description: 'Installe Insolit',
}

const RAW_TESTIMONIAL = {
  id: 1,
  sort_order: 1,
  name: 'Alice',
  role: 'Étudiante',
  avatar: 'A',
  gradient: 'from-pink-400 to-purple-500',
  rating: 5,
  text: 'Super application !',
}

// ─────────────────────────────────────────────────────────────────────────────

describe('getOffers()', () => {
  beforeEach(() => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ offers: { data: [RAW_OFFER], error: null } }) as never
    )
  })

  it('retourne un tableau d\'Offer correctement mappé', async () => {
    const offers = await getOffers()

    expect(offers).toHaveLength(1)
    expect(offers[0]).toMatchObject({
      id: 'offer-1',
      title: 'KFC Test',
      category: 'restaurant',
      categoryLabel: 'Restaurant',
      distance: '1.2 km',
      badge: 'Gratuit',
      coords: [48.8284, 2.5423],
    })
  })

  it('retourne [] si la requête échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ offers: { data: null, error: { message: 'DB error' } } }) as never
    )
    const offers = await getOffers()
    expect(offers).toEqual([])
  })

  it('remplace distance null par "—"', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({
        offers: { data: [{ ...RAW_OFFER, distance: null }], error: null },
      }) as never
    )
    const offers = await getOffers()
    expect(offers[0].distance).toBe('—')
  })

  it('n\'inclut pas coords si latitude/longitude sont null', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({
        offers: { data: [{ ...RAW_OFFER, latitude: null, longitude: null }], error: null },
      }) as never
    )
    const offers = await getOffers()
    expect(offers[0].coords).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getOfferById()', () => {
  it('retourne l\'Offer quand l\'ID existe', async () => {
    const chain = makeChain({ data: [], error: null }, { data: RAW_OFFER, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as never)

    const offer = await getOfferById('offer-1')
    expect(offer).not.toBeNull()
    expect(offer!.id).toBe('offer-1')
  })

  it('retourne null quand l\'ID n\'existe pas', async () => {
    const chain = makeChain({ data: [], error: null }, { data: null, error: null })
    vi.mocked(createClient).mockResolvedValue({ from: vi.fn().mockReturnValue(chain) } as never)

    const offer = await getOfferById('inconnu')
    expect(offer).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getRelatedOffers()', () => {
  it('retourne les offres de la même catégorie en excluant l\'ID fourni', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ offers: { data: [RAW_OFFER], error: null } }) as never
    )
    const offers = await getRelatedOffers('restaurant', 'other-id', 3)
    expect(Array.isArray(offers)).toBe(true)
    expect(offers[0].category).toBe('restaurant')
  })

  it('retourne [] si la requête échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ offers: { data: null, error: { message: 'err' } } }) as never
    )
    const offers = await getRelatedOffers('restaurant', 'x', 3)
    expect(offers).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getFeatures()', () => {
  beforeEach(() => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ features: { data: [RAW_FEATURE], error: null } }) as never
    )
  })

  it('retourne un tableau de Feature correctement mappé', async () => {
    const features = await getFeatures()
    expect(features).toHaveLength(1)
    expect(features[0]).toEqual({
      icon: 'Star',
      gradient: 'from-pink-500 to-purple-600',
      title: 'Avantage exclusif',
      desc: 'Accès à des offres exclusives',
    })
  })

  it('retourne [] si la requête échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ features: { data: null, error: { message: 'err' } } }) as never
    )
    expect(await getFeatures()).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getSteps()', () => {
  beforeEach(() => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ steps: { data: [RAW_STEP], error: null } }) as never
    )
  })

  it('retourne un tableau de Step correctement mappé', async () => {
    const steps = await getSteps()
    expect(steps).toHaveLength(1)
    expect(steps[0]).toEqual({
      number: 1,
      emoji: '📱',
      title: 'Télécharge l\'app',
      desc: 'Installe Insolit',
    })
  })

  it('retourne [] si la requête échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ steps: { data: null, error: { message: 'err' } } }) as never
    )
    expect(await getSteps()).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getTestimonials()', () => {
  beforeEach(() => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ testimonials: { data: [RAW_TESTIMONIAL], error: null } }) as never
    )
  })

  it('retourne un tableau de Testimonial correctement mappé', async () => {
    const testimonials = await getTestimonials()
    expect(testimonials).toHaveLength(1)
    expect(testimonials[0]).toEqual({
      id: 1,
      name: 'Alice',
      role: 'Étudiante',
      avatar: 'A',
      gradient: 'from-pink-400 to-purple-500',
      rating: 5,
      text: 'Super application !',
    })
  })

  it('retourne [] si la requête échoue', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ testimonials: { data: null, error: { message: 'err' } } }) as never
    )
    expect(await getTestimonials()).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getHomePageData()', () => {
  beforeEach(() => {
    // createClient est appelé 4 fois (une par fonction)
    vi.mocked(createClient)
      .mockResolvedValueOnce(makeSupabase({ offers: { data: [RAW_OFFER], error: null } }) as never)
      .mockResolvedValueOnce(makeSupabase({ features: { data: [RAW_FEATURE], error: null } }) as never)
      .mockResolvedValueOnce(makeSupabase({ steps: { data: [RAW_STEP], error: null } }) as never)
      .mockResolvedValueOnce(makeSupabase({ testimonials: { data: [RAW_TESTIMONIAL], error: null } }) as never)
  })

  it('retourne les 4 collections en parallèle', async () => {
    const result = await getHomePageData()

    expect(result.offers).toHaveLength(1)
    expect(result.features).toHaveLength(1)
    expect(result.steps).toHaveLength(1)
    expect(result.testimonials).toHaveLength(1)
  })
})

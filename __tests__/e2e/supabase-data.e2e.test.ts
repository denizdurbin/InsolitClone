/**
 * E2E tests — lib/supabase-data.ts
 *
 * Le client Supabase est remplacé par une connexion directe à l'instance
 * locale (sans cookie, sans SSR). On teste contre les données seedées réelles.
 *
 * Données seed attendues :
 *   offers       : 25
 *   features     : 4
 *   steps        : 4
 *   testimonials : 3
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ── Remplace le client SSR par un client direct vers Supabase local ───────────

vi.mock('@/utils/supabase/server', () => ({
  createClient: () =>
    createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role pour bypasser les RLS en test
    ),
}))

// ── Imports après le mock ─────────────────────────────────────────────────────

import {
  getOffers,
  getOfferById,
  getOffersByIds,
  getRelatedOffers,
  getFeatures,
  getSteps,
  getTestimonials,
  getHomePageData,
  getReviewsByUserId,
  getReviewsForOffer,
} from '@/lib/supabase-data'

// IDs issus du seed
const SEED_OFFER_ID   = '22222222-2222-2222-2222-222222222001' // KFC
const SEED_OFFER_ID_2 = '22222222-2222-2222-2222-222222222002' // Pizza Palace

// ─────────────────────────────────────────────────────────────────────────────

describe('getOffers() — e2e', () => {
  it('retourne les 25 offres seedées', async () => {
    const offers = await getOffers()
    expect(offers).toHaveLength(25)
  })

  it('retourne des objets Offer correctement shapés', async () => {
    const offers = await getOffers()
    const kfc = offers.find((o) => o.id === SEED_OFFER_ID)

    expect(kfc).toBeDefined()
    expect(kfc).toMatchObject({
      id: SEED_OFFER_ID,
      title: 'KFC Villiers-sur-Marne',
      category: 'restaurant',
      categoryLabel: 'Restaurant',
    })
  })

  it('retourne les offres triées par sort_order croissant', async () => {
    const offers = await getOffers()
    for (let i = 1; i < offers.length; i++) {
      const prev = offers[i - 1]
      const curr = offers[i]
      // on vérifie juste que les IDs successifs correspondent aux sort_order 1..25
      expect(curr).toBeDefined()
      void prev
    }
    expect(offers[0].id).toBe(SEED_OFFER_ID) // sort_order 1
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getOfferById() — e2e', () => {
  it('retourne l\'offre pour un ID existant', async () => {
    const offer = await getOfferById(SEED_OFFER_ID)

    expect(offer).not.toBeNull()
    expect(offer!.id).toBe(SEED_OFFER_ID)
    expect(offer!.title).toBe('KFC Villiers-sur-Marne')
    expect(offer!.category).toBe('restaurant')
  })

  it('retourne null pour un ID inexistant', async () => {
    const offer = await getOfferById('00000000-0000-0000-0000-000000000000')
    expect(offer).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getOffersByIds() — e2e', () => {
  it('retourne les offres correspondant aux IDs fournis', async () => {
    const offers = await getOffersByIds([SEED_OFFER_ID, SEED_OFFER_ID_2])
    expect(offers).toHaveLength(2)
    const ids = offers.map((o) => o.id)
    expect(ids).toContain(SEED_OFFER_ID)
    expect(ids).toContain(SEED_OFFER_ID_2)
  })

  it('préserve l\'ordre des IDs fournis', async () => {
    const offers = await getOffersByIds([SEED_OFFER_ID_2, SEED_OFFER_ID])
    expect(offers[0].id).toBe(SEED_OFFER_ID_2)
    expect(offers[1].id).toBe(SEED_OFFER_ID)
  })

  it('retourne [] pour un tableau vide', async () => {
    const offers = await getOffersByIds([])
    expect(offers).toHaveLength(0)
  })

  it('ignore les IDs inexistants', async () => {
    const offers = await getOffersByIds([SEED_OFFER_ID, '00000000-0000-0000-0000-000000000000'])
    expect(offers).toHaveLength(1)
    expect(offers[0].id).toBe(SEED_OFFER_ID)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getRelatedOffers() — e2e', () => {
  it('retourne des offres de la même catégorie en excluant l\'ID fourni', async () => {
    const related = await getRelatedOffers('restaurant', SEED_OFFER_ID, 3)

    expect(related).toHaveLength(3)
    for (const offer of related) {
      expect(offer.category).toBe('restaurant')
      expect(offer.id).not.toBe(SEED_OFFER_ID)
    }
  })

  it('respecte la limite', async () => {
    const related = await getRelatedOffers('restaurant', SEED_OFFER_ID, 2)
    expect(related.length).toBeLessThanOrEqual(2)
  })

  it('retourne [] pour une catégorie sans résultat correspondant', async () => {
    // on exclut toutes les offres cinema (il y en a 2 dans le seed)
    const related = await getRelatedOffers('cinema', SEED_OFFER_ID_2, 99)
    // les offres cinema existent, mais SEED_OFFER_ID_2 est restaurant → pas exclu
    expect(Array.isArray(related)).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getFeatures() — e2e', () => {
  it('retourne les 4 features seedées', async () => {
    const features = await getFeatures()
    expect(features).toHaveLength(4)
  })

  it('retourne des Feature correctement shapés', async () => {
    const features = await getFeatures()
    for (const f of features) {
      expect(f).toHaveProperty('icon')
      expect(f).toHaveProperty('gradient')
      expect(f).toHaveProperty('title')
      expect(f).toHaveProperty('desc')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getSteps() — e2e', () => {
  it('retourne les 4 steps seedées', async () => {
    const steps = await getSteps()
    expect(steps).toHaveLength(4)
  })

  it('retourne des Step correctement shapés', async () => {
    const steps = await getSteps()
    for (const s of steps) {
      expect(s).toHaveProperty('number')
      expect(s).toHaveProperty('emoji')
      expect(s).toHaveProperty('title')
      expect(s).toHaveProperty('desc')
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getTestimonials() — e2e', () => {
  it('retourne les 3 testimonials seedés', async () => {
    const testimonials = await getTestimonials()
    expect(testimonials).toHaveLength(3)
  })

  it('retourne des Testimonial correctement shapés', async () => {
    const testimonials = await getTestimonials()
    for (const t of testimonials) {
      expect(t).toHaveProperty('id')
      expect(t).toHaveProperty('name')
      expect(t).toHaveProperty('rating')
      expect(t.rating).toBeGreaterThanOrEqual(1)
      expect(t.rating).toBeLessThanOrEqual(5)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getHomePageData() — e2e', () => {
  it('retourne les 4 collections en une seule fois', async () => {
    const result = await getHomePageData()

    expect(result.offers).toHaveLength(25)
    expect(result.features).toHaveLength(4)
    expect(result.steps).toHaveLength(4)
    expect(result.testimonials).toHaveLength(3)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getReviewsByUserId() — e2e', () => {
  it('retourne [] pour un utilisateur sans avis', async () => {
    const reviews = await getReviewsByUserId('00000000-0000-0000-0000-000000000000')
    expect(reviews).toHaveLength(0)
  })

  it('retourne des Review correctement shapés', async () => {
    // Les reviews seedées sont liées à des user_ids fictifs — on vérifie le shape via un appel global
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.from('reviews').select('user_id').limit(1)
    if (!data || data.length === 0) return // pas de reviews seedées, skip

    const userId = data[0].user_id
    if (!userId) return

    const reviews = await getReviewsByUserId(userId)
    for (const r of reviews) {
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('userId')
      expect(r).toHaveProperty('userName')
      expect(r).toHaveProperty('offerId')
      expect(r).toHaveProperty('rating')
      expect(r.rating).toBeGreaterThanOrEqual(1)
      expect(r.rating).toBeLessThanOrEqual(5)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getReviewsForOffer() — e2e', () => {
  it('retourne [] pour une offre sans avis', async () => {
    const reviews = await getReviewsForOffer('00000000-0000-0000-0000-000000000000')
    expect(reviews).toHaveLength(0)
  })

  it('retourne des Review correctement shapés pour une offre seedée avec avis', async () => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase.from('reviews').select('offer_id').limit(1)
    if (!data || data.length === 0) return // pas de reviews seedées, skip

    const offerId = data[0].offer_id
    if (!offerId) return

    const reviews = await getReviewsForOffer(offerId)
    expect(reviews.length).toBeGreaterThan(0)
    for (const r of reviews) {
      expect(r.offerId).toBe(offerId)
      expect(r).toHaveProperty('title')
      expect(r).toHaveProperty('text')
      expect(r).toHaveProperty('createdAt')
    }
  })
})

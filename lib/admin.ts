import type { Offer } from '@/lib/data'

export interface AdminAnalytics {
  totalOffers: number
  averageRating: number
  categoriesCount: number
  topCategory: string
  offersWithBadge: number
  offersWithPrice: number
}

export function computeOfferAnalytics(offers: Offer[]): AdminAnalytics {
  if (offers.length === 0) {
    return {
      totalOffers: 0,
      averageRating: 0,
      categoriesCount: 0,
      topCategory: 'Aucune',
      offersWithBadge: 0,
      offersWithPrice: 0,
    }
  }

  const ratingSum = offers.reduce((sum, offer) => sum + offer.rating, 0)
  const counts = new Map<string, number>()

  offers.forEach((offer) => {
    counts.set(offer.categoryLabel, (counts.get(offer.categoryLabel) ?? 0) + 1)
  })

  let topCategory = 'Aucune'
  let maxCount = 0

  counts.forEach((count, categoryLabel) => {
    if (count > maxCount) {
      maxCount = count
      topCategory = categoryLabel
    }
  })

  return {
    totalOffers: offers.length,
    averageRating: Number((ratingSum / offers.length).toFixed(2)),
    categoriesCount: counts.size,
    topCategory,
    offersWithBadge: offers.filter((offer) => Boolean(offer.badge)).length,
    offersWithPrice: offers.filter((offer) => Boolean(offer.price)).length,
  }
}

export function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export function buildOfferIdFromTitle(title: string) {
  const base = slugifyTitle(title)
  const suffix = Date.now().toString(36)
  return base ? `${base}-${suffix}` : `offer-${suffix}`
}

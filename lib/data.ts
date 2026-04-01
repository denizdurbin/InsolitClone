export const CATEGORIES = ['restaurant', 'activite', 'cadeau', 'sport', 'cinema'] as const

export type Category = (typeof CATEGORIES)[number]

export interface Offer {
  id: string
  title: string
  description: string
  category: Category
  categoryLabel: string
  emoji: string
  gradient: string
  rating: number
  distance: string
  badge?: string
  price?: string
  address?: string
  details?: string[]
  coords?: [number, number]
}

export interface Testimonial {
  id: number
  name: string
  role: string
  avatar: string
  gradient: string
  rating: number
  text: string
}

export interface Step {
  number: number
  emoji: string
  title: string
  desc: string
}

export interface Feature {
  icon: string
  gradient: string
  title: string
  desc: string
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { OfferCard } from '@/components/ui/OfferCard'
import { Button } from '@/components/ui/Button'
import type { Offer, Category } from '@/lib/data'

interface OffersSectionProps {
  offers: Offer[]
}

type Filter = 'all' | Category

const filters: { label: string; value: Filter }[] = [
  { label: 'Tout',         value: 'all' },
  { label: '🍕 Restaurants', value: 'restaurant' },
  { label: '🎯 Activités',   value: 'activite' },
  { label: '🎁 Cadeaux',     value: 'cadeau' },
  { label: '🏋️ Sport',       value: 'sport' },
  { label: '🎬 Cinéma',      value: 'cinema' },
]

export function OffersSection({ offers }: OffersSectionProps) {
  const [active, setActive] = useState<Filter>('all')

  const filtered = active === 'all' ? offers.slice(0, 8) : offers.filter(o => o.category === active)

  return (
    <section
      id="offres"
      aria-labelledby="offers-title"
      className="py-24 bg-white dark:bg-dark-alt"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 id="offers-title" className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
            <span className="text-pink">{offers.length}</span> offres disponibles
          </h2>

          {/* Filters */}
          <div
            role="tablist"
            aria-label="Filtrer les offres"
            className="flex flex-wrap gap-2"
          >
            {filters.map(({ label, value }) => (
              <button
                key={value}
                role="tab"
                aria-selected={active === value}
                onClick={() => setActive(value)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                  ${active === value
                    ? 'bg-pink text-white border-pink'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-pink hover:text-pink'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          role="list"
        >
          {filtered.map((offer, i) => (
            <motion.div
              key={offer.id}
              role="listitem"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <OfferCard offer={offer} />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button href="/offres" size="lg">Voir toutes les offres</Button>
        </div>
      </div>
    </section>
  )
}

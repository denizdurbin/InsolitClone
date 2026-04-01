'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { OfferCard } from '@/components/ui/OfferCard'
import { offers, type Category } from '@/lib/data'

type Filter = 'all' | Category

const filters: { label: string; value: Filter }[] = [
  { label: 'Tout',           value: 'all' },
  { label: '🍕 Restaurants', value: 'restaurant' },
  { label: '🎯 Activités',   value: 'activite' },
  { label: '🎁 Cadeaux',     value: 'cadeau' },
  { label: '🏋️ Sport',       value: 'sport' },
  { label: '🎬 Cinéma',      value: 'cinema' },
]

function OffresContent() {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat') as Filter | null

  const [active, setActive] = useState<Filter>(catParam ?? 'all')
  const [search, setSearch] = useState('')

  // Sync filtre quand le param URL change (liens navbar)
  useEffect(() => {
    if (catParam && filters.some(f => f.value === catParam)) {
      setActive(catParam)
    }
  }, [catParam])

  const filtered = offers.filter((o) => {
    const matchCat    = active === 'all' || o.category === active
    const matchSearch = search === '' || o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="bg-white dark:bg-dark-alt border-b border-gray-100 dark:border-dark-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className="text-pink">{filtered.length}</span> offres disponibles près de toi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
            Offres de plus de 250 partenaires vérifiés autour de toi.
          </p>

          {/* Search */}
          <form role="search" aria-label="Rechercher des offres" onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 focus-within:border-pink transition-colors">
              <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <label htmlFor="offerSearch" className="sr-only">Rechercher une offre</label>
              <input id="offerSearch" type="search" placeholder="Rechercher une offre…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400" />
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
              <label htmlFor="offerLocation" className="sr-only">Localisation</label>
              <input id="offerLocation" type="text" placeholder="Ma position"
                className="w-36 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400" />
            </div>
            <button type="button" aria-label="Filtres avancés"
              className="flex items-center gap-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:border-pink hover:text-pink transition-colors">
              <SlidersHorizontal size={16} />Filtres
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div role="tablist" aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2 mb-8">
          {filters.map(({ label, value }) => (
            <button key={value} role="tab" aria-selected={active === value}
              onClick={() => setActive(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
                ${active === value
                  ? 'bg-pink text-white border-pink'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:border-pink hover:text-pink'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" role="list"
            aria-live="polite" aria-label={`${filtered.length} offres affichées`}>
            {filtered.map((offer, i) => (
              <motion.div key={offer.id} role="listitem" layout
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}>
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 text-gray-400" role="status" aria-live="polite">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">Aucune offre trouvée</p>
            <p className="text-sm mt-1">Essaie une autre recherche ou catégorie</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function OffresPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-pink font-bold">Chargement…</span></div>}>
      <OffresContent />
    </Suspense>
  )
}

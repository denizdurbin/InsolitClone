'use client'

import { motion } from 'framer-motion'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const tags = ['🍔 Restaurants', '🎯 Activités', '🎁 Cadeaux', '🎬 Sorties', '🏋️ Sport']

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: 'easeOut' } },
})

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden gradient-hero-light dark:gradient-hero-dark pt-20 pb-0"
    >
      {/* Glow BG */}
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,24,112,0.12) 0%, transparent 70%)' }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center pb-16">

          {/* Left — Text */}
          <div>
            <motion.div {...fade(0)}>
              <span className="inline-block bg-pink/10 text-pink border border-pink/25 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide mb-5">
                Bons plans · Activités · Sorties · Cadeaux · et plus encore
              </span>
            </motion.div>

            <motion.h1
              id="hero-title"
              className="text-4xl md:text-5xl font-black leading-[1.15] tracking-tight text-gray-900 dark:text-white mb-3"
              {...fade(0.1)}
            >
              Les meilleurs bons plans autour de toi.
            </motion.h1>

            <motion.p
              className="text-3xl md:text-4xl font-extrabold text-pink mb-5 tracking-tight"
              {...fade(0.2)}
            >
              Profite plus.
            </motion.p>

            <motion.p
              className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-lg leading-relaxed"
              {...fade(0.3)}
            >
              Des offres exclusives, des activités insolites, des cadeaux — tout près de chez toi.
            </motion.p>

            {/* Search */}
            <motion.form
              role="search"
              aria-label="Rechercher des offres"
              onSubmit={(e) => e.preventDefault()}
              className="mb-6"
              {...fade(0.4)}
            >
              <div className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-2xl p-2 shadow-sm focus-within:border-pink transition-colors">
                <div className="flex items-center gap-2 flex-1 px-2">
                  <Search size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <label htmlFor="searchInput" className="sr-only">Rechercher</label>
                  <input
                    id="searchInput"
                    type="search"
                    placeholder="KFC, cinéma, escape game…"
                    autoComplete="off"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-medium py-2"
                  />
                </div>
                <div className="hidden sm:block w-px h-10 self-center bg-gray-200 dark:bg-dark-border" />
                <div className="flex items-center gap-2 flex-1 px-2">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <label htmlFor="locationInput" className="sr-only">Ville</label>
                  <input
                    id="locationInput"
                    type="text"
                    placeholder="Ville ou code postal"
                    autoComplete="off"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-medium py-2"
                  />
                </div>
                <Button type="submit" size="sm" className="sm:self-center">Rechercher</Button>
              </div>
            </motion.form>

            {/* Tags */}
            <motion.div
              className="flex flex-wrap gap-2"
              aria-label="Catégories populaires"
              {...fade(0.5)}
            >
              {tags.map((tag) => (
                <button
                  key={tag}
                  className="bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border rounded-full px-4 py-1.5 text-xs font-medium hover:bg-pink/10 hover:text-pink hover:border-pink/30 transition-all"
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right — Floating cards */}
          <div className="hidden md:flex flex-col gap-4" aria-hidden="true">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="h-24 bg-gradient-to-br from-red-700 to-orange-500 flex items-center justify-center text-white font-black text-2xl">
                KFC
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-pink uppercase tracking-widest">Restaurant</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 mb-1">KFC Villiers-sur-Marne</h3>
                <p className="text-xs text-gray-400 mb-2">1 burger Colonel acheté + 1 offert</p>
                <span className="bg-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Gratuit</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="h-24 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl">
                🎯
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-pink uppercase tracking-widest">Activité</span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 mb-1">Escape Game Paris</h3>
                <p className="text-xs text-gray-400 mb-2">1h d&apos;Escape Game à 2 pour 20€</p>
                <span className="text-[10px] text-gray-400">★★★★★ · 2.1 km</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div aria-hidden="true" className="leading-[0]">
        <svg viewBox="0 0 1440 60" className="w-full h-[60px] block" preserveAspectRatio="none">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            className="fill-gray-50 dark:fill-dark-bg"
          />
        </svg>
      </div>
    </section>
  )
}

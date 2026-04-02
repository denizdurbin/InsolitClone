'use client'

import { motion } from 'framer-motion'
import type { Feature } from '@/lib/data'

interface FeaturesProps {
  features: Feature[]
}

export function Features({ features }: FeaturesProps) {
  return (
    <section
      aria-labelledby="features-title"
      className="relative z-0 py-24 bg-gray-50 dark:bg-dark-bg"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          id="features-title"
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ce que tu peux faire <span className="text-pink">avec Insolit</span>
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
          {features.map((feat, i) => (
            <motion.article
              key={feat.title}
              role="listitem"
              className="
                bg-white dark:bg-dark-card
                border border-gray-100 dark:border-dark-border
                rounded-2xl p-7
                hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,24,112,0.15)] hover:border-pink/30
                transition-all duration-200
              "
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 bg-gradient-to-br ${feat.gradient}`}
                aria-hidden="true"
              >
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
                {feat.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {feat.desc}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

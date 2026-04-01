'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '+250',  label: 'Partenaires' },
  { value: '+30K',  label: 'Offres disponibles' },
  { value: '+28k',  label: 'Utilisateurs actifs' },
]

export function Stats() {
  return (
    <section
      aria-label="Insolit en chiffres"
      className="py-20"
      style={{ background: 'linear-gradient(135deg, #ff1870 0%, #a855f7 100%)' }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-0" role="list">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              <motion.div
                role="listitem"
                className="flex-1 text-center px-10 py-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span
                  className="block text-5xl md:text-6xl font-black text-white leading-none mb-2 tracking-tight"
                  aria-label={`${stat.value} ${stat.label}`}
                >
                  {stat.value}
                </span>
                <span className="text-white/75 text-sm font-medium">{stat.label}</span>
              </motion.div>
              {i < stats.length - 1 && (
                <div className="hidden sm:block w-px h-16 bg-white/25 flex-shrink-0" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

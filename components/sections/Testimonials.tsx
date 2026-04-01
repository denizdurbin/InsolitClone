'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { testimonials } from '@/lib/data'
import { Button } from '@/components/ui/Button'

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-title"
      className="py-24 bg-gray-50 dark:bg-dark-bg"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          id="testimonials-title"
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ils adorent Insolit.{' '}
          <span className="text-pink">Toi aussi tu vas adorer.</span>
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-6 mb-16" role="list">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.id}
              role="listitem"
              className="
                bg-white dark:bg-dark-card
                border border-gray-100 dark:border-dark-border
                rounded-2xl p-6
                hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,24,112,0.12)]
                transition-all duration-200
              "
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3" aria-label={`${t.rating} étoiles sur 5`}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < t.rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                  />
                ))}
              </div>

              <blockquote className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed mb-5">
                {t.text}
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br ${t.gradient}`}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA Block */}
        <motion.div
          className="
            rounded-3xl p-10 text-center
            bg-pink/5 dark:bg-dark-card
            border border-pink/20 dark:border-pink/15
          "
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
            Prêt à <span className="text-pink">profiter plus ?</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Rejoins des milliers d&apos;utilisateurs qui économisent et découvrent de nouvelles expériences chaque jour.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/inscription" size="lg">Commencer gratuitement</Button>
            <Button href="/offres" variant="outline" size="lg">Voir les offres</Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

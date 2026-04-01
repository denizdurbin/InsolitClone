'use client'

import { motion } from 'framer-motion'
import type { Step } from '@/lib/data'
import { ChevronRight } from 'lucide-react'

interface HowToUseProps {
  steps: Step[]
}

export function HowToUse({ steps }: HowToUseProps) {
  return (
    <section
      aria-labelledby="howto-title"
      className="py-24 bg-gray-50 dark:bg-dark-alt"
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          id="howto-title"
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Comment utiliser <span className="text-pink">Insolit ?</span>
        </motion.h2>

        <div
          className="flex flex-col md:flex-row items-start gap-4 justify-center"
          role="list"
        >
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-start md:items-center gap-4 md:gap-0 md:flex-col flex-1 max-w-xs">
              <motion.article
                role="listitem"
                className="
                  w-full bg-white dark:bg-dark-card
                  border border-gray-100 dark:border-dark-border
                  rounded-2xl p-6 text-center
                  hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,24,112,0.15)]
                  transition-all duration-200
                "
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="w-8 h-8 bg-pink rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto mb-3" aria-hidden="true">
                  {step.number}
                </div>
                <div className="text-3xl mb-3" aria-hidden="true">{step.emoji}</div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.article>

              {/* Arrow between steps */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex justify-center mt-[-20px] mx-2 text-pink/50" aria-hidden="true">
                  <ChevronRight size={22} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

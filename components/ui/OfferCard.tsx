import Link from 'next/link'
import { clsx } from 'clsx'
import type { Offer } from '@/lib/data'
import { Star } from 'lucide-react'

interface OfferCardProps {
  offer: Offer
  size?: 'sm' | 'md'
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'fill-yellow text-yellow' : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'}
        />
      ))}
    </div>
  )
}

export function OfferCard({ offer, size = 'md' }: OfferCardProps) {
  return (
    <Link
      href={`/offres/${offer.id}`}
      className="
        group block bg-white dark:bg-dark-card
        border border-gray-100 dark:border-dark-border
        rounded-2xl overflow-hidden
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(255,24,112,0.15)]
        hover:border-pink/30
        focus-visible:outline-2 focus-visible:outline-pink
      "
    >
      {/* Image gradient */}
      <div className={clsx(
        'flex items-center justify-center font-black text-white',
        `bg-gradient-to-br ${offer.gradient}`,
        size === 'sm' ? 'h-20 text-xl' : 'h-24 text-2xl'
      )}>
        <span className="drop-shadow-md">{offer.emoji}</span>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <span className="text-[10px] font-bold text-pink uppercase tracking-widest">
          {offer.categoryLabel}
        </span>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 mb-1 leading-tight line-clamp-1 group-hover:text-pink transition-colors">
          {offer.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
          {offer.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars rating={offer.rating} />
            {offer.distance && offer.distance !== '—' && (
              <span className="text-[10px] text-gray-400 font-medium">{offer.distance}</span>
            )}
          </div>
          {offer.badge && (
            <span className="bg-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {offer.badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

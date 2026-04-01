import { notFound } from 'next/navigation'
import Link from 'next/link'
import { offers } from '@/lib/data'
import { Button } from '@/components/ui/Button'
import { Star, MapPin, ArrowLeft, Clock, Tag, CheckCircle } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return offers.map((o) => ({ id: o.id }))
}

export function generateMetadata({ params }: PageProps) {
  const offer = offers.find((o) => o.id === params.id)
  if (!offer) return {}
  return {
    title: `${offer.title} — Insolit`,
    description: offer.description,
  }
}

export default function OfferDetailPage({ params }: PageProps) {
  const offer = offers.find((o) => o.id === params.id)
  if (!offer) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Hero image */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${offer.gradient} flex items-center justify-center`}>
        <span className="text-white font-black text-5xl md:text-7xl drop-shadow-lg" aria-hidden="true">
          {offer.emoji}
        </span>
        <div className="absolute inset-0 bg-black/20" />

        {/* Back button */}
        <Link
          href="/offres"
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-black/50 transition-colors"
          aria-label="Retour aux offres"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8 pb-16">
        <div className="grid md:grid-cols-[1fr_320px] gap-6">

          {/* Main content */}
          <div className="space-y-5">
            {/* Card header */}
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
              <span className="text-xs font-bold text-pink uppercase tracking-widest mb-2 block">
                {offer.categoryLabel}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                {offer.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-4">
                {offer.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {/* Rating */}
                <div className="flex items-center gap-1.5" aria-label={`Note : ${offer.rating} sur 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < offer.rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                    />
                  ))}
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{offer.rating}.0</span>
                </div>
                {/* Distance */}
                {offer.distance && offer.distance !== '—' && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-pink" aria-hidden="true" />
                    <span>{offer.distance}</span>
                  </div>
                )}
                {/* Badge */}
                {offer.badge && (
                  <span className="bg-pink/10 text-pink border border-pink/25 rounded-full px-3 py-0.5 text-xs font-bold">
                    {offer.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            {offer.details && (
              <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-pink" aria-hidden="true" />
                  Détails de l&apos;offre
                </h2>
                <ul className="space-y-3">
                  {offer.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Address */}
            {offer.address && (
              <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-pink" aria-hidden="true" />
                  Adresse
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{offer.address}</p>
                {/* Map placeholder */}
                <div
                  className="mt-4 h-40 rounded-xl bg-gray-100 dark:bg-dark-alt border border-gray-200 dark:border-dark-border flex items-center justify-center"
                  aria-label="Carte de localisation"
                >
                  <span className="text-gray-400 text-sm">🗺️ Carte disponible dans l&apos;app</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar — CTA */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 sticky top-24">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Offre Insolit</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">{offer.description}</p>
              {offer.badge && (
                <p className="text-2xl font-black text-pink mb-5">{offer.badge}</p>
              )}

              <Button className="w-full justify-center mb-3" size="lg">
                Utiliser cette offre
              </Button>
              <Button variant="outline" className="w-full justify-center" size="sm">
                Ajouter aux favoris
              </Button>

              <div className="flex items-start gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Offre valable jusqu&apos;au 31 décembre 2025. Une seule utilisation par compte.
                </p>
              </div>
            </div>

            {/* Other offers same category */}
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-5">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                Autres offres
              </p>
              <div className="space-y-3">
                {offers
                  .filter((o) => o.category === offer.category && o.id !== offer.id)
                  .slice(0, 3)
                  .map((o) => (
                    <Link
                      key={o.id}
                      href={`/offres/${o.id}`}
                      className="flex items-center gap-3 group hover:text-pink transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br ${o.gradient}`}>
                        <span className="text-white">{o.emoji.slice(0,2)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-pink">{o.title}</p>
                        <p className="text-xs text-gray-400 truncate">{o.description}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

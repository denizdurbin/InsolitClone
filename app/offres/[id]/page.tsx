import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import OfferDetailMap from '@/components/ui/OfferDetailMap'
import OfferDetailDistance from '@/components/ui/OfferDetailDistance'
import FavoriteButton from '@/components/ui/FavoriteButton'
import { OfferReviewsSection } from '@/components/sections/OfferReviewsSection'
import { getOfferById, getRelatedOffers, getReviewsForOffer } from '@/lib/supabase-data'
import { Star, MapPin, ArrowLeft, Clock, Tag, CheckCircle } from 'lucide-react'

interface PageProps {
    params: { id: string }
}


export async function generateMetadata({ params }: PageProps) {
    const offer = await getOfferById(params.id)
    if (!offer) {
        return {}
    }

    return {
        title: `${offer.title} — Insolit`,
        description: offer.description,
    }
}

export default async function OfferDetailPage({ params }: PageProps) {
    const offer = await getOfferById(params.id)

    if (!offer) {
        notFound()
    }
    const mapsQuery = offer.address?.trim() || (offer.coords ? `${offer.coords[0]},${offer.coords[1]}` : '')
    const googleMapsUrl = mapsQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}` : '#'

    const [relatedOffers, reviews] = await Promise.all([
        getRelatedOffers(offer.category, offer.id, 3),
        getReviewsForOffer(offer.id, 20),
    ])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <div className={`relative h-64 md:h-80 overflow-hidden bg-gradient-to-br ${offer.gradient}`}>
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/15 blur-3xl" />
                <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-pink/20 blur-3xl" />
                <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:22px_22px]" />

                <div className="relative z-10 h-full max-w-4xl mx-auto px-6 flex items-center justify-between gap-6">
                    <div className="min-w-0 max-w-2xl text-white">
                        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-white/80 mb-3">
                            {offer.categoryLabel}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-sm">
                            {offer.title}
                        </h1>
                        <p className="mt-3 text-sm md:text-base text-white/85 max-w-xl line-clamp-2">
                            {offer.description}
                        </p>
                    </div>

                    <div className="hidden md:flex flex-shrink-0 items-center justify-center w-28 h-28 rounded-3xl bg-white/12 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                        {offer.emoji?.startsWith('http') ? (
                            <img
                                src={offer.emoji}
                                alt=""
                                aria-hidden="true"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-black text-5xl drop-shadow-lg" aria-hidden="true">
                                {offer.emoji}
                            </span>
                        )}
                    </div>
                </div>

                <Link
                    href="/offres"
                    className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-black/30 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-black/50 transition-colors"
                    aria-label="Retour aux offres"
                >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Retour
                </Link>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 -mt-8 pb-16">
                <div className="grid md:grid-cols-[1fr_320px] gap-6">
                    <div className="space-y-5">
                        {/* Card with emoji as top half and details below */}
                        {/* Card with emoji as top half and details below */}
                        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden h-80 md:h-[28rem] grid grid-rows-2">
                            <div
                                className="row-span-1 flex items-center justify-center bg-gray-200 dark:bg-dark-alt overflow-hidden"
                                aria-hidden="true"
                            >
                                {offer.emoji?.startsWith('http') ? (
                                    <img
                                        src={offer.emoji}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-black text-6xl md:text-8xl drop-shadow-lg">{offer.emoji}</span>
                                )}
                            </div>

                            <div className="p-6 row-span-1 overflow-auto">
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
                                    <div className="flex items-center gap-1.5" aria-label={`Note : ${offer.rating} sur 5`}>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                size={14}
                                                className={index < offer.rating ? 'fill-yellow text-yellow' : 'fill-gray-200 text-gray-200'}
                                            />
                                        ))}
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{offer.rating}.0</span>
                                    </div>
                                    <OfferDetailDistance coords={offer.coords} />
                                    {offer.badge && (
                                        <span className="bg-pink/10 text-pink border border-pink/25 rounded-full px-3 py-0.5 text-xs font-bold">
                    {offer.badge}
                </span>
                                    )}
                                </div>
                            </div>
                        </div>


                        {offer.details && (
                            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Tag size={16} className="text-pink" aria-hidden="true" />
                                    Détails de l&apos;offre
                                </h2>
                                <ul className="space-y-3">
                                    {offer.details.map((detail, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle size={16} className="text-green flex-shrink-0 mt-0.5" aria-hidden="true" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {offer.address && (
                            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <MapPin size={16} className="text-pink" aria-hidden="true" />
                                    Adresse
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{offer.address}</p>
                                <OfferDetailMap offer={offer} />

                                <div className="mt-3">
                                    <a
                                        href={googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-disabled={!mapsQuery}
                                        className="w-full inline-flex items-center justify-center rounded-xl bg-pink text-white px-4 py-2.5 text-sm font-semibold hover:bg-pink-dark transition-colors"
                                    >
                                        Ouvrir dans Google Maps
                                    </a>
                                </div>
                            </div>
                        )}

                        <OfferReviewsSection
                            offerId={offer.id}
                            offerTitle={offer.title}
                            initialReviews={reviews}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6">
                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Offre Insolit</p>
                            <p className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">{offer.description}</p>
                            {offer.badge && <p className="text-2xl font-black text-pink mb-5">{offer.badge}</p>}

                            <Button className="w-full justify-center mb-3" size="lg">
                                Utiliser cette offre
                            </Button>
                            <FavoriteButton offerId={offer.id} />

                            <div className="flex items-start gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-dark-border">
                                <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Offre valable jusqu&apos;au 31 décembre 2025. Une seule utilisation par compte.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                    Autres offres
                                </h3>
                            </div>

                            <div className="overflow-hidden">
                                {relatedOffers.map((other) => (
                                    <Link
                                        key={other.id}
                                        href={`/offres/${other.id}`}
                                        className="flex items-center gap-3 p-3 overflow-hidden hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-dark-border">
                                            {other.emoji?.startsWith('http') ? (
                                                <img
                                                    src={other.emoji}
                                                    alt={other.title}
                                                    className="w-full h-full object-cover block"
                                                />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${other.gradient} flex items-center justify-center text-white font-bold`}>
                                                    {other.emoji}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {other.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {other.description}
                                            </p>
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

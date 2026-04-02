'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, MapPin } from 'lucide-react'

const tags = ['🍔 Restaurants', '🎯 Activités', '🎁 Cadeaux', '🎬 Sorties', '🏋️ Sport']

const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: 'easeOut' } },
})

interface HeroProps {
    locations?: string[]
}

export function Hero({ locations = [] }: HeroProps) {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [location, setLocation] = useState('')
    const [isLocationOpen, setIsLocationOpen] = useState(false)
    const locationInputRef = useRef<HTMLInputElement>(null)
    const [locationMenuPos, setLocationMenuPos] = useState({ top: 0, left: 0, width: 0 })
    const [isClient, setIsClient] = useState(false)

    const locationSuggestions = useMemo(() => {
        const normalized = location.trim().toLowerCase()
        if (!normalized) {
            return locations.slice(0, 8)
        }

        return locations
            .filter((entry) => entry.toLowerCase().includes(normalized))
            .slice(0, 8)
    }, [location, locations])

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isLocationOpen) return

        const updateMenuPosition = () => {
            if (!locationInputRef.current) return
            const rect = locationInputRef.current.getBoundingClientRect()
            setLocationMenuPos({
                top: rect.bottom + 10,
                left: rect.left,
                width: rect.width,
            })
        }

        updateMenuPosition()
        window.addEventListener('resize', updateMenuPosition)
        window.addEventListener('scroll', updateMenuPosition, true)

        return () => {
            window.removeEventListener('resize', updateMenuPosition)
            window.removeEventListener('scroll', updateMenuPosition, true)
        }
    }, [isLocationOpen, location])

    useEffect(() => {
        if (!isLocationOpen) return

        let lastScrollY = window.scrollY

        const closeOnScrollDown = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > lastScrollY) {
                setIsLocationOpen(false)
            }
            lastScrollY = currentScrollY
        }

        window.addEventListener('scroll', closeOnScrollDown, { passive: true })
        return () => window.removeEventListener('scroll', closeOnScrollDown)
    }, [isLocationOpen])

    function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const params = new URLSearchParams()
        const normalizedQuery = query.trim()
        const normalizedLocation = location.trim()

        if (normalizedQuery) {
            params.set('q', normalizedQuery)
        }

        if (normalizedLocation) {
            params.set('loc', normalizedLocation)
        }

        const target = params.toString().length > 0 ? `/offres?${params.toString()}` : '/offres'
        router.push(target)
    }

    return (
        <section
            aria-labelledby="hero-title"
            className="relative z-50 isolate overflow-x-hidden overflow-y-visible bg-white dark:bg-dark-bg pt-20 pb-0"
        >
            {/* ── Ambient blobs ── */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">

                {/* Large top-right blob */}
                <div
                    className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-40 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(circle at 60% 40%, #ff1870 0%, #ff6ba8 40%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Medium left blob */}
                <div
                    className="absolute top-10 -left-40 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-15"
                    style={{
                        background: 'radial-gradient(circle, #ff1870 0%, #ffb3d1 50%, transparent 70%)',
                        filter: 'blur(100px)',
                    }}
                />

                {/* Small bottom-center blob */}
                <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full opacity-30 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(ellipse, #ff1870 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />

                {/* Floating orb 1 */}
                <div
                    className="absolute top-24 left-[20%] w-20 h-20 rounded-full opacity-50"
                    style={{
                        background: '#ff1870',
                        filter: 'blur(30px)',
                        animation: 'float1 6s ease-in-out infinite',
                    }}
                />

                {/* Floating orb 2 */}
                <div
                    className="absolute top-40 right-[25%] w-14 h-14 rounded-full opacity-40"
                    style={{
                        background: '#ff6ba8',
                        filter: 'blur(20px)',
                        animation: 'float2 8s ease-in-out infinite',
                    }}
                />

                {/* Grain overlay */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '128px',
                    }}
                />
            </div>

            <style>{`
                @keyframes float1 {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-18px) translateX(10px); }
                    66% { transform: translateY(10px) translateX(-8px); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    40% { transform: translateY(14px) translateX(-12px); }
                    70% { transform: translateY(-10px) translateX(6px); }
                }
            `}</style>

            <div className="relative z-30 max-w-3xl mx-auto px-6">
                <div className="flex flex-col items-center text-center pb-16">

                    {/* Badge */}
                    <motion.div {...fade(0)}>
                        <span className="inline-flex items-center gap-1.5 bg-white/70 dark:bg-white/5 backdrop-blur-md text-pink border border-pink/25 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide mb-5 shadow-sm shadow-pink/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink animate-pulse" />
                            Bons plans · Activités · Sorties · Cadeaux · et plus encore
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        id="hero-title"
                        className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-3"
                        {...fade(0.1)}
                    >
                        Les meilleurs bons plans{' '}
                        <span
                            className="relative inline-block"
                            style={{
                                background: 'linear-gradient(135deg, #ff1870 0%, #ff6ba8 50%, #ff1870 100%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                animation: 'shimmer 3s linear infinite',
                            }}
                        >
                            autour de toi.
                        </span>
                    </motion.h1>

                    <style>{`
                        @keyframes shimmer {
                            0% { background-position: 0% center; }
                            100% { background-position: 200% center; }
                        }
                    `}</style>

                    {/* Tagline */}
                    <motion.p
                        className="text-3xl md:text-4xl font-extrabold text-pink mb-5 tracking-tight whitespace-nowrap"
                        {...fade(0.2)}
                    >
                        Profite plus.
                    </motion.p>

                    {/* Subtitle */}
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
                        onSubmit={onSearchSubmit}
                        className="relative z-40 mb-6 w-full"
                        {...fade(0.4)}
                    >
                        <div
                            className="flex flex-col sm:flex-row gap-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-2 border-pink/20 dark:border-dark-border rounded-2xl p-2 shadow-xl shadow-pink/10 focus-within:border-pink focus-within:shadow-pink/20 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 flex-1 px-3">
                                <Search size={16} className="text-pink flex-shrink-0" aria-hidden="true" />
                                <label htmlFor="searchInput" className="sr-only">Rechercher</label>
                                <input
                                    id="searchInput"
                                    type="search"
                                    placeholder="KFC, cinéma, escape game…"
                                    autoComplete="off"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-medium py-2"
                                />
                            </div>
                            <div className="hidden sm:block w-px h-10 self-center bg-pink/15" />
                            <div className="relative flex items-center gap-2 flex-1 px-3">
                                <MapPin size={16} className="text-pink flex-shrink-0" aria-hidden="true" />
                                <label htmlFor="locationInput" className="sr-only">Ville</label>
                                <input
                                    ref={locationInputRef}
                                    id="locationInput"
                                    type="text"
                                    placeholder="Ville ou code postal"
                                    autoComplete="off"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    onFocus={() => setIsLocationOpen(true)}
                                    onBlur={() => setTimeout(() => setIsLocationOpen(false), 120)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 font-medium py-2"
                                />
                            </div>
                            <button
                                type="submit"
                                className="ml-2 sm:ml-0 relative overflow-hidden px-5 py-2.5 text-sm font-bold flex-shrink-0 rounded-xl text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-pink/30 active:scale-95"
                                style={{
                                    background: 'linear-gradient(135deg, #ff1870 0%, #ff6ba8 100%)',
                                }}
                            >
                                <span className="relative z-10">Rechercher</span>
                                <span
                                    className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                                    style={{
                                        background: 'linear-gradient(135deg, #e0005a 0%, #ff1870 100%)',
                                    }}
                                />
                            </button>
                        </div>
                    </motion.form>

                    {/* Tags */}
                    <motion.div
                        className="relative z-10 flex flex-wrap justify-center gap-2"
                        aria-label="Catégories populaires"
                        {...fade(0.5)}
                    >
                        {tags.map((tag, i) => (
                            <button
                                key={tag}
                                className="bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-dark-border rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-pink hover:text-white hover:border-pink hover:shadow-md hover:shadow-pink/20 hover:scale-105 transition-all duration-200"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.div>

                    {isClient &&
                        isLocationOpen &&
                        locationSuggestions.length > 0 &&
                        createPortal(
                            <div
                                className="fixed z-[2200] rounded-xl border border-pink/20 dark:border-dark-border bg-white/95 dark:bg-dark-card/95 backdrop-blur-md shadow-[0_12px_35px_rgba(255,24,112,0.22)] overflow-y-auto max-h-64"
                                style={{
                                    top: `${locationMenuPos.top}px`,
                                    left: `${locationMenuPos.left}px`,
                                    width: `${locationMenuPos.width}px`,
                                }}
                            >
                                {locationSuggestions.map((entry) => (
                                    <button
                                        key={entry}
                                        type="button"
                                        onMouseDown={() => {
                                            setLocation(entry)
                                            setIsLocationOpen(false)
                                        }}
                                        className="w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-pink/10 dark:hover:bg-pink/15 transition-colors"
                                    >
                                        {entry}
                                    </button>
                                ))}
                            </div>,
                            document.body
                        )}

                </div>
            </div>


        </section>
    )
}
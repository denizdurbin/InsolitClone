'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { clsx } from 'clsx'

const navLinks = [
  { label: 'Lieux',      href: '/lieux' },
  { label: 'Bons plans', href: '/offres' },
]

export function Navbar() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAuthenticated, logout, loading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setDropdown(false) }, [pathname])

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    if (!dropdown) return
    const close = () => setDropdown(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [dropdown])

  async function handleLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }

  return (
    <header
      role="banner"
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        'bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md',
        'border-b border-gray-100 dark:border-dark-border',
        scrolled && 'shadow-md'
      )}
    >
      <nav
        role="navigation"
        aria-label="Navigation principale"
        className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-6"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight flex-shrink-0" aria-label="Insolit — Accueil">
          <span className="text-pink text-2xl" aria-hidden="true">◎</span>
          <span className="text-gray-900 dark:text-white">insolit</span>
        </Link>

        {/* Links desktop */}
        <ul className="hidden md:flex items-center gap-1 flex-1" role="list">
          {navLinks.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-pink/10 text-pink'
                    : 'text-gray-500 dark:text-gray-400 hover:text-pink hover:bg-pink/8'
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {/* Auth area — ne s'affiche qu'après hydratation */}
          {!loading && (
            isAuthenticated && user ? (
              /* Utilisateur connecté */
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setDropdown(!dropdown) }}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                  aria-label="Menu profil"
                  aria-expanded={dropdown}
                  aria-haspopup="menu"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.initials}
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-[100px] truncate">
                    {user.prenom}
                  </span>
                </button>

                {dropdown && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 w-48 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <Link
                      href="/profil"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-pink/8 hover:text-pink transition-colors"
                    >
                      <User size={15} aria-hidden="true" />
                      Mon profil
                    </Link>
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-50 dark:border-dark-border"
                    >
                      <LogOut size={15} aria-hidden="true" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Non connecté */
              <>
                <Button href="/connexion"  variant="outline"  size="sm">Connexion</Button>
                <Button href="/inscription" variant="primary" size="sm">S&apos;inscrire</Button>
              </>
            )
          )}
        </div>

        {/* Burger mobile */}
        <div className="flex md:hidden items-center gap-2 ml-auto">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-200 hover:border-pink hover:text-pink transition-all"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" role="menu" className="md:hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-bg px-6 py-4 flex flex-col gap-2">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} role="menuitem"
              className="px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink/10 hover:text-pink transition-colors">
              {label}
            </Link>
          ))}
          {!loading && (
            isAuthenticated && user ? (
              <>
                <Link href="/profil" role="menuitem"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink/10 hover:text-pink transition-colors">
                  <User size={15} />Mon profil
                </Link>
                <button onClick={handleLogout} role="menuitem"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                  <LogOut size={15} />Se déconnecter
                </button>
              </>
            ) : (
              <div className="flex gap-2 mt-2">
                <Button href="/connexion"   variant="outline" size="sm" className="flex-1 justify-center">Connexion</Button>
                <Button href="/inscription" variant="primary" size="sm" className="flex-1 justify-center">S&apos;inscrire</Button>
              </div>
            )
          )}
        </div>
      )}
    </header>
  )
}

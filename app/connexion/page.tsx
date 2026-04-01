'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function toAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials') || normalized.includes('incorrect')) {
    return 'E-mail ou mot de passe incorrect.'
  }

  if (normalized.includes('too many requests')) {
    return 'Trop de tentatives. Reessaie dans quelques minutes.'
  }

  if (message.trim()) {
    return message
  }

  return 'Impossible de se connecter pour le moment. Reessaie.'
}

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Merci de remplir tous les champs.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Adresse e-mail invalide.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.')
      return
    }

    setLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    })

    const payload = (await response.json().catch(() => null)) as { message?: string } | null

    if (!response.ok) {
      setError(toAuthErrorMessage(payload?.message ?? ''))
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/profil')
    router.refresh()
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight">
            <span className="text-pink text-3xl">◎</span>
            <span className="text-gray-900 dark:text-white">insolit</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4 mb-1">Content de te revoir !</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Connecte-toi pour acceder a tes offres</p>
        </div>

        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-8 shadow-sm">
          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm"
            >
              <AlertCircle size={15} className="flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-gray-900 dark:text-white text-sm placeholder:text-gray-400 outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <Link href="/mot-de-passe-oublie" className="text-xs text-pink hover:underline font-medium">
                  Mot de passe oublie ?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-alt text-gray-900 dark:text-white text-sm placeholder:text-gray-400 outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-pink" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
            </label>

            <Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-pink font-semibold hover:underline">
            Creer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

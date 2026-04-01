'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ConnexionPage() {
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

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
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    // Simule une requête API
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    // Redirection simulée
    window.location.href = '/profil'
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tight">
            <span className="text-pink text-3xl">◎</span>
            <span className="text-gray-900 dark:text-white">insolit</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4 mb-1">
            Content de te revoir !
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connecte-toi pour accéder à tes offres
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-8 shadow-sm">

          {/* Error */}
          {error && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <Link href="/mot-de-passe-oublie" className="text-xs text-pink hover:underline font-medium">
                  Mot de passe oublié ?
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

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 accent-pink"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Se souvenir de moi</span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full justify-center"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Connexion…
                </span>
              ) : 'Se connecter'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
            <span className="text-xs text-gray-400 font-medium">ou continuer avec</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Google',   emoji: '🔵' },
              { label: 'Apple',    emoji: '🍎' },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-pink hover:text-pink transition-all"
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Link to register */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-pink font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}

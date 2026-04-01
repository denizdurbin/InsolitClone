'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

function toAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('user already registered') || normalized.includes('existe deja')) {
    return 'Un compte existe deja avec cet e-mail.'
  }

  if (normalized.includes('password should be at least')) {
    return 'Le mot de passe est trop faible.'
  }

  if (normalized.includes('invalid email')) {
    return 'Adresse e-mail invalide.'
  }

  if (normalized.includes('email address') && normalized.includes('invalid')) {
    return 'Adresse e-mail invalide.'
  }

  if (message.trim()) {
    return message
  }

  return 'Impossible de creer le compte pour le moment. Reessaie.'
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 caractères minimum',        ok: password.length >= 8 },
    { label: 'Une majuscule',               ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre',                  ok: /\d/.test(password) },
    { label: 'Un caractère spécial',        ok: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.ok).length
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500']

  if (!password) return null

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${i < score ? colors[score] : 'bg-gray-200 dark:bg-dark-border'}`} />
        ))}
      </div>
      <ul className="space-y-0.5">
        {checks.map(({ label, ok }) => (
          <li key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-500' : 'text-gray-400'}`}>
            <CheckCircle size={11} className={ok ? 'text-green-500' : 'text-gray-300'} aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface FieldProps {
  id: string
  label: string
  type?: string
  icon: React.ElementType
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder: string
  autoComplete: string
  extra?: React.ReactNode
}

function Field({
  id,
  label,
  type = 'text',
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  extra,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id={id} type={type} autoComplete={autoComplete} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-colors bg-gray-50 dark:bg-dark-alt
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-dark-border focus:border-pink focus:ring-1 focus:ring-pink'}`}
        />
        {extra}
      </div>
      {error && <p id={`${id}-error`} role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

export default function InscriptionPage() {
  const router = useRouter()
  const { setAuthenticatedUser } = useAuth()
  const [form, setForm] = useState({ prenom: '', nom: '', location: '', email: '', password: '', confirm: '', cgu: false })
  const [showPass,  setShowPass]  = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitNotice, setSubmitNotice] = useState('')
  const [cityOptions, setCityOptions] = useState<string[]>([])

  const set = (k: string, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
    setSubmitError('')
    setSubmitNotice('')
  }

  useEffect(() => {
    const query = form.location.trim()

    if (query.length < 2) {
      setCityOptions([])
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codeDepartement&boost=population&limit=12`,
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          setCityOptions([])
          return
        }

        const data = (await response.json()) as Array<{ nom: string; codeDepartement?: string }>

        const options = Array.from(
          new Set(
            data.map((city) =>
              city.codeDepartement ? `${city.nom}, France (${city.codeDepartement})` : `${city.nom}, France`
            )
          )
        )

        setCityOptions(options)
      } catch {
        if (!controller.signal.aborted) {
          setCityOptions([])
        }
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [form.location])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.prenom.trim())   e.prenom   = 'Prénom requis'
    if (!form.nom.trim())      e.nom      = 'Nom requis'
    if (!form.location.trim()) e.location = 'Adresse requise'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail invalide'
    if (form.password.length < 8) e.password = 'Mot de passe trop court (8 car. min)'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    if (!form.cgu) e.cgu = "Tu dois accepter les CGU pour continuer"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitNotice('')

    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)

    const normalizedEmail = form.email.trim().toLowerCase()

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        location: form.location.trim(),
        email: normalizedEmail,
        password: form.password,
      }),
    })

    const payload = (await response.json().catch(() => null)) as {
      message?: string
      user?: {
        id: string
        prenom: string
        nom: string
        email: string
        location: string
        savingsCents: number
        offersUsed: number
        reviewsCount: number
      }
    } | null

    if (!response.ok) {
      setSubmitError(toAuthErrorMessage(payload?.message ?? ''))
      setLoading(false)
      return
    }

    if (payload?.user) {
      setAuthenticatedUser(payload.user)
    }

    setLoading(false)
    router.push('/profil')
    router.refresh()
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
            Crée ton compte gratuit
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rejoins +28k utilisateurs et profite plus dès aujourd&apos;hui
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Prénom / Nom */}
            <div className="grid grid-cols-2 gap-3">
              <Field id="prenom" label="Prénom" icon={User} value={form.prenom}
                onChange={v => set('prenom', v)} error={errors.prenom}
                placeholder="Sophie" autoComplete="given-name" />
              <Field id="nom" label="Nom" icon={User} value={form.nom}
                onChange={v => set('nom', v)} error={errors.nom}
                placeholder="Dupont" autoComplete="family-name" />
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Adresse (ville)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="location"
                  type="text"
                  autoComplete="address-level2"
                  value={form.location}
                  list="france-cities-list"
                  placeholder="Ex: Lyon, France"
                  onChange={(e) => set('location', e.target.value)}
                  aria-invalid={!!errors.location}
                  aria-describedby={errors.location ? 'location-error' : 'location-help'}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-colors bg-gray-50 dark:bg-dark-alt
                    ${errors.location ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-dark-border focus:border-pink focus:ring-1 focus:ring-pink'}`}
                />
              </div>
              <datalist id="france-cities-list">
                {cityOptions.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>
              {errors.location && <p id="location-error" role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{errors.location}</p>}
            </div>

            {/* Email */}
            <Field id="email" label="Adresse e-mail" type="email" icon={Mail}
              value={form.email} onChange={v => set('email', v)} error={errors.email}
              placeholder="toi@exemple.com" autoComplete="email" />

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="password" type={showPass ? 'text' : 'password'} autoComplete="new-password"
                  value={form.password} placeholder="••••••••"
                  onChange={e => set('password', e.target.value)}
                  aria-invalid={!!errors.password}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-colors bg-gray-50 dark:bg-dark-alt
                    ${errors.password ? 'border-red-400' : 'border-gray-200 dark:border-dark-border focus:border-pink focus:ring-1 focus:ring-pink'}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Masquer' : 'Afficher'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="confirm" type={showConf ? 'text' : 'password'} autoComplete="new-password"
                  value={form.confirm} placeholder="••••••••"
                  onChange={e => set('confirm', e.target.value)}
                  aria-invalid={!!errors.confirm}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none transition-colors bg-gray-50 dark:bg-dark-alt
                    ${errors.confirm ? 'border-red-400' : 'border-gray-200 dark:border-dark-border focus:border-pink focus:ring-1 focus:ring-pink'}`}
                />
                <button type="button" onClick={() => setShowConf(!showConf)}
                  aria-label={showConf ? 'Masquer' : 'Afficher'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink transition-colors">
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm && <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{errors.confirm}</p>}
            </div>

            {/* CGU */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.cgu}
                  onChange={e => set('cgu', e.target.checked)}
                  aria-invalid={!!errors.cgu}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-pink flex-shrink-0"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  J&apos;accepte les{' '}
                  <Link href="#" className="text-pink hover:underline font-medium">Conditions Générales d&apos;Utilisation</Link>{' '}
                  et la{' '}
                  <Link href="#" className="text-pink hover:underline font-medium">Politique de Confidentialité</Link>
                </span>
              </label>
              {errors.cgu && <p role="alert" className="flex items-center gap-1 text-xs text-red-500 mt-1.5 ml-6"><AlertCircle size={11} />{errors.cgu}</p>}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full justify-center" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                  Création du compte…
                </span>
              ) : 'Créer mon compte gratuitement'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-pink font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>

      {(submitError || submitNotice) && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          {submitError && (
            <div role="alert" className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm shadow-lg">
              <AlertCircle size={15} className="flex-shrink-0" aria-hidden="true" />
              {submitError}
            </div>
          )}

          {submitNotice && (
            <div role="status" className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl px-4 py-3 text-sm shadow-lg">
              <CheckCircle size={15} className="flex-shrink-0" aria-hidden="true" />
              {submitNotice}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

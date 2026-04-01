'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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

export default function InscriptionPage() {
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', password: '', confirm: '', cgu: false })
  const [showPass,  setShowPass]  = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState<Record<string, string>>({})

  const set = (k: string, v: string | boolean) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.prenom.trim())   e.prenom   = 'Prénom requis'
    if (!form.nom.trim())      e.nom      = 'Nom requis'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'E-mail invalide'
    if (form.password.length < 8) e.password = 'Mot de passe trop court (8 car. min)'
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas'
    if (!form.cgu) e.cgu = "Tu dois accepter les CGU pour continuer"
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    setLoading(false)
    window.location.href = '/profil'
  }

  const Field = ({ id, label, type = 'text', icon: Icon, value, onChange, error, placeholder, autoComplete, extra }: {
    id: string; label: string; type?: string; icon: React.ElementType
    value: string; onChange: (v: string) => void; error?: string; placeholder: string; autoComplete: string; extra?: React.ReactNode
  }) => (
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
            <span className="text-xs text-gray-400 font-medium">ou s&apos;inscrire avec</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-dark-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Google', emoji: '🔵' }, { label: 'Apple', emoji: '🍎' }].map(({ label, emoji }) => (
              <button key={label} type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-alt text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-pink hover:text-pink transition-all">
                <span aria-hidden="true">{emoji}</span>{label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-pink font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

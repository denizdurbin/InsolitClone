'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, ShieldCheck, User, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminTabs } from '@/components/layout/AdminTabs'
import { useAuth } from '@/lib/auth'

interface AdminUser {
  id: string | null
  prenom: string
  nom: string
  email: string
  location: string
  birthDate: string | null
  savingsCents: number
  offersUsed: number
  reviewsCount: number
  created_at: string
  updated_at: string
}

type GuardState = 'idle' | 'checking' | 'denied' | 'ok'
type FormState = 'idle' | 'loading' | 'success' | 'error'

function formatMoney(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function isAtLeast16YearsOld(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00.000Z`)
  if (Number.isNaN(birth.getTime())) return false
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const cutoff = new Date(today)
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 16)
  return birth <= cutoff
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [guard, setGuard] = useState<GuardState>('idle')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userEditMode, setUserEditMode] = useState(false)
  const [userEditForm, setUserEditForm] = useState({ prenom: '', nom: '', email: '', location: '', birthDate: '' })
  const [userActionState, setUserActionState] = useState<FormState>('idle')
  const [userActionError, setUserActionError] = useState('')
  const [pendingUserDelete, setPendingUserDelete] = useState<AdminUser | null>(null)

  const heroSubtitle = useMemo(() => {
    if (guard === 'denied') return 'Accès refusé'
    if (guard === 'ok') return 'Gestion des utilisateurs'
    return 'Vérification en cours'
  }, [guard])

  const loadUsers = useCallback(async () => {
    if (!user?.email) return
    setUsersLoading(true)
    try {
      const res = await fetch('/api/admin/users', { headers: { 'x-admin-email': user.email } })
      const data = await res.json().catch(() => null)
      if (data?.users) setUsers(data.users as AdminUser[])
    } finally {
      setUsersLoading(false)
    }
  }, [user?.email])

  const openUserModal = useCallback((account: AdminUser) => {
    setSelectedUser(account)
    setUserEditMode(false)
    setUserActionState('idle')
    setUserActionError('')
    setUserEditForm({
      prenom: account.prenom,
      nom: account.nom,
      email: account.email,
      location: account.location,
      birthDate: account.birthDate ?? '',
    })
  }, [])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user?.email) {
      setGuard('denied')
      return
    }

    setGuard('checking')
    fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setGuard(data.authorized ? 'ok' : 'denied'))
      .catch(() => setGuard('denied'))
  }, [loading, isAuthenticated, user?.email])

  useEffect(() => {
    if (guard !== 'ok') return
    void loadUsers()
  }, [guard, loadUsers])

  async function handleSaveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedUser?.id || !user?.email) return

    setUserActionState('loading')
    setUserActionError('')

    const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-email': user.email },
      body: JSON.stringify(userEditForm),
    })

    const payload = (await response.json().catch(() => ({}))) as { error?: string; user?: AdminUser }

    if (!response.ok || !payload?.user) {
      setUserActionError(payload?.error || 'Échec de la mise à jour du compte')
      setUserActionState('error')
      return
    }

    setSelectedUser(payload.user)
    setUserEditMode(false)
    setUserActionState('success')
    await loadUsers()
    setTimeout(() => setUserActionState('idle'), 1500)
  }

  async function handleDeleteUser(id: string) {
    if (!user?.email) return

    setUserActionState('loading')
    setUserActionError('')

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-email': user.email },
    })

    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    if (!response.ok) {
      setUserActionError(payload?.error || 'Suppression impossible')
      setUserActionState('error')
      return
    }

    setPendingUserDelete(null)
    setSelectedUser(null)
    setUserEditMode(false)
    setUserActionState('idle')
    await loadUsers()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="border-b border-gray-100 dark:border-dark-border bg-white dark:bg-dark-alt">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 text-pink">
            <ShieldCheck size={18} />
            <span className="uppercase tracking-wide text-xs font-semibold">Admin</span>
          </div>
          <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Users</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{heroSubtitle}</p>
          </div>
          <AdminTabs />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {guard === 'checking' && (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Loader2 size={16} className="animate-spin" />
            Vérification des droits administrateur…
          </div>
        )}

        {guard === 'denied' && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-300">
            <AlertTriangle size={18} />
            <div>
              <p className="font-semibold">Accès refusé</p>
              <p className="text-red-500/80">Connecte-toi avec un email autorisé dans ADMIN_EMAILS.</p>
            </div>
          </div>
        )}

        {guard === 'ok' && (
          <section className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-pink/10 text-pink flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Utilisateurs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Voir, modifier ou supprimer un compte utilisateur.</p>
              </div>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">{users.length} utilisateurs</div>
            </div>

            {usersLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="animate-spin" size={16} /> Chargement…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-gray-400">
                    <tr>
                      <th className="py-3 pr-4">Utilisateur</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Lieu</th>
                      <th className="py-3 pr-4">Points</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {users.map((account) => (
                      <tr key={account.id ?? account.email} className="align-top">
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            onClick={() => openUserModal(account)}
                            className="text-left font-semibold text-gray-900 dark:text-white hover:text-pink transition-colors"
                          >
                            {account.prenom} {account.nom}
                          </button>
                          <p className="text-xs text-gray-400 mt-1">Né le {formatDate(account.birthDate)}</p>
                        </td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{account.email}</td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">{account.location}</td>
                        <td className="py-4 pr-4 text-gray-600 dark:text-gray-300">
                          <div className="space-y-1">
                            <p>{formatMoney(account.savingsCents)}</p>
                            <p className="text-xs text-gray-400">{account.offersUsed} offres · {account.reviewsCount} avis</p>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => openUserModal(account)}>Voir</Button>
                            <Button variant="outline" size="sm" onClick={() => { openUserModal(account); setUserEditMode(true) }}>Modifier</Button>
                            <Button size="sm" onClick={() => setPendingUserDelete(account)} className="flex-shrink-0">
                              <Trash2 size={14} aria-hidden="true" />
                              Supprimer
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-4xl bg-white dark:bg-dark-card rounded-3xl border border-gray-100 dark:border-dark-border shadow-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Utilisateur</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{selectedUser.prenom} {selectedUser.nom}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedUser.email}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedUser(null)} className="px-3"><X size={16} /></Button>
            </div>

            {userEditMode ? (
              <form className="space-y-5" onSubmit={handleSaveUser}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Field label="Identité">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nom et prénom</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        required
                        value={userEditForm.prenom}
                        onChange={(e) => setUserEditForm({ ...userEditForm, prenom: e.target.value })}
                        className={inputClass()}
                        placeholder="Prénom"
                      />
                      <input
                        required
                        value={userEditForm.nom}
                        onChange={(e) => setUserEditForm({ ...userEditForm, nom: e.target.value })}
                        className={inputClass()}
                        placeholder="Nom"
                      />
                    </div>
                  </Field>

                  <Field label="Contact">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email utilisateur</p>
                    <input
                      required
                      type="email"
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                      className={inputClass()}
                      placeholder="email@exemple.com"
                    />
                  </Field>

                  <Field label="Localisation">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ville / adresse</p>
                    <input
                      required
                      value={userEditForm.location}
                      onChange={(e) => setUserEditForm({ ...userEditForm, location: e.target.value })}
                      className={inputClass()}
                      placeholder="Paris, France"
                    />
                  </Field>

                  <Field label="Date de naissance">
                    <p className="text-xs text-gray-500 dark:text-gray-400">16 ans minimum</p>
                    <input
                      required
                      type="date"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().slice(0,10)}
                      value={userEditForm.birthDate}
                      onChange={(e) => setUserEditForm({ ...userEditForm, birthDate: e.target.value })}
                      className={inputClass()}
                    />
                  </Field>
                </div>

                {userActionError && <p className="text-sm text-red-600">{userActionError}</p>}
                {userActionState === 'success' && <p className="text-sm text-green-700">Utilisateur mis à jour</p>}

                <div className="flex items-center gap-3 flex-wrap justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => { setUserEditMode(false); setUserActionError(''); setUserActionState('idle') }}>
                    Fermer
                  </Button>
                  <Button type="submit" disabled={userActionState === 'loading'}>
                    {userActionState === 'loading' ? 'Mise à jour…' : 'Enregistrer'}
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedUser.id}
                    onClick={() => selectedUser.id && setPendingUserDelete(selectedUser)}
                  >
                    Supprimer
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
                  <InfoChip label="Lieu" value={selectedUser.location} />
                  <InfoChip label="Date de naissance" value={formatDate(selectedUser.birthDate)} />
                  <InfoChip label="Économies" value={formatMoney(selectedUser.savingsCents)} />
                  <InfoChip label="Activité" value={`${selectedUser.offersUsed} offres · ${selectedUser.reviewsCount} avis`} />
                  <InfoChip label="Créé" value={formatDate(selectedUser.created_at)} />
                  <InfoChip label="Mis à jour" value={formatDate(selectedUser.updated_at)} />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <Button variant="outline" onClick={() => { setUserEditMode(true); setUserActionError('') }}>
                    <span className="flex items-center gap-2"><Pencil size={14} /> Modifier</span>
                  </Button>
                  {selectedUser.id && (
                    <Button onClick={() => setPendingUserDelete(selectedUser)}>
                      <span className="flex items-center gap-2"><span className="w-8 h-8 rounded-full border border-white/30 bg-white/10 flex items-center justify-center"><Trash2 size={16} /></span>Supprimer</span>
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {pendingUserDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-pink-50 text-pink flex items-center justify-center dark:text-pink"><AlertTriangle size={18} /></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Supprimer {pendingUserDelete.prenom} {pendingUserDelete.nom} ?</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Cette action est irréversible.</p>
            {userActionError && <p className="text-sm text-red-600 mb-3">{userActionError}</p>}
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setPendingUserDelete(null)} className="px-4">Annuler</Button>
                <Button disabled={userActionState === 'loading' || !pendingUserDelete.id} onClick={() => pendingUserDelete.id && void handleDeleteUser(pendingUserDelete.id)}>
                {userActionState === 'loading' ? 'Suppression…' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-alt p-4 shadow-sm">
      <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
        <span>{label}</span>
        {children}
      </label>
    </div>
  )
}

function inputClass() {
  return 'w-full rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-pink focus:ring-1 focus:ring-pink transition-colors'
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-dark-alt border border-gray-100 dark:border-dark-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  )
}

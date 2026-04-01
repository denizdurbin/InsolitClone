import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-6xl mb-4" aria-hidden="true">🔍</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Page introuvable</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        La page que tu cherches n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button href="/">Retour à l&apos;accueil</Button>
        <Button href="/offres" variant="outline">Voir les offres</Button>
      </div>
    </div>
  )
}

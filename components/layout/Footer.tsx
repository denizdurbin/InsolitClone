import Link from 'next/link'

const cols = [
  {
    title: 'Produit',
    links: [
      { label: 'Bons plans',  href: '/offres' },
      { label: 'Activités',   href: '/offres?cat=activite' },
      { label: 'Cadeaux',     href: '/offres?cat=cadeau' },
      { label: 'Lieux',       href: '/lieux' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos',    href: '#' },
      { label: 'Blog',        href: '#' },
      { label: 'Partenaires', href: '#' },
      { label: 'Presse',      href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Aide',    href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'FAQ',     href: '#' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '#' },
      { label: 'CGU',              href: '#' },
      { label: 'Confidentialité',  href: '#' },
      { label: 'Cookies',          href: '#' },
    ],
  },
]

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-[#07070f] text-gray-500">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-12 pb-12 border-b border-white/8">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tight mb-3" aria-label="Insolit">
              <span className="text-pink text-2xl" aria-hidden="true">◎</span>
              <span className="text-white">insolit</span>
            </Link>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed max-w-xs">
              Les meilleurs bons plans autour de toi.
            </p>
            <nav aria-label="Réseaux sociaux" className="flex gap-3">
              {[
                { label: 'Instagram', emoji: '📸' },
                { label: 'Twitter',   emoji: '🐦' },
                { label: 'TikTok',    emoji: '🎵' },
              ].map(({ label, emoji }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`${label} Insolit`}
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-base hover:bg-pink transition-colors"
                >
                  {emoji}
                </a>
              ))}
            </nav>
          </div>

          {/* Nav columns */}
          <nav aria-label="Liens du footer" className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-gray-500 hover:text-pink transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          &copy; {new Date().getFullYear()} Insolit. Tous droits réservés.
        </p>
      </div>
    </footer>
  )
}

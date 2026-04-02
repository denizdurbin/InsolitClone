'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const tabs = [
  { label: 'Offres', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Reviews', href: '/admin/reviews' },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200',
              active
                ? 'bg-pink text-white border-pink shadow-sm'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 border-gray-200 dark:border-dark-border hover:border-pink hover:text-pink hover:bg-pink/5'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

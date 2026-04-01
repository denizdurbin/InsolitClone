import { clsx } from 'clsx'
import Link from 'next/link'

type Variant = 'primary' | 'outline' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  href?: string
  children: React.ReactNode
}

const base = 'inline-flex items-center gap-2 font-semibold rounded-full border-2 transition-all duration-200 whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-pink border-pink text-white hover:bg-pink-dark hover:border-pink-dark hover:-translate-y-px shadow-sm hover:shadow-[0_6px_20px_rgba(255,24,112,0.35)]',
  outline: 'bg-transparent border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 hover:border-pink hover:text-pink hover:-translate-y-px',
  ghost:   'bg-transparent border-transparent text-gray-600 dark:text-gray-400 hover:text-pink hover:bg-pink/10',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export function Button({ variant = 'primary', size = 'md', href, children, className, ...props }: ButtonProps) {
  const classes = clsx(base, variants[variant], sizes[size], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

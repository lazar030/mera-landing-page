import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'inverse'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  secondary: 'border border-line-strong bg-app text-ink hover:bg-surface',
  inverse: 'bg-app text-ink hover:bg-surface',
}

const SIZES = {
  md: 'h-12 px-5.5 text-[15px]',
  sm: 'h-10 px-3.5 text-sm',
} as const

/** A link styled as a button — every CTA on the page is navigation, not an action. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
}: {
  href: string
  variant?: Variant
  size?: keyof typeof SIZES
  className?: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className={
        'inline-flex items-center justify-center rounded-[10px] font-semibold transition-colors ' +
        VARIANTS[variant] + ' ' + SIZES[size] + ' ' + className
      }
    >
      {children}
    </a>
  )
}

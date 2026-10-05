/** Mono uppercase label above section headings. */
export function Eyebrow({ children, tone = 'brand' }: { children: React.ReactNode; tone?: 'brand' | 'night' }) {
  return (
    <p className={'font-mono text-xs font-medium tracking-[0.06em] uppercase ' + (tone === 'brand' ? 'text-brand' : 'text-oak-soft')}>
      {children}
    </p>
  )
}

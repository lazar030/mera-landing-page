/** Inline "✓ label" used in perk and included-feature rows. */
export function Check({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="text-brand">✓</span>
      {children}
    </span>
  )
}

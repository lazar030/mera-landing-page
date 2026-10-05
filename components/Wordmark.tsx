/** The Mera wordmark: folding-rule "M" mark + MERA. Same artwork as apps/admin. */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden className="text-logo">
        <g fill="currentColor">
          <rect x="0" y="-3.4" width="25.8" height="6.8" rx="3.4" transform="translate(9 40) rotate(-90)" />
          <rect x="0" y="-3.4" width="20.27" height="6.8" rx="3.4" transform="translate(9.79 13.9) rotate(48.58)" />
          <rect x="0" y="-3.4" width="20.27" height="6.8" rx="3.4" transform="translate(24.79 29.1) rotate(-48.58)" />
          <rect x="0" y="-3.4" width="25.8" height="6.8" rx="3.4" transform="translate(39 14.2) rotate(90)" />
        </g>
        <g fill="#fdfdfc" stroke="currentColor" strokeWidth="1.7">
          <circle cx="9" cy="13" r="2.25" />
          <circle cx="24" cy="30" r="2.25" />
          <circle cx="39" cy="13" r="2.25" />
        </g>
      </svg>
      <span className="text-lg font-bold tracking-tight text-ink">
        MERA<span className="text-brand">.</span>
      </span>
    </span>
  )
}

import { copy } from '@/content'

/** Footer: wordmark tagline, legal links, copyright. */
export function SiteFooter() {
  const { footer } = copy
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft">
        <span className="font-bold text-ink">
          MERA<span className="text-brand">.</span> <span className="font-normal text-ink-soft">· {footer.tagline}</span>
        </span>
        <nav className="flex flex-wrap gap-5">
          {footer.links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
        <span>{footer.copyright}</span>
      </div>
    </footer>
  )
}

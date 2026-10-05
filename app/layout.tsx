import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { copy } from '@/content'
import './globals.css'

const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
}

/** Root layout of the public marketing site. Fonts are self-hosted by next/font. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={copy.meta.lang} className={geist.variable + ' ' + geistMono.variable}>
      <body className="overflow-x-clip">{children}</body>
    </html>
  )
}

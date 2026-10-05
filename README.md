# @mera/landing-page

Public marketing site for Mera (Next.js 16, Tailwind v4). Serbian only for now.

```bash
pnpm install          # from the repo root
pnpm dev:landing      # → http://localhost:3002
```

- **Copy** — every string lives in `content/sr.ts` (typed by `interface/landing-copy.interface.ts`). i18n = add `content/en.ts` + locale routing.
- **Hero demo** — layout comes from the real `exactFill` in `@mera/core`; prices in `lib/wall-estimate.ts` are illustrative only.
- **Links / sign-up** — `lib/links.ts`, `lib/signup.ts` (placeholder until the admin sign-up endpoint exists).
- **3D screenshot** — drop `public/screens/3d-preview.png` and set `features.preview.image` in `content/sr.ts`.
- **Theme** — `app/globals.css`, same Walnut Workshop palette as apps/admin.

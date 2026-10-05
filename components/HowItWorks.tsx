import { copy } from '@/content'
import { DEMO_WALL, estimateWall } from '@/lib/wall-estimate'
import { fill, formatNumber } from '@/lib/format'
import { Eyebrow } from './Eyebrow'

/** Three steps, each with a small slice of the product as its visual. */
export function HowItWorks() {
  const { how } = copy
  const visuals = [<MeasureVisual key="m" />, <CutVisual key="c" />, <QuoteVisual key="q" />]
  return (
    <section id="kako" className="mx-auto max-w-page scroll-mt-16 px-6 pt-18 pb-26">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <Eyebrow>{how.eyebrow}</Eyebrow>
          <h2 className="mt-3 max-w-[620px] text-[clamp(32px,4vw,52px)] leading-[1.02] font-bold tracking-[-0.04em] text-balance">
            {how.title}
          </h2>
        </div>
        <p className="max-w-[340px] text-[15px] leading-relaxed text-ink-soft">{how.aside}</p>
      </div>
      <ol className="mt-13 grid gap-5 md:grid-cols-3">
        {how.steps.map((step, i) => (
          <li key={step.title} className="flex flex-col overflow-hidden rounded-[18px] border border-line bg-surface">
            <div className="flex h-[190px] flex-col justify-center overflow-hidden px-6">{visuals[i]}</div>
            <div className="flex-1 border-t border-line bg-app p-6">
              <span className="font-mono text-[13px] text-brand">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2.5 text-[21px] font-semibold tracking-[-0.02em]">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-pretty text-ink-soft">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

function MeasureVisual() {
  const { how, demo } = copy
  return (
    <div aria-hidden className="flex flex-col gap-3.5">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-ink-soft uppercase">{how.measure.label}</p>
      <div className="flex h-[46px] items-center justify-between rounded-[10px] border-[1.5px] border-brand bg-app px-3.5 shadow-[0_0_0_4px_rgb(159_94_41/0.12)]">
        <span className="font-mono text-lg font-medium">{DEMO_WALL}</span>
        <span className="text-[13px] text-ink-soft">{demo.units.mm}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {how.measure.chips.map((chip) => (
          <span key={chip} className="rounded-[7px] border border-line-warm bg-app px-2.5 py-1 text-xs">{chip}</span>
        ))}
      </div>
    </div>
  )
}

function CutVisual() {
  const { how, demo, meta } = copy
  const est = estimateWall(DEMO_WALL)
  const rows = est.cutList.filter((r) => r.part !== 'shelf' && r.part !== 'back').slice(0, 3)
  const row = 'grid grid-cols-[1fr_auto_28px] gap-2.5 px-3 py-2'
  return (
    <div aria-hidden className="overflow-hidden rounded-[10px] border border-line-warm bg-app text-xs">
      {rows.map((r) => (
        <div key={r.part + r.length + 'x' + r.width} className={row + ' border-b border-line-soft'}>
          <span>{demo.parts[r.part]}</span>
          <span className="font-mono">{r.length}×{r.width}</span>
          <span className="text-right font-mono">{r.qty}</span>
        </div>
      ))}
      <div className={row + ' bg-surface font-semibold'}>
        <span>{how.cutTotal}</span>
        <span className="font-mono">{formatNumber(est.boardsM2, meta.locale, 1)} {demo.units.m2}</span>
        <span />
      </div>
    </div>
  )
}

function QuoteVisual() {
  const { how, demo, meta } = copy
  const est = estimateWall(DEMO_WALL)
  const num = (v: number) => formatNumber(v, meta.locale)
  const lines = [{ label: fill(how.quote.elements, { count: est.modules.length }), amount: Math.round(est.total) }, ...how.quote.extras]
  const total = lines.reduce((s, l) => s + l.amount, 0)
  return (
    <div aria-hidden className="mt-5 flex h-full items-end justify-center">
      <div className="h-full w-full max-w-60 rounded-t-lg border border-b-0 border-line-warm bg-app px-4 pt-4 shadow-[0_-10px_30px_-18px_rgb(42_32_24/0.35)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-[0.08em]">{how.quote.title}</span>
          <span className="font-mono text-[10px] text-ink-soft">{how.quote.number}</span>
        </div>
        <div className="mt-3 grid gap-1.5">
          {lines.map((l) => (
            <div key={l.label} className="flex justify-between text-[10px]">
              <span className="text-ink-soft">{l.label}</span>
              <span className="font-mono">{num(l.amount)}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex justify-between border-t border-line pt-2 text-xs font-bold">
          <span>{how.quote.total}</span>
          <span>{num(total)} {demo.currency}</span>
        </div>
        <div className="mt-2.5 flex h-[22px] items-center justify-center rounded-[5px] bg-brand text-[10px] font-semibold text-white">
          {how.quote.send}
        </div>
      </div>
    </div>
  )
}

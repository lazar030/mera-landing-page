'use client'

import { useMemo, useState } from 'react'
import type { Mm } from '@mera/core'
import { copy } from '@/content'
import { DEMO_WALL, estimateWall } from '@/lib/wall-estimate'
import { fill, formatNumber } from '@/lib/format'
import { LINKS } from '@/lib/links'
import type { CutPart, WallModule } from '@/interface'

const MIN_WALL: Mm = 2400
const MAX_WALL: Mm = 4800

type View = 'draw' | 'cut'

/**
 * The hero's interactive proof: drag the wall width and the exact-fill solver
 * re-lays the cabinets; the cut list and estimate update with it.
 */
export function WallDemo() {
  const { demo, meta } = copy
  const [wall, setWall] = useState<Mm>(DEMO_WALL)
  const [view, setView] = useState<View>('draw')
  const est = useMemo(() => estimateWall(wall), [wall])
  const num = (v: number, d = 0) => formatNumber(v, meta.locale, d)

  const stats: [string, string][] = [
    [demo.stats.boards, num(est.boardsM2, 1) + ' ' + demo.units.m2],
    [demo.stats.edge, num(est.edgeM, 1) + ' ' + demo.units.m],
    [demo.stats.hardware, est.hardwarePcs + ' ' + demo.units.pcs],
    [demo.stats.parts, String(est.partCount)],
  ]

  return (
    <div>
      <div className="overflow-hidden rounded-[20px] border border-line-warm bg-app shadow-[0_1px_2px_rgb(42_32_24/0.06),0_40px_80px_-40px_rgb(42_32_24/0.45)]">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4.5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="size-2 flex-none rounded-full bg-brand" />
            <span className="truncate text-[13px] font-semibold">{demo.project}</span>
            <span className="hidden text-xs whitespace-nowrap text-ink-soft sm:inline">{demo.scope}</span>
          </div>
          <div role="tablist" className="flex gap-0.5 rounded-[9px] bg-surface-2 p-[3px]">
            <Tab active={view === 'draw'} onClick={() => setView('draw')}>{demo.tabs.draw}</Tab>
            <Tab active={view === 'cut'} onClick={() => setView('cut')}>{demo.tabs.cut}</Tab>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-ink-soft uppercase">{demo.wallLabel}</p>
              <p className="mt-0.5 font-mono text-[30px] font-medium tracking-[-0.03em] tabular-nums">
                {wall}
                <span className="ml-1.5 text-[15px] text-ink-soft">{demo.units.mm}</span>
              </p>
            </div>
            <StatusBadge exact={est.exact}>
              {est.exact ? fill(demo.exact, { count: est.modules.length }) : fill(demo.remainder, { mm: est.remainder })}
            </StatusBadge>
          </div>
          <input
            type="range"
            min={MIN_WALL}
            max={MAX_WALL}
            step={5}
            value={wall}
            onChange={(e) => setWall(Number(e.target.value))}
            aria-label={demo.wallLabel}
            className="mt-3.5 w-full cursor-ew-resize accent-brand"
          />
        </div>

        <div className="px-5 pt-3">
          {view === 'draw' ? <Elevation wall={wall} modules={est.modules} /> : <CutList rows={est.cutList} />}
          <p className="mt-2.5 flex items-center gap-2 text-[11px] text-ink-soft">
            <span aria-hidden className="size-2.5 rounded-[3px] border border-brand bg-brand-tint" />
            {demo.customLegend}
          </p>
        </div>

        <dl className="mt-3.5 grid grid-cols-4 gap-2.5 border-t border-line px-5 pt-4 pb-4.5">
          {stats.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] text-ink-soft">{label}</dt>
              <dd className="mt-0.5 font-mono text-[13px] font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between gap-3 bg-ink px-5 py-4 text-night-ink">
          <div>
            <p className="text-[11px] tracking-[0.08em] text-night-ink-soft uppercase">{demo.total}</p>
            <p className="mt-0.5 text-2xl font-bold tracking-[-0.025em] tabular-nums">
              {num(est.total)} <span className="text-sm font-medium text-night-ink-soft">{demo.currency}</span>
            </p>
          </div>
          <a
            href={LINKS.signup}
            className="rounded-[9px] bg-app px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-ink transition-colors hover:bg-surface"
          >
            {demo.makePdf}
          </a>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">{demo.footnote}</p>
    </div>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        'cursor-pointer rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-colors ' +
        (active ? 'bg-app text-ink shadow-[0_1px_2px_rgb(42_32_24/0.15)]' : 'text-ink-soft hover:text-ink')
      }
    >
      {children}
    </button>
  )
}

function StatusBadge({ exact, children }: { exact: boolean; children: React.ReactNode }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
        (exact ? 'border-ok-line bg-ok-bg text-ok-ink' : 'border-line-strong bg-surface text-brand')
      }
    >
      <span aria-hidden className={'size-1.5 rounded-full ' + (exact ? 'bg-ok-dot' : 'bg-brand')} />
      {children}
    </span>
  )
}

/** Front elevation: overall dimension line, worktop, cabinets, plinth, unit widths. */
function Elevation({ wall, modules }: { wall: Mm; modules: WallModule[] }) {
  return (
    <div className="flex h-[218px] flex-col rounded-xl border border-line bg-paper px-3.5 pt-3.5 pb-2.5">
      <div className="relative mx-px h-4.5" aria-hidden>
        <span className="absolute inset-x-0 top-[9px] h-px bg-ink-muted" />
        <span className="absolute top-[3px] left-0 h-[13px] w-px bg-ink-muted" />
        <span className="absolute top-[3px] right-0 h-[13px] w-px bg-ink-muted" />
        <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-paper px-2 font-mono text-[11px] leading-[18px] font-medium">
          {wall}
        </span>
      </div>
      <div className="mt-1.5 h-[7px] rounded-[2px] bg-worktop" />
      <div className="mt-0.5 flex flex-1 gap-0.5">
        {modules.map((m, i) => (
          <div
            key={i}
            className={
              'flex min-w-0 gap-0.5 rounded-[3px] border p-[3px] ' +
              (m.isCustomWidth ? 'border-brand bg-brand-tint' : 'border-line-strong bg-surface-2')
            }
            style={{ flex: m.width + ' 1 0' }}
          >
            <Door handle="right" />
            {m.doubleDoor && <Door handle="left" />}
          </div>
        ))}
      </div>
      <div className="mx-[3px] h-[9px] bg-line-warm" />
      <div className="mt-1.5 flex gap-0.5">
        {modules.map((m, i) => (
          <span
            key={i}
            className={
              'min-w-0 truncate text-center font-mono text-[10px] tabular-nums ' +
              (m.isCustomWidth ? 'font-semibold text-brand' : 'text-ink-soft')
            }
            style={{ flex: m.width + ' 1 0' }}
          >
            {m.width}
          </span>
        ))}
      </div>
    </div>
  )
}

function Door({ handle }: { handle: 'left' | 'right' }) {
  return (
    <div className="relative flex-1 rounded-[2px] bg-app/60">
      <span className={'absolute top-3.5 h-4.5 w-0.5 rounded-sm bg-ink-muted ' + (handle === 'right' ? 'right-1.5' : 'left-1.5')} />
    </div>
  )
}

/** Aggregated cut list for the current layout. */
function CutList({ rows }: { rows: CutPart[] }) {
  const { demo } = copy
  const grid = 'grid grid-cols-[minmax(0,1fr)_auto_40px] gap-3 px-3.5'
  return (
    <div className="h-[218px] overflow-auto rounded-xl border border-line bg-paper">
      <div className={grid + ' sticky top-0 border-b border-line bg-paper-head py-2.5 text-[11px] font-semibold tracking-[0.06em] text-ink-soft uppercase'}>
        <span>{demo.cutHead.part}</span>
        <span>{demo.cutHead.dims}</span>
        <span className="text-right">{demo.cutHead.qty}</span>
      </div>
      {rows.map((r) => (
        <div key={r.part + r.material + r.length + 'x' + r.width} className={grid + ' border-b border-line-soft py-2 text-[13px]'}>
          <span className="truncate">
            {demo.parts[r.part]}
            <span className="ml-1.5 text-[11px] text-ink-muted">{demo.materials[r.material]}</span>
          </span>
          <span className="font-mono text-xs tabular-nums">{r.length}×{r.width}</span>
          <span className="text-right font-mono text-xs">{r.qty}</span>
        </div>
      ))}
    </div>
  )
}

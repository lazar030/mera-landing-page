'use client'

import { useMemo, useState } from 'react'
import type { Mm } from '@mera/core'
import { copy } from '@/content'
import { estimateWall } from '@/lib/wall-estimate'
import { fill, formatNumber } from '@/lib/format'
import type { WallModule } from '@/interface'

const MIN_WALL: Mm = 2400
const MAX_WALL: Mm = 4800
/** The wall used in the copy ("Zid od 3925 mm…") — keep them in sync. */
const INITIAL_WALL: Mm = 3925

/**
 * The hero's interactive proof: drag the wall width and watch the exact-fill
 * solver re-lay the cabinets and the estimate update.
 */
export function WallDemo() {
  const { demo, meta } = copy
  const [wall, setWall] = useState<Mm>(INITIAL_WALL)
  const est = useMemo(() => estimateWall(wall), [wall])
  const num = (v: number, d = 0) => formatNumber(v, meta.locale, d)

  const rows: [string, string][] = [
    [demo.boards, num(est.boardsM2, 1) + ' ' + demo.units.m2],
    [demo.edge, num(est.edgeM, 1) + ' ' + demo.units.m],
    [demo.hardware, est.hardwarePcs + ' ' + demo.units.pcs],
    [demo.labour, num(est.labour) + ' ' + demo.currency],
  ]

  return (
    <div className="rounded-[18px] border border-line bg-surface p-5.5 shadow-[0_1px_2px_rgba(42,32,24,0.05),0_28px_60px_-32px_rgba(42,32,24,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">{demo.project}</p>
          <p className="mt-1 font-mono text-[28px] font-medium tracking-tight tabular-nums">
            {wall} {demo.units.mm}
          </p>
        </div>
        <span className="rounded-full border border-line-strong bg-app px-2.5 py-1 text-xs font-medium">
          {est.exact ? fill(demo.exact, { count: est.modules.length }) : fill(demo.remainder, { mm: est.remainder })}
        </span>
      </div>

      <input
        type="range"
        min={MIN_WALL}
        max={MAX_WALL}
        step={5}
        value={wall}
        onChange={(e) => setWall(Number(e.target.value))}
        aria-label={demo.sliderLabel}
        className="mt-4 mb-1 w-full accent-brand"
      />
      <p className="text-xs text-ink-soft">{demo.hint}</p>

      <div className="mt-4.5 rounded-xl border border-line bg-app p-4">
        <div className="flex h-[150px] items-end gap-[3px]">
          {est.modules.map((m, i) => (
            <Cabinet key={i} module={m} />
          ))}
        </div>
        <p className="mt-2 flex items-center gap-2 text-[11px] text-ink-soft">
          <span className="size-2.5 rounded-[3px] border border-brand bg-brand-tint" />
          {demo.customLegend}
        </p>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="font-mono tabular-nums">{value}</dd>
          </div>
        ))}
        <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-line-strong pt-3">
          <dt className="font-semibold">{demo.total}</dt>
          <dd className="text-xl font-bold tracking-tight tabular-nums">
            {num(est.total)} {demo.currency}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/** One cabinet in the elevation, sized by flex-grow so widths stay proportional. */
function Cabinet({ module: m }: { module: WallModule }) {
  return (
    <div className="flex h-full min-w-0 flex-col gap-1.5" style={{ flex: m.width + ' 1 0' }}>
      <div
        className={
          'flex flex-1 gap-0.5 rounded-[5px] border p-[3px] ' +
          (m.isCustomWidth ? 'border-brand bg-brand-tint' : 'border-line-strong bg-surface-2')
        }
      >
        <Door handle="right" />
        {m.doubleDoor && <Door handle="left" />}
      </div>
      <span
        className={
          'truncate text-center font-mono text-[10px] tabular-nums ' + (m.isCustomWidth ? 'text-brand' : 'text-ink-soft')
        }
      >
        {m.width}
      </span>
    </div>
  )
}

function Door({ handle }: { handle: 'left' | 'right' }) {
  return (
    <div className="relative flex-1 rounded-[3px] bg-app/55">
      <span className={'absolute top-[44%] h-4 w-0.5 rounded-sm bg-ink-muted ' + (handle === 'right' ? 'right-1' : 'left-1')} />
    </div>
  )
}

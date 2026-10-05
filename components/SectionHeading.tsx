import { Eyebrow } from './Eyebrow'

/** Eyebrow + h2 shared by the content sections. */
export function SectionHeading({ eyebrow, title, center = false }: { eyebrow?: string; title: string; center?: boolean }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className={
          'mt-3 max-w-2xl text-[clamp(32px,4vw,52px)] leading-[1.02] font-bold tracking-[-0.04em] text-balance ' +
          (center ? 'mx-auto' : '')
        }
      >
        {title}
      </h2>
    </div>
  )
}

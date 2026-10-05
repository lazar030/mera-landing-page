/** Eyebrow + h2 used by every content section, so headings stay consistent. */
export function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div>
      {eyebrow && <p className="text-[13px] font-semibold tracking-[0.08em] text-brand uppercase">{eyebrow}</p>}
      <h2 className="mt-3 max-w-2xl text-[clamp(30px,3.6vw,44px)] leading-[1.08] font-bold tracking-[-0.03em] text-balance">
        {title}
      </h2>
    </div>
  )
}

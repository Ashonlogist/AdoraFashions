import type { ReactNode } from 'react'

/**
 * Artwork breaking out of a decorative shape.
 *
 * Two layers, nothing clever: a shape sits behind, and the artwork is laid over
 * it slightly oversized and nudged off-centre so part of the subject hangs past
 * the shape's edge. The image itself is never cropped — no clip-path, no mask —
 * so a transparent cutout keeps its own outline and its drop shadow falls across
 * the shape, which is what sells the depth.
 *
 * The two sizes do different jobs. On a phone the shape and the figure are
 * centred as one unit and the figure only just clears the shape, because there
 * is no headline beside it to overlap into and a big offset would either crowd
 * the text or push the layout sideways. From `lg` the shape slides left inside
 * the stage while the figure grows and drifts right, so the escape becomes
 * directional — a shoulder and a hem stepping out of a frame rather than a
 * symmetrical halo.
 */
export function BreakoutFrame({
  children,
  className = '',
  stage = 'aspect-[4/5] w-[86%] max-w-[34rem] sm:w-[78%] lg:ml-auto lg:w-full',
  tone = 'accent',
}: {
  children: ReactNode
  /** Sizing for the invisible box the two layers are composed inside. */
  className?: string
  stage?: string
  tone?: 'accent' | 'charcoal'
}) {
  return (
    <div className={`breakout-stage relative ${stage} ${className}`}>
      {/* The shape. Narrower and higher than the figure on small screens so
          there is only a little daylight above the head, then pushed left and
          dropped so the figure has somewhere to escape towards. */}
      <div
        aria-hidden
        data-breakout-shape
        className={`absolute left-[13%] right-[13%] top-[16%] bottom-[12%] rounded-[58%_42%_46%_54%/46%_56%_44%_54%] md:left-[14%] md:right-[14%] md:top-[15%] md:bottom-[13%] lg:left-[-3%] lg:right-[34%] lg:top-[18%] lg:bottom-[20%] ${
          tone === 'charcoal' ? 'bg-charcoal/[0.07]' : 'bg-accent/[0.13]'
        }`}
      />

      {/* The artwork. Centred and only a little larger than the shape on a
          phone, growing and shifting right as the viewport allows. */}
      <div className="absolute inset-x-0 top-0 bottom-[-4%] md:inset-x-[-2%] md:bottom-[-5%] lg:inset-x-[-2%] lg:top-[-4%] lg:bottom-[-4%]">
        {children}
      </div>
    </div>
  )
}

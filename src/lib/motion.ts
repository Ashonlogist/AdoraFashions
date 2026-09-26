/**
 * Motion language for Adora Fashions.
 *
 * Couture pacing: nothing bounces, nothing is quick. Entrances run 0.7–1.5s on a
 * single asymmetric ease, and elements are sequenced rather than fired together so
 * the eye is guided instead of overwhelmed.
 */

export const EASE = {
  /** Primary — the house ease. Long tail, decisive start. */
  couture: [0.16, 1, 0.3, 1] as const,
  /** Symmetric, for things that travel and arrive. */
  drape: [0.65, 0, 0.35, 1] as const,
  /** Sharp in, soft out — used for the oversized statement tracking tighten. */
  hem: [0.33, 0, 0.15, 1] as const,
}

export const DURATION = {
  quick: 0.45,
  base: 0.8,
  slow: 1.15,
  curtain: 1.35,
  page: 0.75,
} as const

export const STAGGER = {
  tight: 0.05,
  base: 0.095,
  wide: 0.14,
} as const

/** Palette as CSS colors so framer-motion can interpolate them directly. */
export const COLOR = {
  bone: 'rgb(245, 241, 234)',
  cream: 'rgb(250, 248, 244)',
  charcoal: 'rgb(28, 26, 23)',
  warmGray: 'rgb(138, 131, 120)',
  accent: 'rgb(184, 135, 90)',
  hairline: 'rgb(228, 222, 211)',
} as const

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/** Coarse device gate used to keep scroll-linked work off low-end phones. */
export function isCoarsePointer() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none)').matches
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { DURATION, EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * Route transitions read as turning a page in an editorial spread: a bone
 * panel sweeps in from the right, holds while the next view mounts, then
 * continues off to the left, trailing a single hairline of accent.
 *
 * The panel is `pointer-events-none` throughout, and is skipped entirely for
 * reduced-motion visitors and for the admin area (which should feel instant).
 */
export function PageWipe({ pathname, enabled = true }: { pathname: string; enabled?: boolean }) {
  const { reduced } = useMotionPreference()
  if (!enabled || reduced) return null

  return (
    <motion.div
      key={pathname}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
      initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
      animate={{
        clipPath: [
          'inset(0% 0% 0% 100%)',
          'inset(0% 0% 0% 0%)',
          'inset(0% 100% 0% 0%)',
        ],
      }}
      transition={{ duration: 0.95, times: [0, 0.36, 1], ease: [EASE.hem, EASE.hem] }}
    >
      <div className="absolute inset-0 bg-bone">
        <div className="absolute inset-y-0 left-0 w-px bg-accent/70" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="label text-charcoal/30">Adora Fashions</span>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * The page body itself: the outgoing view recedes a little, the incoming view
 * rises into place. Deliberately shallow — the wipe does the heavy lifting.
 */
export function PageBody({
  children,
  instant = false,
}: {
  children: ReactNode
  instant?: boolean
}) {
  const { reduced } = useMotionPreference()
  const still = instant || reduced

  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 14, scale: 1.012 }}
      animate={still ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={still ? undefined : { opacity: 0, y: -8, scale: 0.99 }}
      transition={{
        duration: still ? 0 : DURATION.page,
        ease: EASE.couture,
      }}
      style={still ? undefined : { willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

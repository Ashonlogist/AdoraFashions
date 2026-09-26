import { motion } from 'framer-motion'
import { useId } from 'react'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * The small rotating seal that sits above the hero headline — the sort of detail
 * a real atelier stamps on its tissue paper and correspondence.
 */
export function RotatingSeal({
  text,
  className = '',
  size = 96,
}: {
  text: string
  className?: string
  size?: number
}) {
  const id = useId().replace(/[:]/g, '')
  const { reduced } = useMotionPreference()
  const repeated = Array.from({ length: 3 }, () => text).join('  ·  ')

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      >
        <defs>
          <path
            id={`seal-${id}`}
            d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
            fill="none"
          />
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.22" />
        <text
          className="fill-current font-sans"
          style={{ fontSize: 8.4, letterSpacing: '0.24em', textTransform: 'uppercase' }}
        >
          <textPath href={`#seal-${id}`} startOffset="0%">
            {repeated}
          </textPath>
        </text>
      </motion.svg>
      <span className="absolute left-1/2 top-1/2 block h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  )
}

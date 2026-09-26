import { motion } from 'framer-motion'

/**
 * A slow, endless crawl of small caps. The seam between the two duplicated runs
 * is hidden by translating exactly -50%, so the loop is invisible.
 */
export function Marquee({
  items,
  tone = 'light',
  className = '',
  duration = 46,
}: {
  items: string[]
  tone?: 'light' | 'dark'
  className?: string
  duration?: number
}) {
  if (items.length === 0) return null
  const run = [...items, ...items]
  const text = tone === 'dark' ? 'text-bone/55' : 'text-warm-gray'
  const dot = tone === 'dark' ? 'bg-bone/25' : 'bg-charcoal/20'

  return (
    <div
      className={`relative flex overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      }}
      aria-hidden
    >
      <motion.div
        className="flex shrink-0 items-center"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {run.map((item, index) => (
          <span key={index} className={`flex shrink-0 items-center ${text}`}>
            <span className="label whitespace-nowrap px-6 py-3">{item}</span>
            <span className={`block h-1 w-1 rounded-full ${dot}`} />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

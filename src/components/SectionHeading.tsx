import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'
import { motion } from 'framer-motion'
import { BlockWipe, SplitWords } from '../motion/text'

/**
 * The shared section opener: a numbered eyebrow, a rule that draws itself, then
 * the headline revealed word by word behind its own masks.
 */
export function SectionHeading({
  index,
  eyebrow,
  headline,
  lede,
  aside,
  tone = 'light',
  align = 'left',
  as = 'h2',
  className = '',
}: {
  index?: string
  eyebrow: string
  headline: string
  lede?: string
  aside?: ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  /** Page openers pass "h1"; in-page sections keep the default h2. */
  as?: 'h1' | 'h2'
  className?: string
}) {
  const { reduced } = useMotionPreference()
  const muted = tone === 'dark' ? 'text-bone/55' : 'text-warm-gray'
  const rule = tone === 'dark' ? 'bg-bone/20' : 'bg-hairline'

  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-3xl text-center' : ''} ${className}`}>
      <div
        className={`flex items-center gap-5 ${align === 'center' ? 'justify-center' : ''}`}
      >
        {index ? (
          <span className="label shrink-0 text-accent">{index}</span>
        ) : null}
        <span className={`label whitespace-nowrap ${muted}`}>{eyebrow}</span>
        <motion.span
          aria-hidden
          className={`h-px flex-1 origin-left ${rule}`}
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.3, delay: 0.15, ease: EASE.couture }}
        />
      </div>

      <BlockWipe
        as={as}
        direction="up"
        className="mt-8 font-display text-display-lg"
      >
        <SplitWords text={headline} stagger={0.07} emphasisLast={1} />
      </BlockWipe>

      {lede ? (
        <motion.p
          className={`mt-7 max-w-[38rem] text-[0.9375rem] leading-[1.9] ${muted} ${
            align === 'center' ? 'mx-auto' : ''
          }`}
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE.couture }}
        >
          {lede}
        </motion.p>
      ) : null}

      {aside ? <div className="mt-8">{aside}</div> : null}
    </div>
  )
}

export function TextLink({
  to,
  children,
  tone = 'light',
}: {
  to: string
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <Link
      to={to}
      data-cursor="link"
      className={`link-draw group inline-flex items-center gap-3 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-colors duration-500 ${
        tone === 'dark' ? 'text-bone hover:text-accent' : 'text-charcoal hover:text-accent'
      }`}
    >
      {children}
      <span className="transition-transform duration-700 ease-couture group-hover:translate-x-1.5">
        <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden>
          <path d="M0 4h20M16.5 0.75 20 4l-3.5 3.25" stroke="currentColor" strokeWidth="1" />
        </svg>
      </span>
    </Link>
  )
}

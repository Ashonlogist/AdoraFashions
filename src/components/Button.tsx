import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

type Variant = 'solid' | 'outline' | 'accent' | 'quiet'
type Size = 'sm' | 'md' | 'lg'

const SIZES: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-[0.6875rem]',
  md: 'px-7 py-3.5 text-xs',
  lg: 'px-9 py-4.5 text-xs',
}

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-charcoal text-bone border border-charcoal hover:bg-charcoal/88',
  accent: 'bg-accent text-bone border border-accent hover:bg-accent/88',
  outline: 'bg-transparent text-charcoal border border-charcoal/25 hover:border-charcoal/60',
  quiet: 'bg-transparent text-charcoal border border-transparent px-0 py-0',
}

/**
 * Buttons read as tailoring, not as UI: the label never jumps, the rule beneath
 * draws in from the left, and the arrow travels a few pixels further than the
 * eye expects.
 */
export function Button({
  children,
  to,
  href,
  onClick,
  variant = 'solid',
  size = 'md',
  className = '',
  arrow = true,
  type,
  disabled,
  cursor = 'link',
}: {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: Variant
  size?: Size
  className?: string
  arrow?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
  cursor?: 'link' | 'view' | 'none'
}) {
  const { reduced } = useMotionPreference()

  const base = `group relative inline-flex select-none items-center justify-center gap-3 overflow-hidden font-sans font-medium uppercase tracking-[0.15em] transition-colors duration-700 ease-couture disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${className}`

  const inner = (
    <>
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      {arrow ? (
        <motion.span
          aria-hidden
          className="relative z-10 block"
          animate={reduced ? undefined : { x: [0, 3.5, 0] }}
          transition={{ duration: 0.7, ease: EASE.couture }}
        >
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" className="overflow-visible">
            <path d="M0 4h20M16.5 0.75 20 4l-3.5 3.25" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.span>
      ) : null}
      {variant === 'quiet' ? null : (
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 z-0 h-px origin-left scale-x-0 transition-transform duration-700 ease-couture group-hover:scale-x-100 ${
            variant === 'solid' ? 'bg-bone/70' : 'bg-accent'
          }`}
        />
      )}
    </>
  )

  const dataCursor = cursor === 'none' ? undefined : { 'data-cursor': cursor }

  if (to) {
    return (
      <motion.div
        className="inline-block"
        whileHover={reduced ? undefined : { scale: 1.015 }}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.5, ease: EASE.couture }}
        {...dataCursor}
      >
        <Link to={to} className={base}>
          {inner}
        </Link>
      </motion.div>
    )
  }

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
    return (
      <motion.div
        className="inline-block"
        whileHover={reduced ? undefined : { scale: 1.015 }}
        whileTap={reduced ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.5, ease: EASE.couture }}
        {...dataCursor}
      >
        <a
          href={href}
          className={base}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
        >
          {inner}
        </a>
      </motion.div>
    )
  }

  return (
    <motion.button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={base}
      whileHover={reduced ? undefined : { scale: 1.015 }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.5, ease: EASE.couture }}
      {...dataCursor}
    >
      {inner}
    </motion.button>
  )
}

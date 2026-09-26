import { motion } from 'framer-motion'
import type { ElementType, ReactNode } from 'react'
import { DURATION, EASE, STAGGER } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

/* -------------------------------------------------------------------------- */
/*  BlockWipe — a single soft-edged mask sweeps across a whole block of type,  */
/*  the way fabric is drawn back off a rail.                                    */
/* -------------------------------------------------------------------------- */

type WipeDirection = 'up' | 'left' | 'right'

const WIPE_FROM: Record<WipeDirection, string> = {
  up: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 100% 0% 0%)',
  right: 'inset(0% 0% 0% 100%)',
}

const WIPE_TO = 'inset(0% 0% 0% 0%)'

export function BlockWipe({
  children,
  className,
  as = 'div',
  direction = 'up',
  delay = 0,
  duration = DURATION.curtain,
  once = true,
  amount = 0.35,
  trigger = 'view',
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  direction?: WipeDirection
  delay?: number
  duration?: number
  once?: boolean
  amount?: number
  trigger?: 'view' | 'mount'
}) {
  const { reduced } = useMotionPreference()
  const MotionTag = motion.create(as as ElementType)

  if (reduced) {
    const Tag = as as ElementType
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      style={{ willChange: 'clip-path, transform' }}
      initial={trigger === 'mount' ? { clipPath: WIPE_FROM[direction] } : false}
      whileInView={trigger === 'view' ? { clipPath: WIPE_TO } : undefined}
      animate={trigger === 'mount' ? { clipPath: WIPE_TO } : undefined}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE.couture }}
    >
      {children}
    </MotionTag>
  )
}

/* -------------------------------------------------------------------------- */
/*  SplitWords — each word rides up from behind its own mask, sequenced.       */
/* -------------------------------------------------------------------------- */

type Unit = { type: 'word' | 'space' | 'char'; value: string }

function split(text: string, by: 'word' | 'char'): Unit[] {
  const units: Unit[] = []
  if (by === 'word') {
    text.split(' ').forEach((word, i, all) => {
      units.push({ type: 'word', value: word })
      if (i < all.length - 1) units.push({ type: 'space', value: ' ' })
    })
    return units
  }
  for (const char of text) {
    units.push(char === ' ' ? { type: 'space', value: ' ' } : { type: 'char', value: char })
  }
  return units
}

export function SplitWords({
  text,
  className,
  as = 'span',
  by = 'word',
  delay = 0,
  stagger = STAGGER.base,
  duration = DURATION.slow,
  distance = '108%',
  once = true,
  amount = 0.4,
  trigger = 'view',
  emphasisLast = 0,
  emphasisClassName = 'italic',
}: {
  text: string
  className?: string
  as?: ElementType
  by?: 'word' | 'char'
  delay?: number
  stagger?: number
  duration?: number
  distance?: string
  once?: boolean
  amount?: number
  trigger?: 'view' | 'mount'
  /** Italicises the final N words — an editorial stress without editing the copy. */
  emphasisLast?: number
  emphasisClassName?: string
}) {
  const { reduced } = useMotionPreference()
  const units = split(text, by)
  const wordIndexes = units.reduce<number[]>((acc, unit, i) => {
    if (unit.type === 'word') acc.push(i)
    return acc
  }, [])
  const emphasised = new Set(wordIndexes.slice(-emphasisLast))

  if (reduced) {
    const Tag = as as ElementType
    return <Tag className={className}>{text}</Tag>
  }

  const Tag = motion.create(as as ElementType)

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView={trigger === 'view' ? 'shown' : undefined}
      animate={trigger === 'mount' ? 'shown' : undefined}
      viewport={{ once, amount }}
      variants={{ hidden: {}, shown: { transition: { delayChildren: delay, staggerChildren: stagger } } }}
    >
      {units.map((unit, i) =>
        unit.type === 'space' ? (
          <span key={i} className="inline-block">
            &nbsp;
          </span>
        ) : (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
          >
            <motion.span
              className={`inline-block will-change-transform ${
                emphasised.has(i) ? emphasisClassName : ''
              }`}
              variants={{
                hidden: { y: distance, opacity: 0 },
                shown: { y: '0%', opacity: 1 },
              }}
              transition={{ duration, ease: EASE.couture }}
            >
              {unit.value}
            </motion.span>
          </span>
        ),
      )}
    </Tag>
  )
}

/* -------------------------------------------------------------------------- */
/*  TrackingLabel — small caps that literally track in from wide spacing.      */
/* -------------------------------------------------------------------------- */

export function TrackingLabel({
  text,
  className,
  delay = 0,
  duration = DURATION.slow,
  from = '0.62em',
  to = '0.18em',
}: {
  text: string
  className?: string
  delay?: number
  duration?: number
  from?: string
  to?: string
}) {
  const { reduced } = useMotionPreference()
  const chars = Array.from(text)

  if (reduced) {
    return <span className={className}>{text}</span>
  }

  return (
    <motion.span
      className={`inline-flex whitespace-pre ${className ?? ''}`}
      aria-label={text}
      initial={{ letterSpacing: from, opacity: 0 }}
      animate={{ letterSpacing: to, opacity: 1 }}
      transition={{ duration: DURATION.slow, delay, ease: EASE.hem }}
    >
      {chars.map((char, i) =>
        char === ' ' ? (
          <span key={i}> </span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration * 0.8, delay: delay + i * 0.028, ease: EASE.couture }}
          >
            {char}
          </motion.span>
        ),
      )}
    </motion.span>
  )
}

/* -------------------------------------------------------------------------- */
/*  TrackingTighten — oversized statement line; letters draw together into       */
/*  their resting tracking as the section arrives.                              */
/* -------------------------------------------------------------------------- */

export function TrackingTighten({
  text,
  className,
  as: Tag = 'h2',
  from = '0.34em',
  to = '-0.035em',
  delay = 0,
  amount = 0.35,
}: {
  text: string
  className?: string
  as?: ElementType
  from?: string
  to?: string
  delay?: number
  amount?: number
}) {
  const { reduced } = useMotionPreference()

  if (reduced) {
    return <Tag className={className}>{text}</Tag>
  }

  const MotionTag = motion.create(Tag as ElementType)

  return (
    <MotionTag
      className={className}
      style={{ willChange: 'letter-spacing', whiteSpace: 'pre-wrap' }}
      initial={{ letterSpacing: from, opacity: 0 }}
      whileInView={{ letterSpacing: to, opacity: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.6, delay, ease: EASE.hem }}
    >
      {text}
    </MotionTag>
  )
}

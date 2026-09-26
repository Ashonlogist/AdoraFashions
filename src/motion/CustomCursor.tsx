import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

type CursorMode = 'default' | 'link' | 'view'

/**
 * The cursor is drawn twice over, in the two colours that sit at opposite ends of
 * the palette, so whichever one the backdrop matches, the other one carries it.
 * A single-colour cursor cannot do this: at 35% charcoal it measured 1.00:1 on a
 * charcoal section, and the accent dot measured 1.00:1 on an accent one.
 *
 * These are the worst cases of the pair across every background colour:
 *   bone 15.4:1 · cream 16.4:1 · charcoal 15.4:1 · warm-gray 4.6:1
 *   accent 5.5:1 · hairline 13.0:1
 * so at least one edge is always comfortably past the 3:1 that non-text
 * interface elements are held to.
 */
const RING_HAIRLINE = 'inset 0 0 0 1px rgba(28, 26, 23, 0.5), 0 0 0 1px rgba(245, 241, 234, 0.85)'
const RING_DISC = '0 0 0 2px rgba(245, 241, 234, 0.92)'
const DOT_HALO = '0 0 0 1.5px rgba(245, 241, 234, 0.92)'

const LABELS: Record<Exclude<CursorMode, 'default'>, string> = {
  link: '',
  view: 'View',
}

function isEligible() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/**
 * A small boutique cursor: a hairline ring trailing a solid dot.
 *
 * It swells over interactive elements and blooms into a "View" disc over
 * garment imagery. Only mounts for fine pointers with hover, and never under
 * `prefers-reduced-motion` — in both cases the native cursor is left alone.
 *
 * Pair with `data-cursor="view|link"` on any element.
 */
export function CustomCursor({ enabled: allowed = true }: { enabled?: boolean } = {}) {
  const { reduced } = useMotionPreference()
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState<CursorMode>('default')
  const [pressed, setPressed] = useState(false)
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.55 })
  const ringY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.55 })
  const dotX = useSpring(x, { stiffness: 900, damping: 42, mass: 0.25 })
  const dotY = useSpring(y, { stiffness: 900, damping: 42, mass: 0.25 })

  useEffect(() => {
    setEnabled(allowed && isEligible() && !reduced)
  }, [allowed, reduced])

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute('data-cursor')
      return
    }
    document.documentElement.setAttribute('data-cursor', 'on')

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      if (!visibleRef.current) {
        visibleRef.current = true
        setVisible(true)
      }
      const found = (event.target as HTMLElement | null)?.closest?.('[data-cursor]') as
        | HTMLElement
        | null
      // The document element carries `data-cursor="on"` purely as the CSS hook
      // that hides the native cursor. Letting it win the lookup meant every
      // unmarked element resolved to mode "on", which is not a real mode — the
      // solid dot then never rendered and only the hairline ring was left.
      const target = found === document.documentElement ? null : found
      const next = (target?.dataset.cursor as CursorMode | undefined) ?? 'default'
      setMode(next)
    }

    const onLeave = () => {
      visibleRef.current = false
      setVisible(false)
    }
    const onEnter = () => {
      visibleRef.current = true
      setVisible(true)
    }
    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onBlur = () => {
      visibleRef.current = false
      setVisible(false)
      setMode('default')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('blur', onBlur)

    return () => {
      document.documentElement.removeAttribute('data-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const ringScale = mode === 'view' ? 4.6 : mode === 'link' ? 1.85 : 1
  const label = mode === 'default' ? null : LABELS[mode]

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <motion.div
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: pressed ? ringScale * 0.82 : ringScale,
          // Kept high: the two-tone edges need to stay legible, and dimming both
          // of them is what made the old cursor vanish on light sections.
          opacity: visible ? (mode === 'view' ? 1 : 0.9) : 0,
          backgroundColor:
            mode === 'view' ? 'rgba(28, 26, 23, 0.92)' : 'rgba(245, 241, 234, 0)',
          boxShadow: mode === 'view' ? RING_DISC : RING_HAIRLINE,
        }}
        transition={{ duration: 0.5, ease: EASE.couture }}
      />
      <motion.span
        className="absolute left-0 top-0 font-sans text-micro font-medium uppercase text-bone"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && label ? 1 : 0, scale: visible ? 1 : 0.8 }}
        transition={{ duration: 0.4, ease: EASE.couture }}
      >
        {label}
      </motion.span>
      <motion.span
        className="absolute left-0 top-0 block h-1.5 w-1.5 rounded-full bg-charcoal"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%', boxShadow: DOT_HALO }}
        animate={{ opacity: visible && mode === 'default' ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.3, ease: EASE.couture }}
      />
    </div>
  )
}

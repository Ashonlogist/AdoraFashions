import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

type CursorMode = 'default' | 'link' | 'view'

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
      const target = (event.target as HTMLElement | null)?.closest?.('[data-cursor]') as
        | HTMLElement
        | null
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
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/35"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: pressed ? ringScale * 0.82 : ringScale,
          opacity: visible ? (mode === 'view' ? 1 : 0.55) : 0,
          backgroundColor:
            mode === 'view' ? 'rgba(28, 26, 23, 0.92)' : 'rgba(245, 241, 234, 0)',
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
        className="absolute left-0 top-0 block h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible && mode === 'default' ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.3, ease: EASE.couture }}
      />
    </div>
  )
}

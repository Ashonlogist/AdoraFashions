import { animate, motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { DURATION, EASE, isCoarsePointer } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

type CutoutTone = 'light' | 'dark'
type CutoutEntrance = 'blur' | 'wipe' | 'none'

const ENTRANCE_FROM = {
  blur: { opacity: 0, scale: 1.06, filter: 'blur(20px)' },
  wipe: { opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
} as const

const ENTRANCE_TO = {
  blur: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  wipe: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' },
} as const


/**
 * A garment or portrait cutout.
 *
 * Each motion gets its own layer so they never fight over the same transform:
 *   1. scroll-linked drift (parallax + a whisper of rotation and scale, so the
 *      cutout reads as having physical depth rather than being pasted on)
 *   2. idle float (never perfectly still on screen)
 *   3. entrance (soft blur, or a vertical draw)
 *   4. drop-shadow wrapper — kept separate because the entrance animates
 *      `filter` and would otherwise wipe the shadow out.
 */
export function Cutout({
  src,
  alt,
  className = '',
  imageClassName = '',
  tone = 'light',
  speed = 64,
  rotate = 2.4,
  swell = 0.05,
  float = true,
  entrance = 'blur',
  delay = 0,
  priority = false,
  parallax = true,
}: {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  tone?: CutoutTone
  speed?: number
  rotate?: number
  swell?: number
  float?: boolean
  entrance?: CutoutEntrance
  delay?: number
  priority?: boolean
  parallax?: boolean
}) {
  const outer = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const { reduced } = useMotionPreference()
  const coarse = isCoarsePointer()
  const linked = parallax && !reduced && !coarse

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ['start end', 'end start'],
  })

  const driftY = useTransform(scrollYProgress, [0, 1], [speed, -speed])
  const driftTilt = useTransform(scrollYProgress, [0, 1], [-rotate, rotate])
  const driftScale = useTransform(scrollYProgress, [0, 0.5, 1], [1 - swell, 1 + swell * 0.35, 1 - swell])

  useEffect(() => {
    setStatus('loading')
    const img = new Image()
    img.onload = () => setStatus('ready')
    img.onerror = () => setStatus('error')
    img.src = src
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  const idle = useRef<HTMLDivElement>(null)

  // Idle drift so the cutout is never perfectly still on screen.
  useEffect(() => {
    if (reduced || !float || !idle.current) return
    const controls = animate(
      idle.current,
      { y: [0, -11, 0], rotate: [0, 0.6, 0] },
      { duration: 11, ease: 'easeInOut', repeat: Infinity },
    )
    return () => controls.stop()
  }, [reduced, float])

  const shadow = tone === 'dark' ? 'cutout-dark' : 'cutout'

  return (
    <div ref={outer} className="relative h-full w-full">
      <motion.div
        className="h-full w-full"
        style={linked ? { y: driftY, rotate: driftTilt, scale: driftScale, willChange: 'transform' } : undefined}
      >
        <div ref={idle} className="h-full w-full">
          <motion.div
            className="h-full w-full"
            initial={reduced || entrance === 'none' ? false : ENTRANCE_FROM[entrance]}
            animate={
              reduced || entrance === 'none'
                ? undefined
                : status === 'ready'
                  ? ENTRANCE_TO[entrance]
                  : ENTRANCE_FROM[entrance]
            }
            style={{ willChange: entrance === 'blur' ? 'filter, opacity' : 'clip-path, opacity' }}
            transition={{ duration: DURATION.slow + 0.5, delay, ease: EASE.couture }}
          >
            <div className={`relative h-full w-full ${shadow} ${className}`}>
              {status === 'error' ? (
                <div
                  className={`flex h-full w-full items-center justify-center border border-hairline ${
                    tone === 'dark' ? 'bg-charcoal/40 text-bone/50' : 'bg-cream text-warm-gray'
                  }`}
                >
                  <span className="label px-4 text-center">Awaiting photography</span>
                </div>
              ) : (
                <img
                  src={src}
                  alt={alt}
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  className={`block h-full w-full select-none object-contain transition-opacity duration-1000 ease-couture ${
                    status === 'ready' ? 'opacity-100' : 'opacity-0'
                  } ${imageClassName}`}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

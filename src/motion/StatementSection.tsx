import { motion, useScroll, useTransform } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import { useRef } from 'react'
import type { ReactNode } from 'react'
import { COLOR, EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'
import { TrackingTighten } from './text'

/**
 * The full-bleed palate cleanser.
 *
 * The section inverts as you arrive — background and foreground swap through a
 * scroll-linked colour interpolation rather than hard-cutting — and the
 * oversized line draws its letter-spacing together as it settles.
 */
export function StatementSection({
  eyebrow,
  line,
  emphasis,
  footer,
}: {
  eyebrow: string
  line: string
  emphasis: string
  footer?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const { reduced } = useMotionPreference()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'start 0.28'],
  })

  const background = useTransform(scrollYProgress, [0, 1], [COLOR.bone, COLOR.charcoal])
  const foreground = useTransform(scrollYProgress, [0, 1], [COLOR.charcoal, COLOR.bone])
  const subdued = useTransform(scrollYProgress, [0, 1], [COLOR.warmGray, 'rgb(162, 154, 142)'])
  const rule = useTransform(scrollYProgress, [0.1, 0.9], [0, 1])

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={
          (reduced ? { backgroundColor: COLOR.charcoal } : { backgroundColor: background }) as MotionStyle
        }
      />

      <motion.div
        className="shell relative py-28 md:py-40 lg:py-48"
        style={(reduced ? { color: COLOR.bone } : { color: foreground }) as MotionStyle}
      >
        <div className="flex items-baseline gap-6">
          <motion.span
            className="label shrink-0"
            style={reduced ? undefined : ({ color: subdued } as MotionStyle)}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: EASE.couture }}
          >
            {eyebrow}
          </motion.span>
          <motion.span
            aria-hidden
            className="hidden h-px flex-1 origin-left sm:block"
            style={
              (
                reduced
                  ? { backgroundColor: COLOR.hairline, width: '100%' }
                  : { backgroundColor: subdued, width: '100%', scaleX: rule }
              ) as MotionStyle
            }
          />
        </div>

        <div className="mt-10 md:mt-14">
          <TrackingTighten
            text={line}
            from="0.28em"
            to="-0.035em"
            className="block font-sans text-statement font-medium uppercase"
          />
          <p className="mt-6 max-w-4xl font-display text-display-md italic text-accent md:mt-10">
            <motion.span
              className="inline-block"
              initial={reduced ? false : { opacity: 0, y: 26, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.35, ease: EASE.couture }}
            >
              {emphasis}
            </motion.span>
          </p>
        </div>

        {footer ? <div className="mt-16 md:mt-24">{footer}</div> : null}
      </motion.div>
    </section>
  )
}

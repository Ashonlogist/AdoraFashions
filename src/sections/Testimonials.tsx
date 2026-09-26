import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { testimonials } from '../content'
import { Button } from '../components/Button'
import { DURATION, EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

const DWELL = 8200

export function Testimonials() {
  const { reduced } = useMotionPreference()
  const [[index, direction], setState] = useState<[number, number]>([0, 1])
  const [paused, setPaused] = useState(false)
  const total = testimonials.items.length
  const timer = useRef<number | null>(null)

  const go = useCallback(
    (step: number) => {
      setState(([current]) => [(current + step + total) % total, step])
    },
    [total],
  )

  useEffect(() => {
    if (total < 2 || paused || reduced) return
    timer.current = window.setTimeout(() => go(1), DWELL)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [index, paused, reduced, go, total])

  if (total === 0) return null
  const item = testimonials.items[index]

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="shell">
        <div className="flex items-center gap-5">
          <span className="label text-accent">03</span>
          <span className="label">Kind Words</span>
          <span aria-hidden className="h-px flex-1 bg-hairline" />
        </div>

        <div className="relative mx-auto mt-14 min-h-[19rem] max-w-4xl sm:min-h-[17rem] md:mt-20 md:min-h-[16rem]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.figure
              key={item.id}
              custom={direction}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * 44, clipPath: 'inset(0% 0% 0% 100%)' }
              }
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, x: 0, clipPath: 'inset(0% 0% 0% 0%)' }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * -44, clipPath: 'inset(0% 100% 0% 0%)' }
              }
              transition={{ duration: reduced ? 0.3 : DURATION.slow, ease: EASE.couture }}
              className="text-left md:text-center"
            >
              <span aria-hidden className="mb-9 block text-accent md:mx-auto">
                <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                  <path
                    d="M10.5 0C5 2.6 1.4 7 1.4 12.2 1.4 16.6 3.8 19.4 7.4 19.4c2.9 0 5-2 5-4.7 0-2.6-1.8-4.5-4.3-4.5-.5 0-1 .1-1.2.2C7.4 7.6 9 5.4 11.6 3.7L10.5 0Zm14.1 0c-5.5 2.6-9.1 7-9.1 12.2 0 4.4 2.4 7.2 6 7.2 2.9 0 5-2 5-4.7 0-2.6-1.8-4.5-4.3-4.5-.5 0-1 .1-1.2.2 1.5-2.8 3.1-5 5.7-6.7L24.6 0Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <blockquote className="font-display text-[1.5rem] italic leading-[1.42] tracking-[-0.015em] sm:text-[1.75rem] md:text-[2.125rem] md:leading-[1.35]">
                {item.quote}
              </blockquote>
              <figcaption className="mt-9">
                <span className="block font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em]">
                  {item.name}
                </span>
                {item.detail ? (
                  <span className="mt-2 block text-xs text-warm-gray">{item.detail}</span>
                ) : null}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2" role="tablist" aria-label="Testimonials">
            {testimonials.items.map((entry, entryIndex) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={entryIndex === index}
                aria-label={`Testimonial from ${entry.name}`}
                data-cursor="link"
                onClick={() => {
                  setState([entryIndex, entryIndex > index ? 1 : -1])
                  setPaused(true)
                }}
                className="group relative h-11 w-11"
              >
                <span
                  className={`absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-700 ease-couture ${
                    entryIndex === index
                      ? 'h-2 w-2 bg-accent'
                      : 'h-1.5 w-1.5 bg-charcoal/20 group-hover:bg-charcoal/50'
                  }`}
                />
              </button>
            ))}
          </div>

          {total > 1 ? (
            <div className="flex items-center gap-2">
              <Button variant="quiet" size="sm" arrow={false} onClick={() => go(-1)} cursor="link" className="m-tap">
                <span className="inline-block rotate-180">
                  <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden>
                    <path d="M0 4h20M16.5 0.75 20 4l-3.5 3.25" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </span>
              </Button>
              <Button variant="quiet" size="sm" arrow={false} onClick={() => go(1)} cursor="link" className="m-tap">
                <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden>
                  <path d="M0 4h20M16.5 0.75 20 4l-3.5 3.25" stroke="currentColor" strokeWidth="1" />
                </svg>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

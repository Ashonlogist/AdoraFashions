import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { CollectionItem } from '../content'
import { Button } from './Button'
import { DURATION, EASE } from '../lib/motion'
import { isVideoUrl } from '../lib/media'
import { Media } from './Media'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * The piece expands out of the grid rather than appearing as a separate
 * overlay: the `layoutId` on the image is shared with its card, so Framer morphs
 * the exact box it occupied. The backdrop stays cream instead of charcoal so a
 * dark cutout still reads.
 */
export function Lightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: CollectionItem
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const { reduced } = useMotionPreference()

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onNext()
      if (event.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [onClose, onNext, onPrev])

  const backdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: reduced ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.4, delay: 0.2 } },
    transition: { duration: 0.6, ease: EASE.couture },
  }

  return createPortal(
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label={item.title}>
      <motion.div
        {...backdrop}
        className="absolute inset-0 bg-cream/95"
        style={{ backdropFilter: 'blur(18px)' }}
        onClick={onClose}
      />

      <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain">
        <div className="shell flex items-center justify-between py-6">
          <span className="label">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            data-cursor="link"
            className="group flex items-center gap-3 text-warm-gray transition-colors duration-500 hover:text-charcoal"
            aria-label="Close"
          >
            <span className="label">Close</span>
            <span className="relative block h-4 w-4">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-current" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="shell grid flex-1 items-center gap-10 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <motion.div
            layoutId={`garment-${item.id}`}
            className="relative mx-auto flex aspect-[4/5] w-full min-w-0 max-w-[30rem] items-center justify-center rounded-[2px] bg-cream shadow-inset"
            transition={{ duration: 0.85, ease: EASE.couture }}
          >
            <div className="cutout h-[86%] w-[86%]">
              <Media
                src={item.image}
                alt={item.title}
                /* Opened deliberately, so this one keeps its controls. */
                controls={isVideoUrl(item.image)}
                className="h-full w-full select-none object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            className="min-w-0 max-w-xl"
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: DURATION.slow, delay: reduced ? 0 : 0.28, ease: EASE.couture }}
          >
            <span className="label">{item.category}</span>
            <h2 className="mt-4 font-display text-display-sm">{item.title}</h2>
            {item.fabric ? (
              <p className="mt-3 text-sm italic text-warm-gray">{item.fabric}</p>
            ) : null}
            <span className="mt-8 block h-px w-16 bg-accent" />
            <p className="mt-8 whitespace-pre-line text-[0.9375rem] leading-[1.85] text-charcoal/80">
              {item.caption}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button to="/contact" arrow>
                Enquire about this piece
              </Button>
              {total > 1 ? (
                <div className="flex items-center gap-2">
                  <StepButton onClick={onPrev} label="Previous piece" flip />
                  <StepButton onClick={onNext} label="Next piece" />
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function StepButton({
  onClick,
  label,
  flip = false,
}: {
  onClick: () => void
  label: string
  flip?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-cursor="link"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/20 text-charcoal transition-all duration-500 ease-couture hover:border-charcoal hover:bg-charcoal hover:text-bone"
    >
      <svg
        width="20"
        height="8"
        viewBox="0 0 22 8"
        fill="none"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      >
        <path d="M0 4h20M16.5 0.75 20 4l-3.5 3.25" stroke="currentColor" strokeWidth="1" />
      </svg>
    </button>
  )
}

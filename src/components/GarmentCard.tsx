import { motion } from 'framer-motion'
import { Cutout } from '../motion/Cutout'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'
import type { CollectionItem } from '../content'

const CLIP_FROM_LEFT = 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
const CLIP_FROM_TOP = 'polygon(0% 0%, 0% 0%, 100% 0%, 100% 0%)'
const CLIP_TO = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'

/**
 * A garment on a soft studio backdrop.
 *
 * The reveal is a diagonal clip that unfolds from alternating edges with an
 * 90ms offset per column, so the grid reads as cloth being laid out rather than
 * as boxes fading in. The `layoutId` is what lets the piece expand into the
 * lightbox from exactly where it sits.
 */
export function GarmentCard({
  item,
  index,
  onOpen,
  priority = false,
}: {
  item: CollectionItem
  index: number
  onOpen: () => void
  priority?: boolean
}) {
  const { reduced } = useMotionPreference()
  const fromTop = index % 2 === 1
  const delay = (index % 3) * 0.09

  return (
    <motion.article
      className="group relative"
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.3, delay }}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="view"
        aria-label={`View ${item.title} — ${item.category}`}
        className="block w-full text-left"
      >
        <motion.div
          className="relative aspect-[4/5] overflow-hidden bg-cream shadow-inset"
          initial={
            reduced ? false : { clipPath: fromTop ? CLIP_FROM_TOP : CLIP_FROM_LEFT }
          }
          whileInView={{ clipPath: CLIP_TO }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.05, delay, ease: EASE.couture }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-couture group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(120% 80% at 50% 15%, rgba(250,248,244,0.9) 0%, rgba(245,241,234,0) 62%)',
            }}
          />

          <motion.div
            layoutId={`garment-${item.id}`}
            className="absolute inset-0 flex items-center justify-center p-7 md:p-9"
            transition={{ duration: 0.85, ease: EASE.couture }}
          >
            <motion.div
              className="h-full w-full"
              initial={reduced ? false : { scaleX: 0.9, opacity: 0.4 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.15, delay: delay + 0.12, ease: EASE.couture }}
            >
              <Cutout
                src={item.image}
                alt={item.title}
                entrance="none"
                float={false}
                parallax={false}
                priority={priority}
                className="transition-transform duration-[1200ms] ease-couture group-hover:scale-[1.045]"
                imageClassName="max-h-full"
              />
            </motion.div>
          </motion.div>

          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-[900ms] ease-couture group-hover:scale-x-100" />
        </motion.div>

        <div className="mt-5 flex items-start justify-between gap-4 border-t border-hairline pt-4">
          <div className="min-w-0">
            <h3 className="truncate font-display text-xl leading-tight tracking-[-0.01em] md:text-[1.375rem]">
              {item.title}
            </h3>
            {item.fabric ? (
              <p className="mt-1.5 truncate text-xs text-warm-gray">{item.fabric}</p>
            ) : null}
          </div>
          <span className="label shrink-0 pt-1">{item.category}</span>
        </div>
      </button>
    </motion.article>
  )
}

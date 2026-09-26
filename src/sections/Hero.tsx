import { motion } from 'framer-motion'
import { contact, hero } from '../content'
import { Button } from '../components/Button'
import { RotatingSeal } from '../components/RotatingSeal'
import { Cutout } from '../motion/Cutout'
import { BlockWipe, SplitWords, TrackingLabel } from '../motion/text'
import { DURATION, EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * Signature moment 01 — the runway reveal.
 *
 * Sequenced, not stacked: the seal and label track in first, the serif headline
 * is drawn back like a curtain with its words riding up behind their own masks,
 * then — a beat later — the cutout resolves out of a soft blur, and only then do
 * the words of support and the calls to action arrive.
 */
export function Hero() {
  const { reduced } = useMotionPreference()

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-[calc(var(--nav-h)+3rem)] md:pb-24 md:pt-[calc(var(--nav-h)+5rem)]">
      <div aria-hidden className="absolute inset-0 -z-10 grain" />
      <div
        aria-hidden
        className="absolute -right-[18%] top-[-14%] -z-10 h-[46rem] w-[46rem] rounded-full opacity-[0.55] blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(184,135,90,0.16) 0%, rgba(184,135,90,0) 62%)',
        }}
      />

      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
          {/* ------------------------------------------------------------ */}
          {/* Type column                                                     */}
          {/* ------------------------------------------------------------ */}
          <div className="relative z-10">
            <div className="flex items-center gap-6">
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: DURATION.slow + 0.3, ease: EASE.couture }}
                className="text-accent"
              >
                <RotatingSeal text="Adora Fashions" size={88} className="hidden sm:block" />
              </motion.div>
              <div className="flex flex-col gap-2">
                <TrackingLabel
                  text={hero.label}
                  delay={0.15}
                  className="label text-charcoal/70"
                />
                <motion.span
                  aria-hidden
                  className="block h-px w-full origin-left bg-charcoal/20"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.6, ease: EASE.couture }}
                />
              </div>
            </div>

            <BlockWipe
              as="h1"
              trigger="mount"
              direction="up"
              delay={0.42}
              duration={DURATION.curtain + 0.25}
              className="mt-9 font-display text-display-xl"
            >
              <SplitWords
                text={hero.headline}
                by="word"
                trigger="mount"
                delay={0.5}
                stagger={0.075}
                duration={1.25}
                emphasisLast={2}
                className="text-balance"
              />
            </BlockWipe>

            <motion.div
              className="mt-9 max-w-[30rem]"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 1.15, ease: EASE.couture }}
            >
              <p className="text-[0.9375rem] leading-[1.9] text-warm-gray md:text-base">
                {hero.subheadline}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Button to={hero.ctaLink} size="lg">
                  {hero.ctaText}
                </Button>
                <Button to="/contact" variant="quiet" arrow>
                  Book a consultation
                </Button>
              </div>
            </motion.div>

            <motion.dl
              className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-hairline pt-6"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.1, delay: 1.5, ease: EASE.couture }}
            >
              <div>
                <dt className="label">Atelier</dt>
                <dd className="mt-1.5 font-display text-lg">Accra, Ghana</dd>
              </div>
              <span aria-hidden className="hidden h-8 w-px bg-hairline sm:block" />
              <div>
                <dt className="label">Taking commissions</dt>
                <dd className="mt-1.5 font-display text-lg">Spring / Summer</dd>
              </div>
            </motion.dl>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Cutout column — overlaps the type on large screens            */}
          {/* ------------------------------------------------------------ */}
          <div className="relative -mx-6 lg:mx-0">
            <motion.div
              aria-hidden
              className="absolute -left-10 top-1/2 hidden h-[76%] w-px -translate-y-1/2 bg-hairline lg:block"
              initial={reduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.4, delay: 1.2, ease: EASE.couture }}
            />

            <div className="relative mx-auto aspect-[3/4] w-[86%] max-w-[34rem] sm:w-[78%] lg:ml-auto lg:w-full">
              <Cutout
                src={hero.image}
                alt="A draped evening gown from the Adora Fashions atelier"
                priority
                speed={78}
                rotate={2.8}
                swell={0.055}
                entrance="blur"
                delay={0.95}
                className="h-full w-full"
              />
            </div>

            <motion.p
              className="absolute -bottom-2 left-0 hidden max-w-[9rem] text-xs leading-[1.7] text-warm-gray lg:block"
              initial={reduced ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 1.7, ease: EASE.couture }}
            >
              <span className="label mb-2 block text-accent">No. 04</span>
              Draped crepe, silk lined, drafted over three fittings.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Quiet proof strip, so the fold has something to hold. */}
      <motion.div
        className="shell mt-20 md:mt-28"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.9, ease: EASE.couture }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-y border-hairline py-5">
          <p className="label">Made to measure · never off the rack</p>
          <a
            href={`mailto:${contact.email}`}
            data-cursor="link"
            className="link-draw font-display text-base italic transition-colors duration-500 hover:text-accent"
          >
            {contact.email}
          </a>
        </div>
      </motion.div>
    </section>
  )
}

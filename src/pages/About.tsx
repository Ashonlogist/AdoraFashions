import { motion } from 'framer-motion'
import { about } from '../content'
import { Button } from '../components/Button'
import { philosophyIcons } from '../components/icons'
import { BreakoutFrame } from '../components/BreakoutFrame'
import { Cutout } from '../motion/Cutout'
import { BlockWipe, SplitWords } from '../motion/text'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

export default function About() {
  const { reduced } = useMotionPreference()

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Opening — offset headline against a floating portrait              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative isolate overflow-hidden pb-20 pt-[calc(var(--nav-h)+4rem)] md:pb-28 md:pt-[calc(var(--nav-h)+6rem)]">
        <div
          aria-hidden
          className="absolute -left-[10%] top-[10%] -z-10 h-[38rem] w-[38rem] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(184,135,90,0.14) 0%, rgba(184,135,90,0) 64%)',
          }}
        />

        <div className="shell">
          <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16">
            <div className="relative z-10 lg:pb-16">
              <div className="flex items-center gap-5">
                <span className="label text-accent">{about.kicker}</span>
                <motion.span
                  aria-hidden
                  className="h-px flex-1 origin-left bg-hairline"
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.3, delay: 0.2, ease: EASE.couture }}
                />
              </div>

              <BlockWipe
                as="h1"
                direction="up"
                delay={0.15}
                className="mt-9 font-display text-display-xl"
              >
                <SplitWords
                  text={about.headline}
                  stagger={0.07}
                  duration={1.3}
                  emphasisLast={2}
                  className="text-balance"
                />
              </BlockWipe>

              <motion.div
                className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5"
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.9, ease: EASE.couture }}
              >
                <div>
                  <p className="font-display text-2xl italic">{about.signature}</p>
                  <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-warm-gray">
                    Founder & Lead Designer
                  </p>
                </div>
                <span aria-hidden className="block h-10 w-px bg-hairline" />
                <Button to="/contact" variant="outline">
                  Book a fitting
                </Button>
              </motion.div>
            </div>

            <div className="relative">
              {/* Kept inset on a phone: running this portrait full-bleed pushes the
                  subject 70px clear of the shape, which is a lot of headroom on a
                  375px screen. The hero is the image that earns the full width. */}
              <BreakoutFrame stage="aspect-[4/5] w-[80%] sm:w-[70%] lg:ml-auto lg:w-full">
                <Cutout
                  src={about.portraitImage}
                  alt={`${about.signature}, founder and lead designer`}
                  priority
                  entrance="blur"
                  speed={70}
                  rotate={2.2}
                  swell={0.05}
                  fit="cover"
                />
              </BreakoutFrame>
              <motion.span
                aria-hidden
                className="absolute -bottom-4 right-0 h-28 w-28 border-b border-r border-accent/40 md:-bottom-6 md:h-40 md:w-40"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.1, ease: EASE.couture }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The story                                                            */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell grid gap-12 pb-24 md:pb-32 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:gap-20">
        <div className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <span className="label text-accent">01</span>
          <p className="mt-4 text-xs uppercase leading-[1.9] tracking-[0.16em] text-warm-gray">
            The long version
            <br />
            Accra, since 2016
          </p>
        </div>

        <div className="min-w-0 max-w-prose">
          {about.bioParagraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              className={`text-[1.0625rem] leading-[1.95] text-charcoal/85 md:text-[1.1875rem] ${
                index === 0 ? '' : 'mt-8'
              } ${index === 0 ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[3.5rem] first-letter:leading-[0.8] first-letter:text-accent' : ''}`}
              initial={reduced ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.05, delay: index * 0.08, ease: EASE.couture }}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Pull quote                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden bg-cream py-24 md:py-32">
        <div className="shell">
          <figure className="mx-auto max-w-5xl text-center">
            <motion.span
              aria-hidden
              className="mx-auto mb-10 block h-px w-16 bg-accent"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.1, ease: EASE.couture }}
            />
            <blockquote>
              <span className="sr-only">“</span>
              <BlockWipe direction="left" duration={1.5} className="block">
                <SplitWords
                  text={about.pullQuote}
                  by="word"
                  stagger={0.055}
                  duration={1.15}
                  className="font-display text-display-md italic leading-[1.22] tracking-[-0.02em]"
                />
              </BlockWipe>
            </blockquote>
            {about.pullQuoteAttribution ? (
              <figcaption className="label mt-12 text-warm-gray">
                {about.pullQuoteAttribution}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Method — fabric, fit, finish                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="shell py-24 md:py-32">
        <div className="flex items-center gap-5">
          <span className="label text-accent">02</span>
          <span className="label">How a piece is made</span>
          <motion.span
            aria-hidden
            className="h-px flex-1 origin-left bg-hairline"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.3, ease: EASE.couture }}
          />
        </div>

        <ul className="mt-14 grid gap-px border-t border-hairline bg-hairline md:grid-cols-3">
          {about.philosophy.map((item, index) => {
            const Icon = philosophyIcons[item.icon as keyof typeof philosophyIcons] ?? philosophyIcons.needle
            return (
              <motion.li
                key={item.label}
                className="group relative bg-bone px-2 py-10 md:px-8 md:py-14"
                initial={reduced ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1, delay: index * 0.12, ease: EASE.couture }}
              >
                <span className="flex items-center justify-between">
                  <span className="text-accent">
                    <Icon size={26} />
                  </span>
                  <span className="label text-charcoal/20">0{index + 1}</span>
                </span>
                <h3 className="mt-8 font-display text-2xl tracking-[-0.015em] md:text-[1.75rem]">
                  {item.label}
                </h3>
                <p className="mt-4 text-sm leading-[1.9] text-warm-gray">{item.detail}</p>
                <span className="mt-8 block h-px w-10 origin-left bg-accent/50 transition-transform duration-[900ms] ease-couture group-hover:scale-x-[3.2]" />
              </motion.li>
            )
          })}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Close                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-t border-hairline">
        <div className="shell flex flex-wrap items-center justify-between gap-8 py-16 md:py-20">
          <h2 className="max-w-[18ch] font-display text-display-sm">
            Bring the fabric, or bring an idea.
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button to="/collections">See the work</Button>
            <Button to="/contact" variant="outline">
              Start a commission
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

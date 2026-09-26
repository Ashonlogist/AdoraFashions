import { about } from '../content'
import { Cutout } from '../motion/Cutout'
import { BlockWipe, SplitWords } from '../motion/text'
import { motion } from 'framer-motion'
import { Button } from '../components/Button'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

export function AboutTeaser() {
  const { reduced } = useMotionPreference()
  const stats = [
    { value: about.years, label: 'Years at the cutting table' },
    { value: about.piecesDelivered, label: 'Pieces delivered' },
    { value: about.repeatClients, label: 'Clients who return' },
  ]

  return (
    <section className="relative overflow-hidden bg-cream py-24 md:py-32 lg:py-40">
      <div className="shell">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-20">
          <div className="relative">
            <motion.span
              aria-hidden
              className="absolute -left-4 -top-4 h-24 w-24 border-l border-t border-accent/40 md:-left-8 md:-top-8 md:h-36 md:w-36"
              initial={reduced ? false : { opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, ease: EASE.couture }}
            />
            <div className="relative aspect-[4/5] w-[78%] sm:w-[68%] lg:w-full">
              <Cutout
                src={about.portraitImage}
                alt={`${about.signature}, founder and lead designer`}
                entrance="wipe"
                speed={52}
                rotate={1.8}
                swell={0.04}
                float
                fit="cover"
              />
            </div>
            <motion.div
              className="absolute -bottom-6 right-0 w-[13rem] border border-hairline bg-bone px-5 py-4 md:-bottom-8 md:w-[15rem]"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.35, ease: EASE.couture }}
            >
              <p className="label">Signed</p>
              <p className="mt-2 font-display text-2xl italic">{about.signature}</p>
              <p className="mt-1 text-xs text-warm-gray">Founder & Lead Designer</p>
            </motion.div>
          </div>

          <div className="lg:pl-6">
            <div className="flex items-center gap-5">
              <span className="label text-accent">02</span>
              <span className="label">The Designer</span>
              <motion.span
                aria-hidden
                className="h-px flex-1 origin-left bg-hairline"
                initial={reduced ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 1.3, ease: EASE.couture }}
              />
            </div>

            <BlockWipe as="h2" direction="up" className="mt-8 font-display text-display-lg">
              <SplitWords text={about.headline} stagger={0.07} emphasisLast={2} />
            </BlockWipe>

            <motion.p
              className="mt-8 max-w-[34rem] text-[0.9375rem] leading-[1.95] text-warm-gray"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, ease: EASE.couture }}
            >
              {about.bioParagraphs[0]}
            </motion.p>

            <motion.dl
              className="mt-12 grid grid-cols-3 gap-x-4 border-y border-hairline py-7 md:gap-6"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1, delay: 0.15, ease: EASE.couture }}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  /* Vertical hairlines between the figures, so three narrow
                     columns read as one designed unit instead of a squeezed
                     three-up grid. */
                  className={
                    index > 0 ? 'border-l border-hairline pl-4 md:pl-6' : undefined
                  }
                >
                  <dt className="font-display text-[1.75rem] leading-none tracking-[-0.02em] md:text-[2.5rem]">
                    {stat.value}
                  </dt>
                  <dd className="mt-3 text-[0.625rem] uppercase leading-[1.6] tracking-[0.12em] text-warm-gray md:text-[0.6875rem] md:tracking-[0.14em]">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </motion.dl>

            <div className="mt-10">
              <Button to="/about" variant="outline">
                Read the full story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

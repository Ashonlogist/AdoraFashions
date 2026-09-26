import { useState } from 'react'
import { collections, settings } from '../content'
import { AnimatePresence } from 'framer-motion'
import { Lightbox } from '../components/Lightbox'
import { AboutTeaser } from '../sections/AboutTeaser'
import { ContactBand } from '../sections/ContactBand'
import { FeaturedWork } from '../sections/FeaturedWork'
import { Hero } from '../sections/Hero'
import { Testimonials } from '../sections/Testimonials'
import { Marquee } from '../components/Marquee'
import { StatementSection } from '../motion/StatementSection'

export default function Home() {
  const [openId, setOpenId] = useState<string | null>(null)
  const index = collections.items.findIndex((item) => item.id === openId)
  const open = index >= 0 ? collections.items[index] : null

  return (
    <>
      <Hero />
      <FeaturedWork onOpen={setOpenId} />

      <StatementSection
        eyebrow="The Adora Method — 01"
        line={settings.statementLine}
        emphasis={settings.statementEmphasis}
        footer={
          <div className="border-y border-bone/15">
            <Marquee items={settings.marqueeItems} tone="dark" />
          </div>
        }
      />

      <AboutTeaser />
      <Testimonials />
      <ContactBand />

      <AnimatePresence>
        {open ? (
          <Lightbox
            item={open}
            index={index}
            total={collections.items.length}
            onClose={() => setOpenId(null)}
            onPrev={() =>
              setOpenId(collections.items[(index - 1 + collections.items.length) % collections.items.length].id)
            }
            onNext={() => setOpenId(collections.items[(index + 1) % collections.items.length].id)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

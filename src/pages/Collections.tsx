import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { collections } from '../content'
import { Button } from '../components/Button'
import { GarmentCard } from '../components/GarmentCard'
import { Lightbox } from '../components/Lightbox'
import { SectionHeading, TextLink } from '../components/SectionHeading'
import { EASE } from '../lib/motion'

export default function Collections() {
  const [filter, setFilter] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = collections.items.filter(
    (item) => filter === 'All' || item.category === filter,
  )
  const index = collections.items.findIndex((item) => item.id === openId)
  const open = index >= 0 ? collections.items[index] : null
  const categories = ['All', ...collections.categories]

  return (
    <>
      <header className="shell pb-16 pt-[calc(var(--nav-h)+4rem)] md:pb-20 md:pt-[calc(var(--nav-h)+6rem)]">
        <SectionHeading
          index="01"
          as="h1"
          eyebrow="Collections & Works"
          headline="Everything made in this room."
          lede="Not a shop — a rail. Each piece below was drafted for one client, then photographed before it left the atelier. Browse by category, or open any piece to read how it was built."
        />

        <div className="m-scroll-x m-bleed-r mt-14 flex items-center gap-x-8 gap-y-4 border-y border-hairline py-5">
          {categories.map((category) => {
            const active = category === filter
            const count =
              category === 'All'
                ? collections.items.length
                : collections.items.filter((item) => item.category === category).length
            return (
              <button
                key={category}
                type="button"
                data-cursor="link"
                onClick={() => setFilter(category)}
                aria-pressed={active}
                className="group relative flex min-h-[2.75rem] items-baseline gap-2 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-colors duration-500"
              >
                <span className={active ? 'text-charcoal' : 'text-warm-gray group-hover:text-charcoal'}>
                  {category}
                </span>
                <span
                  className={`text-[0.5625rem] tabular-nums transition-colors duration-500 ${
                    active ? 'text-accent' : 'text-charcoal/25'
                  }`}
                >
                  {String(count).padStart(2, '0')}
                </span>
                <span
                  aria-hidden
                  className={`absolute -bottom-2 left-0 h-px w-full origin-left bg-accent transition-transform duration-700 ease-couture ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </header>

      <section className="shell pb-28 md:pb-36">
        {visible.length > 0 ? (
          <motion.div
            key={filter}
            className="m-rail m-rail-peek m-bleed-r grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE.couture }}
          >
            {visible.map((item, position) => (
              <GarmentCard
                key={item.id}
                item={item}
                index={position}
                priority={position < 3}
                onOpen={() => setOpenId(item.id)}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState category={filter} onReset={() => setFilter('All')} />
        )}
      </section>

      <div className="shell pb-24">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-hairline pt-8">
          <p className="text-sm text-warm-gray">
            Every commission begins with a conversation. Nothing here is for sale.
          </p>
          <TextLink to="/contact">Start a commission</TextLink>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <Lightbox
            item={open}
            index={index}
            total={collections.items.length}
            onClose={() => setOpenId(null)}
            onPrev={() =>
              setOpenId(
                collections.items[(index - 1 + collections.items.length) % collections.items.length]
                  .id,
              )
            }
            onNext={() => setOpenId(collections.items[(index + 1) % collections.items.length].id)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

function EmptyState({ category, onReset }: { category: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-hairline px-6 py-24 text-center">
      <span className="label text-accent">Nothing on the rail</span>
      <h2 className="mt-6 max-w-[20ch] font-display text-display-sm">
        There is no {category.toLowerCase()} work published yet.
      </h2>
      <p className="mt-5 max-w-[34rem] text-sm leading-[1.9] text-warm-gray">
        Pieces are added to the rail as they come off the finishing table. In the meantime, tell the
        atelier what you are imagining — most commissions begin before anything is photographed.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Button to="/contact">Enquire about {category.toLowerCase()}</Button>
        <Button variant="quiet" arrow={false} onClick={onReset}>
          Show all work
        </Button>
      </div>
    </div>
  )
}

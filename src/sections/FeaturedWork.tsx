import { useState } from 'react'
import { collections } from '../content'
import { GarmentCard } from '../components/GarmentCard'
import { SectionHeading, TextLink } from '../components/SectionHeading'

export function FeaturedWork({ onOpen }: { onOpen: (id: string) => void }) {
  const [shown, setShown] = useState(6)
  const items = collections.items.slice(0, shown)

  return (
    <section id="work" className="shell py-24 md:py-32 lg:py-40">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          index="01"
          eyebrow="Selected Work"
          headline="Pieces from the atelier."
          lede="A working rail of commissions from the current season — bridal, traditional, evening and the quiet essentials. Every one drafted on the body."
          className="max-w-3xl"
        />
        <TextLink to="/collections">All collections</TextLink>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 md:mt-20 lg:grid-cols-3 lg:gap-x-10">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={index % 3 === 1 ? 'lg:mt-16' : index % 3 === 2 ? 'lg:mt-8' : ''}
          >
            <GarmentCard
              item={item}
              index={index}
              priority={index < 3}
              onOpen={() => onOpen(item.id)}
            />
          </div>
        ))}
      </div>

      {shown < collections.items.length ? (
        <div className="mt-20 flex justify-center">
          <button
            type="button"
            data-cursor="link"
            onClick={() => setShown((value) => value + 3)}
            className="link-draw font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-500 hover:text-charcoal"
          >
            Show more work
          </button>
        </div>
      ) : null}
    </section>
  )
}

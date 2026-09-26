import { useState } from 'react'
import type {
  AboutContent,
  CollectionItem,
  CollectionsContent,
  ContactContent,
  HeroContent,
  SettingsContent,
  TestimonialsContent,
  Testimonial,
} from '../content/types'
import { CheckIcon, PlusIcon } from '../components/icons'
import { Field, ImageField, Repeatable, Segmented, slotFromPath, TextArea, TextInput } from './ui'

type EditorProps<T> = { value: T; onChange: (value: T) => void }

/* -------------------------------------------------------------------------- */
/*  Slugs + ids                                                                */
/* -------------------------------------------------------------------------- */

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function nextId(items: { id: string }[], prefix: string) {
  const highest = items.reduce((max, item) => {
    const match = item.id.match(/(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `${prefix}-${String(highest + 1).padStart(3, '0')}`
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export function HeroEditor({ value, onChange }: EditorProps<HeroContent>) {
  const set = <K extends keyof HeroContent>(key: K, next: HeroContent[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-5">
      <Field label="Small label" hint="The short line above the headline, e.g. “Spring / Summer Atelier”.">
        <TextInput value={value.label} onChange={(next) => set('label', next)} />
      </Field>
      <Field label="Headline" hint="Keep it to one or two lines. Line breaks are respected.">
        <TextArea value={value.headline} onChange={(next) => set('headline', next)} rows={2} />
      </Field>
      <Field label="Subheadline" hint="One or two calm sentences describing the work.">
        <TextArea value={value.subheadline} onChange={(next) => set('subheadline', next)} rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Button text">
          <TextInput value={value.ctaText} onChange={(next) => set('ctaText', next)} />
        </Field>
        <Field label="Button link" hint="A path on this site, e.g. /collections or /contact.">
          <TextInput value={value.ctaLink} onChange={(next) => set('ctaLink', next)} />
        </Field>
      </div>
      <ImageField
        label="Hero image"
        slot="hero-main"
        value={value.image}
        onChange={(next) => set('image', next)}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  About                                                                      */
/* -------------------------------------------------------------------------- */

export function AboutEditor({ value, onChange }: EditorProps<AboutContent>) {
  const set = <K extends keyof AboutContent>(key: K, next: AboutContent[K]) =>
    onChange({ ...value, [key]: next })

  function updateParagraph(index: number, text: string) {
    set(
      'bioParagraphs',
      value.bioParagraphs.map((paragraph, i) => (i === index ? text : paragraph)),
    )
  }

  return (
    <div className="space-y-5">
      <ImageField
        label="Portrait"
        slot="about-portrait"
        value={value.portraitImage}
        onChange={(next) => set('portraitImage', next)}
      />
      <Field label="Kicker">
        <TextInput value={value.kicker} onChange={(next) => set('kicker', next)} />
      </Field>
      <Field label="Headline">
        <TextArea value={value.headline} onChange={(next) => set('headline', next)} rows={2} />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <span className="label text-charcoal/70">Story paragraphs</span>
          <button
            type="button"
            onClick={() => set('bioParagraphs', [...value.bioParagraphs, ''])}
            className="flex items-center gap-1.5 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
          >
            <PlusIcon size={13} /> Add paragraph
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {value.bioParagraphs.map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <TextArea
                value={paragraph}
                onChange={(next) => updateParagraph(index, next)}
                rows={4}
              />
              <button
                type="button"
                aria-label="Remove paragraph"
                disabled={value.bioParagraphs.length <= 1}
                onClick={() =>
                  set(
                    'bioParagraphs',
                    value.bioParagraphs.filter((_, i) => i !== index),
                  )
                }
                className="shrink-0 self-start border border-hairline px-3 font-sans text-xs text-warm-gray transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Pull quote">
        <TextArea value={value.pullQuote} onChange={(next) => set('pullQuote', next)} rows={3} />
      </Field>
      <Field label="Pull quote attribution">
        <TextInput value={value.pullQuoteAttribution} onChange={(next) => set('pullQuoteAttribution', next)} />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <span className="label text-charcoal/70">What guides the work</span>
          <button
            type="button"
            onClick={() =>
              set('philosophy', [...value.philosophy, { icon: 'spark', label: '', detail: '' }])
            }
            className="flex items-center gap-1.5 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-accent transition-opacity hover:opacity-70"
          >
            <PlusIcon size={13} /> Add principle
          </button>
        </div>
        <div className="mt-2 space-y-3">
          {value.philosophy.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 border border-hairline bg-cream/60 p-4 sm:grid-cols-[10rem_1fr_1fr_auto]"
            >
              <div>
                <span className="label text-warm-gray">Icon key</span>
                <TextInput
                  value={item.icon}
                  onChange={(next) =>
                    set(
                      'philosophy',
                      value.philosophy.map((entry, i) =>
                        i === index ? { ...entry, icon: next } : entry,
                      ),
                    )
                  }
                />
              </div>
              <div>
                <span className="label text-warm-gray">Label</span>
                <TextInput
                  value={item.label}
                  onChange={(next) =>
                    set(
                      'philosophy',
                      value.philosophy.map((entry, i) =>
                        i === index ? { ...entry, label: next } : entry,
                      ),
                    )
                  }
                />
              </div>
              <div>
                <span className="label text-warm-gray">Detail</span>
                <TextInput
                  value={item.detail}
                  onChange={(next) =>
                    set(
                      'philosophy',
                      value.philosophy.map((entry, i) =>
                        i === index ? { ...entry, detail: next } : entry,
                      ),
                    )
                  }
                />
              </div>
              <button
                type="button"
                aria-label="Remove principle"
                onClick={() =>
                  set(
                    'philosophy',
                    value.philosophy.filter((_, i) => i !== index),
                  )
                }
                className="self-end px-2 pb-3 font-sans text-xs text-warm-gray transition-colors hover:text-accent"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-warm-gray">
          Icon keys in use: <code className="text-charcoal/80">{value.philosophy.map((i) => i.icon).join(', ') || 'none'}</code>
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Signature">
          <TextInput value={value.signature} onChange={(next) => set('signature', next)} />
        </Field>
        <Field label="Years">
          <TextInput value={value.years} onChange={(next) => set('years', next)} />
        </Field>
        <Field label="Pieces delivered">
          <TextInput value={value.piecesDelivered} onChange={(next) => set('piecesDelivered', next)} />
        </Field>
      </div>
      <Field label="Repeat clients">
        <TextInput value={value.repeatClients} onChange={(next) => set('repeatClients', next)} />
      </Field>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Collections                                                                */
/* -------------------------------------------------------------------------- */

const NEW_CATEGORY = '__new__'

export function CollectionsEditor({ value, onChange }: EditorProps<CollectionsContent>) {
  const [newCategory, setNewCategory] = useState<string | null>(null)

  const usedSlots = new Set(value.items.map((item) => slotFromPath(item.image)))

  function uniqueSlot(title: string) {
    const base = slugify(title) || 'piece'
    let slot = `collection-${base}`
    let n = 2
    while (usedSlots.has(slot)) slot = `collection-${base}-${n++}`
    return slot
  }

  function newItem(): CollectionItem {
    return {
      id: nextId(value.items, 'c'),
      title: 'New piece',
      category: value.categories[0] ?? 'Bridal',
      caption: '',
      image: `/images/${uniqueSlot('new-piece')}.webp`,
      fabric: '',
    }
  }

  function commitCategory(raw: string, itemId: string) {
    if (raw === NEW_CATEGORY) {
      setNewCategory(itemId)
      return
    }
    onChange({
      ...value,
      items: value.items.map((item) => (item.id === itemId ? { ...item, category: raw } : item)),
    })
  }

  function createCategory(itemId: string) {
    const label = (newCategory ?? '').trim()
    if (!label) {
      setNewCategory(null)
      return
    }
    onChange({
      categories: value.categories.includes(label)
        ? value.categories
        : [...value.categories, label],
      items: value.items.map((item) => (item.id === itemId ? { ...item, category: label } : item)),
    })
    setNewCategory(null)
  }

  return (
    <div className="space-y-6">
      <Field
        label="Categories"
        hint="These become the filter buttons on the Collections page, in this order. Add a new one below or straight from a piece."
      >
        <div className="flex flex-wrap gap-2">
          {value.categories.map((category) => (
            <span
              key={category}
              className="flex items-center gap-2 border border-hairline bg-cream px-3 py-2 font-sans text-xs text-charcoal"
            >
              {category}
              <button
                type="button"
                aria-label={`Remove ${category}`}
                disabled={value.items.some((item) => item.category === category)}
                title={
                  value.items.some((item) => item.category === category)
                    ? 'Move or delete the pieces in this category first.'
                    : undefined
                }
                onClick={() =>
                  onChange({ ...value, categories: value.categories.filter((c) => c !== category) })
                }
                className="text-warm-gray transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            placeholder="New category"
            className="w-48 border border-hairline bg-cream px-4 py-3 text-sm focus:border-accent focus:outline-none"
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              const label = event.currentTarget.value.trim()
              if (label && !value.categories.includes(label)) {
                onChange({ ...value, categories: [...value.categories, label] })
                event.currentTarget.value = ''
              }
            }}
          />
          <span className="self-center text-xs text-warm-gray">Press Enter to add.</span>
        </div>
      </Field>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="label text-charcoal/70">
            Pieces ({value.items.length})
          </span>
          <span className="text-xs text-warm-gray">Drag to reorder, or use the arrows.</span>
        </div>
        <Repeatable
          items={value.items}
          onChange={(items) => onChange({ ...value, items })}
          create={newItem}
          addLabel="+ Add a piece"
          title={(item) => item.title || 'Untitled piece'}
          render={(item, update) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title">
                  <TextInput value={item.title} onChange={(title) => update({ title })} />
                </Field>
                <Field label="Category">
                  {newCategory === item.id ? (
                    <div className="flex gap-2">
                      <TextInput
                        value={newCategory}
                        onChange={(next) => setNewCategory(next)}
                        placeholder="Type a new category"
                      />
                      <button
                        type="button"
                        onClick={() => createCategory(item.id)}
                        className="shrink-0 bg-charcoal px-4 font-sans text-[0.625rem] uppercase tracking-[0.15em] text-bone"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={item.category}
                      onChange={(event) => commitCategory(event.target.value, item.id)}
                      className="w-full appearance-none border border-hairline bg-cream px-4 py-3 text-sm text-charcoal focus:border-accent focus:outline-none"
                    >
                      {value.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      {!value.categories.includes(item.category) ? (
                        <option value={item.category}>{item.category} (current)</option>
                      ) : null}
                      <option value={NEW_CATEGORY}>+ Add a new category…</option>
                    </select>
                  )}
                </Field>
              </div>
              <Field label="Caption" hint="One short line describing the piece.">
                <TextInput value={item.caption} onChange={(caption) => update({ caption })} />
              </Field>
              <Field label="Fabric note">
                <TextInput value={item.fabric} onChange={(fabric) => update({ fabric })} />
              </Field>
              <ImageField
                label="Piece image"
                slot={slotFromPath(item.image) || uniqueSlot(item.title)}
                value={item.image}
                onChange={(image) => update({ image })}
              />
            </>
          )}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export function TestimonialsEditor({ value, onChange }: EditorProps<TestimonialsContent>) {
  return (
    <Repeatable
      items={value.items}
      onChange={(items) => onChange({ items })}
      addLabel="+ Add a testimonial"
      title={(item) => item.name || 'New testimonial'}
      create={(): Testimonial => ({
        id: nextId(value.items, 't'),
        quote: '',
        name: '',
        detail: '',
      })}
      render={(item, update) => (
        <>
          <Field label="Quote">
            <TextArea value={item.quote} onChange={(quote) => update({ quote })} rows={3} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <TextInput value={item.name} onChange={(name) => update({ name })} />
            </Field>
            <Field label="Detail" hint="e.g. Bride, Osu — Spring 2026">
              <TextInput value={item.detail} onChange={(detail) => update({ detail })} />
            </Field>
          </div>
        </>
      )}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Contact                                                                    */
/* -------------------------------------------------------------------------- */

export function ContactEditor({ value, onChange }: EditorProps<ContactContent>) {
  const set = <K extends keyof ContactContent>(key: K, next: ContactContent[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-5">
      <Field label="Intro paragraph">
        <TextArea value={value.intro} onChange={(next) => set('intro', next)} rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" hint="Include the country code, e.g. +233 55 000 1234.">
          <TextInput value={value.phone} onChange={(next) => set('phone', next)} />
        </Field>
        <Field label="WhatsApp" hint="Leave empty to hide the WhatsApp button.">
          <TextInput value={value.whatsapp} onChange={(next) => set('whatsapp', next)} />
        </Field>
        <Field label="Email">
          <TextInput value={value.email} onChange={(next) => set('email', next)} type="email" />
        </Field>
        <Field label="Instagram handle">
          <TextInput value={value.instagram} onChange={(next) => set('instagram', next)} />
        </Field>
      </div>
      <Field label="Location">
        <TextInput value={value.location} onChange={(next) => set('location', next)} />
      </Field>
      <Field label="Opening hours">
        <TextInput value={value.hours} onChange={(next) => set('hours', next)} />
      </Field>
      <Field
        label="Map embed URL"
        hint="In Google Maps choose Share → Embed a map and paste only the src URL (https://www.google.com/maps/embed?…). Leave empty to hide the map."
      >
        <TextArea value={value.mapEmbedUrl} onChange={(next) => set('mapEmbedUrl', next)} rows={3} />
      </Field>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Site settings                                                              */
/* -------------------------------------------------------------------------- */

const ACCENTS: { value: SettingsContent['accentColor']; label: string; hex: string }[] = [
  { value: 'terracotta', label: 'Terracotta', hex: '#B8875A' },
  { value: 'gold', label: 'Antique gold', hex: '#C69A3A' },
  { value: 'charcoal', label: 'Charcoal', hex: '#1C1A17' },
]

export function SettingsEditor({ value, onChange }: EditorProps<SettingsContent>) {
  const set = <K extends keyof SettingsContent>(key: K, next: SettingsContent[K]) =>
    onChange({ ...value, [key]: next })

  return (
    <div className="space-y-5">
      <Field label="Accent colour" hint="Three presets, all taken from the brand palette.">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((accent) => (
            <button
              key={accent.value}
              type="button"
              onClick={() => set('accentColor', accent.value)}
              className={`flex items-center gap-3 border px-4 py-3 font-sans text-xs transition-colors duration-300 ${
                value.accentColor === accent.value
                  ? 'border-accent bg-cream text-charcoal'
                  : 'border-hairline text-warm-gray hover:border-charcoal/30'
              }`}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: accent.hex }}
                aria-hidden
              />
              {accent.label}
              {value.accentColor === accent.value ? <CheckIcon size={14} /> : null}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Statement line" hint="The large line in the middle of the home page.">
        <TextInput value={value.statementLine} onChange={(next) => set('statementLine', next)} />
      </Field>
      <Field label="Statement emphasis" hint="The second line that tightens its spacing on scroll.">
        <TextInput value={value.statementEmphasis} onChange={(next) => set('statementEmphasis', next)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Contact band headline">
          <TextInput value={value.bandHeadline} onChange={(next) => set('bandHeadline', next)} />
        </Field>
        <Field label="Contact band text">
          <TextArea value={value.bandLede} onChange={(next) => set('bandLede', next)} rows={2} />
        </Field>
      </div>
      <Field label="Marquee items" hint="One per line — the strip that scrolls beneath the collections.">
        <TextArea
          value={value.marqueeItems.join('\n')}
          onChange={(next) =>
            set(
              'marqueeItems',
              next.split('\n').map((line) => line.trim()).filter(Boolean),
            )
          }
          rows={5}
        />
      </Field>
      <Field label="Footer copyright">
        <TextArea value={value.footerCopyright} onChange={(next) => set('footerCopyright', next)} rows={2} />
      </Field>
    </div>
  )
}

export { Segmented }

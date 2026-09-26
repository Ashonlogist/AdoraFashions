import type {
  AboutContent,
  CollectionsContent,
  ContactContent,
  HeroContent,
  SectionName,
  SettingsContent,
  TestimonialsContent,
} from './types'

/**
 * Content is authored as plain JSON in `/content/*.json` at the repo root and
 * bundled at build time. Because every admin save is a real commit to `main`,
 * Vercel rebuilds and the new copy ships with it — that is the whole
 * "save = live in about a minute" contract, with no database involved.
 */
const modules = import.meta.glob<Record<string, unknown>>('../../content/*.json', {
  eager: true,
  import: 'default',
})

function read<T>(section: SectionName): T {
  const match = Object.entries(modules).find(([path]) => path.endsWith(`/content/${section}.json`))
  if (!match) throw new Error(`[adorafashions] Missing content file for section "${section}"`)
  return match[1] as T
}

export const hero = read<HeroContent>('hero')
export const about = read<AboutContent>('about')
export const collections = read<CollectionsContent>('collections')
export const testimonials = read<TestimonialsContent>('testimonials')
export const contact = read<ContactContent>('contact')
export const settings = read<SettingsContent>('settings')

export const content = { hero, about, collections, testimonials, contact, settings } as const

export const sectionNames: SectionName[] = [
  'hero',
  'about',
  'collections',
  'testimonials',
  'contact',
  'settings',
]

export type { SectionName }
export * from './types'

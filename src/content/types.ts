export type HeroContent = {
  label: string
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
  image: string
}

export type PhilosophyItem = {
  icon: string
  label: string
  detail: string
}

export type AboutContent = {
  portraitImage: string
  kicker: string
  headline: string
  bioParagraphs: string[]
  pullQuote: string
  pullQuoteAttribution: string
  philosophy: PhilosophyItem[]
  signature: string
  years: string
  piecesDelivered: string
  repeatClients: string
}

export type CollectionItem = {
  id: string
  title: string
  category: string
  caption: string
  image: string
  fabric: string
}

export type CollectionsContent = {
  categories: string[]
  items: CollectionItem[]
}

export type Testimonial = {
  id: string
  quote: string
  name: string
  detail: string
}

export type TestimonialsContent = {
  items: Testimonial[]
}

export type ContactContent = {
  phone: string
  whatsapp: string
  email: string
  instagram: string
  location: string
  mapEmbedUrl: string
  hours: string
  intro: string
}

export type SettingsContent = {
  accentColor: 'terracotta' | 'gold' | 'charcoal'
  footerCopyright: string
  footerBlurb: string
  footerLocation: string
  statementLine: string
  statementEmphasis: string
  bandHeadline: string
  bandLede: string
  marqueeItems: string[]
}

export type SectionName =
  | 'hero'
  | 'about'
  | 'collections'
  | 'testimonials'
  | 'contact'
  | 'settings'

export type ContentShape = {
  hero: HeroContent
  about: AboutContent
  collections: CollectionsContent
  testimonials: TestimonialsContent
  contact: ContactContent
  settings: SettingsContent
}

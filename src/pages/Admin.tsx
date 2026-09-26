import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../admin/api'
import type { SaveState } from '../admin/api'
import {
  AboutEditor,
  CollectionsEditor,
  ContactEditor,
  HeroEditor,
  SettingsEditor,
  TestimonialsEditor,
} from '../admin/sections'
import { SaveBar, Toast, useToast } from '../admin/ui'
import { AlertIcon, LogoutIcon } from '../components/icons'
import type { ContentShape, SectionName } from '../content/types'

type Drafts = { [K in SectionName]: ContentShape[K] }

const SECTIONS: {
  name: SectionName
  label: string
  blurb: string
  file: string
}[] = [
  { name: 'hero', label: 'Hero', blurb: 'The first thing anyone sees.', file: 'content/hero.json' },
  { name: 'about', label: 'About', blurb: 'Your story, quote and principles.', file: 'content/about.json' },
  {
    name: 'collections',
    label: 'Collections',
    blurb: 'Pieces, categories and their photography.',
    file: 'content/collections.json',
  },
  {
    name: 'testimonials',
    label: 'Testimonials',
    blurb: 'What clients say after wearing the work.',
    file: 'content/testimonials.json',
  },
  { name: 'contact', label: 'Contact info', blurb: 'How people reach the atelier.', file: 'content/contact.json' },
  { name: 'settings', label: 'Site settings', blurb: 'Accent, statement, marquee, footer.', file: 'content/settings.json' },
]

function Skeleton() {
  return (
    <div className="grid min-h-screen place-items-center bg-bone">
      <p className="label animate-pulse text-warm-gray">Loading your content…</p>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const { toast, show } = useToast()

  const [section, setSection] = useState<SectionName>('hero')
  const [drafts, setDrafts] = useState<Drafts | null>(null)
  const [branch, setBranch] = useState('')
  const [saved, setSaved] = useState<Drafts | null>(null)
  const [state, setState] = useState<SaveState>('idle')
  const [fatal, setFatal] = useState('')

  useEffect(() => {
    let active = true

    adminApi
      .session()
      .then((result) => {
        if (!active) return
        if (result.authenticated) return
        navigate('/admin/login', { replace: true })
      })
      .catch(() => navigate('/admin/login', { replace: true }))

    adminApi
      .content()
      .then((result) => {
        if (!active) return
        const content = result.content as unknown as Drafts
        setBranch(result.branch)
        setDrafts(content)
        setSaved(content)
      })
      .catch((error) => {
        if (active) setFatal((error as Error).message)
      })

    return () => {
      active = false
    }
  }, [navigate])

  const update = useCallback(
    <K extends SectionName>(name: K, value: ContentShape[K]) => {
      setDrafts((current) => (current ? { ...current, [name]: value } : current))
    },
    [],
  )

  async function save() {
    if (!drafts || !saved) return
    const next = drafts[section]
    if (JSON.stringify(next) === JSON.stringify(saved[section])) return

    setState('saving')
    try {
      const result = await adminApi.save(section, next)
      setBranch(result.branch)
      setSaved({ ...saved, [section]: next })
      setState('saved')
      show(`Saved — live in about 1–2 minutes.`)
      window.setTimeout(() => setState('idle'), 2400)
    } catch (error) {
      setState('error')
      show((error as Error).message, 'error')
    }
  }

  async function signOut() {
    try {
      await adminApi.logout()
    } finally {
      navigate('/admin/login', { replace: true })
    }
  }

  // Warn before losing unsaved edits.
  useEffect(() => {
    if (!drafts || !saved) return
    const dirty = SECTIONS.some(
      (entry) => JSON.stringify(drafts[entry.name]) !== JSON.stringify(saved[entry.name]),
    )
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [drafts, saved])

  if (fatal && !drafts) {
    return (
      <section className="grid min-h-screen place-items-center bg-bone px-6">
        <div className="max-w-md text-center">
          <span className="label text-accent">Adora Fashions</span>
          <h1 className="mt-6 font-display text-display-sm">The dashboard could not load</h1>
          <p className="mt-4 text-sm leading-[1.8] text-warm-gray">{fatal}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 bg-charcoal px-7 py-3 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-bone"
          >
            Try again
          </button>
        </div>
      </section>
    )
  }

  if (!drafts || !saved) return <Skeleton />

  const current = SECTIONS.find((entry) => entry.name === section)!
  const dirty = JSON.stringify(drafts[section]) !== JSON.stringify(saved[section])
  const anywhereDirty = SECTIONS.some(
    (entry) => JSON.stringify(drafts[entry.name]) !== JSON.stringify(saved[entry.name]),
  )

  return (
    <div className="min-h-screen bg-bone">
      <header className="sticky top-0 z-30 border-b border-hairline bg-bone/95 backdrop-blur">
        <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-6 px-5 py-4 lg:px-10">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-lg">Adora Fashions</span>
            <span className="label hidden text-warm-gray sm:inline">Atelier dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            {branch ? (
              <span className="hidden font-sans text-[0.625rem] uppercase tracking-[0.15em] text-warm-gray sm:inline">
                {branch}
                {anywhereDirty ? ' · unsaved' : ''}
              </span>
            ) : null}
            <a
              href="/"
              className="font-sans text-[0.625rem] uppercase tracking-[0.15em] text-warm-gray transition-colors hover:text-charcoal"
            >
              View site
            </a>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 font-sans text-[0.625rem] uppercase tracking-[0.15em] text-warm-gray transition-colors hover:text-charcoal"
            >
              <LogoutIcon size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[100rem] gap-0 lg:grid-cols-[19rem_1fr]">
        <nav
          aria-label="Content sections"
          className="flex gap-1 overflow-x-auto border-b border-hairline px-5 py-3 lg:sticky lg:top-[4.25rem] lg:h-[calc(100vh-4.25rem)] lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-8 lg:py-10"
        >
          {SECTIONS.map((entry) => {
            const entryDirty =
              JSON.stringify(drafts[entry.name]) !== JSON.stringify(saved[entry.name])
            const active = entry.name === section
            return (
              <button
                key={entry.name}
                type="button"
                onClick={() => setSection(entry.name)}
                aria-current={active ? 'true' : undefined}
                className={`group flex shrink-0 flex-col items-start gap-1 border px-4 py-3.5 text-left transition-colors duration-300 lg:w-full ${
                  active
                    ? 'border-hairline bg-cream'
                    : 'border-transparent hover:border-hairline/70 hover:bg-cream/60'
                }`}
              >
                <span className="flex w-full items-center gap-2">
                  <span
                    className={`font-display text-base ${active ? 'text-charcoal' : 'text-charcoal/70'}`}
                  >
                    {entry.label}
                  </span>
                  {entryDirty ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" title="Unsaved changes" />
                  ) : null}
                </span>
                <span className="hidden text-xs leading-[1.6] text-warm-gray lg:block">{entry.blurb}</span>
              </button>
            )
          })}
        </nav>

        <main className="min-w-0 px-5 py-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-3xl">
            <p className="label text-accent">{current.file}</p>
            <h1 className="mt-4 font-display text-display-sm">{current.label}</h1>
            <p className="mt-3 text-sm leading-[1.8] text-warm-gray">{current.blurb}</p>

            {fatal ? (
              <p className="mt-6 flex items-start gap-2 border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-[1.7]">
                <span className="mt-0.5 shrink-0 text-accent">
                  <AlertIcon size={14} />
                </span>
                {fatal}
              </p>
            ) : null}

            <div className="mt-9">
              {section === 'hero' ? (
                <HeroEditor
                  value={drafts.hero}
                  onChange={(value) => update('hero', value)}
                />
              ) : null}
              {section === 'about' ? (
                <AboutEditor
                  value={drafts.about}
                  onChange={(value) => update('about', value)}
                />
              ) : null}
              {section === 'collections' ? (
                <CollectionsEditor
                  value={drafts.collections}
                  onChange={(value) => update('collections', value)}
                />
              ) : null}
              {section === 'testimonials' ? (
                <TestimonialsEditor
                  value={drafts.testimonials}
                  onChange={(value) => update('testimonials', value)}
                />
              ) : null}
              {section === 'contact' ? (
                <ContactEditor
                  value={drafts.contact}
                  onChange={(value) => update('contact', value)}
                />
              ) : null}
              {section === 'settings' ? (
                <SettingsEditor
                  value={drafts.settings}
                  onChange={(value) => update('settings', value)}
                />
              ) : null}
            </div>

            <SaveBar state={state} onSave={save} dirty={dirty} branch={branch} />
          </div>
        </main>
      </div>

      <Toast message={toast?.message ?? ''} tone={toast?.tone ?? 'success'} />
    </div>
  )
}

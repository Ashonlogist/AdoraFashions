import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertIcon, CheckIcon, LinkIcon, TrashIcon, UploadIcon } from '../components/icons'
import { isEmbedUrl } from '../lib/media'
import { Media } from '../components/Media'
import { adminApi, formatBytes } from './api'
import type { SaveState } from './api'

/* -------------------------------------------------------------------------- */
/*  Form primitives                                                            */
/* -------------------------------------------------------------------------- */

const control =
  'w-full border border-hairline bg-cream px-4 py-3 text-sm text-charcoal transition-colors duration-300 placeholder:text-warm-gray/60 focus:border-accent focus:outline-none focus:ring-0'

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string
  hint?: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label block text-charcoal/70">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs leading-[1.7] text-warm-gray">{hint}</p> : null}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  id,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  type?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={control}
    />
  )
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  id,
}: {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  id?: string
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`${control} resize-y leading-[1.7]`}
    />
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: ReactNode }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex border border-hairline bg-cream p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-2 px-3.5 py-2 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${
            value === option.value
              ? 'bg-charcoal text-bone'
              : 'text-warm-gray hover:text-charcoal'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Image field — upload or link, decided by the person doing the editing      */
/* -------------------------------------------------------------------------- */

const UPLOAD_HINT =
  'For best results, upload a transparent PNG with the background removed (use Canva’s Background Remover or remove.bg, then export as PNG). This keeps every photo looking clean and consistent across the site.'
const LINK_HINT =
  'Paste a direct media URL. An image (.jpg, .png, .webp) is used as-is. A video file (.mp4, .webm, .mov) plays on its own, muted and looping, and is held still for anyone who prefers reduced motion. Social share links — an Instagram reel, YouTube, TikTok — cannot be played this way; download the file and paste its direct link instead.'

/** Pulls the slot out of any image path, whatever the extension. */
export function slotFromPath(value: string, fallback = ''): string {
  const file = value.split('/').pop() ?? ''
  return file.replace(/\.\w+$/, '') || fallback
}

export function ImageField({
  label,
  slot,
  value,
  onChange,
  hint,
}: {
  label: string
  /** Generated, never typed: the filename on GitHub is derived from this. */
  slot: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  const [mode, setMode] = useState<'upload' | 'link'>(value.startsWith('http') ? 'link' : 'upload')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  async function onFile(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const result = await adminApi.upload(slot, file)
      onChange(result.publicPath)
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const isExternal = value.startsWith('http')

  return (
    <div className="border border-hairline bg-cream/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="label text-charcoal/70">{label}</span>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'upload', label: 'Upload', icon: <UploadIcon size={13} /> },
            { value: 'link', label: 'Paste link', icon: <LinkIcon size={13} /> },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-5">
        <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden border border-hairline bg-bone">
          {value && isEmbedUrl(value) ? (
            <span className="px-2 text-center text-[0.5625rem] uppercase leading-[1.6] tracking-[0.14em] text-warm-gray">
              Web page
              <br />
              not a file
            </span>
          ) : value ? (
            <Media
              src={value}
              alt=""
              controls={false}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-2 text-center text-[0.5625rem] uppercase tracking-[0.14em] text-warm-gray">
              No image
            </span>
          )}
        </div>

        <div className="min-w-[15rem] flex-1">
          {mode === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => onFile(event.target.files?.[0])}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => input.current?.click()}
                className="flex w-full items-center justify-center gap-2.5 border border-dashed border-charcoal/25 px-4 py-5 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-300 hover:border-accent hover:text-charcoal disabled:opacity-50"
              >
                <UploadIcon size={15} />
                {busy ? 'Uploading…' : value ? 'Replace image' : 'Choose a PNG'}
              </button>
              <p className="text-[0.6875rem] leading-[1.7] text-warm-gray">
                Saved as{' '}
                <code className="bg-bone px-1.5 py-0.5 text-charcoal/80">{slot}.webp</code>{' '}
                — you never need to think about filenames.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <TextInput
                value={isExternal ? value : ''}
                onChange={onChange}
                placeholder="https://example.com/photo.jpg"
              />
              {value && !isExternal ? (
                <p className="text-[0.6875rem] text-warm-gray">
                  Currently using the uploaded image <code className="text-charcoal/80">{value}</code>.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {isEmbedUrl(value) ? (
        <p role="alert" className="mt-4 border-l-2 border-accent bg-accent/5 py-3 pl-4 text-xs leading-[1.75] text-charcoal">
          That link points at a web page, not an image or video file, so nothing can display
          from it. Open the post, download the photo or video, then either upload the file
          here or paste a direct link to the file itself — one ending in{' '}
          <code className="bg-bone px-1 py-0.5">.jpg</code>,{' '}
          <code className="bg-bone px-1 py-0.5">.png</code> or{' '}
          <code className="bg-bone px-1 py-0.5">.mp4</code>.
        </p>
      ) : null}

      <p className="mt-5 border-t border-hairline pt-4 text-xs leading-[1.75] text-warm-gray">
        {mode === 'upload' ? UPLOAD_HINT : LINK_HINT}
        {hint ? ` ${hint}` : ''}
      </p>

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 text-xs leading-[1.7] text-charcoal">
          <span className="mt-0.5 shrink-0 text-accent">
            <AlertIcon size={14} />
          </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Repeatable list                                                            */
/* -------------------------------------------------------------------------- */

export function Repeatable<T extends { id: string }>({
  items,
  onChange,
  render,
  create,
  addLabel,
  title,
}: {
  items: T[]
  onChange: (items: T[]) => void
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  create: () => T
  addLabel: string
  title: (item: T, index: number) => string
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => {
            setDragIndex(null)
            setOverIndex(null)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setOverIndex(index)
          }}
          onDrop={(event) => {
            event.preventDefault()
            if (dragIndex !== null) move(dragIndex, index)
            setDragIndex(null)
            setOverIndex(null)
          }}
          className={`border bg-cream/50 transition-colors duration-200 ${
            overIndex === index && dragIndex !== null && dragIndex !== index
              ? 'border-accent'
              : 'border-hairline'
          } ${dragIndex === index ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-hairline px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="cursor-grab text-warm-gray/60 active:cursor-grabbing" aria-hidden>
                <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor">
                  <circle cx="4" cy="3" r="1.3" />
                  <circle cx="10" cy="3" r="1.3" />
                  <circle cx="4" cy="9" r="1.3" />
                  <circle cx="10" cy="9" r="1.3" />
                  <circle cx="4" cy="15" r="1.3" />
                  <circle cx="10" cy="15" r="1.3" />
                </svg>
              </span>
              <span className="truncate font-display text-base">{title(item, index)}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
                className="px-2 py-1 text-warm-gray transition-colors hover:text-charcoal disabled:opacity-30"
              >
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor">
                  <path d="M1 7 7 1l6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
                className="px-2 py-1 text-warm-gray transition-colors hover:text-charcoal disabled:opacity-30"
              >
                <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor">
                  <path d="M1 1l6 6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
                aria-label="Delete"
                className="px-2 py-1 text-warm-gray transition-colors hover:text-accent"
              >
                <TrashIcon size={15} />
              </button>
            </div>
          </div>
          <div className="space-y-4 p-4">
            {render(
              item,
              (patch) =>
                onChange(items.map((entry) => (entry.id === item.id ? { ...entry, ...patch } : entry))),
              index,
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="w-full border border-dashed border-charcoal/25 px-4 py-4 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-300 hover:border-accent hover:text-charcoal"
      >
        {addLabel}
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Save bar + toast                                                           */
/* -------------------------------------------------------------------------- */

export function SaveBar({
  state,
  onSave,
  dirty,
  branch,
}: {
  state: SaveState
  onSave: () => void
  dirty: boolean
  branch?: string
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline bg-bone/95 px-5 py-4 backdrop-blur">
      <p className="text-xs text-warm-gray">
        {state === 'saving'
          ? 'Committing to GitHub…'
          : dirty
            ? 'You have unsaved changes.'
            : branch
              ? `Everything is saved to ${branch}.`
              : 'Everything is saved.'}
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={state === 'saving' || !dirty}
        className="bg-charcoal px-7 py-3 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-bone transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {state === 'saving' ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

export function Toast({ message, tone }: { message: string; tone: 'success' | 'error' }) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 z-[120] w-[min(30rem,calc(100vw-3rem))] -translate-x-1/2 border border-hairline bg-charcoal px-5 py-4 text-bone shadow-lift-lg"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-accent">
              {tone === 'success' ? <CheckIcon size={16} /> : <AlertIcon size={16} />}
            </span>
            <p className="text-xs leading-[1.75]">{message}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const timer = useRef<number | null>(null)

  const show = (message: string, tone: 'success' | 'error' = 'success') => {
    setToast({ message, tone })
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), tone === 'error' ? 9000 : 6000)
  }

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  return { toast, show }
}

export { formatBytes }

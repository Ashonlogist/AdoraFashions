import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { contact } from '../content'
import { Button } from '../components/Button'
import { CheckIcon, ClockIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/icons'
import { SectionHeading } from '../components/SectionHeading'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

/**
 * Set VITE_FORMSPREE_ID to a real Formspree form to enable in-page submission.
 * Until then the form composes a `mailto:` enquiry, so it never dead-ends.
 */
const FORMSPREE = (import.meta.env.VITE_FORMSPREE_ID as string | undefined)?.trim()

type Status = 'idle' | 'sending' | 'sent' | 'error'

const whatsappHref = `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`
const fields = { phone: contact.phone, whatsapp: contact.whatsapp, email: contact.email }

export default function Contact() {
  const { reduced } = useMotionPreference()
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const reply = String(data.get('reply') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!name || !reply || !message) {
      setError('Please add your name, a way to reach you, and a short message.')
      setStatus('error')
      return
    }

    setError('')
    setStatus('sending')

    if (!FORMSPREE) {
      const subject = encodeURIComponent(`Commission enquiry — ${name}`)
      const body = encodeURIComponent(`${message}\n\n—\n${name}\n${reply}`)
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
      setStatus('sent')
      return
    }

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, reply, message }),
      })
      if (!response.ok) throw new Error(String(response.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
      setError(
        'The form could not be sent just now. Please email us directly and we will pick it up straight away.',
      )
    }
  }

  return (
    <>
      <section className="shell pb-16 pt-[calc(var(--nav-h)+4rem)] md:pb-20 md:pt-[calc(var(--nav-h)+6rem)]">
        <SectionHeading
          index="01"
          as="h1"
          eyebrow="Contact & Location"
          headline="Come and tell me what you are imagining."
          lede={contact.intro}
        />
      </section>

      <section className="shell grid gap-14 pb-28 md:pb-36 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        {/* ------------------------------------------------------------- */}
        {/* Details                                                        */}
        {/* ------------------------------------------------------------- */}
        <div className="min-w-0">
          <ul className="divide-y divide-hairline border-y border-hairline">
            {fields.phone ? (
              <Row
                icon={<PhoneIcon size={19} />}
                label="Telephone"
                value={contact.phone}
                href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              />
            ) : null}
            {fields.whatsapp ? (
              <Row
                icon={<WhatsAppIcon size={19} />}
                label="WhatsApp"
                value="Message the atelier"
                href={whatsappHref}
                hint="Fastest reply"
              />
            ) : null}
            {fields.email ? (
              <Row
                icon={<MailIcon size={19} />}
                label="Email"
                value={contact.email}
                href={`mailto:${contact.email}`}
              />
            ) : null}
            {contact.instagram ? (
              <Row
                icon={<InstagramIcon size={19} />}
                label="Instagram"
                value={contact.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                href={contact.instagram}
              />
            ) : null}
          </ul>

          {contact.hours ? (
            <div className="mt-10">
              <span className="label">Studio hours</span>
              <p className="mt-3 flex items-start gap-3 text-sm leading-[1.8] text-charcoal/80">
                <span className="mt-1 shrink-0 text-accent">
                  <ClockIcon size={17} />
                </span>
                {contact.hours}
              </p>
            </div>
          ) : null}

          {contact.location ? (
            <div className="mt-10">
              <span className="label">The atelier</span>
              <p className="mt-3 flex items-start gap-3 text-sm leading-[1.8] text-charcoal/80">
                <span className="mt-1 shrink-0 text-accent">
                  <PinIcon size={17} />
                </span>
                {contact.location}
              </p>
            </div>
          ) : null}

          {contact.mapEmbedUrl ? (
            <div className="framed mt-10 aspect-[4/3] w-full">
              <iframe
                title="Adora Fashions atelier location"
                src={contact.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale-[0.4]"
                style={{ border: 0 }}
              />
            </div>
          ) : null}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Enquiry form                                                   */}
        {/* ------------------------------------------------------------- */}
        <div className="relative min-w-0">
          <motion.div
            aria-hidden
            className="absolute -left-6 -top-6 h-20 w-20 border-l border-t border-accent/40"
            initial={reduced ? false : { opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: EASE.couture }}
          />

          <form onSubmit={onSubmit} className="relative" noValidate>
            <div className="flex items-center gap-5">
              <span className="label text-accent">02</span>
              <span className="label">Send an enquiry</span>
              <span aria-hidden className="h-px flex-1 bg-hairline" />
            </div>

            <div className="mt-10 space-y-10">
              <Field
                id="name"
                name="name"
                label="Your name"
                placeholder="Naa Densua"
                autoComplete="name"
              />
              <Field
                id="reply"
                name="reply"
                label="Email or phone"
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Field
                id="message"
                name="message"
                label="What are you imagining?"
                placeholder="The occasion, roughly when, and anything you keep thinking about — a fabric, a photograph, a colour."
                multiline
                required
              />
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Button type="submit" size="lg" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send enquiry'}
              </Button>
              <p className="max-w-[16rem] text-xs leading-[1.8] text-warm-gray">
                {FORMSPREE
                  ? 'We reply to every enquiry within two working days.'
                  : 'Opens your email app with the message ready to send.'}
              </p>
            </div>

            <AnimatePresence>
              {status === 'sent' ? (
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE.couture }}
                  className="mt-8 flex items-center gap-3 border border-accent/40 bg-accent/5 px-5 py-4 text-sm text-charcoal"
                >
                  <span className="text-accent">
                    <CheckIcon size={18} />
                  </span>
                  Thank you — your enquiry is on its way to the atelier.
                </motion.p>
              ) : null}
              {status === 'error' && error ? (
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE.couture }}
                  role="alert"
                  className="mt-8 border border-charcoal/20 bg-cream px-5 py-4 text-sm text-charcoal"
                >
                  {error}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </form>
        </div>
      </section>
    </>
  )
}

function Row({
  icon,
  label,
  value,
  href,
  hint,
}: {
  icon: ReactNode
  label: string
  value: string
  href: string
  hint?: string
}) {
  const external = href.startsWith('http')
  return (
    <li>
      <a
        href={href}
        data-cursor="link"
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="group flex items-center justify-between gap-6 py-6"
      >
        <span className="flex items-center gap-4 text-warm-gray transition-colors duration-500 group-hover:text-charcoal">
          <span className="text-accent">{icon}</span>
          <span className="label">{label}</span>
          {hint ? (
            <span className="hidden font-sans text-[0.5625rem] uppercase tracking-[0.18em] text-accent sm:inline">
              {hint}
            </span>
          ) : null}
        </span>
        <span className="link-draw min-w-0 break-words text-right font-display text-lg transition-colors duration-500 group-hover:text-accent">
          {value}
        </span>
      </a>
    </li>
  )
}

function Field({
  id,
  name,
  label,
  placeholder,
  multiline = false,
  required = false,
  autoComplete,
}: {
  id: string
  name: string
  label: string
  placeholder?: string
  multiline?: boolean
  required?: boolean
  autoComplete?: string
}) {
  const shared =
    'peer w-full min-w-0 resize-none border-b border-hairline bg-transparent pb-3 pt-1 font-display text-lg text-charcoal placeholder:text-warm-gray/55 focus:border-accent focus:outline-none focus:ring-0 transition-colors duration-500'

  return (
    <div>
      <label htmlFor={id} className="label block">
        {label}
      </label>
      <div className="relative mt-3">
        {multiline ? (
          <textarea
            id={id}
            name={name}
            rows={4}
            required={required}
            placeholder={placeholder}
            className={shared}
          />
        ) : (
          <input
            id={id}
            name={name}
            type="text"
            required={required}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={shared}
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-couture peer-focus:scale-x-100"
        />
      </div>
    </div>
  )
}

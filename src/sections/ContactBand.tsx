import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { contact, settings } from '../content'
import { Button } from '../components/Button'
import { ClockIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from '../components/icons'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'
import { BlockWipe, SplitWords } from '../motion/text'

const whatsappHref = `https://wa.me/${contact.whatsapp.replace(/[^\d]/g, '')}`

export function ContactBand() {
  const { reduced } = useMotionPreference()

  return (
    <section className="relative overflow-hidden border-t border-hairline bg-cream">
      <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
        <div className="min-w-0">
          <div className="flex items-center gap-5">
            <span className="label text-accent">04</span>
            <span className="label">Commissions</span>
            <motion.span
              aria-hidden
              className="h-px flex-1 origin-left bg-hairline"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 1.3, ease: EASE.couture }}
            />
          </div>

          <BlockWipe
            as="h2"
            direction="up"
            className="mt-8 max-w-[16ch] font-display text-display-lg"
          >
            <SplitWords text={settings.bandHeadline} stagger={0.075} emphasisLast={2} />
          </BlockWipe>

          <motion.p
            className="mt-8 max-w-[32rem] text-[0.9375rem] leading-[1.9] text-warm-gray"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, delay: 0.25, ease: EASE.couture }}
          >
            {settings.bandLede}
          </motion.p>

          <motion.div
            className="mt-11 flex flex-wrap items-center gap-5"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, delay: 0.4, ease: EASE.couture }}
          >
            <Button href={whatsappHref} size="lg">
              Message on WhatsApp
            </Button>
            <Button to="/contact" variant="outline" size="lg">
              Full contact details
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="min-w-0 lg:pt-4"
          initial={reduced ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, delay: 0.2, ease: EASE.couture }}
        >
          <ul className="divide-y divide-hairline border-y border-hairline">
            {contact.phone ? (
              <ContactRow
                icon={<PhoneIcon size={18} />}
                label="Telephone"
                value={contact.phone}
                href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}
              />
            ) : null}
            {contact.whatsapp ? (
              <ContactRow
                icon={<WhatsAppIcon size={18} />}
                label="WhatsApp"
                value={contact.phone || 'Message the atelier'}
                href={whatsappHref}
              />
            ) : null}
            {contact.email ? (
              <ContactRow
                icon={<MailIcon size={18} />}
                label="Email"
                value={contact.email}
                href={`mailto:${contact.email}`}
              />
            ) : null}
            {contact.instagram ? (
              <ContactRow
                icon={<InstagramIcon size={18} />}
                label="Instagram"
                value={contact.instagram.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                href={contact.instagram}
              />
            ) : null}
          </ul>

          {contact.location ? (
            <p className="mt-8 flex items-start gap-4 text-sm leading-[1.8] text-warm-gray">
              <span className="mt-0.5 shrink-0 text-accent">
                <PinIcon size={18} />
              </span>
              {contact.location}
            </p>
          ) : null}

          {contact.hours ? (
            <p className="mt-4 flex items-start gap-4 text-sm leading-[1.8] text-warm-gray">
              <span className="mt-0.5 shrink-0 text-accent">
                <ClockIcon size={18} />
              </span>
              {contact.hours}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode
  label: string
  value: string
  href: string
}) {
  const external = href.startsWith('http')
  return (
    <li>
      <a
        href={href}
        data-cursor="link"
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="group flex items-center justify-between gap-6 py-5"
      >
        <span className="flex items-center gap-4 text-warm-gray transition-colors duration-500 group-hover:text-charcoal">
          <span className="text-accent">{icon}</span>
          <span className="label">{label}</span>
        </span>
        <span className="link-draw text-right font-display text-lg transition-colors duration-500 group-hover:text-accent">
          {value}
        </span>
      </a>
    </li>
  )
}

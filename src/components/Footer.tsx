import { Link } from 'react-router-dom'
import { settings } from '../content'
import { Wordmark } from './Nav'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-bone">
      <div className="shell py-14">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-[22rem] text-sm leading-[1.85] text-warm-gray">
              A small atelier taking a limited number of commissions each season. Bespoke
              bridal, traditional and everyday garments, cut and fitted by hand in Accra.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-cursor="link"
                className="link-draw w-fit font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-500 hover:text-charcoal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-4">
            <button
              type="button"
              data-cursor="link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="link-draw font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-500 hover:text-charcoal"
            >
              Back to top
            </button>
            <Link
              to="/admin"
              data-cursor="link"
              className="font-sans text-[0.625rem] uppercase tracking-[0.2em] text-charcoal/25 transition-colors duration-500 hover:text-charcoal/60"
            >
              Studio login
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-7">
          <p className="text-xs text-warm-gray">{settings.footerCopyright}</p>
          <p className="text-xs text-warm-gray">Accra, Ghana</p>
        </div>
      </div>
    </footer>
  )
}

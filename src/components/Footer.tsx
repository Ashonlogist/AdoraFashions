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
        <div className="flex flex-col items-start gap-12 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-10">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-[22rem] text-sm leading-[1.85] text-warm-gray">
              {settings.footerBlurb}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-1 md:gap-3">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-cursor="link"
                className="link-draw flex min-h-[2.75rem] w-full items-center font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-500 hover:text-charcoal md:w-fit md:py-0"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-full flex-col items-start gap-2 md:w-auto md:gap-4">
            <button
              type="button"
              data-cursor="link"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="link-draw flex min-h-[2.75rem] w-full items-center font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-warm-gray transition-colors duration-500 hover:text-charcoal md:min-h-0 md:w-fit"
            >
              Back to top
            </button>
            <Link
              to="/admin"
              data-cursor="link"
              className="flex min-h-[2.75rem] w-full items-center font-sans text-[0.625rem] uppercase tracking-[0.2em] text-charcoal/25 transition-colors duration-500 hover:text-charcoal/60 md:min-h-0 md:w-fit"
            >
              Studio login
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-hairline pt-7 md:mt-14 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
          <p className="text-xs text-warm-gray">{settings.footerCopyright}</p>
          <p className="text-xs text-warm-gray">{settings.footerLocation}</p>
        </div>
      </div>
    </footer>
  )
}

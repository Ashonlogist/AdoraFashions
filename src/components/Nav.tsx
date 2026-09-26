import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { EASE } from '../lib/motion'
import { useMotionPreference } from '../lib/useMotionPreference'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collections', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-display text-[1.375rem] leading-none tracking-[-0.02em]">
        Adora<span className="italic text-accent">.</span>
      </span>
      <span className="mt-1 font-sans text-[0.5rem] font-medium uppercase tracking-[0.42em] text-warm-gray">
        Fashions
      </span>
    </span>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()
  const { reduced } = useMotionPreference()

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 48))

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[80]"
        initial={false}
        animate={{
          backgroundColor: scrolled && !open ? 'rgba(245, 241, 234, 0.86)' : 'rgba(245, 241, 234, 0)',
          borderBottomColor: scrolled && !open ? 'rgba(228, 222, 211, 0.9)' : 'rgba(228, 222, 211, 0)',
        }}
        transition={{ duration: 0.7, ease: EASE.couture }}
        style={{ backdropFilter: scrolled && !open ? 'blur(14px)' : 'blur(0px)' }}
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between">
          <Link to="/" data-cursor="link" aria-label="Adora Fashions — home" className="group">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Primary">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                data-cursor="link"
                className={({ isActive }) =>
                  `font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] transition-all duration-500 ease-couture hover:tracking-[0.2em] ${
                    isActive ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal'
                  }`
                }
              >
                {({ isActive }) => (
                  <span data-active={isActive} className="link-draw">
                    {link.label}
                  </span>
                )}
              </NavLink>
            ))}
            <Link
              to="/contact"
              data-cursor="link"
              className="link-draw ml-1 hidden font-sans text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-accent transition-all duration-500 ease-couture hover:tracking-[0.2em] lg:inline-flex"
            >
              Book a fitting
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative z-[95] flex h-10 w-10 items-center justify-end md:hidden"
          >
            <span className="relative block h-[9px] w-7">
              <motion.span
                className="absolute left-0 block h-px w-full bg-charcoal"
                animate={open ? { top: 4, rotate: 32 } : { top: 0, rotate: 0 }}
                transition={{ duration: 0.5, ease: EASE.couture }}
              />
              <motion.span
                className="absolute left-0 block h-px w-full bg-charcoal"
                animate={open ? { top: 4, rotate: -32 } : { top: 8, rotate: 0 }}
                transition={{ duration: 0.5, ease: EASE.couture }}
              />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[85] flex flex-col bg-bone md:hidden"
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.75, ease: EASE.couture }}
          >
            <div className="flex flex-1 flex-col justify-center px-6 pb-16">
              <ul className="space-y-2">
                {LINKS.map((link, index) => (
                  <motion.li
                    key={link.to}
                    initial={reduced ? false : { opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.18 + index * 0.07, ease: EASE.couture }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-baseline gap-4 font-display text-[2.5rem] leading-tight tracking-[-0.02em] ${
                          isActive ? 'text-accent' : 'text-charcoal'
                        }`
                      }
                    >
                      <span className="font-sans text-[0.5625rem] tracking-[0.3em] text-warm-gray">
                        0{index + 1}
                      </span>
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                className="mt-12 border-t border-hairline pt-6"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE.couture }}
              >
                <p className="label">Accra, Ghana</p>
                <a
                  href="mailto:hello@adorafashions.com"
                  className="link-draw mt-3 inline-block font-display text-lg italic"
                >
                  hello@adorafashions.com
                </a>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

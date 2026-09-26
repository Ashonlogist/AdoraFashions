import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Nav } from './components/Nav'
import { CustomCursor } from './motion/CustomCursor'
import { PageBody, PageWipe } from './motion/PageTransition'
import { settings } from './content'
import { Button } from './components/Button'
import About from './pages/About'
import Collections from './pages/Collections'
import Contact from './pages/Contact'
import Home from './pages/Home'

// The dashboard is a separate bundle: visitors never download it.
const Admin = lazy(() => import('./pages/Admin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))

function AdminFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-bone">
      <p className="label animate-pulse text-warm-gray">Loading…</p>
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

/** Settings-driven accents, applied once at boot. */
function useAccent() {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-accent', `var(--accent-${settings.accentColor})`)
  }, [])
}

function NotFound() {
  return (
    <section className="shell flex min-h-[70vh] flex-col justify-center py-32 text-center">
      <span className="label text-accent">Error 404</span>
      <h1 className="mx-auto mt-8 max-w-[16ch] font-display text-display-lg">
        This page has been taken off the rail.
      </h1>
      <p className="mx-auto mt-7 max-w-[34rem] text-[0.9375rem] leading-[1.9] text-warm-gray">
        The link may be old, or the piece may have moved. Everything currently in the atelier is one
        click away.
      </p>
      <div className="mt-11 flex flex-wrap justify-center gap-4">
        <Button to="/collections">View collections</Button>
        <Button to="/contact" variant="outline">
          Contact the atelier
        </Button>
      </div>
    </section>
  )
}

export default function App() {
  const location = useLocation()
  useAccent()
  const isAdmin = location.pathname.startsWith('/admin')

  // The wipe covers the very first paint, so only run it once the visitor has
  // actually moved between pages.
  const [landingPath, setLandingPath] = useState(location.pathname)
  useEffect(() => {
    if (location.pathname !== landingPath) setLandingPath(location.pathname)
  }, [location.pathname, landingPath])
  const hasNavigated = location.pathname !== landingPath

  return (
    <>
      <ScrollToTop />
      <CustomCursor enabled={!isAdmin} />
      <PageWipe pathname={location.pathname} enabled={!isAdmin && hasNavigated} />

      <div className="flex min-h-screen flex-col">
        {isAdmin ? null : <Nav />}
        <main className="flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <PageBody key={location.pathname} instant={isAdmin}>
              <Suspense fallback={<AdminFallback />}>
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageBody>
          </AnimatePresence>
        </main>
        {isAdmin ? null : <Footer />}
      </div>
    </>
  )
}

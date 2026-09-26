import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../admin/api'
import { AlertIcon } from '../components/icons'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [checked, setChecked] = useState(false)

  // Already signed in? Skip the form. A misconfigured deployment gets a
  // readable explanation rather than a form that can never succeed.
  useEffect(() => {
    let active = true
    adminApi
      .session()
      .then((result) => {
        if (!active) return
        if (result.authenticated) navigate('/admin', { replace: true })
        else if (!result.configured) setError(result.message ?? 'The admin password is not set yet.')
      })
      .catch(() => {
        /* Offline or API missing: fall through to the form. */
      })
      .finally(() => active && setChecked(true))
    return () => {
      active = false
    }
  }, [navigate])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!password) return
    setBusy(true)
    setError('')
    try {
      await adminApi.login(password)
      navigate('/admin', { replace: true })
    } catch (caught) {
      setError((caught as Error).message)
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid min-h-screen place-items-center bg-bone px-6 py-20">
      <div className="w-full max-w-md">
        <p className="label text-center text-accent">Adora Fashions</p>
        <h1 className="mt-6 text-center font-display text-display-sm">Atelier dashboard</h1>
        <p className="mt-4 text-center text-sm leading-[1.8] text-warm-gray">
          Sign in to edit the site. Every change is saved straight to GitHub.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <div>
            <label htmlFor="admin-password" className="label block text-charcoal/70">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                type={show ? 'text' : 'password'}
                value={password}
                autoFocus
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full border border-hairline bg-cream px-4 py-3.5 pr-16 text-sm text-charcoal placeholder:text-warm-gray/60 focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 font-sans text-[0.625rem] uppercase tracking-[0.15em] text-warm-gray transition-colors hover:text-charcoal"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="flex items-start gap-2 border border-accent/30 bg-accent/5 px-4 py-3 text-xs leading-[1.7] text-charcoal"
            >
              <span className="mt-0.5 shrink-0 text-accent">
                <AlertIcon size={14} />
              </span>
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !password || !checked}
            className="w-full bg-charcoal py-4 font-sans text-[0.625rem] font-medium uppercase tracking-[0.15em] text-bone transition-opacity duration-300 hover:opacity-85 disabled:opacity-40"
          >
            {busy ? 'Signing in…' : 'Enter dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-warm-gray">
          <a href="/" className="underline decoration-hairline underline-offset-4 transition-colors hover:text-charcoal">
            ← Back to the site
          </a>
        </p>
      </div>
    </section>
  )
}

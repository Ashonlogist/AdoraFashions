/**
 * Proves the Netlify function actually answers the URLs the dashboard calls.
 *
 * The bug this guards against is subtle: `api/` is a Vercel convention, so on
 * Netlify every request fell through to the SPA rewrite and came back as the
 * login page's HTML with a 404. These checks call the exported function the way
 * Netlify does and assert on the routing and the translated Node response.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { config, default as handler } from '../netlify/functions/api.ts'

/**
 * Stand in for the GitHub API.
 *
 * The dashboard's whole point is talking to GitHub, but a routing test must not
 * need a token or the network. Octokit is built on `fetch`, so intercepting it
 * here exercises the real handler code — auth, the 404 mapping, the blob
 * filtering — against fixtures read from this working tree.
 */
function stubGitHub() {
  const contentDir = new URL('../content/', import.meta.url)
  const imageDir = new URL('../public/images/', import.meta.url)
  const read = (dir: URL, name: string) => readFileSync(new URL(name, dir))

  const contents = new Map<string, { body: string; sha: string }>()
  for (const name of readdirSync(contentDir).filter((f) => f.endsWith('.json'))) {
    contents.set(`content/${name}`, { body: read(contentDir, name).toString(), sha: `sha-${name}` })
  }

  const tree = [
    ...[...contents.keys()].map((path) => ({ path, type: 'blob', sha: `sha-${path}` })),
    ...readdirSync(imageDir).map((name) => ({
      path: `public/images/${name}`,
      type: 'blob',
      sha: `sha-${name}`,
    })),
  ]

  const real = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input : input.url)
    if (!url.hostname.endsWith('github.com')) return real(input as never, init)

    // Octokit escapes the slash in `content/hero.json` as %2F.
    const decoded = decodeURIComponent(url.pathname)
    if (decoded.endsWith('/contents/content/hero.json')) {
      const { body, sha } = contents.get('content/hero.json')!
      return Response.json({
        type: 'file',
        content: Buffer.from(body, 'utf8').toString('base64'),
        sha,
        path: 'content/hero.json',
      })
    }
    if (decoded.includes('/contents/')) {
      return Response.json({ message: 'Not Found' }, { status: 404 })
    }
    if (url.pathname.includes('/git/trees/')) return Response.json({ tree, truncated: false })
    return Response.json({ message: 'Not Found' }, { status: 404 })
  }) as typeof fetch
}

stubGitHub()


process.env.ADMIN_PASSWORD = 'test-password'
process.env.SESSION_SECRET = 'test-secret-value-long-enough-for-hs256'
process.env.GITHUB_TOKEN = 'test-token'
process.env.GITHUB_OWNER = 'Ashonlogist'
process.env.GITHUB_REPO = 'AdoraFashions'
process.env.GITHUB_BRANCH = 'main'

let passed = 0

function check(label: string, condition: boolean, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  ok  ${label}`)
  } else {
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
    process.exitCode = 1
  }
}

function call(path: string, init: RequestInit = {}) {
  return handler(new Request(`https://adorafashions.netlify.app${path}`, init))
}

console.log('netlify function')

check('claims every /api/* path', config.path === '/api/*', config.path)

// The exact request the login screen makes on mount.
const session = await call('/api/admin/session')
const sessionBody = await session.json()
check('GET /api/admin/session is not a 404', session.status !== 404, `status ${session.status}`)
check('session responds with JSON', session.headers.get('content-type')?.includes('application/json'))
check(
  'session reports the auth configuration',
  sessionBody.configured === true && typeof sessionBody.authenticated === 'boolean',
  JSON.stringify(sessionBody),
)
check('session is not cacheable', session.headers.get('cache-control') === 'no-store')

// An anonymous visitor must not be handed content.
const content = await call('/api/admin/content')
check('GET /api/admin/content needs a session', content.status === 401, `status ${content.status}`)

const badLogin = await call('/api/admin/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: 'wrong' }),
})
check('POST /api/admin/login rejects a bad password', badLogin.status === 401)

const goodLogin = await call('/api/admin/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: 'test-password' }),
})
const cookie = goodLogin.headers.get('set-cookie')
check(
  'POST /api/admin/login issues a session cookie',
  goodLogin.status === 200 && !!cookie,
  `status ${goodLogin.status} body ${await goodLogin.clone().text()} cookie ${cookie}`,
)
check('the session cookie is HttpOnly and SameSite=Strict', /HttpOnly/.test(cookie ?? '') && /SameSite=Strict/.test(cookie ?? ''))

// The cookie has to survive the round trip, or every later call 401s.
const token = /adora_session=([^;]+)/.exec(cookie ?? '')?.[1]
const withCookie = { headers: { cookie: `adora_session=${token}` } }

const authorised = await call('/api/admin/content', withCookie)
check(
  'GET /api/admin/content accepts the cookie from login',
  authorised.status === 200,
  `status ${authorised.status}`,
)

const images = await call('/api/admin/images', withCookie)
const library = await images.json()
check('GET /api/admin/images routes to the image list', images.status === 200, `status ${images.status}`)
check('the image library lists real files', Array.isArray(library.images) && library.images.length > 0, JSON.stringify(library).slice(0, 200))
check(
  'the image library offers no non-image files',
  !(library.images ?? []).some((entry: { slot: string }) => entry.slot.endsWith('.md')),
  JSON.stringify(library.images),
)

const section = await call('/api/admin/content/hero', withCookie)
check('GET /api/admin/content/hero routes the section slug', section.status === 200, `status ${section.status}`)

const badSection = await call('/api/admin/content/not-a-section', withCookie)
check('an unknown section is rejected, not served', badSection.status >= 400, `status ${badSection.status}`)

const method = await call('/api/admin/session', { method: 'POST' })
check('a wrong method is refused', method.status === 405, `status ${method.status}`)

const unknown = await call('/api/admin/nope')
check('an unknown endpoint is a JSON 404', unknown.status === 404)

// Trailing slashes come from copy-pasted links and must not 404.
const trailing = await call('/api/admin/session/')
check('a trailing slash still routes', trailing.status === 200, `status ${trailing.status}`)

// The platform's body cap, reported in our own words.
const oversized = await call('/api/admin/image', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'content-length': String(9 * 1024 * 1024) },
  body: '{}',
})
check('an oversized upload is refused with an explanation', oversized.status === 413, `status ${oversized.status}`)
check('the refusal explains what to do', /smaller/i.test((await oversized.json()).error ?? ''))

console.log(`\n${passed} checks passed`)

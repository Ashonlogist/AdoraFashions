/**
 * Local smoke test for the serverless handlers — no Vercel account needed.
 *
 *   node --experimental-strip-types scripts/test-api.mts
 *
 * Point GITHUB_TOKEN at a real token (or leave the network calls to fail) to
 * check the auth + routing logic in isolation.
 */
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'

process.env.ADMIN_PASSWORD = 'test-password'
process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing'
process.env.GITHUB_OWNER = 'Ashonlogist'
process.env.GITHUB_REPO = 'AdoraFashions'
process.env.GITHUB_BRANCH = 'main'
delete process.env.GITHUB_TOKEN

const { default: login } = await import('../api/admin/login.ts')
const { default: session } = await import('../api/admin/session.ts')
const { default: logout } = await import('../api/admin/logout.ts')
const { default: image } = await import('../api/admin/image.ts')
const { default: contentSection } = await import('../api/admin/content/[section].ts')

function makeRes() {
  const res = new EventEmitter()
  res.statusCode = 200
  res.headers = {}
  res.body = undefined
  res.setHeader = (key, value) => {
    res.headers[key.toLowerCase()] = value
    return res
  }
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (body) => {
    res.body = body
    res.end()
    return res
  }
  res.end = () => res
  res.getHeader = (key) => res.headers[key.toLowerCase()]
  return res
}

let ipCounter = 0
function makeReq({ method = 'GET', body = {}, query = {}, headers = {}, ip } = {}) {
  const req = new EventEmitter()
  req.method = method
  req.body = body
  req.query = query
  // A distinct client per call keeps the brute-force brake from leaking
  // between checks.
  ipCounter += 1
  req.headers = {
    host: 'localhost',
    'x-forwarded-for': ip ?? `10.0.0.${ipCounter}`,
    ...headers,
  }
  req.socket = { remoteAddress: '127.0.0.1' }
  return req
}

function setCookie(res) {
  const value = res.headers['set-cookie']
  if (!value) return ''
  return Array.isArray(value) ? value.join('\n') : String(value)
}

function cookieFrom(res) {
  return setCookie(res)
    .split('\n')
    .map((entry) => entry.split(';')[0])
    .join('; ')
}

let passed = 0
function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1
      console.log(`  ok  ${name}`)
    })
    .catch((error) => {
      console.error(`FAIL  ${name}\n      ${error.message}`)
      process.exitCode = 1
    })
}

console.log('api handler smoke test\n')

await check('session reports unauthenticated before login', async () => {
  const res = makeRes()
  session(makeReq(), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.authenticated, false)
  assert.equal(res.body.configured, true)
})

await check('session is cached off', async () => {
  const res = makeRes()
  session(makeReq(), res)
  assert.equal(res.headers['cache-control'], 'no-store')
})

await check('login rejects a wrong password', async () => {
  const res = makeRes()
  login(makeReq({ method: 'POST', body: { password: 'nope' } }), res)
  assert.equal(res.statusCode, 401)
  assert.match(res.body.error, /not correct/i)
  assert.equal(setCookie(res), '')
})

await check('login rejects a non-string password', async () => {
  const res = makeRes()
  login(makeReq({ method: 'POST', body: { password: { toString: () => 'x' } } }), res)
  assert.equal(res.statusCode, 401)
})

await check('login refuses the wrong method', async () => {
  const res = makeRes()
  login(makeReq({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405)
  assert.equal(res.headers.allow, 'POST')
})

await check('login issues an httpOnly session cookie', async () => {
  const res = makeRes()
  login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
  assert.equal(res.statusCode, 200)
  const cookie = setCookie(res)
  assert.match(cookie, /^adora_session=/)
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Strict/i)
  assert.match(cookie, /Path=\//)
})

await check('session validates the cookie it just issued', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  const res = makeRes()
  session(makeReq({ headers: { cookie } }), res)
  assert.equal(res.body.authenticated, true)
})

await check('a tampered cookie is not a session', async () => {
  const res = makeRes()
  session(makeReq({ headers: { cookie: 'adora_session=not.a.jwt' } }), res)
  assert.equal(res.body.authenticated, false)
})

await check('logout clears the cookie', async () => {
  const res = makeRes()
  logout(makeReq({ method: 'POST' }), res)
  assert.equal(res.statusCode, 200)
  assert.match(setCookie(res), /Max-Age=0/)
})

await check('content requires a session', async () => {
  const res = makeRes()
  await contentSection(makeReq({ method: 'GET', query: { section: 'hero' } }), res)
  assert.equal(res.statusCode, 401)
})

await check('content rejects an unknown section before touching GitHub', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  const res = makeRes()
  await contentSection(
    makeReq({ method: 'GET', query: { section: 'secrets' }, headers: { cookie } }),
    res,
  )
  assert.equal(res.statusCode, 400)
})

await check('content allows a real section and then fails on the missing token', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  const res = makeRes()
  await contentSection(
    makeReq({ method: 'GET', query: { section: 'hero' }, headers: { cookie } }),
    res,
  )
  assert.equal(res.statusCode, 503)
  assert.match(res.body.error, /GITHUB_TOKEN/)
})

await check('content PUT refuses a body with no content', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  process.env.GITHUB_TOKEN = 'placeholder'
  const res = makeRes()
  await contentSection(
    makeReq({ method: 'PUT', query: { section: 'hero' }, body: {}, headers: { cookie } }),
    res,
  )
  assert.equal(res.statusCode, 400)
  delete process.env.GITHUB_TOKEN
})

await check('image rejects a bad slot', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  process.env.GITHUB_TOKEN = 'placeholder'
  const res = makeRes()
  await image(
    makeReq({
      method: 'POST',
      body: { slot: '../../etc/passwd', base64: 'AAAA' },
      headers: { cookie },
    }),
    res,
  )
  assert.equal(res.statusCode, 400)
  assert.match(res.body.error, /slot/i)
  delete process.env.GITHUB_TOKEN
})

await check('image rejects data that is not an image', async () => {
  const cookie = cookieFrom(
    (() => {
      const res = makeRes()
      login(makeReq({ method: 'POST', body: { password: 'test-password' } }), res)
      return res
    })(),
  )
  process.env.GITHUB_TOKEN = 'placeholder'
  const res = makeRes()
  await image(
    makeReq({
      method: 'POST',
      body: { slot: 'hero-main', base64: Buffer.from('not an image at all').toString('base64') },
      headers: { cookie },
    }),
    res,
  )
  assert.equal(res.statusCode, 400)
  delete process.env.GITHUB_TOKEN
})

await check('repeated bad passwords get throttled', async () => {
  for (let i = 0; i < 9; i += 1) {
    const res = makeRes()
    login(makeReq({ method: 'POST', body: { password: 'nope' }, ip: '5.6.7.8' }), res)
    if (res.statusCode === 429) {
      assert.match(res.body.error, /Too many attempts/i)
      return
    }
  }
  throw new Error('throttle never engaged')
})

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)

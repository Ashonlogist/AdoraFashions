/**
 * Admin dashboard check. The preview server has no /api, so the endpoints are
 * mocked in the browser — this exercises the real UI: login gate, redirect,
 * every section editor, dirty state, save, and the success toast.
 */
import puppeteer from '/tmp/opencode/verify/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'
import { readFileSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const CONTENT = Object.fromEntries(
  ['hero', 'about', 'collections', 'testimonials', 'contact', 'settings'].map((name) => [
    name,
    JSON.parse(readFileSync(new URL(`../content/${name}.json`, import.meta.url), 'utf8')),
  ]),
)

let session = false
const puts = []
const uploads = []

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 1000 })

const errors = []
// 401s are expected: the check deliberately fails a login and re-visits /admin
// after logging out.
page.on('console', (m) => {
  if (m.type() !== 'error') return
  const text = m.text()
  if (text.includes('401')) return
  errors.push(text)
})
page.on('pageerror', (e) => errors.push(String(e)))

function intercept(target) {
  target.setRequestInterception(true)
  target.on('request', (request) => {
  const url = new URL(request.url())
  if (url.pathname.startsWith('/api/admin/')) {
    const json = (body, status = 200) =>
      request.respond({ status, contentType: 'application/json', body: JSON.stringify(body) })

    const path = url.pathname

    if (path === '/api/admin/session')
      return json({ authenticated: session, configured: true, writable: true, message: null })
    if (path === '/api/admin/login') {
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() ?? '{}')
        if (body.password !== 'right') return json({ error: 'That password is not correct.' }, 401)
        session = true
        return json({ ok: true })
      }
    }
    if (path === '/api/admin/logout') {
      session = false
      return json({ ok: true })
    }
    if (!session) return json({ error: 'Your session has expired.' }, 401)
    if (path === '/api/admin/content') return json({ branch: 'main', content: CONTENT })
    if (path.startsWith('/api/admin/content/')) {
      const section = path.split('/').pop()
      const body = JSON.parse(request.postData() ?? '{}')
      puts.push({ section, content: body.content })
      return json({ ok: true, path: `content/${section}.json`, branch: 'main', message: 'x' })
    }
    if (path === '/api/admin/image') {
      const body = JSON.parse(request.postData() ?? '{}')
      uploads.push({ slot: body.slot, mime: body.mime, bytes: body.base64?.length ?? 0 })
      return json({ ok: true, publicPath: `/images/${body.slot}.png`, path: `public/images/${body.slot}.png`, bytes: 1234, branch: 'main' })
    }
    if (path === '/api/admin/images')
      return json({ branch: 'main', images: [{ slot: 'hero-main', file: 'hero-main.png', path: '/images/hero-main.png', size: 90000 }] })

    return json({ error: 'not mocked' }, 404)
  }
  // A request aborted mid-flight (the SPA navigated away) throws here; that is
  // expected and must not take the browser session down with it.
  request.continue().catch(() => {})
  })
}

intercept(page)

const fail = (msg) => {
  console.log(`FAIL  ${msg}`)
  process.exitCode = 1
}
const ok = (msg) => console.log(`  ok  ${msg}`)

// 1. Unauthenticated /admin redirects to /admin/login
await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' })
await page.waitForSelector('input#admin-password', { timeout: 8000 }).then(
  () => ok('/admin redirects an anonymous visitor to the login screen'),
  () => fail('login screen never appeared'),
)
if (!page.url().includes('/admin/login')) fail(`expected /admin/login, got ${page.url()}`)

// 2. The public chrome is not on the login screen
const hasNav = await page.$$eval('nav a[href="/collections"]', (n) => n.length)
if (hasNav === 0) ok('public navigation is hidden inside the dashboard')
else fail('public nav leaked into admin')

// 3. Wrong password shows a readable error
await page.type('input#admin-password', 'wrong')
await page.click('button[type="submit"]')
await page.waitForFunction(() => document.body.innerText.includes('not correct'), { timeout: 5000 })
  .then(() => ok('a wrong password shows a plain-language error'), () => fail('no error for a wrong password'))

// 4. Right password gets in
await page.click('input#admin-password', { clickCount: 3 })
await page.type('input#admin-password', 'right')
await page.click('button[type="submit"]')
await page.waitForFunction(() => location.pathname === '/admin', { timeout: 8000 })
  .then(() => ok('a correct password lands on the dashboard'), () => fail('never reached the dashboard'))
await page.waitForSelector('nav[aria-label="Content sections"]', { timeout: 8000 })

// 5. All six sections open and contain real fields
const sections = await page.$$eval('nav[aria-label="Content sections"] button', (b) =>
  b.map((x) => x.querySelector('span > span')?.textContent.trim() ?? x.textContent.trim()),
)
const expected = ['Hero', 'About', 'Collections', 'Testimonials', 'Contact info', 'Site settings']
if (JSON.stringify(sections) === JSON.stringify(expected)) {
  ok(`all six editors are present (${sections.length})`)
} else {
  fail(`sections were ${JSON.stringify(sections)}`)
}

for (const [index, name] of expected.entries()) {
  await page.$$eval('nav[aria-label="Content sections"] button', (b, i) => b[i].click(), index)
  await new Promise((r) => setTimeout(r, 350))
  const text = await page.evaluate(() => document.body.innerText)
  if (!text.includes(name)) fail(`section ${name} did not render`)
  if (/undefined|\[object Object\]|NaN/.test(text)) fail(`section ${name} rendered a broken value`)
}
ok('every section renders without undefined/NaN values')

// 6. Edit + save Hero commits the right JSON
await page.$$eval('nav[aria-label="Content sections"] button', (b) => b[0].click())
await new Promise((r) => setTimeout(r, 300))
const EDITED = 'Headline edited by the dashboard check'
await page.evaluate((value) => {
  const area = document.querySelector('textarea')
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
  setter.call(area, value)
  area.dispatchEvent(new Event('input', { bubbles: true }))
}, EDITED)
const barText = await page.evaluate(() => document.body.innerText)
if (!barText.includes('unsaved changes')) fail('dirty state was not detected')
else ok('editing a field marks the section as having unsaved changes')

await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().startsWith('Save changes'))
  button.click()
})
await page.waitForFunction(() => document.body.innerText.includes('Saved — live in about 1–2 minutes'), { timeout: 6000 })
  .then(() => ok('saving shows the "live in 1–2 minutes" confirmation'), () => fail('no success toast'))
if (puts.at(-1)?.content?.headline === EDITED) {
  ok('the saved hero JSON carried exactly the edited headline')
} else {
  fail(`headline was ${JSON.stringify(puts.at(-1)?.content?.headline)}`)
}
if (puts.at(-1)?.section !== 'hero') fail('save targeted the wrong section')

// 7. Collections: add a piece, unique id and slot
await page.$$eval('nav[aria-label="Content sections"] button', (b) => b[2].click())
await new Promise((r) => setTimeout(r, 300))
const before = await page.evaluate(() => document.body.innerText.match(/pieces \((\d+)\)/i)[1])
await page.evaluate(() => {
  const addButton = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Add a piece'))
  addButton.click()
})
await new Promise((r) => setTimeout(r, 300))
const after = await page.evaluate(() => document.body.innerText.match(/pieces \((\d+)\)/i)[1])
if (Number(after) === Number(before) + 1) {
  ok(`adding a piece grows the list (${before} → ${after})`)
} else {
  fail(`add piece did nothing (${before} → ${after})`)
}

// 8. Logout returns to the login screen and forgets the session
await page.evaluate(() => {
  const logoutButton = [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Log out'))
  logoutButton.click()
})
await page.waitForFunction(() => location.pathname === '/admin/login', { timeout: 6000 })
  .then(() => ok('logging out returns to the login screen'), () => fail('logout did not navigate'))
const fresh = await browser.newPage()
intercept(fresh)
await fresh.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' })
await fresh.waitForSelector('input#admin-password', { timeout: 10000 })
  .then(
    () => ok('a brand new visit after logout lands on the login screen, not the dashboard'),
    () => fail('still authenticated after logout'),
  )
await fresh.close()

// 9. No console errors anywhere
if (errors.length === 0) ok('no console or page errors')
else fail(`console errors: ${errors.join(' | ')}`)

await browser.close()
console.log(process.exitCode ? '\nadmin check finished with failures' : '\nadmin check passed')

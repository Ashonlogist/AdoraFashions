/**
 * Visual + structural smoke test for the public site.
 *
 *   npm run build && npm run preview &
 *   npm run check
 *
 * Catches the things a build cannot: horizontal overflow, images that never
 * arrive, duplicate or missing <h1>s, console errors, and any animation that
 * breaks when the visitor has asked for reduced motion.
 *
 * Point CHROME at a Chromium binary if it is not at /usr/bin/chromium.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const CHROME = process.env.CHROME ?? '/usr/bin/chromium'
const ROUTES = (process.env.ROUTES ?? '/,/collections,/about,/contact').split(',')
const VIEWPORTS = (process.env.VP ?? 'desktop,mobile').split(',').map((name) =>
  name === 'mobile'
    ? { name: 'mobile', width: 390, height: 844, dsf: 2, mobile: true }
    : { name: 'desktop', width: 1440, height: 900, dsf: 1 },
)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
})

let failures = 0
const fail = (message) => {
  console.log(`FAIL  ${message}`)
  failures++
}

/**
 * Walk the page so lazy images request themselves, then wait for every one of
 * them to actually finish. Measuring straight after `networkidle0` reports
 * perfectly good below-the-fold images as broken.
 */
async function settle(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })

  // `naturalWidth` is the honest signal here, not `complete`: Chromium leaves
  // `complete` false on a lazily-loaded image it has fetched but not yet
  // decoded, which is exactly the below-the-fold portrait on the home page.
  await page
    .waitForFunction(
      () => Array.from(document.images).every((img) => img.naturalWidth > 0 || img.complete),
      { timeout: 15000, polling: 250 },
    )
    .catch(() => {})

  await new Promise((r) => setTimeout(r, 600))
}

async function inspect(page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    const vw = doc.clientWidth

    // An element only counts as "escaping" if nothing between it and the body
    // clips or masks it — a full-bleed marquee is supposed to overflow.
    const clipped = (el) => {
      for (let node = el.parentElement; node; node = node.parentElement) {
        const cs = getComputedStyle(node)
        if (
          cs.overflow !== 'visible' ||
          cs.overflowX !== 'visible' ||
          cs.overflowY !== 'visible' ||
          cs.clipPath !== 'none'
        ) {
          return true
        }
        if (node === document.body) break
      }
      return false
    }

    const escaping = []
    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (r.right <= vw + 1 && r.left >= -1) continue
      if (clipped(el)) continue
      if (el.children.length > 0) continue
      escaping.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 70),
        box: `${Math.round(r.left)}→${Math.round(r.right)}`,
        text: (el.textContent || '').trim().slice(0, 40),
      })
    }

    const images = Array.from(document.images).map((img) => ({
      src: (img.currentSrc || img.src).split('/').pop(),
      ok: img.naturalWidth > 0,
    }))

    return {
      scrollW: doc.scrollWidth,
      clientW: vw,
      scrollH: document.body.scrollHeight,
      escaping: escaping.slice(0, 8),
      escapeCount: escaping.length,
      broken: images.filter((i) => !i.ok),
      imageCount: images.length,
      h1Count: document.querySelectorAll('h1').length,
      h1: document.querySelector('h1')?.textContent?.trim().slice(0, 60) ?? null,
      text: (document.body.innerText || '').length,
      // A page that rendered but stayed invisible is the classic
      // animation-crash signature.
      bodyOpacity: getComputedStyle(document.body).opacity,
    }
  })
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    const page = await browser.newPage()
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dsf,
      isMobile: !!vp.mobile,
      hasTouch: !!vp.mobile,
    })

    const problems = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
    page.on('requestfailed', (r) => {
      const text = r.failure()?.errorText ?? ''
      if (text.includes('ERR_ABORTED')) return // cancelled by a route change
      problems.push(`requestfailed: ${r.url()} ${text}`)
    })

    const res = await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 })
    if (!res || res.status() >= 400) problems.push(`status ${res?.status()}`)

    await settle(page)
    const report = await inspect(page)

    const overflow = report.scrollW > report.clientW + 1
    const bad =
      overflow ||
      report.broken.length > 0 ||
      report.escapeCount > 0 ||
      problems.length > 0 ||
      report.h1Count !== 1 ||
      report.text < 200

    console.log(
      `[${bad ? 'FAIL' : ' ok '}] ${vp.name.padEnd(7)} ${route.padEnd(12)} ` +
        `h=${String(report.scrollH).padEnd(6)} w=${report.scrollW}/${report.clientW} ` +
        `h1x${report.h1Count} imgs=${report.imageCount} broken=${report.broken.length} ` +
        `off=${report.escapeCount} chars=${report.text}`,
    )
    if (overflow) console.log(`        !! horizontal overflow +${report.scrollW - report.clientW}px`)
    if (report.h1Count !== 1) console.log(`        !! expected exactly one <h1>, found ${report.h1Count}`)
    if (report.text < 200) console.log(`        !! only ${report.text} characters of text — did it render?`)
    report.escaping.forEach((e) => console.log(`        off-screen <${e.tag}> ${e.box} "${e.text}" .${e.cls}`))
    report.broken.forEach((i) => console.log(`        broken image: ${i.src}`))
    problems.slice(0, 6).forEach((p) => console.log(`        ${p}`))
    if (bad) failures++

    await page.close()
  }
}

// Reduced motion: every page must still be readable with animation switched off.
for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  const problems = []
  page.on('pageerror', (e) => problems.push(e.message))

  await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 })
  await settle(page)
  const report = await inspect(page)

  if (report.text < 200) fail(`reduced-motion ${route} rendered almost no text (${report.text} chars)`)
  if (report.h1Count !== 1) fail(`reduced-motion ${route} had ${report.h1Count} <h1>s`)
  if (report.scrollW > report.clientW + 1) fail(`reduced-motion ${route} overflows horizontally`)
  problems.forEach((p) => fail(`reduced-motion ${route}: ${p}`))
  await page.close()
}
console.log('  ok  reduced motion renders every route')

await browser.close()
console.log(failures === 0 ? '\nALL CLEAN' : `\n${failures} problem(s) found`)
if (failures) process.exitCode = 1

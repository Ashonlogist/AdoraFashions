/**
 * Verifies that a pasted video link actually plays, at both breakpoints and
 * under reduced motion.
 *
 * Checking that a <video> element *has* the autoplay attribute proves nothing —
 * every browser refuses to autoplay an unmuted element, and quietly refuses for
 * a few other reasons too. So this watches `currentTime` advance, which is the
 * only evidence that pixels are genuinely moving.
 *
 *   npm run build && npm run preview &
 *   npm run check:video
 *
 * Expects content/collections.json items[0].image to point at a video file, so
 * it is deliberately NOT part of `npm run check` — it has nothing to test on a
 * site that is all stills. Scenarios can be run one at a time:
 *
 *   node scripts/check-video.mjs refused
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const CHROME = process.env.CHROME ?? '/usr/bin/chromium'

const only = process.argv.slice(2)
const want = (name) => only.length === 0 || only.includes(name)

let failures = 0
const fail = (message) => {
  console.log(`  FAIL ${message}`)
  failures++
}
const pass = (message) => console.log(`  ok   ${message}`)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/** Watches the video advance, rather than sampling `currentTime` once. */
async function playback(page, selector) {
  return page.evaluate(async (sel) => {
    const video = document.querySelector(sel)
    if (!video) return { found: false }
    const first = video.currentTime
    await new Promise((r) => setTimeout(r, 1200))
    return {
      found: true,
      advanced: video.currentTime > first,
      first,
      now: video.currentTime,
      paused: video.paused,
      muted: video.muted,
      loop: video.loop,
      inline: video.playsInline,
      autoplay: video.autoplay,
      controls: video.controls,
      decoded: video.videoWidth > 0 && video.videoHeight > 0,
      w: video.videoWidth,
      h: video.videoHeight,
    }
  }, selector)
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    /* Stands in for a visitor who has already interacted with the page,
       which is the fair test for a muted, silent loop. */
    '--autoplay-policy=no-user-gesture-required',
    '--font-render-hinting=none',
  ],
})

for (const [name, width, height] of [
  ['phone', 375, 812],
  ['desktop', 1440, 900],
]) {
  if (!want(name)) continue
  console.log(`\n[${name} ${width}px]`)

  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.goto(`${BASE}/collections`, { waitUntil: 'networkidle2', timeout: 30000 })

  const still = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('img')).filter((img) =>
        (img.getAttribute('src') ?? '').includes('__probe'),
      ).length,
  )
  if (still > 0) fail(`${still} video slot(s) still render as <img>`)
  else pass('video slot renders as <video>, not <img>')

  const state = await playback(page, 'video[src*="__probe"]')
  if (!state.found) {
    fail('no video element found for the pasted link')
  } else {
    if (state.decoded) pass(`decoded ${state.w}x${state.h}`)
    else fail(`video never decoded (${state.w}x${state.h})`)
    if (state.muted) pass('muted (required for autoplay)')
    else fail('not muted — every browser would refuse to autoplay')
    if (state.inline) pass('playsInline (stops iOS taking it fullscreen)')
    else fail('playsInline missing — iOS would hijack the video')
    if (state.advanced) pass(`playing: currentTime ${state.first.toFixed(2)} → ${state.now.toFixed(2)}`)
    else fail(`never played (currentTime stuck at ${state.now.toFixed(2)}, paused=${state.paused})`)
    if (!state.controls) pass('no control bar over a clean frame')
    else fail('controls showing during autoplay')
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow <= 0) pass('no horizontal overflow')
  else fail(`horizontal overflow of ${overflow}px`)

  await page.close()
}

// Reduced motion: still designed, not stripped, but not moving on its own.
if (want('reduced')) {
  console.log('\n[reduced motion]')
  const page = await browser.newPage()
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.goto(`${BASE}/collections`, { waitUntil: 'networkidle2', timeout: 30000 })

  const state = await playback(page, 'video[src*="__probe"]')
  if (!state.found) fail('no video element found')
  else if (state.advanced) fail('video autoplays despite prefers-reduced-motion')
  else if (!state.controls) fail('paused but no controls — the visitor has no way to play it')
  else pass('held still, controls offered')
  await page.close()
}

// Lightbox: the click is deliberate, so this one keeps its controls.
if (want('lightbox')) {
  console.log('\n[lightbox]')
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${BASE}/collections`, { waitUntil: 'networkidle2', timeout: 30000 })

  const clicked = await page.evaluate(() => {
    const button = Array.from(document.querySelectorAll('button')).find((b) =>
      b.querySelector('video[src*="__probe"]'),
    )
    if (!button) return false
    button.click()
    return true
  })

  if (!clicked) {
    fail('could not find the card button for the video item')
  } else {
    await wait(900)
    const state = await page.evaluate(() => {
      // Scoped to the dialog on purpose — the card behind the overlay is still
      // mounted and has its own video with no controls.
      const dialog = document.querySelector('[role="dialog"]')
      const video = dialog?.querySelector('video[src*="__probe"]')
      if (!video) return { found: false }
      return { found: true, controls: video.controls, paused: video.paused }
    })
    if (!state.found) fail('lightbox did not open the video')
    else if (!state.controls) fail('lightbox video has no controls')
    else pass('opens with controls')
  }
  await page.close()
}

// A browser that refuses autoplay outright (strict settings, low-power mode)
// must not leave a silent frozen frame with no way to play it.
//
// The refusal is injected rather than configured: this chromium build rejects
// both `--autoplay-policy=document-requiring-user-activation` at launch and
// Emulation.setAutoplayPolicy over CDP. Making play() reject with the same
// NotAllowedError a refusing browser raises exercises precisely the branch under
// test — the .catch() that has to surface controls.
if (want('refused')) {
  console.log('\n[play() refused]')
  const page = await browser.newPage()
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 })
  await page.evaluateOnNewDocument(() => {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.reject(new DOMException('autoplay blocked', 'NotAllowedError'))
    }
  })
  await page.goto(`${BASE}/collections`, { waitUntil: 'networkidle2', timeout: 30000 })

  const state = await page.evaluate(async () => {
    const video = document.querySelector('video[src*="__probe"]')
    if (!video) return { found: false }
    await new Promise((r) => setTimeout(r, 1200))
    return { found: true, controls: video.controls, refused: video.controls }
  })

  /* `paused` is deliberately not asserted. The autoplay *attribute* is honoured
     natively, independently of the play() call this overrides, so the element
     still advances here. In a browser that genuinely refuses, both are blocked
     and the visitor gets a paused frame — either way the requirement is the
     same: a refused play() must leave controls on screen, never a dead frame. */
  if (!state.found) fail('no video element found')
  else if (!state.controls) fail('play() was refused and no controls appeared — the video is unreachable')
  else pass('refused play() surfaced controls instead of a dead frame')

  await page.close()
}

await browser.close()

console.log(failures === 0 ? '\nvideo check passed' : `\n${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)

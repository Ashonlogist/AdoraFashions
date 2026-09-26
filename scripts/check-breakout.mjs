/**
 * Guards the breakout frame at real phone and desktop widths.
 *
 * The effect is two overlapping layers, which is exactly the kind of thing that
 * quietly produces a horizontal scrollbar on a phone. These checks measure the
 * real geometry, and — importantly — the real *subject*: a cutout PNG is mostly
 * transparent, so measuring the image box reports an escape about a fifth larger
 * than the eye sees and quietly passes bad geometry. This walks the alpha
 * channel for the visible edges instead.
 *
 *   npm run build && npm run preview &
 *   node scripts/check-breakout.mjs
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const CHROME = process.env.CHROME ?? '/usr/bin/chromium'
const WIDTHS = (process.env.WIDTHS ?? '375,414,768,1440').split(',').map(Number)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
})

let failures = 0
const fail = (message) => {
  console.log(`  FAIL ${message}`)
  failures++
}

/**
 * Runs in the page. Everything it needs has to live inside this function, since
 * only the function itself is serialised across.
 */
const MEASURE = async () => {
  const stage = document.querySelector('.breakout-stage')
  if (!stage) return { missing: true }
  const shape = stage.querySelector('[data-breakout-shape]')
  const image = stage.querySelector('img')
  if (!shape || !image) return { missing: true }

  // DOMRect accessors do not survive the trip out of page.evaluate, so edges
  // are copied out as plain numbers. Returning the rect itself yields undefined
  // and every comparison downstream becomes NaN.
  const box = (node) => {
    const r = node.getBoundingClientRect()
    return {
      left: r.left,
      top: r.top,
      right: r.right,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    }
  }

  // The visible subject: the real alpha edges, mapped into screen coordinates
  // and accounting for the letterboxing `object-contain` introduces.
  const bitmap = await createImageBitmap(image)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(bitmap, 0, 0)
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height)

  let minX = canvas.width
  let minY = canvas.height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (data[(y * canvas.width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const frame = box(image)
  const scale = Math.min(frame.width / bitmap.width, frame.height / bitmap.height)
  const offsetX = frame.left + (frame.width - bitmap.width * scale) / 2
  const offsetY = frame.top + (frame.height - bitmap.height * scale) / 2

  return {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    viewport: window.innerWidth,
    stage: box(stage),
    shape: box(shape),
    subject: {
      left: offsetX + minX * scale,
      right: offsetX + (maxX + 1) * scale,
      top: offsetY + minY * scale,
      bottom: offsetY + (maxY + 1) * scale,
    },
    loaded: image.naturalWidth > 0,
  }
}

for (const route of ['/', '/about']) {
  console.log(`\n${route}`)

  for (const width of WIDTHS) {
    const page = await browser.newPage()
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
    // Measure the resting layout. With motion enabled the entrance is still
    // scaling and translating the artwork when a measurement lands, and the
    // scroll-linked drift keeps a percentage of breathing room permanently, so
    // the numbers describe a frame of the animation rather than the composition.
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const m = await page.evaluate(MEASURE)
    await page.close()

    if (m.missing) {
      fail(`${width}px: no breakout frame found on ${route}`)
      continue
    }
    if (!m.loaded) fail(`${width}px: the artwork never loaded`)

    for (const [name, value] of Object.entries({
      stage: m.stage,
      shape: m.shape,
      subject: m.subject,
    })) {
      if (!value || Object.values(value).some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        fail(`${width}px: ${name} measured as ${JSON.stringify(value)}`)
      }
    }
    if (!Number.isFinite(m.scrollWidth) || !Number.isFinite(m.clientWidth)) {
      fail(`${width}px: scroll metrics were not numbers`)
    }

    if (m.scrollWidth > m.clientWidth) {
      fail(`${width}px: page scrolls sideways (${m.scrollWidth} > ${m.clientWidth})`)
    }

    const overTop = m.shape.top - m.subject.top
    const overLeft = m.shape.left - m.subject.left
    const overRight = m.subject.right - m.shape.right

    if (overTop <= 4) fail(`${width}px: the figure does not clear the shape (top ${overTop.toFixed(0)}px)`)
    if (overRight <= 4) fail(`${width}px: no escape on the right (${overRight.toFixed(0)}px)`)

    // Nothing may be pushed off screen horizontally.
    if (m.subject.left < -1) fail(`${width}px: the figure is cut off on the left (${m.subject.left.toFixed(0)}px)`)
    if (m.subject.right > m.viewport + 1) {
      fail(`${width}px: the figure runs off the right (${m.subject.right.toFixed(0)} > ${m.viewport})`)
    }

    if (width >= 1024) {
      // Desktop is meant to be lopsided: the shape sits left and the figure steps
      // out to the right. An even halo on both sides would mean the composition
      // had lost its direction.
      if (overLeft >= 20) {
        fail(`${width}px: the figure should not escape on the left as well (${overLeft.toFixed(0)}px)`)
      }
      if (overRight - overLeft < 30) {
        fail(
          `${width}px: the desktop escape is not directional (${overLeft.toFixed(0)} left vs ${overRight.toFixed(0)} right)`,
        )
      }
    } else {
      if (overLeft <= 4) fail(`${width}px: no escape on the left (${overLeft.toFixed(0)}px)`)
      if (Math.abs(overRight - overLeft) > 12) {
        fail(`${width}px: the phone composition is off-centre (${overLeft.toFixed(0)} vs ${overRight.toFixed(0)})`)
      }
    }

    if (width <= 414) {
      // "Just slightly past the shape" is a ratio, not a pixel count: what
      // matters is that a phone reads as a restrained version of the desktop
      // composition rather than the same offset shrunk down.
      const sideways = Math.max(overLeft, overRight)
      if (overTop > 60) fail(`${width}px: the escape above the shape is too dramatic for a phone (${overTop.toFixed(0)}px)`)
      if (sideways > 60) fail(`${width}px: the sideways escape is too dramatic for a phone (${sideways.toFixed(0)}px)`)
      if (overTop > 90 || sideways > 90) {
        fail(`${width}px: the phone offset should be responsive, not the desktop one scaled (${overTop.toFixed(0)}/${sideways.toFixed(0)})`)
      }
    }

    console.log(
      `  ok ${String(width).padStart(4)}px  subject escapes top ${overTop.toFixed(0)} left ${overLeft.toFixed(0)} right ${overRight.toFixed(0)}` +
        `  | scroll ${m.scrollWidth}/${m.clientWidth}`,
    )
  }
}

await browser.close()

if (failures) {
  console.log(`\n${failures} breakout problems`)
  process.exit(1)
}
console.log('\nbreakout frame ok')

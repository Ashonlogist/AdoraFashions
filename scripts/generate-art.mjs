/**
 * Placeholder atelier artwork.
 *
 * Every garment and portrait slot on the site expects a transparent PNG, so this
 * script draws each piece as a vector fashion illustration and renders it to
 * `/public/images/*.png` with a real alpha channel. The site therefore looks
 * finished on first run, and the shop owner can drop a photograph straight into
 * the same filename (or a new one, via the admin panel) later.
 *
 *   node scripts/generate-art.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '..', 'public', 'images')

/* Strictly on-palette: the garments are built from charcoal, accent and bone
   at varying opacities, so they read as one collection. */
const C = {
  ink: 'rgba(28,26,23,0.94)',
  inkMid: 'rgba(28,26,23,0.62)',
  inkSoft: 'rgba(28,26,23,0.16)',
  inkFaint: 'rgba(28,26,23,0.08)',
  accent: 'rgba(184,135,90,0.95)',
  accentSoft: 'rgba(184,135,90,0.34)',
  bone: 'rgba(245,241,234,0.92)',
  boneSoft: 'rgba(245,241,234,0.2)',
}

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`

/** Fine construction lines — the seams a tailor would actually mark. */
const seams = (d, opacity = 0.34, width = 1.6) =>
  `<path d="${d}" fill="none" stroke="${C.boneSoft}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round"/>`

const inkSeams = (d, opacity = 0.4, width = 1.4) =>
  `<path d="${d}" fill="none" stroke="${C.inkFaint}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round"/>`

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

const W = 1000
const H = 1400

/** Asymmetric draped evening gown — the hero silhouette. */
const heroGown = svg(
  W,
  H,
  `
  <path d="M352 322 C400 262 470 244 528 262 C586 280 622 322 648 352
           C642 424 618 502 602 572
           C700 700 790 950 838 1214
           C760 1272 640 1300 500 1300
           C360 1300 240 1272 162 1214
           C210 950 300 700 398 572
           C382 502 358 424 352 322 Z" fill="${C.ink}"/>
  <path d="M528 262 C586 280 622 322 648 352 C642 424 618 502 602 572
           C700 700 790 950 838 1214 C760 1272 640 1300 500 1300
           C540 1080 566 800 566 572 C562 440 552 330 528 262 Z" fill="${C.inkFaint}"/>
  <path d="M398 572 C470 596 530 596 602 572 L612 606 C534 632 466 632 388 606 Z" fill="${C.accentSoft}"/>
  <path d="M162 1214 C240 1272 360 1300 500 1300 C640 1300 760 1272 838 1214
           C700 1250 560 1266 500 1266 C440 1266 300 1250 162 1214 Z" fill="${C.inkMid}"/>
  ${seams('M500 596 C500 800 496 1010 500 1266')}
  ${seams('M430 610 C410 830 372 1040 316 1244', 0.22)}
  ${seams('M570 610 C592 830 630 1040 686 1244', 0.22)}
  ${seams('M352 322 C420 296 470 292 528 306', 0.4, 2)}
  ${seams('M500 306 C500 340 500 380 500 420', 0.18)}
  `,
)

/** Designer portrait — three-quarter figure, no facial features, editorial. */
const portrait = svg(
  900,
  1300,
  `
  <path d="M262 640 C300 566 356 528 412 512 L412 452 L488 452 L488 512
           C544 528 600 566 638 640
           C660 812 664 946 640 1074
           C700 1150 736 1210 750 1300 L150 1300
           C164 1210 200 1150 260 1074
           C236 946 240 812 262 640 Z" fill="${C.ink}"/>
  <ellipse cx="450" cy="336" rx="82" ry="98" fill="${C.ink}"/>
  <path d="M450 238 C520 238 546 288 540 344 C534 300 508 276 450 274
           C392 276 366 300 360 344 C354 288 380 238 450 238 Z" fill="${C.inkMid}"/>
  <circle cx="352" cy="300" r="54" fill="${C.ink}"/>
  <circle cx="352" cy="300" r="54" fill="none" stroke="${C.accentSoft}" stroke-width="3"/>
  <path d="M412 452 L488 452 L488 512 C544 528 600 566 638 640 L262 640
           C300 566 356 528 412 512 Z" fill="${C.inkFaint}"/>
  <path d="M360 512 C400 540 500 540 540 512 L556 566 C500 596 400 596 344 566 Z" fill="${C.accentSoft}"/>
  <path d="M150 1300 C164 1210 200 1150 260 1074 C400 1120 500 1120 640 1074
           C700 1150 736 1210 750 1300 Z" fill="${C.inkMid}"/>
  ${seams('M450 452 L450 1074', 0.26)}
  ${seams('M300 700 C360 736 540 736 600 700', 0.2)}
  ${seams('M262 640 C300 566 356 528 412 512', 0.3, 2)}
  ${seams('M638 640 C600 566 544 528 488 512', 0.3, 2)}
  ${inkSeams('M330 1000 C400 1030 500 1030 570 1000')}
  `,
)

/** Bridal — structured bodice with a full wrapper skirt and headwrap. */
const bridalStructured = svg(
  W,
  H,
  `
  <path d="M356 486 C400 430 462 412 500 412 C538 412 600 430 644 486
           C640 546 622 604 610 646 L390 646 C378 604 360 546 356 486 Z" fill="${C.ink}"/>
  <path d="M390 646 C446 664 554 664 610 646
           C690 760 776 990 820 1230 C724 1284 606 1304 500 1304
           C394 1304 276 1284 180 1230 C224 990 310 760 390 646 Z" fill="${C.inkMid}"/>
  <path d="M390 646 C446 664 554 664 610 646 C636 700 658 764 674 834
           C580 862 420 862 326 834 C342 764 364 700 390 646 Z" fill="${C.accentSoft}"/>
  <path d="M180 1230 C276 1284 394 1304 500 1304 C606 1304 724 1284 820 1230
           C700 1266 560 1282 500 1282 C440 1282 300 1266 180 1230 Z" fill="${C.accent}"/>
  <path d="M356 486 C400 430 462 412 500 412 C538 412 600 430 644 486
           C560 466 440 466 356 486 Z" fill="${C.boneSoft}"/>
  <path d="M330 268 C348 200 420 162 500 162 C580 162 652 200 670 268
           C640 244 580 232 500 232 C420 232 360 244 330 268 Z" fill="${C.ink}"/>
  ${seams('M500 412 L500 646', 0.3)}
  ${seams('M430 646 C420 830 396 1030 372 1250', 0.2)}
  ${seams('M570 646 C580 830 604 1030 628 1250', 0.2)}
  ${seams('M356 486 C440 466 560 466 644 486', 0.45, 2.2)}
  <circle cx="500" cy="546" r="9" fill="${C.boneSoft}"/>
  <circle cx="500" cy="586" r="9" fill="${C.boneSoft}"/>
  `,
)

/** Traditional — shirt-waist dress with a kente panel band. */
const traditionalShirt = svg(
  W,
  H,
  `
  <path d="M372 404 C412 372 452 358 500 358 C548 358 588 372 628 404
           C664 420 700 452 716 494 L664 546 C650 512 628 486 600 470
           C612 540 620 606 622 664 L378 664 C380 606 388 540 400 470
           C372 486 350 512 336 546 L284 494 C300 452 336 420 372 404 Z" fill="${C.ink}"/>
  <path d="M378 664 C446 682 554 682 622 664
           C706 800 776 1010 812 1240 C712 1290 600 1310 500 1310
           C400 1310 288 1290 188 1240 C224 1010 294 800 378 664 Z" fill="${C.ink}"/>
  <path d="M392 700 C452 720 548 720 608 700 C630 748 650 800 664 856
           C572 886 428 886 336 856 C350 800 370 748 392 700 Z" fill="${C.accent}"/>
  <path d="M336 856 C428 886 572 886 664 856 L700 1040 C604 1074 396 1074 300 1040 Z" fill="${C.accentSoft}"/>
  <path d="M188 1240 C288 1290 400 1310 500 1310 C600 1310 712 1290 812 1240
           C700 1272 560 1288 500 1288 C440 1288 300 1272 188 1240 Z" fill="${C.inkMid}"/>
  ${seams('M500 358 L500 664', 0.28)}
  ${seams('M600 470 C620 520 624 590 622 664', 0.24)}
  ${seams('M400 470 C380 520 376 590 378 664', 0.24)}
  ${seams('M336 856 C428 886 572 886 664 856', 0.4, 2)}
  <circle cx="500" cy="480" r="7" fill="${C.boneSoft}"/>
  <circle cx="500" cy="530" r="7" fill="${C.boneSoft}"/>
  <circle cx="500" cy="580" r="7" fill="${C.boneSoft}"/>
  `,
)

/** Bridal — cathedral gown, corseted, with veil and train. */
const bridalCathedral = svg(
  W,
  H,
  `
  <path d="M384 300 C424 250 470 236 500 236 C530 236 576 250 616 300
           C606 400 588 500 578 590 L422 590 C412 500 394 400 384 300 Z" fill="${C.accent}"/>
  <path d="M384 300 C424 250 470 236 500 236 C530 236 576 250 616 300
           C560 282 440 282 384 300 Z" fill="${C.boneSoft}"/>
  <path d="M422 590 C470 606 530 606 578 590
           C676 730 762 990 800 1236 C694 1288 596 1306 500 1306
           C404 1306 306 1288 200 1236 C238 990 324 730 422 590 Z" fill="${C.accent}"/>
  <path d="M422 590 C470 606 530 606 578 590 C610 646 638 712 660 786
           C568 818 432 818 340 786 C362 712 390 646 422 590 Z" fill="${C.boneSoft}"/>
  <path d="M200 1236 C306 1288 404 1306 500 1306 C596 1306 694 1288 800 1236
           C672 1268 552 1282 500 1282 C448 1282 328 1268 200 1236 Z" fill="${C.accentSoft}"/>
  <path d="M368 268 C392 200 452 168 500 168 C548 168 608 200 632 268
           C700 360 726 560 736 820 C746 1080 742 1240 738 1330 L262 1330
           C258 1240 254 1080 264 820 C274 560 300 360 368 268 Z" fill="${C.boneSoft}"/>
  ${seams('M500 236 L500 590', 0.3)}
  ${seams('M446 590 C430 810 404 1040 386 1270', 0.22)}
  ${seams('M554 590 C570 810 596 1040 614 1270', 0.22)}
  ${seams('M384 300 C440 282 560 282 616 300', 0.45, 2.2)}
  ${inkSeams('M452 380 L452 580', 0.3)}
  ${inkSeams('M548 380 L548 580', 0.3)}
  `,
)

/** Evening — asymmetric drape from a single shoulder. */
const eveningDrape = svg(
  W,
  H,
  `
  <path d="M470 258 C500 246 540 254 562 282 C610 344 640 420 656 486
           C636 540 618 580 606 612 L406 612 C400 552 398 470 410 386
           C424 322 444 278 470 258 Z" fill="${C.ink}"/>
  <path d="M406 612 C464 632 548 632 606 612
           C692 760 768 990 806 1230 C702 1286 598 1306 500 1306
           C402 1306 298 1286 194 1230 C232 990 308 760 406 612 Z" fill="${C.ink}"/>
  <path d="M606 612 C650 700 682 812 700 934 C610 890 520 826 452 742
           C540 748 610 700 606 612 Z" fill="${C.inkFaint}"/>
  <path d="M606 612 C650 700 682 812 700 934 L616 964 C588 838 540 712 470 646 Z" fill="${C.accentSoft}"/>
  <path d="M194 1230 C298 1286 402 1306 500 1306 C598 1306 702 1286 806 1230
           C680 1266 560 1282 500 1282 C440 1282 320 1266 194 1230 Z" fill="${C.inkMid}"/>
  ${seams('M500 632 C500 840 498 1040 500 1282')}
  ${seams('M430 640 C406 850 366 1050 320 1250', 0.2)}
  ${seams('M562 640 C590 850 632 1050 680 1250', 0.2)}
  ${seams('M470 258 C500 246 540 254 562 282', 0.4, 2)}
  `,
)

/** Corporate — properly drafted two-piece suit. */
const corporateSuit = svg(
  W,
  H,
  `
  <path d="M330 330 C368 300 412 288 450 296 L500 400 L550 296
           C588 288 632 300 670 330 C736 372 782 430 796 500 L740 552
           C722 508 692 476 652 458 C676 620 686 800 682 960 L318 960
           C314 800 324 620 348 458 C308 476 278 508 260 552 L204 500
           C218 430 264 372 330 330 Z" fill="${C.ink}"/>
  <path d="M450 296 L500 400 L550 296 C560 292 570 290 580 290
           C566 420 552 620 546 960 L454 960 C448 620 434 420 420 290
           C430 290 440 292 450 296 Z" fill="${C.boneSoft}"/>
  <path d="M500 400 L546 960 L454 960 Z" fill="${C.accentSoft}"/>
  <path d="M318 960 C400 986 600 986 682 960 L690 1000 C600 1026 400 1026 310 1000 Z" fill="${C.accent}"/>
  <path d="M330 1000 C420 1024 580 1024 670 1000 L760 1300 L700 1300
           C660 1180 620 1090 596 1030 L404 1030 C380 1090 340 1180 300 1300
           L240 1300 Z" fill="${C.inkMid}"/>
  <path d="M204 500 L260 552 C278 508 308 476 348 458 C324 620 314 800 318 960
           L240 960 C236 800 244 620 262 500 Z" fill="${C.inkFaint}"/>
  <path d="M740 552 L796 500 C782 620 764 800 760 960 L682 960
           C686 800 676 620 652 458 C692 476 722 508 740 552 Z" fill="${C.inkFaint}"/>
  <circle cx="500" cy="520" r="8" fill="${C.boneSoft}"/>
  <circle cx="500" cy="700" r="8" fill="${C.boneSoft}"/>
  ${seams('M348 458 C400 430 600 430 652 458', 0.34, 2)}
  ${seams('M500 400 L500 960', 0.24)}
  `,
)

/** Everyday — the slip dress we are asked for most. */
const everydaySlip = svg(
  W,
  H,
  `
  <path d="M500 226 C512 226 520 236 520 250 L520 300
           C520 316 512 326 500 326 C488 326 480 316 480 300 L480 250
           C480 236 488 226 500 226 Z" fill="${C.ink}"/>
  <path d="M424 322 C444 300 476 292 500 292 C524 292 556 300 576 322
           C586 400 596 520 602 618 L398 618 C404 520 414 400 424 322 Z" fill="${C.ink}"/>
  <path d="M398 618 C450 634 550 634 602 618
           C694 790 764 1010 800 1244 C700 1294 598 1314 500 1314
           C402 1314 300 1294 200 1244 C236 1010 306 790 398 618 Z" fill="${C.ink}"/>
  <path d="M424 322 C444 300 476 292 500 292 C476 320 468 420 470 618 L398 618
           C404 520 414 400 424 322 Z" fill="${C.inkFaint}"/>
  <path d="M398 618 C450 634 550 634 602 618 L610 668 C550 688 450 688 390 668 Z" fill="${C.accentSoft}"/>
  <path d="M200 1244 C300 1294 402 1314 500 1314 C598 1314 700 1294 800 1244
           C680 1276 560 1292 500 1292 C440 1292 320 1276 200 1244 Z" fill="${C.inkMid}"/>
  ${seams('M500 292 L500 1314', 0.22)}
  ${seams('M430 340 C414 500 396 700 372 880', 0.16)}
  ${seams('M570 340 C586 500 604 700 628 880', 0.16)}
  ${seams('M424 322 C460 306 540 306 576 322', 0.4, 2)}
  `,
)

/* -------------------------------------------------------------------------- */

const pieces = [
  { file: 'hero-main.png', width: 1100, height: 1500, markup: heroGown },
  { file: 'about-portrait.png', width: 900, height: 1300, markup: portrait, fill: 0.94, floor: 0.02 },
  { file: 'collection-bridal-01.png', width: 1000, height: 1400, markup: bridalStructured },
  { file: 'collection-traditional-01.png', width: 1000, height: 1400, markup: traditionalShirt },
  { file: 'collection-bridal-02.png', width: 1000, height: 1400, markup: bridalCathedral },
  { file: 'collection-evening-01.png', width: 1000, height: 1400, markup: eveningDrape },
  { file: 'collection-corporate-01.png', width: 1000, height: 1400, markup: corporateSuit },
  { file: 'collection-everyday-01.png', width: 1000, height: 1400, markup: everydaySlip },
]

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#1C1A17"/>
  <text x="32" y="45" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="#F5F1EA">A</text>
  <circle cx="49" cy="47" r="3" fill="#B8875A"/>
</svg>`

await mkdir(outDir, { recursive: true })

/**
 * Each drawing is trimmed to its own alpha bounds and then re-composed onto a
 * uniform canvas, standing on a common "floor" line. Without this the pieces
 * float at different scales inside their frames and the collections grid looks
 * accidental rather than art-directed.
 */
async function render(piece) {
  const { file, width, height, markup, fill = 0.9, floor = 0.05 } = piece
  const inset = 0.06

  const drawn = await sharp(Buffer.from(markup), { density: 260 })
    .trim({ threshold: 6 })
    .toBuffer()

  const trimmed = sharp(drawn)
  const meta = await trimmed.metadata()
  const maxW = width * (1 - inset * 2)
  const maxH = height * fill
  const ratio = Math.min(maxW / meta.width, maxH / meta.height)
  const scaled = await trimmed
    .resize(Math.round(meta.width * ratio), Math.round(meta.height * ratio), {
      fit: 'fill',
      kernel: 'lanczos3',
    })
    .png()
    .toBuffer()

  const scaledMeta = await sharp(scaled).metadata()
  const left = Math.round((width - scaledMeta.width) / 2)
  const top = Math.round(height - height * floor - scaledMeta.height)

  await sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: scaled, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, file))

  process.stdout.write(
    `rendered ${file.padEnd(32)} source ${meta.width}x${meta.height} -> ${scaledMeta.width}x${scaledMeta.height}\n`,
  )
}

for (const piece of pieces) {
  await render(piece)
}

await writeFile(resolve(here, '..', 'public', 'favicon.svg'), favicon, 'utf8')
process.stdout.write('rendered favicon.svg\n')

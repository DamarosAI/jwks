/* THE BANNER IS THE SITE'S OWN SHEET, CUT TO LINKEDIN'S FRAME.

   1584x396 is the profile banner LinkedIn actually stores, and the avatar
   punches through its bottom-left corner - a ~213px circle sitting about
   34px in, centred on the banner's own bottom edge. So the mark goes ABOVE
   that circle rather than beside it, and the sentence goes to the far corner
   where nothing overlaps it.

   Nothing here is invented: the ground is the section lattice at its own
   26px pitch, the ink and the accent are the site tokens, the mark is set in
   Endless and the sentence in Switzer - the same division of labour the page
   makes between the display face and the UI face. The lattice runs unbroken
   under both lines: nothing is knocked out behind the type, the way the
   page sets its own copy straight onto the field. The drum is the hero's own
   motif, treated the way the hero and the closing CTA treat it - oversized
   past the frame it is in, bled off three edges, tipped -11deg and dropped
   to a wash the copy can sit straight on top of. It is bigger than the
   banner is tall, which is the point: on the page the mark is never a badge
   in a corner, it is the thing the sheet is cut out of. Fonts are inlined as data
   URIs because the renderer is a file:// page and a missing face would
   silently fall back to Helvetica. */

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)
const asset = (path) => readFileSync(new URL(path, root)).toString('base64')

const WIDTH = 1584
const HEIGHT = 396
const OUT = new URL('assets/damaros-linkedin-banner.png', root)

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: 'Endless';
    src: url(data:font/ttf;base64,${asset('public/assets/endless.ttf')}) format('truetype');
    font-weight: 400; font-style: normal; font-display: block;
  }
  @font-face {
    font-family: 'Switzer';
    src: url(data:font/woff2;base64,${asset('public/assets/fonts/switzer-500.woff2')}) format('woff2');
    font-weight: 500; font-style: normal; font-display: block;
  }
  :root {
    --ink: #10161d;
    --accent: #2f6193;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    position: relative;
    background: #ffffff;
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
  }

  /* THE GROUND. The lattice at the section's own pitch - 26px, a 1.1px dot,
     the accent at 38% - over one bloom of accent in the top right, which is
     the body gradient of the page itself and the only thing keeping the
     white from reading as bare paper. */
  .field {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(circle 760px at 92% -10%, rgba(47, 97, 147, 0.055), transparent 72%),
      radial-gradient(circle at center, rgba(47, 97, 147, 0.46) 1.2px, transparent 1.55px);
    background-size: 100% 100%, 26px 26px;
    background-position: center, 13px 13px;
  }

  /* One centred lockup: the name, and the line it is making. Centred on the
     banner's own middle - 104 of Endless over 27 of Switzer with the gap
     between them read as one block - so the pair sits on the horizon of the
     frame rather than in a corner of it. */
  .lockup {
    position: absolute;
    left: 0; right: 0; top: 50%;
    transform: translateY(-50%);
    text-align: center;
  }

  .mark {
    color: var(--ink);
    font-family: 'Endless', sans-serif;
    font-weight: 400;
    font-size: 104px;
    letter-spacing: 0.01em;
    line-height: 1;
    font-kerning: none;
    font-variant-ligatures: none;
    font-feature-settings: 'kern' 0, 'liga' 0, 'calt' 0;
  }

  .claim {
    margin-top: 22px;
    color: var(--ink);
    font-family: 'Switzer', sans-serif;
    font-weight: 500;
    font-size: 27px;
    letter-spacing: -0.004em;
    line-height: 1.2;
    white-space: nowrap;
  }
  .claim em { font-style: normal; color: var(--accent); }

  /* Off the centre line and off the vertical middle, and larger than the
     frame: 634px of drum in a 396px band, so it runs out past the top, the
     bottom and the right edge and only the middle of the mark is on the
     sheet. 0.24 sits between the hero's 0.28 and the CTA's 0.17. */
  .drum {
    position: absolute;
    right: -110px; top: -150px;
    width: 580px; height: 634px;
    opacity: 0.24;
    transform: rotate(-11deg);
    transform-origin: 50% 50%;
  }
</style></head>
<body>
  <div class="field"></div>
  <svg class="drum" viewBox="0 0 476 520" fill="none" stroke="var(--accent)" stroke-width="33" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
    <path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"/>
    <path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"/>
  </svg>
  <div class="lockup">
    <div class="mark">Damaros</div>
    <p class="claim">Agentic infrastructure <em>for clinical research.</em></p>
  </div>
</body></html>`

const dir = mkdtempSync(join(tmpdir(), 'damaros-banner-'))
const page = join(dir, 'banner.html')
writeFileSync(page, html)

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--window-size=${WIDTH},${HEIGHT}`,
  '--virtual-time-budget=4000',
  `--screenshot=${OUT.pathname}`,
  `file://${page}`,
], { stdio: 'inherit' })

console.log(`wrote ${OUT.pathname} at ${WIDTH}x${HEIGHT}`)

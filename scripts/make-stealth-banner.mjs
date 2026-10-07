/* THE STEALTH BANNER. Just the survey, cut to LinkedIn's 1584x396 frame: the contours from
   stealth/topo-banner.svg on the page's own ground, blue, slate, blue, then an accent line in the
   house blue at twice the weight. No mark, no words. The summit sits right of centre because the avatar punches through
   the bottom-left corner.

     python3 stealth/make-topo.py && node scripts/make-stealth-banner.mjs

   Rendered with headless Chrome, the same way scripts/make-linkedin-banner.mjs renders its banner. */

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url)
const WIDTH = 1584
const HEIGHT = 396
const OUT = new URL('assets/damaros-linkedin-banner-stealth.png', root)
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const topo = readFileSync(new URL('stealth/topo-banner.svg', root), 'utf8')

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body {
    background:
      radial-gradient(ellipse 640px 300px at 1080px 214px, #fbfcfe 0%, rgba(248, 250, 252, 0) 70%),
      linear-gradient(180deg, #f8fafc 0%, #e9eff5 100%);
  }
  .topo { position: absolute; inset: 0; width: 100%; height: 100%; fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .topo-ink { stroke: #10161d; stroke-opacity: 0.12; stroke-width: 1; }
  .topo-blue { stroke: #2f6193; stroke-opacity: 0.3; stroke-width: 1; }
  .topo-index { stroke: #214d79; stroke-opacity: 0.5; stroke-width: 2; }
</style></head><body>${topo}</body></html>`

const dir = mkdtempSync(join(tmpdir(), 'damaros-stealth-banner-'))
const page = join(dir, 'banner.html')
writeFileSync(page, html)

execFileSync(CHROME, [
  '--headless',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  `--window-size=${WIDTH},${HEIGHT}`,
  '--virtual-time-budget=2000',
  `--screenshot=${OUT.pathname}`,
  `file://${page}`,
], { stdio: 'inherit' })

console.log(`wrote ${OUT.pathname} at ${WIDTH}x${HEIGHT}`)

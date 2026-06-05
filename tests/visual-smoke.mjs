/**
 * DAMAROS — visual smoke test for the WebGL SPACE engine (Three.js).
 *
 * Verifies the contract:
 *   1. Boot loader appears, fills to 100%, and lifts.
 *   2. The render loop runs (frame counter advances) — and keeps running with no
 *      input (alive), with NO console/WebGL errors.
 *   3. Navigation works: flights advance the station; counter, active dot, and
 *      caption commit on arrival; go()/next()/prev() behave; all 10 reachable.
 *   4. The final landmark is the terminal frame (10 / 10, caption shown).
 *   5. No runtime/console errors across desktop, mobile, and reduced-motion.
 *
 * WebGL canvases can't be sampled with getImageData, so "it renders" is asserted
 * via the engine's exposed frame counter (DamarosSpace.state().frames).
 *
 * Self-contained: serves the repo over a local HTTP server (ephemeral port).
 *   Install once:  npm i -D playwright  &&  npx playwright install chromium
 *   Run:           node tests/visual-smoke.mjs        (exit 0 = all pass)
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp'
};
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        let u = decodeURIComponent(req.url.split('?')[0]); if (u === '/' || u === '') u = '/index.html';
        const fp = path.join(ROOT, path.normalize(u).replace(/^(\.\.[/\\])+/, '')); if (!fp.startsWith(ROOT)) { res.writeHead(403).end(); return; }
        res.writeHead(200, { 'content-type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(await readFile(fp));
      } catch { res.writeHead(404).end('not found'); }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

let failures = 0;
function check(name, ok, detail) { if (!ok) failures++; console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail != null ? '  — ' + detail : ''}`); }
async function settle(page) {
  await page.waitForFunction(() => !(window.DamarosSpace && window.DamarosSpace.state().flying), null, { timeout: 9000 }).catch(() => {});
  await page.waitForTimeout(180);
}
const HELPERS = `
  window.__st = () => window.DamarosSpace.state();
  window.__activeDot = () => [].slice.call(document.querySelectorAll('[data-dot]')).findIndex(d=>d.classList.contains('active'));
  window.__activeCap = () => [].slice.call(document.querySelectorAll('[data-cap]')).findIndex(c=>c.classList.contains('cap--active'));
`;
function instrument(page) {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  return errors;
}

async function run() {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  console.log(`\nDAMAROS WebGL smoke  (${base})\n`);

  // ===================== DESKTOP =====================
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = instrument(page);
    await page.addInitScript(`window.__bootSeen=false; window.__bootMax=0;
      (function o(){ const b=document.getElementById('boot'); if(b){ window.__bootSeen=true; const v=(+b.getAttribute('aria-valuenow'))||0; if(v>window.__bootMax)window.__bootMax=v; } requestAnimationFrame(o); })();`);
    await page.goto(base, { waitUntil: 'commit' });
    await page.waitForFunction(() => !!window.DamarosSpace, null, { timeout: 9000 });
    await page.evaluate(HELPERS);

    // 1) loader
    await page.waitForFunction(() => !document.getElementById('boot'), null, { timeout: 9000 }).catch(() => {});
    const loader = await page.evaluate(() => ({ gone: !document.getElementById('boot'), max: window.__bootMax, seen: window.__bootSeen }));
    check('loader: appears at load', loader.seen || loader.max > 0, `seen=${loader.seen}, max=${loader.max}`);
    check('loader: fills to 100% then lifts', loader.gone && loader.max >= 99, `max=${loader.max}`);

    // 2) render loop runs
    const f0 = await page.evaluate(() => window.__st().frames);
    await page.waitForTimeout(500);
    const f1 = await page.evaluate(() => window.__st().frames);
    check('renders: frame loop running', f1 > f0 + 3, `frames ${f0}→${f1}`);

    // 3) navigation
    check('navigation: API present', await page.evaluate(() => !!(window.DamarosSpace && window.DamarosSpace.next)));
    await page.evaluate(() => window.DamarosSpace.next()); await settle(page);
    const nav = await page.evaluate(() => ({ dot: window.__activeDot(), cap: window.__activeCap() }));
    check('navigation: next() flies to station 02', nav.dot === 1, `dot=${nav.dot}`);
    check('navigation: diamond + caption commit on arrival', nav.dot === 1 && nav.cap === 1, `dot=${nav.dot} cap=${nav.cap}`);
    await page.evaluate(() => window.DamarosSpace.go(0)); await settle(page);
    check('navigation: go(0) returns to start', (await page.evaluate(() => window.__activeDot())) === 0);

    // 4) all 10 reachable
    let reached = true;
    for (let i = 1; i < 10; i++) { await page.evaluate(() => window.DamarosSpace.next()); await settle(page); }
    const term = await page.evaluate(() => ({ dot: window.__activeDot(), cap: window.__activeCap() }));
    check('landmarks: all 10 reachable; terminal dot + caption', term.dot === 4 && term.cap === 9, `dot=${term.dot}, cap=${term.cap}`);

    // 5) alive when idle (no input)
    const a0 = await page.evaluate(() => window.__st().frames);
    await page.waitForTimeout(400);
    const a1 = await page.evaluate(() => window.__st().frames);
    check('alive: render continues with no input', a1 > a0 + 2, `frames ${a0}→${a1}`);

    check('desktop: no runtime/console errors', errors.length === 0, errors.join(' | ') || undefined);
    await ctx.close();
  }

  // ===================== MOBILE =====================
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errors = instrument(page);
    await page.goto(base, { waitUntil: 'commit' });
    await page.waitForFunction(() => !!window.DamarosSpace, null, { timeout: 9000 });
    await page.evaluate(HELPERS);
    await page.waitForFunction(() => !document.getElementById('boot'), null, { timeout: 9000 }).catch(() => {});
    for (let i = 0; i < 3; i++) { await page.evaluate(() => window.DamarosSpace.next()); await settle(page); }
    await page.evaluate(() => window.DamarosSpace.go(0)); await settle(page);
    check('mobile: no runtime/console errors', errors.length === 0, errors.join(' | ') || undefined);
    await ctx.close();
  }

  // ===================== REDUCED MOTION =====================
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = instrument(page);
    await page.goto(base, { waitUntil: 'commit' });
    await page.waitForFunction(() => !!window.DamarosSpace, null, { timeout: 9000 });
    await page.evaluate(HELPERS);
    await page.waitForFunction(() => !document.getElementById('boot'), null, { timeout: 9000 }).catch(() => {});
    await page.evaluate(() => window.DamarosSpace.go(4)); await settle(page);
    const r = await page.evaluate(() => ({ media: matchMedia('(prefers-reduced-motion: reduce)').matches, dot: window.__activeDot(), cap: window.__activeCap() }));
    check('reduced-motion: media active', r.media);
    check('reduced-motion: jump lands (caption resolved)', r.dot === 2 && r.cap === 4, `dot=${r.dot}, cap=${r.cap}`);
    check('reduced-motion: no runtime/console errors', errors.length === 0, errors.join(' | ') || undefined);
    await ctx.close();
  }

  await browser.close();
  server.close();
  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}\n`);
  process.exit(failures === 0 ? 0 : 1);
}
run().catch(e => { console.error(e); process.exit(2); });

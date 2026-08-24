import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const mobile = await readFile(new URL('./mobile.css', import.meta.url), 'utf8')
const driver = await readFile(new URL('./diagrams/useScrollPhase.js', import.meta.url), 'utf8')
const chrome = await readFile(new URL('./diagrams/ConsoleChrome.jsx', import.meta.url), 'utf8')
const trident = await readFile(new URL('./diagrams/TridentConsole.jsx', import.meta.url), 'utf8')
const nectar = await readFile(new URL('./diagrams/NectarConsole.jsx', import.meta.url), 'utf8')

const sources = [driver, chrome, trident, nectar]
const consoles = [trident, nectar]

describe('Trident and Nectar consoles', () => {
  it('keeps the panels on the light field', () => {
    for (const source of [css, ...sources]) {
      assert.doesNotMatch(source, /#0a0f18/i)
      assert.doesNotMatch(source, /rgba\(10,\s*15,\s*24/)
    }
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?background:\s*var\(--surface-solid\);/)
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?border:\s*1px solid var\(--border\);/)
  })

  it('lets the Trident headline wrap instead of running under the panel', () => {
    assert.doesNotMatch(css, /\.trident-copy h2 span \{[^}]*white-space:\s*nowrap/)
    assert.match(css, /\.trident-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.nectar-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.trident-copy \{[\s\S]*?min-width:\s*0;/)
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?min-width:\s*0;/)
  })

  it('stacks both sections before the mobile sheet opens', () => {
    assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.trident-section,\s*\n\s*\.nectar-section \{[\s\S]*?flex-direction:\s*column;/)
  })

  it('drops the absolute eyebrow out of the grid so it aligns with every other section', () => {
    assert.doesNotMatch(css, /\.trident-section > \.section-eyebrow/)
    assert.doesNotMatch(css, /\.nectar-section > \.section-eyebrow/)
  })

  it('wears the workspace chrome rather than a lookalike of it', () => {
    // The chrome classes are the landing demo's own, so the panels inherit the
    // coloured traffic lights, the breadcrumb rule and the live dot for free.
    assert.match(chrome, /className="mac-titlebar"/)
    assert.match(chrome, /className="traffic-lights"/)
    assert.match(chrome, /className="window-breadcrumb"/)
    assert.match(chrome, /className="window-title window-brand"/)
    assert.match(chrome, /window-live\$\{pulse \? '' : ' is-parked'\}/)
    assert.doesNotMatch(css, /\.pconsole-bar|\.pconsole-lights|@keyframes pconsole-pulse/)
    for (const source of consoles) {
      assert.match(source, /<ConsoleChrome name="\w+"/)
      assert.doesNotMatch(source, /getContext|requestAnimationFrame|<canvas/)
    }
    assert.doesNotMatch(app, /Canvas/)
  })

  it('carries the monogram in both consoles', () => {
    assert.match(chrome, /damaros-monogram-blue\.svg/)
    // Nectar draws the site boundary with the mark itself - the monogram is
    // two masses with a gap, and the gap is the boundary.
    assert.match(nectar, /className="nc-gate-mark"/)
    assert.match(nectar, /damaros-monogram-blue\.svg/)
    assert.match(css, /\.nc-gate-mark img \{[\s\S]*?object-fit:\s*contain;/)
  })

  it('borrows the workspace nav grammar for the provider rail', () => {
    assert.match(css, /\.tc-provider\.active \{[\s\S]*?background:\s*color-mix\(in srgb, var\(--accent\) 8%, var\(--surface-solid\)\);/)
    assert.match(css, /\.tc-provider\.active::before \{[\s\S]*?background:\s*var\(--accent\);/)
    assert.match(css, /\.nc-sites > div\.is-active::before \{[\s\S]*?background:\s*var\(--accent\);/)
  })

  it('runs on the reader scroll, not on a timer', () => {
    assert.match(driver, /ScrollTrigger\.create\(\{/)
    assert.match(driver, /onUpdate: \(self\) => apply\(self\.progress\)/)
    assert.match(driver, /return reduced \? rest : phase/)
    for (const source of [...sources]) {
      assert.doesNotMatch(source, /setTimeout|setInterval/)
    }
    for (const source of consoles) {
      assert.match(source, /useScrollPhase\(PHASES, \{ reduced, target: section \}\)/)
      assert.match(source, /export default function \w+Console\(\{ animate = true, reduced = false, section \}\)/)
    }
    assert.match(app, /<TridentConsole animate=\{animate\} reduced=\{reduced\} section=\{root\} \/>/)
    assert.match(app, /<NectarConsole animate=\{animate\} reduced=\{reduced\} section=\{root\} \/>/)
  })

  it('gives the beat that carries the claim the widest stretch of scroll', () => {
    // A reader parked mid-section lands on the checkpoint hold and on the
    // refusal, because those beats are the headlines.
    assert.match(trident, /span: 2\.2, step: 2, state: 'hold'/)
    assert.match(nectar, /span: 2\.2, released: true, refused: true/)
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /Accepted by M\. Avdol/)
    assert.match(trident, /Receipt written/)
    assert.match(nectar, /Structure crosses\. Records do not\./)
    assert.match(nectar, /status: 'STEADY'/)
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.pconsole \.window-live i \{ animation: none; \}/)
  })

  it('lets the consoles size to their own content on a phone', () => {
    assert.match(mobile, /#root \.trident-diagram,\s*\n\s*#root \.nectar-network \{[\s\S]*?aspect-ratio:\s*auto;/)
    assert.match(mobile, /#root \.tc-rail \{[\s\S]*?grid-template-columns:\s*subgrid;/)
    assert.match(mobile, /#root \.nc-gate-side \{ display: none; \}/)
  })

  it('keeps ontology out of public copy', () => {
    for (const source of [app, css, ...sources]) {
      assert.doesNotMatch(source, /ontolog/i)
    }
  })

  it('keeps console source inside the supplied character set', () => {
    for (const source of sources) {
      const unsupported = [...source].filter((character) => character.codePointAt(0) > 127)
      assert.deepEqual(unsupported, [])
    }
  })
})

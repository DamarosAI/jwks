import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const mobile = await readFile(new URL('./mobile.css', import.meta.url), 'utf8')
const driver = await readFile(new URL('./diagrams/useScrollPhase.js', import.meta.url), 'utf8')
const pan = await readFile(new URL('./diagrams/useCenterOnOverflow.js', import.meta.url), 'utf8')
const trident = await readFile(new URL('./diagrams/TridentSchematic.jsx', import.meta.url), 'utf8')
const nectar = await readFile(new URL('./diagrams/NectarSchematic.jsx', import.meta.url), 'utf8')

const sources = [driver, pan, trident, nectar]
const figures = [trident, nectar]

// Every literal colour, radius and face in the schematic layer has to come from
// the site's own token set - that is the whole point of the rewrite.
const DGM_BLOCK = css.slice(
  css.indexOf('/* -- Trident and Nectar schematics --'),
  css.indexOf('/* Stack Trident and Nectar below 900px.'),
)

describe('Trident and Nectar schematics', () => {
  it('draws technical figures, not product panels', () => {
    for (const source of figures) {
      assert.match(source, /<svg/)
      assert.match(source, /viewBox="0 0 620 \d{3}"/)
      assert.match(source, /className="dgm-head"/)
      // No window chrome, no app furniture, no per-frame canvas work.
      assert.doesNotMatch(source, /mac-titlebar|traffic-lights|window-breadcrumb|window-live/)
      assert.doesNotMatch(source, /getContext|requestAnimationFrame|<canvas/)
    }
    assert.doesNotMatch(app, /Canvas|Console/)
    assert.doesNotMatch(css, /\.pconsole|\.tc-provider|\.nc-lane/)
  })

  it('borrows every value from the site token set', () => {
    // Only tokens, white, and transparent may appear as colours.
    const colours = DGM_BLOCK.match(/#[0-9a-f]{3,8}\b|\brgba?\(/gi) || []
    assert.deepEqual(colours, [])
    assert.match(DGM_BLOCK, /font-family: var\(--font-ui\)/)
    assert.match(DGM_BLOCK, /font-family: var\(--font-mono\)/)
    for (const source of [css, ...sources]) {
      assert.doesNotMatch(source, /#0a0f18/i)
    }
  })

  it('keeps the panels on the light field', () => {
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?background:\s*var\(--surface-solid\);/)
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?border:\s*1px solid var\(--border\);/)
  })

  it('lets the Trident headline wrap instead of running under the panel', () => {
    assert.doesNotMatch(css, /\.trident-copy h2 span \{[^}]*white-space:\s*nowrap/)
    assert.match(css, /\.trident-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.nectar-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.trident-copy \{[\s\S]*?min-width:\s*0;/)
  })

  it('stacks both sections before the mobile sheet opens', () => {
    assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.trident-section,\s*\n\s*\.nectar-section \{[\s\S]*?flex-direction:\s*column;/)
    assert.doesNotMatch(css, /\.trident-section > \.section-eyebrow/)
  })

  it('draws the trident as topology, not as ornament', () => {
    // Three tines, one crossbar, one shaft: the figure is the system.
    assert.equal(PROVIDER_COUNT(trident), 3)
    assert.match(trident, /const ROUTE = 'M 129 118 V 152 H 310 V 442'/)
    assert.match(trident, /d="M 129 152 H 491"/)
  })

  it('shuts the gate rather than colouring a status light', () => {
    for (const source of figures) {
      assert.match(source, /className="dgm-jamb"/)
      assert.match(source, /url\(#\w+-hatch\)/)
    }
    assert.match(trident, /fill=\{open \? 'var\(--surface-solid\)' : 'url\(#tr-hatch\)'\}/)
    // Nectar has two gates on one wall: one opens, one never does.
    assert.equal((nectar.match(/className="dgm-port"/g) || []).length, 2)
    assert.match(nectar, /<rect className="dgm-port" x="416"[^>]*fill="url\(#nc-hatch\)"/)
    assert.match(css, /\.dgm-gateway\.is-open \.dgm-jamb \{ stroke: var\(--accent\); \}/)
    assert.match(css, /\.dgm-gateway\.is-shut \.dgm-jamb \{ stroke: var\(--danger\); \}/)
  })

  it('puts the mark on the boundary in both figures', () => {
    for (const source of figures) {
      assert.match(source, /className="dgm-mark" href="\/assets\/damaros-monogram-blue\.svg"/)
      assert.match(source, /className="dgm-boundary"/)
    }
  })

  it('runs on the reader scroll, not on a timer', () => {
    assert.match(driver, /ScrollTrigger\.create\(\{/)
    assert.match(driver, /return reduced \? rest : phase/)
    for (const source of sources) {
      assert.doesNotMatch(source, /setTimeout|setInterval/)
    }
    for (const source of figures) {
      assert.match(source, /useScrollPhase\(PHASES, \{ reduced, target: section \}\)/)
      assert.match(source, /export default function \w+Schematic\(\{ animate = true, reduced = false, section \}\)/)
    }
    assert.match(app, /<TridentSchematic animate=\{animate\} reduced=\{reduced\} section=\{root\} \/>/)
    assert.match(app, /<NectarSchematic animate=\{animate\} reduced=\{reduced\} section=\{root\} \/>/)
  })

  it('gives the beat that carries the claim the widest stretch of scroll', () => {
    assert.match(trident, /span: 2\.2, reveal: 72, step: 2, schema: 'valid', gate: 'hold'/)
    assert.match(nectar, /span: 2\.2, out: 100, back: 100, gate: 'stop'/)
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /status: 'RECEIPTED'/)
    assert.match(nectar, /status: 'STEADY', tone: 'stop', read: 'Structure crosses\. Records do not\.'/)
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.dgm-svg :is\(/)
    // Nothing eases unless the figure is live and on screen.
    assert.match(css, /\.dgm-svg\.is-live \.dgm-route \{ transition:/)
  })

  it('holds a legible scale on a phone and opens on the boundary', () => {
    assert.match(mobile, /#root \.dgm-frame \{[\s\S]*?overflow-x:\s*auto;/)
    assert.match(mobile, /#root \.dgm-svg \{ min-width: 500px; \}/)
    assert.match(pan, /frame\.scrollTo\(\{ left: slack \/ 2 \}\)/)
    for (const source of figures) {
      assert.match(source, /const frame = useCenterOnOverflow\(\)/)
      assert.match(source, /className="dgm-frame" ref=\{frame\}/)
    }
  })

  it('keeps ontology out of public copy', () => {
    for (const source of [app, css, ...sources]) {
      assert.doesNotMatch(source, /ontolog/i)
    }
  })

  it('keeps schematic source inside the supplied character set', () => {
    for (const source of sources) {
      const unsupported = [...source].filter((character) => character.codePointAt(0) > 127)
      assert.deepEqual(unsupported, [])
    }
  })
})

function PROVIDER_COUNT(source) {
  const block = source.slice(source.indexOf('const PROVIDERS = ['), source.indexOf(']', source.indexOf('const PROVIDERS = [')))
  return (block.match(/\{ x:/g) || []).length
}

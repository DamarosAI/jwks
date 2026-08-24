import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const mobile = await readFile(new URL('./mobile.css', import.meta.url), 'utf8')
const driver = await readFile(new URL('./diagrams/useScrollPhase.js', import.meta.url), 'utf8')
const pan = await readFile(new URL('./diagrams/useCenterOnOverflow.js', import.meta.url), 'utf8')
const iso = await readFile(new URL('./diagrams/iso.js', import.meta.url), 'utf8')
const trident = await readFile(new URL('./diagrams/TridentSchematic.jsx', import.meta.url), 'utf8')
const nectar = await readFile(new URL('./diagrams/NectarSchematic.jsx', import.meta.url), 'utf8')

const sources = [driver, pan, iso, trident, nectar]
const figures = [trident, nectar]

// Every literal colour, radius and face in the schematic layer has to come from
// the site's own token set - that is the whole point of the rewrite.
const DGM_BLOCK = css.slice(
  css.indexOf('/* -- Trident and Nectar schematics --'),
  css.indexOf('/* Stack Trident and Nectar below 900px.'),
)

describe('Trident and Nectar schematics', () => {
  it('draws axonometric technical figures, not product panels', () => {
    for (const source of figures) {
      assert.match(source, /<svg/)
      assert.match(source, /viewBox="0 0 620 \d{3}"/)
      assert.match(source, /className="dgm-head"/)
      // Real projected solids, not stacked divs pretending to be depth.
      assert.match(source, /from '\.\/iso'/)
      assert.match(source, /className="dgm-face-top"/)
      // No window chrome, no app furniture, no per-frame canvas work.
      assert.doesNotMatch(source, /mac-titlebar|traffic-lights|window-breadcrumb|window-live/)
      assert.doesNotMatch(source, /getContext|requestAnimationFrame|<canvas/)
    }
    assert.doesNotMatch(app, /Canvas|Console/)
    assert.doesNotMatch(css, /\.pconsole|\.tc-provider|\.nc-lane/)
  })

  it('projects from plan coordinates instead of faking depth', () => {
    assert.match(iso, /export const ISO_X = 0\.866/)
    assert.match(iso, /export function project\(cx, cy\)/)
    assert.match(iso, /export function box\(/)
    for (const source of figures) {
      assert.doesNotMatch(source, /skew[XY]\(|perspective\(|rotate3d/)
    }
  })

  it('never names a vendor inside the figures', () => {
    // These are Damaros drawings. The sources are kinds of proposer, not
    // products, because the claim is about authority and not about whose
    // model happened to draft the proposal.
    for (const source of figures) {
      assert.doesNotMatch(source, /anthropic|openai|gemini|\bclaude\b|\bgpt\b|llama|mistral|palantir/i)
    }
    assert.match(trident, /const SOURCES = \[\s*\n\s*\{ key: 'MODEL'/)
    assert.match(trident, /\{ key: 'AGENT'/)
    assert.match(trident, /\{ key: 'AUTOMATION'/)
  })

  it('borrows every value from the site token set', () => {
    // Only tokens and token mixes may appear as colours.
    const colours = DGM_BLOCK.match(/#[0-9a-f]{3,8}\b|\brgba?\(/gi) || []
    assert.deepEqual(colours, [])
    assert.match(DGM_BLOCK, /font-family: var\(--font-ui\)/)
    assert.match(DGM_BLOCK, /font-family: var\(--font-mono\)/)
    assert.match(DGM_BLOCK, /\.dgm-field \{ fill: color-mix\(in srgb, var\(--accent-soft\)/)
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

  it('draws Trident as one site in section: three sources, four decks, one axis', () => {
    assert.equal((trident.match(/\{ key: '(surface|contract|authority|receipt)'/g) || []).length, 4)
    assert.equal((trident.match(/land: \[/g) || []).length, 3)
    assert.match(trident, /const SPINE = `M \$\{RUN\[0\]\} \$\{RUN\[1\]\} V \$\{RECEIPT\.cy\}`/)
    assert.match(trident, /dgm-rail/)
  })

  it('draws Nectar as many sites in plan, so the two figures are not one drawing', () => {
    assert.equal((nectar.match(/\{ id: 'SITE /g) || []).length, 3)
    assert.match(nectar, /const LIBRARY = deck\(/)
    // The same wall answers two leaders differently - that is the whole claim.
    assert.match(nectar, /const OUT_FROM = SITE_018\.shape\.left/)
    assert.match(nectar, /const BACK_TO = SITE_018\.shape\.right/)
    // Neither figure borrows the other's signature move.
    assert.doesNotMatch(nectar, /const SPINE|dgm-rail/)
    assert.doesNotMatch(trident, /const LIBRARY|dgm-tagbody/)
  })

  it('shuts the gate rather than colouring a status light', () => {
    assert.match(trident, /url\(#tr-hatch\)/)
    assert.match(trident, /fill=\{open \? 'var\(--surface-solid\)' : 'url\(#tr-hatch\)'\}/)
    // Nectar's boundary is the skirt of every site deck, hatched the same way.
    assert.match(nectar, /className="dgm-seal dgm-boundary" points=\{site\.shape\.faceLeft\} fill="url\(#nc-hatch\)"/)
    assert.match(DGM_BLOCK, /\.dgm-gatering\.is-hold \{ stroke: var\(--warning\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-gatering\.is-signed \{ stroke: var\(--success\); \}/)
  })

  it('puts the mark on the boundary in both figures', () => {
    for (const source of figures) {
      assert.match(source, /className="dgm-mark" href="\/assets\/damaros-monogram-blue\.svg"/)
    }
    assert.match(nectar, /dgm-boundary/)
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

  it('will not draw a governed path through a stack that has not assembled', () => {
    assert.match(DGM_BLOCK, /\.dgm-route \{[\s\S]*?opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.7\) \* 3\.4\), 1\);/)
  })

  it('gives the beat that carries the claim the widest stretch of scroll', () => {
    assert.match(trident, /span: 3\.2, reveal: 60, bound: 19, gate: 'hold'/)
    assert.match(nectar, /span: 3, out: 100, back: 100, gate: 'stop'/)
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /status: 'RECEIPTED'/)
    assert.match(nectar, /status: 'STEADY', read: 'Structure crosses\. Records do not\.'/)
    assert.match(DGM_BLOCK, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.dgm-svg :is\(/)
    // Nothing eases unless the figure is live and on screen.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-route \{ transition:/)
  })

  it('holds a legible scale on a phone and opens on the middle of the sheet', () => {
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

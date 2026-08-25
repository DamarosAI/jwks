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
      assert.match(source, /viewBox="0 0 620 700"/)
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
    // The projection is available as a transform, which is what lets the
    // figures carry rounded corners and true circles without cheating.
    assert.match(iso, /export function planSpace\(cx, cy\)/)
    assert.match(iso, /matrix\(\$\{ISO_X\}, \$\{ISO_Y\}, \$\{-ISO_X\}, \$\{ISO_Y\}, \$\{cx\}, \$\{cy\}\)/)
    for (const source of figures) {
      assert.match(source, /transform=\{planSpace\(/)
      assert.doesNotMatch(source, /skew[XY]\(|perspective\(|rotate3d/)
      // Anything stroked inside the projection needs an even hairline.
      assert.match(source, /vectorEffect="non-scaling-stroke"/)
    }
  })

  it('scatters the Nectar mesh deterministically, never from a random source', () => {
    assert.match(iso, /export function jitter\(index, salt\)/)
    assert.match(nectar, /jitter\(index, 3\)/)
    for (const source of sources) {
      assert.doesNotMatch(source, /Math\.random|Date\.now/)
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
    for (const source of [css, ...sources]) {
      assert.doesNotMatch(source, /#0a0f18/i)
    }
  })

  it('sets every figure label in Switzer and keeps mono for machine values', () => {
    assert.match(css, /--font-ui: 'Switzer', sans-serif;/)
    assert.match(DGM_BLOCK, /\.dgm-svg \{[\s\S]*?font-family: var\(--font-ui\);/)
    // The mono face is reserved: identifiers, counts, record totals.
    for (const rule of ['.dgm-head small', '.dgm-sidefact', '.dgm-countval']) {
      assert.match(DGM_BLOCK, new RegExp(`\\${rule}[^}]*font-family: var\\(--font-mono\\)`))
    }
    // Labels are not set in the mono face.
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-side \{[^}]*font-mono/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-platelabel \{[^}]*font-mono/)
  })

  it('puts the lattice on the page rather than inside a panel', () => {
    // The figures are not cards: no border, no surface, no shadow of their own.
    const panel = css.match(/\.trident-diagram,\n\.nectar-network \{[^}]*\}/)[0]
    assert.doesNotMatch(panel, /border|background|box-shadow|border-radius/)
    // The dot field belongs to the section, bled to the width of the page.
    assert.match(css, /\.section-field \{[\s\S]*?width: 100vw;/)
    assert.match(css, /\.section-field \{[\s\S]*?background-image: radial-gradient\(circle at center, color-mix\(in srgb, var\(--accent\)/)
    assert.match(css, /\.trident-section \{[\s\S]*?position: relative;/)
    assert.match(css, /\.nectar-section \{[\s\S]*?position: relative;/)
    // One continuous field across the pair: it fades only at the outer edges.
    assert.match(css, /\.trident-section \.section-field \{[\s\S]*?mask-image: linear-gradient\(to bottom, transparent/)
    assert.match(css, /\.nectar-section \.section-field \{[\s\S]*?var\(--text\) 83%, transparent\)/)
    assert.match(app, /<div className="section-field" ref=\{field\} aria-hidden="true" \/>/)
    // And it moves with the same scroll value the figures use.
    assert.match(css, /\.section-field \{[\s\S]*?background-position: center calc\(var\(--spread, 1\)/)
  })

  it('titles each figure with what it answers, not a category', () => {
    assert.match(trident, /<strong>What a harness is for<\/strong>/)
    assert.match(nectar, /<strong>What a site lets out<\/strong>/)
    for (const source of figures) {
      assert.doesNotMatch(source, /Governed execution stack|Federated site boundary/)
      // And each one states what it is worth, not only what it does.
      assert.match(source, /<figcaption className="dgm-head">[\s\S]*?<p>[A-Z][^<]{40,}<\/p>/)
    }
    assert.match(trident, /<p>Swap the provider without renegotiating anything\./)
    assert.match(nectar, /<p>Coverage compounds across every site in the federation\./)
    assert.match(DGM_BLOCK, /\.dgm-head p \{/)
  })

  it('draws the harness as a harness: the sources sit outside it', () => {
    // The bracket is the product. What is inside it is the part that does not
    // change when the model does, and the three plates are drawn above it.
    assert.match(trident, /className="dgm-harness"/)
    assert.match(trident, /className="dgm-bracket" d="M 122 158 H 106/)
    assert.match(trident, />TRIDENT - THE HARNESS<\/text>/)
    assert.match(trident, />ANY SOURCE - INTERCHANGEABLE</)
    assert.match(trident, />ONE HARNESS - EVERY RUN THE SAME</)
    assert.match(DGM_BLOCK, /\.dgm-bracket \{/)
    // The bracket opens below the plate row and closes below the last deck.
    assert.match(trident, /V 559 A 7 7 0 0 0 106 566 H 122/)
  })

  it('draws Trident as one site in section: three surfaces, four decks, one axis', () => {
    assert.equal((trident.match(/\{ key: '(surface|contract|authority|receipt)'/g) || []).length, 4)
    assert.equal((trident.match(/land: \[/g) || []).length, 3)
    assert.match(trident, /const RUN = STATIONS\.slice\(0, 3\)\.flatMap/)
    assert.match(trident, /dgm-rail/)
  })

  it('runs the Trident axis through the stack instead of over it', () => {
    // Solid in the open, dashed where it passes through a solid. Without the
    // hidden run the four decks read as four rectangles with a line on top.
    assert.match(trident, /hidden: true/)
    assert.match(trident, /hidden: false/)
    assert.match(trident, /className=\{`dgm-run\$\{leg\.hidden \? ' is-hidden' : ''\}/)
    assert.match(DGM_BLOCK, /\.dgm-run\.is-hidden \{[\s\S]*?stroke-dasharray: 4 4;/)
    // And the footprint is carried down to a ground plane, so the decks read as
    // four heights of one plan.
    assert.match(trident, /className="dgm-axis"/)
    assert.match(trident, /className="dgm-plane"/)
  })

  it('lets the reader choose who proposes, and holds them all the same', () => {
    // No source is wired live by index - which one is proposing is the reader's
    // to pick, by pointer or by keyboard, and the aperture shuts regardless.
    assert.doesNotMatch(trident, /index === 0 \? ' is-live'/)
    assert.match(trident, /source === item\.key \? ' is-live' : ''/)
    assert.match(trident, /const pick = \(key\) => \(\{/)
    assert.match(trident, /tabIndex: 0,/)
    assert.match(trident, /onFocus: \(\) => \{ setHot\(key\); setSource\(key\) \}/)
    assert.match(DGM_BLOCK, /\.dgm-plate:focus-visible > \.dgm-solid > \.dgm-face-top/)
    // Every phase holds at the aperture no matter who proposed.
    assert.match(trident, /gate: 'shut', receipt: false, tone: 'hold', status: 'HELD'/)
  })

  it('places the source labels above their plates, upright and legible', () => {
    assert.match(trident, /className="dgm-platelabel" x=\{item\.cx\} y="74" textAnchor="middle"/)
    assert.match(trident, /className="dgm-platenote" x=\{item\.cx\} y="86" textAnchor="middle"/)
    // Not rotated onto a deck edge, where they were unreadable.
    assert.doesNotMatch(trident, /dgm-platelabel[\s\S]{0,200}rotate\(\$\{EDGE_ANGLE\}/)
  })

  it('shuts the gate mechanically rather than colouring a status light', () => {
    assert.match(trident, /url\(#tr-hatch\)/)
    assert.match(trident, /className=\{`dgm-leaf is-left\$\{open \? ' is-open' : ''\}`\}/)
    assert.match(trident, /className=\{`dgm-leaf is-right\$\{open \? ' is-open' : ''\}`\}/)
    assert.match(DGM_BLOCK, /\.dgm-leaf\.is-left\.is-open \{ transform: translateX\(-19px\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-leaf\.is-right\.is-open \{ transform: translateX\(19px\); \}/)
    // Nectar's boundary is the skirt of every site deck, drawn as a wall rather
    // than a hatch, and identically at every site.
    assert.match(nectar, /className="dgm-wall"/)
    assert.match(DGM_BLOCK, /\.dgm-wall \{/)
  })

  it('names every contract field instead of leaving 19 blank tiles', () => {
    assert.match(trident, /'SUBJECT', 'SITE', 'PROTOCOL'/)
    assert.equal((trident.match(/'[A-Z][A-Z0-9]+',/g) || []).length >= 18, true)
    assert.match(trident, /onMouseEnter=\{\(\) => setField\(index\)\}/)
    assert.match(DGM_BLOCK, /\.dgm-fieldtile\.is-named \{/)
  })

  it('draws Nectar as a federation in plan, so the two figures are not one drawing', () => {
    assert.equal((nectar.match(/\{ id: 'SITE /g) || []).length, 3)
    assert.match(nectar, /const NODES = \[\]/)
    assert.match(nectar, /const LINKS = \[\]/)
    // Neither figure borrows the other's signature move.
    assert.doesNotMatch(nectar, /const STATIONS|dgm-rail|dgm-leaf/)
    assert.doesNotMatch(trident, /const NODES|dgm-node|dgm-reach/)
  })

  it('never asks a site for a record, in either direction', () => {
    // Damaros has no reason to request identifiable data, so no path in the
    // figure points at a site and nothing is refused at a wall.
    assert.doesNotMatch(nectar, /RECORD REQUEST|REFUSED|dgm-cross|is-back|BACK_TO|BACK_FROM/i)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-route\.is-back|\.dgm-cross|\.dgm-refused/)
    assert.doesNotMatch(DGM_BLOCK, /var\(--danger\)/)
    // Every path rises from a site port into the mesh.
    assert.match(nectar, /path: `M \$\{x1\} \$\{y1\} Q \$\{cx\} \$\{cy\} \$\{x2\} \$\{y2\}`/)
    assert.match(nectar, /port: shape\.p\(0, -30\)/)
  })

  it('shows the network effect as geometry rather than a claim', () => {
    // Three reaches on one ground, growing with coverage until they overlap.
    assert.match(nectar, /className="dgm-reachrim" cx=\{site\.plan\[0\]\} cy=\{site\.plan\[1\]\} r=\{state\.reach\}/)
    assert.match(nectar, /reach: 84/)
    assert.match(nectar, /reach: 108/)
    assert.match(DGM_BLOCK, /\.dgm-reachrim \{[\s\S]*?transition: r 620ms/)
    // And the library is a mesh that lights up, not a box being coloured in.
    assert.match(nectar, /className=\{`dgm-node\$\{node\.rank < state\.bound \? ' is-bound' : ''\}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-beat/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-node\.is-bound \{[\s\S]*?animation: dgm-beat/)
  })

  it('runs the local work inside the wall, where the records are', () => {
    assert.match(nectar, /className="dgm-sweep"/)
    assert.match(nectar, /className="dgm-lid"/)
    assert.match(DGM_BLOCK, /@keyframes dgm-sweep/)
    // Ambient motion only ever runs when the figure is live.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-sweep \{[\s\S]*?animation: dgm-sweep/)
  })

  it('puts the mark somewhere it means something in both figures', () => {
    for (const source of figures) {
      assert.match(source, /className="dgm-mark" href="\/assets\/damaros-monogram-blue\.svg"/)
    }
    // In Trident it is the seal on a written receipt, and it only exists then.
    assert.match(trident, /className=\{`dgm-seal\$\{state\.receipt \? ' is-struck' : ''\}`\}/)
    assert.match(DGM_BLOCK, /\.dgm-seal \{ opacity: 0;/)
    // In Nectar it identifies the library, clear of the drawing.
    assert.match(nectar, /x="20" y="10" width="18" height="21"/)
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
    assert.match(DGM_BLOCK, /\.dgm-run \{[\s\S]*?opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.82\) \* 5\.6\), 1\);/)
    assert.match(DGM_BLOCK, /\.dgm-liftpath \{[\s\S]*?opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.7\) \* 3\.4\), 1\);/)
  })

  it('gives the beat that carries the claim the widest stretch of scroll', () => {
    assert.match(trident, /span: 3\.2, reveal: GATE_AT, bound: 19, gate: 'shut'/)
    assert.match(nectar, /span: 2\.4, bound: 38, reach: 108/)
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /status: 'RECEIPTED'/)
    assert.match(nectar, /status: 'STEADY', read: 'Structure crosses\. Records do not\.'/)
    assert.match(DGM_BLOCK, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.dgm-svg :is\(/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-run \{ transition:/)
  })

  it('carries the Nectar claims as facts beside the copy, the way Trident does', () => {
    assert.match(app, /<div className="control-facts">\s*\n\s*<span><ShieldCheck size=\{18\} \/> PHI-free by construction<\/span>/)
    assert.match(app, /<span><Graph size=\{18\} \/> Coverage compounds<\/span>/)
    assert.match(app, /<span><Database size=\{18\} \/> Records stay at the site<\/span>/)
    assert.match(css, /\.nectar-copy \.control-facts \{/)
    // The old three-column band is gone from every stylesheet.
    for (const sheet of [css, mobile]) {
      assert.doesNotMatch(sheet, /nectar-facts/)
    }
    assert.doesNotMatch(app, /nectar-facts/)
  })

  it('keeps the panels on the light field and lets the headlines wrap', () => {
    assert.doesNotMatch(css, /\.trident-copy h2 span \{[^}]*white-space:\s*nowrap/)
    assert.match(css, /\.trident-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.nectar-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.trident-copy \{[\s\S]*?min-width:\s*0;/)
  })

  it('stacks both sections before the mobile sheet opens', () => {
    assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.trident-section,\s*\n\s*\.nectar-section \{[\s\S]*?flex-direction:\s*column;/)
    assert.doesNotMatch(css, /\.trident-section > \.section-eyebrow/)
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

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'
// Imported for real, not read as text: the one claim in this pair made by
// geometry alone - that no channel ever crosses the slab it arrives at - has to
// be re-solved from the projection rather than pinned to coordinates a later
// edit would silently invalidate.
import * as ISO from './diagrams/iso.js'

const app = await readSource(new URL('./App.jsx', import.meta.url))
const css = await readSource(new URL('./styles.css', import.meta.url))
const mobile = await readSource(new URL('./mobile.css', import.meta.url))
const driver = await readSource(new URL('./diagrams/useScrollPhase.js', import.meta.url))
const pan = await readSource(new URL('./diagrams/useCenterOnOverflow.js', import.meta.url))
const iso = await readSource(new URL('./diagrams/iso.js', import.meta.url))
const solid = await readSource(new URL('./diagrams/Solid.jsx', import.meta.url))
const trident = await readSource(new URL('./diagrams/TridentSchematic.jsx', import.meta.url))
const nectar = await readSource(new URL('./diagrams/NectarSchematic.jsx', import.meta.url))

const sources = [driver, pan, iso, solid, trident, nectar]
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
      // Real projected solids, not stacked divs pretending to be depth.
      assert.match(source, /from '\.\/iso'/)
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

  it('rounds the solids in plan, not on screen', () => {
    // A Damaros corner is a plan corner carried through the projection: the
    // silhouette is sampled from a rounded plan square and the skirt is cut at
    // the front corner, so the same corner reads the same at every height.
    assert.match(iso, /export function roundedPlan\(half, radius, steps = 7\)/)
    assert.match(iso, /export function roundedDeck\(cx, cy, half, height, radius\)/)
    assert.match(iso, /const skirt = \(from, to\) =>/)
    assert.match(trident, /roundedDeck\(CX, cy, HALF, THICK, RAD\)/)
    // One solid, drawn by one component, so a Trident deck and a Nectar site
    // cannot drift into being two different objects.
    assert.match(solid, /<path className="dgm-face-left" d=\{shape\.faceLeft\} \/>/)
    assert.match(solid, /export function Faces\(\{ shape, className \}\)/)
    for (const source of figures) {
      assert.match(source, /import \{ Faces \} from '\.\/Solid'/)
      assert.match(source, /<Faces shape=\{/)
      // Sharp-cornered polygon decks are gone from both figures, and neither
      // one carries its own copy of the component.
      assert.doesNotMatch(source, /polygon className="dgm-face-left"/)
      assert.doesNotMatch(source, /function Faces\(/)
    }
  })

  it('stands a Nectar site on the same solid a Trident deck stands on', () => {
    // A site was a round vessel, which read as a different drawing from the one
    // beside it and left every identity pinned to the edge of an ellipse with
    // nowhere to sit. It is the same rounded plan square now, at another scale,
    // and the corner radius is a fixed share of the plan size so a small site
    // and a large one are one object rather than two shapes.
    assert.match(nectar, /const solid = roundedDeck\(cx, cy, site\.half, site\.wall, Math\.round\(site\.half \* 0\.34\)\)/)
    assert.match(nectar, /<Faces shape=\{site\.solid\} className="dgm-solid" \/>/)
    assert.doesNotMatch(nectar, /roundedCylinder|dgm-vesselwall|dgm-vesseltop|planCircle/)
    for (const rule of ['.dgm-vesselwall', '.dgm-vesseltop']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
    assert.match(DGM_BLOCK, /\.dgm-site\.is-hot > \.dgm-solid > \.dgm-face-top/)
  })

  it('tells the three sites apart by what each one holds', () => {
    // Three identical shapes is a diagram of a federation. The plan size, the
    // wall height, the number of bands inside and the reach all follow the
    // record count.
    assert.match(nectar, /records: '890', half: 44, wall: 18, bands: 4, grew: 0\.94/)
    assert.match(nectar, /records: '614', half: 40, wall: 15, bands: 3, grew: 0\.82/)
    assert.match(nectar, /records: '1,204', half: 55, wall: 22, bands: 5, grew: 1\.08/)
    // The bands sit under the lid that seals them, so a stack fills the site it
    // is in and no band is drawn outside the thing holding it shut.
    assert.match(nectar, /const lid = site\.half - 7/)
    assert.match(nectar, /rows\.push\(\{ y, half: lid - 7 \}\)/)
    // The badge that sat on the roof of every site - a circle with a little
    // glyph inside it - is gone from the figure and from the sheet.
    assert.doesNotMatch(nectar, /dgm-glyph|dgm-port|const GLYPHS/)
    for (const rule of ['.dgm-glyph']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
  })

  it('scatters both figures deterministically, never from a random source', () => {
    assert.match(iso, /export function jitter\(index, salt\)/)
    assert.match(nectar, /jitter\(index, 3\)/)
    for (const source of sources) {
      assert.doesNotMatch(source, /Math\.random|Date\.now/)
    }
  })

  it('keeps both drawings in motion with nobody touching them', () => {
    // Ambient life, on scattered clocks so nothing falls into step and no loop
    // is short enough for a reader to catch. All of it gated on `is-live`, so
    // it never runs on a phone or against a reduced-motion preference.
    for (const rule of [
      '.dgm-svg.is-live .dgm-spark',
      '.dgm-svg.is-live .dgm-fieldtile:not(.is-named)',
      '.dgm-svg.is-live .dgm-bolt:not(.is-clear)',
      '.dgm-svg.is-live .dgm-drop.is-done .dgm-dropflow',
      '.dgm-svg.is-live .dgm-traffic.is-bound',
      '.dgm-svg.is-live .dgm-crit.is-bound .dgm-node',
      '.dgm-svg.is-live .dgm-reachrim',
      '.dgm-svg.is-live .dgm-ring',
      '.dgm-svg.is-live .dgm-sweep',
    ]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[\\s\\S]*?animation:`))
    }
    // Every ambient clock is jittered per element rather than shared.
    assert.match(DGM_BLOCK, /animation: dgm-travel calc\(5\.2s \+ var\(--life, 0\) \* 4\.6s\) linear infinite;/)
    assert.match(trident, /life: jitter\(index, 4\)/)
    assert.match(nectar, /life: jitter\(index, 11\)/)
    assert.match(nectar, /const TRAFFIC = LINKS\.filter\(\(link\) => link\.life > 0\.88\)/)
  })

  it('runs the two quiet layers both figures share', () => {
    // Everything that moved was either a whole surface or a single travelling
    // mark, which left the sixty-odd small solids standing on those surfaces -
    // and the connections between them at rest - as the still part of a picture
    // whose whole claim is that it is running.
    //
    // The solids settle. Half a pixel on a twelve-second clock, scattered, so a
    // grid of nineteen breathes out of step.
    assert.match(DGM_BLOCK, /@keyframes dgm-stir \{[\s\S]*?38% \{ transform: translate\(-0\.85px, -0\.85px\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live :is\(\.dgm-stand, \.dgm-field\.is-bound\) \{\s*\n\s*animation: dgm-stir calc\(9\.2s \+ var\(--life, 0\) \* 6\.8s\)/)
    // Only what is standing settles - a field still lying flat is part of the
    // deck it is printed on, and part of a deck does not breathe.
    assert.doesNotMatch(DGM_BLOCK, /:is\(\.dgm-stand, \.dgm-field\)/)
    assert.match(trident, /life: jitter\(cursor, 17\)/)
    assert.equal((trident.match(/className="dgm-stand"/g) || []).length, 2)
    // Nectar's criteria left this clock for one of their own. A breath in place
    // is right for a contract field bolted to a deck and wrong for a floor of
    // plant, which gets moved about - so they wander along the slab's own two
    // plan axes instead, blocks one way and drums the other, far enough out of
    // step that forty-two of them never travel together.
    assert.doesNotMatch(DGM_BLOCK, /dgm-stir[\s\S]{0,120}\.dgm-crit/)
    assert.match(DGM_BLOCK, /@keyframes dgm-shuffle \{[\s\S]*?29%, 42% \{ transform: translate\(2\.4px, -1\.3px\); \}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-shuffleback \{/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit \{\s*\n\s*animation: dgm-shuffle calc\(13s \+ var\(--life, 0\) \* 9\.4s\)/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit\.is-drum \{ animation-name: dgm-shuffleback; \}/)
    // An idle connection is still a live connection: a tine with no proposal on
    // it, a channel with no definition crossing it and the run from a gate to
    // the criterion it feeds all creep, in the direction the thing would travel
    // if it came.
    assert.match(DGM_BLOCK, /@keyframes dgm-creep \{\s*\n\s*to \{ stroke-dashoffset: -21; \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-tine:not\(\.is-live\),\s*\n\.dgm-svg\.is-live \.dgm-channel,\s*\n\.dgm-svg\.is-live \.dgm-feeder \{\s*\n\s*animation: dgm-creep/)
    // Three whole dash periods, so the pattern lands where it started and the
    // loop has no seam. All three dash patterns are period 7 for that reason.
    assert.match(DGM_BLOCK, /\.dgm-tine \{[\s\S]*?stroke-dasharray: 3 4;/)
    assert.match(DGM_BLOCK, /\.dgm-channel \{[\s\S]*?stroke-dasharray: 2 5;/)
    assert.match(DGM_BLOCK, /\.dgm-feeder \{[\s\S]*?stroke-dasharray: 2 5;/)
    // And every one of these layers stops dead against a reduced-motion
    // preference.
    for (const cls of ['.dgm-stand', '.dgm-field', '.dgm-crit', '.dgm-tine', '.dgm-channel', '.dgm-feeder', '.dgm-gate', '.dgm-lift', '.dgm-steady', '.dgm-draw', '.dgm-hand', '.dgm-ledgeraudit']) {
      assert.match(DGM_BLOCK, new RegExp(`prefers-reduced-motion[\\s\\S]*?\\${cls}[,)]`))
    }
  })

  it('holds every moving mark until the figure has power', () => {
    // The figure used to arrive already busy: every ambient clock ran from the
    // first frame, so the drawing was working while it was still sliding into
    // place and nothing ever read as switching on. Motion now waits on a gate
    // that opens after the gain, which is what makes the run a power-on rather
    // than an entrance.
    //
    // And booting is not a scrub. It used to be: the opening slice of the
    // scroll range assembled the drawing a frame at a time, so the machine came
    // on at whatever rate the reader turned the wheel, stalled when they
    // stopped and ran backwards when they scrolled up. It boots once now, on
    // arrival, and the stylesheet does the easing - two registered properties,
    // one class, and every calc() downstream of them interpolates.
    assert.match(DGM_BLOCK, /@property --spread \{\s*\n\s*syntax: '<number>';/)
    assert.match(DGM_BLOCK, /@property --charge \{\s*\n\s*syntax: '<number>';/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-booted \{\s*\n\s*--spread: 1;\s*\n\s*--charge: 1;\s*\n\}/)
    assert.match(DGM_BLOCK, /transition: --spread \d+ms [^;]+, --charge \d+ms \d+ms [^;]+;/)
    // Booted is state, not a class put on the node. The figure re-renders on
    // every phase and React rewrites `class` from what it last rendered, so an
    // imperatively added class survives until the first tone change and is then
    // silently wiped - which is exactly the frame the reader is looking at.
    assert.match(driver, /const boot = \(\) => setBooted\(true\)/)
    assert.doesNotMatch(driver, /classList\.add\('is-booted'\)/)
    for (const source of figures) {
      assert.match(source, /\$\{booted \? ' is-booted' : ''\}/)
    }
    // Any progress at all means the reader has arrived. Booting off the crossing
    // callbacks alone misses a jump - a hash link, a restored scroll position, a
    // flick straight past the end.
    assert.match(driver, /if \(progress > 0\) boot\(\)/)
    // Reduced motion parks the figure booted, not dark, and never builds a
    // trigger at all. A figure already on screen at mount has no entry to wait
    // for, so it boots too.
    assert.match(driver, /if \(reduced \|\| node\.getBoundingClientRect\(\)\.top < window\.innerHeight\) boot\(\)/)
    assert.match(driver, /if \(reduced\) return undefined/)
    // Nothing writes the power level per frame any more.
    assert.doesNotMatch(driver, /setProperty\('--charge'/)
    assert.match(DGM_BLOCK, /--run-in: clamp\(0, calc\(\(var\(--charge, 1\) - 0\.42\) \* 2\.4\), 1\);/)
    assert.match(DGM_BLOCK, /opacity: calc\(0\.62 \+ 0\.38 \* var\(--charge, 1\)\);/)
    for (const mark of ['.dgm-spark', '.dgm-drop.is-done .dgm-dropflow', '.dgm-resolve']) {
      const escaped = mark.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*var\\(--run-in`))
    }
    // The footprint climbs out of the ground as power arrives, rather than
    // having been there the whole time.
    assert.match(DGM_BLOCK, /\.dgm-axis \{[\s\S]*?stroke-dashoffset: calc\(100 \* \(1 - var\(--charge, 1\)\)\);/)
    assert.match(trident, /<line className="dgm-axis" pathLength="100" x1=\{SURFACE\.left\[0\]\} y1=\{GROUND\}/)
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
    for (const rule of ['.dgm-sidefact', '.dgm-countval']) {
      assert.match(DGM_BLOCK, new RegExp(`\\${rule}[^}]*font-family: var\\(--font-mono\\)`))
    }
    // Labels are not set in the mono face.
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-side \{[^}]*font-mono/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-platelabel \{[^}]*font-mono/)
  })

  it('puts the lattice on the page rather than inside a panel', () => {
    // The figures are not cards: no border, no surface, no shadow of their own.
    // Anchored at column 0 so this is the top-level rule and not the indented
    // copy inside the 900px block, and \r?\n so it holds on a CRLF checkout.
    const panel = css.match(/^\.trident-diagram,\r?\n\.nectar-network \{[^}]*\}/m)
    assert.ok(panel, 'no top-level .trident-diagram / .nectar-network rule to check')
    assert.doesNotMatch(panel[0], /border|background|box-shadow|border-radius/)
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

  it('lets the drawing be the drawing, with no heading over the top of it', () => {
    // The section beside each figure already says what it is for; a caption
    // repeating it was one more thing between the reader and the sheet. The
    // figure is a figure, and the copy column carries the words.
    for (const source of figures) {
      assert.doesNotMatch(source, /figcaption|dgm-head/)
      assert.doesNotMatch(source, /Governed execution stack|Federated site boundary/)
    }
    for (const sheet of [css, mobile]) {
      assert.doesNotMatch(sheet, /\.dgm-head/)
    }
    // Every figure still answers to a name for a screen reader.
    for (const source of figures) {
      assert.match(source, /role="img"[\s\S]{0,12}aria-label="[A-Z][^"]{160,}"/)
    }
    // Both sections open the same way: the heading says what the system does and
    // one dek, in the blue every other dek on the site uses, says what it will
    // not do. One class, so the pair cannot drift into two treatments.
    assert.match(app, /<h2><span>Any model can propose at the point of care\.<\/span><\/h2>/)
    assert.match(app, /<p className="section-dek">None can decide\.<\/p>/)
    assert.match(app, /<h2><span>Execution intelligence that crosses site boundaries\.<\/span><\/h2>/)
    assert.match(app, /<p className="section-dek">Patient data that never does\.<\/p>/)
    assert.doesNotMatch(css, /\.nectar-dek/)
  })

  it('states the harness claim in the title instead of lettering it on the drawing', () => {
    // The bracket down the left margin and the two corner slogans said in
    // furniture what the figure title already says in words. A schematic earns
    // its keep by being a schematic: they are gone, from both figures.
    for (const source of figures) {
      assert.doesNotMatch(source, /dgm-bracket|dgm-brackettext|dgm-harness/)
      assert.doesNotMatch(source, /ANY SOURCE - INTERCHANGEABLE|ONE HARNESS - EVERY RUN THE SAME/)
      assert.doesNotMatch(source, /STRUCTURE ONLY - NO VALUES|SHARED EXECUTION LIBRARY/)
      assert.doesNotMatch(source, /dgm-micro/)
    }
    assert.doesNotMatch(nectar, />NO VALUES</)
    for (const rule of ['.dgm-bracket', '.dgm-brackettext', '.dgm-micro']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule} \\{`))
    }
  })

  it('draws Trident as one site in section: three surfaces, four decks', () => {
    assert.equal((trident.match(/\{ key: '(surface|contract|authority|receipt)'/g) || []).length, 4)
    assert.equal((trident.match(/land: \[/g) || []).length, 3)
    assert.match(trident, /dgm-rail/)
    // A hairline leader and a 10px label are not a pointer target; the whole
    // strip gets one invisible hit area instead.
    assert.match(trident, /<rect className="dgm-hit" x=\{layer\.right\[0\]\}/)
    assert.match(nectar, /className="dgm-hit"/)
    assert.match(DGM_BLOCK, /\.dgm-hit \{ fill: none; pointer-events: all; \}/)
  })

  it('bolts each drop to the deck it lands on instead of hanging it between two', () => {
    // A connector drawn in the space between two solids stayed put while either
    // one moved under the pointer, and read as attached to nothing. Each drop is
    // now drawn inside the deck it lands on and tucks its head under the deck
    // above, so it travels with the solid it is bolted to and never shows a
    // free end - and the drop out of the site deck still has no path at all
    // until somebody there has signed.
    assert.match(trident, /const DROPS = LAYERS\.slice\(1\)\.map\(\(deck, index\) => \{/)
    // Deep enough to survive the tiers drifting apart: thirteen pixels right of
    // the upper deck's left corner its front edge has already fallen five, so a
    // head six pixels down sat less than a pixel inside an eleven-pixel skirt.
    assert.match(trident, /const head = \[x \+ 13, Math\.round\(\(y - SEP \+ 11\) \* 100\) \/ 100\]/)
    assert.match(trident, /<Drop leg=\{DROPS\[0\]\} drops=\{state\.drops\} \/>/)
    assert.match(trident, /<Drop leg=\{DROPS\[1\]\} drops=\{state\.drops\} \/>/)
    assert.match(trident, /<Drop leg=\{DROPS\[2\]\} drops=\{state\.drops\} \/>/)
    assert.match(trident, /className=\{`dgm-drop\$\{done \? ' is-done' : ''\}\$\{leg\.index === drops - 1 \? ' is-latest' : ''\}`\}/)
    assert.match(DGM_BLOCK, /\.dgm-drop\.is-done \.dgm-droppath \{ stroke-dashoffset: 0; \}/)
    assert.match(DGM_BLOCK, /\.dgm-drop\.is-latest \.dgm-droppath \{/)
    // The full-height axis, its hidden-line dashes and its stations are gone.
    assert.doesNotMatch(trident, /const RUN = STATIONS|hidden: true|hidden: false|dgm-run/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-run \{|\.dgm-run\.is-hidden/)
    // Where it stops is where the aperture is, not a corner away from it.
    assert.match(trident, /className=\{`dgm-approach\$\{state\.drops >= 2 \? ' is-here' : ''\}`\}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-hold \.dgm-approach\.is-here \{ stroke: var\(--warning\); \}/)
    // And the footprint still runs down to a ground plane, so the four decks
    // read as four heights of one plan. The caption that said so in words is
    // gone: the axis, the plane and the four skirts standing over one footprint
    // are the claim, and lettering it as well was the drawing not trusting its
    // own geometry.
    assert.match(trident, /className="dgm-axis"/)
    assert.match(trident, /className="dgm-plane"/)
    assert.doesNotMatch(trident, /ONE PLAN - FOUR HEIGHTS/)
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

  it('hands the whole readout to the pointer, pill and colour included', () => {
    // Scrolling advances the run and the pill says where it is. Point at any
    // part of either drawing and the pill, its colour and the line beside it all
    // answer for that part instead - a readout that only ever narrates the
    // scroll is a caption with extra steps.
    assert.match(trident, /const RESTING = 'Any of the three can propose\. Only the site can decide\.'/)
    assert.match(trident, /const tone = cue\?\.tone \?\? state\.tone/)
    assert.match(trident, /const pill = cue\?\.pill \?\? state\.status/)
    assert.match(trident, /const read = cue\?\.read \?\? RESTING/)
    assert.match(trident, /<text className="dgm-statustext" x="81" y="677" textAnchor="middle">\{pill\}<\/text>/)
    assert.match(trident, /<text className="dgm-read" x="156" y="677">\{read\}<\/text>/)
    for (const key of ['MODEL', 'AGENT', 'AUTOMATION', 'surface', 'contract', 'authority', 'receipt']) {
      assert.match(trident, new RegExp(`^  ${key}: \\{ tone: '\\w+', pill: '[A-Z]+', read: '`, 'm'))
    }
    // A field answers for itself, ahead of the deck it sits on. It is the one
    // part of the stack small enough to need naming and numerous enough to be
    // worth pointing at; every other mechanism runs on its own.
    assert.match(trident, /const cue = fieldCue\(field, state\) \?\? READS\[hot\]/)
    assert.match(trident, /function fieldCue\(index, state\) \{/)
    // No Trident phase carries prose any more - the phases carry state.
    assert.doesNotMatch(trident, /status: 'PROPOSING', read:/)
    // Nectar does the same, and what it says about a site is what that site did
    // rather than how many rows it happens to be sitting on.
    for (const key of ['SITE 042', 'SITE 103', 'SITE 018']) {
      assert.match(nectar, new RegExp(`'${key}': \\{ tone: '\\w+', pill: '[A-Z]+', read: '`))
    }
    assert.match(nectar, /const cue = READS\[hot\]/)
    assert.match(nectar, /library: \{ tone: '\w+', pill: '[A-Z]+', read: '/)
    assert.match(nectar, /<text className="dgm-read" x="164" y="677">\{read\}<\/text>/)
    assert.doesNotMatch(nectar, /Site \d+ holds [\d,]+ records/)
    // Every tone the readout can take has a rule that colours the pill.
    for (const tone of ['valid', 'signed', 'hold', 'pass']) {
      assert.match(DGM_BLOCK, new RegExp(`\\.dgm-svg\\.is-${tone} \\.dgm-status`))
    }
  })

  it('runs each deck as its own mechanism rather than waiting for a cursor', () => {
    // Every deck works unattended, because a mechanism that only moves when a
    // cursor finds it is not a mechanism, it is a tooltip. The plates ride over
    // the intake; the intake draws its queue down to the throat and the throat
    // swallows; the contract walks its nineteen fields in the order it checks
    // them; something keeps trying the shutter and the bolts keep taking it;
    // and the ledger posts, each hash travelling the link to the row it commits.
    // The library above Nectar does the same: it drifts, and what it already
    // holds keeps resolving against its neighbours.
    for (const rule of [
      '.dgm-svg.is-live .dgm-plate',
      '.dgm-svg.is-live .dgm-intake',
      '.dgm-svg.is-live .dgm-catch',
      '.dgm-svg.is-live .dgm-throat',
      '.dgm-svg.is-live .dgm-fieldtile:not(.is-named)',
      '.dgm-svg.is-live .dgm-leaf:not(.is-open)',
      '.dgm-svg.is-live .dgm-ledgerflow',
      '.dgm-svg.is-live .dgm-library',
      '.dgm-svg.is-live .dgm-pulse',
    ]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped}[,\\s][^{]*\\{[^}]*animation:`))
    }
    // The contract's pass no longer marches. It ran on `--seq`, the field's
    // index in the grid, which made the check a band sweeping the same way every
    // time - and a contract that always checks in reading order is a contract
    // with an order, which is not the claim. Each tile takes its own period and
    // its own negative offset instead, from `--life`; the periods are
    // incommensurable, so the sequence a reader sees never repeats.
    assert.match(trident, /life: jitter\(cursor, 17\)/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-fieldtile:not\(\.is-named\) \{\s*\n\s*animation: dgm-pass calc\(4\.6s \+ var\(--life, 0\) \* 3\.9s\)[\s\S]*?animation-delay: calc\(var\(--life, 0\) \* -8\.3s\);/)
    // The ledger's chain carries the hash down in chain order, and the row it
    // reaches takes its seal a beat later.
    assert.match(trident, /seq: Math\.round\(\(index \/ all\.length\) \* 100\) \/ 100/)
    assert.match(trident, /className="dgm-ledgerflow"/)
    assert.match(DGM_BLOCK, /@keyframes dgm-post \{/)
    assert.match(DGM_BLOCK, /@keyframes dgm-stamp \{/)
  })

  it('floats the four tiers over one plan, each on its own clock', () => {
    // The stack is a city, not a masonry pile: four tiers held over one plan,
    // drifting out of step. `--float` is registered so it can be animated inside
    // the same calc() the boot already uses - a second animation on `transform`
    // would replace the boot outright, and a wrapper group for the float would
    // leave every rail hanging off a deck that moves without it.
    //
    // The tile floats and the type does not. Every label the tier carries in the
    // air - both rail lines, a plate's two lines, the field pill - is wrapped in
    // `.dgm-steady`, which subtracts the exact sum of the clocks under it. A word
    // that drifts is a word the reader has to track, and the point of the float
    // was always the solid.
    assert.match(DGM_BLOCK, /@property --float \{\s*\n\s*syntax: '<length>';/)
    assert.match(DGM_BLOCK, /\.dgm-slide \{ transform: translateY\(calc\(var\(--lift, 0px\) \* \(1 - var\(--spread, 1\)\) \+ var\(--float, 0px\)\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-slide \{[^}]*animation: dgm-bob/)
    assert.match(DGM_BLOCK, /\.dgm-steady \{ transform: translateY\(calc\(\(var\(--float, 0px\) \+ var\(--ride, 0px\) \+ var\(--drift, 0px\)\) \* -1\)\); \}/)
    assert.match(trident, /life: jitter\(index, 12\)/)
    assert.equal((trident.match(/className="dgm-slide is-\w+" style=\{\{ '--lift': `\$\{\w+\.lift\}px`, '--life': \w+\.life \}\}>/g) || []).length, 4)
    // The footprint hairlines stop inside the top deck's skirt rather than on
    // its corner, so a tier can drift without pulling away from the plan it is
    // standing on. The skirt edge there is collinear and eleven pixels deep.
    assert.match(trident, /y2=\{SURFACE\.left\[1\] \+ 5\}/)
    assert.match(trident, /y2=\{SURFACE\.right\[1\] \+ 5\}/)
    // Each tier's own mechanism, suited to what that tier is for: the pad rings
    // as its source lets a proposal go, the pass deepens the tiles it has
    // reached, the frame braces while it is still holding something, and the
    // row takes its edge as the seal lands.
    for (const rule of [
      '.dgm-svg.is-live .dgm-pad',
      '.dgm-svg.is-live .dgm-fieldtile.is-bound:not(.is-named)',
      '.dgm-svg.is-live .dgm-shutter:not(.is-open) .dgm-housing',
      '.dgm-svg.is-live .dgm-ledgerrow.is-written .dgm-ledgerbar',
    ]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped}[,\\s][^{]*\\{[^}]*animation`))
    }
    // The frame stops bracing once nothing is being held, and it is told so
    // rather than left to infer it from a tone class.
    assert.match(trident, /dgm-shutter\$\{open \? ' is-open' : ''\}/)
  })

  it('answers a pointer by loading a mechanism, not by starting one', () => {
    // Pointing at a deck leans on what it is already doing. The intake carries a
    // second mark on every run - a change of dash pattern and not of rate, so
    // nothing in flight teleports the moment the pointer arrives. The contract
    // re-checks from the first field. The shutter gives against its own bolts
    // and comes straight back.
    assert.match(DGM_BLOCK, /\.dgm-deck\.is-hot \.dgm-intake \{ stroke-dasharray: 7 93;/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-deck\.is-hot \.dgm-fieldtile:not\(\.is-named\) \{ animation-name: dgm-passhard; \}/)
    // The ledger sends an audit down it. Every other deck answers a pointer by
    // doing more of its own work, and the ledger answered by turning a dashed
    // chain solid - a thing filling in, which is what the run already does to
    // every row and says nothing about what a ledger is for. What it is for is
    // being checked, so leaning on it runs a mark down the chain, row by row.
    //
    // The mark keeps its own clock and always has: `--audit` is a registered
    // number that hover raises from zero to one and the keyframe multiplies its
    // opacity by, so the pointer gates a running animation instead of starting
    // or re-timing one. Nothing in flight can jump.
    assert.match(DGM_BLOCK, /@property --audit \{\s*\n\s*syntax: '<number>';/)
    assert.match(DGM_BLOCK, /\.dgm-deck\.is-hot \{ --audit: 1; \}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-verify \{[\s\S]*?opacity: calc\(var\(--run-in, 1\) \* var\(--audit, 0\)\);/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-ledgeraudit \{\s*\n\s*animation: dgm-verify 6\.4s linear infinite;/)
    assert.match(trident, /className="dgm-ledgeraudit"/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-deck\.is-hot \.dgm-ledgerchain \{[^}]*stroke-dasharray: none/)
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-leaf:not\(\.is-open\)/)
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-bolt:not\(\.is-clear\)/)
    assert.match(DGM_BLOCK, /@keyframes dgm-give/)
    assert.match(trident, /const tried = hot === 'authority' && !open/)
    // A field is the one part small enough to need naming, so it keeps its own
    // target and answers in the tile - by standing up and taking the tier's ink,
    // which is the same answer every other solid in the pair gives. The tick
    // that used to be stamped on top of it is gone: nineteen check marks on a
    // grid the contract is already walking is the drawing saying the same thing
    // twice, and at four pixels it read as noise on the tile rather than as a
    // mark on it.
    assert.match(DGM_BLOCK, /\.dgm-fieldtile\.is-bound \{\s*\n\s*fill: color-mix\(in srgb, var\(--ink\) \d+%, var\(--surface-solid\)\);/)
    assert.doesNotMatch(DGM_BLOCK, /dgm-fieldcheck/)
    assert.doesNotMatch(trident, /dgm-fieldcheck/)
    // The four-pixel targets are gone. Nobody has a reason to aim at a queue
    // chip or a ledger row, which is why the mechanisms that used to hide behind
    // them now run on their own.
    assert.doesNotMatch(trident, /touch\('queue'|touch\('shutter'|touch\('row'|part\.kind/)
    for (const rule of ['.dgm-queued', '.dgm-ledgerrow.is-parent', '.dgm-ledgerrow.is-hot', '.dgm-catch.is-live', '.dgm-throat.is-hot']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
    // A Nectar site shows the local run crossing its own records, and the
    // library takes a pointer as one panel over a target the size of the plane.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-site\.is-hot \.dgm-sweep/)
    assert.match(nectar, /className=\{`dgm-library\$\{lit\('library'\)\}`\} \{\.\.\.probe\('library'\)\}/)
    assert.match(nectar, /<rect className="dgm-hit" x="-160" y="-160" width="320" height="320" rx="28" \/>/)
    assert.match(DGM_BLOCK, /\.dgm-library\.is-hot \.dgm-traffic \{ stroke-dasharray: 8 92; \}/)
    // Nothing on a rising arc is a target: its tag crosses the library's own
    // plane, and a pointer sliding over one would drop the panel on the way.
    assert.match(DGM_BLOCK, /\.dgm-lift \{ pointer-events: none; \}/)
  })

  it('letters each site on its own wall instead of in the margin', () => {
    // The middle of a plan side carried through the projection, half a wall
    // down, running along the edge - so the number is on the object rather than
    // pointed at from off to one side. The margin keeps the two figures and
    // stops repeating the name, which would be the drawing saying it twice.
    assert.match(nectar, /const \[mx, my\] = solid\.p\(site\.half, 0\)/)
    assert.match(nectar, /className="dgm-wallmark"/)
    assert.match(nectar, /rotate\(\$\{-EDGE_ANGLE\}/)
    assert.doesNotMatch(nectar, /className="dgm-side"/)
    assert.match(DGM_BLOCK, /\.dgm-wallmark \{[\s\S]*?font-family: var\(--font-mono\);/)
    // A name is not a state, so it never takes a status colour.
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-svg\.is-\w+ \.dgm-wallmark/)
  })

  it('places the source labels above their plates, upright and legible', () => {
    // Each plate carries its own height, so the labels are hung off it rather
    // than off one shared line - the agent stands higher than its two peers.
    assert.match(trident, /className="dgm-platelabel" x=\{item\.cx\} y=\{item\.y - 48\} textAnchor="middle"/)
    assert.match(trident, /className="dgm-platenote" x=\{item\.cx\} y=\{item\.y - 36\} textAnchor="middle"/)
    assert.match(trident, /\{ key: 'AGENT', cx: 258, y: 94/)
    assert.match(trident, /\{ key: 'MODEL', cx: 126, y: 122/)
    // Not rotated onto a deck edge, where they were unreadable.
    assert.doesNotMatch(trident, /dgm-platelabel[\s\S]{0,200}rotate\(/)
  })

  it('draws the agent motif as the loop it is named after', () => {
    // Three spokes running into the middle of a hub disc read as lines crossing
    // inside a circle, not as a tool loop. It is a track now, and it runs.
    assert.match(trident, /const LOOP = 'M -6 -13 H 6 A 13 13 0 0 1 6 13 H -6 A 13 13 0 0 1 -6 -13 Z'/)
    assert.match(trident, /className="dgm-loopflow" d=\{LOOP\} pathLength="100"/)
    assert.doesNotMatch(trident, /<line key=\{`l\$\{x\}`\} x1="0" y1="0"/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-loopflow \{[\s\S]*?animation: dgm-travel/)
  })

  it('gives each Trident deck something to be, not just a face to sit on', () => {
    // An intake with a catchment and a queue, a shutter in a frame with bolts
    // across its seam, and a ledger whose rows are chained.
    for (const part of ['dgm-catch', 'dgm-queue', 'dgm-throat', 'dgm-housing', 'dgm-aperture', 'dgm-holerim', 'dgm-bolt', 'dgm-ledgerhash', 'dgm-ledgerchain', 'dgm-ledgerseal']) {
      assert.match(trident, new RegExp(`className=[^>]{0,40}${part}`))
      assert.match(DGM_BLOCK, new RegExp(`\\.${part}[\\s,{]`))
    }
    // The hand-drawn signature stroke is gone. It was the one gag in either
    // figure, it measured out as overlapping the ring beside it, and what a
    // named person signed is a fact - so the rail carries it as one.
    assert.doesNotMatch(trident, /const SIGNATURE|dgm-sigplate|dgm-sigstroke|dgm-sigrule|dgm-seal|RECEIPT SEALED/)
    assert.match(trident, /authority: open \? 'SIGNED A\. VOSS \d\d:\d\dZ' : 'SHUT - NEEDS A SIGNATURE'/)
    for (const rule of ['.dgm-sigplate', '.dgm-sigstroke', '.dgm-sigrule', '.dgm-rebate', '.dgm-gatering', '.dgm-seal', '.dgm-sigbar', '.dgm-sigfill']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
  })

  it('shuts the gate mechanically rather than colouring a status light', () => {
    assert.match(trident, /url\(#tr-hatch\)/)
    assert.match(trident, /className=\{`dgm-leaf is-left\$\{open \? ' is-open' : ''\}`\}/)
    assert.match(trident, /className=\{`dgm-leaf is-right\$\{open \? ' is-open' : ''\}`\}/)
    // Clipped to the opening. Stroked all the way round, each blade projected
    // to a parallelogram and the pair met on a diagonal, so the seam came out
    // doubled and notched at both ends. Clipped, a blade shows one edge - the
    // seam - and cannot be drawn outside the hole it is filling at any throw.
    assert.match(trident, /<clipPath id="tr-hole">/)
    assert.match(trident, /<g clipPath="url\(#tr-hole\)">/)
    assert.match(DGM_BLOCK, /\.dgm-leaf\.is-left\.is-open \{ transform: translateX\(-22px\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-leaf\.is-right\.is-open \{ transform: translateX\(22px\); \}/)
    // Shut is a mechanism holding: bolts lie over the seam and withdraw along
    // it, rather than a ring pulsing beside it.
    assert.match(trident, /const BOLTS = \[-1, 1\]/)
    assert.match(trident, /y=\{end \* 14 - 4\.5\}/)
    assert.match(DGM_BLOCK, /\.dgm-bolt\.is-clear \{ transform: translateY\(calc\(var\(--end, 1\) \* 26px\)\); \}/)
    // Nectar's boundary is the skirt of every site deck, drawn as a wall rather
    // than a hatch, and identically at every site.
    assert.match(nectar, /className="dgm-wall"/)
    assert.match(DGM_BLOCK, /\.dgm-wall \{/)
  })

  it('lays the contract out as a count and leaves its middle clear', () => {
    assert.match(trident, /'SUBJECT', 'SITE', 'PROTOCOL'/)
    assert.equal((trident.match(/'[A-Z][A-Z0-9]+',/g) || []).length >= 18, true)
    // Nineteen tiles as 5-5-5-4 with the short row centred. The node that used
    // to sit at the deck's origin had tiles running through it.
    assert.match(trident, /;\[5, 5, 5, 4\]\.forEach\(\(count, row\) => \{/)
    assert.match(trident, /const x = \(col - \(count - 1\) \/ 2\) \* 28/)
    assert.doesNotMatch(trident, /planSpace\(CX, CONTRACT\.cy\)[\s\S]{0,900}dgm-port/)
    assert.match(trident, /\{\.\.\.touch\(index\)\}/)
    assert.match(DGM_BLOCK, /\.dgm-fieldtile\.is-named \{/)
  })

  it('draws Nectar as a federation in plan, so the two figures are not one drawing', () => {
    assert.equal((nectar.match(/\{ id: 'SITE /g) || []).length, 3)
    assert.match(nectar, /const NODES = \[\]/)
    assert.match(nectar, /const LINKS = \[\]/)
    // Neither figure borrows the other's signature move.
    assert.doesNotMatch(nectar, /dgm-rail|dgm-leaf|dgm-drop/)
    assert.doesNotMatch(trident, /const NODES|dgm-node|dgm-reach/)
  })

  it('crosses structure both ways and a record in neither', () => {
    // Structure goes up - a site publishes the definition it used - and
    // structure comes back down, because a library nobody can take anything out
    // of is a filing cabinet. The figure used to assert that second direction in
    // a caption while drawing three arcs that all pointed the same way, so the
    // phase claiming two sites had picked the definition up showed nothing at
    // all coming down.
    assert.match(nectar, /<path className="dgm-rise" d=\{item\.path\} pathLength="100" \/>/)
    assert.match(nectar, /<path className="dgm-fall" d=\{item\.path\} pathLength="100" \/>/)
    assert.match(DGM_BLOCK, /@keyframes dgm-return \{\s*\n\s*from \{ stroke-dashoffset: 0; \}\s*\n\s*to \{ stroke-dashoffset: 200; \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-lift\.is-down \.dgm-fall \{[\s\S]*?animation: dgm-return/)
    // One curve, two directions. Two separate arcs would be a picture of two
    // pipes; the exchange is one channel with traffic on it.
    assert.match(nectar, /<path className="dgm-channel" d=\{item\.path\} \/>/)
    // Both directions are on the same phase table, and a site can be doing both
    // at once - which is the steady state of a federation.
    assert.match(nectar, /up: \['SITE 018', 'SITE 042', 'SITE 103'\], down: \['SITE 042', 'SITE 103'\]/)
    assert.match(nectar, /const down = state\.down\.includes\(item\.key\)/)
    // What never travels is a record. No path in the figure asks for one, none
    // is refused at a wall, and the margin says so as a count rather than as a
    // policy word the two channels overhead would be busy contradicting.
    assert.doesNotMatch(nectar, /RECORD REQUEST|REFUSED|dgm-cross|is-back|BACK_TO|BACK_FROM/i)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-route\.is-back|\.dgm-cross|\.dgm-refused/)
    // Nothing that carries or refuses anything is drawn in an alarm colour.
    // `--danger` has exactly one job in either figure, and it is on the library
    // floor: a criterion the library is not holding good. It is a state of a
    // definition, never a state of a crossing - so no route, mast, gate, wall or
    // channel may reach for it.
    for (const rule of [
      '.dgm-channel', '.dgm-feeder', '.dgm-rise', '.dgm-fall', '.dgm-liftpath',
      '.dgm-mast', '.dgm-masthead', '.dgm-gatecap', '.dgm-wall', '.dgm-lid', '.dgm-record',
    ]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*var\\(--danger`))
    }
    assert.equal((DGM_BLOCK.match(/var\(--danger\)/g) || []).length, 2)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-red \{\s*\n\s*--ink: var\(--danger\);/)
    assert.match(nectar, />0 LEAVE<\/text>/)
    assert.match(nectar, /status: 'STEADY', read: 'Structure crosses\. Records do not\.'/)
    // Every channel leaves a mast standing on the far corner of a site's own
    // roof, and the head on that mast is what swallows the foot of the arc - the
    // site orbits and the library drifts, so an endpoint parked on a silhouette
    // would part from it on the first frame. Both ends of a channel now carry a
    // solid with a crown for exactly that reason: a mast below and a gate above.
    assert.match(nectar, /path: `M \$\{x1\} \$\{y1\} \$\{arc\} L \$\{crown\[0\]\} \$\{crown\[1\]\}`/)
    assert.match(nectar, /const foot = item\.site\.solid\.back/)
    assert.match(nectar, /const \[x1, y1\] = \[foot\[0\], r1\(foot\[1\] - MAST\)\]/)
    assert.match(nectar, /<circle className="dgm-masthead" cx=\{chan\.head\[0\]\} cy=\{chan\.head\[1\]\} r=\{MAST_HEAD\} \/>/)
  })

  it('lands every channel on a gate at the rim without ever crossing the slab', () => {
    // A curve that ends on the slab's top face has to cross the near skirt to
    // get there, and in an axonometric the band just outside a near edge is the
    // same band the near face occupies - so the eye resolves the ambiguity as
    // "in front of everything" and the whole run reads as a wire laid over a
    // photograph. The old arcs did exactly that.
    //
    // Three things fix it, and each is load-bearing on its own: the terminus
    // moves to the skirt's bottom rim, the terminal tangent becomes one of the
    // drawing's own plan axes, and a gate stands on the rim for the curve to
    // arrive at. This test re-solves all three from the projection, because
    // pinning them to coordinates would let the next edit to the slab, the sites
    // or the gate seats quietly reintroduce the crossing.
    const num = (name, source = nectar) => Number(source.match(new RegExp(`const ${name} = (-?[\\d.]+)`))[1])
    const LIB_HALF = num('LIB_HALF')
    const LIB_WALL = num('LIB_WALL')
    const MESH_Y = num('MESH_Y')
    const GROUND_Y = num('GROUND_Y')
    const MAST = num('MAST')
    const GATE_RISE = num('GATE_RISE')
    const GATE_REACH = num('GATE_REACH')
    const mesh = ISO.project(310, MESH_Y)
    const ground = ISO.project(310, GROUND_Y)

    // The slab's exact silhouette: its plan ring projected, then the same ring
    // dropped by one wall. Not two half-planes - the plan corners are rounded, so
    // the front corner sits a good five pixels inboard of where the two flat
    // edges would meet, and a half-plane test would call that region safe.
    const ring = ISO.roundedPlan(LIB_HALF, 28).map(([x, y]) => mesh(x, y))
    const poly = [...ring, ...ring.map(([x, y]) => [x, y + LIB_WALL]).reverse()]
    const inside = ([px, py]) => {
      let hit = false
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i += 1) {
        const [xi, yi] = poly[i]
        const [xj, yj] = poly[j]
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit
      }
      return hit
    }

    const sites = [...nectar.matchAll(/plan: \[(-?\d+), (-?\d+)\], records: '[\d,]+', half: (\d+), wall: (\d+)/g)]
      .map((m) => ({ plan: [Number(m[1]), Number(m[2])], half: Number(m[3]), wall: Number(m[4]) }))
    assert.equal(sites.length, 3)

    const edges = []
    for (const site of sites) {
      // Which rim point is not chosen. Screen x here depends only on (x - y), so
      // the rim point standing directly over a site is the one that keeps that
      // site's own (x - y). Two sites resolve onto a flat edge; the third, on
      // the plan diagonal, resolves to the front corner.
      const span = site.plan[0] - site.plan[1]
      const corner = LIB_HALF - 28 + 28 / Math.SQRT2
      const edge = span > 40 ? 'right' : span < -40 ? 'left' : 'corner'
      edges.push(edge)
      const rimPlan = edge === 'right' ? [LIB_HALF, LIB_HALF - span]
        : edge === 'left' ? [LIB_HALF + span, LIB_HALF]
          : [corner, corner]
      const out = edge === 'right' ? [1, 0] : edge === 'left' ? [0, 1] : [1, 1]

      const rim = mesh(...rimPlan)
      const land = [rim[0], rim[1] + LIB_WALL]
      // The mast head, on the far corner of the site's own roof.
      const [cx, base] = ground(...site.plan)
      const solid = ISO.roundedDeck(cx, base - site.wall, site.half, site.wall, Math.round(site.half * 0.34))
      const start = [solid.back[0], solid.back[1] - MAST]
      // The control point sits on the outward plan normal of the face the curve
      // lands on, carried through the projection.
      const away = [(out[0] - out[1]) * ISO.ISO_X, (out[0] + out[1]) * ISO.ISO_Y]
      const len = Math.hypot(...away)
      const ctrl = [land[0] + (GATE_REACH * away[0]) / len, land[1] + (GATE_REACH * away[1]) / len]

      // A quadratic's tangent at the end is (end - control), so the last stretch
      // of the arc runs along a plan axis of the drawing rather than at whatever
      // angle the chord happened to leave. On screen that is the same slope every
      // skirt and every wall marking already runs at.
      const tangent = [land[0] - ctrl[0], land[1] - ctrl[1]]
      assert.ok(
        Math.abs(tangent[0] * away[1] - tangent[1] * away[0]) < 1e-9,
        `${edge}: the arc does not arrive along a plan axis`,
      )

      // The curve is bounded by the hull of its control points, and this walks
      // it anyway: nothing on the arc leg may be inside the slab. The riser
      // after it is excluded on purpose - it lies on the skirt and then on the
      // gate's outboard face, which are surfaces, not the interior.
      const control = edge === 'corner'
        ? [start, [start[0] + 34, start[1] - 56], ctrl, land]
        : [start, ctrl, land]
      const at = (t) => {
        const u = 1 - t
        return control.length === 4
          ? [0, 1].map((k) => u * u * u * control[0][k] + 3 * u * u * t * control[1][k] + 3 * u * t * t * control[2][k] + t * t * t * control[3][k])
          : [0, 1].map((k) => u * u * control[0][k] + 2 * u * t * control[1][k] + t * t * control[2][k])
      }
      for (let step = 0; step <= 400; step += 1) {
        const point = at((step / 400) * 0.999)
        assert.ok(!inside(point), `${edge}: the channel crosses the slab at ${point.map(Math.round)}`)
      }
      // And it stops exactly on the underside rim, which is the one point on the
      // silhouette a line coming from below cannot be misread at.
      assert.ok(Math.abs(land[1] - (rim[1] + LIB_WALL)) < 1e-9)
    }
    // Right edge, left edge, front corner: three gates spread across the whole
    // near silhouette rather than three landings on one side of it.
    assert.deepEqual([...edges].sort(), ['corner', 'left', 'right'])

    // The gate itself is the same solid as a criterion, a deck and a site, at
    // the scale of a port - seated so its outboard face is flush with the slab's
    // plan boundary, which is what makes the riser one straight mark on one
    // continuous surface instead of a line in the air.
    assert.match(nectar, /solid: planPrism\(gate\.seat\[0\], gate\.seat\[1\], gate\.halfX, gate\.halfY, GATE_RISE, CRIT_RADIUS\)/)
    assert.match(nectar, /seat: \[LIB_HALF - GATE_ACROSS, rim\[1\]\]/)
    assert.match(nectar, /const crown = \[rim\[0\], r1\(rim\[1\] - GATE_RISE\)\]/)
    assert.ok(GATE_RISE > LIB_WALL, 'a gate has to stand taller than the slab is thick to read as a gate')
    // The front corner is solved rather than read off `LIBRARY.front`:
    // `roundedPlan` samples its arcs in seven steps and never lands on 45
    // degrees, so the sampled corner is four pixels off the true one - and four
    // pixels is the whole composition off centre.
    assert.match(nectar, /const RIM_CORNER = LIB_HALF - 28 \+ 28 \/ Math\.SQRT2/)
    assert.doesNotMatch(nectar, /^[^/\n]*LIBRARY\.front/m)

    // What the gate feeds. A channel stops at the rim, so a run on the floor
    // carries the definition the rest of the way in - drawn among the mesh, so
    // every solid taller than it passes in front of it. That is the one move no
    // arc in screen space can make, and it is what puts the last leg on the slab
    // instead of above it.
    assert.match(nectar, /className=\{`dgm-feeder\$\{state\.up\.includes\(item\.key\) \? ' is-up' : ''\}`\}/)
    assert.match(nectar, /x1=\{item\.gate\.at\[0\]\}[\s\S]{0,120}x2=\{item\.node\.at\[0\]\}/)
    // The channels drift with the slab now. Three pixels of travel at a joint
    // that has nothing to hide it would show as the route parting from the gate;
    // moved to the site end it is swallowed by a mast head built for it.
    assert.match(DGM_BLOCK, /\.dgm-library,\s*\n\.dgm-lift \{ transform: translateY\(var\(--drift, 0px\)\); \}/)
    // And a channel turns a corner now, so every mark that runs one has to
    // round its joins or the default miter throws a spike as a dash spans it.
    for (const rule of ['.dgm-channel', '.dgm-liftpath']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*stroke-linejoin: round;`))
    }
    assert.match(DGM_BLOCK, /\.dgm-rise,\s*\n\.dgm-fall \{[^}]*stroke-linejoin: round;/)
  })

  it('shows the network effect as geometry rather than a claim', () => {
    // Three reaches on one ground, growing with coverage until they overlap -
    // and three sizes of reach, because the site that has contributed the most
    // is the one that reaches furthest. Squared off in plan like the sites they
    // belong to, and clipped to the ground the three of them stand on.
    assert.match(nectar, /className="dgm-reachrim" x=\{site\.plan\[0\] - span\} y=\{site\.plan\[1\] - span\} width=\{span \* 2\} height=\{span \* 2\}/)
    assert.match(nectar, /<clipPath id="nc-ground">/)
    assert.match(nectar, /<g clipPath="url\(#nc-ground\)">/)
    // Solved against the plan, not chosen - and re-solved here rather than
    // pinned to literals, because the claim is the geometry. Spreading the
    // sites without regrowing the reach would leave the closing frame asserting
    // an overlap it no longer draws, and a hard-coded pair of coordinates would
    // not have caught it. Reaches are plan-aligned squares, so two of them meet
    // exactly when the larger of their two axis gaps is inside the sum of their
    // half-sizes.
    const sites = [...nectar.matchAll(/plan: \[(-?\d+), (-?\d+)\], records: '[\d,]+', half: \d+, wall: \d+, bands: \d+, grew: ([\d.]+)/g)]
      .map((match) => ({ x: Number(match[1]), y: Number(match[2]), grew: Number(match[3]) }))
    const reaches = [...nectar.matchAll(/reach: (\d+)/g)].map((match) => Number(match[1]))
    assert.equal(sites.length, 3)
    assert.equal(reaches.length >= 2, true)
    const apart = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y))
    for (const [a, b] of [[0, 1], [0, 2], [1, 2]]) {
      const gap = apart(sites[a], sites[b])
      const span = sites[a].grew + sites[b].grew
      assert.equal(span * reaches[0] < gap, true, `sites ${a} and ${b} already touch in the opening figure`)
      assert.equal(span * reaches[reaches.length - 1] > gap, true, `sites ${a} and ${b} never overlap by the closing figure`)
    }
    assert.match(DGM_BLOCK, /\.dgm-reachrim \{[\s\S]*?transition: x var\(--grow\)/)
    // And the three definitions land in three parts of the library rather than
    // in one corner of it, because that is what compounding coverage looks like.
    assert.match(nectar, /const BAND = \[\.\.\.ORDER\.slice\(30, 38\)\]\.sort\(\(a, b\) => \(a\.x - a\.y\) - \(b\.x - b\.y\)\)/)
    assert.match(nectar, /node: BAND\[BAND\.length - 1\]/)
    assert.match(nectar, /node: BAND\[0\]/)
    // The library is a mesh that lights up, not a box being coloured in - and
    // what lights up is a floor of plant rather than a chart. Every solid on it
    // carries one of three states, a state the library is in about that
    // criterion: holding it good, holding it under review, or not holding it.
    // Red, amber, green, the three words a floor has always used, and no legend
    // anywhere on the sheet.
    assert.match(nectar, /className=\{`dgm-crit \$\{node\.lamp\}/)
    assert.match(nectar, /lamp: grade < 0\.15 \? 'is-red' : grade < 0\.41 \? 'is-amber' : 'is-green'/)
    for (const [cls, token] of [['is-red', '--danger'], ['is-amber', '--warning'], ['is-green', '--success']]) {
      assert.match(DGM_BLOCK, new RegExp(`\\.dgm-crit\\.${cls} \\{\\s*\\n\\s*--ink: var\\(${token}\\);`))
    }
    // And each one switches on and off on a clock of its own. A switch, not a
    // fade: `step-end` holds every keyframe until the next, so nothing between
    // the two states is ever drawn. Two patterns over forty-two incommensurable
    // periods, so the floor never falls into a loop a reader can catch.
    assert.match(DGM_BLOCK, /@keyframes dgm-lamp \{[\s\S]*?46% \{ fill-opacity: 0\.2; \}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-lampflick \{/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit\.is-bound \.dgm-node \{\s*\n\s*animation: dgm-lamp calc\(5\.2s \+ var\(--life, 0\) \* 7\.4s\) step-end infinite;/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit\.is-bound\.is-flick \.dgm-node \{ animation-name: dgm-lampflick; \}/)
    // Nothing on this floor may interpolate a colour. A keyframe mixing two
    // color-mix() values gets re-snapshotted by the compositor whenever a class
    // change forces a style recalc mid-animation, and what came back was a
    // highlighter green present nowhere in the token set. Only scalars move.
    for (const frames of DGM_BLOCK.match(/@keyframes dgm-(lamp|lampflick|pass|passbound|passhard)[\s\S]*?\n\}/g) || []) {
      assert.doesNotMatch(frames, /fill:|stroke:|color-mix/)
    }
  })

  it('runs the local work inside the wall, where the records are', () => {
    assert.match(nectar, /className="dgm-sweep"/)
    assert.match(nectar, /className="dgm-lid"/)
    assert.match(DGM_BLOCK, /@keyframes dgm-sweep/)
  })

  it('gives the mark room and a reason in both figures', () => {
    // One mark per drawing, large, in the top-left corner, clear of everything
    // - not a favicon set beside a caption.
    for (const source of figures) {
      assert.match(source, /<image className="dgm-mark" href="\/assets\/damaros-monogram-blue\.svg" x="22" y="16" width="34" height="40" \/>/)
      assert.equal((source.match(/dgm-mark/g) || []).length, 1)
    }
    // The receipt says it is written by being written - the front row fills and
    // its seal turns - rather than by a pill parked beside the deck announcing
    // it in words the rail was already carrying.
    assert.match(trident, /const written = state\.receipt \|\| !last/)
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgerseal \{ fill: var\(--settled\); \}/)
  })

  it('keeps the figures off the site green and on a deeper one', () => {
    // At figure scale - a 1.3px rim round the opening, a 7px seal on a ledger
    // row, a 9px pill - the success token comes out emerald and reads as a
    // highlighter, which is the wrong register for a drawing whose subject is a
    // thing that will not move without a signature. Carried toward the ink it is
    // still unmistakably the settled colour and stops shouting.
    assert.match(DGM_BLOCK, /--settled: color-mix\(in srgb, var\(--success\) \d\d%, var\(--text\)\);/)
    // Derived, not picked: no figure invents a colour of its own.
    assert.doesNotMatch(DGM_BLOCK, /#[0-9a-fA-F]{3,8}\b/)
    // And nothing in either drawing reaches past it to the raw token.
    assert.doesNotMatch(DGM_BLOCK, /(stroke|fill): var\(--success\);/)
  })

  it('gives every Trident tier the colour of the authority it holds', () => {
    // Four decks, four inks, and they are not a palette applied to a drawing -
    // they are the four states the run passes through, so the deck that owns a
    // state owns the colour. Top to bottom: proposed by a machine, checked
    // against a contract, held for a person, committed. Violet is the machine
    // tier and the only band of the four that is not the site, which is exactly
    // why no deck below it is drawn in that colour.
    for (const [tier, ink] of [
      ['is-surface', /--ink: color-mix\(in srgb, var\(--governed\) \d\d%, var\(--text\)\);/],
      ['is-contract', /--ink: var\(--accent\);/],
      ['is-authority', /--ink: var\(--warning\);/],
      ['is-receipt', /--ink: var\(--success\);/],
    ]) {
      assert.match(DGM_BLOCK, new RegExp(`\\.dgm-slide\\.${tier} \\{[\\s\\S]*?${ink.source}`))
    }
    // Blue is the default, which is what the contract deck takes and what Nectar
    // wants everywhere - its three sites are peers, and colouring one would say
    // one of them mattered more.
    assert.match(DGM_BLOCK, /\.dgm-svg \{[\s\S]*?--ink: var\(--accent\);\s*\n\s*--ink-deep: var\(--accent-strong\);/)
    assert.doesNotMatch(nectar, /dgm-slide|--ink:/)
    // The descent is the claim: a drop belongs to the deck it lands on and takes
    // that deck's ink, so the run visibly changes hands three times on its way
    // down rather than being one blue line with four captions beside it.
    assert.match(DGM_BLOCK, /\.dgm-drop\.is-latest \.dgm-droppath \{ stroke: var\(--ink\);/)
    assert.match(DGM_BLOCK, /\.dgm-dropflow \{[\s\S]*?stroke: var\(--ink-deep\);/)
    assert.match(DGM_BLOCK, /\.dgm-rail\.is-live \.dgm-railnode \{ fill: var\(--ink\); \}/)
    // And no tier-local part reaches past its own ink to the raw house accent.
    for (const rule of ['.dgm-fieldtile.is-named', '.dgm-tine.is-live', '.dgm-pad.is-live']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*var\\(--accent`))
    }
  })

  it('gives the solids a body and the tiers a shade, so four heights read as four', () => {
    // The three faces of a solid used to sit within four percent of each other,
    // on the theory that an axonometric has no light source. True of a rendered
    // highlight, false of a body colour: at that separation the solids came out
    // as outlines and four floating tiers read as four rectangles printed on one
    // sheet. There is still no light source - the skirts are simply given enough
    // body to be sides, tinted with the ink of the tier they belong to.
    //
    // The wash is one number for the whole system rather than a literal per
    // face, and the near face is mixed into pure white rather than into a
    // text-into-white neutral. It had been nine per cent of ink in a grey, which
    // meant nine tenths of every face was a colour with no colour in it: measured
    // against the sheet, three of the four near faces came out at or below the
    // chroma of the paper they sat on and the receipt tier was less colourful
    // than the page. That is what faded was - not the inks, the carrier.
    assert.match(DGM_BLOCK, /--wash: \d+%;/)
    assert.match(DGM_BLOCK, /--shade: \d+%;/)
    assert.match(DGM_BLOCK, /--body-near: var\(--surface-solid\);/)
    assert.match(DGM_BLOCK, /\.dgm-face-left \{[\s\S]*?fill: color-mix\(in srgb, var\(--ink\) var\(--wash, \d+%\), var\(--body-near\)\);/)
    // The far face is the same wash carried one step into the tier's own dark
    // rather than a second, differently-mixed colour - two faces of one object,
    // one pigment at one density, differing only in value.
    assert.match(DGM_BLOCK, /\.dgm-face-right \{[\s\S]*?fill: color-mix\(in srgb, var\(--ink-deep\) var\(--shade, \d+%\), color-mix\(in srgb, var\(--ink\) var\(--wash, \d+%\), var\(--body-far\)\)\);/)
    // And every tier drops a shade on whatever it is held above - the deck
    // below, or the ground for the bottom one. Occlusion, not a cast shadow:
    // nothing invents a light, but a slab over a plane still darkens it, and
    // without that there was nothing at all saying the four were apart.
    assert.match(trident, /const SEATS = LAYERS\.map\(\(deck, index\) => \(\{/)
    assert.match(trident, /onto: index === LAYERS\.length - 1 \? GROUND : LAYERS\[index \+ 1\]\.cy/)
    assert.equal((trident.match(/<Seat seat=\{SEATS\[\d\]\} \/>/g) || []).length, 4)
    // Inset rather than cast at full size. Every deck is the same size as every
    // other, so a shade the size of its own caster covers the whole receiver and
    // reads as that deck being dirty instead of as height above it.
    assert.match(trident, /\[8, 20, 32\]\.map\(\(inset\) => \(/)
    assert.match(nectar, /const SEAT_STEPS = \[0\.1, 0\.26, 0\.42\]/)
    // It breathes on the clock of the tier casting it, in antiphase to that
    // tier's own bob, with the boot gate folded into the keyframe - an animated
    // opacity on the element would paint four shades over each other while the
    // stack is still closed.
    assert.match(DGM_BLOCK, /@keyframes dgm-seat \{\s*\n\s*0%, 100% \{ opacity: var\(--seat-in\); transform: scale\(1\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-seat \{\s*\n\s*animation: dgm-seat calc\(7\.4s \+ var\(--life, 0\) \* 4\.6s\)/)
    // Things standing on a deck are extruded the way the deck is: a bound field,
    // a committed ledger row, a waiting proposal, a landing pad and the plinth
    // the shutter is set in are all solids with two side faces, which is the
    // only depth cue available inside a plan. `planPrism` is `roundedDeck` at
    // object scale and inside the projection instead of outside it, so nothing
    // on a surface in either figure is a glyph printed on it.
    assert.match(iso, /export function planDrop\(depth\) \{/)
    assert.match(iso, /const step = round\(depth \/ \(2 \* ISO_Y\)\)/)
    assert.match(iso, /export function planPrism\(cx, cy, halfX, halfY, depth, radius\) \{/)
    for (const call of [
      /block: planPrism\(x, y, FIELD_HALF, FIELD_HALF, FIELD_RISE, 5\)/,
      /bar: planPrism\(4, y, 48, 5\.5, 5, 3\)/,
      /block: planPrism\(x, 52, 5, 5, 5, 3\)/,
      /puck: planPrism\(source\.land\[0\], source\.land\[1\], 12, 12, 4, 12\)/,
      /const HOUSING = planPrism\(0, 0, SHUT_FRAME, SHUT_FRAME, HOUSE_RISE, 13\)/,
    ]) assert.match(trident, call)
    // A raised cap moves by the plan step its own sides were built with, so a
    // roof can never land somewhere its walls do not reach.
    assert.match(DGM_BLOCK, /\.dgm-fieldtile\.is-bound \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgercap \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-riser\.is-up \{ opacity: [\d.]+; \}/)
    // And the two holes in the stack are holes: clipped to their own opening, so
    // what is drawn is exactly what can be seen down them - far wall, then floor.
    assert.match(trident, /<clipPath id="tr-well">/)
    assert.match(trident, /<circle className="dgm-shaft" cx="0" cy="0" r="14" \/>/)
    assert.match(trident, /<rect className="dgm-shaft" x=\{-SHUT_HOLE\}/)
    assert.match(DGM_BLOCK, /\.dgm-port\.is-hub \{ fill: none;/)
  })

  it('holds the library above the ground and stands a criterion up when it binds', () => {
    // The library was one rounded rect with a hairline round it, which put the
    // two planes of this figure in the same register as the dot field behind
    // them - drawn on the page rather than held over it. It is the same extruded
    // solid every deck and every site is, and it drops its own shade on the
    // federation below.
    assert.match(nectar, /const LIBRARY = roundedDeck\(310, MESH_Y, LIB_HALF, LIB_WALL, 28\)/)
    assert.match(nectar, /<Faces shape=\{LIBRARY\} className="dgm-solid" \/>/)
    assert.match(nectar, /<Seat half=\{LIB_HALF\} radius=\{28\} cy=\{GROUND_Y\} kind="library" \/>/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-seat\.is-library \{\s*\n\s*animation-duration: 11s;/)
    // Binding is elevation, and a criterion is a plate rather than a dot. An
    // unbound one is its own footprint lying flat on the slab; a bound one is
    // standing on that footprint with two side faces under it, as high as it is
    // connected - so the slab grows a skyline whose tall buildings are the hubs,
    // and compounding coverage is watched rather than read off a legend. The
    // lattice stays printed on the slab, because that is the index and the
    // solids are what it holds.
    assert.match(nectar, /const CRIT_HALF = 7/)
    assert.match(nectar, /const depth = CRIT_LOW \+ Math\.round\(\(DEGREE\[node\.index\] \/ BUSIEST\) \* CRIT_SPAN\)/)
    assert.doesNotMatch(nectar, /dgm-stem|const RISE = 8/)
    // Two kinds of solid on one floor, and they are one object at two shapes:
    // same footprint, same storey, the same extrusion solved the same way, so a
    // block and a drum read as machinery rather than as two chart symbols.
    assert.match(nectar, /node\.block = node\.round\s*\n\s*\? planCyl\(node\.x, node\.y, CRIT_HALF, depth\)\s*\n\s*: planPrism\(node\.x, node\.y, CRIT_HALF, CRIT_HALF, depth, CRIT_RADIUS\)/)
    assert.match(nectar, /round: jitter\(index, 23\) > 0\.62/)
    assert.match(iso, /export function planCyl\(cx, cy, r, depth\) \{/)
    // A drum's silhouette runs through the two points where its plan circle is
    // tangent to the extrusion direction. The solid goes up by equal negative
    // steps on both plan axes, so that direction is the (1, 1) diagonal and the
    // tangents sit at +/- r / sqrt(2) along (1, -1).
    assert.match(iso, /const t = round\(r \/ Math\.SQRT2\)/)
    // Drawn back to front, so one standing in front of another occludes it -
    // and the gates go through the same sort as the criteria rather than being
    // appended after them, so the ordering survives the lattice being moved.
    assert.match(nectar, /\}\)\),\s*\n\s*\.\.\.CHANNELS\.map\(\(item\) => \(\{ key: `g\$\{item\.key\}`, kind: 'gate', at: item\.gate\.at, item \}\)\),\s*\n\]\.sort\(\(a, b\) => a\.at\[1\] - b\.at\[1\]\)/)
    assert.match(nectar, /<path className="dgm-face-left" d=\{node\.block\.faceLeft\} \/>/)
    assert.match(nectar, /<polygon className="dgm-node" points=\{node\.block\.base\} \/>/)
    assert.match(nectar, /<path className="dgm-face-right" d=\{node\.block\.wall\} \/>/)
    assert.match(nectar, /<circle className="dgm-node" cx=\{node\.block\.base\.cx\} cy=\{node\.block\.base\.cy\} r=\{node\.block\.r\} \/>/)
    // The cap rises by the plan step its own sides were built with, so a roof
    // can never land somewhere its walls do not reach.
    assert.match(nectar, /'--lift': `\$\{node\.block\.step\}px`/)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-bound \.dgm-node \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-bound \.dgm-face-left,\s*\n\.dgm-crit\.is-bound \.dgm-face-right \{ opacity: 1; \}/)
    // A ring rides the node it came from, so it resolves at the height that node
    // is standing at rather than through the slab underneath it.
    assert.match(nectar, /const joinUp = JOIN\.rank < state\.bound/)
    assert.match(DGM_BLOCK, /\.dgm-resolve\.is-up \{ transform: translateY\(calc\(var\(--rise, 0px\) \* -1\)\); \}/)
    // And each site orbits its own footprint - a true plan circle carried
    // through the projection, so the three move in the ground rather than
    // hovering over it, with the reach each one carries running the same circle
    // in plan units so a site never drifts outside its own coverage.
    assert.match(DGM_BLOCK, /@keyframes dgm-orbit \{[\s\S]*?12\.5% \{ transform: translate\(0, 0\.96px\); \}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-orbitplan \{[\s\S]*?25% \{ transform: translate\(0, 2px\); \}/)
    for (const rule of ['.dgm-svg.is-live .dgm-orbit', '.dgm-svg.is-live .dgm-reach']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[\\s\\S]*?animation-delay: calc\\(var\\(--life, 0\\) \\* -24s\\);`))
    }
    // The orbit lives on an inner group. The hover lift belongs to the site, and
    // a transform an animation owns cannot also be transitioned.
    assert.match(nectar, /<g className="dgm-orbit">/)
    assert.match(DGM_BLOCK, /\.dgm-site\.is-hot \{ transform: translateY\(-4px\); \}|\.dgm-site\.is-hot \{ transform/)
  })

  it('never re-times a running clock to answer a pointer', () => {
    // A mechanism under a pointer carries more; it does not run faster. Winding
    // a clock on teleports whatever it was carrying to wherever the new phase
    // happens to land, which is the jolt a reader feels the instant their cursor
    // arrives - and it was in these figures four times over: two on the intake
    // deck and two on a site's local run. Every hover response is now a change
    // of dash pattern, a change of paint, or a second mark parked on the same
    // clock half a period behind.
    assert.doesNotMatch(DGM_BLOCK, /\.is-hot[^{]*\{[^}]*animation-duration/)
    assert.doesNotMatch(DGM_BLOCK, /\.is-hot[^{]*\{[^}]*animation-delay/)
    // Doubling, not accelerating: the same period with a second mark in it, so
    // nothing already in flight moves when the cursor lands.
    for (const rule of ['.dgm-deck.is-hot .dgm-intake', '.dgm-library.is-hot .dgm-traffic', '.dgm-lift.is-hot .dgm-rise', '.dgm-lift.is-hot .dgm-fall']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*stroke-dasharray:`))
    }
    // A site's local run cannot be dash-doubled - it is a bar, not a dash - so it
    // gets a second head instead, on the same clock, half a period behind, and
    // the only thing hover touches is the wrapper's opacity.
    assert.match(nectar, /<g className="dgm-second">/)
    assert.match(DGM_BLOCK, /\.dgm-site\.is-hot \.dgm-second,\s*\n\s*\.dgm-site\.is-running \.dgm-second \{ opacity: 1; \}/)
    // The same head is what a definition coming back down lands in. Otherwise it
    // arrives at a mast and stops, which is the thing the figure was already
    // criticised for doing in the other direction.
    assert.match(nectar, /className=\{`dgm-site\$\{state\.down\.includes\(site\.id\) \? ' is-running' : ''\}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-sweep\.is-again \{\s*\n\s*animation-delay: calc\(var\(--stagger, 0\) \* -6s - 1\.5s - var\(--life, 0\) \* 1\.2s\);/)
    // Anything a hover repaints has to be able to get there: a property that
    // steps under the cursor is the same jolt as a clock that steps.
    for (const rule of ['.dgm-liftpath', '.dgm-reachrim', '.dgm-sweep', '.dgm-queue']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*transition:`))
    }
  })

  it('runs both figures off one trigger anchored to the figure itself', () => {
    // Assembly and phase used to hang off two triggers with two anchors, which
    // is why the run drifted between window sizes: on a stacked layout the copy
    // column pushed the opening phases above the fold. One trigger, on the
    // drawing, over a distance proportional to the drawing.
    // Anchored so the stack lands early and the phases play while the figure
    // crosses the middle of the screen. At `top 84%` over 0.92 of the figure's
    // height the opening beats were spent while it was still below the fold, so
    // a reader met it already halfway through its own run.
    //
    // Scroll is left doing the one job it is good at: walking the run. Booting
    // is not part of it any more - no `lead` slice off the front of the range,
    // no per-frame custom property, nothing a wheel can scrub backwards.
    assert.match(driver, /export function useScrollRun\(phases, \{ reduced, start = 'top 88%', travel = 1\.15 \}\)/)
    assert.match(driver, /end: \(\) => `\+=\$\{Math\.round\(node\.getBoundingClientRect\(\)\.height \* travel\)\}`/)
    assert.doesNotMatch(driver, /lead/)
    assert.match(driver, /const along = ease\(Math\.min\(1, Math\.max\(0, progress\)\)\)/)
    assert.match(driver, /return \[figure, reduced \? rest : phase, reduced \|\| booted\]/)
    assert.doesNotMatch(driver, /export function useScrollPhase/)
    for (const source of sources) {
      assert.doesNotMatch(source, /setTimeout|setInterval/)
    }
    for (const source of figures) {
      assert.match(source, /const \[figure, phase, booted\] = useScrollRun\(PHASES, \{ reduced \}\)/)
      assert.match(source, /export default function \w+Schematic\(\{ animate = true, reduced = false \}\)/)
      assert.match(source, /ref=\{figure\}/)
    }
    assert.match(app, /<TridentSchematic animate=\{animate\} reduced=\{reduced\} \/>/)
    assert.match(app, /<NectarSchematic animate=\{animate\} reduced=\{reduced\} \/>/)
  })

  it('will not draw a governed path through a stack that has not assembled', () => {
    assert.match(DGM_BLOCK, /\.dgm-drop \{\s*\n\s*opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.9\) \* 10\), 1\);/)
    assert.match(DGM_BLOCK, /\.dgm-liftpath \{[\s\S]*?opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.7\) \* 3\.4\), 1\);/)
  })

  it('gives the beat that carries the claim the widest stretch of scroll', () => {
    // The hold at the shut shutter and the steady state after coverage has
    // compounded are the two frames that state the claim, so each owns the
    // widest stretch of its own run and is what a reader parked mid-section is
    // left looking at. Read off the source rather than pinned to a number, so
    // retuning a phase cannot quietly hand the beat to a different one.
    const widest = (source) => {
      const phases = [...source.matchAll(/\{ span: ([\d.]+),[^}]*status: '([A-Z]+)'/g)]
        .map((match) => ({ span: Number(match[1]), status: match[2] }))
      assert.equal(phases.length >= 5, true)
      return phases.reduce((best, phase) => (phase.span > best.span ? phase : best)).status
    }
    assert.equal(widest(trident), 'HELD')
    assert.equal(widest(nectar), 'STEADY')
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /status: 'RECEIPTED'/)
    assert.match(nectar, /status: 'STEADY', read: 'Structure crosses\. Records do not\.'/)
    // The boot transition is killed first, then every ambient clock behind it.
    assert.match(DGM_BLOCK, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.dgm-svg \{ transition: none; \}\s*\n\s*\n\s*\.dgm-svg :is\(/)
    for (const name of ['dgm-droppath', 'dgm-approach', 'dgm-spark', 'dgm-traffic', 'dgm-reachrim', 'dgm-sweep']) {
      assert.match(DGM_BLOCK, new RegExp(`prefers-reduced-motion[\\s\\S]*?\\.${name}[,)]`))
    }
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

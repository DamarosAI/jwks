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
    assert.match(nectar, /records: '890', half: 44, wall: 18, bands: 4, grew: 0\.96/)
    assert.match(nectar, /records: '614', half: 40, wall: 15, bands: 3, grew: 0\.92/)
    assert.match(nectar, /records: '1,204', half: 55, wall: 22, bands: 5, grew: 1\.04/)
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
    assert.match(nectar, /jitter\(index, 7\)/)
    assert.match(trident, /jitter\(index, 4\)/)
    for (const source of sources) {
      assert.doesNotMatch(source, /Math\.random|Date\.now/)
    }
    // Nectar's floor is not scattered at all any more, and that is the point.
    // Where a definition stands is decided by its district and its rank inside
    // it - a phyllotactic disc, the arrangement a sunflower head uses - so a
    // cluster fills evenly at any count with no grid in it and nothing to seed.
    // A jittered lattice put forty-two things on a slab; this puts eleven
    // criteria in CRITERIA.
    assert.match(nectar, /const GOLDEN = 137\.507764/)
    assert.match(nectar, /const radius = district\.spread \* Math\.sqrt\(\(member \+ 0\.55\) \/ district\.count\)/)
    assert.match(nectar, /const angle = \(\(member \* GOLDEN \+ band \* 41\) \* Math\.PI\) \/ 180/)
  })

  it('keeps both drawings in motion with nobody touching them', () => {
    // Ambient life, on scattered clocks so nothing falls into step and no loop
    // is short enough for a reader to catch. All of it gated on `is-live`, so
    // it never runs on a phone or against a reduced-motion preference.
    for (const rule of [
      '.dgm-svg.is-live .dgm-spark',
      '.dgm-svg.is-live .dgm-fieldtile:not(.is-named)',
      '.dgm-svg.is-live .dgm-bank:not(.is-clear) .dgm-blade',
      '.dgm-svg.is-live .dgm-drop.is-done .dgm-dropflow',
      '.dgm-svg.is-live .dgm-tracerun',
      '.dgm-svg.is-live .dgm-crit',
      '.dgm-svg.is-live .dgm-crit.is-bound .dgm-node',
      '.dgm-svg.is-live .dgm-reachrim',
      '.dgm-svg.is-live .dgm-sweep',
    ]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[\\s\\S]*?animation:`))
    }
    // In Trident every ambient clock is jittered per element rather than shared.
    assert.match(DGM_BLOCK, /animation: dgm-travel calc\(5\.2s \+ var\(--life, 0\) \* 4\.6s\) linear infinite;/)
    assert.match(trident, /life: jitter\(index, 4\)/)
    // On Nectar's slab it is the opposite, and deliberately so. Forty-two lamps
    // on forty-two incommensurable clocks, forty-two solids wandering on
    // forty-two more, twelve marks flying twelve links and six expanding rings
    // over the top - every one defensible alone, and the sum was noise. There is
    // one clock up there now, read at a phase taken from where a solid stands,
    // so the floor moves as a wave crossing it rather than as forty-two
    // accidents. `--wave` is the plan diagonal normalised, which in this
    // projection is simply how far down the screen the solid is.
    assert.match(nectar, /const WAVE_LOW = Math\.min\(\.\.\.NODES\.map\(\(node\) => node\.x \+ node\.y\)\)/)
    assert.match(nectar, /node\.wave = Math\.round\(\(\(node\.x \+ node\.y - WAVE_LOW\) \/ WAVE_SPAN\) \* 100\) \/ 100/)
    assert.match(nectar, /'--wave': node\.wave/)
    // Nought and one are a whole period apart, which is the same phase, so the
    // wave wraps round the slab without a seam in it.
    for (const rule of ['.dgm-svg.is-live .dgm-crit', '.dgm-svg.is-live .dgm-crit.is-bound .dgm-node']) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*animation-delay: calc\\(var\\(--wave, 0\\) \\* -[\\d.]+s\\);`))
    }
    // And nothing on that slab keeps a clock of its own any more.
    assert.doesNotMatch(nectar, /const TRAFFIC|const PULSE|dgm-traffic|dgm-pulse|dgm-ring|dgm-resolve/)
    for (const rule of ['.dgm-traffic', '.dgm-pulse', '.dgm-ring', '.dgm-resolve']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
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
    // plant - so the floor swells instead, straight up the screen and back, on
    // one period read at a phase taken from where each solid stands. Inside
    // `planSpace` a translate is in plan units and equal steps on both axes
    // cancel in x, so 3.2 is 2 * ISO_Y * 3.2 = 2.2 screen pixels of rise.
    assert.doesNotMatch(DGM_BLOCK, /dgm-stir[\s\S]{0,120}\.dgm-crit/)
    assert.match(DGM_BLOCK, /@keyframes dgm-tide \{[\s\S]*?50% \{ transform: translate\(3\.2px, 3\.2px\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit \{\s*\n\s*animation: dgm-tide 9\.4s ease-in-out infinite;\s*\n\s*animation-delay: calc\(var\(--wave, 0\) \* -9\.4s\);/)
    // One route, not two. Blocks and drums are one population at two shapes, and
    // giving them separate wander patterns was the drawing insisting on a
    // difference it had already said with the shapes.
    assert.doesNotMatch(DGM_BLOCK, /dgm-shuffle|dgm-shuffleback/)
    assert.doesNotMatch(nectar, /is-drum|is-flick/)
    // An idle connection is still a live connection: a tine with no proposal on
    // it and a channel with no definition crossing it both creep, in the
    // direction the thing would travel if it came.
    assert.match(DGM_BLOCK, /@keyframes dgm-creep \{\s*\n\s*to \{ stroke-dashoffset: -27; \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-tine:not\(\.is-live\),\s*\n\.dgm-svg\.is-live \.dgm-channel \{\s*\n\s*animation: dgm-creep/)
    // Three whole dash periods each, so the pattern lands where it started and
    // the loop has no seam: Trident's tine is period 7 and creeps 21, Nectar's
    // channel is period 9 and creeps 27.
    assert.match(DGM_BLOCK, /\.dgm-tine \{[\s\S]*?stroke-dasharray: 3 4;/)
    // A dash of no length under a round cap is a dot of stroke-width across, and
    // that is what a route between a site and the library is made of. A solid
    // line between two things is a pipe, and a federation is not plumbed
    // together - it is in contact.
    assert.match(DGM_BLOCK, /\.dgm-channel \{[\s\S]*?stroke-dasharray: 0 9;/)
    assert.match(DGM_BLOCK, /\.dgm-channel \{[^}]*stroke-linecap: round;/)
    // On the slab it is a board, not a run of dots. Everything between two
    // districts is a trace, and every trace carries.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-tracerun \{[\s\S]*?animation: dgm-travel/)
    // And every one of these layers stops dead against a reduced-motion
    // preference.
    for (const cls of ['.dgm-stand', '.dgm-field', '.dgm-crit', '.dgm-tine', '.dgm-channel', '.dgm-trace', '.dgm-tracerun', '.dgm-via', '.dgm-district', '.dgm-lift', '.dgm-steady', '.dgm-draw', '.dgm-hand', '.dgm-ledgeraudit']) {
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
    for (const mark of ['.dgm-spark', '.dgm-drop.is-done .dgm-dropflow', '.dgm-lift.is-up .dgm-rise']) {
      const escaped = mark.replace(/[.()*:]/g, (c) => `\\${c}`)
      assert.match(DGM_BLOCK, new RegExp(`${escaped} \\{[^}]*var\\(--run-in`))
    }
    // The two footprint hairlines that used to climb out of the ground as power
    // arrived are gone, and with them the last thing in either figure that was a
    // rule rather than an object. They said "one plan, four heights" - which the
    // four skirts standing over one footprint, and the shade each drops on the
    // deck below, already say in three dimensions. What they did instead was
    // fence the drawing: two verticals down the outside of it, crossing every
    // tier, with the decks cut into them.
    assert.doesNotMatch(trident, /dgm-axis/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-axis[\s,{]/)
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
    // The two stubs that used to run in from a deck's left corner to the
    // mechanism standing on it are gone as well. A drop already lands on that
    // corner and the mechanism is already sitting in the middle of the deck; a
    // second short line drawn between them added no information and read as a
    // scratch across the face of the tile, on the two decks least able to
    // afford one.
    assert.doesNotMatch(trident, /dgm-approach/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-approach[\s,{]/)
    // The stack still stands on a ground plane, so the four decks read as four
    // heights of one plan. The caption that said so in words is gone, and so are
    // the two hairlines that said it in rules: the plane and the four skirts
    // standing over one footprint are the claim.
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
    // The library above Nectar does the same: it drifts, and every criterion it
    // is holding breathes in order across the floor.
    for (const rule of [
      '.dgm-svg.is-live .dgm-plate',
      '.dgm-svg.is-live .dgm-intake',
      '.dgm-svg.is-live .dgm-catch',
      '.dgm-svg.is-live .dgm-throat',
      '.dgm-svg.is-live .dgm-fieldtile:not(.is-named)',
      '.dgm-svg.is-live .dgm-bank:not(.is-clear) .dgm-blade',
      '.dgm-svg.is-live .dgm-ledgerflow',
      '.dgm-svg.is-live .dgm-library',
      '.dgm-svg.is-live .dgm-crit.is-bound .dgm-node',
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
    // re-checks from the first field. The aperture strains against its own seal
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
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-bank:not\(\.is-clear\) \.dgm-blade \{\s*\n\s*animation: dgm-take/)
    // The strain never parts the pair. Shut carries each blade four - now six -
    // plan units past the bore's centre line, so the two overlap by twice that;
    // every attempt in this stylesheet moves each of them out by the same amount
    // and the overlap has to survive the hardest one.
    const shutAt = Number(trident.match(/const LEAF_SHUT = (-?[\d.]+)/)[1])
    assert.equal(shutAt < 0, true, 'the blades do not reach each other when the stop is shut')
    const strains = [...DGM_BLOCK.matchAll(/\(var\(--shut, -?[\d.]+px\) \+ ([\d.]+)px\)/g)].map((m) => Number(m[1]))
    assert.equal(strains.length >= 2, true)
    assert.equal(shutAt + Math.max(...strains) < 0, true, 'the stop parts while it is being tried')
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
    // What leaning on the panel does is make the index it holds easier to read -
    // the bound links strengthen and every bound criterion deepens into its own
    // dark. It used to double the traffic on the mesh instead, which is a
    // reasonable answer for a panel that has traffic on it and this one no
    // longer does.
    assert.match(DGM_BLOCK, /\.dgm-library\.is-hot \.dgm-link\.is-bound \{ stroke: var\(--accent\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-library\.is-hot \.dgm-crit\.is-bound \.dgm-node \{ fill: var\(--ink-deep\); \}/)
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
    // An intake with a catchment and a queue, an aperture in a barrel, and a
    // ledger whose rows are chained.
    for (const part of ['dgm-catch', 'dgm-queue', 'dgm-throat', 'dgm-housing', 'dgm-bank', 'dgm-holerim', 'dgm-blade', 'dgm-ledgerhash', 'dgm-ledgerchain', 'dgm-ledgerseal']) {
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
    // Three mechanisms stood here before this one. A sliding hatch: two leaves
    // split at plan x = 0 and stroked all the way round, which projected to a
    // pair of parallelograms meeting on a diagonal, so the seam came out doubled
    // and notched at both ends - and a hatch covers, where the claim this deck
    // carries is that a run is HELD. Then two bolts drawn across the way
    // through, which was the right claim on the wrong instrument: at reading
    // size two pale bars over a sixty-pixel recess read as stripes. Then a
    // six-blade diaphragm, which sealed honestly, solved its own throws and drew
    // as a pinwheel - six arcs crossing inside a twenty-eight pixel bore is more
    // mechanism than a reader can resolve at the size this deck is printed at.
    assert.doesNotMatch(trident, /dgm-leaf|dgm-bolt|dgm-aperture|tr-hatch|BOLT_REACH|const BLADES = |BLADE_R|BLADE_TURN/)
    for (const rule of ['.dgm-leaf', '.dgm-bolt', '.dgm-aperture', '.dgm-hatch', '.dgm-iris']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
    assert.doesNotMatch(DGM_BLOCK, /@keyframes dgm-(cycle|strain|give|turn)/)
    // Nothing about the stop turns or pivots any more, so nothing carries a
    // spoke or a twist.
    assert.doesNotMatch(DGM_BLOCK, /--spoke|--turn/)

    // Two blades in a barrel. The barrel is a circle because a plan circle
    // carried through this projection is an honest ellipse - the same one the
    // intake deck's throat is drawn as.
    assert.match(trident, /const BARREL = planCyl\(0, 0, SHUT_FRAME, HOUSE_RISE\)/)
    assert.match(trident, /<clipPath id="tr-hole">\s*\n\s*<circle cx="0" cy="0" r=\{SHUT_HOLE\} \/>/)
    assert.match(trident, /<g clipPath="url\(#tr-hole\)">/)
    assert.match(trident, /<circle className=\{`dgm-holerim is-\$\{state\.gate\}`\} cx="0" cy="0" r=\{SHUT_HOLE\}/)
    // Two blades, one to each side, and the clip is what turns a rectangle into
    // a blade: all a reader ever sees of one is the edge it lays across the
    // bore, because the other three run outside the hole.
    assert.match(trident, /const LEAVES = \[-1, 1\]/)
    assert.match(trident, /<rect className="dgm-bladeface" x=\{side < 0 \? -LEAF_HALF : 0\} y=\{-LEAF_HALF\} width=\{LEAF_HALF\} height=\{LEAF_HALF \* 2\} \/>/)
    assert.match(trident, /<rect className="dgm-bladeedge" x=\{side < 0 \? -LEAF_HALF : 0\} y=\{-LEAF_HALF\} width=\{LEAF_HALF\} height=\{LEAF_HALF \* 2\}/)
    assert.match(trident, /'--shut': `\$\{LEAF_SHUT\}px`, '--open': `\$\{LEAF_OPEN\}px`/)

    // SHUT IS A REAL SEAL, AND OPEN IS A REAL OPENING. Re-solved here from the
    // drawing's own numbers, because a throw nudged for looks is exactly the
    // edit that would leave a gap down the middle of a deck whose entire job is
    // being shut - or clear the blades out of a bore that then has nothing in it
    // to say there was ever a mechanism.
    const num = (name) => Number(trident.match(new RegExp(`const ${name} = (-?[\\d.]+)`))[1])
    const bore = num('SHUT_HOLE')
    const half = num('LEAF_HALF')
    const shut = num('LEAF_SHUT')
    const open = num('LEAF_OPEN')
    // Shut, each blade runs -shut past the centre line, so the pair overlap by
    // twice that and the bore is covered edge to edge.
    assert.equal(shut < 0, true, 'the two blades meet exactly on the centre line, so the seam is one line drawn twice')
    assert.equal(half + shut >= bore, true, 'a shut blade does not reach the far side of the bore')
    assert.equal(-2 * shut >= bore * 0.18, true, 'the overlap is too narrow for the pair to read as two blades')
    // Open, each blade parks a sliver of itself inside its own side of the bore
    // - clear enough to read as open, present enough to say there was a blade.
    assert.equal(open < bore, true, 'an opened blade leaves the bore entirely, so nothing says there was one')
    assert.equal(open > bore * 0.6, true, 'the opened stop is too far across the bore to read as open')

    // A blade only ever moves in the one direction a blade can move: out along
    // its own side. Every keyframe that touches one says so, and none of them
    // rotates - a two-leaf shutter has no pivot and drawing one would be the
    // figure borrowing a mechanism it does not have.
    assert.match(DGM_BLOCK, /\.dgm-blade \{\s*\n\s*transform: translateX\(calc\(var\(--side, 1\) \* var\(--shut, -?[\d.]+px\)\)\);/)
    assert.match(DGM_BLOCK, /\.dgm-bank\.is-clear \.dgm-blade \{ transform: translateX\(calc\(var\(--side, 1\) \* var\(--open, [\d.]+px\)\)\); \}/)
    for (const frames of DGM_BLOCK.match(/@keyframes dgm-(latch|load|take)[\s\S]*?\n\}/g) || []) {
      for (const step of frames.match(/transform: [^;]+;/g) || []) {
        assert.match(step, /^transform: translateX\(calc\(var\(--side, 1\) \*/)
      }
    }

    // Two passes, and the second is not decoration. Held, the blades overlap, so
    // drawing each one complete in turn lets the second paint the first one's
    // leading edge out - and the whole point of this mechanism is that a reader
    // can see two of them. Fills first, both edges after.
    assert.match(DGM_BLOCK, /\.dgm-bladeface \{[\s\S]*?stroke: none;/)
    assert.match(DGM_BLOCK, /\.dgm-bladeedge \{\s*\n\s*fill: none;/)
    assert.match(trident, /\{LEAVES\.map\(\(side\) => \([\s\S]{0,400}dgm-bladeface[\s\S]{0,400}\{LEAVES\.map\(\(side\) => \([\s\S]{0,400}dgm-bladeedge/)
    // The two lines across the bore are the mechanism, so they are the heaviest
    // stroke in the assembly - heavier than the rim round the hole and heavier
    // than the barrel they are set in.
    const weight = (rule) => Number(DGM_BLOCK.match(new RegExp(`\\${rule} \\{[^}]*stroke-width: ([\\d.]+)`))[1])
    assert.equal(weight('.dgm-bladeedge') > weight('.dgm-holerim'), true)
    assert.equal(weight('.dgm-bladeedge') > weight('.dgm-housing'), true)

    // Nectar's boundary is the skirt of every site deck, drawn as a wall rather
    // than a hatch, and identically at every site.
    assert.match(nectar, /className="dgm-wall"/)
    assert.match(DGM_BLOCK, /\.dgm-wall \{/)
  })

  it('lays the contract out as a count and leaves its middle clear', () => {
    // The nineteen are real CDISC variables, one domain per row - registration
    // and visit, then dosing, then labs, then adverse events - so the grid the
    // contract walks is a thing somebody at a site would recognise rather than
    // nineteen plausible-looking words.
    for (const name of [
      'STUDYID', 'SITEID', 'USUBJID', 'ARMCD', 'VISITNUM',
      'EXTRT', 'EXDOSE', 'EXDOSU', 'EXROUTE', 'EXSTDTC',
      'LBTESTCD', 'LBORRES', 'LBORRESU', 'LBNRIND', 'LBDTC',
      'AETERM', 'AETOXGR', 'AESER', 'AEACN',
    ]) assert.match(trident, new RegExp(`\\['${name}', '`))

    // AND EVERY ONE OF THEM NAMES WHAT IT IS CHECKED AGAINST.
    //
    // The line under the pill used to read "checked against task contract T-07
    // v3" for all nineteen. That is the identifier of the contract doing the
    // checking, not the thing being checked against - it told a reader nothing
    // they had not already read off the rail, and it told them the same nothing
    // nineteen times over a grid whose whole purpose is that its nineteen cells
    // are different. A field is bound by being matched to a specific authority:
    // a register, a roster, a randomisation list, a lab manual, a dictionary, a
    // grading scale. Nineteen fields, nineteen authorities, no two alike.
    const against = [...trident.matchAll(/\['[A-Z0-9]+', '(against [^']+)'\]/g)].map((match) => match[1])
    assert.equal(against.length, 19)
    assert.equal(new Set(against).size, 19, 'two fields are checked against the same thing')
    assert.doesNotMatch(trident, /\}\ checked against task contract/)
    // The authorities are the ones a study actually holds a field up to, so a
    // reader who works in trials recognises them on sight.
    for (const authority of [/protocol/, /randomisation/, /schedule of assessments/, /lab manual/, /reference range/, /MedDRA/, /CTCAE/]) {
      assert.match(against.join(' | '), authority)
    }
    assert.match(trident, /read: `\$\{cell\.name\} checked \$\{cell\.against\}\.`/)
    assert.match(trident, /read: `\$\{cell\.name\} is not yet checked \$\{cell\.against\}\.`/)
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
    // pipes; the exchange is one channel with signal on it.
    assert.match(nectar, /<path className="dgm-channel" d=\{item\.path\} \/>/)
    // And nothing on that channel is a line. There used to be a solid two-pixel
    // accent arc under all of this - five hundred pixels of unbroken stroke, the
    // heaviest single mark in either figure, drawn in the moment its site
    // published. It made the wrong claim twice: a solid line between two things
    // is a pipe, and three of them converging on a slab is plumbing. What
    // crosses is a packet - three or four dots travelling the whole curve and
    // gone - because a dot is the only mark that can say "something crossed
    // here" without also saying "and the way is still there behind it".
    assert.doesNotMatch(nectar, /dgm-liftpath/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-liftpath[\s,{]/)
    for (const [rule, dots] of [['.dgm-rise', 3], ['.dgm-fall', 4]]) {
      const escaped = rule.replace(/[.()*:]/g, (c) => `\\${c}`)
      const dash = DGM_BLOCK.match(new RegExp(`${escaped} \\{[^}]*stroke-dasharray: ([\\d. ]+);`))[1]
      const parts = dash.trim().split(/\s+/).map(Number)
      // Dashes of no length under a round cap: one dot each, and the pattern has
      // to sum to twice the pathLength so one packet sits on the curve at a time
      // and dgm-travel carries it off the end with nothing left behind.
      assert.deepEqual(parts.filter((v, i) => i % 2 === 0), new Array(dots).fill(0))
      assert.equal(parts.reduce((a, b) => a + b, 0), 200)
    }
    // Both directions are on the same phase table, and a site can be doing both
    // at once - which is the steady state of a federation.
    assert.match(nectar, /up: \['SITE 018', 'SITE 042', 'SITE 103'\], down: \['SITE 042', 'SITE 103'\]/)
    assert.match(nectar, /const down = state\.down\.includes\(item\.key\)/)
    // What never travels is a record. No path in the figure asks for one, none
    // is refused at a wall, and the margin says so as a count rather than as a
    // policy word the two channels overhead would be busy contradicting.
    assert.doesNotMatch(nectar, /RECORD REQUEST|REFUSED|dgm-cross|is-back|BACK_TO|BACK_FROM/i)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-route\.is-back|\.dgm-cross|\.dgm-refused/)
    // Nothing anywhere in either figure is drawn in an alarm colour, and there
    // is nothing left for one to mean. `--danger` had exactly one job - a
    // criterion the library was not holding good - on a floor where colour now
    // carries the KIND of definition rather than a state of it. Two meanings on
    // one channel is one meaning nobody reads, so the state went and the alarm
    // colour went with it. A figure about a system that holds should not have a
    // red in it at all.
    assert.doesNotMatch(DGM_BLOCK, /var\(--danger/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-crit\.is-red[\s,{]/)
    assert.doesNotMatch(nectar, /is-red|lamp:/)
    assert.match(nectar, />0 LEAVE<\/text>/)
    assert.match(nectar, /status: 'STEADY', read: 'Structure crosses\. Records do not\.'/)
    // Every channel leaves a mast standing on the far corner of a site's own
    // roof, and the head on that mast is what swallows the foot of the arc - the
    // site orbits and the library drifts, so an endpoint parked on a silhouette
    // would part from it on the first frame. Both ends of a channel now carry a
    // solid with a crown for exactly that reason. Above, the arc lands on the
    // underside rim and climbs the skirt's own vertical edge to the rim above
    // it, which is a surface the drawing has already committed to.
    assert.match(nectar, /path: `M \$\{x1\} \$\{y1\} \$\{arc\} L \$\{rim\[0\]\} \$\{rim\[1\]\}`/)
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
    // Two things fix it, and each is load-bearing on its own: the terminus moves
    // to the skirt's bottom rim, and the terminal tangent becomes one of the
    // drawing's own plan axes. This test re-solves both from the projection,
    // because pinning them to coordinates would let the next edit to the slab or
    // the sites quietly reintroduce the crossing.
    const num = (name, source = nectar) => Number(source.match(new RegExp(`const ${name} = (-?[\\d.]+)`))[1])
    const LIB_HALF = num('LIB_HALF')
    const LIB_WALL = num('LIB_WALL')
    const MESH_Y = num('MESH_Y')
    const GROUND_Y = num('GROUND_Y')
    const MAST = num('MAST')
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
      // it anyway: nothing on the arc leg may be inside the slab. The climb
      // after it is excluded on purpose - it lies on the skirt's own vertical
      // edge, which is a surface, not the interior.
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
    // Right edge, left edge, front corner: three landings spread across the
    // whole near silhouette rather than three on one side of it.
    assert.deepEqual([...edges].sort(), ['corner', 'left', 'right'])

    // NOTHING IS BUILT WHERE A ROUTE ARRIVES.
    //
    // Three prisms stood here once - the same solid as a criterion at the scale
    // of a port, two lit faces each and a crown that went full accent the moment
    // its site published. They were three of the four brightest objects in the
    // figure and they were parked on the one edge that has to read as an edge.
    // Then a dot, which was better and still an object placed on a boundary to
    // mark something that needs no marking. The route crosses the rim and keeps
    // going; what says where it changed surface is the corner in the run itself.
    assert.doesNotMatch(nectar, /GATE_RISE|GATE_ACROSS|GATE_ALONG|GATE_CORNER|GATE_SEAT|gate\.solid|dgm-gate|LAND_R|dgm-land/)
    for (const rule of ['.dgm-gate', '.dgm-gatecap', '.dgm-land']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
    assert.match(nectar, /gate: \{ \.\.\.gate, at: rim \}/)
    // The front corner is solved rather than read off `LIBRARY.front`:
    // `roundedPlan` samples its arcs in seven steps and never lands on 45
    // degrees, so the sampled corner is four pixels off the true one - and four
    // pixels is the whole composition off centre.
    assert.match(nectar, /const RIM_CORNER = LIB_HALF - 28 \+ 28 \/ Math\.SQRT2/)
    assert.doesNotMatch(nectar, /^[^/\n]*LIBRARY\.front/m)

    // What the rim feeds. A channel stops at the rim, so a run on the board
    // carries the definition the rest of the way in - drawn among the mesh, so
    // every solid taller than it passes in front of it. That is the one move no
    // arc in screen space can make, and it is what puts the last leg on the slab
    // instead of above it.
    //
    // It is a routed trace like every other run up there, ending on a pad of the
    // district that kind of definition belongs to. The old feeder was a straight
    // dotted line from the rim to a node in the middle of the mesh, crossing the
    // floor at a screen angle that matched nothing it crossed.
    assert.match(nectar, /className=\{`dgm-trace is-feed\$\{state\.up\.includes\(item\.key\) \? ' is-up' : ''\}\$\{lit\(item\.key\)\}`\}/)
    assert.match(nectar, /<path className="dgm-tracepath" d=\{item\.feed\} \/>/)
    assert.match(nectar, /const dock = padOn\(into, side\.axis, side\.sign \|\| 1\)/)
    // The channels drift with the slab now. Three pixels of travel at a joint
    // that has nothing to hide it would show as the route parting from the gate;
    // moved to the site end it is swallowed by a mast head built for it.
    assert.match(DGM_BLOCK, /\.dgm-library,\s*\n\.dgm-lift \{ transform: translateY\(var\(--drift, 0px\)\); \}/)
    // And a channel turns a corner now, so every mark that runs one has to
    // round its joins or the default miter throws a spike as a dash spans it.
    assert.match(DGM_BLOCK, /\.dgm-channel \{[^}]*stroke-linejoin: round;/)
    assert.match(DGM_BLOCK, /\.dgm-rise,\s*\n\.dgm-fall \{[^}]*stroke-linejoin: round;/)
  })

  it('shows the network effect as geometry rather than a claim', () => {
    // Three reaches on one ground, growing with coverage until they overlap -
    // and three sizes of reach, because the site that has contributed the most
    // is the one that reaches furthest. Clipped to the ground the three of them
    // stand on, because reach that runs off the edge of the federation is not
    // reach.
    //
    // A plan circle, not a plan square. Squared off - on the argument that a
    // reach should be the same shape as the site standing in it - three of them
    // met along flat edges and locked into one rectilinear field, which is a
    // picture of a merger. Coverage does not have corners: it has a radius.
    assert.match(nectar, /<circle className="dgm-reachrim" cx=\{site\.plan\[0\]\} cy=\{site\.plan\[1\]\} r=\{span\}/)
    assert.match(nectar, /<circle className="dgm-reachfill" cx=\{site\.plan\[0\]\} cy=\{site\.plan\[1\]\} r=\{span\}/)
    assert.match(nectar, /<clipPath id="nc-ground">/)
    assert.match(nectar, /<g clipPath="url\(#nc-ground\)">/)

    // SOLVED AGAINST THE PLAN, NOT CHOSEN - and re-solved here rather than
    // pinned to literals, because the claim is the geometry. Moving a site
    // without regrowing the reach would leave the closing frame asserting an
    // overlap it no longer draws, and a hard-coded pair of coordinates would not
    // have caught it. Two plan circles meet exactly when the distance between
    // their centres is inside the sum of their radii.
    const sites = [...nectar.matchAll(/plan: \[(-?\d+), (-?\d+)\], records: '[\d,]+', half: \d+, wall: \d+, bands: \d+, grew: ([\d.]+)/g)]
      .map((match) => ({ x: Number(match[1]), y: Number(match[2]), grew: Number(match[3]) }))
    const reaches = [...nectar.matchAll(/reach: (\d+)/g)].map((match) => Number(match[1]))
    assert.equal(sites.length, 3)
    assert.equal(reaches.length >= 2, true)
    const apart = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    const pairs = [[0, 1], [0, 2], [1, 2]]
    for (const [a, b] of pairs) {
      const gap = apart(sites[a], sites[b])
      const span = sites[a].grew + sites[b].grew
      assert.equal(span * reaches[0] < gap, true, `sites ${a} and ${b} already touch in the opening figure`)
      assert.equal(span * reaches[reaches.length - 1] > gap, true, `sites ${a} and ${b} never overlap by the closing figure`)
    }

    // AND THE THREE STAY THREE. The old plan was isoceles - the two outliers
    // half again as far from each other as either was from the near one - so the
    // reach had to be grown until the furthest pair met, by which point the two
    // nearer pairs had long since met and gone on swallowing each other. The
    // closing frame drew one blue field with three sites sunk in it.
    //
    // The three are equilateral in plan now, which is what lets one reach number
    // touch all three pairs at once. Screen x depends only on (x - y) and screen
    // y only on (x + y), so left, right and front is still available: with
    // u = x - y and v = x + y, plan distance is sqrt((du^2 + dv^2) / 2), and
    // three points at (-U, v), (U, v) and (0, v + sqrt(3) U) are equilateral.
    const gaps = pairs.map(([a, b]) => apart(sites[a], sites[b]))
    assert.equal(Math.max(...gaps) - Math.min(...gaps) < 1, true, 'the three sites are not equilateral in plan')
    // No pair may be more than a fifth of the way into another by the closing
    // frame. Touching is the claim; swallowing is a different claim.
    for (const [a, b] of pairs) {
      const gap = apart(sites[a], sites[b])
      const reach = (sites[a].grew + sites[b].grew) * reaches[reaches.length - 1]
      assert.equal((reach - gap) / gap < 0.2, true, `sites ${a} and ${b} are more inside each other than beside each other`)
    }
    assert.match(DGM_BLOCK, /\.dgm-reachrim \{[\s\S]*?transition: r var\(--grow\)/)

    // THE LIBRARY IS A BOARD, NOT A HEAP.
    //
    // It was one jittered lattice across the whole slab: forty-two solids in
    // three state colours and two shapes. A reader could see that the library
    // held a lot of things and could not see that it held KINDS of thing, which
    // is the entire difference between a library and a pile.
    //
    // Four districts, each with a quarter of the slab, each in its own ink and
    // built as its own solid - so colour, shape and place all say the same thing
    // and none of them has to be learned from a legend. There is no legend
    // anywhere on this sheet.
    assert.match(nectar, /const DISTRICTS = \[/)
    for (const [key, tone, kind] of [
      ['CRITERIA', 'is-blue', 'block'],
      ['UNITS', 'is-green', 'drum'],
      ['MAPPINGS', 'is-violet', 'bar'],
      ['ENDPOINTS', 'is-amber', 'post'],
    ]) {
      assert.match(nectar, new RegExp(`\\{ key: '${key}',[^}]*tone: '${tone}', kind: '${kind}'`))
      assert.match(DGM_BLOCK, new RegExp(`\\.dgm-crit\\.${tone},\\s*\\n\\.dgm-district\\.${tone} \\{\\s*\\n\\s*--ink:`))
    }
    assert.match(nectar, /const KINDS = \{/)
    assert.equal(new Set([...nectar.matchAll(/^  (block|drum|bar|post): \{ halfX/gm)].map((m) => m[1])).size, 4)
    assert.match(nectar, /className=\{`dgm-crit \$\{node\.tone\}/)
    assert.match(nectar, /className=\{`dgm-district \$\{district\.tone\}`\}/)
    // A district letters itself on the board, which is where the three floating
    // tickets went: CRITERION, UNIT and MAP were pills parked in mid-air naming
    // payloads a reader had no way to place. The same words are places now.
    assert.match(nectar, /className="dgm-district-name"/)
    assert.doesNotMatch(nectar, /label: '|className=[^>]{0,40}dgm-(ticket|carry|tagbody)/)
    for (const rule of ['.dgm-ticket', '.dgm-carry', '.dgm-liftchip']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }

    // A DISTRICT IS AN INDEX AND A BUS IS NOT.
    //
    // Inside a district the ties are dense and short, so they stay a mesh. What
    // crosses between two kinds of definition is few, long and deliberate, so it
    // is routed: a bus round the four districts, four taps into a junction at
    // the middle of the slab, and a run in from the rim for each site.
    assert.match(nectar, /if \(NODES\[a\]\.band !== NODES\[b\]\.band\) continue/)
    assert.match(nectar, /const SIDES = \[/)
    assert.match(nectar, /const SPURS = SIDES\.map/)
    assert.match(nectar, /const TRACES = \[\.\.\.SIDES, \.\.\.SPURS\]/)
    assert.match(nectar, /className="dgm-junction"/)
    assert.match(nectar, /className="dgm-via"/)

    // EVERY RUN LIES ON A PLAN AXIS, AND THAT IS GEOMETRY RATHER THAN STYLING.
    //
    // Plan +x lands as screen down-right and plan +y as screen down-left, which
    // are the two directions every skirt, every wall marking and every deck edge
    // in both figures already runs at - so a run on either of them is
    // unmistakably lying on the slab. The plan diagonals are the trap: plan
    // (1, 1) projects to straight down the screen, and a vertical line in an
    // axonometric is what a riser looks like. A first cut used forty-five degree
    // chamfers the way a real board does, and every chamfer came out as a short
    // vertical post standing on the library.
    assert.match(nectar, /function run\(from, to, first\) \{/)
    assert.match(nectar, /const corner = first === 'x' \? \[to\[0\], from\[1\]\] : \[from\[0\], to\[1\]\]/)
    // Re-solved: every leg of every run this file can build keeps one of its two
    // plan coordinates fixed. A leg that changes both is a diagonal, and a
    // diagonal is either a vertical or a horizontal on screen.
    for (const d of [...nectar.matchAll(/`M \$\{from\[0\]\} \$\{from\[1\]\} L \$\{([^}]+)\}/g)]) {
      assert.ok(d[1].startsWith('corner[0]') || d[1].startsWith('to[0]'), 'a run leaves on something other than a plan axis')
    }
    // A run with no corner at all - two points sharing a plan coordinate - is
    // drawn as one leg rather than as a degenerate two.
    assert.match(nectar, /if \(from\[0\] === to\[0\] \|\| from\[1\] === to\[1\]\) \{/)

    // And the criteria still light up as coverage compounds, and still stand up
    // when the library binds them.
    assert.match(nectar, /className=\{`dgm-crit \$\{node\.tone\}\$\{bound \? ' is-bound' : ''\}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-breathe \{[\s\S]*?50% \{ fill-opacity: 0\.42; \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit\.is-bound \.dgm-node \{\s*\n\s*animation: dgm-breathe 5\.6s ease-in-out infinite;\s*\n\s*animation-delay: calc\(var\(--wave, 0\) \* -5\.6s\);/)
    assert.doesNotMatch(DGM_BLOCK, /dgm-lamp|dgm-lampflick/)
    // A lamp never goes fully out. One at 0.42 is a definition the library is
    // still holding, dimmer; the 0.2 it used to reach was one that had gone off,
    // which is a state this floor no longer has and never needed twice.
    const dim = Number(DGM_BLOCK.match(/@keyframes dgm-breathe \{[\s\S]*?50% \{ fill-opacity: ([\d.]+); \}/)[1])
    const off = Number(DGM_BLOCK.match(/\.dgm-node \{[\s\S]*?fill-opacity: ([\d.]+);/)[1])
    assert.equal(dim > off * 1.5, true, 'a breathing lamp dips as far as an unbound one, so the two states collide')
    // Nothing on this floor may interpolate a colour. A keyframe mixing two
    // color-mix() values gets re-snapshotted by the compositor whenever a class
    // change forces a style recalc mid-animation, and what came back was a
    // highlighter green present nowhere in the token set. Only scalars move.
    for (const frames of DGM_BLOCK.match(/@keyframes dgm-(breathe|tide|pass|passbound|passhard)[\s\S]*?\n\}/g) || []) {
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

  it('keeps the whole Trident stack in one ink and deepens it as the run descends', () => {
    // FOUR HUES BECAME FOUR DEPTHS OF ONE.
    //
    // The four decks used to carry four colours - violet for the machine tier,
    // blue for the contract, amber for the one holding and green for the one
    // that had committed - on the theory that the deck owning a state should own
    // a colour. The theory is sound and the drawing it produced was not: four
    // saturated hues stacked over one plan is four unrelated objects, and the two
    // warm ones sat forward of the two cool ones, so the middle of the figure
    // bowed out of the page. A governed stack that reads as four things bolted
    // together argues against its own claim, which is that this is one
    // instrument.
    //
    // One ink at four depths says more, because it says the four are ordered:
    // authority accumulates on the way down, and the deck at the bottom is the
    // darkest thing in the drawing because it is the only one nothing can be
    // taken back out of.
    const tiers = ['is-surface', 'is-contract', 'is-authority', 'is-receipt']
    const rule = (tier) => DGM_BLOCK.match(new RegExp(`\\.dgm-slide\\.${tier} \\{[^}]*\\}`))[0]
    for (const tier of tiers) {
      const body = rule(tier)
      // Every tier is a blue: the house accent, or the house accent carried
      // toward the neutral or toward the ink. Nothing reaches for a hue of its
      // own.
      assert.match(body, /--ink: (var\(--accent\)|color-mix\(in srgb, var\(--accent(-strong)?\) \d\d%, var\(--(muted|text)\)\));/)
      assert.doesNotMatch(body, /--governed|--warning|--success|--danger/)
    }
    // And the wash opens monotonically down the stack, which is what makes four
    // blues read as four rather than as one blue a reader has to measure.
    const washes = tiers.map((tier) => Number(rule(tier).match(/--wash: (\d+)%/)[1]))
    assert.deepEqual(washes, [...washes].sort((a, b) => a - b))
    assert.equal(new Set(washes).size, 4)
    assert.equal(washes[3] - washes[0] >= 18, true, 'the four tiers are too close in weight to be told apart')

    // Blue is the figure default too, which is what the contract deck takes
    // undiluted and what Nectar wants everywhere - its three sites are peers,
    // and colouring one would say one of them mattered more.
    assert.match(DGM_BLOCK, /\.dgm-svg \{[\s\S]*?--ink: var\(--accent\);\s*\n\s*--ink-deep: var\(--accent-strong\);/)
    assert.match(rule('is-contract'), /--ink: var\(--accent\);/)
    assert.doesNotMatch(nectar, /dgm-slide/)

    // The descent is the claim: a drop belongs to the deck it lands on and takes
    // that deck's ink, so the run visibly gets heavier three times on its way
    // down. A held run stops changing colour and starts pulling - it used to go
    // amber, which was the one place a state in this figure reached past the tier
    // that owns it for a hue of its own.
    assert.match(DGM_BLOCK, /\.dgm-drop\.is-latest \.dgm-droppath \{ stroke: var\(--ink\);/)
    assert.match(DGM_BLOCK, /\.dgm-dropflow \{[\s\S]*?stroke: var\(--ink-deep\);/)
    assert.match(DGM_BLOCK, /\.dgm-rail\.is-live \.dgm-railnode \{ fill: var\(--ink\); \}/)
    for (const held of [
      '.dgm-svg.is-hold .dgm-drop.is-latest .dgm-droppath',
      '.dgm-svg.is-hold .dgm-drop.is-latest .dgm-dropnode',
      '.dgm-svg.is-hold .dgm-bank:not(.is-clear) .dgm-bladeedge',
    ]) {
      const escaped = held.replace(/[.()*:]/g, (c) => `\\${c}`)
      const body = DGM_BLOCK.match(new RegExp(`${escaped} \\{[^}]*\\}`))[0]
      assert.doesNotMatch(body, /--warning|--danger/)
      assert.match(body, /var\(--ink(-deep)?\)/)
    }
    // And no tier-local part reaches past its own ink to the raw house accent.
    for (const part of ['.dgm-fieldtile.is-named', '.dgm-tine.is-live', '.dgm-pad.is-live']) {
      const escaped = part.replace(/[.()*:]/g, (c) => `\\${c}`)
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
    ]) assert.match(trident, call)
    // The approval deck's barrel is the one solid in either figure built on a
    // circle rather than a square, and it is `planCyl` doing it - the same
    // extrusion solved the same way, so a barrel is the same material as a deck.
    assert.match(trident, /const BARREL = planCyl\(0, 0, SHUT_FRAME, HOUSE_RISE\)/)
    // A raised cap moves by the plan step its own sides were built with, so a
    // roof can never land somewhere its walls do not reach.
    assert.match(DGM_BLOCK, /\.dgm-fieldtile\.is-bound \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgercap \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-riser\.is-up \{ opacity: [\d.]+; \}/)
    // And the two holes in the stack are holes: clipped to their own opening, so
    // what is drawn is exactly what can be seen down them - far wall, then floor.
    assert.match(trident, /<clipPath id="tr-well">/)
    assert.match(trident, /<circle className="dgm-shaft" cx="0" cy="0" r="14" \/>/)
    assert.match(trident, /<circle className="dgm-shaft is-bore" cx="0" cy="0" r=\{SHUT_HOLE\} \/>/)
    // Both shafts are cut in the ink of the deck they are cut through, not in a
    // neutral grey. A hole in a blue slab is blue inside; a grey one is a hole in
    // something else, borrowed.
    //
    // The approval bore runs both tones darker than the intake throat's. The
    // throat is a mouth taking things in and a lit floor is the right bottom for
    // one; the bore is a way through that is normally shut, and the only way an
    // open stop reads as open is if a reader can see it is a hole.
    const tone = (rule) => Number(DGM_BLOCK.match(new RegExp(`\\${rule} \\{[^}]*var\\(--ink-deep\\) (\\d+)%`))[1])
    assert.equal(tone('.dgm-shaft.is-bore') > tone('.dgm-shaft'), true)
    assert.equal(tone('.dgm-shaftfloor.is-bore') > tone('.dgm-shaftfloor'), true)
    // And the two blades over it are lighter than either, so shut reads as
    // covered and open as through - which is the whole state this deck carries,
    // at the size a deck this far down the sheet is actually printed.
    const blade = Number(DGM_BLOCK.match(/\.dgm-bladeface \{[^}]*var\(--ink\) (\d+)%/)[1])
    assert.equal(blade < tone('.dgm-shaftfloor.is-bore'), true)
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
    assert.match(nectar, /const depth = shape\.low \+ Math\.round\(\(DEGREE\[node\.index\] \/ BUSIEST\) \* shape\.span\)/)
    assert.doesNotMatch(nectar, /dgm-stem|const RISE = 8|CRIT_HALF|CRIT_SPAN/)
    // Four kinds of solid on one floor, and they are one object at four shapes:
    // same construction, same storey, the same extrusion solved the same way, so
    // a block, a drum, a bar and a post read as machinery rather than as four
    // chart symbols. How high one actually stands is still its own degree in its
    // district's index, so the tall ones are the hubs.
    assert.match(nectar, /node\.round = node\.kind === 'drum'/)
    assert.match(nectar, /node\.block = node\.round\s*\n\s*\? planCyl\(node\.x, node\.y, shape\.halfX, depth\)\s*\n\s*: planPrism\(node\.x, node\.y, shape\.halfX, shape\.halfY, depth, shape\.radius\)/)
    assert.match(iso, /export function planCyl\(cx, cy, r, depth\) \{/)
    // A drum's silhouette runs through the two points where its plan circle is
    // tangent to the extrusion direction. The solid goes up by equal negative
    // steps on both plan axes, so that direction is the (1, 1) diagonal and the
    // tangents sit at +/- r / sqrt(2) along (1, -1).
    assert.match(iso, /const t = round\(r \/ Math\.SQRT2\)/)
    // Drawn back to front, so one standing in front of another occludes it. The
    // sort is on the plan diagonal rather than on screen y, which is the same
    // order - screen y depends on (x + y) and nothing else - stated in the
    // coordinates the floor is actually built in.
    assert.match(nectar, /const FLOOR = \[\.\.\.NODES\]\.sort\(\(a, b\) => \(a\.x \+ a\.y\) - \(b\.x \+ b\.y\)\)/)
    assert.match(nectar, /<path className="dgm-face-left" d=\{node\.block\.faceLeft\} \/>/)
    assert.match(nectar, /<polygon className="dgm-node" points=\{node\.block\.base\} \/>/)
    assert.match(nectar, /<path className="dgm-face-right" d=\{node\.block\.wall\} \/>/)
    assert.match(nectar, /<circle className="dgm-node" cx=\{node\.block\.base\.cx\} cy=\{node\.block\.base\.cy\} r=\{node\.block\.r\} \/>/)
    // The cap rises by the plan step its own sides were built with, so a roof
    // can never land somewhere its walls do not reach.
    assert.match(nectar, /'--lift': `\$\{node\.block\.step\}px`/)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-bound \.dgm-node \{ transform: translate\(calc\(var\(--lift, 0px\) \* -1\), calc\(var\(--lift, 0px\) \* -1\)\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-bound \.dgm-face-left,\s*\n\.dgm-crit\.is-bound \.dgm-face-right \{ opacity: 1; \}/)
    // A DEFINITION ARRIVING LEAVES NOTHING BEHIND TO MARK IT.
    //
    // Two expanding rings used to go out of the criterion it landed on, and four
    // more went out of criteria the library already held - six circles growing
    // to three times their radius and fading, at all times, over a slab three
    // hundred pixels across. A growing radius claims something is propagating
    // outwards at a uniform rate in every direction, and the lattice it was
    // supposed to propagate through is drawn right underneath it: the ring
    // crossed links, criteria and empty slab at the same speed, touching none of
    // them, because a circle is radial and a mesh is not. Then one ring, riding
    // the roof of the criterion that had just bound, which was the last of the
    // endpoint furniture - a mark drawn on top of a solid to say "this is the
    // one", over a floor where the one is already the thing that has just stood
    // up in a lettered district.
    assert.doesNotMatch(nectar, /joinUp|--rise|dgm-liftchip/)
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
    for (const rule of ['.dgm-deck.is-hot .dgm-intake', '.dgm-lift.is-hot .dgm-rise', '.dgm-lift.is-hot .dgm-fall']) {
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
    for (const rule of ['.dgm-channel', '.dgm-reachrim', '.dgm-sweep', '.dgm-queue']) {
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
    assert.match(DGM_BLOCK, /\.dgm-channel \{[\s\S]*?opacity: clamp\(0, calc\(\(var\(--spread, 1\) - 0\.5\) \* 2\.6\), 1\);/)
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
    for (const name of ['dgm-droppath', 'dgm-blade', 'dgm-spark', 'dgm-crit', 'dgm-reachrim', 'dgm-sweep']) {
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

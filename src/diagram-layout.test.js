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
const courier = await readSource(new URL('./diagrams/Courier.jsx', import.meta.url))
const floor = await readSource(new URL('./diagrams/ChainSchematic.jsx', import.meta.url))
const field = await readSource(new URL('./diagrams/usePointerField.js', import.meta.url))

const sources = [driver, pan, iso, solid, trident, nectar, floor, field]
// The two figures built over one square plan and one 620x700 sheet. The floor
// is deliberately neither, so it is held to the language in its own suite below
// rather than to this pair's geometry.
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

  it('keeps the top faces flat and springs the motion in all three figures', () => {
    // NO SHEEN ANYWHERE. A gradient was laid over every large top face on the
    // theory that a real panel catches more light along the edge nearest the
    // source. The theory is sound and the drawing it produced was not: on a
    // Trident deck or a Nectar slab it sat on the surface as a FILM the
    // mechanism then had to be read through, and on the chain's plates it read
    // as the paper fading out rather than as light on it. A top face here is a
    // flat near-white fill and that is the whole of it.
    assert.doesNotMatch(solid, /Sheen|sheen/)
    assert.doesNotMatch(css, /sheen/)
    for (const figure of [trident, nectar, floor]) assert.doesNotMatch(figure, /Sheen|sheen/)
    assert.match(css, /\.dgm-face-top \{\s*fill: color-mix\(in srgb, var\(--ink\) 8%, var\(--surface-solid\)\);/)

    // ONE SPRING FOR ALL THREE. Everything decelerated into place on a curve
    // that never passes its target, which is the motion of a thing being
    // POSITIONED rather than of a thing being let go.
    assert.match(css, /--dgm-spring: linear\(0, [\s\S]*?1\.001 100%\);/)
    assert.match(css, /\.dgm-deck \{[\s\S]*?transition-timing-function: var\(--dgm-spring\), ease;/)
    assert.match(css, /transition: --spread 1150ms cubic-bezier[\s\S]*?transition-timing-function: var\(--dgm-spring\),/)
    // Only what MOVES gets it: a fill that overshoots is a fill that is briefly
    // the wrong colour, so colour and opacity still ease.
    const spring = css.match(/transition-timing-function: [^;]*var\(--dgm-spring\)[^;]*;/g)
    assert.ok(spring.length >= 3, 'the spring is used where things move')
    for (const rule of spring) assert.doesNotMatch(rule, /^transition-timing-function: var\(--dgm-spring\), var/)
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
    // The rows sit under the lid that seals them, so a stack fills the site it
    // is in and no record is drawn outside the thing holding it shut - and a
    // record is a CELL now, a run of them per row, each with its nucleus,
    // because what a site holds is patients.
    assert.match(nectar, /const lid = site\.half - 7/)
    assert.match(nectar, /rows\.push\(\{ y, half, cells \}\)/)
    assert.match(nectar, /Math\.max\(2, Math\.floor\(\(half \* 2\) \/ 13\)\)/)
    // The badge that sat on the roof of every site - a circle with a little
    // glyph inside it - is gone from the figure and from the sheet. (`dgm-port`
    // used to be banned here as a prefix, which stopped meaning the badge the
    // moment the slab grew real ports; the badge itself is what this holds.)
    assert.doesNotMatch(nectar, /dgm-glyph|dgm-badge|const GLYPHS/)
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
      '.dgm-svg.is-live .dgm-bank:not(.is-clear) .dgm-bladeedge',
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
    // that is what a route between a site and the intelligence is made of. A solid
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
    assert.match(css, /\.section-field \{[\s\S]*?radial-gradient\(circle at center, color-mix\(in srgb, var\(--accent\)/)
    assert.match(css, /\.trident-section \{[\s\S]*?position: relative;/)
    assert.match(css, /\.nectar-section \{[\s\S]*?position: relative;/)
    // One continuous field across the pair: it fades only at the outer edges.
    assert.match(css, /\.trident-section \.section-field \{[\s\S]*?mask-image: linear-gradient\(to bottom, transparent/)
    assert.match(css, /\.nectar-section \.section-field \{[\s\S]*?var\(--text\) 83%, transparent\)/)
    assert.match(app, /<div className="section-field" ref=\{field\} aria-hidden="true" \/>/)
    // And it moves with the same scroll value the figures use.
    assert.match(css, /\.section-field \{[\s\S]*?center calc\(var\(--spread, 1\)/)
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
    assert.match(trident, /gate: 'closed', receipt: false, tone: 'hold', status: 'HELD'/)
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
    assert.match(nectar, /intel: \{ tone: '\w+', pill: '[A-Z ]+', read: '/)
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
    // The intelligence above Nectar does the same: it drifts, and every criterion it
    // is holding breathes in order across the floor.
    for (const rule of [
      '.dgm-svg.is-live .dgm-plate',
      '.dgm-svg.is-live .dgm-intake',
      '.dgm-svg.is-live .dgm-catch',
      '.dgm-svg.is-live .dgm-throat',
      '.dgm-svg.is-live .dgm-fieldtile:not(.is-named)',
      '.dgm-svg.is-live .dgm-bank:not(.is-clear) .dgm-bladeedge',
      '.dgm-svg.is-live .dgm-ledgerflow',
      '.dgm-svg.is-live .dgm-intel',
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
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-bank:not\(\.is-clear\) \.dgm-bladeedge \{\s*\n\s*animation: dgm-take/)
    // The strain never moves the pair, because it cannot: closed is the centre
    // line and past it is through the other blade. It used to travel each blade
    // a hair further in, which was only ever safe while they overlapped. The
    // seam takes the load instead - it is scaled off the state's own resting
    // weight, so trying a held gate deepens a seam that is already deeper - and
    // nothing in this stylesheet adds a throw to `--shut` any more.
    assert.equal(Number(trident.match(/const LEAF_SHUT = (-?[\d.]+)/)[1]), 0)
    assert.doesNotMatch(DGM_BLOCK, /var\(--shut,[^)]*\) \+ [\d.]+px/)
    const strains = [...DGM_BLOCK.matchAll(/stroke-width: calc\(var\(--seam\) \* ([\d.]+)\)/g)].map((m) => Number(m[1]))
    assert.equal(strains.length >= 2, true)
    assert.equal(Math.min(...strains) > 1, true, 'a load has to deepen the seam, not lighten it')
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
    // intelligence takes a pointer as one panel over a target the size of the plane.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-site\.is-hot \.dgm-sweep/)
    assert.match(nectar, /className=\{`dgm-intel\$\{lit\('intel'\)\}`\} \{\.\.\.probe\('intel'\)\}/)
    assert.match(nectar, /<rect className="dgm-hit" x="-160" y="-160" width="320" height="320" rx="28" \/>/)
    // What leaning on the panel does is make the index it holds easier to read -
    // the bound links strengthen and every bound criterion deepens into its own
    // dark. It used to double the traffic on the mesh instead, which is a
    // reasonable answer for a panel that has traffic on it and this one no
    // longer does.
    assert.match(DGM_BLOCK, /\.dgm-intel\.is-hot \.dgm-link\.is-bound \{ stroke: var\(--accent\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-intel\.is-hot \.dgm-crit\.is-bound \.dgm-node \{ fill: var\(--ink-deep\); \}/)
    // Nothing on a rising arc is a target: its tag crosses the intelligence's own
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
    // figure and it measured out as overlapping the ring beside it.
    assert.doesNotMatch(trident, /const SIGNATURE|dgm-sigplate|dgm-sigstroke|dgm-sigrule|dgm-seal|RECEIPT SEALED/)
    // AND THE APPROVAL RAIL NAMES THE DECK RATHER THAN REPORTING IT. It used to
    // carry SIGNED A. VOSS 09:41Z once the site had signed and CLOSED - NEEDS A
    // SIGNATURE until then, which made it the one line on this rail that changed
    // its subject as the run went: the other three say what can propose, which
    // contract and which revision, and that one said which moment. The moment is
    // already drawn, by the largest mechanism in the figure, and a caption
    // reporting what two blades have plainly just done is the drawing reading
    // itself aloud.
    assert.match(trident, /authority: 'OPENS ON A SITE SIGNATURE',/)
    assert.doesNotMatch(trident, /authority: open \?/)
    assert.doesNotMatch(trident, /'SIGNED A\. VOSS/)
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

    // CLOSED IS A REAL SEAL, AND OPEN IS A REAL OPENING. Re-solved here from the
    // drawing's own numbers, because a throw nudged for looks is exactly the
    // edit that would leave a gap down the middle of a deck whose entire job is
    // being closed - or clear the blades out of a bore that then has nothing in
    // it to say there was ever a mechanism.
    const num = (name) => Number(trident.match(new RegExp(`const ${name} = (-?[\\d.]+)`))[1])
    const bore = num('SHUT_HOLE')
    const half = num('LEAF_HALF')
    const shut = num('LEAF_SHUT')
    const open = num('LEAF_OPEN')
    // Closed, each blade stops ON the centre line, so the two leading edges land
    // on the same line and the pair meets there. Not past it: an overlap is two
    // blades that have gone through each other, which is what the drawing said
    // for as long as this was negative, and it read as a band rather than a
    // meeting.
    assert.equal(shut, 0, 'a closed blade stops on the centre line - it does not cross the other one')
    assert.equal(half + shut >= bore, true, 'a closed blade does not reach the far side of the bore')
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
    // And OPENING IS THE ONLY THING THAT MOVES ONE. `dgm-latch` is the whole of
    // it; every other keyframe that touches the assembly touches a stroke width.
    // A load used to travel the blades a hair further in, which worked only
    // while they had overlap to spend - and past the centre line is through the
    // other blade, so the drawing would be showing the pair crossing every time
    // something tried the gate. What takes the load now is the seam and the
    // frame, which is where a load is taken.
    for (const frames of DGM_BLOCK.match(/@keyframes dgm-(latch|seam|take|brace|shutload)[\s\S]*?\n\}/g) || []) {
      for (const step of frames.match(/transform: [^;]+;/g) || []) {
        assert.match(step, /^transform: translateX\(calc\(var\(--side, 1\) \*/)
      }
    }
    assert.doesNotMatch(DGM_BLOCK, /@keyframes dgm-load/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-bank:not\(\.is-clear\) \.dgm-bladeedge \{ animation: dgm-seam/)

    // One pass, face and edge together. Two were needed only while the blades
    // overlapped and the one on top could paint the other's leading edge out.
    assert.match(DGM_BLOCK, /\.dgm-bladeface \{[\s\S]*?stroke: none;/)
    assert.match(DGM_BLOCK, /\.dgm-bladeedge \{\s*\n\s*fill: none;/)
    assert.match(trident, /\{LEAVES\.map\(\(side\) => \([\s\S]{0,200}dgm-bladeface[\s\S]{0,200}dgm-bladeedge[\s\S]{0,200}\n\s*<\/g>\n\s*\)\)\}/)
    // The two lines across the bore are the mechanism, so they are the heaviest
    // stroke in the assembly - heavier than the rim round the hole and heavier
    // than the barrel they are set in.
    // Scans every rule body that ends in the class and takes the first that
    // actually states a width, so an animation-only rule earlier in the sheet
    // cannot answer for the part. `.dgm-bladeedge` states its own in `--seam`,
    // because a state has to be able to set the resting weight the keyframes
    // scale.
    const weight = (rule) => {
      for (const body of DGM_BLOCK.match(new RegExp(`\\${rule} \\{[^}]*\\}`, 'g')) || []) {
        const width = body.match(/stroke-width: ([\d.]+)/) || body.match(/--seam: ([\d.]+)/)
        if (width) return Number(width[1])
      }
      throw new Error(`no stroke width for ${rule}`)
    }
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
    // structure comes back down, because intelligence nobody can take anything out
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
    // policy word the two channels overhead would be busy contradicting. The
    // captions say it once - see 'leaves the claim readable in the resting
    // state' - and spend the rest of the run on what the federation can do.
    assert.doesNotMatch(nectar, /RECORD REQUEST|REFUSED|dgm-cross|is-back|BACK_TO|BACK_FROM/i)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-route\.is-back|\.dgm-cross|\.dgm-refused/)
    // Nothing anywhere in either figure is drawn in an alarm colour, and there
    // is nothing left for one to mean. `--danger` had exactly one job - a
    // criterion the intelligence was not holding good - on a floor where colour now
    // carries the KIND of definition rather than a state of it. Two meanings on
    // one channel is one meaning nobody reads, so the state went and the alarm
    // colour went with it. A figure about a system that holds should not have a
    // red in it at all.
    assert.doesNotMatch(DGM_BLOCK, /var\(--danger/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-crit\.is-red[\s,{]/)
    assert.doesNotMatch(nectar, /is-red|lamp:/)
    // AND IT IS NOT SAID IN THE MARGIN EITHER. Each site used to carry a
    // two-line strip out to the side of the sheet on a leader - "890 RECORDS"
    // over "0 LEAVE", and EGRESS NONE before that - which is the drawing arguing
    // in the margin about something it already does in the middle: the records
    // sit under a sealed lid inside every wall and not one of the three routes
    // overhead carries anything but a definition. A count printed beside a figure
    // that shows a thing is a figure that does not trust itself. The whole strip
    // went, and its leader and its hit area with it; the probe was always on the
    // solid, so a site still answers a pointer.
    assert.doesNotMatch(nectar, />0 LEAVE<\/text>|\{site\.records\} RECORDS|dgm-ident/)
    assert.doesNotMatch(nectar, /^function Ident\(/m)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-ident[\s,{.]|\.dgm-sidefact\.is-quiet/)
    // `records` stays in the data. It is not printed anywhere - it is the reason
    // the three sites are three different sizes, and the plan half, the wall
    // height, the band count and the reach all follow it.
    assert.match(nectar, /records: '1,204', half: 55/)
    assert.doesNotMatch(nectar, /\{site\.records\}/)
    // Trident's rail still uses the same class, so the class stays.
    assert.match(trident, /className="dgm-sidefact"/)
    // ONE CAPTION CARRIES THE RECORD CLAIM, AND THE OTHER FOUR CARRY CAPABILITY.
    // Every phase used to restate that no record moves - no values in it, no
    // patient in a mapping, nothing has moved - which is four fifths of the
    // reader's attention spent on what the figure is NOT doing. It is said once,
    // in the phase that rests, and the rest of the run says what the federation
    // can now do that it could not before.
    const reads = [...nectar.matchAll(/status: '[A-Z]+', read: [`']([^`']*)/g)].map((m) => m[1])
    assert.equal(reads.length >= 5, true)
    const denials = reads.filter((read) => /records? (do not|never|no values|nothing has moved)|no values in it|no patient/i.test(read))
    assert.equal(denials.length, 1, 'the record claim is made once, in the phase that rests, not in every one')
    assert.match(reads[reads.length - 1], /Structure crosses; records never do\./)
    // Every channel leaves a mast standing on the far corner of a site's own
    // roof, and the head on that mast is what swallows the foot of the arc - the
    // site orbits and the intelligence drifts, so an endpoint parked on a silhouette
    // would part from it on the first frame. Above, there is no join to protect
    // at all: the arc runs to a port well inside the plan and the slab is
    // painted over the last of it, so the one `d` is the mast head and the curve
    // and nothing else. It used to carry a third segment climbing the skirt.
    assert.match(nectar, /path: `M \$\{x1\} \$\{y1\} \$\{arc\}`/)
    assert.match(nectar, /const foot = item\.site\.solid\.back/)
    assert.match(nectar, /const \[x1, y1\] = \[foot\[0\], r1\(foot\[1\] - MAST\)\]/)
    assert.match(nectar, /<circle className="dgm-masthead" cx=\{chan\.head\[0\]\} cy=\{chan\.head\[1\]\} r=\{MAST_HEAD\} \/>/)
  })

  it('brings every channel up through a hole in the slab instead of onto its edge', () => {
    // A curve that ends on the slab's top face has to cross the near skirt to
    // get there, and in an axonometric the band just outside a near edge is the
    // same band the near face occupies - so the eye resolves the ambiguity as
    // "in front of everything" and the whole run reads as a wire laid over a
    // photograph. The first arcs did exactly that. The repair after them was to
    // stop dead on the underside rim, climb the skirt, and hand off to a trace
    // that set out from the boundary - three marks pretending to be one, all of
    // them balanced on the one line in the figure that has to read as an edge.
    //
    // A board does not do that. It takes a signal from the other side of itself
    // through a hole. So the route now ends at a port cut through the slab, the
    // stretch of it that is inside the plan is genuinely inside the plan, and
    // what stops that being drawn across the skirt is the slab being painted
    // over it afterwards.
    //
    // All of it is re-solved here from the projection rather than pinned to
    // coordinates, because pinning would let the next edit to the slab, the
    // districts or the sites quietly put a run back on the boundary.
    const num = (name, source = nectar) => Number(source.match(new RegExp(`const ${name} = (-?[\\d.]+)`))[1])
    const INTEL_HALF = num('INTEL_HALF')
    const INTEL_WALL = num('INTEL_WALL')
    const MESH_Y = num('MESH_Y')
    const GROUND_Y = num('GROUND_Y')
    const MAST = num('MAST')
    const GATE_REACH = num('GATE_REACH')
    const PORT_IN = num('PORT_IN')
    const PORT_CORNER = num('PORT_CORNER')
    const GROUND_OUT = num('GROUND_OUT')
    const DOCK_GAP = num('DOCK_GAP')
    const mesh = ISO.project(310, MESH_Y)
    const ground = ISO.project(310, GROUND_Y)

    // The slab's exact silhouette: its plan ring projected, then the same ring
    // dropped by one wall. Not two half-planes - the plan corners are rounded,
    // so the front corner sits a good five pixels inboard of where the two flat
    // edges would meet, and a half-plane test would call that region safe.
    const ring = ISO.roundedPlan(INTEL_HALF, 28).map(([x, y]) => mesh(x, y))
    // `j = i, i += 1`, not `j = i += 1`. The second is what this crossing test
    // was written with, and it assigns j the NEW i - so every edge it tested ran
    // from a point to itself, no ray ever crossed anything, and the containment
    // check this whole test is built on returned false for every point in the
    // plane including the middle of the slab. It has been vacuous since it was
    // written. It is not now, which is why it has something to say about the
    // arcs going under the slab rather than only about their staying off it.
    const within = (poly, [px, py]) => {
      let hit = false
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
        const [xi, yi] = poly[i]
        const [xj, yj] = poly[j]
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit
      }
      return hit
    }
    // Two shapes, because two different questions get asked of them. The top
    // face alone is what a port has to be inside - a port is cut in the roof, not
    // in the wall. The whole silhouette, roof and both skirts, is what a control
    // point has to stay out of.
    const onTop = (point) => within(ring, point)
    const skirt = ring.map(([x, y]) => [x, y + INTEL_WALL])
    const inside = (point) => onTop(point) || within(skirt, point)

    // How far a plan point is from the slab's own boundary, and what that is
    // worth on screen. The two are not the same number and the difference is the
    // whole reason the front corner is a special case: a plan unit spent going
    // inboard from a flat face is worth 0.93 of a pixel, and one spent going
    // inboard along the diagonal is worth 0.48.
    const rimGap = ([x, y]) => {
      const c = INTEL_HALF - 28
      const ax = Math.abs(x)
      const ay = Math.abs(y)
      return ax > c && ay > c ? 28 - Math.hypot(ax - c, ay - c) : INTEL_HALF - Math.max(ax, ay)
    }
    const rimGapPx = (point) => {
      const c = INTEL_HALF - 28
      const ax = Math.abs(point[0])
      const ay = Math.abs(point[1])
      let normal
      if (ax > c && ay > c) {
        const len = Math.hypot(ax - c, ay - c) || 1
        normal = [(ax - c) / len, (ay - c) / len]
      } else {
        normal = ax >= ay ? [1, 0] : [0, 1]
      }
      return rimGap(point) * Math.hypot((normal[0] - normal[1]) * ISO.ISO_X, (normal[0] + normal[1]) * ISO.ISO_Y)
    }

    const districts = [...nectar.matchAll(/\{ key: '([A-Z]+)', at: \[(-?\d+), (-?\d+)\], tone: '[a-z-]+', kind: '[a-z]+', count: \d+, spread: (\d+) \}/g)]
      .map((m) => ({ key: m[1], at: [Number(m[2]), Number(m[3])], spread: Number(m[4]) }))
    assert.equal(districts.length, 4)
    const groundOf = (district) => district.spread + GROUND_OUT

    const sites = [...nectar.matchAll(/\{ id: '(SITE \d+)', plan: \[(-?\d+), (-?\d+)\], records: '[\d,]+', half: (\d+), wall: (\d+)/g)]
      .map((m) => ({ id: m[1], plan: [Number(m[2]), Number(m[3])], half: Number(m[4]), wall: Number(m[5]) }))
    assert.equal(sites.length, 3)
    // Which district each site publishes into, read off the source and keyed by
    // the site rather than by position - the two lists are not in the same order
    // and never were.
    const feeds = Object.fromEntries(
      [...nectar.matchAll(/\{ key: '(SITE \d+)', site: SITE_\d+, into: ([A-Z]+) \}/g)].map((m) => [m[1], m[2]]),
    )
    assert.deepEqual(Object.values(feeds).sort(), ['CRITERIA', 'MAPPINGS', 'UNITS'])

    const faces = []
    for (const site of sites) {
      // Which port is not chosen. Screen x here depends only on (x - y), so the
      // port standing directly over a site is the one that keeps that site's own
      // (x - y) - which is what lets a route whose middle is hidden still read as
      // one route. Two sites resolve onto a flat face; the third, on the plan
      // diagonal, resolves under the front corner.
      const span = site.plan[0] - site.plan[1]
      const inset = INTEL_HALF - PORT_IN
      const face = span > 40 ? 'right' : span < -40 ? 'left' : 'corner'
      faces.push(face)
      const port = face === 'right' ? [inset, inset - span]
        : face === 'left' ? [inset + span, inset]
          : [PORT_CORNER, PORT_CORNER]
      const out = face === 'right' ? [1, 0] : face === 'left' ? [0, 1] : [1, 1]

      // THE PORT IS DIRECTLY ABOVE ITS SITE. Not approximately - exactly, in the
      // one coordinate screen x depends on.
      assert.equal(port[0] - port[1], span, `${face}: the port is not in its site's own column`)

      // IT IS ON THE BOARD, NOT ON THE BOUNDARY. Nine pixels of clear slab on
      // every side of every port, which is the corner's ceiling: past that the
      // diagonal runs out of room between the rim and the district sitting on
      // the same diagonal, and the two squeezes trade against each other.
      assert.ok(rimGapPx(port) >= 9, `${face}: the port is too close to the edge of the tile`)
      for (const district of districts) {
        const clear = Math.hypot(port[0] - district.at[0], port[1] - district.at[1]) - groundOf(district)
        assert.ok(clear >= 8, `${face}: the port sits on ${district.key}`)
      }

      // The arc. Its control point sits on the outward plan normal of the face
      // its port is nearest, carried through the projection, so the last stretch
      // runs along a plan axis of the drawing rather than at whatever angle the
      // chord happened to leave. On screen that is the same slope every skirt and
      // every wall marking already runs at.
      const land = mesh(...port)
      const [cx, base] = ground(...site.plan)
      const solid = ISO.roundedDeck(cx, base - site.wall, site.half, site.wall, Math.round(site.half * 0.34))
      const start = [solid.back[0], solid.back[1] - MAST]
      const away = [(out[0] - out[1]) * ISO.ISO_X, (out[0] + out[1]) * ISO.ISO_Y]
      const len = Math.hypot(...away)
      const ctrl = [land[0] + (GATE_REACH * away[0]) / len, land[1] + (GATE_REACH * away[1]) / len]
      const tangent = [land[0] - ctrl[0], land[1] - ctrl[1]]
      assert.ok(
        Math.abs(tangent[0] * away[1] - tangent[1] * away[0]) < 1e-9,
        `${face}: the arc does not arrive along a plan axis`,
      )

      // AND IT ENDS UNDER THE SLAB. This is the assertion the old one inverted:
      // the terminus used to have to be OUTSIDE the silhouette, because nothing
      // was going to cover it. It has to be inside now, or there is no hole being
      // gone through - the route would just be stopping short of one.
      assert.ok(onTop(land), `${face}: the channel stops outside the slab instead of going into it`)
      // The control point stays outboard, so the curve reaches the port from
      // outside and passes beneath the near skirt rather than doubling back over
      // the top of it.
      assert.ok(!inside(ctrl), `${face}: the arc turns back over the slab on its way in`)

      // The last leg: one straight run along a plan axis, from the port to a pad
      // on the rim of its own district's ground. Not into a bus pad - a
      // definition arriving from a site is a new member of one kind, not traffic
      // between two - and not at a node in the middle of a cluster, which is what
      // the old feeder did at a screen angle matching nothing it crossed.
      const home = districts.find((district) => district.key === feeds[site.id])
      const reach = groundOf(home) + DOCK_GAP
      const dock = Math.abs(port[1] - home.at[1]) < reach
        ? [home.at[0] + Math.sign(port[0] - home.at[0]) * Math.sqrt(reach ** 2 - (port[1] - home.at[1]) ** 2), port[1]]
        : [port[0], home.at[1] + Math.sign(port[1] - home.at[1]) * Math.sqrt(Math.max(reach ** 2 - (port[0] - home.at[0]) ** 2, 0))]
      assert.ok(
        Math.abs(dock[0] - port[0]) < 1e-9 || Math.abs(dock[1] - port[1]) < 1e-9,
        `${face}: the run in from the port is not on a plan axis`,
      )
      assert.ok(Math.hypot(dock[0] - port[0], dock[1] - port[1]) > 12, `${face}: the run in is too short to read as a run`)

      // NOTHING ON THAT RUN GOES NEAR AN EDGE OR THROUGH A CLUSTER. Walked, not
      // sampled at the ends: the leg the port replaced started ON the boundary,
      // and its first corner sat on it too.
      for (let step = 0; step <= 200; step += 1) {
        const t = step / 200
        const point = [port[0] + (dock[0] - port[0]) * t, port[1] + (dock[1] - port[1]) * t]
        assert.ok(rimGapPx(point) >= 9, `${face}: the run in touches the edge of the tile`)
        for (const district of districts) {
          if (district.key === home.key) continue
          const clear = Math.hypot(point[0] - district.at[0], point[1] - district.at[1]) - groundOf(district)
          assert.ok(clear >= 8, `${face}: the run in crosses ${district.key}`)
        }
      }
      // And it stops five units clear of the ground it is landing beside, so the
      // pad is beside the district rather than on top of it.
      const landing = Math.hypot(dock[0] - home.at[0], dock[1] - home.at[1]) - groundOf(home)
      assert.ok(Math.abs(landing - DOCK_GAP) < 1e-6, `${face}: the run in does not stop clear of its own district`)
    }
    // Right face, left face, front corner: three ports spread across the whole
    // near half of the board rather than three on one side of it.
    assert.deepEqual([...faces].sort(), ['corner', 'left', 'right'])

    // THE SLAB IS PAINTED OVER THE CHANNELS, AND THAT IS LOAD-BEARING. The arcs
    // genuinely end inside the plan; the only thing keeping them off the near
    // skirt is stroke order. Put the intelligence back above them and every route in
    // this figure turns into a wire laid over a photograph.
    assert.ok(
      nectar.indexOf('{CHANNELS.map((item) => {') < nectar.indexOf('<g className={`dgm-intel'),
      'the intelligence is drawn before the channels, so every route crosses the slab it goes into',
    )
    // The sites still come after it, so a site is never drawn under the slab it
    // publishes into.
    assert.ok(nectar.indexOf('<g className={`dgm-intel') < nectar.indexOf('const chan = BY_SITE[site.id]'))

    // A PORT IS DRAWN AS A HOLE, and as the same hole the other figure's intake
    // throat is: a plan circle for the wall, the same circle a few units further
    // down the screen for the floor, both clipped to the bore so what is drawn is
    // exactly what can be seen down it. One part, two figures.
    assert.match(nectar, /<circle className="dgm-shaft" cx=\{item\.port\.at\[0\]\} cy=\{item\.port\.at\[1\]\} r=\{PORT_R\} \/>/)
    assert.match(nectar, /className="dgm-shaftfloor"[\s\S]{0,160}cx=\{item\.port\.at\[0\] \+ PORT_DROP\}/)
    assert.match(nectar, /<clipPath id=\{`nc-port-\$\{item\.key\.replace\(' ', '-'\)\}`\}/)
    assert.match(nectar, /<g clipPath=\{`url\(#nc-port-\$\{item\.key\.replace\(' ', '-'\)\}\)`\}>/)
    assert.match(nectar, /className="dgm-portrim"/)
    assert.match(DGM_BLOCK, /\.dgm-portal \.dgm-shaft \{ fill: color-mix\(in srgb, var\(--ink-deep\) (\d+)%/)
    // The port runs deeper than the throat it shares a construction with,
    // because it is a fifth of the size and the throat's two tones read as a pale
    // ring with nothing in it at that scale - which is a pad, and a pad is the
    // one thing this part must not be mistaken for.
    const tone = (rule) => Number(DGM_BLOCK.match(new RegExp(`${rule} \\{ fill: color-mix\\(in srgb, var\\(--ink-deep\\) (\\d+)%`))[1])
    assert.ok(tone('\\.dgm-portal \\.dgm-shaft') > tone('\\.dgm-portal \\.dgm-shaftfloor'))
    assert.ok(tone('\\.dgm-portal \\.dgm-shaft') > Number(DGM_BLOCK.match(/\.dgm-shaft \{\s*\n\s*fill: color-mix\(in srgb, var\(--ink-deep\) (\d+)%/)[1]))

    // NOTHING IS BUILT ON THE RIM, and nothing is written there either.
    //
    // Three prisms stood there once - the same solid as a criterion at the scale
    // of a port, two lit faces each and a crown that went full accent the moment
    // its site published. They were three of the four brightest objects in the
    // figure and they were parked on the one edge that has to read as an edge.
    // Then a dot, which was better and still an object placed on a boundary to
    // mark something that needs no marking.
    assert.doesNotMatch(nectar, /GATE_RISE|GATE_ACROSS|GATE_ALONG|GATE_CORNER|GATE_SEAT|gate\.solid|dgm-gate|LAND_R|dgm-land|RIM_CORNER/)
    for (const rule of ['.dgm-gate', '.dgm-gatecap', '.dgm-land']) {
      assert.doesNotMatch(DGM_BLOCK, new RegExp(`\\${rule}[\\s,{]`))
    }
    assert.doesNotMatch(nectar, /^[^/\n]*INTEL\.front/m)

    // What the port feeds, on the sheet.
    assert.match(nectar, /className=\{`dgm-trace is-feed\$\{state\.up\.includes\(item\.key\) \? ' is-up' : ''\}\$\{lit\(item\.key\)\}`\}/)
    assert.match(nectar, /<path className="dgm-tracepath" d=\{item\.feed\} \/>/)
    assert.match(nectar, /const dock = dockOn\(item\.into, port\.at\)/)
    assert.match(nectar, /const feed = run\(port\.at, dock, 'x'\)/)
    // The channels drift with the slab. Three pixels of travel at a joint that
    // has nothing to hide it would show as the route parting from its port;
    // moved to the site end it is swallowed by a mast head built for it.
    assert.match(DGM_BLOCK, /\.dgm-intel,\s*\n\.dgm-lift \{ transform: translateY\(var\(--drift, 0px\)\); \}/)
    // And a channel turns a corner, so every mark that runs one has to round its
    // joins or the default miter throws a spike as a dash spans it.
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

    // THE INTELLIGENCE IS A BOARD, NOT A HEAP.
    //
    // It was one jittered lattice across the whole slab: forty-two solids in
    // three state colours and two shapes. A reader could see that it
    // held a lot of things and could not see that it held KINDS of thing, which
    // is the entire difference between intelligence and a pile of it.
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
    // NOTHING IS LETTERED. The three floating tickets - CRITERION, UNIT and MAP,
    // pills parked in mid-air naming payloads a reader had no way to place -
    // came off first, and the four district names that replaced them came off
    // after, for the same reason: this is the one plane in the figure that has
    // to read as a held surface, and a word lying on it is a word between the
    // reader and the claim. Kind is carried by ink, by solid and by corner,
    // three times over.
    assert.doesNotMatch(nectar, /dgm-district-name|district\.mark|EDGE_ANGLE\} \$\{lx\}/)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-district-name[\s,{]/)
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
    // vertical post standing on the intelligence.
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
    // when the intelligence binds them.
    assert.match(nectar, /className=\{`dgm-crit \$\{node\.tone\}\$\{bound \? ' is-bound' : ''\}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-breathe \{[\s\S]*?50% \{ fill-opacity: 0\.42; \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-crit\.is-bound \.dgm-node \{\s*\n\s*animation: dgm-breathe 5\.6s ease-in-out infinite;\s*\n\s*animation-delay: calc\(var\(--wave, 0\) \* -5\.6s\);/)
    assert.doesNotMatch(DGM_BLOCK, /dgm-lamp|dgm-lampflick/)
    // A lamp never goes fully out. One at 0.42 is a definition the intelligence is
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

  it('carries no corner mark in either figure', () => {
    // The monogram sat in the top-left corner for a pass and came off: the
    // brand's presence on the product sheets is the courier on the workflow
    // figure, and a logo stamped on a technical drawing beside it read as a
    // watermark, not a signature.
    for (const source of figures) {
      assert.doesNotMatch(source, /dgm-mark|damaros-monogram/)
    }
    // The receipt says it is written by being written - the front row fills and
    // its seal turns - rather than by a pill parked beside the deck announcing
    // it in words the rail was already carrying.
    assert.match(trident, /const written = state\.receipt \|\| !last/)
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgerseal \{ fill: var\(--settled\); \}/)
  })

  it('states every state in blue and leaves green meaning a kind of definition', () => {
    // SETTLED IS A BLUE. It was the success token carried toward the ink, which
    // was the right repair to the wrong colour: Trident is one ink at four
    // depths, and a seal on a ledger row was the last place a state still
    // reached past every tier in the drawing for a hue of its own. On Nectar's
    // board green already means something else - the UNITS district, a KIND of
    // definition - so the same green saying "committed" in the readout below it
    // was two meanings on one channel.
    assert.match(DGM_BLOCK, /--settled: color-mix\(in srgb, var\(--accent-strong\) \d\d%, var\(--accent\)\);/)
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgerseal \{ fill: var\(--settled\); \}/)
    // Green survives in exactly one place, and it is not a state: the district
    // that holds the scales a reading is taken on. Colour there is the kind of
    // thing standing on the board, which is the one job it has on that floor.
    const greens = [...DGM_BLOCK.matchAll(/^[^\n]*var\(--success[^\n]*$/gm)].map((m) => m[0])
    assert.equal(greens.length, 2, 'green is only the UNITS district, and only in its two ink lines')
    for (const line of greens) assert.match(line, /^ {2}--ink(-deep)?: /)
    assert.match(DGM_BLOCK, /\.dgm-crit\.is-green,\s*\n\.dgm-district\.is-green \{\s*\n\s*--ink: var\(--success\);/)
    // Nothing states a state in it. No seal, no rim, no readout.
    assert.doesNotMatch(DGM_BLOCK, /(stroke|fill): var\(--success(-soft)?\)/)
    // Derived, not picked: no figure invents a colour of its own.
    assert.doesNotMatch(DGM_BLOCK, /#[0-9a-fA-F]{3,8}\b/)

    // AND SETTLED IS THE ONLY FILLED PILL. The two states were told apart by hue
    // alone - a green tint for settled beside a blue tint for passing - so taking
    // the green out collapsed them into the same chip, and no tint light enough
    // to sit under dark type is more than a few levels off any other. The
    // difference moves onto weight instead: passing is a tint with the deep blue
    // written on it, settled is the deep blue with the paper written on it.
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-valid \.dgm-status,\s*\n\.dgm-svg\.is-signed \.dgm-status \{ fill: var\(--settled\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-valid \.dgm-statustext,\s*\n\.dgm-svg\.is-signed \.dgm-statustext \{ fill: var\(--surface-solid\); \}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-pass \.dgm-status \{ fill: var\(--accent-soft\); \}/)
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
    // AND THE WASH IS FLAT, AT THE LIGHTEST TIER'S VALUE. It used to open down
    // the stack alongside the ink, 27 to 50, so a deeper tier also held more of
    // its own ink in its skirts. That is the descent drawn twice and the second
    // drawing cost more than it said: `--wash` is not a hierarchy control, it is
    // how hard a solid is modelled, so opening it downward modelled each deck
    // harder than the one above it and the stack came out as four objects of
    // four different solidities. The ink alone carries the order now.
    const washes = tiers.map((tier) => Number(rule(tier).match(/--wash: (\d+)%/)[1]))
    assert.equal(new Set(washes).size, 1, 'every Trident tier is modelled at one weight')
    assert.equal(washes[0], 27, "and it is the proposal tier's own, which was the lightest of the four")
    // Nothing standing on a deck is modelled as hard as the deck under it, and
    // every one of them is modelled at the same weight as every other - a bound
    // field on SCHEMA and a written row on LEDGER are the same object at the
    // same solidity, which is what they are.
    const stood = DGM_BLOCK.match(/\.dgm-slide :is\(\.dgm-stand, \.dgm-field, \.dgm-ledgerrow\) \{[^}]*\}/)[0]
    assert.equal(Number(stood.match(/--wash: (\d+)%/)[1]) < washes[0], true)
    assert.match(stood, /--shade: \d+%/)
    // What tells the four apart is the ink, and it deepens all the way down: the
    // proposal tier is carried toward the neutral, the contract is the house
    // accent undiluted, and the two below it are carried further into the text
    // each step. Re-solved off the sources rather than pinned to a literal.
    const toward = (tier) => {
      const body = rule(tier)
      if (/--ink: var\(--accent\);/.test(body)) return 0
      const mix = body.match(/--ink: color-mix\(in srgb, var\(--accent(-strong)?\) (\d+)%, var\(--(muted|text)\)\)/)
      return mix[3] === 'text' ? 100 - Number(mix[2]) : Number(mix[2]) - 100
    }
    const depth = tiers.map(toward)
    assert.deepEqual(depth, [...depth].sort((a, b) => a - b), 'the ink has to deepen every step down the stack')
    assert.equal(new Set(depth).size, 4)

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
      /block: planPrism\(x, y, FIELD_HALF, FIELD_HALF, FIELD_RISE, 7\)/,
      /bar: planPrism\(4, y, 48, 5\.5, 5, 5\)/,
      /block: planPrism\(x, 47, 5, 5, 5, 5\)/,
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

  it('holds the intelligence above the ground and stands a criterion up when it binds', () => {
    // The intelligence was one rounded rect with a hairline round it, which put the
    // two planes of this figure in the same register as the dot field behind
    // them - drawn on the page rather than held over it. It is the same extruded
    // solid every deck and every site is, and it drops its own shade on the
    // federation below.
    assert.match(nectar, /const INTEL = roundedDeck\(310, MESH_Y, INTEL_HALF, INTEL_WALL, 28\)/)
    assert.match(nectar, /<Faces shape=\{INTEL\} className="dgm-solid" \/>/)
    assert.match(nectar, /<Seat half=\{INTEL_HALF\} radius=\{28\} cy=\{GROUND_Y\} kind="intel" \/>/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-seat\.is-intel \{\s*\n\s*animation-duration: 11s;/)
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
    // more went out of criteria the intelligence already held - six circles growing
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
    // ONE HEAD PER SITE, AND NEVER IN STEP. The second head that used to
    // answer a hover doubled the local run into two bars crossing at once,
    // and three heads delayed off `--stagger` - three values inside half a
    // period - read as one synchronised scanner sweeping the federation. A
    // site runs one head, delayed and rated off its own `--life`, so the
    // three drift and never agree; hover and a running download both deepen
    // the head's ink on the same clock, touching no timing at all.
    assert.doesNotMatch(nectar, /dgm-second|is-again/)
    assert.doesNotMatch(css, /dgm-second|is-again/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-sweep \{\s*\n\s*animation: dgm-sweep calc\(3s \+ var\(--life, 0\) \* 2\.4s\)[^}]*animation-delay: calc\(var\(--life, 0\) \* -8\.7s\);/)
    assert.match(nectar, /className=\{`dgm-site\$\{state\.down\.includes\(site\.id\) \? ' is-running' : ''\}/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-site\.is-hot \.dgm-sweep,\s*\n\.dgm-svg\.is-live \.dgm-site\.is-running \.dgm-sweep \{\s*\n\s*fill: color-mix/)
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
    assert.match(nectar, /status: 'STEADY', read: '[^']*Structure crosses; records never do\.'/)
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

    // AND THE PARAGRAPH STAYS AT ALTITUDE. The three facts beside it carry the
    // concrete claims, so the copy above them is free to say what Nectar is FOR
    // rather than what it does - where it sits in Damaros, and what having it
    // changes about where execution capacity can exist. It is the only place on
    // the page that gets to be that high up, and it earns that by not competing
    // with the chips underneath it.
    const nectarCopy = app.match(/<div className="nectar-copy">[\s\S]*?<\/div>/)[0]
    const para = nectarCopy.match(/<p>([^<]*)<\/p>/)[1]
    assert.match(para, /shared execution intelligence/)
    assert.match(para, /every Damaros site/)
    assert.match(para, /network/)

    // NEITHER "LIBRARY" NOR "MODEL" IS THE NOUN. Both were tried and both left
    // this page. A library is a place you borrow from, which undersold what
    // Nectar actually is; "model" was the fix, and it collided with the other
    // half of the page - Trident's whole pitch is that ANY AI MODEL can
    // propose, so calling Nectar's board a model too made two different things
    // on the same site answer to one word. "Intelligence" is neither: it names
    // what the board holds without implying storage, and it does not compete
    // with the word Trident already owns.
    //
    // The drawing code was chased through both changes rather than left behind
    // either time - `LIBRARY` became `MODEL` became `INTEL`, and `dgm-library`
    // became `dgm-model` became `dgm-intel` - because a rename that stops at
    // the copy and never reaches the identifiers is a rename that is still
    // owed, and it compounds: the second rename would have had to explain a
    // mismatch that need never have existed. Code and copy call it the same
    // thing, and neither retired word survives anywhere a reader or a
    // maintainer would meet it.
    // "Library" has no legitimate use left anywhere on the site, so it is
    // banned file-wide. "Model" still has one: Trident's whole pitch is that
    // ANY AI MODEL can propose, in the headline, the deck fact and the plate
    // jitter comment in this very stylesheet - so that ban is scoped to the
    // paragraph and to the Nectar figure, which has no model of its own to
    // talk about and never did.
    for (const source of [app, css, mobile, nectar]) assert.doesNotMatch(source, /library/i)
    assert.doesNotMatch(para, /\bmodels?\b/i)
    assert.doesNotMatch(nectar, /\bmodels?\b/i)
    assert.match(nectar, /pill: 'INTELLIGENCE'/)
    assert.match(nectar, /const INTEL_HALF = 160/)
    assert.match(nectar, /const INTEL = roundedDeck\(310, MESH_Y, INTEL_HALF, INTEL_WALL, 28\)/)
    assert.match(nectar, /className=\{`dgm-intel\$\{lit\('intel'\)\}`\}/)
    // The three facts under it are unchanged, so nothing concrete moved up into
    // the paragraph when the paragraph moved up.
    assert.doesNotMatch(para, /PHI|Coverage compounds|stays at the site/)
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

/* ═══════════════════════════════════════════════════════════════════════════
   THE FLOOR

   A third figure in the same hand. What this suite is for is the pair of claims
   that are easy to state and easy to lose: that it is the SAME drawing language
   as Trident and Nectar - same projection, same solid, same driver, same tokens
   - and that it is NOT the same drawing. Both halves matter. A third portrait
   of a place would have added nothing to the page, and a third figure invented
   from scratch would have cost the page the thing that makes the other two read
   as one instrument.
   ═══════════════════════════════════════════════════════════════════════════ */

describe('The floor schematic', () => {
  it('is drawn in the same hand as the other two figures', () => {
    assert.match(floor, /from '\.\/iso'/)
    assert.match(floor, /roundedSlab\(seat\[0\], seat\[1\], HALF_X, HALF_Y, SHEET, PLATE_R\)/)
    assert.doesNotMatch(floor, /<text\b[^>]*>\{(?!item\.label)/)
    // AND NOT TRIDENT OR NECTAR. Those figures' own helpers stay theirs: the
    // floor builds every round thing it has - the cells, the reels, the
    // pivots - out of its own `drum`, on `roundedCylinder`.
    assert.doesNotMatch(floor, /roundedDeck|planCyl|planPrism|planDrop/)
  })

  it('seats five plates in a row, already down', () => {
    // One plane was an abstraction: a rectangle is not a shape this business
    // makes, and a plate with nothing on it is a plate nobody has a reason to
    // look at. Five plates, and the five are the product.
    const steps = floor.match(/const STEPS = \[[\s\S]*?\n\]\.map/)[0]
    assert.deepEqual([...steps.matchAll(/label: '([A-Z]+)'/g)].map((m) => m[1]),
      ['PROTOCOL', 'EVIDENCE', 'SCREENING', 'RESOLVE', 'REPLAY'])
  })

  it('packs the row so no plate ever lands on its neighbour', () => {
    // A plan rectangle of half-extents (hx, hy) projects 2(hx + hy) * ISO_X
    // wide, and a row stepped by (+t, -t) advances 2t * ISO_X - so plates
    // collide unless t exceeds hx + hy. The row also runs along the axis that
    // projects FLAT, because stepping plan x alone sends it down and to the
    // right and puts every label exactly where the next plate is.
    const halfX = Number(floor.match(/const HALF_X = ([\d.]+)/)[1])
    const halfY = Number(floor.match(/const HALF_Y = ([\d.]+)/)[1])
    const step = Number(floor.match(/const STEP = (\d+)/)[1])
    assert.ok(step > halfX + halfY, `a step of ${step} against a half-extent of ${halfX + halfY} overlaps`)
    assert.match(floor, /const seat = PLAN\(t, -t\)/)
  })

  it('has no entrance to run - the plates are there, and the machinery is the show', () => {
    // The figure used to open as thirty scattered tiles drawing together into
    // the five plates as the reader arrived. The entrance was a claim about
    // consolidation, but it spent the row's first seconds on furniture
    // assembling itself, and the machinery is the argument - so the scatter,
    // the fuse timeline it eased on, and the latch that armed it are all
    // gone. The plates are simply drawn, the way a survey sheet is simply
    // drawn, and the only choreography a reader ever watches is material
    // moving through the run.
    assert.doesNotMatch(floor, /fl-tile|driftX|wanderX|setFused|IntersectionObserver|is-fused/)
    assert.doesNotMatch(css, /--fuse|fl-tile|fl-adrift|fl-drift|is-fused/)
    // The machines still gate on the section's power: clocks run while the
    // figure is on screen, and every seam handoff starts from that one class
    // flip - which is what keeps the five plates phase-locked.
    assert.match(floor, /className=\{`dgm-svg is-floor\$\{animate \? ' is-live' : ''\}`\}/)
    // And with no scatter to wait out, every station is a target from the
    // first frame.
    assert.match(floor, /tabIndex=\{0\}/)
    assert.match(css, /\.fl-hit \{\s*\n\s*fill: none;\s*\n\s*pointer-events: all;\s*\n\s*cursor: pointer;\s*\n\}/)
  })

  it('stands the machines on paper, in ink', () => {
    assert.match(floor, /plate: roundedSlab\(seat\[0\], seat\[1\], HALF_X, HALF_Y, SHEET, PLATE_R\)/)
    // THE PLATE IS PAPER AND WHAT STANDS ON IT IS INK. The pass before this
    // drew the surface in blue and the machine on it in blue an eighth of a
    // step apart, and no reader could tell where one stopped and the other
    // started. The gap is now a real one, and it is a gap in VALUE rather than
    // in outline weight - which is how Trident holds a deck apart from the
    // nineteen solids standing on it.
    const paper = Number(css.match(/\.fl-plate \.dgm-face-top \{\s*fill: color-mix\(in srgb, var\(--tone\) (\d+)%/)[1])
    const ink = Number(css.match(/\.fl-emblem \.dgm-face-top \{\s*fill: color-mix\(in srgb, var\(--tone\) (\d+)%/)[1])
    assert.ok(paper <= 8, `a base at ${paper}% competes with what it is a base for`)
    assert.ok(ink - paper >= 24, `${ink}% on ${paper}% is not a figure standing on a ground`)
    // And nothing pulses on the base. The charge that used to cross every
    // plane lit the tiles themselves, which is a surface that never settles.
    assert.doesNotMatch(css, /\.fl-lit\b/)
    assert.doesNotMatch(floor, /fl-lit|const ORDERS|holds:/)
  })

  it('runs one material through five stations, and colours it by verdict', () => {
    // A BLOCK IS THE THING THE WHOLE ROW IS MADE OF.
    //
    // Every pass before this built five machines and gave them nothing to work
    // on, so the figure was five instruments demonstrating themselves - which
    // is why it kept coming out derivative however different the mechanisms
    // were. What ties a run together is not the machines, it is the thing
    // PASSING THROUGH them: a block arrives in a heap, is ordered into rows,
    // falls down one of three holes, and ends up shelved where it can be pulled
    // back out.
    assert.match(floor, /const cell = \(px, py, verdict, high = 5, base = 0, extra = \{\}\) =>/)
    assert.match(floor, /cls: `fl-blk\$\{verdict \? ` is-\$\{verdict\}` : ''\}`/)
    for (const key of ['protocol', 'evidence', 'screening', 'resolve', 'replay']) {
      assert.match(floor, new RegExp(`^    ${key}: \\(\\) =>`, 'm'))
    }

    // AND IT CARRIES ITS VERDICT THE WHOLE WAY. Green for eligible, red for
    // not, amber for the ones a machine cannot settle - which is the only
    // reason Resolve exists and the reason a person is standing at it. Two
    // layers that do not fight: the STATION'S ink dresses the plate and the
    // instrument, the BLOCK'S colour is the state of one subject, and the same
    // green on Screening is the same green on Replay because it is the same
    // block.
    for (const verdict of ['pass', 'hold', 'fail']) {
      assert.match(css, new RegExp(`--${verdict}: color-mix\\(in srgb, var\\(--(success|warning|danger)\\)`))
      assert.match(css, new RegExp(`\\.fl-blk\\.is-${verdict} \\.dgm-face-right \\{ fill: var\\(--${verdict}\\); \\}`))
    }
    // The three come out of the product's own state palette rather than being
    // picked to look like a traffic light.
    assert.match(css, /--pass: color-mix\(in srgb, var\(--success\)/)
    assert.match(css, /--hold: color-mix\(in srgb, var\(--warning\)/)
    assert.match(css, /--fail: color-mix\(in srgb, var\(--danger\)/)
    // UNDECIDED IS THE HOUSE BLUE, NOT THE STATION'S INK. A block nobody has
    // ruled on is material and not a state, and it has to look the same in the
    // pile on Evidence as it does falling into a throat on Screening - which it
    // cannot if it takes the ink of whichever plate it is standing on. The
    // station colours the plate and the machine; a verdict, and only a verdict,
    // colours the block.
    assert.match(css, /\.fl-blk \.dgm-face-top \{ fill: color-mix\(in srgb, var\(--accent\)/)

    // THE LAMP IDIOM GOES WITH IT. State used to be a lit cap on top of a
    // solid, because a half-opaque solid in an axonometric reads as a hole and
    // something had to carry the state. That was the right answer to the wrong
    // question: the thing whose state matters is not a fixture on a plate, it
    // is the subject moving through, and a subject can be the colour it is.
    assert.doesNotMatch(css, /fl-lamp/)
    assert.doesNotMatch(floor, /fl-lamp|const lit =/)

    // FIVE STATIONS, AND EACH IS A DIFFERENT KIND OF MACHINE. Chasing five
    // distinct kinds of MOTION was the wrong target twice over - first
    // everything collapsed onto one axis, then everything became a hinge. What
    // fixed it was giving the row a material and letting each station do the
    // thing it does to that material: a board of switches, a claw on a gantry,
    // three throats, a ram across a lane, a tape transport.
    const own = {
      protocol: ['fl-board', 'fl-toggle', 'fl-seat', 'fl-issue'],
      evidence: ['fl-rig', 'fl-gant', 'fl-claw', 'fl-carry', 'fl-pick', 'fl-ship', 'fl-dock'],
      screening: ['fl-hole', 'fl-throat', 'fl-faller', 'fl-shunt', 'fl-sunk', 'fl-join', 'fl-rer', 'fl-bud'],
      resolve: ['fl-ram', 'fl-pivot', 'fl-lever', 'fl-index', 'fl-feed', 'fl-pushed'],
      replay: ['fl-tape', 'fl-reel', 'fl-head', 'fl-frame', 'fl-spin'],
    }
    for (const [key, parts] of Object.entries(own)) {
      for (const part of parts) {
        assert.match(floor, new RegExp(part), `${key} needs its ${part}`)
        assert.match(css, new RegExp(`\\.${part}[ ,.{:]`), `${part} has to be dressed`)
      }
    }
    // And nothing an abandoned pass left behind is still in the sheet: a disc
    // hovering over material it never touched, a plunger on an anvil nothing
    // else referred to, a shelf of files.
    // The catapult went with the gate that replaced it: a machine that has
    // run out of rules does not throw the subject at the person, it SENDS it
    // - through a slot cut in its own wall, into a matching gate at the back
    // of the plate where the person is.
    for (const gone of ['fl-shaper', 'fl-plunge', 'fl-anvil', 'fl-stamp', 'fl-pull', 'fl-post', 'fl-catapult', 'fl-shot', 'fl-fling', 'fl-throwline']) {
      assert.doesNotMatch(floor, new RegExp(gone), `${gone} belongs to a pass that was thrown out`)
      assert.doesNotMatch(css, new RegExp(gone), `${gone} belongs to a pass that was thrown out`)
    }
    // The shelf and the row of set blocks went with the two stations that were
    // rebuilt around them. These are checked in the figure alone: `is-set` is a
    // substring of a class the product surfaces use, and a sheet-wide sweep for
    // it would be catching the wrong thing.
    for (const gone of ['is-shelved', 'is-set']) {
      assert.doesNotMatch(floor, new RegExp(gone), `${gone} belongs to a pass that was thrown out`)
    }

    // PROTOCOL IS A GRID, NOT A ROW. Five switches on a diagonal is a line a
    // reader follows one at a time; a lattice is something they can total at a
    // glance, which is why Trident's contract deck is the most legible object
    // in that figure. Same construction here, at switch scale.
    const cols = JSON.parse(floor.match(/^ +const cols = (\[.*\])$/m)[1])
    const rows = JSON.parse(floor.match(/^ +const rows = (\[.*\])$/m)[1])
    assert.ok(cols.length >= 3 && rows.length >= 3, 'a board of switches is at least three by three')
    // A protocol is a bank of conditions that are either met or not, so every
    // switch settles to a verdict and some of them settle red.
    const verdicts = JSON.parse(floor.match(/const verdict = (\[[^\]]+\])/)[1].replace(/'/g, '"'))
    assert.equal(verdicts.length, cols.length * rows.length, 'every switch on the board settles')
    assert.ok(verdicts.includes('pass') && verdicts.includes('fail'), 'a board where everything passes is not a screen')

    // SCREENING'S THREE VERDICT SEATS LINE THE FAR LONG EDGE: one plan y,
    // stepping along the plan x that edge itself runs on. Green, red, amber,
    // left to right - and the amber one nearest the corner that points at
    // Resolve, because that is the one that goes there. The first two are
    // terminal pores; the third is not a pore at all, it is the GATE.
    const hole = [...floor.match(/^ +const hole = (\[.*\])$/m)[1].matchAll(/\[(-?\d+), (-?\d+), '(\w+)'\]/g)]
      .map((m) => [Number(m[1]), Number(m[2]), m[3]])
    assert.equal(hole.length, 3)
    assert.equal(new Set(hole.map(([, py]) => py)).size, 1, 'three verdicts off one plan axis is a bent plate')
    const across = hole.map(([px, py, v]) => [(px - py) * 0.866, v]).sort((a, b) => a[0] - b[0])
    assert.deepEqual(across.map(([, v]) => v), ['pass', 'fail', 'hold'])
    assert.match(floor, /hole\.slice\(0, 2\)\.map\(\(\[px, py, v\], i\) => \(\{\s*\n\s*\.\.\.well\(px, py, 11\.9, 8\)/)
    // THE PORES KEEP CLEAR OF THE WALL. The collar rides at 1.18r and the
    // vessel's inner face stands t inside the plan edge; a collar touching
    // that face reads as a hole cut through the FOUNDATION rather than the
    // plate's floor. Derived from the same numbers the parts are built with,
    // so shrinking the bore is held to what the shrink bought.
    const poreR = Number(floor.match(/\.\.\.well\(px, py, ([\d.]+), 8\)/)[1])
    const dishWall = floor.match(/const DISH = \{ hx: [\d.]+, hy: ([\d.]+), r: \d+, t: (\d+)/).slice(1).map(Number)
    assert.ok(hole[0][1] - 1.18 * poreR >= -(dishWall[0] - dishWall[1]) + 2,
      'a pore collar within two plan units of the inner wall face touches the shell')
    // THE BED FEEDS THE GREEN PORE AS A LINE, on one 5.6s clock: the cell on
    // the pore's own column slides one pure -y step onto the mouth
    // (fl-drop), the entry-seat cell shunts one column over to take its
    // place (fl-shunt), and the cell arriving through the back gate takes
    // the entry seat (fl-join). Drawn as three cells on TWO seats - join and
    // shunt share the entry seat - which is what lets every handover be a
    // crossfade between coincident cells at rest instead of a materialise.
    assert.match(floor, /\{ \.\.\.cell\(wait\[0\]\[0\], wait\[0\]\[1\], null, 5\), cls: 'fl-blk fl-join' \},\s*\n\s*\{ \.\.\.cell\(wait\[0\]\[0\], wait\[0\]\[1\], null, 5\), cls: 'fl-blk fl-shunt' \},\s*\n\s*\{ \.\.\.cell\(wait\[1\]\[0\], wait\[1\]\[1\], null, 5\), cls: 'fl-blk fl-faller' \}/)
    // The feed seat stands on the green pore's own plan x, so the feed is
    // one pure plan-axis travel - and both travels are exactly seat-to-seat,
    // re-derived here from the seats' own numbers.
    const waitCols = JSON.parse(floor.match(/\[2, 24\]\.flatMap\(\(py\) => (\[[^\]]+\])/)[1])
    const waitRow = 2
    assert.equal(waitCols[1], hole[0][0], 'the feed column must stand on the green pore x')
    assert.match(css, /@keyframes fl-drop \{\s*\n\s*0%, 8% \{ transform: translate\(0px, 0px\); opacity: 1; \}/)
    const dropTravel = css.match(/@keyframes fl-drop \{[\s\S]*?translate\(([\d.]+)px, (-[\d.]+)px\)/).slice(1).map(Number)
    const feedPlan = waitRow - hole[0][1]
    assert.ok(Math.abs(dropTravel[0] - feedPlan * 0.866) < 0.05 && Math.abs(dropTravel[1] + feedPlan * 0.34) < 0.05,
      'the feed must travel exactly from its seat to the mouth')
    const shuntTravel = css.match(/@keyframes fl-shunt \{[\s\S]*?translate\((?!0px)([\d.]+)px, ([\d.]+)px\)/).slice(1).map(Number)
    const colPitch = waitCols[1] - waitCols[0]
    assert.ok(Math.abs(shuntTravel[0] - colPitch * 0.866) < 0.05 && Math.abs(shuntTravel[1] - colPitch * 0.34) < 0.05,
      'the shunt must travel exactly one bed column')
    // THE SWALLOW IS DRAWN, NOT IMPLIED - and only the GREEN pore is fed.
    // The sunk cell is a stained cell standing inside the bore, clipped to
    // the opening, appearing on the beat the feed cell fades at the rim and
    // descending to nothing. The red pore stands open and ringed but takes
    // no loop of its own: one line into the green mouth is the story, and a
    // second faller was a second thing to watch on one plate.
    assert.match(floor, /\.\.\.\(v === 'pass' \? \{ swallow: cell\(px, py, null, 5, -6\) \} : \{\}\)/)
    assert.match(floor, /clipPath id=\{bore\}/)
    assert.match(floor, /className=\{`fl-blk is-\$\{part\.stain\} fl-sunk`\}/)
    assert.match(css, /@keyframes fl-swallow \{/)
    assert.match(css, /\.fl-sunk \{ opacity: 0; \}/)
    // THE AMBER CELL LEAVES BY COURIER, AND ONLY BY COURIER. The lane
    // handoff that ran the far gate on a 4.8s loop of its own is gone -
    // the unsettled cell now leaves this plate one way: lifted off the bay
    // by the visiting courier and carried to Resolve in its haul drum,
    // once per round. Nothing crosses that seam while the courier is
    // elsewhere.
    assert.doesNotMatch(floor, /fl-handoff/, 'the self-running amber handoff was retired for the courier')
    assert.doesNotMatch(css, /fl-handoff/, 'the self-running amber handoff was retired for the courier')
    // The far gate itself stays the amber station: ITS pylons take the
    // stain - scoped to the far edge, because the entry gate on the same
    // plate carries unruled material and keeps the station's ink.
    assert.match(css, /\.fl-step\.is-screening \.fl-pylon-wall\.is-far \{ fill: var\(--hold\); \}/)
    assert.doesNotMatch(css, /\.fl-step\.is-screening \.fl-pylon-wall \{/)
    // THE BAY IS STILL STOCKED BY THE ORGANELLE. The amber cell FORMS in
    // the reticulum's pocket on the lane's own plan x - the vesicle trail
    // leaving the sacs already says this is how the organelle works -
    // swells to size, and slides down the printed lane to the bay:
    // dispatch drawn as secretion. One bud per round now, on the patrol's
    // own period, timed to land just before the pickup; its slide is still
    // exactly flank-to-bay, re-derived here against the lane's own length.
    assert.match(floor, /cell\(40, 18, 'hold', 5\), cls: 'fl-blk is-hold fl-bud'/)
    assert.match(css, /\.fl-bud \{\s*\n\s*opacity: 0;/)
    assert.equal(css.match(/animation: fl-bud ([\d.]+)s/)[1], css.match(/animation: fl-patrol ([\d.]+)s/)[1],
      'the bud must run the period of the round that takes it')
    const budSeat = floor.match(/cell\((\d+), (\d+), 'hold', 5\), cls: 'fl-blk is-hold fl-bud'/).slice(1).map(Number)
    const bayY = -16
    assert.match(floor, /call\(2, 40, -16\)/, 'the courier must call directly over the bay the bud slides into')
    const budRun = budSeat[1] - bayY
    const budTravel = css.match(/@keyframes fl-bud \{[\s\S]*?translate\(([\d.]+)px, (-[\d.]+)px\)/).slice(1).map(Number)
    assert.ok(Math.abs(budTravel[0] - budRun * 0.866) < 0.05 && Math.abs(budTravel[1] + budRun * 0.34) < 0.05,
      'the bud must slide exactly from the pocket to the bay')
    // A SWAP NEVER CROSSES ITS FADES. Two coincident cells mid-fade sum
    // below one and the seat blinks - so at every covered swap the incomer
    // reaches full opacity (invisible, over or under an identical opaque
    // twin) BEFORE the sitter starts to fade. Held to the keyframes' own
    // numbers: the feed is back before the shunt fades; the haul is opaque
    // over the bay before the bud fades; the lane's feed is up under the
    // haul before the haul fades.
    const fullBy = (name) => Number(css.match(new RegExp(`@keyframes ${name} \\{[\\s\\S]*?(\\d+)%, 100% \\{ transform: translate\\(0px, 0px\\)[^}]*opacity: 1`))[1])
    assert.ok(fullBy('fl-drop') <= Number(css.match(/@keyframes fl-shunt \{[\s\S]*?\d+%, (\d+)% \{ transform: translate\(19\.05px, 7\.48px\); opacity: 1/)[1]),
      'the feed must be fully back before the shunt fades under it')
    const haulUp = Number(css.match(/@keyframes fl-haul \{[\s\S]*?(\d+(?:\.\d+)?)%, [\d.]+% \{ opacity: 1/)[1])
    const budGone = Number(css.match(/@keyframes fl-bud \{[\s\S]*?(\d+(?:\.\d+)?)%, 100% \{ transform: translate\(29\.44px, -11\.56px\) scale\(1\); opacity: 0/)[1])
    assert.ok(haulUp <= budGone, 'the haul must be opaque over the bay before the bud fades under it')
    const feedUp = Number(css.match(/@keyframes fl-arrive \{[\s\S]*?(\d+(?:\.\d+)?)%, [\d.]+% \{ transform: translate\(0px, 0px\); opacity: 1/)[1])
    const haulGone = Number(css.match(/@keyframes fl-haul \{[\s\S]*?(\d+(?:\.\d+)?)%, 100% \{ opacity: 0/)[1])
    assert.ok(feedUp <= haulGone, 'the lane feed must be up under the haul before the haul fades')

    // THE ROW IS PLUMBED BY GATES, one handoff per seam. Evidence ships its
    // organised material out through its far gate and Screening's join cell
    // slides in through the entry gate on the same 5.6s period, gone at 62
    // before the join arrives at 84 - the same one-subject chain the amber
    // handoff runs into Resolve at 4.8s.
    assert.match(floor, /cls: 'fl-blk fl-ship'/)
    assert.match(floor, /cls: 'fl-blk fl-join'/)
    assert.match(css, /\.fl-ship \{ animation: fl-ship 5\.6s/)
    assert.match(css, /\.fl-join \{ animation: fl-join 5\.6s/)
    // EVIDENCE RUNS END TO END ON ONE CLOCK, AND THE OUTBOUND LEG IS ONE
    // ELEMENT. The claw keeps the shipment's 5.6s period, the pile cell
    // RISES with the claw before the carried cell takes over (a crossfade at
    // grip height inside the closed jaws, not a teleport) - and from the
    // release down, the subject is a single drawing: it appears in the first
    // socket at floor level, slides the printed lane to the staging seat,
    // dwells over the cycle seam, and continues straight out the gate. Two
    // elements used to hand over at the seat, and the shipment faded up
    // while the laid cell was still sliding in - the subject seen twice.
    // Both legs are re-derived from the seats' own numbers: sixteen units
    // socket-to-seat, twenty-eight socket-to-gone - the fade COMPLETES
    // INSIDE THE WALL, because a half-transparent puck over the page's
    // dot field is the one see-through this sheet forbids.
    assert.match(css, /\.fl-claw,\s*\n\.dgm-svg\.is-live \.fl-carry \{\s*\n\s*animation: fl-fetch 5\.6s/)
    assert.match(css, /@keyframes fl-picked \{\s*\n\s*0%, 22% \{ transform: translateY\(0px\); opacity: 1; \}\s*\n\s*30%, 33\.5% \{ transform: translateY\(-14px\); opacity: 1; \}/)
    assert.doesNotMatch(floor, /fl-lay[' ]/, 'the laid cell merged into the shipment')
    assert.doesNotMatch(css, /fl-laid|\.fl-lay[ ,{:]/, 'the laid cell merged into the shipment')
    const shipLegs = [...css.match(/@keyframes fl-ship \{([\s\S]*?)\n\}/)[1]
      .matchAll(/translate\(([\d.]+)px, (-[\d.]+)px\)/g)].map((m) => [Number(m[1]), Number(m[2])])
    const seatLeg = shipLegs[0]
    const goneLeg = shipLegs.reduce((a, b) => (b[0] > a[0] ? b : a))
    assert.ok(Math.abs(seatLeg[0] - 16 * 0.866) < 0.05 && Math.abs(seatLeg[1] + 16 * 0.34) < 0.05,
      'the shipment must open at the staging seat, sixteen units up the lane from its socket')
    assert.ok(Math.abs(goneLeg[0] - 28 * 0.866) < 0.05 && Math.abs(goneLeg[1] + 28 * 0.34) < 0.05,
      'the shipment must be gone by twenty-eight units, while the wall still backs the fade')
    // Protocol's transcript crosses BY COURIER. Issue and dock keep only
    // their in-plate legs - the slide to the export mouth, the fade-up at
    // the entry mouth and the slide to the apron - and both run the
    // patrol's own period, because the crossing between them IS the
    // courier's escort drum and happens exactly once per round. The
    // document still travels in the run's own vessel: a round cell wearing
    // the protocol's violet on both plates.
    assert.match(css, /\.fl-issue \{ animation: fl-issue 16.8s/)
    assert.match(css, /\.fl-dock \{ animation: fl-dock 16.8s/)
    assert.match(css, /\.fl-blk\.is-script \.dgm-face-top \{ fill: color-mix\(in srgb, var\(--governed\)/)
    assert.match(css, /\.fl-blk\.is-script \.fl-core \{ fill: var\(--governed\); \}/)
    assert.doesNotMatch(floor, /fl-script/)
    // The covered swap at each mouth: the escort is opaque over the issue
    // before the issue fades, and the dock is up under the escort before
    // the escort fades.
    const escortUp = Number(css.match(/@keyframes fl-escort \{[\s\S]*?(\d+(?:\.\d+)?)%, [\d.]+% \{ opacity: 1/)[1])
    const issueGone = Number(css.match(/@keyframes fl-issue \{[\s\S]*?(\d+(?:\.\d+)?)% \{ transform: translate\(6\.06px, -2\.38px\); opacity: 0/)[1])
    assert.ok(escortUp <= issueGone, 'the escort must be opaque over the issue before the issue fades')
    const dockUp = Number(css.match(/@keyframes fl-dock \{[\s\S]*?(\d+(?:\.\d+)?)%, [\d.]+% \{ transform: translate\(-7\.79px, -3\.06px\); opacity: 1/)[1])
    const escortGone = Number(css.match(/@keyframes fl-escort \{[\s\S]*?(\d+(?:\.\d+)?)%, 100% \{ opacity: 0/)[1])
    assert.ok(dockUp <= escortGone, 'the dock must be up at the mouth before the escort fades over it')
    // HANDLED CARGO DOES NOT BREATHE. A covered swap is only invisible if
    // the twins are pixel-coincident, and the settle's idle drift split
    // them by a hair at every handoff - so every cell that takes part in
    // one sits dead still.
    for (const held of ['fl-issue', 'fl-dock', 'fl-bud', 'fl-feed', 'fl-index', 'fl-pushed']) {
      assert.match(css, new RegExp(`\\.dgm-svg\\.is-live \\.${held} \\.fl-settle`), `${held} must not breathe under a swap`)
    }
    assert.match(css, /\.fl-pushed \.fl-settle \{ animation: none; \}/)
    const shipped = css.match(/@keyframes fl-ship \{([\s\S]*?)\n\}/)[1]
    assert.ok(Number(shipped.match(/(\d+)% \{ transform: translate\(24\.25px, -9\.52px\); opacity: 0/)[1]) <= 84,
      'the shipment has to be gone before the join arrives')
    // The verdict lives on the collar now - a machined ring around a quiet
    // bore, the way Trident's intake wears its own - not a bowl of paint.
    assert.match(floor, /className="fl-collar"/)
    for (const verdict of ['pass', 'fail']) {
      assert.match(css, new RegExp(`\\.fl-hole\\.is-${verdict} \\.fl-collar \\{ stroke: var\\(--${verdict}\\); \\}`))
    }
    // The lane's feed does not slide in through the back gate any more -
    // it is set down from the air by the courier, fading up beneath the
    // opaque haul at its own seat, then stepping with the line when the
    // index comes.
    assert.match(css, /@keyframes fl-arrive \{\s*\n\s*0%, [\d.]+% \{ transform: translate\(0px, 0px\); opacity: 0/)
    assert.match(css, /@keyframes fl-arrive \{[\s\S]*?translate\(20\.78px, 8\.16px\); opacity: 1/)
    // And Resolve is where one comes off the line, which IS the decision: it
    // arrives amber and a person takes it out of the run. THE PUSH IS
    // CONTACT-LOCKED: blade and cell share one travel, one easing and one
    // start frame, so no frame of the stroke has the blade inside the cell.
    assert.match(floor, /fl-blk is-hold fl-pushed/)
    assert.match(css, /@keyframes fl-shove \{/)
    const stroke = css.match(/@keyframes fl-stroke \{([\s\S]*?)\n\}/)[1]
    const shove = css.match(/@keyframes fl-shove \{([\s\S]*?)\n\}/)[1]
    const strokeOut = stroke.match(/([\d.]+)%[^{]*\{ transform: translate\((-[\d.]+)px, ([\d.]+)px\)/)
    const shoveOut = shove.match(/([\d.]+)% \{ transform: translate\((-[\d.]+)px, ([\d.]+)px\) translateY\(0px\)/)
    assert.equal(strokeOut[2], shoveOut[2], 'the cell and the blade travel as one or the blade phases through')
    assert.match(stroke, /0%, 54\.8%/)
    assert.match(shove, /0%, 54\.8%/)

    // NOTHING STANDS OFF ITS OWN PLATE. The plate is a plan rectangle with
    // ROUNDED corners, so a part can be inside the plan bounds and still leave
    // the surface once its own height lifts it.
    const [HX, HY, R] = [79.5, 53, 20]
    const inPlan = (x, y) => {
      const [ax, ay] = [Math.abs(x), Math.abs(y)]
      if (ax > HX || ay > HY) return false
      if (ax <= HX - R || ay <= HY - R) return true
      return (ax - (HX - R)) ** 2 + (ay - (HY - R)) ** 2 <= R * R + 0.01
    }
    const num = '(-?[\\d.]+)'
    const off = []
    for (const m of floor.matchAll(new RegExp(`(?<![A-Za-z])stand\\(${num}, ${num}, ${num}, ${num}, `, 'g'))) {
      const [px, py, hx, hy] = m.slice(1).map(Number)
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        if (!inPlan(px + sx * hx, py + sy * hy)) off.push(`stand at ${px},${py}`)
      }
    }
    for (const m of floor.matchAll(new RegExp(`(?<![A-Za-z])(?:drum|well)\\(${num}, ${num}, ${num}, `, 'g'))) {
      const [px, py, r] = m.slice(1).map(Number)
      for (let a = 0; a < 24; a += 1) {
        const t = (a / 24) * Math.PI * 2
        if (!inPlan(px + Math.cos(t) * r, py + Math.sin(t) * r)) off.push(`round part at ${px},${py}`)
      }
    }
    // AND THE POSITIONS THAT COME OUT OF A LOOP GET SWEPT BY HAND. The pass
    // above can only see numbers written at the call site, and three of the
    // five stations now place their parts from an array - the switch grid, the
    // pile, the throats. Those are exactly the parts most likely to run off an
    // edge, because nobody wrote their coordinates down one at a time.
    const corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    for (const px of cols) {
      for (const py of rows) {
        for (const [sx, sy] of corners) {
          if (!inPlan(px + sx * 5, py + sy * 5)) off.push(`switch at ${px},${py}`)
        }
      }
    }
    // A PILE IS CELLS STANDING ON OTHER CELLS. A flat scatter of eight is a
    // scatter; what makes a heap read as a heap is that some of it is on top of
    // the rest, which is the whole reason `cell` took a base.
    const pile = [...floor.match(/const pile = \[[\s\S]*?\n {6}\]/)[0]
      .matchAll(/\[(-?[\d.]+), (-?[\d.]+), (\d+), (\d+)\]/g)]
      .map((m) => m.slice(1).map(Number))
    assert.ok(pile.length >= 7, 'a pile of six cells is a row with gaps')
    assert.ok(pile.some(([, , , base]) => base > 0), 'nothing standing on anything else is a scatter, not a pile')
    for (const [px, py] of pile) {
      for (let a = 0; a < 24; a += 1) {
        const t = (a / 24) * Math.PI * 2
        if (!inPlan(px + Math.cos(t) * 7, py + Math.sin(t) * 7)) off.push(`pile cell at ${px},${py}`)
      }
    }
    for (const [px, py] of hole) {
      for (let a = 0; a < 24; a += 1) {
        const t = (a / 24) * Math.PI * 2
        if (!inPlan(px + Math.cos(t) * 14, py + Math.sin(t) * 14)) off.push(`throat at ${px},${py}`)
      }
    }
    assert.equal(off.length, 0, `off the plate: ${[...new Set(off)].slice(0, 4).join(', ')}`)

    // A PLAN RECTANGLE IS AS WIDE AS ITS PERIMETER, WHICHEVER WAY IT FACES:
    // 2(hx + hy) * ISO_X, always. Nothing may fall under the size at which a
    // solid stops reading as a solid.
    const X = 0.866
    const sized = [...floor.matchAll(/stand\((?:'[a-z]+', )?[^,]+, [^,]+, ([\d.]+), ([\d.]+), /g)]
      .map((m) => 2 * (Number(m[1]) + Number(m[2])) * X)
    const round = [...floor.matchAll(/(?<![A-Za-z])(?:drum|well)\([^,]+, [^,]+, ([\d.]+), /g)]
      .map((m) => 2 * Number(m[1]) * X * Math.SQRT2)
    assert.ok(sized.length >= 5 && round.length >= 4, 'the stations are solved, not drawn by hand')
    // And the cell itself, which most of the row is made of, is solved once in
    // its own helper rather than at every call site - a round body now, so its
    // projected width is 2r * ISO_X * sqrt2.
    const blk = floor.match(/\.\.\.drum\(px, py, ([\d.]+), high/)
    assert.ok(2 * Number(blk[1]) * X * Math.SQRT2 >= 17, 'a cell under seventeen pixels is a mark')
    assert.ok(Math.min(...sized, ...round) >= 17, `a ${Math.round(Math.min(...sized, ...round))}px part is a mark, not a thing`)

    // A HOLE ONLY READS AS ONE WHILE ITS FLOOR STILL SITS INSIDE ITS RIM.
    for (const [, r, deep] of floor.matchAll(/well\([^,]+, [^,]+, ([\d.]+), ([\d.]+)/g)) {
      assert.ok(Number(deep) < 2 * Number(r) * 0.34 * Math.SQRT2, `a bore of radius ${r} sunk ${deep} clears its own rim`)
    }
    // Every plate is printed before anything stands on it, in PLAN, inside the
    // projection - so a printed lane and the thing that runs down it are solved
    // from the same two numbers and cannot drift apart.
    assert.match(floor, /const FACE = planSpace\(seatX, seatY\)/)
    // One plan per station, all five at the same depth so the ink goes down
    // before anything stands in it. A station may print a SECOND face one
    // storey up - Protocol's bus rails belong on the bank rather than on the
    // plate the bank covers, and Replay's spokes belong on the reel - so this
    // counts the plate plans and not every printed group.
    assert.equal([...floor.matchAll(/printed\(-800, '/g)].length, 5, 'five stations, five printed plans')
    assert.match(floor, /plan: raise \? planSpace\(seatX, seatY - raise\) : FACE/)
    // Back to front, or a station is a pile rather than an object.
    assert.match(floor, /\.sort\(\(a, b\) => a\.depth - b\.depth\)/)
    assert.match(floor, /const OVER = 999/)
  })

  it('draws the material alive, inside a membrane', () => {
    // THE SHEET'S LAW, THIS PASS: STRUCTURE IS FACETED, LIFE IS ROUND.
    //
    // This is clinical research. The thing moving through the run is a
    // patient's own biology, so the unit of material is a CELL - a plan circle
    // carried through the projection, standing on its own wall, with a nucleus
    // printed off-centre on its top - and a verdict reaches it the way a stain
    // reaches a section: body first, nucleus deepest. The machines stay
    // faceted, because they are the site's structure. Only the subject is
    // round.
    assert.match(floor, /const cell = \(px, py, verdict, high = 5, base = 0, extra = \{\}\) =>/)
    assert.match(floor, /\.\.\.drum\(px, py, 7, high, base\)/)
    assert.match(floor, /const CORE = \{ dx: [\d.]+, dy: [\d.]+, \.\.\.planCircle\(2\.4\) \}/)
    assert.match(floor, /core: CORE/)
    assert.match(floor, /core=\{part\.core\}/)
    assert.match(css, /\.fl-core \{[\s\S]*?fill: color-mix\(in srgb, var\(--accent-strong\)/)
    for (const verdict of ['pass', 'hold', 'fail']) {
      assert.match(css, new RegExp(`\\.fl-blk\\.is-${verdict} \\.fl-core \\{ fill: var\\(--${verdict}\\); \\}`))
    }
    // The nucleus is an offset in PLAN carried through the projection, not a
    // nudge made by eye: plan (2.3, 0) lands at (2.3 * ISO_X, 2.3 * ISO_Y).
    const core = floor.match(/const CORE = \{ dx: ([\d.]+), dy: ([\d.]+)/)
    assert.ok(Math.abs(Number(core[1]) - 2.3 * ISO.ISO_X) < 0.01, 'the nucleus offset is not a plan offset')
    assert.ok(Math.abs(Number(core[2]) - 2.3 * ISO.ISO_Y) < 0.01, 'the nucleus offset is not a plan offset')

    // EVERY SURFACE THAT HOLDS THE MATERIAL CARRIES A MEMBRANE - the double
    // wall a section drawing gives a boundary, printed inside its edge. The
    // five plates each wear one. Trident's stack stands on a ground that wears
    // the site's own, with its proposal surfaces riding outside it, and its
    // intake pore wears the same line as a collar. Nectar's sites always had
    // their double wall; their ports carry the collar, and the records under
    // every sealed lid are drawn as what they are - cells, each with a
    // nucleus, the one population in either figure that is alive.
    assert.match(floor, /className="fl-membrane" transform=\{planSpace\(item\.seat\[0\], item\.seat\[1\]\)\}/)
    assert.match(css, /\.fl-bilayer \{[\s\S]*?stroke: color-mix\(in srgb, var\(--line\)/)
    assert.match(trident, /className="dgm-membrane"/)
    assert.match(trident, /className="dgm-membrane is-collar"/)
    assert.match(nectar, /className="dgm-membrane is-collar"/)
    assert.match(nectar, /className="dgm-recordcell"/)
    assert.match(nectar, /className="dgm-recordcore"/)
    assert.match(DGM_BLOCK, /\.dgm-membrane \{[\s\S]*?stroke: color-mix\(in srgb, var\(--accent\)/)
    assert.match(DGM_BLOCK, /\.dgm-recordcell \{ fill: color-mix/)

    // AND EVERY OPENING IS A DRAWN GATE. The membrane parts once, at
    // Resolve's exit, with terminal dots; the vessel walls part three times -
    // Screening's slot toward Resolve, Resolve's entry at the back of its
    // lane, Resolve's exit over its near edge - and each cut end is capped
    // and wears its pylon. Every gap clears the cell that crosses it by a
    // cell radius, and every gap sits on the straight run of its edge, where
    // the construction can cap it.
    assert.match(floor, /const WALL_GAP = \[14, 42\]/)
    const gap = floor.match(/const WALL_GAP = \[(\d+), (\d+)\]/).slice(1).map(Number)
    const pitch = Number(floor.match(/const PITCH = (\d+)/)[1])
    const station = -44 + 3 * pitch // at(3), where fl-shove carries the cell over the edge
    assert.ok(gap[0] <= station - 7 && gap[1] >= station + 7,
      `an opening of ${gap} does not clear the cell that leaves through it at ${station}`)
    assert.match(floor, /item\.key === 'resolve' \? \(/)
    assert.match(css, /\.fl-cut \{ fill: color-mix/)
    assert.equal((floor.match(/wallPath\(WALL_/g) || []).length, 2, 'two membrane lines part, and nothing else does')
    const gates = floor.match(/const GATES = \{\s*\n\s*protocol: \{ far: \[(\d+), (\d+)\] \},\s*\n\s*evidence: \{ back: \[(\d+), (\d+)\], far: \[(-?\d+), (-?\d+)\] \},\s*\n\s*screening: \{ back: \[(-?\d+), (-?\d+)\], far: \[(-?\d+), (-?\d+)\] \},\s*\n\s*resolve: \{ back: \[(-?\d+), (-?\d+)\], front: \[(\d+), (\d+)\] \},/)
      .slice(1).map(Number)
    // Protocol's far gate clears the transcript it issues, and Evidence's
    // entry gate clears where the transcript docks; Evidence's far gate
    // clears the shipping cell, and Screening's entry gate clears the join
    // cell's own bed row.
    // A gate also has to be SEEN: Evidence's used to sit exactly in the
    // screen shadow of the right gantry post, and Protocol's crowded its own
    // corner arc - both live in clear ground now, and both clear their cargo.
    // The transcript crosses as a violet cell in the run's own vessel, so
    // the cargo clearance it needs is the cell radius like everything else.
    assert.match(floor, /cell\(42, -39, null, 5\), cls: 'fl-blk is-script fl-issue'/)
    assert.match(floor, /cell\(-65, 18, null, 5\), cls: 'fl-blk is-script fl-dock'/)
    assert.ok(gates[0] <= 42 - 7 && gates[1] >= 42 + 7, 'the export gate has to clear the transcript lane')
    assert.ok(gates[2] <= 18 - 7 && gates[3] >= 18 + 7, 'the dock gate has to clear where the transcript rests')
    const shipSeat = floor.match(/cell\(slot\[0\]\[0\], slot\[0\]\[1\], null, 5\), cls: 'fl-blk fl-ship'/)
    assert.ok(shipSeat, 'the shipment starts in a real socket')
    assert.ok(gates[4] <= 4 - 7 && gates[5] >= 4 + 7, 'the far gate has to clear the shipment lane')
    // AND A GATE CLEARS ITS CARGO'S DRAWN SILHOUETTE, NOT ITS PLAN RADIUS.
    // A plan circle of radius r projects to an ellipse rx = r * sqrt(2) *
    // ISO_X, while a gap of span s opens s * ISO_X of screen: an
    // eighteen-unit gap is narrower than the seventeen-pixel cell crossing
    // it, and the overhang painted slivers of every traveller over both
    // jambs - cargo showing THROUGH the wall. Derived from the same radius
    // the cells are built with, plus a pixel of daylight a side.
    const cellFace = 7 * Math.SQRT2 * 0.866
    for (const [lo, hi] of [[gates[0], gates[1]], [gates[2], gates[3]], [gates[4], gates[5]],
      [gates[6], gates[7]], [gates[8], gates[9]], [gates[10], gates[11]]]) {
      assert.ok(((hi - lo) / 2) * 0.866 >= cellFace + 1,
        `a ${hi - lo}-unit gate is narrower than the cell that crosses it`)
    }
    // AND ONLY THE VIEWER-FACING CUT IS DRAWN. A cut face's normal points
    // into its gap; on every edge one flank faces the viewer and one faces
    // away, and painting the away-facing one breaks the projection at the
    // exact place a gate asks to be looked at. The pylon terminates the
    // unlit flank instead.
    assert.match(floor, /const mouth = \(oPt, nPt, edge, lit\) =>/)
    assert.match(floor, /if \(lit\) \{\s*\n\s*parts\.push\(\{ d: `M \$\{at\(oPt, h\)\}/)
    assert.equal((floor.match(/'far', true\]/g) || []).length, 1, 'a far gate lights its low-x flank')
    assert.equal((floor.match(/'back', true\]/g) || []).length, 1, 'a back gate lights its low-y flank')
    // AND THE JAMBS SORT BY THEIR OWN GEOMETRY, not by the half that owns
    // their wall. Cargo crosses BETWEEN a gate's two posts, so the far jamb
    // - the lit face and its pylon - is painted before the plate's contents
    // and the near jamb's pylon after them: one post behind the crossing
    // cell and one in front of it, which is what passing through an opening
    // looks like. The lit flag is the same normal argument, so it is the
    // sort key.
    assert.match(floor, /\[\.\.\.backCuts, \.\.\.frontCuts\]\.forEach\(/)
    assert.match(floor, /\(lit \? back : front\)\.push\(\.\.\.mouth\(oPt, nPt, edge, lit\)\)/)
    // And nothing rides at OVER to cross a wall any more - a traveller drawn
    // over the whole plate paints over the near pylon it should pass behind,
    // and over material resting nearer the viewer than its own seat.
    for (const rider of ['fl-issue', 'fl-ship']) {
      assert.doesNotMatch(floor, new RegExp(`${rider}', depth: OVER`), `${rider} must cross its gate at its seat's own depth`)
    }
    const joinRow = 2
    assert.ok(gates[6] <= joinRow - 7 && gates[7] >= joinRow + 7, 'the entry gate has to clear the bed row it feeds')
    const holdSeat = [...floor.match(/^ +const hole = (\[.*\])$/m)[1].matchAll(/\[(-?\d+), (-?\d+), '(\w+)'\]/g)]
      .map((m) => [Number(m[1]), Number(m[2]), m[3]]).find(([, , v]) => v === 'hold')
    assert.ok(gates[8] <= holdSeat[0] - 7 && gates[9] >= holdSeat[0] + 7,
      'the slot has to clear the amber cell that leaves through it')
    const lane = Number(floor.match(/const lane = (\d+)/)[1])
    assert.ok(gates[10] <= lane - 7 && gates[11] >= lane + 7,
      'the entry gate has to clear the lane it feeds')
    assert.deepEqual([gates[12], gates[13]], gap, 'the exit wall gap brackets the membrane gap on the same lane')
    // And every gap sits on the straight run of its own edge, where the
    // construction can cap it: |x| within hx - r on the long edges, |y|
    // within hy - r on the short ones.
    const dish = floor.match(/const DISH = \{ hx: ([\d.]+), hy: ([\d.]+), r: (\d+), t: (\d+)/).slice(1).map(Number)
    const runX = dish[0] - dish[2]
    const runY = dish[1] - dish[2]
    for (const [lo, hi] of [[gates[0], gates[1]], [gates[4], gates[5]], [gates[8], gates[9]], [gates[12], gates[13]]]) {
      assert.ok(lo >= -runX && hi <= runX, 'a long-edge gate must sit on the straight run')
    }
    for (const [lo, hi] of [[gates[2], gates[3]], [gates[6], gates[7]], [gates[10], gates[11]]]) {
      assert.ok(lo >= -runY && hi <= runY, 'a short-edge gate must sit on the straight run')
    }

    // AND THE GATE'S TRAFFIC CLEARS THE MACHINE'S FEET ON SCREEN, IN
    // NUMBERS. The right gantry tower has stood in front of this gate
    // twice: once on the shipping lane itself, and once just past it in
    // plan - where its twenty-six-unit box still rose across the gate
    // mouth on screen, and the outbound shipment, sliding through plan
    // ground BEHIND the tower, painted in front of it, because a mover's
    // honest seat depth cannot follow it behind a post's early paint slot.
    // Plan clearance is not screen clearance. So the towers answer where
    // the reader looks: each tower's screen-x interval must clear the
    // whole span of the far gate's traffic - from the low pylon's outer
    // edge to the greater of the high pylon's outer edge and the farthest
    // silhouette edge the shipment reaches before it is gone. AND THE
    // DAYLIGHT IS A WIDTH, NOT A LINE: at four units of gap the mouth
    // still read walled off beside a twenty-six-unit pillar, so the
    // clearance is a full cell silhouette radius - a puck of open wall
    // between the pillar and anything that crosses.
    const IXg = 0.866
    const towers = [...floor.matchAll(/stand\((-?[\d.]+), (-?[\d.]+), ([\d.]+), ([\d.]+), [\d.]+, [\d.]+\), cls: 'fl-rig is-tower'/g)]
      .map((m) => m.slice(1).map(Number))
    assert.equal(towers.length, 2, 'the runway stands on two towers')
    const pylonY = dish[1] - dish[3] / 2
    const pylonRx = 3.4 * Math.SQRT2 * IXg
    const gateLo = (gates[4] + pylonY) * IXg - pylonRx
    const gateHi = (gates[5] + pylonY) * IXg + pylonRx
    const shipHome = floor.match(/const slot = \[(-?\d+), -?\d+\]\.flatMap\(\(py\) => \[(-?\d+), /).slice(1).map(Number)
    const shipSlide = Math.max(...[...css.match(/@keyframes fl-ship \{([\s\S]*?)\n\}/)[1]
      .matchAll(/translate\((-?[\d.]+)px/g)].map((m) => Number(m[1])))
    const shipEdge = (shipHome[1] - shipHome[0]) * IXg + shipSlide + 7 * Math.SQRT2 * IXg
    const traffic = [gateLo, Math.max(gateHi, shipEdge)]
    const daylight = 7 * Math.SQRT2 * IXg
    for (const [tcx, tcy, thx, thy] of towers) {
      const span = [(tcx - thx - (tcy + thy)) * IXg, (tcx + thx - (tcy - thy)) * IXg]
      assert.ok(span[1] < traffic[0] - daylight || span[0] > traffic[1] + daylight,
        `a tower over [${span.map((v) => v.toFixed(2))}] crowds the gate's traffic [${traffic.map((v) => v.toFixed(2))}]`)
    }
    // And the runway spans tower to tower - lengthening the reach moves
    // the rail with it, so the towers cannot outrun their own span.
    const rail = floor.match(/stand\((-?[\d.]+), -38, ([\d.]+), [\d.]+, [\d.]+, [\d.]+, [\d.]+\), cls: 'fl-rig is-rail'/).slice(1).map(Number)
    assert.equal(rail[0] - rail[1], Math.min(towers[0][0], towers[1][0]), 'the runway starts on the left tower')
    assert.equal(rail[0] + rail[1], Math.max(towers[0][0], towers[1][0]), 'the runway ends on the right tower')

    // The membrane is context, not content: fainter than the plan the machine
    // stands in, and never animated - a wall does not run.
    const wallInk = Number(css.match(/\.fl-bilayer \{[\s\S]*?stroke: color-mix\(in srgb, var\(--line\) (\d+)%/)[1])
    const planInk = Number(css.match(/\.fl-plan \{[\s\S]*?stroke: color-mix\(in srgb, var\(--line\) (\d+)%/)[1])
    assert.ok(wallInk <= planInk, `a wall at ${wallInk}% over a plan at ${planInk}% is a wall shouting`)
    assert.doesNotMatch(css, /fl-bilayer[\s\S]{0,200}?animation:/)

    // AND THE WALL IS A BODY, NOT A LINE. Every plate is a walled vessel: a
    // rounded plan rectangle extruded up the screen, split at its own side
    // corners into the half that goes down before the machine (the inner far
    // face and far rim band) and the half that goes down after it (the outer
    // near skirt and near rim band). The split points are shared coordinates,
    // so the seam is not a mark. Resolve's wall opens over the same lane its
    // membrane does, and each cut end is capped and wears its pylon.
    assert.match(floor, /const DISH = \{ hx: [\d.]+, hy: [\d.]+, r: \d+, t: \d+, h: \d+ \}/)
    assert.match(floor, /dish: vessel\(seat, GATES\[step\.key\] \?\? null\)/)
    assert.match(floor, /<g className="fl-vessel is-back">/)
    assert.match(floor, /<g className="fl-vessel is-front">/)
    for (const part of ['fl-vessel-band', 'fl-vessel-in', 'fl-vessel-out', 'fl-vessel-edge', 'fl-vessel-cut', 'fl-pylon-wall', 'fl-pylon-cap']) {
      assert.match(floor, new RegExp(part), `the vessel needs its ${part}`)
      assert.match(css, new RegExp(`\\.${part}[ ,.{:]`), `${part} has to be dressed`)
    }
    // The wall arrives whole with the plate it stands on - there is no
    // entrance left for it to fade in through.
    assert.doesNotMatch(css, /\.fl-vessel\.is-front \{ opacity/)

    // THE ORGANELLES ARE THE BODIES OF THE MACHINES NOW. The switch bank is
    // the nucleus - an oval platform wearing its printed double envelope,
    // four pores on the rim, and one chromatin thread strung through all
    // twelve criteria in reading order, because a protocol is one document.
    // The sorter grows its Golgi stack; the ram's body is a drum; the reels
    // print coils, not spokes, because what winds onto a reel of biology is
    // a strand.
    assert.match(floor, /\.\.\.stand\(0, 0, 44, 36, 3, 26\), cls: 'fl-board'/)
    assert.match(floor, /className="fl-thread"/)
    assert.match(floor, /className="fl-porering"/)
    // THE SORTING BODY IS DRAWN IN THE ROUGH ER'S LANGUAGE: at least three
    // nested curved lamellae - thin arc-stroke sacs of one constant plan
    // width, sharing one centre, wrapping the pocket the amber cell forms
    // in, with daylight between them (the cisternal space) and the mouth
    // open toward the gate. The nesting is depth-honest by construction:
    // every band splits at one angle into a far arc painted behind the
    // bud's seat and a near arc painted in front of it, so the forming
    // cell sits inside every sac that wraps it. All derived from the data
    // the body is built from.
    const rer = floor.match(/const RER = \{ cx: ([\d.]+), cy: ([\d.]+), lift: ([\d.]+) \}/).slice(1).map(Number)
    const bands = [...floor.match(/const lam = \[[\s\S]*?\n\s*\]/)[0].matchAll(/\[([\d.]+), ([\d.]+), (-?\d+), (-?\d+)\]/g)]
      .map((m) => m.slice(1).map(Number)).sort((a, b) => a[0] - b[0])
    assert.ok(bands.length >= 3, 'a reticulum is at least three nested lamellae')
    const bud = floor.match(/cell\((\d+), (\d+), 'hold', 5\), cls: 'fl-blk is-hold fl-bud'/).slice(1).map(Number)
    for (const [r, w, a0, a1] of bands) {
      assert.ok(w <= r / 3, 'a lamella is a ribbon, not a disc')
      assert.ok(a0 > -75 && a0 < 0 && a1 > 180 && a1 < 250,
        'every sac wraps the pocket and leaves the mouth open toward the gate')
    }
    for (let i = 1; i < bands.length; i += 1) {
      assert.ok(bands[i][0] - bands[i][1] / 2 - (bands[i - 1][0] + bands[i - 1][1] / 2) >= 0.8,
        'nested with daylight between - the cisternal space is part of the drawing')
    }
    assert.ok(Math.hypot(bud[0] - rer[0], bud[1] - rer[1]) + 7 <= bands[0][0] - bands[0][1] / 2,
      'the cell must form inside the innermost sac')
    assert.match(floor, /\[\[a0, 120, RER\.cx \+ RER\.cy \+ r\], \[120, a1, RER\.cx \+ RER\.cy - r\]\]/)
    assert.ok(bud[0] + bud[1] > rer[0] + rer[1] - bands[0][0] && bud[0] + bud[1] < rer[0] + rer[1] + bands[0][0],
      'the bud must nest between every far arc and every near arc')
    const dish2 = floor.match(/const DISH = \{ hx: [\d.]+, hy: ([\d.]+), r: \d+, t: (\d+)/).slice(1).map(Number)
    assert.ok(rer[1] + bands[bands.length - 1][0] + bands[bands.length - 1][1] / 2 <= dish2[0] - dish2[1] - 2,
      'the body keeps clear of the vessel wall, like the pores do')
    // The pen must NOT be non-scaling: the plan matrix squashing the stroke
    // is exactly what makes it the projected band of a flat curved sac.
    assert.match(css, /\.fl-rer path \{[\s\S]*?vector-effect: none;/)
    for (const piece of ['is-under', 'is-sac', 'is-grit']) {
      assert.match(floor, new RegExp(`'fl-rer ${piece}'`), `the reticulum needs its ${piece}`)
    }
    assert.doesNotMatch(floor, /fl-golgi/)
    assert.doesNotMatch(css, /fl-golgi/)
    assert.ok((floor.match(/className="fl-ruled" key="v\d"/g) || []).length >= 3,
      'the vesicle trail says the body dispatches')
    assert.match(floor, /\.\.\.drum\(28, -34, 7, 7\), cls: 'fl-ram is-body'/)
    assert.match(floor, /className="fl-coil"/)
    assert.doesNotMatch(floor, /const spoke = /)
    // Trident's catchment is a walled basin and Nectar's junction is the
    // centrosome - same organising move on both boards, geometry unchanged:
    // the taps stop on the same four points a circle of JUNCTION_HALF passes
    // through.
    assert.match(trident, /const BASIN = /)
    assert.match(trident, /className="dgm-basin"/)
    assert.match(DGM_BLOCK, /\.dgm-basin-band \{/)
    assert.match(nectar, /className="dgm-junction"\s*\n\s*cx="0"/)
    assert.match(nectar, /className="dgm-aster"/)
    assert.match(nectar, /className="dgm-districtfill"/)
  })

  it('gives each station its own ink, and couples the row into one run', () => {
    // FIVE HUES, AND THE REASON TRIDENT CANNOT HAVE THEM IS THE REASON THIS CAN.
    //
    // That figure tried exactly this - violet for the machine tier, blue for the
    // contract, amber for the one holding, green for the one that had committed
    // - and threw it out, because four saturated hues STACKED OVER ONE PLAN read
    // as four unrelated objects: the warm two sat forward of the cool two and
    // the middle of the stack bowed out of the page.
    //
    // None of that transfers to a ROW. These five are not one instrument seen in
    // section, they are five stations side by side on one datum, and the whole
    // argument of the section is that they are different steps. There is no
    // depth axis for a warm hue to advance along and nothing is stacked over
    // anything. What failed as a stack is right as a bench.
    for (const step of ['protocol', 'evidence', 'screening', 'resolve', 'replay']) {
      assert.match(css, new RegExp(`\\.fl-step\\.is-${step} \\{ --tone:`), `${step} works in its own ink`)
    }
    // Each one comes out of the product's own state palette, in the order the
    // run passes through it, and every one is built on the house blue.
    const tones = [...css.matchAll(/\.fl-step\.is-[a-z]+ \{ --tone: ([^;]+);/g)].map((m) => m[1])
    assert.equal(tones.length, 5)
    assert.equal(new Set(tones).size, 5, 'five stations, five inks')
    for (const tone of tones) {
      assert.ok(/var\(--(accent|accent-strong|governed|warning|danger|success)\)/.test(tone),
        `${tone} is not in the product's palette`)
    }
    // HOW FAR EACH IS MIXED BACK INTO THE BLUE IS NOT ONE NUMBER. Violet and
    // green are the blue's NEIGHBOURS, so mixing them through it deepens them.
    // Amber and crimson are its COMPLEMENTS, and mixing a complement through a
    // colour cancels it rather than tying it to anything - at sixty per cent the
    // amber came out as mud and the crimson as mauve.
    const pull = (name) => Number(css.match(new RegExp(`\\.fl-step\\.is-${name} \\{ --tone: color-mix\\(in srgb, var\\(--[a-z]+\\) (\\d+)%`))[1])
    assert.ok(pull('screening') > pull('protocol'), 'a complement mixed as far as a neighbour is mud')
    assert.ok(pull('resolve') > pull('protocol'), 'a complement mixed as far as a neighbour is mud')
    // The paper, the line work, the lettering and the shadow stay neutral: the
    // sheet's own tokens cannot be written in terms of a variable that only
    // exists on a step inside it, which is what collapsed the whole line system
    // to unset the first time this was tried.
    const tokens = css.match(/\.dgm-svg\.is-floor \{[\s\S]*?\n\}/)[0]
    assert.doesNotMatch(tokens, /var\(--tone\)|var\(--deep\)/)
    assert.match(css, /--line: color-mix\(in srgb, var\(--text\) 72%, var\(--accent-strong\)\)/)
    assert.match(css, /\.fl-plate \.dgm-face-left \{ fill: color-mix\(in srgb, var\(--accent\)/)
    // And a lit cap has to beat its own body. At full tone against a body drawn
    // at more than half the same tone the two sat a step apart, which is enough
    // for a cool hue and not for a warm one.
    assert.match(css, /\.fl-blk \.dgm-face-top \{ fill: color-mix\(in srgb, var\(--accent\)/)

    // FIVE PLATES IN A ROW ARE NOT A RUN, THEY ARE FIVE ISLANDS. Nothing said
    // the output of one station was the input of the next; the datum underneath
    // was doing all the work of saying so on its own.
    // AND THE PLATES ARE NOT WIRED TOGETHER. A coupling stood in each of the
    // two plan corners where a plate came nearest its neighbours, with a
    // hairline run passing between them, on the argument that five plates in a
    // row are five islands. The argument was right and the answer was wrong:
    // four thin lines crossing the empty gaps and ten small blocks doing
    // nothing on ten corners is a diagram of a connection rather than a
    // connection. The datum already says these five are one run, with one line
    // instead of fourteen marks.
    assert.doesNotMatch(floor, /fl-couple|fl-link|LINK_X/)
    assert.doesNotMatch(css, /fl-couple|fl-link/)

    // THE HALF-PIXEL EVERY SOLID MOVES. Trident runs a second, quieter layer
    // under everything else - nineteen contract fields and four waiting
    // proposals settling on their own long clocks, half a pixel at a time - and
    // it is most of why that figure reads as a system that happens to be drawn
    // rather than as a drawing that happens to loop. This one had nothing like
    // it: every solid was either working or perfectly still.
    assert.match(css, /\.dgm-svg\.is-live \.fl-settle \{[\s\S]*?animation: fl-breathe calc\(11s/)
    assert.match(css, /@keyframes fl-breathe \{\s*to \{ transform: translateY\(-0\.7px\); \}/)
    // It sits on an INNER group, so it composes with whatever the part is
    // already doing: a die can be falling and settling at once.
    // The settle wraps the solid directly now: the core it used to sit inside
    // went with the plate that had one.
    assert.match(floor, /<g className="fl-settle">\s*\{part\.round \?/)
    assert.match(floor, /\.map\(\(part, index\) => \(\{ \.\.\.part, life: jitter\(index, 23\) \}\)\)/)
    // And EVERY clock in the figure waits on the section's power: with the
    // entrance gone, `is-live` is the one gate left, and nothing on the
    // sheet may run without it - a machine animating off screen is heat, and
    // a clock that starts before the shared class flip breaks the seam
    // phase-lock the handoffs depend on.
    for (const [, selector, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/animation: fl-/.test(body)) continue
      assert.match(selector.trim(), /\.dgm-svg\.is-live[ .]/,
        `"${selector.trim().slice(0, 60)}" runs a floor clock without the is-live gate`)
    }
  })

  it('paints every screen overlap in true depth order, permanently', () => {
    // THE PERSPECTIVE LAW. Hand-set depths kept springing leaks: every
    // pass that moved a post or added a rail found a new pair of solids
    // overlapping on screen in the wrong order. So the suite now rebuilds
    // every station's solids from the source - the literal stand/drum/cell
    // calls and the mapped grids - projects each one to its screen box,
    // and requires that every pair which overlaps on screen is either
    // painted back-to-front by the plan's own diagonal (judged over the
    // overlap window, so a long rail is measured where it actually meets
    // the other part) or belongs to one rigid assembly whose joinery is
    // deliberate. A future part that would read wrong fails here before
    // anyone sees it.
    const IX = 0.866
    const IY = 0.34
    const grab = (name, next) => {
      const a = floor.indexOf(`${name}: () => {`)
      const b = next ? floor.indexOf(`${next}: () => {`) : floor.indexOf('// Back to front, or a mechanism')
      assert.ok(a > -1 && b > a, `cannot find the ${name} builder`)
      return floor.slice(a, b)
    }
    const blocks = {
      protocol: grab('protocol', 'evidence'),
      evidence: grab('evidence', 'screening'),
      screening: grab('screening', 'resolve'),
      resolve: grab('resolve', 'replay'),
      replay: grab('replay', null),
    }
    const depthVal = (txt) => {
      if (!txt) return null
      const over = txt.match(/OVER\s*([-+])\s*(\d+)/)
      if (over) return 999 + (over[1] === '-' ? -1 : 1) * Number(over[2])
      if (/^OVER$/.test(txt.trim())) return 999
      const n = Number(txt.trim())
      return Number.isFinite(n) ? n : null
    }
    const solid = (order, kind, px, py, hx, hy, high, base, cls, depth, r = 0) => ({
      order, kind, px, py, cls,
      x0: px - hx, x1: px + hx, y0: py - hy, y1: py + hy,
      base, high, r: Math.min(r, hx, hy),
      depth: depth ?? px + py,
    })
    const parseStation = (name) => {
      const src = blocks[name]
      const parts = []
      // Every literal one-liner solid, with its cls and any depth override.
      for (const m of src.matchAll(/\{ \.\.\.(stand|drum|cell)\(([^)]*)\), cls: '([^']*)'(?:, depth: ([^,}]+?))? \}/g)) {
        const args = m[2].split(',').map((s) => Number(s.trim()))
        const [a, b, c, d, e, f, g] = args
        if (!Number.isFinite(a) || !Number.isFinite(b)) continue
        if (m[1] === 'stand') {
          parts.push(solid(m.index, 'stand', a, b, c, d, e, Number.isFinite(g) ? g : 0, m[3], depthVal(m[4]), Number.isFinite(f) ? f : 0))
        } else if (m[1] === 'drum') {
          parts.push(solid(m.index, 'drum', a, b, c, c, d, Number.isFinite(e) ? e : 0, m[3], depthVal(m[4]), c))
        } else {
          const high = Number.isFinite(d) ? d : 5
          parts.push(solid(m.index, 'cell', a, b, 7, 7, high, Number.isFinite(e) ? e : 0, m[3], depthVal(m[4]), 7))
        }
      }
      // The mapped grids, expanded from their own literal arrays.
      if (name === 'protocol') {
        const cols = floor.match(/const cols = \[(-?\d+), (-?\d+), (-?\d+), (-?\d+)\]/).slice(1, 5).map(Number)
        const rows = floor.match(/const rows = \[(-?\d+), (-?\d+), (-?\d+)\]/).slice(1, 4).map(Number)
        const at = src.indexOf('...bank.flatMap')
        rows.forEach((py) => cols.forEach((px) => parts.push(solid(at, 'stand', px, py, 5, 5, 5, 3, 'fl-seat', null, 4.5))))
      }
      if (name === 'evidence') {
        const pileTxt = src.match(/const pile = (\[[\s\S]*?\])\n/)[1]
        const pile = new Function(`return ${pileTxt}`)()
        const at = src.indexOf('const pile')
        pile.forEach(([px, py, high, base]) => parts.push(solid(at, 'cell', px, py, 7, 7, high, base, 'fl-blk', null, 7)))
        const slotM = src.match(/const slot = \[(-?\d+), (-?\d+)\]\.flatMap\(\(py\) => \[(-?\d+), (-?\d+), (-?\d+)\]/)
        const pys = [Number(slotM[1]), Number(slotM[2])]
        const pxs = [Number(slotM[3]), Number(slotM[4]), Number(slotM[5])]
        const slots = pys.flatMap((py) => pxs.map((px) => [px, py])).slice(1)
        const sAt = src.indexOf('...slot.slice(1)')
        slots.forEach(([px, py]) => parts.push(solid(sAt, 'cell', px, py, 7, 7, 5, 0, 'fl-blk', null, 7)))
      }
      if (name === 'screening') {
        const waitM = src.match(/const wait = \[(-?\d+), (-?\d+)\]\.flatMap\(\(py\) => \[(-?\d+), (-?\d+), (-?\d+)\]/)
        const pys = [Number(waitM[1]), Number(waitM[2])]
        const pxs = [Number(waitM[3]), Number(waitM[4]), Number(waitM[5])]
        const seats = pys.flatMap((py) => pxs.map((px) => [px, py])).slice(2)
        const at = src.indexOf('...wait.slice(2)')
        seats.forEach(([px, py]) => parts.push(solid(at, 'cell', px, py, 7, 7, 5, 0, 'fl-blk', null, 7)))
      }
      if (name === 'resolve') {
        const pitch = Number(floor.match(/const PITCH = (\d+)/)[1])
        const lane = Number(src.match(/const lane = (-?\d+)/)[1])
        const at = src.indexOf('...[0, 1, 2].map')
        ;[0, 1, 2].forEach((i) => parts.push(solid(at, 'cell', -44 + i * pitch, lane, 7, 7, 5, 0, 'fl-blk is-hold fl-index', null, 7)))
        const fAt = src.indexOf('cell(at(0) - PITCH')
        if (fAt > -1) parts.push(solid(fAt, 'cell', -44 - pitch, lane, 7, 7, 5, 0, 'fl-blk is-hold fl-feed', null, 7))
      }
      if (name === 'replay') {
        const at = floor.match(/const at = \[(-?\d+), (-?\d+), (-?\d+), (-?\d+), (-?\d+), (-?\d+), (-?\d+)\]/).slice(1, 8).map(Number)
        const fAt = src.indexOf('...at.map((px, i)')
        at.forEach((px) => parts.push(solid(fAt, 'stand', px, 2, 4, 7, 5, 2, 'fl-blk fl-frame', null, 3.5)))
      }
      return parts
    }
    const minimum = { protocol: 13, evidence: 18, screening: 5, resolve: 8, replay: 10 }
    const family = (cls) => {
      if (/fl-rig|fl-gant|fl-claw|fl-carry/.test(cls)) return 'gantry'
      if (/fl-ram|fl-pivot/.test(cls)) return 'ram'
      if (/fl-tape|fl-reel|fl-head/.test(cls)) return 'transport'
      if (/fl-board|fl-seat/.test(cls)) return 'board'
      if (/fl-blk/.test(cls)) return 'cell'
      return cls
    }
    const box = (p) => ({
      sx0: (p.x0 - p.y1) * IX,
      sx1: (p.x1 - p.y0) * IX,
      sy0: 178 + (p.x0 + p.y0) * IY - p.base - p.high - 3,
      sy1: 178 + (p.x1 + p.y1) * IY + 3,
    })
    const offenders = []
    for (const name of Object.keys(blocks)) {
      const parts = parseStation(name)
      assert.ok(parts.length >= minimum[name], `${name} parsed only ${parts.length} solids - the perspective law lost sight of the plate`)
      const painted = parts.map((p, i) => ({ ...p, tie: i })).sort((a, b) => (a.depth - b.depth) || (a.tie - b.tie))
      for (let i = 0; i < painted.length; i += 1) {
        for (let j = i + 1; j < painted.length; j += 1) {
          const A = painted[i]
          const B = painted[j]
          if (A.depth >= 900 || B.depth >= 900) continue
          if (family(A.cls) === family(B.cls)) continue
          const a = box(A)
          const b = box(B)
          const ox0 = Math.max(a.sx0, b.sx0)
          const ox1 = Math.min(a.sx1, b.sx1)
          const oy = Math.min(a.sy1, b.sy1) - Math.max(a.sy0, b.sy0)
          if (ox1 - ox0 < 1.5 || oy < 1.5) continue
          // A is painted first. Judge the pair by PLAN geometry:
          const px0 = Math.max(A.x0, B.x0)
          const px1 = Math.min(A.x1, B.x1)
          const py0 = Math.max(A.y0, B.y0)
          const py1 = Math.min(A.y1, B.y1)
          const planApart = px1 - px0 <= 0.6 || py1 - py0 <= 0.6
          // A footprint pocket that only exists inside someone's rounded
          // corner is empty ground: the rects meet where the part is not.
          const cornerVoid = [A, B].some((P) => P.r > 1 && [
            [P.x1 - P.r, P.y1 - P.r, 1, 1], [P.x0 + P.r, P.y1 - P.r, -1, 1],
            [P.x1 - P.r, P.y0 + P.r, 1, -1], [P.x0 + P.r, P.y0 + P.r, -1, -1],
          ].some(([cx, cy, sx, sy]) => {
            const inQx = sx > 0 ? px0 >= cx - 0.01 : px1 <= cx + 0.01
            const inQy = sy > 0 ? py0 >= cy - 0.01 : py1 <= cy + 0.01
            if (!inQx || !inQy) return false
            const nx = Math.min(Math.abs(px0 - cx), Math.abs(px1 - cx))
            const ny = Math.min(Math.abs(py0 - cy), Math.abs(py1 - cy))
            return Math.hypot(nx, ny) >= P.r - 0.5
          }))
          if (planApart || cornerVoid) {
            // Disjoint footprints: the farther one must have gone down
            // first. Farther is smaller y or smaller x - both push a part
            // up-screen and behind in this projection.
            if (A.y1 <= B.y0 + 0.6 || A.x1 <= B.x0 + 0.6) continue
            if (B.y1 <= A.y0 + 0.6 || B.x1 <= A.x0 + 0.6) {
              offenders.push(`${name}: '${A.cls}' (${A.px},${A.py}) paints under '${B.cls}' (${B.px},${B.py}) yet stands nearer than it`)
            }
            continue
          }
          // Footprints genuinely share ground: only a rider standing ON
          // its support may do that, and the support must go down first.
          const rides = B.base >= A.base + A.high - 0.6
            && B.x0 >= A.x0 - 1 && B.x1 <= A.x1 + 1 && B.y0 >= A.y0 - 1 && B.y1 <= A.y1 + 1
          if (rides) continue
          offenders.push(`${name}: '${A.cls}' (${A.px},${A.py}) and '${B.cls}' (${B.px},${B.py}) share ground without one standing on the other`)
        }
      }
    }
    assert.deepEqual(offenders, [], `perspective violations:\n${offenders.join('\n')}`)
  })

  it('moves nothing sideways, and floats nothing over the row', () => {
    // HEIGHT IS THE ONE AXIS IN AN AXONOMETRIC THAT CANNOT LIE.
    //
    // Three solids used to ride a `glide` helper that turned a plan
    // displacement into the screen move it makes: a head along a rail, a binder
    // along a spine, a subject across to a throat. Every one was a solid
    // TRANSLATING through a depth-sorted scene while keeping the draw order it
    // had been sorted into - so a traveller passed in front of things it was
    // behind and behind things it was in front of, and the projection came
    // apart for as long as it moved.
    //
    // The helper being gone is the proof. Everything that moves now moves
    // straight up or straight down, or turns in place: a die falls, a subject
    // drops down a throat, a core rises out of a borehole, a lever swings in
    // its own vertical plane. None of it needs a resort.
    assert.doesNotMatch(floor, /const glide|glide\(/)
    assert.doesNotMatch(floor, /'--span'|span:/)
    assert.doesNotMatch(css, /var\(--span\)/)
    const moves = [...css.matchAll(/@keyframes (fl-[a-z]+) \{([\s\S]*?)\n\}/g)]
    for (const [, name, frames] of moves) {
      for (const move of frames.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/g) || []) {
        const [, dx, dy] = move.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/).map(Number)
        if (dx === 0 && dy === 0) continue
        // TRAVEL ALONG A PLAN AXIS IS TRAVEL INSIDE THE DRAWING. A solid moving
        // on any other bearing is sliding over the top of the projection, which
        // is what broke the perspective when three of them did it. TWO bearings
        // qualify: the ratio ISO_Y over ISO_X (the +x and +y axes), and dy of
        // exactly zero - the row's own +x -y diagonal, which is the one plan
        // axis that projects FLAT, and the reason the row is legible at all.
        // The monitor patrols it; nothing else needs it.
        assert.ok(
          dy === 0 || Math.abs(Math.abs(dy / dx) - 0.34 / 0.866) < 0.01,
          `${name} moves ${dx},${dy} - not along a plan axis, so it slides over the projection`,
        )
      }
    }
    assert.match(css, /@keyframes fl-drop \{/)

    // NO SEAM ANYWHERE. A cycle whose last frame is not its first frame does
    // not loop, it RESTARTS: the lever snapped back across its whole arc
    // between two frames, the die teleported up, the mark and the bites jumped
    // a value. Each of those is a moment where a reader is told the drawing is
    // a recording. Every cycle returns through the motion it went out on now,
    // and this walks all of them.
    for (const [, name, body] of css.matchAll(/@keyframes (fl-[a-z]+) \{([\s\S]*?)\n\}/g)) {
      const frames = {}
      for (const [, stops, decl] of body.matchAll(/([\d%,\s]+)\{([^}]*)\}/g)) {
        for (const stop of stops.split(',').map((x) => x.trim()).filter(Boolean)) frames[stop] = decl.trim()
      }
      // `alternate` clocks declare only `to`, and run back down by definition.
      if (frames['0%'] === undefined) continue
      // A dash cycle over exactly one period is seamless by construction: an
      // offset of a hundred against a 13/87 pattern on a pathLength of a
      // hundred is the same picture as an offset of nought.
      // A FULL TURN ENDS WHERE IT STARTS. Zero degrees and three hundred and
      // sixty are the same picture - what differs is the text, not the frame -
      // and a crank that stops short of a full turn to satisfy a string
      // comparison would be a crank that jerks.
      const turn = (f) => Number((f.match(/rotate\((-?[\d.]+)deg\)/) || [])[1])
      if (Number.isFinite(turn(frames['0%'])) && Math.abs(turn(frames['100%']) - turn(frames['0%'])) === 360) continue
      if (/stroke-dashoffset/.test(frames['0%'])) {
        assert.match(css, new RegExp(`\\.${name.replace('fl-', 'fl-')} \\{[\\s\\S]*?stroke-dasharray: 13 87;`))
        continue
      }
      // AN INDEXED LINE IS SEAMLESS BY ARITHMETIC, NOT BY RETURNING. Resolve's
      // three lane blocks step forward exactly one PITCH per cycle while a
      // fourth fades in at the back, so the set of occupied slots at the end of
      // a cycle is the set at the start shifted by one: when the clock turns
      // over every block lands on the slot its neighbour just left, and the
      // picture is identical. Making these two return through their own motion
      // would be a line visibly sliding backwards once every cycle, which is
      // the exact fault this whole walk exists to catch.
      if (name === 'fl-advance') {
        const pitch = Number(floor.match(/const PITCH = (\d+)/)[1])
        const [, dx, dy] = frames['100%'].match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/).map(Number)
        assert.ok(
          Math.abs(dx - pitch * 0.866) < 0.05 && Math.abs(dy - pitch * 0.34) < 0.05,
          `an index of ${dx},${dy} is not one ${pitch}-unit pitch, so the line does not land where it found itself`,
        )
        continue
      }
      if (name === 'fl-arrive') {
        assert.match(frames['100%'], /opacity: 1/, 'the block replacing the one pushed off has to be there by the seam')
        continue
      }
      // A RELAY LEG ENDS WHERE THE NEXT LEG BEGINS. The bed shunt and the
      // Golgi bud finish their cycles AWAY from home - at the seat the next
      // clock takes over from - and both seats are covered at the seam by
      // the cells drawn there (the faller back on the feed seat, the
      // handoff back at the bay), so the loop's jump happens between
      // frames in which the traveller cannot be seen. The walk holds them to
      // exactly that: invisible at the seam, or they restart in plain sight.
      if (name === 'fl-shunt' || name === 'fl-bud') {
        assert.match(frames['100%'], /opacity: 0/, `${name} must be gone at the seam it hands over on`)
        continue
      }
      assert.equal(frames['100%'], frames['0%'], `${name} ends somewhere it does not start, so it restarts`)
    }

    // AND NOTHING BLINKS OUT AND BACK. Fading to nothing at the end of a cycle
    // only to fade up at the start of the next one is a blink - a reader sees
    // the loop turn over even when the two frames match. The only things here
    // allowed to reach zero opacity are the blocks that are genuinely absent
    // for part of the cycle: one in flight from the catapult, and one being
    // pushed off the line. Everything standing on a plate stays standing.
    const vanish = ['fl-swallow', 'fl-ship', 'fl-join', 'fl-issue', 'fl-dock', 'fl-shove', 'fl-drop', 'fl-shunt', 'fl-borne', 'fl-picked', 'fl-bud', 'fl-ground', 'fl-blink', 'fl-escort', 'fl-haul', 'fl-arrive', 'fl-warp']
    for (const [, name, body] of css.matchAll(/@keyframes (fl-[a-z]+) \{([\s\S]*?)\n\}/g)) {
      if (vanish.includes(name)) continue
      assert.doesNotMatch(body, /opacity: 0[;\s]/, `${name} blinks something out and back`)
    }
    // REPLAY IS THE ONLY THING IN EITHER FIGURE THAT REVERSES, and that is the
    // whole reason it can be a transport: a clock goes round, and a replay goes
    // BACK. The head spends most of its cycle reading out along the tape and
    // the rest running home, and the reels unwind with it.
    for (const clock of ['fl-run', 'fl-wind']) {
      const body = css.match(new RegExp(`@keyframes ${clock} \\{([\\s\\S]*?)\\n\\}`))[1]
      const away = [...body.matchAll(/([\d.]+)% \{ transform: (?:translate\([\d.]+px, [\d.]+px\)|rotate\([1-9][\d.]*deg\))/g)]
        .map((m) => Number(m[1]))
      assert.ok(Math.max(...away) >= 60, `${clock} turns for home at ${Math.max(...away)}%, which is a shuttle`)
      // AND IT READS FROM THE ROUND'S FIRST FRAME. The head used to park
      // until 45%, which left the plate dead for the first seven seconds
      // a reader saw - a transport with a dead stretch is a shelf. The
      // scan is one slow constant crawl from 0% now: a rest pair at the
      // start of the round is banned; only the far-end dwell (waiting for
      // the press) and the rewound tail may hold still.
      assert.doesNotMatch(body, /0%, [\d.]+% \{ transform: (?:translate\(0px, 0px\)|rotate\(0deg\))/,
        `${clock} parks at the start of the round - the transport reads from the first frame`)
    }
    // The claw obeys the same law on its own beat: the jaws begin their
    // descent into the pile at 0%, so the machine a reader lands on is
    // already working - the one stillness left is the breath after the
    // ride home.
    const fetchBody = css.match(/@keyframes fl-fetch \{([\s\S]*?)\n\}/)[1]
    assert.doesNotMatch(fetchBody, /^\s*0%, [\d.]+% \{/m,
      'fl-fetch parks at the start of its cycle - the claw works from the first frame')
    // AND THE RESET IS A TURNING POINT, NOT A PARKING SPOT. The head lands
    // from the rewind and sets off again on the same frame - the slow
    // crawl wraps the round's seam, so home is only ever an instant: a
    // held pair at the home value in either transport clock is the
    // machine stopping to rest, and it is banned.
    for (const clock of ['fl-run', 'fl-wind']) {
      const body = css.match(new RegExp(`@keyframes ${clock} \\{([\\s\\S]*?)\\n\\}`))[1]
      assert.doesNotMatch(body, /[\d.]+%, [\d.]+% \{ transform: (?:translate\(0px, 0px\)|rotate\(0deg\))/,
        `${clock} holds still at home - the transport sets off the frame it lands`)
    }
    // AND THE SCAN NEVER TOUCHES THE TAKE-UP END. The bar used to halt
    // one plan unit off the reel's flange - the reel the courier is
    // about to press - which read as the head ramming the machine's own
    // end stop. The bar's leading edge must still cross the last frame
    // (or the read is a lie), and must stop at least four plan units
    // short of the take-up reel's edge. All three numbers come from the
    // source and the keyframes, so any retiming re-answers to this.
    const barHead = floor.match(/stand\((-?[\d.]+), -?[\d.]+, ([\d.]+), [\d.]+, [\d.]+, [\d.]+, [\d.]+\), cls: 'fl-head is-bar'/).slice(1).map(Number)
    const takeUp = floor.match(/drum\((\d+), 2, (\d+), 7\), cls: 'fl-reel' \}/).slice(1).map(Number)
    const lastFrame = Math.max(...floor.match(/const at = \[([-\d, ]+)\]/)[1].split(',').map(Number))
    const runMax = Math.max(...[...css.match(/@keyframes fl-run \{([\s\S]*?)\n\}/)[1]
      .matchAll(/translate\((-?[\d.]+)px/g)].map((m) => Number(m[1])))
    const barReach = barHead[0] + runMax / 0.866 + barHead[1]
    assert.ok(barReach >= lastFrame, `the head's leading edge stops at ${barReach.toFixed(1)}, short of the last frame at ${lastFrame}`)
    assert.ok(barReach <= takeUp[0] - takeUp[1] - 4,
      `the head's leading edge reaches ${barReach.toFixed(1)}, crowding the take-up reel's edge at ${takeUp[0] - takeUp[1]}`)

    // FIVE STATIONS, FIVE KINEMATICS - and each one is the tool the step
    // actually is rather than a shape chosen to be different. Chasing five
    // distinct KINDS of motion was itself a wrong target twice over: first
    // everything collapsed onto one axis, then everything became a hinge. What
    // fixed it was giving the row a MATERIAL and letting each station do the
    // thing it does to that material.
    const kind = {
      // A board of switches turns in place.
      'fl-flip': /transform: rotate\(/,
      // A claw crosses on a plan axis and drops on the screen's own y, and the
      // two are written separately because they are two different honest moves.
      'fl-fetch': /transform: translate\([\d.]+px, [\d.]+px\) translateY\(\d+px\)/,
      // The bed's feed cell slides one pure -y column onto the green mouth
      // and hands off at the rim; the descent is fl-swallow's, straight
      // down inside the bore.
      'fl-drop': /transform: translate\(25\.98px, -10\.2px\)/,
      // A ram lies flat and travels across the lane, which is the one motion
      // here that goes to the LEFT along a plan axis.
      'fl-stroke': /transform: translate\(-[\d.]+px, [\d.]+px\)/,
      // A transport runs the length of its own tape and comes back.
      'fl-run': /transform: translate\([\d.]+px, [\d.]+px\)/,
    }
    for (const [clock, shape] of Object.entries(kind)) {
      const body = css.match(new RegExp(`@keyframes ${clock} \\{([\\s\\S]*?)\\n\\}`))[1]
      assert.match(body, shape, `${clock} is not the motion its station was given`)
    }
    // THE HOUSEWORK KEEPS ITS OWN BEATS; THE SEAMS KEEP THE COURIER'S. The
    // claw and the green feed both run the shipment's 5.6s period BY
    // DESIGN: material flows Evidence -> Screening on one ambient clock,
    // and the board keeps a rate of its own, so the row never turns over
    // all at once. But everything the courier CAUSES - the lever, and the
    // transport whose rewind answers the reel press - runs the round's own
    // period exactly, because a cause and its answer on two clocks drift
    // apart, and a lever with a rate of its own is a lever nobody threw.
    const rate = (clock) => css.match(new RegExp(`animation: ${clock} ([\\d.]+)s`))[1]
    assert.equal(rate('fl-fetch'), rate('fl-ship'), 'the claw must keep the shipment period')
    assert.equal(rate('fl-drop'), rate('fl-ship'), 'the green feed must keep the shipment period')
    assert.equal(rate('fl-span'), rate('fl-fetch'), 'the bridge must keep the clock of the jaws it carries')
    assert.notEqual(rate('fl-flip'), rate('fl-fetch'), 'the board keeps a rate of its own')
    for (const owned of ['fl-claim', 'fl-stroke', 'fl-advance', 'fl-arrive', 'fl-run', 'fl-wind', 'fl-press', 'fl-issue', 'fl-dock', 'fl-bud', 'fl-escort', 'fl-haul']) {
      assert.equal(rate(owned), rate('fl-patrol'), `${owned} is courier-caused, so it must keep the round's own period`)
    }

    // AND NOTHING HANGS OVER THE ROW WITHOUT A JOB. Two passes put decoration
    // in the band above the plates - five identical carriers, then one
    // hanging object per station - and both died for the same reason: a
    // thing that hangs in the air without doing anything is there to be
    // looked at rather than read. The names stay banned.
    assert.doesNotMatch(floor, /const SKY|const AIR|fl-bot|fl-ferry|function overhead|fl-air/)
    assert.doesNotMatch(css, /\.fl-sky|\.fl-bot|fl-ferry|\.fl-air|fl-hang/)
    // THE ONE THING THAT FLIES, FLIES BECAUSE IT WORKS: the courier - the
    // figure clinical research already has for visiting every site and
    // moving the paperwork along, drawn once, deliberately unnamed in
    // anything a reader sees (the christening is the company's), and
    // working ONLY the workflow sheet. THE BODY IS THE MARK AND NOTHING
    // ELSE: the two favicon trapezoids, flat and solid in the house blue,
    // fat round stroke as the plumpness, a floor shadow for grounding -
    // and the cute carried by MOTION, a jelly squash-and-stretch
    // phase-locked to the hover bob. A face, a fake extrusion and an
    // antenna were all tried and all came off, so they are BANNED, not
    // just absent.
    assert.match(floor, /import \{ Courier \} from '\.\/Courier'/)
    // The name went with the dressings: it is the drum logo personified a
    // bit, and "courier" is a job, not a christening.
    assert.doesNotMatch(floor, /[Ss]cout/)
    assert.doesNotMatch(css, /[Ss]cout/)
    assert.doesNotMatch(courier, /[Ss]cout/)
    assert.match(courier, /M 104\.82 74\.50[\s\S]*?M 158\.62 284\.50/)
    assert.equal((courier.match(/className="courier-shape"/g) || []).length, 2, 'the body is the two mark shapes')
    assert.equal((courier.match(/<path/g) || []).length, 2, 'the body is the mark - two blue paths and nothing else')
    assert.doesNotMatch(courier, /<circle|<line|<rect/, 'no face, no antenna, no dressing - the silhouette is the costume')
    // The keyline came off too: the logo did not survive an outline.
    assert.doesNotMatch(courier, /courier-line/)
    assert.doesNotMatch(css, /courier-line/)
    for (const retired of ['courier-eye', 'courier-pupil', 'courier-glint', 'courier-flank', 'courier-blink', 'courier-antenna', 'courier-tip', 'courier-wink', 'courier-sway']) {
      assert.doesNotMatch(courier, new RegExp(retired), `${retired} came off the character`)
      assert.doesNotMatch(css, new RegExp(retired), `${retired} came off the character`)
    }
    assert.match(floor, /className="fl-monitorshade"/)
    assert.match(css, /\.courier-shape \{\s*\n\s*fill: var\(--accent\);/)
    assert.match(css, /\.courier-shape \{[\s\S]*?stroke-width: 33;/)
    // The jelly and the bob must share one clock and one alternate ease,
    // or the squash lands off the bounce it belongs to.
    assert.match(css, /\.dgm-svg\.is-live \.courier-trunk \{ animation: courier-jelly 3\.4s ease-in-out infinite alternate; \}/)
    assert.match(css, /\.dgm-svg\.is-live \.fl-hover \{ animation: fl-hovering 3\.4s ease-in-out infinite alternate; \}/)
    assert.match(css, /@keyframes courier-jelly \{\s*\n\s*from \{ transform: rotate\(-?[\d.]+deg\) scale\([\d.]+, [\d.]+\); \}/)
    assert.match(floor, /className=\{`fl-watch\$\{shy \? ' is-shy' : ''\}`\} aria-hidden="true"/)
    assert.match(floor, /className="fl-monitor" onClick=\{\(\) => setShy\(true\)\}/)
    assert.match(floor, /if \(event\.animationName === 'fl-flee'\) setShy\(false\)/)
    // THE ROUND IS THE LINE'S CLOCK. The ambient material beat still has
    // to divide it - the claw and bed keep working under the round - and
    // everything the courier causes runs AT it, checked with the rates
    // above. The old 4.8s Resolve beat and 8.4s transport beat are gone:
    // those mechanisms have no clock of their own any more.
    const span = Number(css.match(/animation: fl-patrol ([\d.]+)s/)[1])
    const beat = Number(css.match(/animation: fl-ship ([\d.]+)s/)[1])
    assert.ok(Math.abs(span / beat - Math.round(span / beat)) < 1e-9,
      `a ${span}s round drifts against the ${beat}s material beat`)
    // THE ROUNDS CALL WHERE THE WORK IS. Five anchors, derived in the
    // source from the same projection the plates are placed with - the
    // export mouth, the entry gate, the hold bay, the back of the lane,
    // the take-up reel - and the patrol's X stops are exactly their
    // spacing. The cargo drums are drawn at the home anchor so the stop
    // arithmetic IS the cargo's arithmetic.
    assert.match(floor, /const call = \(station, px, py\) => r1\(CX \+ \(\(station - 2\) \* STEP \* 2 \+ px - py\) \* ISO_X\)/)
    assert.match(floor, /const CARGO = roundedCylinder\(CALLS\[0\]/)
    const calls = floor.match(/const CALLS = \[call\(0, (-?[\d.]+), (-?[\d.]+)\), call\(1, (-?[\d.]+), (-?[\d.]+)\), call\(2, (-?[\d.]+), (-?[\d.]+)\), call\(3, (-?[\d.]+), (-?[\d.]+)\), call\(4, (-?[\d.]+), (-?[\d.]+)\)\]/)
      .slice(1).map(Number)
    const step = Number(floor.match(/const STEP = (\d+)/)[1])
    const anchor = (i) => 600 + ((i - 2) * step * 2 + calls[i * 2] - calls[i * 2 + 1]) * 0.866
    const patrol = css.match(/@keyframes fl-patrol \{([\s\S]*?)\n\}/)[1]
    const stops = [...new Set([...patrol.matchAll(/translate\((-?[\d.]+)px, 0px\)/g)].map((m) => Number(m[1])))]
      .sort((a, b) => a - b)
    assert.equal(stops.length, 5, 'the rounds call at all five stations')
    stops.forEach((x, k) => {
      assert.ok(Math.abs(x - (anchor(k) - anchor(0))) < 0.05, `stop ${k} at ${x} is off its own anchor`)
      assert.ok(Math.abs(anchor(k) - (129 + k * 235.55)) <= 116, `anchor ${k} leaves its own plate`)
    })
    // THE CAUSALITY LAW, HELD TO THE KEYFRAMES' OWN NUMBERS. Contact
    // first, motion on the next beat: each mechanism the courier works
    // must rest until the courier's stop there has begun, and move before
    // it ends. Windows come from fl-patrol's own stop frames.
    const stopWindow = (x) => {
      const at = [...patrol.matchAll(/([\d.]+)%, ([\d.]+)% \{ transform: translate\((-?[\d.]+)px, 0px\); \}/g)]
        .find((m) => Math.abs(Number(m[3]) - x) < 0.05)
      return [Number(at[1]), Number(at[2])]
    }
    const [leverFrom, leverTo] = stopWindow(stops[3])
    const throwAt = Number(css.match(/@keyframes fl-claim \{\s*\n\s*0%, ([\d.]+)% \{ transform: rotate\(-116deg\); \}/)[1])
    assert.ok(throwAt >= leverFrom && throwAt <= leverTo,
      `the lever rests until ${throwAt}%, which must sit inside the courier's Resolve stop (${leverFrom}-${leverTo})`)
    const [reelFrom, reelTo] = stopWindow(stops[4])
    const pressAt = Number(css.match(/@keyframes fl-press \{\s*\n\s*0%, ([\d.]+)% \{ transform: translateY\(0px\); \}/)[1])
    const turnAt = Number(css.match(/@keyframes fl-run \{[\s\S]*?[\d.]+%, ([\d.]+)% \{ transform: translate\(55\.42px, 21\.76px\)/)[1])
    assert.ok(pressAt >= reelFrom && turnAt <= reelTo,
      'the reel gives and the head turns inside the courier\'s Replay stop')
    assert.ok(pressAt < turnAt, 'the reel must give BEFORE the head turns for home - the reversal answers the press')
    // The cargo is pure inheritance: the escort and the haul may carry no
    // transform of their own - every leg, dip and rise is the courier's,
    // taken from the wrapper they ride in - and each flies only between
    // its two stops.
    for (const drum of ['fl-escort', 'fl-haul']) {
      assert.doesNotMatch(css.match(new RegExp(`@keyframes ${drum} \\{([\\s\\S]*?)\\n\\}`))[1], /transform/,
        `${drum} rides the courier - a transform of its own would tear it loose`)
    }
    assert.match(floor, /className="fl-blk is-script fl-escort"/)
    assert.match(floor, /className="fl-blk is-hold fl-haul"/)
    // The button is only the top circle: the hub alone carries is-pressed
    // and gives under the press; the reel base stays planted on the plate.
    assert.match(floor, /cls: 'fl-reel is-hub is-pressed'/)
    assert.doesNotMatch(floor, /cls: 'fl-reel is-pressed'/)
    assert.match(css, /\.fl-reel\.is-pressed \{ animation: fl-press 16.8s/)
    assert.match(css, /\.fl-reel\.is-hub\.is-pressed \.dgm-face-top \{ fill: var\(--tone\); \}/)
    // The set-down seat is the resolve lane's entry gate, one pitch behind
    // the first occupied seat - never on top of a standing cell - and the
    // index carries it onto the lane.
    assert.match(floor, /cell\(at\(0\) - PITCH, lane, 'hold'\), cls: 'fl-blk is-hold fl-feed'/)
    // The victory lap: one full spin on the climb home, a whole turn so
    // the seam is invisible, on its own wrapper so the jelly survives it.
    assert.match(courier, /className="courier-whirl"/)
    assert.match(css, /\.dgm-svg\.is-live\.is-floor \.courier-whirl \{ animation: courier-whirl 16.8s/)
    assert.match(css, /@keyframes courier-whirl \{\s*\n\s*0%, [\d.]+% \{ transform: rotate\(0deg\); \}\s*\n\s*[\d.]+%, 100% \{ transform: rotate\(360deg\); \}/)
    // Startled, the courier drops the parcel: the wrappers fade whatever
    // the cargo clocks say, anywhere on the round.
    assert.equal((floor.match(/className="fl-parcel"/g) || []).length, 2)
    assert.match(css, /\.fl-watch\.is-shy \.fl-parcel \{ opacity: 0; \}/)
    // THE WARP genuinely distorts the field: an HTML lens rides BEHIND
    // the sheet (the svg stacks over it, so it shows only through the
    // transparent air band and can never cover a solid), carrying the
    // field's own dot gradient magnified over a patch of page ground.
    // Its stops are the patrol's anchors divided onto the frame width,
    // derived here to the same hundredth.
    assert.match(floor, /<div className="fl-warplens" aria-hidden="true" \/>/)
    assert.match(css, /\.dgm-svg\.is-live\.is-floor \+ \.fl-warplens \{ animation: fl-warp 16.8s/)
    assert.match(css, /\.dgm-frame > \.dgm-svg \{ position: relative; z-index: 1; \}/)
    // The lens paints NOTHING: it is a pure backdrop filter over the real
    // field, so the actual dots smear and swell under the flight and no
    // printed disc or halo ever appears.
    assert.match(css, /\.fl-warplens \{[\s\S]*?backdrop-filter: blur\(/)
    assert.doesNotMatch(css.match(/\.fl-warplens \{[\s\S]*?\n\}/)[0], /background-image/)
    const warp = css.match(/@keyframes fl-warp \{([\s\S]*?)\n\}/)[1]
    assert.doesNotMatch(warp, /transform/, 'the lens travels by left and top, never a transform the axis walk would misread')
    for (const k of [0, 2, 4]) {
      const pct = Math.round((anchor(k) / 12) * 100) / 100
      assert.match(warp, new RegExp(`left: ${String(pct).replace('.', '\\.')}%`), `the warp misses stop ${k}'s anchor`)
    }
    assert.doesNotMatch(floor, /fl-whoosh|fl-lens|fl-mote/)
    assert.doesNotMatch(css, /fl-whoosh|fl-zoom|fl-lens|fl-mote/)
    // THE SHADOW SITS ON THE FLOOR IT SHADES: the groundwrap steps to each
    // stop's own ground line, derived from the same anchors as the stops
    // (ground = CY + (px+py)*ISO_Y, ellipse drawn at 170).
    assert.match(css, /\.dgm-svg\.is-live\.is-floor \.fl-groundwrap \{ animation: fl-footing 16.8s cubic-bezier\(0\.45, 0, 0\.25, 1\) infinite; \}/)
    const footing = css.match(/@keyframes fl-footing \{([\s\S]*?)\n\}/)[1]
    for (let k = 0; k < 5; k += 1) {
      const seat = Math.round(((calls[k * 2] + calls[k * 2 + 1]) * 0.34 + 8) * 100) / 100
      assert.match(footing, new RegExp(`translateY\\(${seat}px\\)`.replace('.', '\\.')),
        `the shadow never seats on stop ${k}'s own ground (${seat})`)
    }
    // And no plate moves under the courier any more: the held plate states
    // its hold in ink and cast, never by rising out from under the round.
    assert.doesNotMatch(css, /\.fl-step\.is-hot \.fl-body \{ transform/)
    assert.match(css, /\.dgm-svg\.is-live \.fl-watch \{ opacity: 1; \}/)
    assert.match(css, /\.fl-watch \{\s*\n\s*opacity: 0;\s*\n\s*pointer-events: none;/)
    assert.match(css, /\.dgm-svg\.is-live \.fl-monitor \{ pointer-events: all; cursor: pointer; \}/)
    assert.match(css, /\.dgm-svg\.is-live \.fl-watch\.is-shy \.fl-dart \{ animation: fl-flee/)
    // The flee is height-axis only - the one axis that cannot lie - and its
    // seam closes: it ends exactly where it began.
    const flee = css.match(/@keyframes fl-flee \{([\s\S]*?)\n\}/)[1]
    assert.doesNotMatch(flee, /translate\(/, 'the flee rides the height axis alone')
    // AND THE STARTLE COMES BEFORE THE BOLT. A click scares a small
    // cartoon character, and a scared character SHAKES first: a
    // half-second tremble on the body's own group - horizontal only, the
    // row's flat bearing, because that wrapper's transform origin is the
    // sheet's corner and a rotate would swing the body around the viewBox
    // instead of shivering it - while the parcel pops loose and the
    // shadow fades. The flee waits out exactly the tremble, so liftoff
    // lands the instant the shaking stops.
    assert.match(css, /\.dgm-svg\.is-live \.fl-watch\.is-shy \.fl-monitor \{ animation: fl-scare/)
    const scareSpan = css.match(/\.fl-monitor \{ animation: fl-scare ([\d.]+)s/)[1]
    const fleeDelay = css.match(/animation: fl-flee 3\.2s cubic-bezier\([^)]*\) ([\d.]+)s 1/)[1]
    assert.equal(fleeDelay, scareSpan, 'the bolt must wait out exactly the tremble')
    const scare = css.match(/@keyframes fl-scare \{([\s\S]*?)\n\}/)[1]
    assert.doesNotMatch(scare, /rotate\(/, 'a rotate on this wrapper swings the body around the viewBox origin')
    assert.ok((scare.match(/translate\(-?[1-9]/g) || []).length >= 5, 'a tremble is several shakes, not one nudge')
    // THE CAMEOS ARE GONE, AND THE POKE AND THE COLLECTION WITH THEM. The
    // character works one sheet. Trident and Nectar keep their corner
    // mark and nothing else of it - no watch, no rounds, no pressed tile,
    // no borrowed mast - and the retired act names stay banned so no pass
    // quietly brings the pet back.
    for (const clean of [trident, nectar]) {
      assert.doesNotMatch(clean, /Scout|Courier|fl-watch|dgm-scoutround|setShy/)
    }
    assert.doesNotMatch(css, /dgm-scoutround|dgm-press|dgm-yoink|dgm-mastarm|dgm-lookt|dgm-lookn/)
    for (const retired of ['fl-treat', 'fl-jolt', 'is-poked']) {
      assert.doesNotMatch(floor, new RegExp(retired), `${retired} belongs to the pass where the acts were decoration`)
      assert.doesNotMatch(css, new RegExp(retired), `${retired} belongs to the pass where the acts were decoration`)
    }
    // With reduced motion the courier does not exist, anywhere: a parked
    // drone hanging in the air is exactly the decoration this law kills.
    assert.match(css, /reduced-motion[\s\S]*?\.fl-watch \{ opacity: 0; \}/)

    // POINTING AT A STATION FINISHES IT. A hover used to re-weight the drawing
    // and nothing more, which is presentation: it says "this one" and says
    // nothing about the step. Every lamp on the held plate comes up and STAYS
    // up, out of the cycle it was taking its turn in - four criteria compiled,
    // every record bound, every bin counted, nine bands of nine recovered.
    assert.match(css, /\.fl-step\.is-hot \.fl-blk\.is-pass \.dgm-face-top \{ fill: color-mix/)
    assert.match(css, /\.fl-step\.is-hot \.fl-blk\.is-fail \.dgm-face-top \{ fill: color-mix/)
  })

  it('letters the stations beneath their plates, bare and in ink', () => {
    // THE LETTERING WAS THE LOUDEST THING IN THE FIGURE ONCE - fourteen-pixel
    // accent caps hung above every plate - and then it was a survey: a datum
    // ruled under the row, leaders down onto it, a tick per station, the
    // names in soft ink beneath. The survey went too. A line whose whole job
    // was to hold five labels that already sat in a row was apparatus, not
    // information: the names hang bare under their plates now, in FULL ink,
    // with the value in the machine face beneath - and the row itself is the
    // only line the reader needs.
    const nameY = Number(floor.match(/const NAME_Y = (\d+)/)[1])
    const factY = Number(floor.match(/const FACT_Y = (\d+)/)[1])
    const foot = Number(floor.match(/const CY = (\d+)/)[1]) + (79.5 + 53) * 0.34 + 9
    assert.ok(nameY > foot, `a name line at ${nameY} runs through a row whose foot is at ${Math.round(foot)}`)
    assert.ok(factY > nameY, 'the value hangs under the name')
    assert.ok(factY + 12 <= Number(floor.match(/const H = (\d+)/)[1]), 'and the value line stays inside the frame')
    assert.match(floor, /className="fl-name" x=\{item\.seat\[0\]\} y=\{NAME_Y\}/)
    assert.doesNotMatch(floor, /fl-datum|fl-leader|fl-station|const DATUM|const KEEP|const FOOT/)
    assert.doesNotMatch(css, /fl-datum|fl-leader|fl-station/)
    // IN INK - full ink now, since the label is all there is - and small:
    // no rule in the lettering may reach for the accent, because this sheet
    // spends its one colour on the solids.
    const size = Number(css.match(/\.fl-name \{[\s\S]*?font-size: ([\d.]+)px/)[1])
    assert.ok(size <= 11, `${size}px caps over a 216px plate is a headline, not a label`)
    assert.match(css, /\.fl-name \{[\s\S]*?fill: var\(--text\);/)
    assert.match(css, /\.fl-fact \{[\s\S]*?fill: var\(--faint\);/)
    assert.match(css, /\.fl-step\.is-hot \.fl-fact \{ fill: var\(--ink-deep\); \}/)
    const letters = css
      .slice(css.indexOf('The run, and the names that hang off it'), css.indexOf('-- THE FIVE MECHANISMS'))
      .replace(/^[\s\S]*?\*\//, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
    assert.doesNotMatch(letters, /accent/, 'the lettering does not spend the sheet\'s one colour')
    assert.doesNotMatch(css, /@keyframes fl-label/)

    // THE CAPTION HOLDS ITS GROUND. Every read the pill can show is drawn
    // hidden in the readline's one grid cell, so the line box stands as
    // tall as the tallest caption at ANY width and nothing under the figure
    // moves when the narration changes. A guessed min-height breaks at
    // exactly the widths a guess breaks at; the reserve here is the captions
    // themselves - which is what let the reads grow to two sentences apiece
    // for a reader who has never run a trial. On a phone the readout stacks
    // - the pill above the prose - so the read gets the full measure, and
    // the rule is addressed to the class the figure actually renders.
    assert.match(floor, /\[\.\.\.STEPS\.map\(\(s\) => s\.read\), READ_REST\]\.map\(\(text\) => \(\s*\n\s*<span className="fl-readghost" aria-hidden="true" key=\{text\}>\{text\}<\/span>/)
    assert.match(floor, /<span className="fl-readtext">\{step \? step\.read : READ_REST\}<\/span>/)
    assert.match(css, /\.fl-readline \{[\s\S]*?display: grid;/)
    assert.match(css, /\.fl-readline > span \{ grid-area: 1 \/ 1; \}/)
    assert.match(css, /\.fl-readghost \{ visibility: hidden; \}/)
    assert.match(mobile, /#root \.fl-readout \{\s*\n\s*flex-direction: column;/)
    assert.doesNotMatch(mobile, /dgm-readout/, 'the phone rule must address the class the figure renders')
    // It is prose on a reading measure, not a caption stretched to the width
    // of a drawing that deliberately takes the screen.
    assert.match(css, /\.fl-readline \{[\s\S]*?max-width: 80ch;/)
  })

  it('says what each station replaces, and who does that work now', () => {
    // THE SECTION'S ONE PIECE OF WRITING. The slogan that used to close this
    // section is gone, so the reads carry it - and a reader who has never
    // run a trial has to learn from them what the station replaces and who
    // does the work. Every read names the change, and the division of labour
    // the ADRs pin - agents PREPARE at every station, the verdict is
    // arithmetic, the signature is a person's - holds across all five.
    const reads = [...floor.matchAll(/\n {4}read: '((?:[^'\\]|\\')*)'/g)].map((m) => m[1].replace(/\\'/g, "'"))
    assert.equal(reads.length, 5)
    const rest = floor.match(/const READ_REST = '([^']*)'/)[1]
    for (const read of [...reads, rest]) {
      assert.ok(read.length > 150, `a one-liner is what this pass replaced: ${read}`)
      assert.ok(/[.] /.test(read), `a read is two sentences, not one clause: ${read}`)
    }
    // Agents do the preparing, and they are visible doing it.
    assert.equal(reads.filter((read) => /Agents /.test(read)).length, 3)
    assert.match(rest, /Agents prepare the work at every step/)
    // But they never cast the verdict or hold the pen, and the rest line says
    // the whole law in the kernel's own terms.
    assert.match(rest, /deterministic code and a named person make every decision/)
    assert.match(reads[2], /no model touches the verdict/)
    assert.match(reads[3], /a named person picks the action and signs it/)
    // And every value is traceable to what produced it, at the station that
    // produced it: a criterion to its source text, a fact to its record, a
    // signed run to the version and evidence it was decided on.
    assert.match(reads[0], /citation back into the source text/)
    assert.match(reads[1], /bound to the record it came from/)
    assert.match(reads[1], /none of it leaves the site/)
    assert.match(reads[4], /protocol version, the evidence as of that day and every signature/)
  })

  it('holds a plate with ink and ground, never by moving it', () => {
    // The hold has been three wrong things: an EXTRUSION (the plate got
    // thicker, which reads as swelling), a HALO (an inset cue that pushed
    // the plate into the page), and finally a 22px LIFT - which was right
    // until the courier arrived. A rise under a round whose anchors, dips
    // and cargo swaps are solved against resting geometry tears every one
    // of them loose the moment a pointer lands. So the held plate stays
    // put: the cast spreads beneath it and the verdicts come forward, and
    // nothing the courier is working ever moves out from under it.
    assert.doesNotMatch(floor, /tall: roundedSlab|fl-deep|fl-shallow/)
    assert.doesNotMatch(css, /fl-aura|fl-shade/)
    assert.doesNotMatch(floor, /fl-aura|fl-shade/)
    assert.doesNotMatch(css, /\.fl-step\.is-hot \.fl-body \{ transform/)
    assert.match(css, /\.fl-step\.is-hot \.fl-cast \{ opacity: 1; \}/)
    // The steps NEST rather than march: at five, ten and fifteen pixels apart
    // they came out as three ghost plates trailing under the real one, and three
    // drawn edges is not a soft shadow, it is a stutter.
    // The falloff is QUADRATIC, which is what makes five steps read as one
    // shadow rather than as five: the first two sit almost on the footprint at
    // half strength (the contact) and the last two are ten and fifteen pixels
    // out at a fifteenth (the ambient). Linear steps can only draw the first.
    assert.match(css, /transform: translateY\(calc\(var\(--n\) \* var\(--n\) \* [\d.]+px\)\)/)
    assert.match(css, /\.fl-caststep \{[\s\S]*?opacity: var\(--a\);/)
    assert.match(css, /\.fl-caststep \{[\s\S]*?fill: color-mix\(in srgb, var\(--text\)/)
    // And the lettering does NOT go up with it. The solids float and the type
    // is nailed to the ground.
    assert.match(floor, /<\/g>\s*\n\s*\{\/\* THE STATION[\s\S]*?<text className="fl-name"/)
    // A HELD PLATE KEEPS RUNNING. Pointing at one used to freeze it, on the
    // theory that a reader who has stopped wants a drawing that has stopped.
    // They have just chosen which machine to watch, and the one thing a machine
    // should not do when somebody leans in is stop being a machine. What a
    // hover buys is contrast: a halo behind it, a step of ink on every solid,
    // and the plate's own printed plan coming up with them.
    assert.doesNotMatch(css.slice(css.indexOf('FIVE SURFACES, ALREADY DOWN')), /animation-play-state/)
    assert.match(css, /\.fl-step\.is-hot \.fl-emblem \.dgm-face-top \{/)
    assert.match(css, /\.fl-step\.is-hot \.fl-plan \{/)
    // A SPRING, NOT A ONE-WAY EASE. Everything decelerated into place on a
    // curve that never passes its target, which is the motion of a thing being
    // positioned rather than of a thing being let go. A plate that rises,
    // overshoots by a per cent and settles is the difference between an
    // animation and a movement - and the bezier is declared FIRST so a browser
    // that cannot parse `linear()` still gets the smoother of the two curves
    // rather than falling all the way back to `ease`.
    for (const rule of ['\\.fl-body', '\\.fl-caststep']) {
      const block = css.match(new RegExp(`${rule} \\{[\\s\\S]*?\\n\\}`))[0]
      assert.match(block, /transition: transform \d+ms cubic-bezier\([^)]+\);/, 'the fallback curve comes first')
      assert.match(block, /transition-timing-function: linear\(0, [\s\S]*?1\.001 100%\);/, 'and the spring overrides it')
    }

    // NO SHEEN. A gradient over every top face was laid on the theory that a
    // real panel catches more light along the edge nearest the source. The
    // theory is sound and the drawing was not: it read as the paper fading out
    // rather than as light on it. A top face is a flat near-white fill.
    assert.doesNotMatch(floor, /sheen/)
    assert.match(css, /\.fl-plate \.dgm-face-top \{\s*fill: color-mix\(in srgb, var\(--tone\) \d+%, var\(--surface-solid\)\);/)

    // And the corners are sampled finely enough to be corners. `roundedSlab` is
    // the chain's own primitive - nothing else in the sheet calls it - so at
    // seven samples the plate's radius came out as a visible run of chords.
    assert.match(iso, /const plan = roundedBox\(halfX, halfY, radius, 11\)/)
    assert.match(iso, /export function roundedBox\(halfX, halfY, radius, steps = 5\)/)
    assert.match(floor, /const PLATE_R = 20/)

    // And the halo is not a blur. A Gaussian on five polygons is five
    // full-frame filter passes every frame for a thing invisible on four of
    // them - it ground a headless render to a stop.
    assert.doesNotMatch(floor, /feGaussianBlur/)
    assert.match(floor, /\[\[1, 0\.5\], \[2, 0\.33\], \[3, 0\.21\], \[4, 0\.13\], \[5, 0\.07\]\]\.map/)
    // The cast stays on the ground while the plate goes up, so it has to sit
    // outside the group that lifts.
    assert.match(floor, /<g className="fl-cast">[\s\S]{0,900}<g className="fl-body">/)
    // The hit rect is the figure's one pointer surface, live from the first
    // frame - there is no scatter left to wait out.
    assert.match(css, /\.fl-hit \{\s*\n\s*fill: none;\s*\n\s*pointer-events: all;\s*\n\s*cursor: pointer;\s*\n\}/)
    assert.match(floor, /tabIndex=\{0\}/)
    assert.match(css, /\.dgm-svg\.is-floor:has\(\.fl-step\.is-hot\) \.fl-step:not\(\.is-hot\) \{ opacity: 0\.36; \}/)
    // ONE SOURCE OF TRUTH. The drawing used to style off `:hover` while the
    // readout under it rendered off React state - two answers to one question,
    // and on a touch screen `:hover` sticks after the finger has gone, so the
    // plate stayed lifted under a caption that had moved on.
    assert.doesNotMatch(css.slice(css.indexOf('FIVE SURFACES, ALREADY DOWN')), /\.fl-step:hover/)
    assert.match(floor, /onMouseEnter=\{\(\) => setHot\(item\.key\)\}/)
  })

  it('holds a legible scale on a phone', () => {
    assert.match(mobile, /#root \.dgm-svg \{ min-width: 500px; \}/)
    // FIVE OF ANYTHING ACROSS THREE HUNDRED AND FIFTY PIXELS IS A ROW OF
    // STAMPS. The floor used to fit a phone because it was one deck with no
    // labels on it; five plates land about eighty pixels wide, under the size
    // at which a plate's own name fits over it. So it pans, and it opens
    // centred - which puts the middle of the run under the reader's thumb.
    const floorWidth = Number(mobile.match(/#root \.dgm-svg\.is-floor \{ min-width: (\d+)px; \}/)[1])
    assert.ok(floorWidth >= 700, `${floorWidth}px across five plates is eighty pixels each`)
    assert.match(floor, /const frame = useCenterOnOverflow\(\)/)
    // Nothing lights on a phone, because nothing runs there - so the resting
    // value of a lamp has to be the finished one, or the figure comes to rest
    // as five populations with no state on any of them.
    // Nothing lights on a phone, because nothing runs there - so a block's
    // verdict has to be its resting colour rather than something a clock turns
    // on, or the figure comes to rest as a row nobody has ruled on.
    assert.match(css, /\.fl-blk\.is-pass \.dgm-face-right \{ fill: var\(--pass\); \}/)
    assert.match(css, /\.fl-blk\.is-fail \.dgm-face-right \{ fill: var\(--fail\); \}/)
  })

  it('breaks the drawing out of the column, and closes with the sentence', () => {
    // THE DRAWING BREAKS THE COLUMN AND THE TYPE DOES NOT. Nothing inside the
    // figure can make it bigger - the plates already span ninety-six per cent
    // of their own viewBox - but the column's width is SOLVED against the
    // eyebrow's offset, so widening it would take the whole section out of
    // alignment to make one drawing larger. The figure steps out instead, which
    // is the better composition: this is the one section whose subject is a run
    // read left to right, and the one shape on the site that wants the width of
    // the screen rather than a reading measure.
    assert.match(css, /\.thesis-column \{[\s\S]*?width: min\(100%, calc\(1480px - var\(--gutter\) \* 2\)\);/)
    const bleed = Number(css.match(/\.thesis-chain \{[\s\S]*?margin-inline: clamp\(-(\d+)px/)[1])
    assert.ok(bleed >= 100, `a ${bleed}px break-out is not a break-out`)
    // And never on a narrow screen: the clamp's other end is zero.
    assert.match(css, /\.thesis-chain \{[\s\S]*?margin-inline: clamp\(-\d+px, calc\(\(1480px - 100vw\) \/ 2\), 0px\);/)
    // THE FIGURE COMES LAST. The section opens with the drawing's own name at
    // brand volume - WORKFLOW - and closes on the drawing itself, whose
    // caption is the only prose here. The stage grid that used to hold a dek
    // over the figure went with the dek, and the slogan that sat under it
    // went with the pass that grew the reads, so nothing shares the drawing's
    // cell and nothing needs to refuse pointer events over it.
    assert.match(app, /<SectionEyebrow brand>Workflow<\/SectionEyebrow>/)
    assert.match(app, /className="thesis-chain">\s*\n\s*<ChainSchematic animate=\{animate\} \/>\s*\n\s*<\/div>\s*\n\s*<\/div>/)
    assert.doesNotMatch(app, /thesis-stage|thesis-head/)
    assert.doesNotMatch(css, /thesis-stage|thesis-head/)
    assert.doesNotMatch(mobile, /thesis-stage|thesis-head/)
  })

  it('stands the thesis figure on the page field, not in a plate of its own', () => {
    assert.match(app, /<section className="thesis-section section-space" id="thesis" ref=\{root\}>/)
    assert.match(app, /<ChainSchematic animate=\{animate\} \/>/)
    assert.match(app, /<div className="section-field" ref=\{field\} aria-hidden="true" \/>/)
    assert.match(app, /const animate = shouldRunAmbient\(\{ reduced, inView, narrow \}\)/)
    assert.doesNotMatch(app, /usePinnedRun|thesis-pin/)
    // Nothing runs when the reader has asked for less motion: the figure
    // rests as the five plates, lettered, with their mechanisms on them. The
    // pointer still lifts one, because a hover is a thing a reader asked for.
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s+\.dgm-svg\.is-floor \{ transition: none; \}/)
  })
})

describe('The pointer field', () => {
  it('is read once per section and never through React', () => {
    // Custom properties inherit, so one listener on the section root serves
    // both the lattice behind the drawing and the solids held above it - and a
    // value that changes every pointer frame must never re-render a tree with
    // forty solids in it.
    assert.match(field, /node\.style\.setProperty\('--px'/)
    assert.match(field, /node\.style\.setProperty\('--py'/)
    assert.doesNotMatch(field, /useState/)
    assert.match(field, /requestAnimationFrame/)
    // Attached to the ref each section already keeps for GSAP, so there is no
    // second ref and nothing to merge - a callback ref writing `root.current`
    // is both harder to read and something the hooks lint is right to refuse.
    // TWO NOW. The refusal that held the thesis out - a parallax on one
    // flat deck is a wobble - still stands: what the thesis runs is not a
    // parallax. Each vessel reads its NEARNESS to the cursor and swells
    // toward it, which is a response, not a view shear. Nectar spends the
    // field on the slab's own shadow. Trident spent it on the proposer
    // plates for a pass and gave it back: three tiles swimming under the
    // cursor over four decks that held still read as glitch, not height,
    // so the plates are pinned like the decks and Trident takes no field.
    assert.equal((app.match(/usePointerField\(root, \{ reduced \}\)/g) || []).length, 2)
    assert.match(css, /--near: max\(0, 1 - max\(var\(--dx\), -1 \* var\(--dx\)\) \* 2\.4\)/)
    // Spent only while the pointer is actually over the section - the field's
    // resting zeroes would otherwise leave the centre vessel swollen - and
    // only on a pointer that can hover, and never over the held plate.
    assert.match(css, /\.thesis-section:hover \.dgm-svg \.fl-step:not\(\.is-hot\) \.fl-body/)
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.thesis-section:hover \.dgm-svg\.is-floor \.fl-body \{ transform: none; \}/)
    // `--sway` means something else on this sheet now - it is where a scattered
    // tile wanders to while it is still a mess - so the check is for the
    // pointer-field variables themselves rather than a name that got reused.
    assert.doesNotMatch(floor, /usePointerField|--px\b|--py\b/)
    assert.match(field, /export function usePointerField\(target, \{ reduced = false \} = \{\}\)/)
  })

  it('is off wherever following a pointer would be a lie', () => {
    // On a touch screen there is no pointer to follow: a tap would jump every
    // layer and leave it wherever the finger last was. Reduced motion is the
    // same refusal for a different reason. In both cases the element keeps its
    // zeroes and every expression downstream collapses to no offset at all.
    assert.match(field, /if \(!node \|\| reduced\) return undefined/)
    assert.match(field, /any-hover: hover\) and \(pointer: fine/)
    assert.match(css, /var\(--px, 0\)/)
    assert.match(css, /var\(--py, 0\)/)
  })

  it('leaves the proposer plates pinned like the decks', () => {
    // The plates took six pixels of pointer shear for a pass, on the
    // argument that the one un-plumbed layer could afford to move. On the
    // screen it read the other way: three tiles swimming while the stack
    // held still is a glitch, not a height cue. The plates keep only their
    // own slow ride now - the pointer moves nothing anywhere in Trident.
    assert.match(css, /\.dgm-plate \{\s*\n\s*transform: translateY\(var\(--ride, 0px\)\);\s*\n\}/)
    assert.doesNotMatch(css, /\.dgm-plate \{[^}]*var\(--px/)
    // Nothing plumbed moves either: a deck is joined to the deck below it
    // by a drop drawn inside both, and a parallax on a plumbed thing is a
    // drawing that has come apart.
    assert.doesNotMatch(css, /\.dgm-slide \{[^}]*var\(--px/)
    assert.doesNotMatch(css, /\.dgm-drop[a-z]* \{[^}]*var\(--px/)
  })

  it('moves the slab\'s shadow and never the slab', () => {
    // The slab cannot move: three channels pass under its near skirt and come
    // up through ports cut in its plan, so drifting it by two pixels slides
    // every port off the route arriving at it. Its SHADOW is the one part of
    // the figure plumbed to nothing, so that is what answers the pointer -
    // sliding against it, which reads as the slab hanging in air the reader
    // is moving through. If someone ever puts the field on the slab itself,
    // this fails and the reason gets read again rather than rediscovered.
    assert.doesNotMatch(css, /\.dgm-intel[^{]*\{[^}]*var\(--px/)
    assert.match(css, /NECTAR'S SLAB IS DELIBERATELY NOT IN THIS PASS/)
    assert.match(nectar, /className="dgm-seatshift"/)
    assert.match(css, /\.dgm-seatshift \{\s*\n\s*transform: translate\(calc\(var\(--px, 0\) \* -10px\), calc\(var\(--py, 0\) \* -6px\)\);/)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'

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
      '.dgm-svg.is-live .dgm-node.is-bound',
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
    assert.match(trident, /const head = \[x \+ 13, Math\.round\(\(y - SEP \+ 6\) \* 100\) \/ 100\]/)
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
    // read as four heights of one plan.
    assert.match(trident, /className="dgm-axis"/)
    assert.match(trident, /className="dgm-plane"/)
    assert.match(trident, />ONE PLAN - FOUR HEIGHTS<\/text>/)
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
    // The contract's pass is ordered, not scattered: `--seq` is a field's place
    // in the run, so the check crosses the grid as one band. Nineteen tiles on
    // nineteen unrelated clocks is a twinkle, and this is a pass.
    assert.match(trident, /seq: Math\.round\(\(cursor \/ 19\) \* 100\) \/ 100/)
    assert.match(DGM_BLOCK, /animation-delay: calc\(var\(--seq, 0\) \* 1\.4s\);/)
    // The ledger's chain carries the hash down in chain order, and the row it
    // reaches takes its seal a beat later.
    assert.match(trident, /seq: Math\.round\(\(index \/ all\.length\) \* 100\) \/ 100/)
    assert.match(trident, /className="dgm-ledgerflow"/)
    assert.match(DGM_BLOCK, /@keyframes dgm-post \{/)
    assert.match(DGM_BLOCK, /@keyframes dgm-stamp \{/)
  })

  it('answers a pointer by loading a mechanism, not by starting one', () => {
    // Pointing at a deck leans on what it is already doing. The intake carries a
    // second mark on every run - a change of dash pattern and not of rate, so
    // nothing in flight teleports the moment the pointer arrives. The contract
    // re-checks from the first field. The ledger lights the chain that holds it
    // together. The shutter gives against its own bolts and comes straight back.
    assert.match(DGM_BLOCK, /\.dgm-deck\.is-hot \.dgm-intake \{ stroke-dasharray: 7 93;/)
    assert.match(DGM_BLOCK, /\.dgm-svg\.is-live \.dgm-deck\.is-hot \.dgm-fieldtile:not\(\.is-named\) \{ animation-name: dgm-passhard; \}/)
    assert.match(DGM_BLOCK, /\.dgm-deck\.is-hot \.dgm-ledgerchain \{ stroke: var\(--accent\); stroke-dasharray: none; \}/)
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-leaf:not\(\.is-open\)/)
    assert.match(DGM_BLOCK, /\.dgm-shutter\.is-tried \.dgm-bolt:not\(\.is-clear\)/)
    assert.match(DGM_BLOCK, /@keyframes dgm-give/)
    assert.match(trident, /const tried = hot === 'authority' && !open/)
    // A field is the one part small enough to need naming, so it keeps its own
    // target and answers in the tile: a tick if the contract has checked it.
    assert.match(DGM_BLOCK, /\.dgm-fieldcheck \{/)
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

  it('never asks a site for a record, in either direction', () => {
    // Damaros has no reason to request identifiable data, so no path in the
    // figure points at a site and nothing is refused at a wall.
    assert.doesNotMatch(nectar, /RECORD REQUEST|REFUSED|dgm-cross|is-back|BACK_TO|BACK_FROM/i)
    assert.doesNotMatch(DGM_BLOCK, /\.dgm-route\.is-back|\.dgm-cross|\.dgm-refused/)
    assert.doesNotMatch(DGM_BLOCK, /var\(--danger\)/)
    // Every path rises from the back corner of a site's own roof into the mesh
    // - the far edge, so the line climbs away from the reader.
    assert.match(nectar, /path: `M \$\{x1\} \$\{y1\} Q \$\{cx\} \$\{cy\} \$\{x2\} \$\{y2\}`/)
    assert.match(nectar, /const \[x1, y1\] = item\.site\.solid\.back/)
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
    // The library is a mesh that lights up, not a box being coloured in.
    assert.match(nectar, /className=\{`dgm-node\$\{node\.rank < state\.bound \? ' is-bound' : ''\}/)
    assert.match(DGM_BLOCK, /@keyframes dgm-beat/)
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
    assert.match(DGM_BLOCK, /\.dgm-ledgerrow\.is-written \.dgm-ledgerseal \{ fill: var\(--success\); \}/)
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

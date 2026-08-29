import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'

const app = await readSource(new URL('./App.jsx', import.meta.url))
const css = await readSource(new URL('./styles.css', import.meta.url))
const mobile = await readSource(new URL('./mobile.css', import.meta.url))

describe('Damaros brand mark', () => {
  it('moves spine titles into home eyebrows and keeps the spine numeric', () => {
    assert.match(app, /<span>\{String\(index \+ 1\)\.padStart\(2, '0'\)\}<\/span>/)
    assert.doesNotMatch(app, /<strong>\{label\}<\/strong>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Home<\/SectionEyebrow>/)
    // The thesis section opens with the figure's NAME now - WORKFLOW, at the
    // brand eyebrows' own volume - and Capacity carries no eyebrow at all:
    // its centred heading does that work, and a label over a heading was two
    // signposts for one road.
    assert.match(app, /<SectionEyebrow brand>Workflow<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow[^>]*>Thesis</)
    assert.doesNotMatch(app, /<SectionEyebrow[^>]*>Capacity</)
    assert.match(app, /<SectionEyebrow brand>Trident<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow>Control<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow brand>Nectar<\/SectionEyebrow>/)
    assert.match(app, /\{!about && <SectionEyebrow>Pilot<\/SectionEyebrow>\}/)
    assert.doesNotMatch(app, /<SectionEyebrow>About<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Founder<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Why now<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>People<\/SectionEyebrow>/)
    assert.match(css, /--type-eyebrow:\s*clamp\(0\.72rem, 0\.662rem \+ 0\.258vw, 0\.92rem\);/)
    assert.match(css, /\.section-eyebrow,[\s\S]*?font-family:\s*var\(--font-ui\);[\s\S]*?font-size:\s*var\(--type-eyebrow\);[\s\S]*?letter-spacing:\s*0\.16em;[\s\S]*?text-transform:\s*uppercase;/)
    assert.match(mobile, /#root \.section-eyebrow,[\s\S]*?font-family:\s*var\(--font-ui\);[\s\S]*?letter-spacing:\s*0\.16em;/)
    assert.doesNotMatch(mobile, /section-eyebrow[^{]*\{[^}]*font-size:\s*0\.72rem/)

    // TRIDENT, NECTAR AND WORKFLOW ARE NAMES, NOT LABELS. Five sections carry
    // an eyebrow; two are topics - Control and Pilot - and three are names:
    // the two products, and the workflow figure whose drawing is the
    // product's own shape. Names at name volume, labels at label volume, and
    // exactly three of the first kind.
    assert.equal((app.match(/<SectionEyebrow brand>/g) || []).length, 3)
    for (const topic of ['Control', 'Pilot']) {
      assert.match(app, new RegExp(`<SectionEyebrow>${topic}</SectionEyebrow>`))
    }
    assert.match(app, /function SectionEyebrow\(\{ children, brand = false \}\)/)
    assert.match(app, /className=\{`section-eyebrow\$\{brand \? ' is-brand' : ''\}`\}/)

    // SIZE CARRIES ALL OF IT, because the display face gives nothing else to
    // carry it with. Re-solved here rather than pinned loosely: the brand size
    // has to clear the label size at every viewport on the 360-to-1600 line the
    // whole sheet runs on, and by a wide margin, since weight and family are
    // both spent.
    assert.match(css, /--type-brand-eyebrow:\s*clamp\(([\d.]+)rem, ([\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\);/)
    const pick = (name) => css.match(new RegExp(`--type-${name}:\\s*clamp\\(([\\d.]+)rem, ([\\d.]+)rem \\+ ([\\d.]+)vw, ([\\d.]+)rem\\);`)).slice(1).map(Number)
    const at = ([min, base, slope, max], width) => Math.min(Math.max(base * 16 + (slope / 100) * width, min * 16), max * 16)
    const label = pick('eyebrow')
    const brand = pick('brand-eyebrow')
    for (const width of [360, 768, 1280, 1600]) {
      assert.ok(at(brand, width) >= at(label, width) * 1.8, `the brand eyebrow is not clearly larger at ${width}px`)
    }
    assert.match(css, /\.section-eyebrow\.is-brand,[\s\S]*?font-size:\s*var\(--type-brand-eyebrow\);/)
    // Deeper ink than the labels', so the two names are separated by colour as
    // well as by weight.
    assert.match(css, /\.section-eyebrow\.is-brand,[\s\S]*?color:\s*var\(--accent-strong\);/)
    assert.match(css, /\.section-eyebrow,[\s\S]*?color:\s*var\(--accent\);/)
    // Tracking comes DOWN. Letterspacing is what makes fourteen pixels of
    // uppercase legible; at twenty-two it stops a word being a word.
    const tracking = (rule) => Number(css.match(new RegExp(`${rule}[\\s\\S]*?letter-spacing:\\s*([\\d.]+)em`))[1])
    assert.ok(tracking('\\.section-eyebrow\\.is-brand,') < tracking('\\.section-eyebrow,'))
    // THE DISPLAY FACE, AND THE WEIGHT IT DECLARES. These are set in Endless -
    // the face every headline on the site uses - because a product name belongs
    // to the same voice as the sentence it introduces, not to the UI face every
    // caption uses.
    //
    // Endless ships ONE weight. There is a single @font-face for it, 400, so a
    // declared 700 only paints as bold if synthesis is allowed to make it - and
    // the eyebrow base rule turns synthesis OFF. The brand rule asks for 700 and
    // turns it back on, and BOTH halves are pinned here, because either one
    // alone is the bug: a 700 with synthesis still off is a weight the sheet
    // states and does not get, which is exactly what this rule used to avoid by
    // declaring 400.
    const brandRule = css.match(/\.section-eyebrow\.is-brand,[\s\S]*?\n\}/)[0]
    assert.match(brandRule, /font-family:\s*var\(--font-display\);/)
    assert.match(brandRule, /font-weight:\s*700;/)
    assert.match(brandRule, /font-synthesis:\s*weight;/)
    assert.match(css, /--font-display:\s*'Endless'/)
    assert.equal((css.match(/font-family: 'Endless';/g) || []).length, 1)
    assert.match(css, /@font-face \{\s*\n\s*font-family: 'Endless';[\s\S]*?font-weight: 400;/)
    // Synthesis is turned back on for the two brand eyebrows and NOWHERE else:
    // the base eyebrow rule still refuses it, so the four topic labels and every
    // other run of Endless keep painting the one weight that was drawn.
    assert.match(css, /\.section-eyebrow,[\s\S]*?font-synthesis:\s*none;/)
    assert.equal((css.match(/font-synthesis:\s*weight;/g) || []).length, 1)
    // The mobile sheet restates the eyebrow rule at `#root .section-eyebrow`
    // AND at `#root .thesis-section .section-eyebrow`, so the brand rule has
    // to out-specify both or a name gets the label treatment - WORKFLOW is
    // the one brand eyebrow living in a section the phone sheet names.
    assert.match(css, /#root \.section-eyebrow\.is-brand,\s*\n#root \.thesis-section \.section-eyebrow\.is-brand \{/)
    assert.match(css, /\.page-spine \{[\s\S]*?width:\s*34px;/)
    assert.match(css, /\.site-nav-wrap \{[\s\S]*?z-index:\s*50;[\s\S]*?isolation:\s*isolate;/)
    // The thesis section is a left-set column now rather than a centred slab -
    // the eyebrow, the figure and the closer all start on one pixel - so both
    // of these pin the LEFT setting and the alignment they replaced.
    assert.match(css, /\.thesis-section \{[\s\S]*?align-items:\s*stretch;[\s\S]*?text-align:\s*left;/)
    assert.match(css, /\.thesis-closer \{[\s\S]*?text-align:\s*left;/)
    // And the column width is SOLVED against the eyebrow's own offset rather
    // than eyeballed: the eyebrow sits at `(W - min(W, 1480)) / 2 + gutter`
    // from the section edge, and a column centred in a content box already
    // `W - 2 * gutter` wide lands on that same pixel only at this width. If
    // either number moves without the other, the section stops lining up.
    assert.match(css, /\.thesis-column \{[\s\S]*?width:\s*min\(100%, calc\(1480px - var\(--gutter\) \* 2\)\);/)
    assert.match(css, /#root \.thesis-section \.section-eyebrow,[\s\S]*?left:\s*var\(--gutter\);/)
    assert.match(css, /\.thesis-section > \.section-eyebrow,[\s\S]*?align-self:\s*flex-start;[\s\S]*?left:\s*calc\(\(100% - min\(100%, 1480px\)\) \/ 2 \+ var\(--gutter\)\);/)
    assert.match(mobile, /#root \.thesis-section \.section-eyebrow,[\s\S]*?left:\s*var\(--gutter\);/)
  })

  it('renders Damaros through BrandName with a contrast TM', () => {
    assert.match(app, /function BrandName\(\) \{\s*return <>Damaros<sup className="brand-tm">TM<\/sup><\/>/)
    assert.match(css, /\.brand-tm \{[\s\S]*?color:\s*var\(--accent\)/)
    assert.match(app, /<NavLink className="wordmark"[\s\S]*?<BrandName \/>/)
    assert.match(app, /2026 <BrandName \/>/)
  })

  it('holds the drawn frame where there is room for it, and only there', () => {
    // The desktop geometry is still exact - it is just asked for by the
    // window's own width now, so a narrow column is never handed a frame
    // it cannot fit.
    assert.match(css, /@container product-window \(min-width: 901px\) \{[\s\S]*?#root \.hero-workspace \{[\s\S]*?height:\s*799px;[\s\S]*?min-height:\s*799px;[\s\S]*?max-height:\s*799px;/)
    assert.match(css, /@container product-window \(min-width: 901px\) \{[\s\S]*?#root \.hero-app-grid,[\s\S]*?height:\s*753px;[\s\S]*?min-height:\s*753px;[\s\S]*?max-height:\s*753px;/)
    assert.match(css, /@container control-window \(min-width: 901px\) \{[\s\S]*?#root \.control-system \{[\s\S]*?height:\s*680px;[\s\S]*?min-height:\s*680px;[\s\S]*?max-height:\s*680px;/)
    assert.match(css, /\.landing-source-demo :is\([^)]+\) \{[\s\S]*?padding:\s*24px 26px 37px;/)
    assert.match(css, /@media \(min-width: 901px\) \{[\s\S]*?\.landing-source-demo \.source-protocol-view \{[\s\S]*?padding-bottom:\s*37px;/)
    // Below that the same panes are sized by what is in them, never cropped.
    assert.match(css, /@container product-window \(max-width: 900px\) \{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*0;[\s\S]*?max-height:\s*none;/)
    assert.match(css, /@container control-window \(max-width: 900px\) \{[\s\S]*?height:\s*auto;[\s\S]*?min-height:\s*0;[\s\S]*?max-height:\s*none;/)
    assert.doesNotMatch(mobile, /height:\s*799px|height:\s*753px|height:\s*680px/)
    assert.doesNotMatch(css, /height:\s*790px/)
    assert.doesNotMatch(css, /min-height:\s*744px/)
    assert.doesNotMatch(css, /\.landing-source-view \.workspace-view \{[\s\S]*?min-height:\s*789px/)
  })

  it('closes the thesis with its own sentence and even section padding', () => {
    // THE HEADLINE IS THE CLOSER NOW. The slogan that sat under the figure
    // answered a claim the reader had already met twice; the claim itself
    // moved down instead - the section's one sentence, under the drawing
    // that earns it, still breaking where the statement turns and keeping
    // the accent on the first statement. It is the section's one heading,
    // so it is an h2.
    assert.match(app, /<h2 className="thesis-closer"><span className="thesis-line accent-text">The next generation of medicine<\/span><span className="thesis-line">cannot run on yesterday's research infrastructure\.<\/span><\/h2>/)
    assert.doesNotMatch(app, /is building what comes next/)
    assert.match(css, /#root \.thesis-closer \.thesis-line \{[^}]*display:\s*block;/)
    // The sentence runs on the same body-anchored ramp the two product deks
    // run on, pinned at `#root` because four grouped rules in the sheet used
    // to size this element as a page heading. If any of them is ever
    // re-added, the thesis line silently goes back to four inches and this
    // is the thing that notices.
    assert.match(css, /#root \.thesis-closer \{\s*\n\s*font-size:\s*clamp\(1\.34rem, 1\.1rem \+ 1\.02vw, 2\.05rem\);/)
    assert.doesNotMatch(css, /\.thesis-closer,\n\.capacity-section \.section-heading h2/)
    assert.doesNotMatch(css, /#root \.section-heading h2,\n#root \.thesis-closer/)
    // And it sits UNDER the drawing. Order in the source is the order on the
    // page.
    assert.match(app, /className="thesis-chain">[\s\S]*?<\/div>\s*\n\s*<h2 className="thesis-closer">/)
    assert.match(css, /\.thesis-section\.section-space \{[\s\S]*?padding-block:\s*112px;/)
    assert.match(css, /\.landing-hero \{[\s\S]*?padding:\s*clamp\(196px, 22vh, 248px\) var\(--gutter\) 112px;/)
    assert.match(app, /className="hero-scroll-cue"/)
    assert.doesNotMatch(css, /\.thesis-section\.section-space \{[\s\S]*?padding-top:\s*64px;/)
  })
})

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
    assert.match(app, /<SectionEyebrow>Thesis<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow>Capacity<\/SectionEyebrow>/)
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

    // TRIDENT AND NECTAR ARE NAMES, NOT LABELS. Six sections carry an eyebrow;
    // four are topics and two are products, and they were all set at fourteen
    // pixels in weight 400 - so the two things on this site with names of their
    // own were drawn at the volume of the word "Capacity". Only the two products
    // carry `brand`, and the other four must not.
    assert.equal((app.match(/<SectionEyebrow brand>/g) || []).length, 2)
    for (const topic of ['Thesis', 'Capacity', 'Control', 'Pilot']) {
      assert.match(app, new RegExp(`<SectionEyebrow>${topic}</SectionEyebrow>`))
    }
    assert.match(app, /function SectionEyebrow\(\{ children, brand = false \}\)/)
    assert.match(app, /className=\{`section-eyebrow\$\{brand \? ' is-brand' : ''\}`\}/)

    // Size AND weight, because either alone reads as an accident, and both are
    // re-solved here rather than pinned loosely: the brand size has to clear the
    // label size at every viewport on the 360-to-1600 line the whole sheet runs
    // on, and the weight has to be the heaviest Switzer ships.
    assert.match(css, /--type-brand-eyebrow:\s*clamp\(([\d.]+)rem, ([\d.]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\);/)
    const pick = (name) => css.match(new RegExp(`--type-${name}:\\s*clamp\\(([\\d.]+)rem, ([\\d.]+)rem \\+ ([\\d.]+)vw, ([\\d.]+)rem\\);`)).slice(1).map(Number)
    const at = ([min, base, slope, max], width) => Math.min(Math.max(base * 16 + (slope / 100) * width, min * 16), max * 16)
    const label = pick('eyebrow')
    const brand = pick('brand-eyebrow')
    for (const width of [360, 768, 1280, 1600]) {
      assert.ok(at(brand, width) >= at(label, width) * 1.5, `the brand eyebrow is not clearly larger at ${width}px`)
    }
    assert.match(css, /\.section-eyebrow\.is-brand,\s*\n#root \.section-eyebrow\.is-brand \{[\s\S]*?font-weight:\s*700;/)
    assert.match(css, /\.section-eyebrow\.is-brand,[\s\S]*?font-size:\s*var\(--type-brand-eyebrow\);/)
    // Deeper ink than the labels', so the two names are separated by colour as
    // well as by weight.
    assert.match(css, /\.section-eyebrow\.is-brand,[\s\S]*?color:\s*var\(--accent-strong\);/)
    assert.match(css, /\.section-eyebrow,[\s\S]*?color:\s*var\(--accent\);/)
    // Tracking comes DOWN. Letterspacing is what makes fourteen pixels of
    // uppercase legible; at twenty-two it stops a word being a word.
    const tracking = (rule) => Number(css.match(new RegExp(`${rule}[\\s\\S]*?letter-spacing:\\s*([\\d.]+)em`))[1])
    assert.ok(tracking('\\.section-eyebrow\\.is-brand,') < tracking('\\.section-eyebrow,'))
    // And it stays Switzer. Endless ships one weight, 400, with
    // `font-synthesis: none` set on the eyebrow - so the display face at "bold"
    // is the display face at 400, which is lighter than the headline beside it.
    assert.doesNotMatch(css.match(/\.section-eyebrow\.is-brand,[\s\S]*?\n\}/)[0], /font-family/)
    assert.match(css, /@font-face \{\s*\n\s*font-family: 'Endless';[\s\S]*?font-weight: 400;/)
    assert.equal((css.match(/font-family: 'Endless';/g) || []).length, 1)
    // The mobile sheet restates the eyebrow rule at `#root .section-eyebrow`, so
    // the brand rule has to out-specify it or the phone gets the label treatment.
    assert.match(css, /#root \.section-eyebrow\.is-brand \{/)
    assert.match(css, /\.page-spine \{[\s\S]*?width:\s*34px;/)
    assert.match(css, /\.site-nav-wrap \{[\s\S]*?z-index:\s*50;[\s\S]*?isolation:\s*isolate;/)
    assert.match(css, /\.thesis-section \{[\s\S]*?align-items:\s*stretch;[\s\S]*?text-align:\s*center;/)
    assert.match(css, /\.thesis-head \{[\s\S]*?align-items:\s*center;[\s\S]*?text-align:\s*center;/)
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

  it('answers the thesis with the brand mark and even section padding', () => {
    assert.match(app, /<span className="thesis-line accent-text">The next generation of medicine<\/span><span className="thesis-line">cannot run on yesterday's research infrastructure\.<\/span>/)
    assert.match(css, /#root \.thesis-head h2 \.thesis-line \{[^}]*display:\s*block;/)
    assert.match(app, /className="thesis-closer"><BrandName \/> is building what comes next\./)
    assert.match(css, /\.thesis-section\.section-space \{[\s\S]*?padding-block:\s*112px;/)
    assert.match(css, /\.landing-hero \{[\s\S]*?padding:\s*clamp\(196px, 22vh, 248px\) var\(--gutter\) 112px;/)
    assert.match(app, /className="hero-scroll-cue"/)
    assert.doesNotMatch(css, /\.thesis-section\.section-space \{[\s\S]*?padding-top:\s*64px;/)
  })
})

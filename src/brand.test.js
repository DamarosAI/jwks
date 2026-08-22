import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const mobile = await readFile(new URL('./mobile.css', import.meta.url), 'utf8')

describe('Damaros brand mark', () => {
  it('moves spine titles into home eyebrows and keeps the spine numeric', () => {
    assert.match(app, /<span>\{String\(index \+ 1\)\.padStart\(2, '0'\)\}<\/span>/)
    assert.doesNotMatch(app, /<strong>\{label\}<\/strong>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Home<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow>Thesis<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow>Capacity<\/SectionEyebrow>/)
    assert.match(app, /<SectionEyebrow>Control<\/SectionEyebrow>/)
    assert.match(app, /\{!about && <SectionEyebrow>Pilot<\/SectionEyebrow>\}/)
    assert.doesNotMatch(app, /<SectionEyebrow>About<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Founder<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>Why now<\/SectionEyebrow>/)
    assert.doesNotMatch(app, /<SectionEyebrow>People<\/SectionEyebrow>/)
    assert.match(css, /--type-eyebrow:\s*0\.92rem;/)
    assert.match(css, /\.section-eyebrow,[\s\S]*?font-family:\s*var\(--font-ui\);[\s\S]*?font-size:\s*var\(--type-eyebrow\);[\s\S]*?letter-spacing:\s*0\.16em;[\s\S]*?text-transform:\s*uppercase;/)
    assert.match(mobile, /#root \.section-eyebrow,[\s\S]*?font-family:\s*var\(--font-ui\);[\s\S]*?font-size:\s*var\(--type-eyebrow\);[\s\S]*?letter-spacing:\s*0\.16em;/)
    assert.doesNotMatch(mobile, /section-eyebrow[^{]*\{[^}]*font-size:\s*0\.72rem/)
    assert.match(css, /\.page-spine \{[\s\S]*?width:\s*34px;/)
    assert.match(css, /\.site-nav-wrap \{[\s\S]*?z-index:\s*50;[\s\S]*?isolation:\s*isolate;/)
    assert.match(css, /\.thesis-section \{[\s\S]*?align-items:\s*stretch;[\s\S]*?text-align:\s*center;/)
    assert.match(css, /\.thesis-head \{[\s\S]*?align-items:\s*center;[\s\S]*?text-align:\s*center;/)
    assert.match(css, /#root \.thesis-section \.section-eyebrow,[\s\S]*?left:\s*max\(28px, 4vw\);/)
    assert.match(css, /\.thesis-section > \.section-eyebrow,[\s\S]*?align-self:\s*flex-start;[\s\S]*?left:\s*calc\(\(100% - min\(100%, 1480px\)\) \/ 2 \+ max\(28px, 4vw\)\);/)
    assert.match(mobile, /#root \.thesis-section \.section-eyebrow,[\s\S]*?left:\s*16px;/)
  })

  it('renders Damaros through BrandName with a contrast TM', () => {
    assert.match(app, /function BrandName\(\) \{\s*return <>Damaros<sup className="brand-tm">TM<\/sup><\/>/)
    assert.match(css, /\.brand-tm \{[\s\S]*?color:\s*var\(--accent\)/)
    assert.match(app, /<NavLink className="wordmark"[\s\S]*?<BrandName \/>/)
    assert.match(app, /2026 <BrandName \/>/)
  })

  it('locks landing and control frames to one static size', () => {
    assert.match(css, /#root \.hero-workspace \{[\s\S]*?height:\s*799px;[\s\S]*?min-height:\s*799px;[\s\S]*?max-height:\s*799px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.hero-app-grid,[\s\S]*?height:\s*753px;[\s\S]*?min-height:\s*753px;[\s\S]*?max-height:\s*753px;/)
    assert.match(css, /#root \.control-system \{[\s\S]*?height:\s*680px;[\s\S]*?min-height:\s*680px;[\s\S]*?max-height:\s*680px;/)
    assert.match(css, /\.landing-source-demo :is\([^)]+\) \{[\s\S]*?padding:\s*24px 26px 37px;/)
    assert.match(css, /@media \(min-width: 901px\) \{[\s\S]*?\.landing-source-demo \.source-protocol-view \{[\s\S]*?padding-bottom:\s*37px;/)
    assert.match(mobile, /#root \.hero-workspace \{[\s\S]*?height:\s*799px;[\s\S]*?max-height:\s*799px;/)
    assert.match(mobile, /#root \.hero-workspace \.hero-app-grid \{[\s\S]*?height:\s*753px;[\s\S]*?max-height:\s*753px;/)
    assert.match(mobile, /#root \.control-system \{[\s\S]*?height:\s*680px;[\s\S]*?max-height:\s*680px;/)
    assert.doesNotMatch(css, /height:\s*790px/)
    assert.doesNotMatch(css, /min-height:\s*744px/)
    assert.doesNotMatch(css, /\.landing-source-view \.workspace-view \{[\s\S]*?min-height:\s*789px/)
  })

  it('answers the thesis with the brand mark and even section padding', () => {
    assert.match(app, /className="accent-text">The future of medicine<\/span> cannot run on yesterday's research infrastructure\./)
    assert.match(app, /className="thesis-closer"><BrandName \/> is building what comes next\./)
    assert.match(css, /\.thesis-section\.section-space \{[\s\S]*?padding-block:\s*112px;/)
    assert.match(css, /\.landing-hero \{[\s\S]*?padding:\s*clamp\(196px, 22vh, 248px\) max\(28px, 4vw\) 112px;/)
    assert.match(app, /className="hero-scroll-cue"/)
    assert.doesNotMatch(css, /\.thesis-section\.section-space \{[\s\S]*?padding-top:\s*64px;/)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'

const css = await readSource(new URL('./styles.css', import.meta.url))
const app = await readSource(new URL('./App.jsx', import.meta.url))

describe('ambient motion', () => {
  it('leaves the source-system logos still', () => {
    // Five logos is a list, not a stream. Scrolling a duplicated copy of it
    // made a fixed list look endless and moved for a reason no reader could
    // act on, so the panel holds them in place and nothing animates.
    assert.doesNotMatch(css, /integration-(track|scroll|viewport)/)
    assert.doesNotMatch(app, /integration-(track|scroll|viewport)/)
    assert.match(css, /\.integration-grid \{[\s\S]*?grid-template-columns: repeat\(5, minmax\(0, 1fr\)\);/)
  })

  it('keeps biomarker trails falling during scroll on every viewport', () => {
    // Scoped to BiomarkerRain: the Trident and Nectar diagrams are deliberately
    // narrow-gated, so a file-wide assertion would forbid the wrong thing.
    const start = app.indexOf('function BiomarkerRain(')
    const rain = app.slice(start, app.indexOf('\nfunction ', start + 1))
    assert.match(rain, /const animate = shouldRunAmbient\(\{ reduced, inView \}\)/)
    assert.doesNotMatch(rain, /shouldRunAmbient\(\{ reduced, inView, narrow \}\)/)
    assert.match(rain, /const narrow = useMediaQuery\(NARROW_VIEWPORT\)/)
    assert.doesNotMatch(css, /html\.is-scrolling \.biomarker-rain/)
    assert.doesNotMatch(css, /#root \.biomarker-rain \{\s*display:\s*none;/)
    assert.match(css, /\.biomarker-rain span \{[\s\S]*?animation:\s*biomarker-fall/)
    assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.biomarker-rain \{\s*display:\s*none;/)
  })

  it('sizes the logo panel against itself, not the viewport', () => {
    // The panel is a quarter of the section on a desktop and the full column on
    // a phone. A viewport query cannot tell those apart; the panel's own width
    // can, so the bays follow the container.
    assert.match(css, /\.connector-closeup \{[\s\S]*?container: systems-panel \/ inline-size;/)
    assert.match(css, /@container systems-panel \(max-width: 640px\)/)
  })
})

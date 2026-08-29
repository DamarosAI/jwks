import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'

const css = await readSource(new URL('./styles.css', import.meta.url))
const mobile = await readSource(new URL('./mobile.css', import.meta.url))
const app = await readSource(new URL('./App.jsx', import.meta.url))
const main = await readSource(new URL('./main.jsx', import.meta.url))

describe('one responsive design', () => {
  it('loads the phone sheet last and keeps the spine under the nav', () => {
    assert.match(main, /import '\.\/styles\.css'[\s\S]*import '\.\/mobile\.css'/)
    assert.match(mobile, /#root \.page-spine,[\s\S]*?top:\s*calc\(max\(8px,/)
    // The spine sizes itself to however many sections a page has, so adding
    // or removing one never leaves an empty column behind.
    assert.match(mobile, /#root \.page-spine,[\s\S]*?grid-auto-flow:\s*column;[\s\S]*?grid-auto-columns:\s*minmax\(0, 1fr\);/)
    assert.doesNotMatch(mobile, /grid-template-columns:\s*repeat\(\d+, minmax\(0, 1fr\)\);\s*\n\s*align-content/)
    assert.match(app, /const narrow = useMediaQuery\(NARROW_VIEWPORT\)[\s\S]*?const \[visible, setVisible\] = useState\(about \|\| narrow\)/)
  })

  it('sizes the page on a fluid scale instead of a second set of sizes', () => {
    for (const token of ['--fluid-display', '--fluid-h2', '--fluid-lead', '--fluid-body', '--fluid-section-space', '--gutter']) {
      assert.match(css, new RegExp(`${token}:\\s*clamp\\(`))
    }
    assert.match(css, /#root \.hero-heading,[\s\S]*?font-size:\s*var\(--fluid-display\);/)
    assert.match(css, /#root \.section-heading h2,[\s\S]*?font-size:\s*var\(--fluid-h2\);/)
    assert.match(css, /#root \.section-space \{\s*padding-block:\s*var\(--fluid-section-space\);/)
    // The phone sheet is chrome only. It must not restate an editorial size.
    assert.doesNotMatch(mobile, /#root \.hero-heading \{[^}]*font-size:/)
    assert.doesNotMatch(mobile, /#root \.hero-copy > p \{[^}]*font-size:/)
    assert.doesNotMatch(mobile, /#root \.about-hero-copy h1 \{[^}]*font-size:/)
    assert.doesNotMatch(mobile, /#root \.final-cta h2 \{[^}]*font-size:/)
    assert.doesNotMatch(mobile, /\.thesis-closer[^{]*\{[^}]*font-size:/)
    assert.doesNotMatch(mobile, /--mobile-display/)
  })

  it('runs one workspace at every width, never a shrunken copy of it', () => {
    // No zoom, no preview frame, no second composition.
    assert.doesNotMatch(mobile, /zoom:/)
    assert.doesNotMatch(css, /zoom:\s*0\./)
    assert.doesNotMatch(app, /MobilePreviewFrame/)
    assert.doesNotMatch(app, /mobile-preview-eyebrow/)
    assert.doesNotMatch(app, /mobile-workspace-hint/)
    // The window answers to its own width, so a narrow desktop column and a
    // phone get the same treatment.
    assert.match(css, /\.hero-workspace-wrap \{[^}]*container:\s*product-window \/ inline-size;/)
    assert.match(css, /\.control-system-wrap \{[\s\S]*?container:\s*control-window \/ inline-size;/)
    assert.match(app, /<div className="control-system-wrap">/)
    assert.match(css, /@container product-window \(max-width: 900px\) \{[\s\S]*?#root \.hero-app-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
    assert.match(css, /@container control-window \(max-width: 900px\) \{[\s\S]*?#root \.control-product-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
  })

  it('reflows every record on a phone instead of switching it off', () => {
    for (const pane of ['source-patient-list', 'obligation-list', 'replay-ledger', 'evidence-coverage', 'source-protocol-summary', 'source-criteria-list', 'source-amendment', 'resolve-compare-bar', 'recommended-action', 'screen-result-pair']) {
      assert.doesNotMatch(mobile, new RegExp(`\\.${pane}[^{]*\\{[^}]*display:\\s*none`))
    }
    assert.match(css, /@container product-window \(max-width: 640px\) \{[\s\S]*?#root \.hero-workspace \.source-protocol-summary,[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
    assert.match(css, /@media \(max-width: 640px\) \{[\s\S]*?\.source-protocol-summary,\s*\n\.source-evidence-grid,\s*\n\.source-screen-grid,\s*\n\.source-replay-grid \{\s*grid-template-columns:\s*1fr;/)
  })

  it('keeps the workspace off phones, and the pan free of chrome', () => {
    // THE LIVE WORKSPACE IS A DESK INSTRUMENT. At product density it needs a
    // desk's width; at 380 pixels it was the tallest, densest block on the
    // page, a cramped model of an instrument playing to nobody. On a phone it
    // does not render at all - the figures below carry the product - and the
    // markup stays in place behind the one narrow gate, so nothing else about
    // the hero changes. In a narrow desktop WINDOW it still renders and still
    // reflows through its own container queries, which is why those rules
    // survive it.
    assert.match(app, /\{narrow \? null : <div className="hero-workspace-wrap"><MiniRun \/><\/div>\}/)
    assert.match(app, /const playing = shouldPlayAutoplay\(\{ reduced, held, inView, visible \}\)/)
    assert.doesNotMatch(mobile, /animation:\s*none !important/)
    // Lying on its side the rail marker has to become an underline.
    assert.match(css, /@container product-window \(max-width: 900px\) \{[\s\S]*?#root \.hero-app-nav button\.active::before \{[\s\S]*?height:\s*3px;/)
    // And the figures pan with NO VISIBLE CHROME: a figure cut at both edges
    // says it continues, a finger says where, and a scrollbar drawn over the
    // sheet is the one piece of browser furniture the drawing cannot absorb.
    assert.match(mobile, /#root \.dgm-frame \{[\s\S]*?scrollbar-width: none;/)
    assert.match(mobile, /#root \.dgm-frame::-webkit-scrollbar \{ display: none; \}/)
  })
})

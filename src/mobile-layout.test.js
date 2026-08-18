import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./mobile.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const main = await readFile(new URL('./main.jsx', import.meta.url), 'utf8')

describe('mobile miniature layout', () => {
  it('loads correction last and keeps section spine below navigation', () => {
    assert.match(main, /import '\.\/styles\.css'[\s\S]*import '\.\/mobile\.css'/)
    assert.match(css, /#root \.page-spine,[\s\S]*?top:\s*calc\(max\(8px,[\s\S]*?grid-template-columns:\s*repeat\(6,/)
    assert.match(app, /const narrow = useMediaQuery\(NARROW_VIEWPORT\)[\s\S]*?const \[visible, setVisible\] = useState\(about \|\| narrow\)/)
  })

  it('keeps desktop product rails inside scaled mobile canvases', () => {
    assert.match(css, /#root \.hero-workspace-wrap \{[\s\S]*?zoom:\s*0\.42;/)
    assert.match(css, /#root \.hero-workspace \.hero-app-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?grid-template-rows:\s*52px minmax\(0, 1fr\);/)
    assert.match(css, /#root \.agent-console-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
    assert.match(css, /#root \.agent-console-nav \{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(76px, 1fr\)\);/)
    assert.match(css, /#root \.node-product-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
  })

  it('clips mobile extras so stage CTAs stay in the crop', () => {
    assert.match(css, /#root \.hero-actions \{[\s\S]*?grid-template-columns:\s*1fr;/)
    assert.match(css, /#root \.page-spine,[\s\S]*?background:\s*var\(--bg\);/)
    assert.match(css, /#root \.biomarker-rain \{\s*top:\s*168px;/)
    assert.match(css, /#root \.hero-heading \.hero-line:first-child \{\s*white-space:\s*normal;/)
    assert.match(css, /#root \.hero-workspace \.source-patient-list,[\s\S]*?#root \.hero-workspace \.replay-ledger \{\s*display:\s*none;/)
    assert.match(css, /#root \.agent-run-rail \{\s*display:\s*none;/)
    assert.match(css, /#root \.node-system \.source-protocol-summary,[\s\S]*?display:\s*none;/)
    assert.match(css, /#root \.page-shell:has\(\.about-hero\) \.final-cta > p:not\(\.section-eyebrow\) \{[\s\S]*?font-size:\s*0\.75rem;/)
    assert.doesNotMatch(css, /#root \.biomarker-rain \{\s*display:\s*none;/)
  })

  it('keeps product frames static and pauses autoplay on narrow screens', () => {
    assert.match(css, /#root \.hero-workspace \{[\s\S]*?height:\s*799px;[\s\S]*?max-height:\s*799px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.agent-console-grid \{[\s\S]*?height:\s*780px;[\s\S]*?max-height:\s*780px;/)
    assert.match(css, /#root \.node-system \{[\s\S]*?height:\s*680px;[\s\S]*?max-height:\s*680px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.node-control-detail,[\s\S]*?max-height:\s*100%;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /overflow-x:\s*clip;/)
    assert.equal((app.match(/const playing = !narrow && shouldPlayAutoplay/g) || []).length, 2)
    assert.doesNotMatch(app, /mobile-workspace-hint/)
  })
})

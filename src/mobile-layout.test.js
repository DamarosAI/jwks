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
    assert.match(css, /#root \.hero-workspace \.hero-app-grid \{[\s\S]*?grid-template-columns:\s*150px minmax\(0, 1fr\);/)
    assert.match(css, /#root \.agent-console-grid \{[\s\S]*?grid-template-columns:\s*170px minmax\(0, 1fr\);/)
    assert.match(css, /#root \.node-product-grid \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\);/)
  })

  it('removes fixed clipping and pauses product autoplay on narrow screens', () => {
    assert.match(css, /#root \.node-control-detail,[\s\S]*?max-height:\s*none;[\s\S]*?overflow:\s*visible;/)
    assert.match(css, /overflow-x:\s*clip;/)
    assert.equal((app.match(/const playing = !narrow && shouldPlayAutoplay/g) || []).length, 2)
    assert.doesNotMatch(app, /mobile-workspace-hint/)
  })
})

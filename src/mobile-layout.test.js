import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('mobile landing layout', () => {
  it('keeps navigation compact and removes the obstructing page spine', () => {
    assert.match(css, /@media \(max-width: 640px\)[\s\S]*?#root \.site-nav \{[\s\S]*?min-height:\s*62px;/)
    assert.match(css, /#root \.page-spine \{\s*display:\s*none;/)
  })

  it('caps the product preview and exposes scrollable workflow stages', () => {
    assert.match(css, /#root \.hero-workspace \{[\s\S]*?height:\s*556px;[\s\S]*?max-height:\s*556px;/)
    assert.match(css, /#root \.hero-workspace \.hero-app-nav \{[\s\S]*?grid-auto-flow:\s*column;[\s\S]*?overflow-x:\s*auto;/)
    assert.match(app, /Live execution chain/)
    assert.match(app, /Tap a stage to inspect the workflow\./)
  })

  it('uses dense cards and full-width site controls without horizontal page overflow', () => {
    assert.match(css, /#root \.capacity-bento \{\s*grid-auto-flow:\s*dense;/)
    assert.match(css, /#root \.node-product-grid \{[\s\S]*?display:\s*block;/)
    assert.match(css, /#root \.node-source-nav \{[\s\S]*?overflow-x:\s*auto;/)
    assert.match(css, /body \{[\s\S]*?min-width:\s*0;[\s\S]*?overflow-x:\s*hidden;/)
  })
})

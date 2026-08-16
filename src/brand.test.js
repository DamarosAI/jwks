import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')

describe('Damaros brand mark', () => {
  it('removes the thesis eyebrow', () => {
    assert.doesNotMatch(app, /section-kicker">Thesis/)
  })

  it('renders Damaros through BrandName with a contrast TM', () => {
    assert.match(app, /function BrandName\(\) \{\s*return <>Damaros<sup className="brand-tm">TM<\/sup><\/>/)
    assert.match(css, /\.brand-tm \{[\s\S]*?color:\s*var\(--accent\)/)
    assert.match(app, /<NavLink className="wordmark"[\s\S]*?<BrandName \/>/)
    assert.match(app, /2026 <BrandName \/>/)
  })
})

import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')

describe('site type', () => {
  it('renders chrome at a legible control size without movement', () => {
    assert.match(css, /--nav-height:\s*72px/)
    assert.match(css, /\.wordmark \{[\s\S]*?font-size:\s*21px/)
    assert.match(css, /--type-control:\s*16px/)
    assert.match(css, /--type-product-control:\s*15px/)
    assert.doesNotMatch(css, /\.button:hover \{[\s\S]*?translateY\(-1px\)/)
  })

  it('declares the supplied Endless file honestly and protects compact controls', () => {
    assert.match(css, /@font-face\s*\{[\s\S]*?font-weight:\s*400;/)
    assert.doesNotMatch(css, /@font-face\s*\{[\s\S]*?font-weight:\s*100\s+900;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?font-kerning:\s*none;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?font-feature-settings:\s*'kern'\s+0,\s*'liga'\s+0,\s*'calt'\s+0;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?text-rendering:\s*geometricPrecision;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?-webkit-font-smoothing:\s*antialiased;/)
    assert.match(css, /#root :is\([\s\S]*?\.wordmark,[\s\S]*?\.desktop-nav-links a,[\s\S]*?\.footer-mark p/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?letter-spacing:\s*var\(--tracking-control\);/)
    assert.match(css, /#root \.landing-source-demo :is\([\s\S]*?font-size:\s*var\(--type-product-control\);/)
    assert.doesNotMatch(css, /-webkit-font-smoothing:\s*subpixel-antialiased/)
    assert.doesNotMatch(css, /text-rendering:\s*optimizeLegibility/)
  })
})

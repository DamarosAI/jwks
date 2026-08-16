import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')

describe('site type', () => {
  it('renders chrome at a hinted size with kerning instead of raw geometric faces', () => {
    assert.match(css, /--nav-height:\s*72px/)
    assert.match(css, /\.wordmark \{[\s\S]*?font-size:\s*21px/)
    assert.match(css, /\.button \{[\s\S]*?font-size:\s*15px/)
    assert.match(css, /\.pilot-foot \.button \{[\s\S]*?font-size:\s*15px/)
    assert.match(css, /-webkit-font-smoothing:\s*subpixel-antialiased/)
    assert.match(css, /font-kerning:\s*normal/)
    assert.doesNotMatch(css, /text-rendering:\s*geometricPrecision/)
    assert.doesNotMatch(css, /\.button:hover \{[\s\S]*?translateY\(-1px\)/)
  })
})

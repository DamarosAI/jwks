import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')

describe('site-control workspace geometry', () => {
  it('holds one desktop height across every control and review state', () => {
    assert.match(css, /--node-detail-min-height:\s*647px/)
    assert.match(css, /\.node-control-detail \{[\s\S]*?min-height:\s*var\(--node-detail-min-height\)/)
  })

  it('uses the landing workspace control geometry', () => {
    const inlineFooter = css.match(/\.inline-action-panel footer \{([^}]*)\}/)?.[1] ?? ''
    const inlineButton = css.match(/\.inline-action-panel footer \.button \{([^}]*)\}/)?.[1] ?? ''
    const securityAction = css.match(/\.node-control-detail \.inline-action-panel \{([^}]*)\}/)?.[1] ?? ''
    assert.match(css, /\.node-policy-item \{[\s\S]*?min-height:\s*64px;[\s\S]*?border-radius:\s*10px;/)
    assert.match(css, /\.node-review-button \{[\s\S]*?min-height:\s*48px;[\s\S]*?border-radius:\s*10px;[\s\S]*?font-size:\s*15px;/)
    assert.match(inlineFooter, /align-items:\s*center;/)
    assert.match(inlineButton, /height:\s*48px;/)
    assert.match(inlineButton, /border-radius:\s*10px;/)
    assert.match(securityAction, /flex:\s*1;/)
    assert.match(securityAction, /min-height:\s*0;/)
  })
})

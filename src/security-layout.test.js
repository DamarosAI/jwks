import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

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

  it('runs a complete, persistent site-review workflow', () => {
    assert.match(app, /const \[reviewPhase, setReviewPhase\] = useState\('idle'\)/)
    assert.match(app, /setReviewPhase\('saving'\)/)
    assert.match(app, /setReviewedControls\(\(current\) => \(\{ \.\.\.current, \[record\]: true \}\)\)/)
    assert.match(app, /setReviewPhase\('complete'\)/)
    assert.match(app, /REVIEW ID/)
    assert.match(app, /Execution record updated/)
    assert.match(app, /Authenticated site reviewer/)
  })

  it('aligns the site-control rail with the agents console', () => {
    assert.match(css, /#root \.node-section \{\s*width:\s*min\(100%, 1500px\);/)
    assert.match(css, /#root \.node-product-grid \{\s*grid-template-columns:\s*220px minmax\(0, 1fr\);/)
    assert.match(app, /Site 018 - Damaros Health/)
    assert.doesNotMatch(app, /Northstar/)
    assert.doesNotMatch(app, /node-source-item[\s\S]*?<strong>\{source\.name\}<\/strong>/)
  })

  it('keeps every security workflow control inside one geometry system', () => {
    assert.match(css, /\.site-control-review \{[\s\S]*?flex:\s*1;[\s\S]*?overflow:\s*hidden;[\s\S]*?border-radius:\s*12px;/)
    assert.match(css, /\.site-control-review > footer \.button \{[\s\S]*?height:\s*48px;[\s\S]*?border-radius:\s*10px;[\s\S]*?font-size:\s*15px;/)
    assert.match(css, /\.site-review-summary,[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  })
})

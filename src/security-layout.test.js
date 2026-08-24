import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('site-control workspace geometry', () => {
  it('holds one desktop height across every control and review state', () => {
    assert.match(css, /--control-detail-min-height:\s*520px/)
    assert.match(css, /\.control-control-detail \{[\s\S]*?min-height:\s*var\(--control-detail-min-height\)/)
    assert.match(css, /#root \.control-system \{[\s\S]*?height:\s*680px;[\s\S]*?min-height:\s*680px;[\s\S]*?max-height:\s*680px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.control-control-detail \{[\s\S]*?height:\s*100%;[\s\S]*?max-height:\s*100%;[\s\S]*?overflow:\s*hidden;/)
    assert.match(app, /className=\{completedReview \? 'is-reviewed' : 'is-pending'\}/)
    assert.doesNotMatch(app, /completedReview && <div className="is-reviewed">/)
  })

  it('uses the landing protocol workspace for inspect and review', () => {
    assert.match(app, /className="workspace-view source-protocol-view control-control-view"/)
    assert.match(app, /className=\{`workspace-view source-protocol-view control-control-view site-control-review is-\$\{phase\}`\}/)
    assert.match(app, /className="protocol-source-head"/)
    assert.match(app, /className="source-amendment"/)
    assert.match(app, /className="source-protocol-summary"/)
    assert.match(app, /className="source-criteria-head"/)
    assert.match(app, /className="source-criteria-list"/)
    assert.match(css, /\.control-control-detail \{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;/)
    assert.match(css, /\.control-control-view\.workspace-view,[\s\S]*?\.site-control-review\.workspace-view \{[\s\S]*?border:\s*0;[\s\S]*?box-shadow:\s*none;/)
    assert.match(css, /#root \.control-control-view\.workspace-view,[\s\S]*?#root \.site-control-review\.workspace-view \{[\s\S]*?border:\s*0;[\s\S]*?box-shadow:\s*none;/)
    assert.match(css, /\.control-review-button \{[\s\S]*?min-height:\s*44px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(css, /\.control-ghost-button \{[\s\S]*?min-height:\s*44px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(css, /\.landing-source-demo,[\s\S]*?\.control-system \{[\s\S]*?font-synthesis:\s*none;/)
    assert.match(css, /\.control-system :is\(b, strong\) \{[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /#root \.control-control-view :is\([\s\S]*?\.control-review-button,[\s\S]*?border-radius:\s*8px;[\s\S]*?font-size:\s*var\(--type-product-control\);[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /\.control-control-view\.source-protocol-view > h4 \{[\s\S]*?font-size:\s*1\.48rem;/)
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

  it('aligns the site-control rail with the landing sidebar', () => {
    assert.match(css, /#root \.control-section \{\s*width:\s*min\(100%, 1500px\);/)
    assert.match(css, /#root \.control-product-grid \{[\s\S]*?grid-template-columns:\s*228px minmax\(0, 1fr\);/)
    assert.match(css, /\.control-policy-item \{[\s\S]*?min-height:\s*38px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(app, /Site 018 - Damaros Health/)
    assert.doesNotMatch(app, /Northstar/)
    assert.doesNotMatch(app, /control-source-item/)
  })

  it('keeps every security workflow control inside one geometry system', () => {
    assert.match(css, /\.site-control-review \{[\s\S]*?flex:\s*1;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /\.control-control-view \{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /\.control-review-actions \{[\s\S]*?display:\s*flex;/)
    const site = app.slice(app.indexOf('function SiteControlSection'))
    assert.match(site, /useSoftSwap\(reduced\)/)
    assert.match(site, /control-control-detail\$\{fading \? ' is-fading' : ''\}/)
    assert.match(css, /\.control-control-detail\.is-fading \{[\s\S]*?opacity:\s*0;/)
  })

  it('keeps the control boundary in the protocol amendment band', () => {
    assert.match(app, /const \[selectedControl, setSelectedControl\] = useState\(0\)/)
    assert.match(app, /Trident runs inside site boundary/)
    assert.match(app, /CONTROL BOUNDARY/)
    assert.doesNotMatch(app, /className="control-control-footer"/)
    assert.doesNotMatch(app, /control-release-card/)
  })

  it('shows Trident status as static label (no toggle switch)', () => {
    assert.doesNotMatch(app, /function TridentStatusSwitch\(/)
    assert.doesNotMatch(app, /role="switch"/)
    assert.match(app, /Trident on site/)
  })

  it('keeps the inspect card on protocol rhythm without a fact slab', () => {
    assert.doesNotMatch(app, /className="control-control-facts"/)
    assert.doesNotMatch(app, /SITE CONTROL PLANE/)
    assert.doesNotMatch(app, /SELECTED CONTROL/)
    assert.doesNotMatch(app, /ACTIVE CONTROLS/)
    assert.match(app, /Local sources\. Local signatures\./)
    assert.doesNotMatch(app, /className="control-custody-path"/)
    assert.doesNotMatch(app, /className="control-control-fill"/)
    assert.match(app, /SHA-256/)
    assert.match(app, /Ed25519/)
    assert.match(app, /Governed Trident harness\. No PHI egress\./)
    assert.doesNotMatch(app, /boundaryNote/)
    assert.match(app, /className="source-arm"/)
    assert.match(app, /LEDGER - 3 EVENTS - SITE 018/)
  })
})

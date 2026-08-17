import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('site-control workspace geometry', () => {
  it('holds one desktop height across every control and review state', () => {
    assert.match(css, /--node-detail-min-height:\s*520px/)
    assert.match(css, /\.node-control-detail \{[\s\S]*?min-height:\s*var\(--node-detail-min-height\)/)
    assert.match(css, /#root \.node-system \{[\s\S]*?height:\s*680px;[\s\S]*?min-height:\s*680px;[\s\S]*?max-height:\s*680px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.node-control-detail \{[\s\S]*?height:\s*100%;[\s\S]*?max-height:\s*100%;[\s\S]*?overflow:\s*hidden;/)
    assert.match(app, /className=\{completedReview \? 'is-reviewed' : 'is-pending'\}/)
    assert.doesNotMatch(app, /completedReview && <div className="is-reviewed">/)
  })

  it('uses the landing protocol workspace for inspect and review', () => {
    assert.match(app, /className="workspace-view source-protocol-view node-control-view"/)
    assert.match(app, /className=\{`workspace-view source-protocol-view node-control-view site-control-review is-\$\{phase\}`\}/)
    assert.match(app, /className="protocol-source-head"/)
    assert.match(app, /className="source-amendment"/)
    assert.match(app, /className="source-protocol-summary"/)
    assert.match(app, /className="source-criteria-head"/)
    assert.match(app, /className="source-criteria-list"/)
    assert.match(css, /\.node-control-detail \{[\s\S]*?border:\s*0;[\s\S]*?background:\s*transparent;/)
    assert.match(css, /\.node-control-view\.workspace-view,[\s\S]*?\.site-control-review\.workspace-view \{[\s\S]*?border:\s*0;[\s\S]*?box-shadow:\s*none;/)
    assert.match(css, /#root \.node-control-view\.workspace-view,[\s\S]*?#root \.site-control-review\.workspace-view \{[\s\S]*?border:\s*0;[\s\S]*?box-shadow:\s*none;/)
    assert.match(css, /\.node-review-button \{[\s\S]*?min-height:\s*44px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(css, /\.node-ghost-button \{[\s\S]*?min-height:\s*44px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(css, /\.landing-source-demo,[\s\S]*?\.node-system \{[\s\S]*?font-synthesis:\s*none;/)
    assert.match(css, /\.node-system :is\(b, strong\) \{[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /#root \.node-control-view :is\([\s\S]*?\.node-review-button,[\s\S]*?border-radius:\s*8px;[\s\S]*?font-size:\s*var\(--type-product-control\);[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /\.node-control-view\.source-protocol-view > h4 \{[\s\S]*?font-size:\s*1\.48rem;/)
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
    assert.match(css, /#root \.node-section \{\s*width:\s*min\(100%, 1500px\);/)
    assert.match(css, /#root \.node-product-grid \{[\s\S]*?grid-template-columns:\s*228px minmax\(0, 1fr\);/)
    assert.match(css, /\.node-policy-item \{[\s\S]*?min-height:\s*38px;[\s\S]*?border-radius:\s*8px;/)
    assert.match(app, /Site 018 - Damaros Health/)
    assert.doesNotMatch(app, /Northstar/)
    assert.doesNotMatch(app, /node-source-item/)
  })

  it('keeps every security workflow control inside one geometry system', () => {
    assert.match(css, /\.site-control-review \{[\s\S]*?flex:\s*1;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /\.node-control-view \{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /\.node-review-actions \{[\s\S]*?display:\s*flex;/)
    const site = app.slice(app.indexOf('function SiteNodeSection'))
    assert.match(site, /useSoftSwap\(reduced\)/)
    assert.match(site, /node-control-detail\$\{fading \? ' is-fading' : ''\}/)
    assert.match(css, /\.node-control-detail\.is-fading \{[\s\S]*?opacity:\s*0;/)
  })

  it('keeps the control boundary in the protocol amendment band', () => {
    assert.match(app, /const \[selectedControl, setSelectedControl\] = useState\(0\)/)
    assert.match(app, /No LLM touches patient data/)
    assert.match(app, /CONTROL BOUNDARY/)
    assert.doesNotMatch(app, /className="node-control-footer"/)
    assert.doesNotMatch(app, /node-release-card/)
  })

  it('keeps a model-path isolate switch in the landing sidebar', () => {
    assert.match(app, /function ModelPathSwitch\(/)
    assert.match(app, /<ModelPathSwitch \/>/)
    assert.doesNotMatch(app.slice(app.indexOf('function AgentOperations'), app.indexOf('function SiteNodeSection')), /<ModelPathSwitch/)
    assert.match(app, /className="agent-run-path"/)
    assert.match(app, /role="switch"/)
    assert.match(app, /AI isolated\. No LLM or cloud inference\./)
    assert.match(app, /<small>AI CONNECTION<\/small>/)
    assert.match(app, /isolated \? 'Isolated' : 'Connected'/)
    assert.doesNotMatch(app, /Local only/)
    assert.doesNotMatch(app, /MODEL PATH/)
    assert.match(css, /\.model-path-switch \{[\s\S]*?border-radius:\s*10px;/)
    assert.match(css, /\.hero-app-nav \.model-path-switch,[\s\S]*?\.node-source-nav \.model-path-switch \{[\s\S]*?min-height:\s*40px;[\s\S]*?padding:\s*6px 8px 6px 10px;/)
    assert.match(css, /#root \.model-path-switch small,[\s\S]*?font-size:\s*0\.5rem;[\s\S]*?font-weight:\s*750;/)
    assert.match(css, /#root \.model-path-switch strong,[\s\S]*?font-size:\s*0\.72rem;[\s\S]*?font-weight:\s*650;/)
    assert.doesNotMatch(css, /\.node-source-nav \.model-path-switch \{[\s\S]*?width:\s*196px/)
    assert.match(css, /\.model-path-switch\.is-isolated \.model-path-track > i/)
    assert.match(app, /playing = !narrow && shouldPlayAutoplay\([^\n]+\) && !isolated/)
  })

  it('keeps the inspect card on protocol rhythm without a fact slab', () => {
    assert.doesNotMatch(app, /className="node-control-facts"/)
    assert.doesNotMatch(app, /SITE CONTROL PLANE/)
    assert.doesNotMatch(app, /SELECTED CONTROL/)
    assert.doesNotMatch(app, /ACTIVE CONTROLS/)
    assert.match(app, /Local sources\. Local signatures\./)
    assert.doesNotMatch(app, /className="node-custody-path"/)
    assert.doesNotMatch(app, /className="node-control-fill"/)
    assert.match(app, /SHA-256/)
    assert.match(app, /Ed25519/)
    assert.match(app, /No LLM on patient data/)
    assert.doesNotMatch(app, /boundaryNote/)
    assert.match(app, /className="source-arm"/)
    assert.match(app, /LEDGER - 3 EVENTS - SITE 018/)
  })
})

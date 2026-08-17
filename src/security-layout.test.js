import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('site-control workspace geometry', () => {
  it('holds one desktop height across every control and review state', () => {
    assert.match(css, /--node-detail-min-height:\s*520px/)
    assert.match(css, /\.node-control-detail \{[\s\S]*?min-height:\s*var\(--node-detail-min-height\)/)
    assert.match(css, /#root \.node-system \{[\s\S]*?height:\s*640px;[\s\S]*?min-height:\s*640px;[\s\S]*?max-height:\s*640px;[\s\S]*?overflow:\s*hidden;/)
    assert.match(css, /#root \.node-control-detail \{[\s\S]*?height:\s*100%;[\s\S]*?max-height:\s*100%;[\s\S]*?overflow:\s*hidden;/)
    assert.match(app, /className=\{completedReview \? 'is-reviewed' : 'is-pending'\}/)
    assert.doesNotMatch(app, /completedReview && <div className="is-reviewed">/)
  })

  it('uses the landing workspace control geometry', () => {
    const inlineFooter = css.match(/\.inline-action-panel footer \{([^}]*)\}/)?.[1] ?? ''
    const inlineButton = css.match(/\.inline-action-panel footer \.button \{([^}]*)\}/)?.[1] ?? ''
    const securityAction = css.match(/\.node-control-detail \.inline-action-panel \{([^}]*)\}/)?.[1] ?? ''
    assert.match(css, /\.node-policy-item \{[\s\S]*?min-height:\s*40px;[\s\S]*?border-radius:\s*10px;/)
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
    assert.match(css, /#root \.node-product-grid \{[\s\S]*?grid-template-columns:\s*228px minmax\(0, 1fr\);/)
    assert.match(app, /Site 018 - Damaros Health/)
    assert.doesNotMatch(app, /Northstar/)
    assert.doesNotMatch(app, /node-source-item[\s\S]*?<strong>\{source\.name\}<\/strong>/)
  })

  it('keeps every security workflow control inside one geometry system', () => {
    assert.match(css, /\.site-control-review \{[\s\S]*?flex:\s*1;[\s\S]*?overflow:\s*hidden;[\s\S]*?border-radius:\s*12px;/)
    assert.match(css, /\.site-control-review > footer \.button \{[\s\S]*?height:\s*48px;[\s\S]*?border-radius:\s*10px;[\s\S]*?font-size:\s*15px;/)
    assert.match(css, /\.site-review-summary,[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
  })

  it('pins a steel footer on the evidence inspect card', () => {
    assert.match(app, /const \[selectedControl, setSelectedControl\] = useState\(0\)/)
    assert.match(app, /No LLM touches patient data/)
    assert.match(app, /className="node-control-footer"/)
    assert.match(css, /\.node-control-footer \{[\s\S]*?flex-shrink:\s*0;[\s\S]*?background:\s*var\(--accent\)/)
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
    assert.match(css, /\.model-path-switch\.is-isolated \.model-path-track > i/)
    assert.match(app, /playing = !narrow && shouldPlayAutoplay\([^\n]+\) && !isolated/)
  })

  it('keeps the inspect card dense without a fact slab', () => {
    assert.doesNotMatch(app, /className="node-control-facts"/)
    assert.doesNotMatch(app, /SITE CONTROL PLANE/)
    assert.doesNotMatch(app, /SELECTED CONTROL/)
    assert.doesNotMatch(app, /ACTIVE CONTROLS/)
    assert.match(app, /Local sources\. Local signatures\./)
    assert.match(app, /className="node-custody-path"/)
    assert.match(app, /SHA-256 hash-linked/)
    assert.match(app, /Ed25519 verified/)
    assert.match(app, /No LLM on patient data/)
    assert.doesNotMatch(app, /boundaryNote/)
    assert.match(app, /className="node-control-fill"/)
    assert.match(app, /className="node-control-copy"/)
    assert.match(css, /\.node-control-copy,[\s\S]*?display:\s*grid;[\s\S]*?gap:\s*5px;/)
    assert.match(css, /\.node-custody-path \{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/)
    assert.match(css, /\.node-control-fill \{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?grid-template-columns:\s*minmax\(0, 1\.15fr\) minmax\(220px, 0\.85fr\);/)
    assert.match(css, /#root \.node-control-copy :is\(small, strong, em\)[\s\S]*?display:\s*block;/)
  })
})

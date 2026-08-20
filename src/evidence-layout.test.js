import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')

const evidenceView = app.slice(app.indexOf('function EvidenceView'), app.indexOf('function ScreeningView'))
const receipt = evidenceView.slice(evidenceView.indexOf('evidence-action-receipt'))

describe('evidence obligation pane', () => {
  it('keeps provenance on one line and never orphans a trailing E', () => {
    assert.match(css, /\.obligation-detail dl > div \{[\s\S]*?grid-template-columns:\s*max-content minmax\(0,\s*1fr\)/)
    assert.match(css, /\.obligation-detail dt \{[\s\S]*?white-space:\s*nowrap/)
    assert.match(evidenceView, /<dt>PROVENANCE<\/dt>/)
  })

  it('drops the SLA row from ACTION RECORDED so the screening CTA fits', () => {
    assert.match(receipt, /ACTION RECORDED/)
    assert.match(receipt, /Continue to Screening/)
    assert.doesNotMatch(receipt, /<dt>SLA<\/dt>/)
    assert.doesNotMatch(evidenceView, /\["SLA", 'Review within 24 hours'\]/)
  })

  it('pins the screening button inside the detail pane instead of clipping it', () => {
    assert.match(css, /\.obligation-detail > \.pane-settle \{[\s\S]*?overflow:\s*visible/)
    assert.match(css, /\.source-evidence-view \{[\s\S]*?min-height:\s*0/)
    assert.match(css, /\.evidence-action-receipt \{[\s\S]*?flex:\s*0 0 auto/)
    assert.match(css, /\.evidence-action-receipt button \{[\s\S]*?flex:\s*0 0 auto/)
    assert.doesNotMatch(css, /\.obligation-detail \{ min-height: 500px;/)
  })

  it('lets every evidence obligation stay selected after a user pick', () => {
    assert.match(app, /shouldFollowDemoSelection/)
    assert.match(app, /playing=\{playing\}/)
    assert.match(app, /evidenceLocked/)
    assert.match(evidenceView, /setLocked\(true\)/)
    assert.match(evidenceView, /shouldFollowDemoSelection\(\{ playing, locked, busy:/)
    assert.doesNotMatch(evidenceView, /if \(refreshing \|\| pendingAction\) return\s*setSelected\(autoplayIndex\(tick, 5\)\)/)
  })
})

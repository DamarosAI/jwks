import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PANE_SETTLE_CLASS, PANE_SETTLE_MS, paneSettleClass, prefersReducedMotion } from './motion.js'

describe('pane settle', () => {
  it('keeps first paint still and arms later swaps', () => {
    assert.equal(PANE_SETTLE_CLASS, 'pane-settle')
    assert.equal(PANE_SETTLE_MS, 180)
    assert.equal(paneSettleClass(false, false), 'pane-settle')
    assert.equal(paneSettleClass(true, false), 'pane-settle is-settling')
  })

  it('skips travel when motion is reduced', () => {
    assert.equal(paneSettleClass(true, true), 'pane-settle')
    assert.equal(prefersReducedMotion(() => ({ matches: true })), true)
    assert.equal(prefersReducedMotion(() => ({ matches: false })), false)
    assert.equal(prefersReducedMotion(undefined), false)
  })
})

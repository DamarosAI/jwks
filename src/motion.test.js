import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PANE_SETTLE_CLASS, PANE_SETTLE_MS, easeSectionScroll, paneSettleClass, prefersReducedMotion, sectionScrollDuration, sectionScrollTarget } from './motion.js'

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

describe('section scroll', () => {
  it('centers a short section in the usable viewport', () => {
    assert.equal(sectionScrollTarget({
      sectionTop: 2000,
      sectionHeight: 400,
      viewportHeight: 1000,
      documentHeight: 5000,
    }), 1700)
    assert.equal(sectionScrollTarget({
      sectionTop: 2000,
      sectionHeight: 400,
      viewportHeight: 1000,
      documentHeight: 5000,
      insetTop: 80,
    }), 1660)
  })

  it('keeps a tall section opening in frame instead of jumping to its middle', () => {
    assert.equal(sectionScrollTarget({
      sectionTop: 2000,
      sectionHeight: 2000,
      viewportHeight: 800,
      documentHeight: 6000,
      insetTop: 80,
    }), 1920)
  })

  it('clamps the last section to the document end', () => {
    assert.equal(sectionScrollTarget({
      sectionTop: 4500,
      sectionHeight: 400,
      viewportHeight: 1000,
      documentHeight: 5000,
    }), 4000)
  })

  it('keeps a full-viewport hero at the top', () => {
    assert.equal(sectionScrollTarget({
      sectionTop: 0,
      sectionHeight: 1000,
      viewportHeight: 1000,
      documentHeight: 4000,
      insetTop: 90,
    }), 0)
  })

  it('keeps hops short and eases through the middle', () => {
    assert.equal(sectionScrollDuration(0, 800), 300)
    assert.equal(sectionScrollDuration(2400, 800), 480)
    assert.equal(easeSectionScroll(0), 0)
    assert.equal(easeSectionScroll(1), 1)
    assert.ok(easeSectionScroll(0.5) > 0.49 && easeSectionScroll(0.5) < 0.51)
  })
})

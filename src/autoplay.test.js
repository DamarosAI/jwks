import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  AGENT_ROTATE_TICKS,
  AGENT_TICK_MS,
  AUTOPLAY_RESUME_MS,
  HERO_STAGE_MS,
  HERO_TICK_MS,
  LIVE_STAGE_MS,
  LIVE_TICK_MS,
  SCROLL_IDLE_MS,
  STAGE_FADE_MS,
  autoplayIndex,
  isAutoplayToggle,
  nextStageIndex,
  scrollingDocumentClass,
  shouldHoldAutoplayFromClick,
  shouldKeepPreviousStage,
  shouldFollowDemoSelection,
  shouldPlayAutoplay,
  shouldRunAmbient,
} from './autoplay.js'

function node(match) {
  return { closest: (selector) => (selector === match ? {} : null) }
}

describe('autoplay hold', () => {
  it('stays stopped after a click long enough to read', () => {
    assert.equal(AUTOPLAY_RESUME_MS, 18000)
    assert.equal(shouldHoldAutoplayFromClick(node('[data-autoplay-toggle]')), false)
    assert.equal(shouldHoldAutoplayFromClick(node('button')), true)
  })

  it('keeps hero and agent clocks slow and even', () => {
    assert.ok(HERO_STAGE_MS >= 14000 && HERO_STAGE_MS <= 18000 && HERO_TICK_MS >= 3200 && HERO_TICK_MS <= 4000)
    assert.ok(LIVE_STAGE_MS >= 8000 && LIVE_STAGE_MS <= 10000 && LIVE_TICK_MS <= 2200)
    assert.ok(AGENT_TICK_MS >= 2400 && AGENT_TICK_MS <= 3200 && AGENT_ROTATE_TICKS >= 6)
    assert.ok(STAGE_FADE_MS >= 200 && STAGE_FADE_MS <= 320)
    assert.equal(nextStageIndex(4, 5), 0)
    assert.equal(nextStageIndex(0, 4), 1)
  })

  it('wraps selection indexes', () => {
    assert.equal(autoplayIndex(7, 5), 2)
    assert.equal(autoplayIndex(0, 3, 1), 0)
    assert.equal(autoplayIndex(Number.NaN, 3, 1), 1)
  })

  it('leaves the explicit play control alone', () => {
    assert.equal(isAutoplayToggle(node('[data-autoplay-toggle]')), true)
    assert.equal(isAutoplayToggle(node('button')), false)
    assert.equal(isAutoplayToggle(null), false)
  })

  it('plays on every viewport when the demo is on screen', () => {
    assert.equal(shouldPlayAutoplay({}), true)
    assert.equal(shouldPlayAutoplay({ reduced: true }), false)
    assert.equal(shouldPlayAutoplay({ held: true }), false)
    assert.equal(shouldPlayAutoplay({ inView: false }), false)
    assert.equal(shouldPlayAutoplay({ visible: false }), false)
    assert.equal(shouldPlayAutoplay({ narrow: true }), true)
    assert.equal(shouldPlayAutoplay({ scrollIdle: false }), true)
    assert.ok(SCROLL_IDLE_MS >= 480 && SCROLL_IDLE_MS <= 800)
  })

  it('keeps ambient motion off on small, hidden, or reduced views', () => {
    assert.equal(shouldRunAmbient({}), true)
    assert.equal(shouldRunAmbient({ reduced: true }), false)
    assert.equal(shouldRunAmbient({ inView: false }), false)
    assert.equal(shouldRunAmbient({ narrow: true }), false)
    assert.equal(scrollingDocumentClass(true), '')
    assert.equal(scrollingDocumentClass(false), 'is-scrolling')
  })

  it('keeps the exiting stage only for autoplay crossfades', () => {
    assert.equal(shouldKeepPreviousStage('auto', 2), true)
    assert.equal(shouldKeepPreviousStage('manual', 2), false)
    assert.equal(shouldKeepPreviousStage('auto', null), false)
  })

  it('holds a user-picked evidence obligation instead of snapping back', () => {
    assert.equal(shouldFollowDemoSelection({ playing: true }), true)
    assert.equal(shouldFollowDemoSelection({ playing: true, locked: true }), false)
    assert.equal(shouldFollowDemoSelection({ playing: false }), false)
    assert.equal(shouldFollowDemoSelection({ playing: true, busy: true }), false)
    assert.equal(shouldFollowDemoSelection({}), false)
  })
})

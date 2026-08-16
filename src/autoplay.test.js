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
  autoplayIndex,
  isAutoplayToggle,
  shouldKeepPreviousStage,
  shouldPlayAutoplay,
} from './autoplay.js'

function node(match) {
  return { closest: (selector) => (selector === match ? {} : null) }
}

describe('autoplay hold', () => {
  it('resumes 9 seconds after a click', () => {
    assert.equal(AUTOPLAY_RESUME_MS, 9000)
  })

  it('keeps hero, live, and agent clocks in a living range', () => {
    assert.ok(HERO_STAGE_MS <= 9000 && HERO_TICK_MS <= 2400)
    assert.ok(LIVE_STAGE_MS <= 7000 && LIVE_TICK_MS <= 1800)
    assert.ok(AGENT_TICK_MS <= 1600 && AGENT_ROTATE_TICKS >= 4)
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

  it('plays only when the demo is visible and the page is idle', () => {
    assert.equal(shouldPlayAutoplay({}), true)
    assert.equal(shouldPlayAutoplay({ reduced: true }), false)
    assert.equal(shouldPlayAutoplay({ held: true }), false)
    assert.equal(shouldPlayAutoplay({ inView: false }), false)
    assert.equal(shouldPlayAutoplay({ scrollIdle: false }), false)
    assert.ok(SCROLL_IDLE_MS >= 480 && SCROLL_IDLE_MS <= 800)
  })

  it('keeps the exiting stage only for autoplay crossfades', () => {
    assert.equal(shouldKeepPreviousStage('auto', 2), true)
    assert.equal(shouldKeepPreviousStage('manual', 2), false)
    assert.equal(shouldKeepPreviousStage('auto', null), false)
  })
})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'
import {
  DEMO_PAGE_WHEEL_SURFACES,
  applyPassedPageWheel,
  canElementScroll,
  isIntentionalScrollOverflow,
  pageWheelDelta,
  remainingScroll,
  shouldPassPageWheel,
} from './page-scroll.js'

const app = await readSource(new URL('./App.jsx', import.meta.url))
const css = await readSource(new URL('./styles.css', import.meta.url))
const mobile = await readSource(new URL('./mobile.css', import.meta.url))

const CLIP_SURFACES = /#root :is\(\s*\.hero-workspace,\s*\.hero-app-grid,\s*\.landing-source-view,\s*\.landing-source-view \.workspace-view,\s*\.landing-source-demo,\s*\.landing-source-demo \.workspace-view,\s*\.control-system,[\s\S]*?overflow:\s*clip;[\s\S]*?overscroll-behavior:\s*auto;/

describe('demo page scroll', () => {
  it('covers every live product surface', () => {
    assert.match(DEMO_PAGE_WHEEL_SURFACES, /\.hero-workspace/)
    assert.match(DEMO_PAGE_WHEEL_SURFACES, /\.control-system/)
    assert.match(DEMO_PAGE_WHEEL_SURFACES, /\.landing-source-demo/)
    assert.match(DEMO_PAGE_WHEEL_SURFACES, /\.demo-product/)
    assert.match(DEMO_PAGE_WHEEL_SURFACES, /\.live-workspace/)
  })

  it('treats only auto and scroll overflow as an intentional pane', () => {
    assert.equal(isIntentionalScrollOverflow('auto'), true)
    assert.equal(isIntentionalScrollOverflow('scroll'), true)
    assert.equal(isIntentionalScrollOverflow('overlay'), true)
    assert.equal(isIntentionalScrollOverflow('hidden'), false)
    assert.equal(isIntentionalScrollOverflow('clip'), false)
    assert.equal(isIntentionalScrollOverflow('visible'), false)
    assert.equal(remainingScroll(800, 400, 0, 40), 400)
    assert.equal(remainingScroll(800, 400, 400, 40), 0)
    assert.equal(remainingScroll(800, 400, 120, -40), 120)
  })

  it('lets native page scroll take the wheel over clipped demo chrome', () => {
    const clip = {
      surface: true,
      overflowX: 'clip',
      overflowY: 'clip',
      scrollHeight: 1200,
      clientHeight: 799,
      scrollTop: 0,
    }
    const hidden = {
      overflowX: 'hidden',
      overflowY: 'hidden',
      scrollHeight: 1100,
      clientHeight: 753,
      scrollTop: 80,
    }
    assert.equal(canElementScroll(clip, 0, 80), false)
    assert.equal(canElementScroll(hidden, 0, 80), false)
    assert.equal(shouldPassPageWheel([hidden, clip], 0, 80), false)
    assert.equal(shouldPassPageWheel([{ overflowY: 'visible' }], 0, 80), false)
  })

  it('keeps the wheel inside a real scroll pane that still has room', () => {
    const pane = {
      overflowX: 'hidden',
      overflowY: 'auto',
      scrollHeight: 900,
      clientHeight: 400,
      scrollTop: 20,
    }
    const surface = { surface: true, overflowY: 'clip' }
    assert.equal(canElementScroll(pane, 0, 40), true)
    assert.equal(shouldPassPageWheel([pane, surface], 0, 40), false)
    assert.equal(shouldPassPageWheel([{ ...pane, scrollTop: 500 }, surface], 0, 40), false)
  })

  it('forwards wheel deltas to the document and skips pinch zoom', () => {
    assert.deepEqual(pageWheelDelta({ deltaX: 0, deltaY: 48, deltaMode: 0 }), { x: 0, y: 48 })
    assert.deepEqual(pageWheelDelta({ deltaX: 0, deltaY: 3, deltaMode: 1 }), { x: 0, y: 48 })
    assert.equal(pageWheelDelta({ deltaY: 48, ctrlKey: true }), null)
    assert.equal(pageWheelDelta({ deltaY: 48, defaultPrevented: true }), null)
    const view = { scrolled: [0, 0], scrollBy(x, y) { this.scrolled = [x, y] } }
    applyPassedPageWheel(view, 0, 48)
    assert.deepEqual(view.scrolled, [0, 48])
  })

  it('clips live demo surfaces without trapping page scroll', () => {
    // One clip rule for every width. The phone sheet no longer restates it,
    // because there is no longer a phone-only product geometry to clip.
    assert.match(css, CLIP_SURFACES)
    assert.doesNotMatch(mobile, /overflow:\s*clip;/)
    assert.doesNotMatch(css, /\.landing-source-view \.workspace-view \{[\s\S]*?overscroll-behavior:\s*contain;/)
    assert.match(app, /useDemoPageWheel\(\)/)
  })
})

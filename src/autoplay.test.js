import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { AUTOPLAY_RESUME_MS, isAutoplayToggle } from './autoplay.js'

function node(match) {
  return { closest: (selector) => (selector === match ? {} : null) }
}

describe('autoplay hold', () => {
  it('resumes 9 seconds after a click', () => {
    assert.equal(AUTOPLAY_RESUME_MS, 9000)
  })

  it('leaves the explicit play control alone', () => {
    assert.equal(isAutoplayToggle(node('[data-autoplay-toggle]')), true)
    assert.equal(isAutoplayToggle(node('button')), false)
    assert.equal(isAutoplayToggle(null), false)
  })
})

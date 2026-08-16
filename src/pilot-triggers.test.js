import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { isPilotTrigger } from './pilot-triggers.js'

function node(attrs = {}) {
  return {
    hasAttribute: (name) => Object.hasOwn(attrs, name),
    getAttribute: (name) => (Object.hasOwn(attrs, name) ? attrs[name] : null),
  }
}

describe('isPilotTrigger', () => {
  it('opens from data-pilot-form buttons', () => {
    assert.equal(isPilotTrigger(node({ 'data-pilot-form': '' })), true)
  })

  it('opens from the design mailto CTA', () => {
    assert.equal(isPilotTrigger(node({ href: 'mailto:team@damaros.ai?subject=Damaros%20Pilot%20Inquiry' })), true)
    assert.equal(isPilotTrigger(node({ href: 'mailto:team@damaros.ai?subject=Damaros+Pilot+Inquiry' })), true)
  })

  it('leaves ordinary email and privacy mail alone', () => {
    assert.equal(isPilotTrigger(node({ href: 'mailto:team@damaros.ai' })), false)
    assert.equal(isPilotTrigger(node({ href: 'mailto:team@damaros.ai?subject=Privacy%20policy%20question' })), false)
    assert.equal(isPilotTrigger(node({ href: '#pilot' })), false)
    assert.equal(isPilotTrigger(null), false)
  })
})

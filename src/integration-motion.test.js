import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('connector logo motion', () => {
  it('keeps the marquee moving during ordinary page scroll', () => {
    assert.match(css, /\.integration-track \{[\s\S]*?animation:\s*integration-scroll 30s linear infinite;/)
    assert.doesNotMatch(css, /html\.is-scrolling \.integration-track/)
  })

  it('only disables the marquee for reduced-motion users', () => {
    const disabledRules = css.match(/\.integration-track\s*\{\s*animation:\s*none;/g) ?? []
    assert.equal(disabledRules.length, 1)
    assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.integration-track\s*\{\s*animation:\s*none;/)
    assert.match(app, /const integrationsPlay = shouldRunAmbient\(\{ reduced, inView: integrationsInView \}\)/)
  })
})

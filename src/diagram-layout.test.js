import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const driver = await readFile(new URL('./diagrams/usePhaseCycle.js', import.meta.url), 'utf8')
const trident = await readFile(new URL('./diagrams/TridentConsole.jsx', import.meta.url), 'utf8')
const nectar = await readFile(new URL('./diagrams/NectarConsole.jsx', import.meta.url), 'utf8')

const sources = [driver, trident, nectar]

describe('Trident and Nectar consoles', () => {
  it('keeps the panels on the light field', () => {
    for (const source of [css, ...sources]) {
      assert.doesNotMatch(source, /#0a0f18/i)
      assert.doesNotMatch(source, /rgba\(10,\s*15,\s*24/)
    }
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?background:\s*var\(--surface-solid\);/)
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?border:\s*1px solid var\(--border\);/)
  })

  it('lets the Trident headline wrap instead of running under the panel', () => {
    assert.doesNotMatch(css, /\.trident-copy h2 span \{[^}]*white-space:\s*nowrap/)
    assert.match(css, /\.trident-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.nectar-copy h2 \{[\s\S]*?font-size:\s*clamp\(2\.1rem, 3.2vw, 3.2rem\);/)
    assert.match(css, /\.trident-copy \{[\s\S]*?min-width:\s*0;/)
    assert.match(css, /\.trident-diagram,\s*\n\.nectar-network \{[\s\S]*?min-width:\s*0;/)
  })

  it('stacks both sections before the mobile sheet opens', () => {
    assert.match(css, /@media \(max-width: 900px\) \{[\s\S]*?\.trident-section,\s*\n\s*\.nectar-section \{[\s\S]*?flex-direction:\s*column;/)
  })

  it('drops the absolute eyebrow out of the grid so it aligns with every other section', () => {
    assert.doesNotMatch(css, /\.trident-section > \.section-eyebrow/)
    assert.doesNotMatch(css, /\.nectar-section > \.section-eyebrow/)
  })

  it('matches the product register instead of inventing a second visual language', () => {
    assert.doesNotMatch(app, /Canvas/)
    assert.equal((css.match(/@keyframes pconsole-pulse/g) || []).length, 1)
    for (const source of [trident, nectar]) {
      assert.doesNotMatch(source, /getContext|requestAnimationFrame|<svg/)
      assert.match(source, /className="pconsole-bar"/)
      assert.match(source, /className="pconsole-lights"/)
      assert.match(source, /export default function \w+Console\(\{ animate = true \}\)/)
    }
    assert.match(css, /\.pconsole-kicker \{[\s\S]*?font-size:\s*var\(--type-product-rail\);/)
  })

  it('parks motion with no timer when animate is off', () => {
    assert.match(driver, /if \(!animate\) return undefined/)
    assert.match(driver, /return animate \? \{ phase: tick % phases\.length, cycle \} : \{ phase: rest, cycle \}/)
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\n\s*\.pconsole-live\.is-live i \{ animation: none; \}/)
    for (const source of [trident, nectar]) {
      assert.match(source, /restPhase: REST/)
      assert.match(source, /pconsole-live\$\{animate \? ' is-live' : ''\}/)
    }
  })

  it('leaves the claim readable in the resting state', () => {
    assert.match(trident, /Accepted by M\. Avdol/)
    assert.match(trident, /Receipt written/)
    assert.match(nectar, /Structure crosses\. Records do not\./)
    assert.match(nectar, /refused: true, status: 'STEADY'/)
  })

  it('keeps ontology out of public copy', () => {
    for (const source of [app, css, ...sources]) {
      assert.doesNotMatch(source, /ontolog/i)
    }
  })

  it('keeps console source inside the supplied character set', () => {
    for (const source of sources) {
      const unsupported = [...source].filter((character) => character.codePointAt(0) > 127)
      assert.deepEqual(unsupported, [])
    }
  })
})

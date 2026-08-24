import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const theme = await readFile(new URL('./app.css', import.meta.url), 'utf8')
const main = await readFile(new URL('./main.jsx', import.meta.url), 'utf8')

describe('theme and product language', () => {
  it('loads Tailwind theme tokens without preflight', () => {
    assert.match(main, /import '\.\/app\.css'/)
    assert.match(theme, /@import "tailwindcss\/theme"/)
    assert.match(theme, /@import "tailwindcss\/utilities"/)
    assert.doesNotMatch(theme, /preflight/)
    assert.match(theme, /--color-ground:\s*var\(--bg\)/)
    assert.match(theme, /--font-display:\s*'Endless'/)
  })

  it('locks the public field to light mode', () => {
    assert.match(css, /color-scheme:\s*light/)
    assert.doesNotMatch(css, /@media \(prefers-color-scheme: dark\)/)
  })

  it('places Trident and Nectar on the home spine', () => {
    assert.match(app, /function TridentSection\(/)
    assert.match(app, /function NectarSection\(/)
    assert.match(app, /\['trident', 'Trident', 'Harness'\]/)
    assert.match(app, /\['nectar', 'Nectar', 'Intelligence'\]/)
    assert.match(app, /<TridentSection \/>/)
    assert.match(app, /<NectarSection \/>/)
    assert.match(app, /Any model can propose\./)
    assert.match(app, /None can decide\./)
    assert.match(app, /Execution intelligence that crosses site boundaries\./)
    assert.match(app, /Patient data that never does\./)
    assert.match(app, /Any model can propose\. Your site decides\./)
  })

  it('keeps Nectar pulses off-screen and reduced-motion safe', () => {
    assert.match(app, /const animate = shouldRunAmbient\(\{ reduced, inView \}\)/)
    assert.match(app, /<NectarCanvas animate=\{animate\} \/>/)
    assert.match(css, /@media.*prefers-reduced-motion/)
  })
})

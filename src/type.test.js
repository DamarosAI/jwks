import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('site type', () => {
  it('renders chrome at a legible control size without movement', () => {
    assert.match(css, /--nav-height:\s*72px/)
    assert.match(css, /\.wordmark \{[\s\S]*?font-size:\s*21px/)
    assert.match(css, /--type-control:\s*16px/)
    assert.match(css, /--type-product-control:\s*15px/)
    assert.match(css, /--type-product-floor:\s*0\.8125rem/)
    assert.doesNotMatch(css, /\.button:hover \{[\s\S]*?translateY\(-1px\)/)
  })

  it('declares the supplied Endless file honestly and protects compact controls', () => {
    assert.match(css, /@font-face\s*\{[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /unicode-range:\s*U\+0020-007E;/)
    assert.doesNotMatch(css, /@font-face\s*\{[\s\S]*?font-weight:\s*100\s+900;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?font-kerning:\s*none;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?font-feature-settings:\s*'kern'\s+0,\s*'liga'\s+0,\s*'calt'\s+0;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?text-rendering:\s*auto;/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?-webkit-font-smoothing:\s*antialiased;/)
    assert.match(css, /#root :is\([\s\S]*?\.wordmark,[\s\S]*?\.desktop-nav-links a,[\s\S]*?\.footer-mark p/)
    assert.match(css, /#root :is\([\s\S]*?button,[\s\S]*?letter-spacing:\s*var\(--tracking-control\);/)
    assert.match(css, /#root \.landing-source-demo :is\([\s\S]*?font-size:\s*var\(--type-product-control\);/)
    assert.match(css, /#root :is\([\s\S]*?\.landing-source-demo,[\s\S]*?\.agent-console,[\s\S]*?\.node-security-workspace,[\s\S]*?\.site-control-review/)
    assert.match(css, /#root :is\([\s\S]*?\.agent-console,[\s\S]*?small, em, time, b, dt, span[\s\S]*?font-size:\s*max\(var\(--type-product-floor\),\s*0\.8125rem\)/)
    assert.match(css, /overflow-wrap:\s*break-word/)
    assert.match(css, /\.hero-heading \{[\s\S]*?text-wrap:\s*balance/)
    assert.doesNotMatch(css, /transform-style:\s*preserve-3d/)
    assert.doesNotMatch(css, /skewX|matrix\(/)
    assert.doesNotMatch(css, /-webkit-font-smoothing:\s*subpixel-antialiased/)
    assert.doesNotMatch(css, /text-rendering:\s*(optimizeLegibility|geometricPrecision)/)
  })

  it('keeps rendered copy inside the supplied font character set', () => {
    const renderedCopy = app.replace("document.title = 'Damaros™'", '')
    const unsupported = [...renderedCopy].filter((character) => character.codePointAt(0) > 127)
    assert.deepEqual(unsupported, [])
  })

  it('clears enter transforms so Endless does not stay sheared', () => {
    assert.doesNotMatch(app, /yPercent/)
    assert.match(app, /\.from\('\.hero-line',\s*\{[^}]*clearProps:\s*'transform'/)
    assert.match(app, /\.from\('\.hero-workspace',\s*\{[^}]*clearProps:\s*'transform'/)
    assert.match(app, /gsap\.from\('\.agent-console',\s*\{[\s\S]*?clearProps:\s*'transform'/)
    assert.match(app, /gsap\.from\('\.node-system > \*',\s*\{[\s\S]*?clearProps:\s*'transform'/)
    assert.match(css, /@keyframes view-in\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*\}/)
    assert.match(css, /@keyframes workspace-enter\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*\}/)
    assert.match(css, /@keyframes inline-action-in\s*\{[\s\S]*?from\s*\{\s*opacity:\s*0;\s*\}[\s\S]*?to\s*\{\s*opacity:\s*1;\s*\}/)
    assert.match(css, /\.page-spine\s*\{[\s\S]*?transform:\s*none;/)
  })
})

import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')
const agents = await readFile(new URL('./templates/agents/landing-agents.jsx', import.meta.url), 'utf8')

describe('site type', () => {
  it('renders chrome at a legible control size without movement', () => {
    assert.match(css, /--nav-height:\s*72px/)
    assert.match(css, /\.wordmark \{[\s\S]*?font-size:\s*21px/)
    assert.match(css, /--type-control:\s*16px/)
    assert.match(css, /--type-product-control:\s*15px/)
    assert.match(css, /--type-product-floor:\s*0\.8125rem/)
    assert.match(css, /--type-product-kicker:\s*11px/)
    assert.match(css, /--type-product-kicker-weight:\s*700/)
    assert.match(css, /--type-product-kicker-tracking:\s*0\.04em/)
    assert.match(css, /--type-product-rail:\s*0\.5rem/)
    assert.match(css, /--type-product-title:\s*1\.48rem/)
    assert.match(css, /--type-product-strong:\s*0\.76rem/)
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
    assert.match(css, /#root :is\([\s\S]*?\.landing-source-demo,[\s\S]*?\.agent-console,[\s\S]*?\.node-system,[\s\S]*?\.node-security-workspace,[\s\S]*?\.site-control-review/)
    assert.match(css, /#root :is\([\s\S]*?\.agent-console,[\s\S]*?small, em, time, b, dt, span[\s\S]*?font-size:\s*max\(var\(--type-product-floor\),\s*0\.8125rem\)/)
    assert.match(css, /--font-ui:\s*'Switzer', sans-serif/)
    assert.match(css, /@font-face\s*\{[\s\S]*?font-family:\s*'Switzer';[\s\S]*?switzer-400\.woff2/)
    assert.match(css, /#root,\s*#root :is\(\*\) \{\s*font-family:\s*var\(--font-ui\)/)
    assert.match(css, /\.agent-story-heading p \{[\s\S]*?font-weight:\s*400/)
    assert.match(css, /\.hero-copy > p \{[\s\S]*?font-weight:\s*400/)
    assert.match(css, /\.about-hero-copy h1 \{[\s\S]*?font-weight:\s*400/)
    assert.match(css, /\.founder-section blockquote \{[\s\S]*?font-weight:\s*400/)
    assert.match(css, /\.why-now-lines \.why-now-line strong \{[\s\S]*?font-weight:\s*600/)
    assert.match(css, /\.outcome-panel strong \{[\s\S]*?font-weight:\s*600/)
    assert.doesNotMatch(css, /system-ui/)
    assert.doesNotMatch(css, /Neue Haas Grotesk/)
    assert.doesNotMatch(css, /Helvetica Neue/)
    assert.match(css, /body \{[\s\S]*?font-family:\s*var\(--font-ui\)/)
    assert.match(css, /\.wordmark,[\s\S]*?font-family:\s*var\(--font-display\)/)
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

  it('marks evidence cards with a corner dot instead of a status chip', () => {
    assert.match(app, /className="evidence-status-dot"/)
    assert.doesNotMatch(app, /<em>\{acted\[item\.code\] \? 'ROUTED' : item\.status\}<\/em>/)
    assert.match(css, /\.obligation-list \.evidence-status-dot \{[\s\S]*?background:\s*#f5c518/)
  })

  it('clears enter transforms so Endless does not stay sheared', () => {
    assert.doesNotMatch(app, /yPercent/)
    assert.match(app, /\.from\('\.hero-line',\s*\{[^}]*clearProps:\s*'transform'/)
    assert.match(app, /\.from\('\.hero-workspace',\s*\{[^}]*clearProps:\s*'transform'/)
    assert.match(agents, /gsap\.from\('\.agent-console',\s*\{[\s\S]*?clearProps:\s*'transform'/)
    assert.match(app, /gsap\.from\('\.node-system > \*',\s*\{[\s\S]*?clearProps:\s*'transform'/)
    assert.match(css, /@keyframes view-in\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*\}/)
    assert.match(css, /@keyframes workspace-enter\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*\}/)
    assert.match(css, /@keyframes inline-action-in\s*\{[\s\S]*?from\s*\{\s*opacity:\s*0;\s*\}[\s\S]*?to\s*\{\s*opacity:\s*1;\s*\}/)
    assert.match(css, /\.page-spine\s*\{[\s\S]*?transform:\s*none;/)
    assert.match(css, /#root \.page-spine :is\(button, span\) \{\s*font-family:\s*'Endless', sans-serif;\s*font-weight:\s*400;/)
  })

  it('keeps agent tabs to glyph and name like the landing chips', () => {
    assert.match(agents, /<i \/>\s*<AgentGlyph kind=\{item\.icon\} size=\{14\} \/>\s*\{item\.name\}/)
    assert.doesNotMatch(agents, /<small>\{item\.role\}<\/small>/)
    assert.doesNotMatch(agents, /AgentGlyph kind=\{agent\.icon\} size=\{15\}/)
    assert.match(agents, /<span>\{agent\.name\}<\/span><h3>\{agent\.task\}<\/h3>/)
    assert.match(css, /#root \.agent-console-nav button \{\s*display:\s*grid;[\s\S]*?grid-template-columns:\s*7px 14px minmax\(0, 1fr\);/)
  })

  it('uses landing product labels as the type source for agents and security', () => {
    assert.match(css, /\.protocol-source-head > span,[\s\S]*?font-size:\s*var\(--type-product-kicker\);[\s\S]*?font-weight:\s*var\(--type-product-kicker-weight\);/)
    assert.match(css, /#root \.hero-app-nav > strong,[\s\S]*?#root \.agent-console-nav > span,[\s\S]*?#root \.node-source-nav > span \{[\s\S]*?font-size:\s*var\(--type-product-rail\);[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /#root :is\(\.landing-source-demo, \.agent-console, \.node-system[\s\S]*?\.agent-console-header > div > span,[\s\S]*?\.agent-run-object > span,[\s\S]*?\.node-custody-path small,[\s\S]*?font-size:\s*var\(--type-product-kicker\);/)
    assert.match(css, /#root \.agent-console-header h3 \{[\s\S]*?font-size:\s*var\(--type-product-title\);[\s\S]*?font-weight:\s*400;/)
    assert.match(css, /#root :is\(\.landing-source-demo, \.agent-console, \.node-system\) :is\([\s\S]*?\.trident-list button strong,[\s\S]*?font-size:\s*var\(--type-product-strong\);[\s\S]*?font-weight:\s*400;/)
  })

  it('keeps the agents console grey and colors only metric numbers', () => {
    assert.doesNotMatch(agents, /\{agent\.name\} working/)
    assert.match(agents, /function metricTone\(/)
    assert.match(css, /#root \.agent-console \{\s*--agent-color:\s*var\(--muted\);/)
    assert.match(css, /#root \.agent-console \.metric-tone\.is-bad \{ color: #c23b3b; \}/)
    assert.match(css, /#root \.agent-console \.metric-tone\.is-warn \{ color: #c9a227; \}/)
    assert.match(css, /#root \.agent-console \.metric-tone\.is-good \{ color: var\(--success\); \}/)
  })
})

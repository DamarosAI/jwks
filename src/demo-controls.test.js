import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readSource } from './source-text.js'

const app = await readSource(new URL('./App.jsx', import.meta.url))
const css = await readSource(new URL('./styles.css', import.meta.url))

const SELECTION_LISTS = ['hero-app-nav', 'obligation-list', 'source-patient-list', 'resolve-person-tabs', 'replay-ledger']

describe('demo controls', () => {
  it('lets the row carry its own state instead of labelling it Done', () => {
    assert.doesNotMatch(app, /spine-state/)
    assert.doesNotMatch(app, />Done</)
    assert.doesNotMatch(css, /spine-state/)
    // The visited tone is the whole marker now, so it has to survive.
    assert.match(app, /\$\{index < active \? ' visited' : ''\}/)
    assert.match(css, /\.hero-app-nav button\.visited \{[^}]*color:/)
  })

  it('names people plainly, with nothing to read into', () => {
    for (const easter of ['Bond', 'Leiter', 'Kujo', 'Avdol', 'Netero', 'Freecss', 'Recca', 'Lucchesi', 'Hughes', 'Morn', 'Freecss']) {
      assert.doesNotMatch(app, new RegExp(easter))
    }
    // Every demo person is an initial and an ordinary surname.
    const people = [...app.matchAll(/(?:id: 'S-\d+', name|patient|signer): '([^']+)'/g)].map((match) => match[1])
    assert.ok(people.length >= 12, `expected the demo cast, found ${people.length}`)
    for (const person of people) {
      assert.match(person, /^(?:Dr\. )?[A-Z]\. [A-Z][a-z]+(?:, RN)?$/, `not an unassuming name: ${person}`)
    }
  })

  it('says which row is selected, not only paints it', () => {
    assert.match(app, /aria-current=\{index === active \? 'step' : undefined\}/)
    assert.match(app, /aria-current=\{selected === index \? 'true' : undefined\} onClick=\{\(\) => pickObligation/)
    assert.match(app, /aria-current=\{index === selectedSubject \? 'true' : undefined\}/)
    assert.match(app, /aria-current=\{work === index \? 'true' : undefined\}/)
    assert.match(app, /aria-current=\{selected === index \? 'true' : undefined\} onClick=\{\(\) => \{ setSelected\(index\)/)
    assert.match(app, /role="group" aria-label="Decision to sign"/)
    assert.match(app, /aria-pressed=\{decision === action\.id\}/)
  })

  it('gives every solid action a hover, and only where a pointer can hover', () => {
    const hover = css.match(/@media \(hover: hover\) and \(pointer: fine\) \{[\s\S]*?\n\}/g) || []
    const demoHover = hover.find((block) => block.includes('.source-primary-action'))
    assert.ok(demoHover, 'no hover-capable block covers the demo actions')
    for (const action of ['.source-criteria-head > button', '.source-primary-action', '.source-replay-head > button', '.resolve-sign-row > button', '.evidence-action-receipt button']) {
      assert.ok(demoHover.includes(action), `no hover state for ${action}`)
    }
    assert.match(demoHover, /:hover:not\(:disabled\)/)
  })

  it('stops a disabled control from looking pressable', () => {
    assert.match(css, /:is\(\.source-criteria-head > button, \.source-primary-action, \.source-replay-head > button, \.evidence-action-receipt button\):disabled \{[^}]*cursor:\s*default;/)
    assert.match(css, /#root \.source-decision-list button:disabled \{[^}]*cursor:\s*default;/)
    // A signed decision keeps the receipt's green; the options not taken recede.
    assert.match(css, /#root \.source-decision-list button\.selected:disabled \{[^}]*var\(--success\)/)
    assert.match(css, /#root \.source-decision-list button:disabled:not\(\.selected\):hover \{[^}]*opacity:/)
  })

  it('moves the stage marker with the row rather than popping it', () => {
    assert.match(css, /#root \.hero-app-nav button::before \{[^}]*transform:\s*scaleY\(0\.24\);[^}]*transition:\s*transform/)
    assert.match(css, /#root \.hero-app-nav button\.active::before \{[^}]*transform:\s*scaleY\(1\);/)
    // Lying on its side the marker grows the other way.
    assert.match(css, /@container product-window \(max-width: 900px\) \{\s*#root \.hero-app-nav button::before \{[^}]*transform:\s*scaleX\(0\.24\);/)
    assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*#root \.hero-app-nav button::before \{\s*transition:\s*none;/)
  })

  it('holds a focus ring that survives the surface under it', () => {
    assert.match(css, /#root :is\(\.hero-workspace, \.control-system\) :is\(button, \[role='button'\]\):focus-visible \{\s*outline:\s*2px solid var\(--accent\);/)
    for (const list of SELECTION_LISTS) {
      assert.match(css, new RegExp(`\\.${list}[^{]*button[^{]*\\{`), `${list} has no button styling to focus`)
    }
  })

  it('leaves no stray leading space inside a control', () => {
    assert.doesNotMatch(app, /<b> Verified<\/b>/)
    assert.doesNotMatch(app, /\? ' Replay ready'/)
  })

  it('closes the window with a run bar that tells the truth about the tour', () => {
    assert.match(app, /className="run-statusbar"/)
    assert.match(app, /data-autoplay-toggle/)
    assert.match(app, /aria-pressed=\{playing\}/)
    assert.match(app, /\{playing \? 'Guided run' : 'Manual control'\}/)
    // The run-bar pause is a park, not the click-hold's expiring timer.
    assert.match(app, /setParked\(true\)/)
    assert.match(css, /\.run-statusbar \{/)
    assert.match(css, /\.run-stage-meter i\.is-active \{/)
  })

  it('counts each step on the rail and grounds it with the site card', () => {
    assert.match(app, /STEP_TALLIES/)
    assert.match(app, /className="hero-rail-foot"/)
    assert.match(css, /\.step-tally \{/)
    assert.match(css, /\.hero-rail-foot \{/)
  })

  it('keeps the wide rail geometry behind the wide container gate', () => {
    // A flat late rule out-cascades the stacked phone layout, which is how the
    // rail once ended up a 210px sliver on a 390px window.
    const wide = css.match(/@container product-window \(min-width: 901px\) \{[\s\S]*?\n\}/g) || []
    assert.ok(wide.some((block) => block.includes('grid-template-columns: 210px minmax(0, 1fr)')), 'rail width must sit inside the wide container gate')
  })

  it('scopes the screening queue from the result tiles', () => {
    assert.match(app, /role="group" aria-label="Scope the queue by deterministic result"/)
    assert.match(app, /aria-pressed=\{scope === 'review'\}/)
    assert.match(app, /inScope\(patient\)/)
    // The guided tour only walks the queue while the scope is open.
    assert.match(app, /if \(scope !== 'all'\) return/)
  })

  it('prices every resolve option and names the signer before the pen moves', () => {
    assert.match(app, /className="decision-body"/)
    assert.match(app, /\{action\.impact\}/)
    assert.match(app, /decision-outcome/)
    assert.match(app, /className="resolve-signer"/)
  })

  it('draws the ledger as a chain and seals it in the detail pane', () => {
    assert.match(app, /className="ledger-flag"/)
    assert.match(app, /className="replay-chain-state"/)
    assert.match(css, /\.replay-ledger > button::before \{/)
    assert.match(css, /\.replay-ledger > button::after \{/)
  })
})

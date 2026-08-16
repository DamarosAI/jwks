import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./App.jsx', import.meta.url), 'utf8')

describe('Luna workspace', () => {
  it('replaces the stretched answer card with a dense evidence workspace', () => {
    assert.match(css, /\.agent-console \.agent-luna-workbench \.luna-finding-note \{[\s\S]*?flex:\s*0 0 auto;/)
    assert.match(css, /\.luna-evidence-workspace \{[\s\S]*?grid-template-columns:\s*minmax\(0, 1\.08fr\) minmax\(0, 0\.92fr\);[\s\S]*?grid-auto-flow:\s*dense;/)
    assert.match(app, /className="luna-citation-record luna-source-inspector"/)
    assert.match(app, /Read boundary intact/)
  })

  it('keeps every question and citation interactive and source-linked', () => {
    assert.match(app, /setOpenedCitation\(citation\.id\)/)
    assert.match(app, /openCitation\.id/)
    assert.match(app, /openCitation\.hash/)
    assert.match(app, /Luna cites this row\. Record remains unchanged\./)
  })

  it('uses stable mobile geometry without nested scrolling', () => {
    assert.match(css, /@media \(max-width: 640px\)[\s\S]*?\.agent-console \.agent-luna-workbench \.luna-answer-panel \{\s*min-height:\s*897px;/)
    assert.match(css, /\.luna-answer-body \{[\s\S]*?overflow:\s*hidden;/)
    assert.doesNotMatch(css, /\.luna-(?:answer-panel|answer-body|evidence-workspace|chain|source-inspector)[^{]*\{[^}]*overflow(?:-y)?:\s*(?:auto|scroll)/)
  })

  it('settles answer and source changes with GSAP', () => {
    assert.match(app, /querySelectorAll\('\.luna-finding-head, \.luna-finding-meta, \.luna-finding-note, \.luna-evidence-workspace'\)/)
    assert.match(app, /querySelectorAll\('\.luna-source-inspector > \*'\)/)
  })
})

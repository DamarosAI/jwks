import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8')
const app = await readFile(new URL('./templates/agents/landing-agents.jsx', import.meta.url), 'utf8')

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

  it('keeps Sentinel and Luna inventories to five studies and three chain rows', () => {
    assert.equal((app.match(/\{ id: 'NCT00000/g) || []).length, 5)
    assert.match(app, /coverage: '9\/10'/)
    assert.doesNotMatch(app, /coverage: '[^']*capabilities/)
    assert.doesNotMatch(app, /END-155/)
    assert.doesNotMatch(app, /type: 'WORKLIST WRITE'/)
    assert.match(app, /source: '10:02 - signed'/)
    assert.match(css, /#root \.agent-console \.agent-sentinel-workbench \.sentinel-studies button \{[\s\S]*?flex:\s*0 0 auto;[\s\S]*?min-height:\s*70px;/)
    assert.match(css, /#root \.agent-console \.agent-sentinel-workbench \.sentinel-studies button small \{[\s\S]*?white-space:\s*nowrap;/)
    assert.match(css, /#root \.agent-console \.agent-luna-workbench \.luna-chain button \{[\s\S]*?min-height:\s*68px;/)
  })
})

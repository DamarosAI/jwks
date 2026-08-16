import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const app = await readFile(`${root}src/App.jsx`, 'utf8')
const css = await readFile(`${root}src/styles.css`, 'utf8')

const requiredActions = [
  'Open Evidence',
  'Route to PI review',
  'Open in Resolve →',
  'Accept newer note · ECOG 2',
  'Hold for final pathology',
  'Await scheduled repeat draw',
  'Attest last dose · 05-30',
  'Sign decision',
  'Export Replay',
  'Request amendment from sponsor',
  'Route to coordinator advisory',
  'Surface to sponsor',
]

for (const label of requiredActions) {
  if (!app.includes(label)) throw new Error(`Missing demo action: ${label}`)
}

for (const selector of ['source-criteria-head', 'obligation-detail', 'source-patient-detail', 'source-decision-list', 'replay-ledger']) {
  if (!app.includes(selector) || !css.includes(`.${selector}`)) throw new Error(`Missing demo contract: ${selector}`)
}

if (!app.includes('setSignedDecisions') || !app.includes('resolve-signed-receipt')) throw new Error('Resolve actions must alter signed workflow state')
if (!app.includes('InlineActionPanel') || !app.includes('Prepare sponsor-safe replay') || !app.includes('Nothing downloaded to this device')) throw new Error('Replay export must use an inline action panel')
if (app.includes('URL.createObjectURL') || app.includes('.download =')) throw new Error('Replay preview must never download a file')
if (app.includes('<WorkflowDialog') || app.includes('role="dialog"')) throw new Error('Workflow actions must stay inline and never open modal dialogs')
if ((app.match(/<InlineActionPanel/g) || []).length < 5) throw new Error('Routing and request actions must use contextual inline action panels')

for (const marker of ['Troponin', 'HbA1c', 'eGFR', 'FEV1', 'p-tau217']) {
  if (!app.includes(marker)) throw new Error(`Missing therapeutic-area-agnostic marker: ${marker}`)
}

if (!app.includes('hero-drum-motif')) throw new Error('Landing drum motif missing')
if (css.includes('.biomarker-rain span::before')) throw new Error('Biomarker line trails must stay removed')

if (!app.includes("aria-live=\"polite\"")) throw new Error('Demo actions need an announced confirmation region')
if (!app.includes('A research department,</span>') || !app.includes('deployed like software.')) throw new Error('Capacity thesis drifted')
if (!app.includes('Site-owned execution') || !app.includes('Your site makes the call.') || !app.includes('Replay sealed · Record intact')) {
  throw new Error('Execution record copy drifted')
}
if (app.includes('The execution record stays under site control.')) throw new Error('Old execution record headline remains')
if (!css.includes('.record-spine') || !css.includes('.record-event.is-signed')) throw new Error('Execution record chain styles missing')
if (!app.includes('<h2>Four agents.</h2>') || app.includes('Zero decisions.')) throw new Error('Agent heading drifted')
if (!app.includes('<PageSpine />') || !app.includes('<PageSpine about />')) throw new Error('Page spine missing')
if (!app.includes('landing-source-view')) throw new Error('Landing demo must use source product views')
if (app.includes('>Platform</')) throw new Error('Platform navigation must stay removed')
if (app.includes('key={`evidence-') || app.includes('key={`screen-')) throw new Error('Autoplay must not remount evidence or screening on every tick')
if (!app.includes('useAutoplayHold')) throw new Error('Demo click must hold autoplay')
if (app.includes('TRIAL FINDER') || app.includes('HIGH-FRICTION CRITERIA')) throw new Error('Agent workspace labels must stay out of the header copy')

console.log(`Verified ${requiredActions.length} source-native demo actions and inline workflow panels.`)

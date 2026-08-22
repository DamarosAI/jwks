import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const app = await readFile(`${root}src/App.jsx`, 'utf8')
const catalog = app
const css = await readFile(`${root}src/styles.css`, 'utf8')
const html = await readFile(`${root}index.html`, 'utf8')
const vercel = await readFile(`${root}vercel.json`, 'utf8')
const privacy = await readFile(`${root}src/PrivacyPage.jsx`, 'utf8')
const publicCopy = `${await readFile(`${root}llms.txt`, 'utf8')}\n${await readFile(`${root}public/llms.txt`, 'utf8')}`

if (!publicCopy.includes('Product targets. Do not describe these as shipped') || publicCopy.includes('Also true and safe to say:') || publicCopy.includes('Works with the software a site already runs')) throw new Error('Unproven connector and deployment behavior must remain labeled as product target')
if (!app.includes('Target inputs') || !app.includes('Synthetic walkthrough')) throw new Error('Unproven source-system examples must remain labeled as synthetic target behavior')

const requiredActions = [
  'Open Evidence',
  'Route to PI review',
  'Open in Resolve',
  'Accept newer note - ECOG 2',
  'Hold for final pathology',
  'Await scheduled repeat draw',
  'Attest last dose - 05-30',
  'Sign decision',
  'Export Replay',
]

for (const label of requiredActions) {
  if (!catalog.includes(label)) throw new Error(`Missing demo action: ${label}`)
}

for (const selector of ['source-criteria-head', 'obligation-detail', 'source-patient-detail', 'source-decision-list', 'replay-ledger']) {
  if (!app.includes(selector) || !css.includes(`.${selector}`)) throw new Error(`Missing demo contract: ${selector}`)
}

if (!app.includes('setSignedDecisions') || !app.includes('resolve-signed-receipt')) throw new Error('Resolve actions must alter signed workflow state')
if (!app.includes('InlineActionPanel') || !app.includes('Prepare sponsor-safe replay') || !app.includes('Nothing downloaded to this device')) throw new Error('Replay export must use an inline action panel')
if (app.includes('URL.createObjectURL') || app.includes('.download =')) throw new Error('Replay preview must never download a file')
if (app.includes('<WorkflowDialog') || app.includes('role="dialog"')) throw new Error('Workflow actions must stay inline and never open modal dialogs')
if ((catalog.match(/<InlineActionPanel/g) || []).length < 2) throw new Error('Resolve and Replay actions must use contextual inline action panels')

for (const marker of ['Troponin', 'HbA1c', 'eGFR', 'FEV1', 'p-tau217']) {
  if (!app.includes(marker)) throw new Error(`Missing therapeutic-area-agnostic marker: ${marker}`)
}

if (!app.includes('hero-drum-motif')) throw new Error('Landing drum motif missing')
if (css.includes('.biomarker-rain span::before')) throw new Error('Biomarker line trails must stay removed')

if (!app.includes("aria-live=\"polite\"")) throw new Error('Demo actions need an announced confirmation region')
if (!app.includes('A research department,</span>') || !app.includes('deployed like software.')) throw new Error('Capacity thesis drifted')
if (!app.includes('Site-owned execution') || !app.includes('Your site makes the call.') || !app.includes('Replay sealed - Record intact')) {
  throw new Error('Execution record copy drifted')
}
if (app.includes('The execution record stays under site control.')) throw new Error('Old execution record headline remains')
if (app.includes('record-spine') || css.includes('.record-spine {')) throw new Error('Site-owned execution cards must not keep a left spine')
if (!css.includes('.record-event') || !app.includes('Replay sealed - Record intact') || !css.includes('background: var(--accent-strong)')) throw new Error('Execution record cards must stay blue and bound')
if (!app.includes('control-security-workspace') || !app.includes('Trident execution') || !app.includes('No PHI egress') || !css.includes('.control-control-detail')) {
  throw new Error('Site control must show local Trident custody and fail-closed execution')
}
if (!app.includes('<PageSpine />') || !app.includes('<PageSpine about />')) throw new Error('Page spine missing')
if (!app.includes('sectionScrollTarget') || !app.includes('easeSectionScroll') || !css.includes('.page-spine button') || app.includes('Jump to section') || css.includes('.page-spine a {')) {
  throw new Error('Page spine must scroll sections into the viewport center as buttons, not hash links')
}
if (!app.includes('landing-source-view')) throw new Error('Landing demo must use source product views')
if (app.includes('>Platform</')) throw new Error('Platform navigation must stay removed')
if (app.includes('key={`evidence-') || app.includes('key={`screen-')) throw new Error('Autoplay must not remount evidence or screening on every tick')
if (!app.includes('useAutoplayHold')) throw new Error('Demo click must hold autoplay')
if (app.includes('TRIAL FINDER') || app.includes('HIGH-FRICTION CRITERIA')) throw new Error('Retired labels must stay out of header copy')

if (!app.includes('usePaneSettle') || (catalog.match(/className=\{settle\}/g) || []).length < 4) {
  throw new Error('Selection panes must settle inner copy on change')
}
if (!css.includes('@keyframes pane-settle') || !css.includes('--motion-press-in') || !css.includes('--motion-settle')) {
  throw new Error('Press and settle motion tokens missing')
}
if (/button:active[^{]*\{[^}]*scale\(/.test(css)) {
  throw new Error('Active controls must sink, not scale')
}
if (app.includes('UsClinicMap') || app.includes('Blank_US_Map') || app.includes('CLINIC_NETWORK')) {
  throw new Error('About hero must not load the US clinic map')
}
if (!app.includes('className="about-drum"') || !css.includes('.about-drum')) {
  throw new Error('About hero must use the drum mark')
}
if (!css.includes('.about-network') || !css.includes('border: 0') || !css.includes('box-shadow: none')) {
  throw new Error('About drum must sit without a card frame')
}
if (!app.includes('data-active={active}') || !css.includes('grid-template-columns: 2.15fr 1fr 1fr')) {
  throw new Error('Outcome panels must ease across interpolating columns')
}
if (app.includes('<b>LLM</b>') || app.includes('LLM fetched')) {
  throw new Error('Protocol status line must not bold a single token')
}
if (!app.includes('autoplayIndex') || !app.includes('HERO_STAGE_MS')) {
  throw new Error('Landing autoplay clock missing')
}
if (!app.includes('shouldPlayAutoplay') || !app.includes('useInView') || !app.includes('useScrollIdle')) {
  throw new Error('Autoplay must pause off-screen and while scrolling')
}
if (!app.includes('useDocumentVisible') || !app.includes('useMediaQuery') || !app.includes('shouldRunAmbient') || !app.includes('ignoreMobileResize')) {
  throw new Error('Autoplay and enter motion must respect visibility, narrow viewports, and mobile chrome resize')
}
if (!css.includes('html.is-scrolling') || !css.includes('content-visibility: auto') || !css.includes("font-family: 'Endless'") || !css.includes('font-weight: 400') || css.includes('font-weight: 100 900') || !css.includes('min-height: 100svh') || !css.includes('env(safe-area-inset-top')) {
  throw new Error('Viewport paint budget, stable hero height, safe areas, and single font face are required')
}
if (!app.includes('shouldKeepPreviousStage')) {
  throw new Error('Manual stage clicks must swap instantly')
}
if (!app.includes('useSoftSwap') || !app.includes('shouldHoldAutoplayFromClick') || !css.includes('is-fading')) {
  throw new Error('Autoplay must fade one layer in place and stop on click')
}
if (css.includes('subpixel-antialiased') || !css.includes('text-rendering: auto') || !css.includes('--nav-height: 72px') || !css.includes('font-size: 21px')) {
  throw new Error('Chrome type must use stable native rendering and the larger wordmark')
}
if (/key=\{detail\.code\}|key=\{subject\.id\}|key=\{selectedWork\.key\}|key=\{selectedEvent\.id\}|key=\{criterion\.code\}|key=\{signal\.id\}|key=\{activeQuestion\.q\}|key=\{study\.id\}/.test(app)) {
  throw new Error('Selection panes must update in place, not remount')
}
if (app.includes('scrub: 0.78') || app.includes('scale: 0.975')) {
  throw new Error('Page scroll must not scrub-scale live surfaces')
}
if (/@keyframes pane-settle\s*\{[^}]*translate/.test(css.replace(/\s+/g, ' '))) {
  throw new Error('Pane settle must be opacity-only')
}
if (!css.includes('.landing-source-demo .workspace-view') || !css.includes('animation: none')) {
  throw new Error('Landing demo views must not slide in on every stage')
}
if (!css.includes('font-synthesis: none') || !css.includes('.source-criteria-list > div.is-live')) {
  throw new Error('Demo chrome type must stay unsheared and live-highlighted')
}
if (!app.includes('about-scroll-cue') || !app.includes('hero-scroll-cue') || !app.includes('CaretDown') || !app.includes('why-now-chevron')) {
  throw new Error('About must cue the next section from the first card')
}
if (!css.includes('.thesis-section.section-space') || !css.includes('22vh')) {
  throw new Error('Home hero and thesis must share a scroll stop')
}
if (!app.includes('The future of medicine') || !app.includes("yesterday's research infrastructure") || app.includes('Most clinics cannot budget') || app.includes('whether a site runs one trial or a hundred') || !app.includes('className="thesis-closer"><BrandName /> is building what comes next.')) {
  throw new Error('Thesis must keep the headline, drop the bottleneck panel, and close with the brand mark')
}
if (app.includes('—') || css.includes('—')) {
  throw new Error('Public copy and styles must not use em dashes')
}
if (!app.includes('<span>Evidence stays</span>') || !app.includes('<span>with the site.</span>')) {
  throw new Error('Site control heading must break onto two lines')
}
if ((app.match(/Evidence stays/g) || []).length !== 1 || !app.includes('Local sources. Local signatures.')) {
  throw new Error('Site node window must not repeat the section headline')
}
if (!css.includes('.control-copy h2 span') || !css.includes('white-space: nowrap')) {
  throw new Error('Site headline lines must not wrap mid-phrase')
}
if (!html.includes('<title>Damaros™</title>') || !app.includes("document.title = 'Damaros™'") || !privacy.includes("document.title = 'Damaros™'")) {
  throw new Error('Chrome tab title must be Damaros with a trademark mark')
}
if (!vercel.includes('"framework": "vite"') || !vercel.includes('"buildCommand": "npm run build"') || !vercel.includes('"outputDirectory": "dist"')) {
  throw new Error('Vercel must build the Vite app and serve dist, not raw JSX')
}

console.log(`Verified ${requiredActions.length} source-native demo actions and inline workflow panels.`)

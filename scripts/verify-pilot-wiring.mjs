import { fileURLToPath } from 'node:url'
import { readSource } from '../src/source-text.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const app = await readSource(`${root}src/App.jsx`)
const css = await readSource(`${root}src/styles.css`)
const inquiry = await readSource(`${root}src/PilotInquiry.jsx`)

const buttons = app.match(/<PilotButton\b/g) || []
if (buttons.length < 4) throw new Error(`Expected 4 Start a pilot controls, found ${buttons.length}`)
if (app.includes('PILOT_HREF') || app.includes('subject=Damaros%20Pilot%20Inquiry')) {
  throw new Error('Start a pilot CTAs must open the inquiry form, not mailto')
}
if (!app.includes('.final-cta > .button')) throw new Error('Final CTA scroll surface must target the button, not a leftover mailto anchor')
if (app.includes('.final-cta > a')) throw new Error('Final CTA scroll selector still points at an anchor')
if (app.includes('role="dialog"')) throw new Error('Pilot dialog must stay out of App.jsx so demo actions remain inline')
if (!app.includes('<PilotProvider>')) throw new Error('PilotProvider must wrap the app')

for (const marker of ['data-pilot-form', 'role="dialog"', 'visualViewport', 'Escape', 'openedAt', 'pilot-mark']) {
  if (!inquiry.includes(marker)) throw new Error(`Pilot dialog missing ${marker}`)
}
if (!inquiry.includes('data-state') || !inquiry.includes('is-closing')) {
  throw new Error('Pilot dialog must expose sending, success, and closing states')
}

for (const keyframe of [
  'dm-pilot-in',
  'dm-pilot-out',
  'dm-pilot-fade',
  'dm-pilot-drum-spin',
  'dm-pilot-drum-bounce',
  'dm-pilot-drum-shake',
  'dm-pilot-sent-pulse',
  'dm-pilot-check-draw',
]) {
  if (!css.includes(`@keyframes ${keyframe}`)) throw new Error(`Missing pilot motion: ${keyframe}`)
}

if (!css.includes('.final-cta .button-primary')) throw new Error('Final CTA button styles missing')
if (!css.includes('appearance: none')) throw new Error('Native button appearance must be reset')

console.log(`Verified ${buttons.length} Start a pilot controls, form wiring, and ported dialog motion.`)

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { AGENT_ROTATE_TICKS, AGENT_TICK_MS, HERO_STAGE_MS, HERO_TICK_MS, NARROW_VIEWPORT, autoplayIndex, nextStageIndex, shouldHoldAutoplayFromClick, shouldKeepPreviousStage, shouldPlayAutoplay, shouldRunAmbient, useAutoplayHold, useDocumentVisible, useInView, useMediaQuery, useScrollIdle, useSoftSwap } from './autoplay'
import { easeSectionScroll, sectionScrollDuration, sectionScrollTarget, usePaneSettle, viewportHeight } from './motion'
import { PilotButton, PilotProvider } from './PilotInquiry'
import PrivacyPage from './PrivacyPage'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight,
  ArrowUpRight,
  CaretDown,
  CheckCircle,
  Database,
  EnvelopeSimple,
  FileText,
  Fingerprint,
  List,
  Power,
  ShieldCheck,
  X,
} from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

const ModelPathContext = createContext({ isolated: false, toggle() {} })

function ModelPathProvider({ children }) {
  const [isolated, setIsolated] = useState(false)
  const value = useMemo(() => ({
    isolated,
    toggle: () => setIsolated((current) => !current),
  }), [isolated])
  return <ModelPathContext.Provider value={value}>{children}</ModelPathContext.Provider>
}

function useModelPath() {
  return useContext(ModelPathContext)
}

function ModelPathSwitch() {
  const { isolated, toggle } = useModelPath()
  return (
    <button
      type="button"
      className={`model-path-switch${isolated ? ' is-isolated' : ''}`}
      role="switch"
      aria-checked={!isolated}
      aria-label={isolated ? 'AI isolated. No LLM or cloud inference.' : 'AI connected. No cloud inference.'}
      onClick={toggle}
    >
      <Power size={15} />
      <span>
        <small>AI CONNECTION</small>
        <strong>{isolated ? 'Isolated' : 'Connected'}</strong>
      </span>
      <i className="model-path-track" aria-hidden="true"><i /></i>
    </button>
  )
}

function useEnterMotion(root, reduced, setup, query = '(min-width: 901px)') {
  useGSAP(() => {
    if (reduced) return undefined
    const mm = gsap.matchMedia()
    mm.add(query, () => {
      const tweens = setup() || []
      return () => (Array.isArray(tweens) ? tweens : [tweens]).forEach((tween) => tween?.kill?.())
    })
    return () => mm.revert()
  }, { scope: root, dependencies: [reduced] })
}

let sectionScrollFrame = 0

const AGENTS = [
  {
    name: 'Trident',
    icon: 'trident',
    color: '#2f6193',
    role: 'Protocol intelligence',
    text: 'Drafts the amendment when a rule blocks enrollment.',
    input: 'Protocol v2.1',
    action: '36 criteria compiled',
    output: '25 engine-mapped',
    task: 'Draft a bounded protocol amendment',
    guardrail: 'Draft only. Human signature required.',
    trace: ['Parsed sponsor packet', 'Compared v2.0 to v2.1', 'Queued 14 affected screens'],
    demoLabel: 'CRITERION COMPILER',
    demoColumns: ['Criterion', 'Mapping', 'State'],
    demoRows: [['I-2.1', 'EGFR / ALK status', 'Source'], ['I-4.2', 'ECOG - 14 days', 'Review'], ['E-5.3', 'Therapy washout', 'Computed']],
    cta: 'Draft amendment',
    ctaDone: 'Draft ready for sponsor request',
  },
  {
    name: 'Eye',
    icon: 'eye',
    color: '#248566',
    role: 'Quality signals',
    text: 'Catches drift and deviations while they are still cheap to fix. Watches the process, not people.',
    input: 'Run 018-017',
    action: 'Freshness check',
    output: '1 routed for review',
    task: 'Monitor site quality signals',
    guardrail: 'Signals process drift. Never scores people.',
    trace: ['Read FHIR snapshot', 'Bound 3 source records', 'Routed stale result'],
    demoLabel: 'QUALITY SIGNALS',
    demoColumns: ['Source', 'Freshness', 'Route'],
    demoRows: [['Chemistry panel', '16 days old', 'Review'], ['ECOG note', '4 days old', 'Current'], ['Imaging report', '9 days old', 'Current']],
    cta: 'Escalate to sponsor quality',
    ctaDone: 'Routed - bound to Replay',
  },
  {
    name: 'Luna',
    icon: 'luna',
    color: '#7867a8',
    role: 'Action ledger',
    text: 'Every action lands in the ledger. Luna reads the record and cites every answer; it never writes to it.',
    input: 'Signed site action',
    action: 'Hash-linked write',
    output: 'Replay ready',
    task: 'Interrogate the audit chain',
    guardrail: 'Read only. Every claim cites a signed row.',
    trace: ['Received signed resolution', 'Linked evidence snapshot', 'Verified replay chain'],
    demoLabel: 'ACTION LEDGER',
    demoColumns: ['Event', 'Artifact', 'Integrity'],
    demoRows: [['09:42:08', 'Resolution signed', 'Linked'], ['09:42:09', 'Snapshot sealed', 'Verified'], ['09:42:10', 'Replay prepared', 'Ready']],
    cta: 'Ask the audit chain',
    ctaDone: 'Answer returned with 3 citations',
  },
  {
    name: 'Sentinel',
    icon: 'sentinel',
    color: '#b87922',
    role: 'Opportunity radar',
    text: "Surfaces which open trials the site's patients already fit. Aggregate only, no patient data.",
    input: 'Site coverage graph',
    action: 'Protocol match',
    output: 'Aggregate signal only',
    task: 'Find open protocols Site 018 can support',
    guardrail: 'Aggregate signals only. No patient data.',
    trace: ['Read coverage graph', 'Compared 7 open protocols', 'Prepared site-safe signal'],
    demoLabel: 'OPPORTUNITY RADAR',
    demoColumns: ['Study', 'Coverage', 'Signal'],
    demoRows: [['DMR-311', '8 / 10 capabilities', 'Strong'], ['ONC-089', '6 / 10 capabilities', 'Review'], ['DMR-204', '9 / 10 capabilities', 'Ready']],
    cta: 'Scan open protocols',
    ctaDone: '7 protocols compared - aggregate only',
  },
]

const LUNA_INVESTIGATIONS = [
  { q: 'Why was S-1051 deferred?', cat: 'Eligibility', subject: 'S-1051', asked: '10:04', answer: 'S-1051 deferred on criterion I-3.4 because the qualifying potassium was drawn 06-09, 11 days before evaluation, past the 7-day window. It was routed, not failed.', citations: [{ id: 'Observation/chem-5521', type: 'FHIR OBSERVATION', value: 'K+ 5.0 mmol/L - drawn 06-09', source: '10:02 - signed chain row', hash: 'sha256 - 5521...09af' }, { id: 'Criterion/I-3.4', type: 'PROTOCOL RULE', value: 'Serum chemistry - 7-day window', source: 'Protocol v2.1 - 10:02', hash: 'sha256 - i34...v21' }, { id: 'Review/R-901', type: 'SITE WORK ITEM', value: 'STALE_SOURCE - routed to coordinator', source: '10:04 - site worklist', hash: 'Ed25519 - verified' }, { id: 'Route/WRK-441', type: 'WORKLIST WRITE', value: 'Deferred - not a screen fail', source: '10:04 - coordinator queue', hash: 'sha256 - wrk...441' }] },
  { q: 'Who signed the ECOG override on S-1047?', cat: 'Accountability', subject: 'S-1047', asked: '14:08', answer: 'The PI signed at 14:07, citing the latest oncology note as superseding the stale structured ECOG. The decision was signed and hash-anchored.', citations: [{ id: 'Resolve/EVT-1207', type: 'SIGNED SITE DECISION', value: 'PI signature on ECOG conflict', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Actor/PI-018', type: 'ACCOUNTABLE ACTOR', value: 'Dr. M. Avdol - PI / Sub-I', source: '14:07 - site signature', hash: 'sha256 - pi18...1407' }, { id: 'Rationale/R-884', type: 'DECISION RATIONALE', value: 'Latest note supersedes stale ECOG', source: 'Review R-884 - 14:07', hash: 'sha256 - r884...ecog' }] },
  { q: "Is this run's chain intact?", cat: 'Integrity', subject: 'DMR-204', asked: '14:08', answer: 'Yes. Chain remains intact across all 9 events. Signature is verified. Sponsor-safe replay excludes raw PHI.', citations: [{ id: 'Replay/RPL-1047', type: 'REPLAY RECORD', value: 'Chain intact - 9 of 9 events', source: '14:08 - Replay sealed', hash: 'sha256 - rpl...1047' }, { id: 'Signature/EVT-1207', type: 'SIGNATURE', value: 'Verified - Ed25519', source: '14:08 - manifest', hash: 'Ed25519 - verified' }, { id: 'Export/Boundary', type: 'DATA BOUNDARY', value: 'Sponsor-safe - PHI-free', source: '14:08 - export policy', hash: 'policy - verified' }] },
  { q: 'When was Replay sealed for S-1047?', cat: 'Replay', subject: 'S-1047', asked: '14:09', answer: 'Replay sealed at 14:08 after the PI signature. The sealed record is RPL-1047. Later reads cite that row; they do not rewrite it.', citations: [{ id: 'Replay/RPL-1047', type: 'REPLAY RECORD', value: 'Sealed 14:08 - 9 events', source: '14:08 - Replay', hash: 'sha256 - rpl...1047' }, { id: 'Resolve/EVT-1207', type: 'PRIOR WRITE', value: 'PI signature closed the open item', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Policy/Seal', type: 'SEAL RULE', value: 'Immutable after seal', source: '14:08 - site policy', hash: 'policy - verified' }] },
  { q: 'What bound the potassium on S-1051?', cat: 'Evidence', subject: 'S-1051', asked: '10:03', answer: 'Observation/chem-5521 bound the potassium: 5.0 mmol/L, drawn 06-09, signed into the chain at 10:02. I-3.4 then read that row. Luna did not invent the value.', citations: [{ id: 'Observation/chem-5521', type: 'FHIR OBSERVATION', value: 'K+ 5.0 mmol/L - drawn 06-09', source: '10:02 - signed chain row', hash: 'sha256 - 5521...09af' }, { id: 'Bind/EVT-1104', type: 'EVIDENCE BIND', value: 'Source attached to S-1051', source: '10:02 - Evidence', hash: 'sha256 - bind...1104' }, { id: 'Criterion/I-3.4', type: 'PROTOCOL RULE', value: 'Read bound chem-5521', source: '10:02 - Screening', hash: 'sha256 - i34...v21' }] },
  { q: 'Who wrote the last ledger row?', cat: 'Ledger', subject: 'Site 018', asked: '14:09', answer: 'Last write is Replay seal RPL-1047 at 14:08, system-attributed after Dr. Avdol signed EVT-1207. Luna is read-only and is not on that row.', citations: [{ id: 'Replay/RPL-1047', type: 'LAST WRITE', value: 'Replay sealed - 14:08', source: '14:08 - ledger head', hash: 'sha256 - rpl...1047' }, { id: 'Actor/PI-018', type: 'PRIOR ACTOR', value: 'Dr. M. Avdol signed EVT-1207', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Guard/Luna', type: 'READ BOUNDARY', value: 'Luna never writes the ledger', source: '14:09 - this read', hash: 'policy - verified' }] },
  { q: 'Why is S-1066 still REVIEW?', cat: 'Pending', subject: 'S-1066', asked: '09:58', answer: 'S-1066 stays REVIEW on I-2.1. The EGFR / ALK order is bound. No finalized DiagnosticReport is in the chain. Luna will not invent a result.', citations: [{ id: 'ServiceRequest/mol-1904', type: 'MOLECULAR ORDER', value: 'EGFR / ALK ordered 06-19', source: '09:55 - Evidence', hash: 'sha256 - mol...1904' }, { id: 'DiagnosticReport/mol-pending', type: 'SOURCE STATUS', value: 'Result pending - no final report', source: '09:58 - lab connector', hash: 'sha256 - pend...1066' }, { id: 'Criterion/I-2.1', type: 'PROTOCOL RULE', value: 'EGFR / ALK status required', source: '09:58 - Screening', hash: 'sha256 - i21...v21' }] },
  { q: 'Which events sit in RPL-1047?', cat: 'Replay', subject: 'RPL-1047', asked: '14:09', answer: 'RPL-1047 holds 9 sealed events from the S-1047 run, ending at the PI signature and Replay seal. Later reads cite that row. They do not rewrite it.', citations: [{ id: 'Replay/RPL-1047', type: 'SEALED RECORD', value: '9 of 9 events - sealed 14:08', source: '14:08 - Replay', hash: 'sha256 - rpl...1047' }, { id: 'Resolve/EVT-1207', type: 'TERMINAL EVENT', value: 'PI signature closed the open item', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Policy/Seal', type: 'SEAL RULE', value: 'Immutable after seal', source: '14:08 - site policy', hash: 'policy - verified' }] },
]

function metricTone(kind, value) {
  if (kind === 'friction') return value >= 55 ? 'is-bad' : value >= 35 ? 'is-warn' : 'is-good'
  if (kind === 'fit') return value >= 80 ? 'is-good' : value >= 70 ? 'is-warn' : 'is-bad'
  if (kind === 'signal') return value === 'Spike' ? 'is-bad' : value === 'Drift' ? 'is-warn' : 'is-good'
  return 'is-good'
}

const SENTINEL_STUDIES = [
  { id: 'NCT00000211', title: 'AXL-211 - EGFR+ NSCLC (post-TKI)', phase: 'Ph II', coverage: '9 / 10 capabilities', fit: '94%', status: 'Strong fit', sponsor: 'Cascade Therapeutics', pi: 'Dr. Higashikata', sites: '21 active US sites', window: 'Open through 09-30', scanned: '14:02 - coverage graph', gap: 'None material', concepts: ['EGFR T790M / C797S', 'NSCLC IIIB-IV', 'post-osimertinib', 'ECOG 0-1'] },
  { id: 'NCT00000031', title: 'HEM-31 - second-line DLBCL', phase: 'Ph II', coverage: '8 / 10 capabilities', fit: '82%', status: 'Strong fit', sponsor: 'Northlake Biosciences', pi: 'Dr. Giovanna', sites: '31 active sites', window: 'Open through 10-12', scanned: '14:02 - coverage graph', gap: 'Apheresis slot', concepts: ['DLBCL', 'second line', 'PET-avid', 'CAR-T naive'] },
  { id: 'NCT00000009', title: 'AVT-9 - KRAS G12C solid tumor', phase: 'Ph I/II', coverage: '6 / 10 capabilities', fit: '68%', status: 'Possible fit', sponsor: 'Helix Therapeutics', pi: 'Dr. J. Kujo', sites: '17 active sites', window: 'Dose escalation open', scanned: '14:02 - coverage graph', gap: 'NGS turnaround', concepts: ['KRAS G12C', 'solid tumor', 'dose escalation', 'prior IO allowed'] },
  { id: 'NCT00000184', title: 'CARD-184 - HFpEF outcomes', phase: 'Ph III', coverage: '8 / 10 capabilities', fit: '79%', status: 'Strong fit', sponsor: 'Harbor Cardiometabolic', pi: 'Dr. L. Chen', sites: '44 active US sites', window: 'Open through 11-15', scanned: '14:02 - coverage graph', gap: 'Echo read time', concepts: ['HFpEF', 'NT-proBNP', 'echo within 30 days', 'eGFR at least 30'] },
  { id: 'NCT00000077', title: 'IMM-77 - moderate-severe UC', phase: 'Ph II', coverage: '7 / 10 capabilities', fit: '74%', status: 'Possible fit', sponsor: 'Solstice Immunology', pi: 'Dr. A. Okonkwo', sites: '28 active sites', window: 'Open through 08-22', scanned: '14:02 - coverage graph', gap: 'Endoscopy calendar', concepts: ['UC', 'Mayo score', 'prior anti-TNF', 'stool calprotectin'] },
  { id: 'NCT00000155', title: 'END-155 - T2D cardiovascular outcomes', phase: 'Ph III', coverage: '8 / 10 capabilities', fit: '77%', status: 'Strong fit', sponsor: 'Northwind Metabolic', pi: 'Dr. P. Ibarra', sites: '52 active sites', window: 'Open through 10-28', scanned: '14:02 - coverage graph', gap: 'CGM upload lag', concepts: ['T2D', 'HbA1c 7-10%', 'prior MACE', 'eGFR at least 45'] },
]

const BIOMARKERS = [
  ['Troponin', '7%', '-5s', '20s', '42px'],
  ['HbA1c', '18%', '-13s', '24s', '-34px'],
  ['eGFR', '31%', '-8s', '19s', '28px'],
  ['FEV1', '44%', '-17s', '27s', '-46px'],
  ['p-tau217', '57%', '-3s', '22s', '38px'],
  ['CRP', '69%', '-11s', '25s', '-24px'],
  ['SpO2', '81%', '-19s', '28s', '31px'],
  ['FHIR', '91%', '-7s', '21s', '-38px'],
]

// Canonical landing-demo queue, ported from C:\repos\jwks\platform.html.
const PLATFORM_SCREENING_QUEUE = [
  { id: 'S-1066', name: 'M. Hughes', status: 'REVIEW', criterion: 'I-2.1 - biomarker missing', blocker: 'EGFR / ALK molecular status', rule: 'EGFR / ALK status required before randomization.', facts: ['No molecular DiagnosticReport found', 'Order placed 06-19 - no result'], sources: ['Awaiting DiagnosticReport', 'DocumentReference - none'], result: 'REVIEW', reason: 'Required source not yet received' },
  { id: 'S-1051', name: 'E. Morn', status: 'REVIEW', criterion: 'I-3.4 - CMP stale', blocker: 'Serum chemistry within 7-day window', rule: 'CMP must be drawn within 7 days of C1D1.', facts: ['K+ 5.0 mmol/L drawn 06-09', '11 days old at evaluation'], sources: ['Observation/chem-5521'], result: 'REVIEW', reason: 'Evidence outside freshness window' },
  { id: 'S-1047', name: 'E. Hunt', status: 'REVIEW', criterion: 'E-4.2 - ECOG conflict', blocker: 'ECOG performance status', rule: 'ECOG must be 0-1 within 14 days of C1D1.', facts: ['Structured observation: ECOG 1 - 06-18', 'Oncology note: ECOG 2 - 06-20'], sources: ['Observation/ecog-8841', 'DocumentReference/note-2207'], result: 'REVIEW', reason: 'Conflicting source facts' },
  { id: 'S-1078', name: 'I. Rey', status: 'REVIEW', criterion: 'E-5.3 - washout edge', blocker: 'At least 21-day prior-therapy washout', rule: 'At least 21 days between last systemic therapy and C1D1.', facts: ['Infusion record: 05-30', 'Discharge summary: 06-02'], sources: ['MedicationAdministration/inf-771', 'DocumentReference/dc-3390'], result: 'REVIEW', reason: 'Last-dose date ambiguous across sources' },
  { id: 'S-1088', name: 'D. Martinez', status: 'FAIL', criterion: 'I-1.1 - histology mismatch', blocker: 'Histologically confirmed NSCLC', rule: 'Histologically confirmed NSCLC required.', facts: ['Pathology: small-cell carcinoma', 'No NSCLC component'], sources: ['Pathology DiagnosticReport/path-3310'], result: 'FAIL', reason: 'Confirmed SCLC; protocol requires NSCLC' },
  { id: 'S-1093', name: 'A. Lucchesi', status: 'FAIL', criterion: 'I-4.2 - ECOG 3', blocker: 'ECOG performance status 0-1', rule: 'ECOG performance status 0-1 required.', facts: ['ECOG 3 documented 06-18', 'Declining performance status'], sources: ['Observation/ecog-7782'], result: 'FAIL', reason: 'ECOG 3 exceeds protocol limit' },
  { id: 'S-1109', name: 'F. Leiter', status: 'FAIL', criterion: 'E-7 - active CNS metastases', blocker: 'No active CNS metastases', rule: 'No active untreated CNS metastases on steroids.', facts: ['MRI: active untreated CNS lesions', 'On dexamethasone'], sources: ['DocumentReference/mri-5567'], result: 'FAIL', reason: 'Active untreated CNS metastases on steroids' },
  { id: 'S-1044', name: 'J. Bond', status: 'PASS', criterion: 'All criteria met - confirm', blocker: 'No unresolved blocker', rule: 'All inclusion met. No exclusion triggered.', facts: ['EGFR+ confirmed', 'ECOG 1 - 06-19', 'CMP fresh - 06-20'], sources: ['DiagnosticReport/mol-441', 'Observation/ecog-9920'], result: 'PASS', reason: 'All required evidence present and fresh' },
]

const RESOLVE_WORK_ITEMS = [
  {
    key: 'ecog-conflict', patient: 'E. Hunt', subject: 'S-1047', criterion: 'E-4.2', issue: 'Conflicting ECOG sources',
    driver: 'Structured ECOG 1 conflicts with newer oncology note ECOG 2', citationSummary: 'Two conflicting source facts remain cited',
    citations: ['Observation/ecog-8841', 'DocumentReference/note-2207'],
    evidence: [
      { label: 'STRUCTURED OBSERVATION', meta: '06-18 - Epic FHIR R4', value: 'ECOG 1', ref: 'Observation/ecog-8841' },
      { label: 'LATEST ONCOLOGY NOTE', meta: '06-20 - Site document', value: 'ECOG 2', ref: 'DocumentReference/note-2207', current: true },
    ],
    symbol: 'vs.', prompt: 'Two sources disagree on performance status. A PI decides which assessment governs.',
    rule: 'Requires ECOG 0-1 within 14 days', ruleDetail: 'Conflicting sources require accountable clinical interpretation.',
    actions: [
      { id: 'structured', label: 'Keep structured - ECOG 1', impact: 'Result moves to PASS. PI rationale must explain why newer narrative evidence does not govern.' },
      { id: 'note', label: 'Accept newer note - ECOG 2', impact: 'Result stays REVIEW. Newer narrative assessment governs this run; structured ECOG 1 remains cited.' },
      { id: 'repeat', label: 'Request repeat ECOG assessment', impact: 'Result stays REVIEW until a new signed assessment is available.' },
    ],
    signer: 'Dr. M. Avdol', role: 'PI / Sub-I - clinical interpretation', record: 'R-884', defaultAction: 'note',
  },
  {
    key: 'biomarker-missing', patient: 'M. Hughes', subject: 'S-1066', criterion: 'I-2.1', issue: 'Pathology source pending',
    driver: 'Molecular order exists, but no final EGFR / ALK report is available', citationSummary: 'Order and source-system status remain bound',
    citations: ['ServiceRequest/mol-1904', 'DiagnosticReport/mol-pending'],
    evidence: [
      { label: 'MOLECULAR ORDER', meta: '06-19 - Epic FHIR R4', value: 'EGFR / ALK ordered', ref: 'ServiceRequest/mol-1904' },
      { label: 'PATHOLOGY INTERFACE', meta: '06-21 - Lab connector', value: 'Result pending', ref: 'DiagnosticReport/mol-pending', current: true },
    ],
    symbol: 'to', prompt: 'The order is present. Eligibility waits for a finalized molecular report.',
    rule: 'Requires confirmed EGFR / ALK status', ruleDetail: 'An order cannot substitute for a finalized molecular result.',
    actions: [
      { id: 'hold', label: 'Hold for final pathology', impact: 'Result stays REVIEW. Screening re-runs automatically when the final report arrives.' },
      { id: 'external', label: 'Attach verified external report', impact: 'Result stays REVIEW until the signed external report is attached and source-verified.' },
      { id: 'cancel', label: 'Close molecular order follow-up', impact: 'Work item closes without clearing eligibility.' },
    ],
    signer: 'J. Kujo', role: 'Lead CRA - source follow-up', record: 'R-891', defaultAction: 'hold',
  },
  {
    key: 'renal-stale', patient: 'E. Morn', subject: 'S-1051', criterion: 'I-7.4', issue: 'Renal value outside window',
    driver: 'Creatinine clearance passes threshold but is four days outside protocol window', citationSummary: 'Prior lab and scheduled repeat draw remain cited',
    citations: ['Observation/renal-5521', 'ServiceRequest/cmp-7740'],
    evidence: [
      { label: 'LATEST RESULT', meta: '06-09 - Lab FHIR R4', value: 'CrCl 68 mL/min', ref: 'Observation/renal-5521' },
      { label: 'REPEAT DRAW', meta: '06-21 - Site schedule', value: 'Scheduled 08:30', ref: 'ServiceRequest/cmp-7740', current: true },
    ],
    symbol: '>', prompt: 'The value passes threshold but falls outside the protocol window. A site user chooses the next valid step.',
    rule: 'Requires CrCl at least 50 mL/min within 7 days', ruleDetail: 'A passing value outside the protocol window cannot clear eligibility.',
    actions: [
      { id: 'await', label: 'Await scheduled repeat draw', impact: 'Result stays REVIEW. New lab ingestion triggers a deterministic re-screen.' },
      { id: 'defer', label: 'Defer screening visit', impact: 'Visit moves to pending. Existing lab remains visible but cannot satisfy freshness.' },
      { id: 'review', label: 'Request PI deviation review', impact: 'Result stays REVIEW. No eligibility change occurs without signed PI rationale.' },
    ],
    signer: 'G. Recca, RN', role: 'Research coordinator - visit control', record: 'R-896', defaultAction: 'await',
  },
  {
    key: 'washout-ambiguity', patient: 'I. Rey', subject: 'S-1078', criterion: 'E-5.3', issue: 'Last-dose date ambiguous',
    driver: 'Infusion administration and discharge summary disagree on last therapy date', citationSummary: 'Two treatment dates remain cited',
    citations: ['MedicationAdministration/inf-771', 'DocumentReference/dc-3390'],
    evidence: [
      { label: 'INFUSION ADMINISTRATION', meta: '05-30 - Medication record', value: 'Last dose 05-30', ref: 'MedicationAdministration/inf-771' },
      { label: 'DISCHARGE SUMMARY', meta: '06-02 - Site document', value: 'Therapy through 06-02', ref: 'DocumentReference/dc-3390', current: true },
    ],
    symbol: 'vs.', prompt: 'Treatment records disagree on the last dose. The site must establish one accountable date.',
    rule: 'Requires at least 21 days since last systemic therapy', ruleDetail: 'Ambiguous dates use a signed site attestation or the conservative date.',
    actions: [
      { id: 'attest', label: 'Attest last dose - 05-30', impact: 'Result moves to PASS only after investigator attestation binds administration context.' },
      { id: 'conservative', label: 'Use conservative date - 06-02', impact: 'Result stays REVIEW until the 21-day washout completes on 06-23.' },
      { id: 'reconcile', label: 'Request pharmacy reconciliation', impact: 'Result stays REVIEW while pharmacy confirms treatment chronology.' },
    ],
    signer: 'Dr. I. Netero', role: 'Medical monitor - treatment chronology', record: 'R-902', defaultAction: 'conservative',
  },
]

const INTEGRATIONS = [
  ['Epic', '/assets/vendor/epic.png'],
  ['Veeva', '/assets/vendor/veeva-live.png'],
  ['Medidata', '/assets/vendor/medidata-live.png'],
  ['Cerner', '/assets/vendor/cerner.png'],
  ['REDCap', '/assets/vendor/redcap.png'],
  ['OpenAI', '/assets/vendor/openai.png'],
  ['Anthropic', '/assets/vendor/anthropic.png'],
]

const HOME_SPINE = [['home', 'Home', 'Damaros'], ['thesis', 'Thesis', 'Why now'], ['capacity', 'Capacity', 'Deployment'], ['agents', 'Agents', 'Instruments'], ['site-control', 'Control', 'Site-owned'], ['pilot', 'Pilot', 'Start here']]
const ABOUT_SPINE = [['about-top', 'About', 'Damaros'], ['founder', 'Founder', 'Origin'], ['why-now', 'Why now', 'Constraint'], ['people', 'People', 'Ownership'], ['pilot', 'Pilot', 'Start here']]

function BiomarkerRain() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const inView = useInView(root, { threshold: 0 })
  const animate = shouldRunAmbient({ reduced, inView })
  const marks = narrow ? BIOMARKERS.filter((_, index) => index % 2 === 0) : BIOMARKERS
  return (
    <div className={`biomarker-rain${animate ? '' : ' is-paused'}`} ref={root} aria-hidden="true">
      {reduced ? null : marks.map(([label, x, delay, duration, drift]) => (
        <span style={{ '--x': x, '--delay': delay, '--duration': duration, '--drift': drift }} key={label}>{label}</span>
      ))}
    </div>
  )
}

function AgentGlyph({ kind, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (kind === 'trident') return <svg {...common}><path d="M9 16V8" /><path d="M4.8 8.2V4M9 8V3.4M13.2 8.2V4" /><path d="M4.8 8.2c0 2.2 8.4 2.2 8.4 0" /></svg>
  if (kind === 'eye') return <svg {...common}><path d="M1.5 9S4 3.8 9 3.8 16.5 9 16.5 9 14 14.2 9 14.2 1.5 9 1.5 9Z" /><circle cx="9" cy="9" r="2.1" /></svg>
  if (kind === 'luna') return <svg {...common}><path d="M12.8 3.4a6.6 6.6 0 1 0 0 11.2 5.2 5.2 0 0 1 0-11.2Z" /></svg>
  return <svg {...common}><circle cx="9" cy="9" r="6.5" /><circle cx="9" cy="9" r="3" /><circle cx="9" cy="9" r="0.6" fill="currentColor" stroke="none" /><path d="M9 9 13.6 4.4" /></svg>
}

function SpineGlyph({ kind, size = 15 }) {
  const common = { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (kind === 'Protocol') return <svg {...common}><path d="M5 2.8h5l3 3V15H5Z" /><path d="M10 2.8V6h3M7.2 9h3.7M7.2 11.5h3.7" /></svg>
  if (kind === 'Evidence') return <svg {...common}><path d="m9 2.8 6 3.1-6 3.1-6-3.1Z" /><path d="m3 9 6 3.1L15 9M3 12.1l6 3.1 6-3.1" /></svg>
  if (kind === 'Screening') return <svg {...common}><path d="M2.8 4h12.4l-4.8 5.3v4.2l-2.8 1.4V9.3Z" /></svg>
  if (kind === 'Resolve') return <svg {...common}><circle cx="9" cy="6" r="2.5" /><path d="M4.2 15c.5-3 2.1-4.5 4.8-4.5s4.3 1.5 4.8 4.5" /></svg>
  return <svg {...common}><path d="M5.2 5.2H2.8V2.8" /><path d="M3.2 5.1A6.2 6.2 0 1 1 3 12" /><path d="M7.2 6.4v5.2l4-2.6Z" /></svg>
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function measureSectionInsets(height = viewportHeight()) {
  const nav = document.querySelector('.site-nav-wrap')
  const spine = document.querySelector('.page-spine.is-visible')
  const spineBox = spine?.getBoundingClientRect()
  const spineTop = spineBox && spineBox.bottom < height * 0.4 ? spineBox.bottom + 8 : 0
  const insetTop = Math.max(0, Math.round(nav?.getBoundingClientRect().bottom ?? 0), Math.round(spineTop))
  const insetBottom = spineBox && spineBox.top > height * 0.6
    ? Math.max(0, Math.round(height - spineBox.top + 8))
    : 0
  return { insetTop, insetBottom }
}

function sectionVisual(selector) {
  const target = document.querySelector(selector)
  if (!target) return null
  const narrow = window.matchMedia(NARROW_VIEWPORT).matches
  return selector === '#agents' && !narrow ? target.querySelector('.agent-console') || target : target
}

function sectionScrollEnd(selector) {
  const visual = sectionVisual(selector)
  if (!visual) return null
  const height = viewportHeight()
  return sectionScrollTarget({
    sectionTop: visual.getBoundingClientRect().top + window.scrollY,
    sectionHeight: visual.offsetHeight,
    viewportHeight: height,
    documentHeight: document.documentElement.scrollHeight,
    ...measureSectionInsets(height),
  })
}

function PageReset() {
  const { pathname, hash } = useLocation()
  const mounted = useRef(false)
  const previousPath = useRef(pathname)

  useEffect(() => {
    if (hash) {
      const needsPosition = !mounted.current || previousPath.current !== pathname
      const frame = needsPosition ? window.requestAnimationFrame(() => {
        const end = sectionScrollEnd(hash)
        if (end != null) window.scrollTo({ top: end, left: 0, behavior: 'instant' })
      }) : 0
      mounted.current = true
      previousPath.current = pathname
      return () => window.cancelAnimationFrame(frame)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    mounted.current = true
    previousPath.current = pathname
    return undefined
  }, [pathname, hash])

  return null
}

function PageMeta({ title, description, path = '/' }) {
  useEffect(() => {
    document.title = 'Damaros™'
    const absolute = `https://www.damaros.ai${path}`
    const descriptionTag = document.querySelector('meta[name="description"]')
    if (descriptionTag) descriptionTag.setAttribute('content', description)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', absolute)
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) ogDescription.setAttribute('content', description)
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', absolute)
  }, [title, description, path])

  return null
}

function smoothSection(event, selector) {
  event?.preventDefault()
  const end = sectionScrollEnd(selector)
  if (end == null) return
  if (window.location.hash !== selector) window.history.replaceState({}, '', selector)
  const start = window.scrollY
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.cancelAnimationFrame(sectionScrollFrame)
  sectionScrollFrame = 0
  if (reduce || start === end) {
    window.scrollTo({ top: end, left: 0, behavior: 'instant' })
    return
  }
  const duration = sectionScrollDuration(end - start, viewportHeight())
  const started = performance.now()
  const stop = () => {
    window.cancelAnimationFrame(sectionScrollFrame)
    sectionScrollFrame = 0
    window.removeEventListener('wheel', stop)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('keydown', stop)
  }
  const move = (now) => {
    const progress = Math.min(1, (now - started) / duration)
    window.scrollTo({ top: start + ((end - start) * easeSectionScroll(progress)), left: 0, behavior: 'instant' })
    if (progress < 1) sectionScrollFrame = window.requestAnimationFrame(move)
    else stop()
  }
  window.addEventListener('wheel', stop, { passive: true })
  window.addEventListener('touchstart', stop, { passive: true })
  window.addEventListener('keydown', stop)
  sectionScrollFrame = window.requestAnimationFrame(move)
}

function PageSpine({ about = false }) {
  const items = about ? ABOUT_SPINE : HOME_SPINE
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const [active, setActive] = useState(items[0][0])
  const [visible, setVisible] = useState(about || narrow)

  useEffect(() => {
    let frame = 0
    let lastActive = items[0][0]
    let lastVisible = false
    const update = () => {
      const height = viewportHeight()
      const anchor = height * 0.42
      const gate = document.querySelector(about ? '.about-hero' : '.landing-hero')
      let currentIndex = 0
      items.forEach(([id], index) => {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= anchor) currentIndex = index
      })
      const nextActive = items[currentIndex][0]
      const next = document.getElementById(about ? 'founder' : 'thesis')
      const nextTop = next?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
      const heroBottom = gate?.getBoundingClientRect().bottom ?? 0
      const nextVisible = narrow || about || nextTop <= height * 0.92 || heroBottom <= height * 0.82
      if (nextActive !== lastActive) {
        lastActive = nextActive
        setActive(nextActive)
      }
      if (nextVisible !== lastVisible) {
        lastVisible = nextVisible
        setVisible(nextVisible)
      }
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.visualViewport?.addEventListener('resize', onScroll)
    window.visualViewport?.addEventListener('scroll', onScroll)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.visualViewport?.removeEventListener('resize', onScroll)
      window.visualViewport?.removeEventListener('scroll', onScroll)
    }
  }, [about, items, narrow])

  return (
    <nav className={`page-spine${about ? ' page-spine-about' : ''}${visible ? ' is-visible' : ''}`} aria-label="On this page" aria-hidden={!visible} inert={!visible}>
      {items.map(([id, label], index) => (
        <button className={active === id ? 'active' : ''} type="button" aria-current={active === id ? 'true' : undefined} aria-label={label} onClick={() => { setActive(id); smoothSection(null, `#${id}`) }} key={id}>
          <span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong>
        </button>
      ))}
    </nav>
  )
}

function usePageScrollFlow(root, reduced) {
  useEnterMotion(root, reduced, () => (
    gsap.utils.toArray('.founder-section, .human-outcomes, .final-cta', root.current).map((chapter) => {
      const heading = chapter.querySelector('.founder-signature, .section-heading, .final-cta > h2, .final-cta > .button')
      if (!heading) return null
      return gsap.from(heading, {
        opacity: 0,
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: chapter, start: 'top 86%', once: true },
      })
    })
  ), '(min-width: 641px)')
}

function BrandName() {
  return <>Damaros<sup className="brand-tm">TM</sup></>
}

function WindowBrand() {
  return (
    <span className="window-title window-brand">
      <img src="/assets/damaros-monogram-blue.svg" alt="Damaros" decoding="async" />
    </span>
  )
}

function SiteNav() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="site-nav-wrap">
      <nav className="site-nav" aria-label="Primary navigation">
        <NavLink className="wordmark" to="/" aria-label="Damaros home">
          <BrandName />
        </NavLink>
        <div className="desktop-nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>
        <PilotButton className="button button-small button-primary desktop-pilot">
          Start a pilot <ArrowUpRight size={16} weight="bold" />
        </PilotButton>
        <button
          className="menu-button"
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </nav>
      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
        <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
        <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
        <PilotButton className="button button-primary" onClick={() => setOpen(false)}>Start a pilot</PilotButton>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-mark">
        <span><BrandName /></span>
        <p>Agentic execution infrastructure for clinical research.</p>
      </div>
      <div className="footer-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/privacy">Privacy</NavLink>
        <a href="https://www.linkedin.com/company/damaros" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:team@damaros.ai">Email</a>
      </div>
      <div className="footer-bottom">
        <span>2026 <BrandName /></span>
        <span>Clinical efficacy claims are outside platform scope.</span>
      </div>
    </footer>
  )
}

function MiniRun() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const inView = useInView(root)
  const { isolated } = useModelPath()
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)
  const { held, hold } = useAutoplayHold(reduced)
  const visible = useDocumentVisible()
  const { fading, swap } = useSoftSwap(reduced)
  const steps = ['Protocol', 'Evidence', 'Screening', 'Resolve', 'Replay']
  const playing = !narrow && shouldPlayAutoplay({ reduced, held, inView, visible })

  useEffect(() => {
    if (!playing) return undefined
    const stageTimer = window.setInterval(() => {
      swap(() => {
        setActive((current) => nextStageIndex(current, steps.length))
        setTick(0)
      })
    }, HERO_STAGE_MS)
    const tickTimer = window.setInterval(() => setTick((value) => value + 1), HERO_TICK_MS)
    return () => { window.clearInterval(stageTimer); window.clearInterval(tickTimer) }
  }, [playing, steps.length, swap])

  const selectStage = (index) => {
    hold()
    if (index === active) return
    swap(() => {
      setActive(index)
      setTick(0)
    }, shouldKeepPreviousStage('manual', null))
  }

  return (
    <div className="hero-workspace" ref={root} aria-label="Live synthetic Damaros workspace preview" onClickCapture={(event) => { if (shouldHoldAutoplayFromClick(event.target)) hold() }}>
      <div className="mac-titlebar">
        <div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div>
        <WindowBrand />
        <span aria-hidden="true" />
      </div>
      <div className="hero-app-grid">
        <aside className="hero-app-nav">
          <strong>SPINE</strong>
          {steps.map((step, index) => (
            <button key={step} type="button" className={index === active ? 'active' : ''} onClick={() => selectStage(index)}>
              <SpineGlyph kind={step} /><span>{step}</span>
            </button>
          ))}
          <strong>AGENTS</strong>
          {AGENTS.map((agent, index) => <span className={`hero-agent${isolated ? ' is-isolated' : index === tick % AGENTS.length ? ' is-active' : ''}`} style={{ '--agent-color': agent.color }} key={agent.name}><i /> <AgentGlyph kind={agent.icon} size={14} /> {agent.name}</span>)}
          <ModelPathSwitch />
        </aside>
        <div className="hero-app-main">
          <div className={`hero-state-canvas landing-source-demo${fading ? ' is-fading' : ''}`}>
            <div className="hero-state-layer">
              <div className="landing-source-view">
                {active === 0 && <ProtocolView tick={tick} onAdvance={() => selectStage(1)} />}
                {active === 1 && <EvidenceView refreshing={false} tick={tick} onAdvance={() => selectStage(2)} />}
                {active === 2 && <ScreeningView tick={tick} onAdvance={() => selectStage(3)} />}
                {active === 3 && <ResolveView tick={tick} />}
                {active === 4 && <ReplayView tick={tick} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingHero() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useEnterMotion(root, reduced, () => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    timeline
      .from('.hero-line', { opacity: 0, duration: 1.2, stagger: 0.14, clearProps: 'transform' })
      .from('.hero-copy > p, .hero-actions', { opacity: 0, duration: 0.9, stagger: 0.12, clearProps: 'transform' }, '-=0.5')
      .from('.hero-workspace', { opacity: 0, duration: 1.15, clearProps: 'transform' }, '-=0.7')
    return timeline
  }, '(min-width: 700px)')

  return (
    <section className="landing-hero" id="home" ref={root}>
      <div className="ambient-field" aria-hidden="true" />
      <BiomarkerRain />
      <img className="hero-drum-motif" src="/assets/damaros-monogram-blue.svg" alt="" aria-hidden="true" decoding="async" />
      <div className="hero-copy">
        <h1 className="hero-heading" aria-label="Clinical research, built to execute anywhere.">
          <span className="hero-line">Clinical research,</span>
          <span className="hero-line accent-text">built to execute anywhere.</span>
        </h1>
        <p><BrandName /> turns protocols into evidence-bound decisions, signed locally and replayable on demand.</p>
        <div className="hero-actions">
          <PilotButton className="button button-primary">Start a pilot <ArrowUpRight size={17} weight="bold" /></PilotButton>
          <a className="button button-secondary" href="#agents" onClick={(event) => smoothSection(event, '#agents')}>See agents work <ArrowRight size={17} weight="bold" /></a>
        </div>
      </div>
      <div className="hero-workspace-wrap"><MiniRun /></div>
    </section>
  )
}

function ThesisSection() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  useEnterMotion(root, reduced, () => gsap.from('.thesis-head > *', {
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: root.current, start: 'top 68%', once: true },
  }))

  return (
    <section className="thesis-section section-space" id="thesis" ref={root}>
      <div className="thesis-head">
        <h2><span className="accent-text">The next generation of medicine</span> cannot run on the last generation of research infrastructure.</h2>
      </div>
    </section>
  )
}

function MetricDots({ active, total, tone = 'light' }) {
  return <div className={`metric-dots metric-dots-${tone}`} aria-hidden="true">{Array.from({ length: total }, (_, index) => <i className={index < active ? 'active' : ''} key={index} />)}</div>
}

function CapacityBento() {
  const root = useRef(null)
  const reduced = useReducedMotion()

  const integrations = useRef(null)
  const integrationsInView = useInView(integrations, { threshold: 0 })
  const integrationsPlay = shouldRunAmbient({ reduced, inView: integrationsInView })

  useEnterMotion(root, reduced, () => {
    const record = root.current?.querySelector('.evidence-record-card')
    return [
      gsap.from('.capacity-bento > *, .systems-banner', {
        opacity: 0,
        duration: 0.86,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      }),
      record ? gsap.from('.record-event', {
        opacity: 0,
        duration: 0.5,
        stagger: 0.16,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: { trigger: record, start: 'top 78%', once: true },
      }) : null,
    ]
  })

  return (
    <section className="capacity-section section-space" id="capacity" ref={root}>
      <div className="section-heading centered-heading">
        <h2><span className="capacity-title-line">A research department,</span><span className="capacity-title-line">deployed like software.</span></h2>
        <p>Disease-agnostic by design. One execution system for every protocol, care setting, and patient population. Each protocol adds reusable coverage. Every decision keeps human accountability and local control.</p>
      </div>
      <div className="capacity-bento">
        <article className="bento-card bento-core">
          <div className="bento-copy">
            <span className="product-label">COMPILED PROTOCOL</span>
            <h3><span>One locked version</span>{' '}<span>governs every screen.</span></h3>
            <p>An amendment recompiles the logic and re-runs the affected cohort without relying on memory.</p>
          </div>
          <div className="criteria-stack" aria-label="Example compiled protocol criteria">
            <div><span>I-2.1</span><strong>EGFR molecular status</strong><small>Source-dependent</small></div>
            <div><span>I-4.2</span><strong>ECOG 0-1 within 14 days</strong><small>Human resolution</small></div>
            <div><span>E-5.3</span><strong>21-day therapy washout</strong><small>Computable</small></div>
          </div>
        </article>
        <article className="bento-card metric-card metric-blue">
          <MetricDots active={6} total={20} tone="dark" />
          <strong>70%</strong>
          <p>of US counties had no active cancer treatment trial in 2022.</p>
          <cite>Kirkwood et al., JCO Oncology Practice 2025</cite>
        </article>
        <article className="bento-card metric-card">
          <MetricDots active={1} total={20} />
          <strong>4.1%</strong>
          <p>Community-program treatment-trial enrollment, versus 21.6% at NCI-designated comprehensive cancer centers.</p>
          <cite>Journal of Clinical Oncology - national benchmark</cite>
        </article>
        <article className="bento-card evidence-record-card">
          <div className="record-head"><span className="product-label">Site-owned execution</span></div>
          <div className="record-chain">
            <ol aria-label="Site execution chain">
              <li className="record-event">
                <b>LOCKED</b>
                <strong>Protocol v2.1 locked</strong>
                <small>Sponsor packet - aead45cf</small>
                <em>HIPAA-aligned hold - compiled at site</em>
              </li>
              <li className="record-event">
                <b>BOUND</b>
                <strong>1,284 source records bound</strong>
                <small>Evidence snapshot - 09:55</small>
                <em>PHI on-site - no raw egress</em>
              </li>
              <li className="record-event">
                <b>SIGNED</b>
                <strong>PI decision signed</strong>
                <small>Dr. M. Avdol - 14:07</small>
                <em>Local authority - attributable</em>
              </li>
              <li className="record-event">
                <b>SEALED</b>
                <strong>Replay sealed - Record intact</strong>
                <small>sha256 - rpl...1047</small>
              </li>
            </ol>
          </div>
          <div className="record-copy">
            <h3><span>Software prepares the record.</span><span className="accent-text">Your site makes the call.</span></h3>
            <p>Every protocol version, source, and signed decision stays bound, reconstructable, and under local control.</p>
          </div>
        </article>
      </div>
      <div className="systems-banner">
        <div className="systems-stat">
          <strong>20+</strong>
          <p>systems touched daily at 60% of research sites.</p>
          <cite>SCRS Site Landscape Survey 2023</cite>
        </div>
        <div className="connector-closeup">
          <div className="connector-head"><span>Connectors</span><small>Site-controlled</small></div>
          <div className={`integration-viewport${integrationsPlay ? '' : ' is-paused'}`} ref={integrations} aria-label="Damaros connectors">
            <div className="integration-track">
              {[0, 1].map((group) => (
                <div className="integration-group" aria-hidden={group === 1} key={group}>
                  {INTEGRATIONS.map(([name, src]) => <div className={`integration-logo integration-${name.toLowerCase()}`} key={`${group}-${name}`}><img src={src} alt={group === 0 ? name : ''} loading="lazy" decoding="async" /></div>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductViewHeader({ label, title, status, icon }) {
  return (
    <div className="workspace-view-header">
      <div><span>{label}</span><h4>{title}</h4></div>
      <div className="workspace-view-status">{icon}{status}</div>
    </div>
  )
}

function InlineActionPanel({ open, complete = false, eyebrow = 'ACTION REQUIRED', title, description, rows, confirmLabel, successTitle, successDescription, onClose, onConfirm }) {
  if (!open) return null
  const panelTitle = complete ? successTitle : title
  return (
    <section className={`inline-action-panel ${complete ? 'is-complete' : 'is-required'}`} aria-live="polite" aria-label={panelTitle}>
      <header>{complete ? <CheckCircle size={18} weight="fill" /> : <span aria-hidden="true">!</span>}<div><small>{complete ? 'ACTION COMPLETE' : eyebrow}</small><h5>{panelTitle}</h5></div></header>
      <p>{complete ? successDescription : description}</p>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <footer>{complete ? <button className="button button-primary" type="button" onClick={onClose}>Close</button> : <><button className="button button-secondary" type="button" onClick={onClose}>Back</button><button className="button button-primary" type="button" onClick={onConfirm}>{confirmLabel}</button></>}</footer>
    </section>
  )
}

function NodeControlFooter({ control, children, motion = false }) {
  return (
    <footer className="node-control-footer" {...(motion ? { 'data-review-motion': true } : {})}>
      <div className="node-control-boundary">
        <ShieldCheck size={18} />
        <span className="node-control-copy">
          <small>CONTROL BOUNDARY</small>
          <strong>No LLM touches patient data</strong>
          <em>{control.guard}</em>
        </span>
      </div>
      <div className="node-control-actions">{children}</div>
    </footer>
  )
}

function SiteControlReview({ control, phase, reduced, onBack, onConfirm, onReturn }) {
  const root = useRef(null)
  const complete = phase === 'complete'
  const saving = phase === 'saving'

  useGSAP(() => {
    if (reduced || !root.current) return undefined
    const targets = root.current.querySelectorAll('[data-review-motion]')
    const tween = gsap.fromTo(targets, { opacity: 0 }, {
      opacity: 1,
      duration: 0.36,
      stagger: 0.045,
      ease: 'power2.out',
      clearProps: 'transform',
    })
    return () => tween.kill()
  }, { scope: root, dependencies: [phase, control.record, reduced] })

  return (
    <section className={`site-control-review is-${phase}`} ref={root} role="region" aria-label={complete ? `${control.success} receipt` : control.action}>
      <div className="node-control-body">
        <header data-review-motion>
          <span className="site-review-state-icon" aria-hidden="true">{complete ? <CheckCircle size={20} weight="fill" /> : saving ? <i /> : <ShieldCheck size={20} />}</span>
          <div><small>{complete ? 'REVIEW RECORDED' : saving ? 'WRITING TO EXECUTION RECORD' : 'SITE REVIEW'}</small><h5>{complete ? control.success : saving ? 'Binding site decision' : control.action}</h5></div>
        </header>

        {saving ? (
          <div className="site-review-saving" aria-live="polite" aria-busy="true" data-review-motion>
            <strong>Recording {control.record}</strong>
            <p>Preserving reviewer authority, boundary result, and source trace.</p>
            <div className="site-review-progress">
              <span><CheckCircle size={16} weight="fill" /><b>Policy scope verified</b><small>{control.scope}</small></span>
              <span><CheckCircle size={16} weight="fill" /><b>Patient boundary verified</b><small>{control.patientFields}</small></span>
              <span className="is-writing"><i /><b>Signing execution record</b><small>{control.receipt}</small></span>
            </div>
          </div>
        ) : complete ? (
          <>
            <p data-review-motion>{control.outcome}</p>
            <div className="site-review-receipt" data-review-motion>
              <span><small>REVIEW ID</small><strong>{control.receipt}</strong></span>
              <span><small>DECISION</small><strong>{control.decision}</strong></span>
              <span><small>ACTOR</small><strong>Authenticated site reviewer</strong></span>
              <span><small>INTEGRITY</small><strong>Ed25519 - verified</strong></span>
            </div>
            <div className="site-review-chain" data-review-motion><small>BOUND RECORD</small><span><time>10:42</time><strong>Boundary evaluated</strong><em>{control.patientFields}</em></span><span><time>10:43</time><strong>Authority matched</strong><em>{control.policy}</em></span><span><time>10:44</time><strong>Review signed</strong><em>{control.receipt}</em></span></div>
            <div className="site-review-confirmation" data-review-motion><CheckCircle size={18} weight="fill" /><span><strong>Execution record updated</strong><small>{control.record} - 10:44 - institution-held</small></span></div>
          </>
        ) : (
          <>
            <p data-review-motion>{control.description}</p>
            <dl className="site-review-summary" data-review-motion>
              <div><dt>SCOPE</dt><dd>{control.scope}</dd></div>
              <div><dt>RECIPIENT</dt><dd>{control.recipient}</dd></div>
              <div><dt>PATIENT FIELDS</dt><dd>{control.patientFields}</dd></div>
              <div><dt>AUTHORITY</dt><dd>{control.policy}</dd></div>
            </dl>
            <div className="site-review-decision" data-review-motion><small>DECISION TO RECORD</small><strong>{control.decision}</strong><span>{control.outcome}</span></div>
          </>
        )}
      </div>

      <NodeControlFooter control={control} motion>
        {complete ? <button className="button button-primary" type="button" onClick={onReturn}>Return to control</button> : saving ? <button className="button button-primary" type="button" disabled>Recording review</button> : <><button className="button button-secondary" type="button" onClick={onBack}>Back</button><button className="button button-primary" type="button" onClick={onConfirm}>Record site review</button></>}
      </NodeControlFooter>
    </section>
  )
}

function ProtocolView({ tick = 0, onAdvance }) {
  const criteria = [
    ['I-2.1', 'EGFR / ALK molecular status', 'Source-dependent'],
    ['I-4.2', 'ECOG 0-1 within 14 days', 'Subjective'],
    ['I-4.4', 'Measurable disease - RECIST 1.1', 'Computable'],
    ['E-5.3', '21-day therapy washout', 'Source-dependent'],
    ['E-5.8', 'No uncontrolled CNS disease', 'Human review'],
  ]
  const focus = autoplayIndex(tick, criteria.length)
  return (
    <div className="workspace-view source-protocol-view" key="protocol">
      <div className="protocol-source-head"><span>PROTOCOL</span><em><i /> INGESTED - LOCKED V2.1</em><small>Fetched NCT00000204 - parsed sponsor packet - 06-21 14:02Z</small></div>
      <h4>DMR-204 - EGFR-mutant NSCLC</h4><p>NCT00000204 - Phase II - randomized 1:1 - hash aead45cf</p>
      <div className="source-amendment"><span>AMENDMENT CASCADE</span><strong>v2.0 - 04-12 <ArrowRight size={14} /> v2.1 - 06-21</strong><small>Narrowed prior-lines criterion - re-screen triggered</small></div>
      <div className="source-protocol-summary"><section><span>SPONSOR</span><h5>Meridian Oncology Therapeutics</h5><p>NCT00000204 - DMR-204 - v2.1 - Phase II</p><div><i>IN</i><span><strong>Dr. I. Netero</strong><small>Medical Monitor</small></span><i>JK</i><span><strong>J. Kujo</strong><small>Lead CRA</small></span></div></section><section><span>STUDY ARMS - LLM-PARSED FROM PACKET</span><div className="source-arm"><b>ARM A</b><span><strong>Velartinib - 80 mg PO daily</strong><small>Investigational - oral 3rd-gen EGFR-TKI</small></span></div><div className="source-arm"><b>ARM B</b><span><strong>Platinum doublet</strong><small>Comparator - standard of care</small></span></div><p>Randomized 1:1 - target n=140 - stratified by ECOG and prior lines</p></section></div>
      <div className="source-criteria-head"><span>ELIGIBILITY - 36 CRITERIA - 25 ENGINE-MAPPED</span><button type="button" onClick={onAdvance}>Open Evidence <ArrowRight size={14} weight="bold" /></button></div>
      <div className="source-criteria-list">{criteria.map(([id, name, type], index) => <div className={index === focus ? 'is-live' : ''} key={id}><span>{id}</span><strong>{name}</strong><em>{type}</em></div>)}</div>
    </div>
  )
}

function EvidenceView({ refreshing, onAdvance, tick = 0 }) {
  const [selected, setSelected] = useState(1)
  const [acted, setActed] = useState({})
  const [pendingAction, setPendingAction] = useState(null)
  const [actionComplete, setActionComplete] = useState(false)
  const settle = usePaneSettle()
  useEffect(() => {
    if (refreshing || pendingAction) return
    setSelected(autoplayIndex(tick, 5))
  }, [tick, refreshing, pendingAction])
  if (refreshing) {
    return <div className="workspace-view workspace-loading" aria-live="polite" aria-busy="true"><span>Refreshing site evidence</span>{[1, 2, 3, 4, 5].map((item) => <i key={item} />)}</div>
  }
  const obligations = [
    { code: 'I-2.1', fact: 'EGFR / ALK molecular status', status: 'MISSING', cls: 'Source-dependent', action: 'Request molecular report', current: 'Ordered, no final report found', sources: 'Pathology DiagnosticReport - molecular PDF - external lab', checked: 'Epic FHIR 09:42 - Pathology 09:43', note: 'Computable once a finalized molecular result lands.' },
    { code: 'E-4.2', fact: 'ECOG performance status 0-1', status: 'CONFLICT', cls: 'Subjective', action: 'Route to PI review', current: 'Structured ECOG 1 - newer note ECOG 2', sources: 'FHIR Observation - oncology DocumentReference', checked: 'Epic FHIR 09:42 - Note index 09:43', note: 'PI interpretation required. Both source facts stay cited.' },
    { code: 'I-3.4', fact: 'CMP within 7-day window', status: 'STALE', cls: 'Temporal', action: 'Request CMP order', current: 'Latest CMP is 11 days old', sources: 'Lab Observation - active order interface', checked: 'Lab FHIR 09:42 - Scheduling 09:43', note: 'A repeat panel can clear freshness deterministically.' },
    { code: 'E-5.3', fact: 'At least 21-day prior-therapy washout', status: 'AMBIGUOUS', cls: 'Temporal', action: 'Open chart review', current: 'Last dose differs across two records', sources: 'MedicationAdministration - discharge summary', checked: 'Infusion 09:42 - Documents 09:43', note: 'Coordinator reconciliation required before screening can clear.' },
    { code: 'I-1.1', fact: 'Histologically confirmed NSCLC', status: 'CONFIRM', cls: 'Computable', action: 'Confirm eligibility', current: 'NSCLC confirmed by final pathology', sources: 'Pathology DiagnosticReport', checked: 'Pathology 09:43', note: 'No judgment required. Source maps directly to the rule.' },
  ]
  const detail = obligations[selected]
  const isActed = Boolean(acted[detail.code])
  const actionOwner = detail.code === 'E-4.2' ? 'PI / Sub-I - Dr. M. Avdol' : detail.status === 'CONFIRM' ? 'Site coordinator - G. Freecss' : 'Site coordinator - G. Freecss'
  const actionTicket = `TASK-${detail.code.replace(/[^0-9]/g, '')}-1047`
  const openEvidenceAction = () => { setPendingAction(detail); setActionComplete(false) }
  const confirmEvidenceAction = () => {
    setActed((current) => ({ ...current, [pendingAction.code]: true }))
    setActionComplete(true)
  }
  return (
    <div className="workspace-view source-evidence-view">
      <div className="source-view-intro"><span>EVIDENCE</span><small>How <BrandName /> maps the sponsor packet onto site evidence - PHI-bounded - 09:43</small></div>
      <div className="evidence-coverage"><div><strong>Sponsor packet to evidence coverage</strong><small>Mapped 25 of 36 criteria - Protocol v2.1</small></div><div className="coverage-track"><i /><i /><i /><i /></div><footer><span className="mapped">Mapped - 25</span><span className="missing">Missing - 4</span><span className="conflict">Conflict - 3</span><span className="stale">Stale - 4</span></footer></div>
      <div className="source-evidence-grid"><div className="obligation-list"><span>PROTOCOL OBLIGATIONS - SOURCE MAPPING</span>{obligations.map((item, index) => <button type="button" className={`${selected === index ? 'active ' : ''}${item.status.toLowerCase()}`} aria-label={`${item.code}. ${item.fact}. ${acted[item.code] ? 'ROUTED' : item.status}`} onClick={() => { setSelected(index); setPendingAction(null); setActionComplete(false) }} key={item.code}><i className="evidence-status-dot" aria-hidden="true" /><div><b>{item.code}</b><strong>{item.fact}</strong></div><footer><span>{item.cls}</span><small>{acted[item.code] ? 'Action recorded' : item.action} <ArrowRight size={12} weight="bold" /></small></footer></button>)}</div><div className="obligation-detail"><div className={settle}><header><span>{detail.code}</span><em className={detail.status.toLowerCase()}>{isActed ? 'ROUTED' : detail.status}</em><small>{detail.cls}</small></header><h4>{detail.fact}</h4><p>Maps to protocol {detail.code} - Inclusion - governs screening</p>{pendingAction?.code === detail.code ? <InlineActionPanel open complete={actionComplete} eyebrow="ACTION REQUIRED" title={detail.action} description={detail.note} rows={[["Criterion", detail.code], ["Owner", actionOwner], ["SLA", 'Review within 24 hours'], ["Record", `${actionTicket} - replay-linked`]]} confirmLabel={detail.action} successTitle="Work item created" successDescription={`${detail.action} now sits in the site worklist. Nothing left the site.`} onClose={() => setPendingAction(null)} onConfirm={confirmEvidenceAction} /> : <><dl><div><dt>CURRENT</dt><dd>{detail.current}</dd></div><div><dt>SOURCE PLANE</dt><dd>{detail.sources}</dd></div><div><dt>CHECKED</dt><dd>{detail.checked}</dd></div><div><dt>PROVENANCE</dt><dd>Human decision - source trace available</dd></div></dl><div className={`evidence-guidance ${detail.status === 'CONFIRM' ? 'computable' : ''}`}><span>{detail.status === 'CONFIRM' ? 'NO JUDGMENT REQUIRED' : 'NEXT STEP'}</span><strong>{detail.note}</strong></div>{isActed ? <div className="evidence-action-receipt"><header><span> ACTION RECORDED</span><strong>{actionTicket}</strong></header><dl><div><dt>OWNER</dt><dd>{actionOwner}</dd></div><div><dt>SLA</dt><dd>Review within 24 hours</dd></div><div><dt>REPLAY</dt><dd>Linked to {detail.code} evidence node</dd></div></dl><button type="button" onClick={onAdvance}>Continue to Screening <ArrowRight size={14} weight="bold" /></button></div> : <button className="source-primary-action" type="button" onClick={openEvidenceAction}>{detail.action}</button>}</>}</div></div></div>
    </div>
  )
}

function ScreeningView({ onAdvance, tick = 0 }) {
  const settle = usePaneSettle()
  const [selectedSubject, setSelectedSubject] = useState(2)
  useEffect(() => {
    setSelectedSubject(autoplayIndex(tick, PLATFORM_SCREENING_QUEUE.length))
  }, [tick])
  const subject = PLATFORM_SCREENING_QUEUE[selectedSubject]
  const reviewTrigger = {
    'S-1066': 'Missing source', 'S-1051': 'Stale source', 'S-1047': 'Conflicting sources', 'S-1078': 'Ambiguous date',
  }[subject.id] || (subject.status === 'FAIL' ? 'Deterministic failure' : 'None')
  const recommendation = {
    'S-1066': 'Request molecular report from pathology or external lab.',
    'S-1051': 'Complete the scheduled repeat chemistry panel.',
    'S-1047': 'Open the two ECOG sources for PI resolution.',
    'S-1078': 'Reconcile the last-dose date with pharmacy.',
  }[subject.id]
  return (
    <div className="workspace-view source-screening-view">
      <div className="source-view-intro"><span>SCREENING</span><small>Protocol v2.1</small></div>
      <div className="screen-summary-strip"><div className="pass"><strong>1</strong><span>Pass</span></div><div className="review"><strong>4</strong><span>Review</span></div><div className="fail"><strong>3</strong><span>Fail</span></div></div>
      <div className="source-screen-grid">
        <div className="source-patient-list"><span>PATIENT QUEUE - DECISIVE CRITERION</span>{PLATFORM_SCREENING_QUEUE.map((patient, index) => <button type="button" className={`${index === selectedSubject ? 'active ' : ''}${patient.status.toLowerCase()}`} onClick={() => setSelectedSubject(index)} key={patient.id}><i /><span><strong>{patient.name}<small>{patient.id}</small></strong><em>{patient.criterion}</em></span><b>{patient.status === 'PASS' ? 'CONFIRM' : patient.status}</b></button>)}</div>
        <div className="source-patient-detail"><div className={settle}><header><h4>{subject.name}<small>{subject.id}</small></h4><em className={subject.status.toLowerCase()}>{subject.status === 'PASS' ? 'CONFIRM' : subject.status}</em></header><span>PRIMARY BLOCKER</span><h5>{subject.criterion.split(' - ')[0]} - {subject.blocker}</h5><span>NORMALIZED RULE</span><p>{subject.rule}</p><span>PATIENT FACTS USED</span><ul>{subject.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul><span>EVIDENCE SOURCES</span><p className="source-records">{subject.sources.join(' - ')}</p><div className="screen-result-pair"><span><small>DETERMINISTIC RESULT</small><strong>{subject.status === 'REVIEW' ? 'REVIEW, not FAIL' : subject.status}</strong></span><span><small>REVIEW TRIGGER</small><strong>{reviewTrigger}</strong></span></div>{recommendation && <div className="recommended-action"><span>RECOMMENDED NEXT ACTION</span><strong>{recommendation}</strong></div>}{subject.status === 'REVIEW' && <button className="source-primary-action" type="button" onClick={onAdvance}>Open in Resolve <ArrowRight size={14} weight="bold" /></button>}</div></div>
      </div>
    </div>
  )
}

function ResolveView({ tick = 0 }) {
  const settle = usePaneSettle()
  const [decision, setDecision] = useState(null)
  const [work, setWork] = useState(0)
  const [signedDecisions, setSignedDecisions] = useState({})
  const selectedWork = RESOLVE_WORK_ITEMS[work]
  const signed = signedDecisions[selectedWork.key]
  const remaining = RESOLVE_WORK_ITEMS.length - Object.keys(signedDecisions).length

  const selectWork = (index) => {
    const next = RESOLVE_WORK_ITEMS[index]
    setWork(index)
    setDecision(signedDecisions[next.key] || null)
  }

  const signDecision = () => {
    if (decision) setSignedDecisions((current) => ({ ...current, [selectedWork.key]: decision }))
  }

  useEffect(() => {
    if (decision) return
    selectWork(autoplayIndex(tick, RESOLVE_WORK_ITEMS.length))
  }, [tick, decision])

  return (
    <div className="workspace-view source-resolve-view" key="resolve">
      <div className="source-resolve-top"><span>RESOLVE</span><small>{remaining} awaiting judgment - {Object.keys(signedDecisions).length} committed</small></div>
      <div className="resolve-person-tabs">{RESOLVE_WORK_ITEMS.map((item, index) => <button type="button" className={`${work === index ? 'active ' : ''}${signedDecisions[item.key] ? 'committed' : ''}`} onClick={() => selectWork(index)} key={item.key}><i>{item.patient.split(' ').map((part) => part[0]).join('')}</i>{item.patient}</button>)}</div>
      <div className={settle}>
      <div className="resolve-subject-title"><h4>{selectedWork.patient}<small>{selectedWork.subject}</small></h4><span>{selectedWork.criterion} - {selectedWork.rule}</span></div>
      <div className="resolve-compare-bar"><div><span>{selectedWork.evidence[0].label}</span><strong>{selectedWork.evidence[0].value}</strong><small>{selectedWork.evidence[0].meta}</small></div><b>{selectedWork.symbol}</b><div><span>{selectedWork.evidence[1].label}</span><strong>{selectedWork.evidence[1].value}</strong><small>{selectedWork.evidence[1].meta}</small></div></div>
      <p className="resolve-prompt">{selectedWork.prompt}</p>
      <div className="source-decision-list"><span>YOUR CALL</span>{selectedWork.actions.map((action) => <button className={decision === action.id ? 'selected' : ''} type="button" disabled={Boolean(signed)} onClick={() => setDecision(action.id)} key={action.id}><i />{action.label}</button>)}</div>
      {signed ? <div className="resolve-signed-receipt"><span>DECISION SIGNED - BOUND TO REPLAY</span><strong>{selectedWork.actions.find((action) => action.id === signed)?.label}</strong><small>{selectedWork.signer} - {selectedWork.role} - {selectedWork.record}</small></div> : <div className="resolve-sign-row"><small>{decision ? `${selectedWork.role} signs - evidence preserved - PHI-free` : 'Select a decision to sign'}</small><button type="button" disabled={!decision} onClick={signDecision}>Sign decision</button></div>}
      </div>
      </div>
  )
}

function ReplayView({ tick = 0 }) {
  const settle = usePaneSettle()
  const [exportOpen, setExportOpen] = useState(false)
  const [exportReady, setExportReady] = useState(false)
  const [selected, setSelected] = useState(4)
  const chain = [
    { event: 'Protocol loaded', detail: 'v2.1 - 36 criteria', time: '09:40', actor: 'system', id: 'EVT-1001', rows: [['Version', 'v2.1 - locked'], ['Intake', 'NCT00000204 + sponsor packet'], ['Record hash', 'aead45cf']] },
    { event: 'Evidence ingested', detail: 'Observation/ECOG-8841', time: '09:42', actor: 'system', id: 'EVT-1041', rows: [['Source', 'Epic FHIR R4'], ['Object', 'Observation/ECOG-8841'], ['Integrity', 'Verified - record intact']] },
    { event: 'Document indexed', detail: 'Oncology note - DocumentReference', time: '09:43', actor: 'system', id: 'EVT-1042', rows: [['Source', 'Oncology note'], ['Object', 'DocumentReference/note-2207'], ['Integrity', 'Verified - record intact']] },
    { event: 'Evidence snapshot frozen', detail: 'pop-2026-06-22 - 1,284 resources', time: '09:55', actor: 'system', id: 'EVT-1088', rows: [['Snapshot', 'pop-2026-06-22'], ['Resources', '1,284 - 25/36 mapped'], ['Cutoff', '06-22 09:54']] },
    { event: 'Criterion evaluated', detail: 'I-4.2 ECOG - Protocol v2.1', time: '10:02', actor: 'evaluator', id: 'EVT-1108', flag: 'CONFLICT', rows: [['Engine', 'deterministic - no model'], ['Criterion', 'I-4.2 ECOG 0-1'], ['Facts used', 'structured ECOG 1 (06-18); note ECOG 2 (06-20)'], ['Result', 'REVIEW'], ['Exception', 'CONFLICTING_SOURCE'], ['Integrity', 'Verified - record intact']] },
    { event: 'Screening evaluated', detail: '1 eligible - 4 review - 3 fail', time: '10:03', actor: 'evaluator', id: 'EVT-1110', rows: [['Protocol', 'v2.1'], ['Cohort', '8 subjects'], ['Result', '1 pass - 4 review - 3 fail']] },
    { event: 'Review opened', detail: 'Review R-884 - Screening', time: '10:04', actor: 'system', id: 'EVT-1111', rows: [['Work item', 'Review R-884'], ['Owner', 'PI / Sub-I'], ['State', 'Awaiting site judgment']] },
    { event: 'Resolve committed', detail: 'Review R-884 - PI signature', time: '14:07', actor: 'You', id: 'EVT-1207', rows: [['Decision', 'Accept note - ECOG 2'], ['Signer', 'Dr. M. Avdol - PI / Sub-I'], ['Signature', 'Ed25519 verified']] },
    { event: 'Replay sealed', detail: 'RPL-1047 - export bundle', time: '14:08', actor: 'system', id: 'EVT-1208', rows: [['Object', 'RPL-2026-0622-018-1047'], ['Chain', 'intact - 9 / 9 events'], ['PHI', 'sponsor-safe - excluded']] },
  ]
  const selectedEvent = chain[selected]

  useEffect(() => {
    if (exportOpen) return
    setSelected(autoplayIndex(tick, chain.length))
  }, [tick, exportOpen, chain.length])

  return (
    <div className="workspace-view source-replay-view" key="replay">
      <div className="source-replay-head"><span><b>REPLAY</b><small>Subject S-1047 - DMR-204 - Site 018 - Protocol v2.1 - Run RPL-2026-0622-018-1047 - 06-22</small></span><button className={exportReady ? 'ready' : ''} type="button" onClick={() => { setExportOpen(true); if (exportReady) setExportReady(false) }}>{exportReady ? ' Replay ready' : 'Export Replay'}</button></div>
      <div className="source-replay-grid"><div className="replay-ledger"><span>RECONSTRUCTION LEDGER</span><header><small>TIME</small><small>EVENT</small><small>ACTOR</small><small>INTEGRITY</small></header>{chain.map((item, index) => <button type="button" className={selected === index ? 'active' : ''} onClick={() => { setSelected(index); setExportOpen(false) }} key={item.id}><time>{item.time}</time><span><strong>{item.event}</strong><small>{item.detail}</small></span><em>{item.actor}</em><b> Verified</b></button>)}</div><div className="replay-event-detail"><div className={settle}>{exportOpen ? <InlineActionPanel open complete={exportReady} eyebrow="ACTION REQUIRED" title="Prepare sponsor-safe replay" description="Review chain integrity and data boundary before marking this replay ready. Raw PHI stays excluded." rows={[["Replay", "RPL-2026-0622-018-1047"], ["Events", "9 verified - chain intact"], ["Signature", "Ed25519 - verified"], ["Data boundary", "Sponsor-safe - raw PHI excluded"]]} confirmLabel="Prepare replay" successTitle="Replay ready" successDescription="Sponsor-safe replay is ready inside Damaros. Nothing downloaded to this device." onClose={() => setExportOpen(false)} onConfirm={() => setExportReady(true)} /> : <><span>SELECTED EVENT</span><header><h4>{selectedEvent.event}</h4>{selectedEvent.flag && <em>{selectedEvent.flag}</em>}<small>{selectedEvent.time} - {selectedEvent.id}</small></header><dl>{selectedEvent.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><footer><span>RELATED EVENTS</span><small>{selected > 0 ? chain[selected - 1].event : 'Protocol intake'} - {selected < chain.length - 1 ? chain[selected + 1].event : 'Export bundle'}</small></footer></>}</div></div></div>
    </div>
  )
}

function TridentWorkbench({ selected, setSelected, stage, setStage }) {
  const settle = usePaneSettle()
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestComplete, setRequestComplete] = useState(false)
  const criteria = [
    { code: 'I-3.4', current: 'Serum chemistry within a 7-day window', proposed: 'Serum chemistry within a 14-day window', friction: 73, projected: 25, unblocks: 'E. Morn - S-1051; R. Silva - S-1095', rationale: 'A 7-day lab window forces a redundant confirmatory draw when routine labs are 8 to 10 days old at consent. 14 days matches outpatient cadence, and screening chemistry is stable across it.' },
    { code: 'E-5.3', current: 'At least 21-day prior-therapy washout', proposed: 'At least 14-day washout for oral agents', friction: 61, projected: 28, unblocks: 'I. Rey - S-1078; C. Bray - S-1083', rationale: 'A 21-day washout excludes patients still tapering an oral targeted agent. At five half-lives in under 14 days, a 14-day washout is pharmacologically sufficient.' },
    { code: 'I-4.2', current: 'ECOG 0 to 1 within 14 days', proposed: 'ECOG 0 to 2 within 21 days', friction: 44, projected: 22, unblocks: 'J. Alvarez - S-1118', rationale: 'ECOG 0 to 1 screens out patients whose performance status reflects treatable disease burden. ECOG 0 to 2 matches the enrolled population in comparable second-line trials.' },
    { code: 'I-2.1', current: 'EGFR / ALK from an in-network lab', proposed: 'EGFR / ALK from any CAP/CLIA lab', friction: 58, projected: 24, unblocks: 'M. Hughes - S-1066; M. Sov - S-1071', rationale: 'Requiring an in-network lab re-tests patients who already hold a valid EGFR / ALK result. Concordant CAP/CLIA outside reports are accepted, removing weeks of delay.' },
  ]
  const criterion = criteria[selected]
  const drafting = stage === 1 || stage === 2
  const drafted = stage >= 3
  const requested = stage >= 5

  useEffect(() => {
    if (stage !== 1 && stage !== 2) return undefined
    const stageTimer = window.setTimeout(() => setStage(stage === 1 ? 2 : 3), stage === 1 ? 620 : 760)
    return () => window.clearTimeout(stageTimer)
  }, [stage, setStage])

  return (
    <div className="trident-workbench" aria-live="polite">
      <div className="trident-list">{criteria.map((item, index) => <button className={index === selected ? 'active' : ''} type="button" onClick={() => { setSelected(index); setStage(0); setRequestOpen(false); setRequestComplete(false) }} key={item.code}><span><b>{item.code}</b><strong>{item.current}</strong><i><span className={`metric-tone ${metricTone('friction', item.friction)}`} style={{ width: `${item.friction}%` }} /></i></span><em className={`metric-tone ${metricTone('friction', item.friction)}`}>{item.friction}%</em></button>)}</div>
      <div className="trident-detail">
        <div className={settle}>
        <div className="trident-detail-head"><span><small>SELECTED CRITERION</small><strong>{criterion.code}</strong></span><em>{requested ? 'REQUESTED' : drafted ? 'DRAFT READY' : drafting ? 'DRAFTING' : 'REVIEW'}</em></div>
        {requestOpen ? <InlineActionPanel open complete={requestComplete} title="Request amendment from sponsor" description="Send Trident's PHI-free case to Meridian Oncology Therapeutics. Sponsor authors and signs the amendment." rows={[["Criterion", criterion.code], ["Projected friction", `${criterion.friction}% to ${criterion.projected}%`], ["Evidence", "FDA guidance - ontology-normalized criteria"], ["Authority", "Sponsor medical monitor"]]} confirmLabel="Send request" successTitle="Request sent to sponsor" successDescription="Meridian received Trident's draft. SLA 5 business days. Request bound to Replay." onClose={() => { setRequestOpen(false); if (!requestComplete) setStage(3) }} onConfirm={() => { setRequestComplete(true); setStage(5) }} /> : drafting ? <div className="agent-processing-state"><span /><strong>{stage === 1 ? 'Reading protocol and FDA guidance...' : 'Mapping ontology concepts...'}</strong><small>Source links remain attached while Trident builds the bounded delta.</small></div> : <>
          <div className="trident-compare"><div><small>CURRENT - {criterion.code}</small><strong>{criterion.current}</strong></div><div><small>PROPOSED</small><strong>{criterion.proposed}</strong></div></div>
          {drafted && <><div className="trident-impact-pair"><div><small>CURRENT FRICTION</small><strong className={`metric-tone ${metricTone('friction', criterion.friction)}`}>{criterion.friction}%</strong><i><span className={`metric-tone ${metricTone('friction', criterion.friction)}`} style={{ width: `${criterion.friction}%` }} /></i></div><div><small>PROJECTED - DOWN {criterion.friction - criterion.projected} PTS</small><strong className={`metric-tone ${metricTone('friction', criterion.projected)}`}>{criterion.projected}%</strong><i><span className={`metric-tone ${metricTone('friction', criterion.projected)}`} style={{ width: `${criterion.projected}%` }} /></i></div></div><div className="trident-draft-sheet"><div><span>THE CASE TRIDENT HANDS THE SPONSOR</span><small>Amendment draft - v2.2</small></div><p><strong>Endpoints unaffected.</strong> Structural eligibility change only. Primary and secondary endpoints stay untouched.</p><p><strong>PHI-free, clinician-led.</strong> Sponsor medical monitor decides and signs.</p><small>Unblocks - {criterion.unblocks}</small></div></>}
          {!drafted && <div className="trident-rationale"><span>WHY THIS CHANGES</span><p>{criterion.rationale}</p><div><small>UNBLOCKS - STAGED FOR HUMAN DECISION</small><strong>{criterion.unblocks}</strong></div></div>}
          <div className="trident-actions">{!drafted && <button className="trident-primary" type="button" onClick={() => setStage(1)}>Draft amendment - {criterion.code} <ArrowRight size={18} weight="bold" /></button>}{drafted && !requested && <button className="trident-primary" type="button" onClick={() => { setRequestOpen(true); setRequestComplete(false); setStage(4) }}>Request amendment from sponsor <ArrowRight size={18} weight="bold" /></button>}{requested && <div className="trident-complete"><CheckCircle size={19} weight="fill" /><span><strong>Request sent to sponsor</strong><small>Meridian Oncology Therapeutics - SLA 5 business days - replay-linked</small></span></div>}<small>{!drafted ? 'Trident drafts. Sponsor decides.' : !requested ? 'Draft remains editable until request.' : 'No protocol logic changed without sponsor review.'}</small></div>
        </>}
        </div>
      </div>
    </div>
  )
}

function EyeWorkbench({ selected, setSelected, routed, setRouted }) {
  const settle = usePaneSettle()
  const [routeOpen, setRouteOpen] = useState(false)
  const [routeComplete, setRouteComplete] = useState(false)
  const signals = [
    { id: 'lat', name: 'Evidence-to-screening latency', type: 'Drift', value: '4.6', unit: 'days to screen', delta: '+2.1 SD vs baseline', sees: "Median evidence-to-screening time has drifted to 4.6 days, 2.1 SD above this site's 90-day baseline.", cause: 'Consistent with a review queue backing up behind a coordinator carrying too many open charts. A capacity signal, not a data-quality one.', impact: 'Eligible candidates can age out of enrollment windows and time-to-first-patient slips.', method: 'CUSUM vs. site baseline - ICH E6(R3) RBQM', route: 'Route to coordinator advisory', ticket: 'ADV-018-L14', owner: 'Site 018 coordinator' },
    { id: 'cmp', name: 'Chemistry-panel re-query rate', type: 'Spike', value: '5.0x', unit: 'vs baseline', delta: 'this week', sees: 'Chemistry-panel re-queries are running 5.0x the site baseline this week, isolated to one analyzer.', cause: 'Values cluster rather than scatter: analyzer calibration drift, not coordinator data entry.', impact: 'Uncorrected, it inflates query burden, delays database lock, and risks a monitoring finding.', method: 'Rate vs. rolling 90-day mean - source-attributed', route: 'Escalate to sponsor quality', ticket: 'SQ-018-C22', owner: 'Sponsor quality - Meridian Oncology' },
    { id: 'qry', name: 'Open-query backlog age', type: 'Drift', value: '12.4', unit: 'days median age', delta: '+1.4 SD vs baseline', sees: "Median open-query age has drifted to 12.4 days, past the site's two-week norm.", cause: 'Oldest cluster sits on lab-value reconciliation waiting on an outside report.', impact: 'Query aging predicts delayed database lock and inflated monitoring hours.', method: 'Aging distribution vs. site baseline', route: 'Route to data manager', ticket: 'DM-018-Q31', owner: 'Site 018 data manager' },
    { id: 'thr', name: 'Screening throughput', type: 'Steady', value: '98%', unit: 'of control band', delta: 'within band', sees: 'Throughput is holding at 98% of the control band.', cause: 'Stable. Eye stays quiet when nothing needs attention.', impact: 'No action required. Surfacing only deviations keeps the site team focused.', method: 'Statistical process control - within 2 SD', route: '', ticket: '', owner: '' },
  ]
  const signal = signals[selected]
  const done = routed === signal.id || (signal.type === 'Steady')
  return <div className="agent-workbench agent-eye-workbench" aria-live="polite">
    <div className="eye-kpis"><div><strong className="metric-tone is-good">8</strong><small>Signals monitored</small></div><div><strong className="metric-tone is-bad">7</strong><small>Need attention</small></div><div><strong className="metric-tone is-warn">6</strong><small>Routed this period</small></div><div><strong className="metric-tone is-good">98%</strong><small>Screening throughput</small></div></div>
    <div className="quality-signal-grid">
      <div className="quality-list">{signals.map((item, index) => <button className={selected === index ? 'active' : ''} type="button" aria-pressed={selected === index} onClick={() => { setSelected(index); setRouteOpen(false); setRouteComplete(false) }} key={item.id}><span><b>{item.type}</b><strong>{item.name}</strong><small>{item.delta}</small></span><em className={`metric-tone ${metricTone('signal', item.type)}`}>{item.value}</em></button>)}</div>
      <div className={`quality-detail${routeOpen ? ' is-action' : ''}`}>
        {routeOpen ? <InlineActionPanel open complete={routeComplete} title={signal.route} description="Create an evidence-bound advisory. Eye does not change screening results or site decisions." rows={[["Signal", signal.name], ["Owner", signal.owner], ["SLA", "24 hours"], ["Record", `${signal.ticket} - replay-linked`]]} confirmLabel={signal.route} successTitle="Quality signal routed" successDescription={`${signal.ticket} reached ${signal.owner}. Source signal stays linked.`} onClose={() => setRouteOpen(false)} onConfirm={() => { setRouted(signal.id); setRouteComplete(true) }} /> : <>
        <div className={settle}>
        <span>{signal.type} - KRI</span>
        <h4>{signal.name}</h4>
        <div className="eye-metric"><strong className={`metric-tone ${metricTone('signal', signal.type)}`}>{signal.value}</strong><span>{signal.unit}</span><em>{signal.delta}</em></div>
        <div className="eye-spark" aria-hidden="true">{[2, 2, 3, 3, 4, 6].map((value, index) => <i style={{ height: `${9 + value * 5}px` }} key={index} />)}</div>
        <div className="eye-explanation"><div><small>WHAT EYE SEES</small><p>{signal.sees}</p></div><div><small>LIKELY CAUSE</small><p>{signal.cause}</p></div><div><small>IF UNADDRESSED</small><p>{signal.impact}</p></div></div>
        <div className="eye-method"><small>METHOD</small><strong>{signal.method}</strong></div>
        </div>
        <div className="agent-action-slot">
          {done ? <div className="agent-written"><CheckCircle size={18} weight="fill" /><span><strong>{signal.type === 'Steady' ? 'Within control band' : `${signal.ticket} routed`}</strong><small>{signal.type === 'Steady' ? 'No routing needed. Eye stays quiet.' : `${signal.owner} - bound to Replay`}</small></span></div> : <button className="trident-primary" type="button" onClick={() => { setRouteOpen(true); setRouteComplete(false) }}>{signal.route} <ArrowRight size={18} weight="bold" /></button>}
        </div>
        </>}
      </div>
    </div>
  </div>
}

function LunaWorkbench({ asked, setAsked, tick, playing }) {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const [question, setQuestion] = useState(asked ? 1 : 0)
  const [openedCitation, setOpenedCitation] = useState(null)
  const activeQuestion = LUNA_INVESTIGATIONS[question]
  const citations = activeQuestion.citations
  const openCitation = citations.find((citation) => citation.id === (openedCitation || citations[0].id)) || citations[0]

  useEffect(() => {
    if (!playing || asked || tick === 0) return
    setQuestion(autoplayIndex(tick, LUNA_INVESTIGATIONS.length))
    setOpenedCitation(null)
  }, [tick, playing, asked])

  const runInvestigation = (index) => {
    setQuestion(index)
    setOpenedCitation(null)
    setAsked(true)
  }

  useGSAP(() => {
    if (reduced || !root.current) return undefined
    const targets = root.current.querySelectorAll('.luna-finding-head, .luna-finding-meta, .luna-finding-note, .luna-evidence-workspace')
    const tween = gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.36, stagger: 0.045, ease: 'power2.out', clearProps: 'transform' })
    return () => tween.kill()
  }, { scope: root, dependencies: [question, reduced] })

  useGSAP(() => {
    if (reduced || !root.current) return undefined
    const targets = root.current.querySelectorAll('.luna-source-inspector > *')
    const tween = gsap.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.28, stagger: 0.035, ease: 'power2.out', clearProps: 'transform' })
    return () => tween.kill()
  }, { scope: root, dependencies: [openedCitation, question, reduced] })

  return <div className="agent-workbench agent-luna-workbench" aria-live="polite" ref={root}>
    <div className="luna-investigation-grid">
      <div className="luna-question-list">
        <span>OPEN READS - {LUNA_INVESTIGATIONS.length}</span>
        {LUNA_INVESTIGATIONS.map((item, index) => (
          <button className={question === index ? 'active' : ''} type="button" onClick={() => runInvestigation(index)} key={item.q}>
            <em>{item.cat}</em>
            <strong>{item.q}</strong>
          </button>
        ))}
      </div>
      <div className="audit-answer luna-answer-panel">
        <div className="luna-answer-body">
        <div className="luna-finding-head"><span><small>FINDING - RECONSTRUCTED FROM CHAIN</small><strong>{activeQuestion.q}</strong></span><em>CHAIN VERIFIED</em></div>
        <div className="luna-finding-meta"><div><small>SUBJECT</small><strong>{activeQuestion.subject}</strong></div><div><small>ASKED</small><strong>{activeQuestion.asked}</strong></div><div><small>CITED</small><strong>{citations.length} chain rows</strong></div></div>
        <div className="luna-finding-note"><small>RECONSTRUCTION</small><p>{activeQuestion.answer}</p></div>
        <div className="luna-evidence-workspace">
          <div className="luna-chain"><header><span>EVIDENCE CHAIN</span><small>{citations.length} rows - sealed</small></header>{citations.map((citation, index) => (
            <button className={openCitation.id === citation.id ? 'active' : ''} type="button" aria-pressed={openCitation.id === citation.id} onClick={() => setOpenedCitation(citation.id)} key={citation.id}>
              <span className="luna-chain-index">{String(index + 1).padStart(2, '0')}</span>
              <span><small>{citation.type}</small><strong>{citation.value}</strong><em>{citation.source}</em></span>
              <CheckCircle size={16} weight="fill" />
            </button>
          ))}</div>
          <aside className="luna-citation-record luna-source-inspector" aria-live="polite">
            <header><small>OPEN CITATION</small><em><CheckCircle size={13} weight="fill" /> VERIFIED</em></header>
            <span>{openCitation.type}</span>
            <h5>{openCitation.value}</h5>
            <dl><div><dt>SOURCE ID</dt><dd>{openCitation.id}</dd></div><div><dt>CHAIN ROW</dt><dd>{openCitation.source}</dd></div><div><dt>ANCHOR</dt><dd>{openCitation.hash}</dd></div><div><dt>SUBJECT</dt><dd>{activeQuestion.subject}</dd></div></dl>
            <footer><ShieldCheck size={16} /><span><strong>Read boundary intact</strong><small>Luna cites this row. Record remains unchanged.</small></span></footer>
          </aside>
        </div>
        </div>
      </div>
    </div>
  </div>
}

function SentinelWorkbench({ selected, setSelected, surfaced, setSurfaced }) {
  const settle = usePaneSettle()
  const [surfaceOpen, setSurfaceOpen] = useState(false)
  const [surfaceComplete, setSurfaceComplete] = useState(false)
  const study = SENTINEL_STUDIES[selected]
  const done = surfaced === study.id
  return <div className="agent-workbench agent-sentinel-workbench" aria-live="polite">
    <div className="sentinel-summary"><strong className="metric-tone is-good">{SENTINEL_STUDIES.length}</strong><span>of 9 open protocols fit Site 018</span><em>Aggregate only - synthetic</em></div>
    <div className="sentinel-grid">
      <div className="sentinel-studies">{SENTINEL_STUDIES.map((item, index) => <button className={selected === index ? 'active' : ''} type="button" onClick={() => { setSelected(index); setSurfaceOpen(false); setSurfaceComplete(false) }} key={item.id}><span><b>{item.id}</b><strong>{item.title}</strong><small>{item.phase} - {item.coverage}</small></span><em className={`metric-tone ${metricTone('fit', Number.parseInt(item.fit, 10))}`}>{item.fit}<small>{item.status}</small></em></button>)}</div>
      <div className={`sentinel-detail${surfaceOpen ? ' is-action' : ''}`}>
        {surfaceOpen ? <InlineActionPanel open complete={surfaceComplete} title="Surface site capacity" description="Share one aggregate opportunity signal. Sponsor sees capability supply, not a patient." rows={[["Protocol", `${study.id} - ${study.phase}`], ["Sponsor", study.sponsor], ["Coverage", `${study.fit} - ${study.coverage}`], ["Boundary", "PHI-free - no patient-level data"]]} confirmLabel="Surface to sponsor" successTitle="Opportunity surfaced" successDescription={`${study.sponsor} received aggregate site capacity. Signal bound to Replay.`} onClose={() => setSurfaceOpen(false)} onConfirm={() => { setSurfaced(study.id); setSurfaceComplete(true) }} /> : <>
        <div className={settle}>
        <span>SELECTED PROTOCOL - {study.id}</span>
        <h4>{study.title}</h4>
        <div className="sentinel-coverage"><strong className={`metric-tone ${metricTone('fit', Number.parseInt(study.fit, 10))}`}>{study.fit}</strong><span>{Array.from({ length: 10 }, (_, index) => <i className={index < Number.parseInt(study.coverage, 10) ? 'filled' : ''} key={index} />)}</span></div>
        <div className="sentinel-meta"><div><small>SPONSOR</small><strong>{study.sponsor}</strong></div><div><small>PI</small><strong>{study.pi}</strong></div><div><small>SITES</small><strong>{study.sites}</strong></div><div><small>WINDOW</small><strong>{study.window}</strong></div><div><small>LAST MATCH</small><strong>{study.scanned}</strong></div><div><small>COVERAGE GAP</small><strong>{study.gap}</strong></div></div>
        <div className="sentinel-concepts"><small>EVIDENCE CONCEPTS COVERED</small><div>{study.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div></div>
        <div className="sentinel-note"><small>COVERAGE NOTE</small><p>{study.gap === 'None material' ? 'No blocking site gap on the coverage graph. Patient data stays inside Site 018.' : `Open site gap: ${study.gap}. Coverage graph only. Patient data stays inside Site 018.`}</p></div>
        </div>
        <div className="agent-action-slot">
          {done ? <div className="agent-written"><CheckCircle size={18} weight="fill" /><span><strong>Opportunity surfaced</strong><small>{study.sponsor} - aggregate signal - no PHI</small></span></div> : <button className="trident-primary" type="button" onClick={() => { setSurfaceOpen(true); setSurfaceComplete(false) }}>Surface to sponsor <ArrowRight size={18} weight="bold" /></button>}
        </div>
        </>}
      </div>
    </div>
  </div>
}

function AgentOperations() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const inView = useInView(root)
  const { isolated } = useModelPath()
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)
  const { held, hold } = useAutoplayHold(reduced)
  const visible = useDocumentVisible()
  const { fading, swap } = useSoftSwap(reduced)
  const [tridentCriterion, setTridentCriterion] = useState(3)
  const [tridentStage, setTridentStage] = useState(0)
  const [eyeSelected, setEyeSelected] = useState(0)
  const [eyeRouted, setEyeRouted] = useState(false)
  const [lunaAsked, setLunaAsked] = useState(false)
  const [sentinelSelected, setSentinelSelected] = useState(2)
  const [sentinelSurfaced, setSentinelSurfaced] = useState(false)
  const agent = AGENTS[active]
  const playing = !narrow && shouldPlayAutoplay({ reduced, held, inView, visible }) && !isolated
  const runContext = [
    {
      object: `Criterion ${['I-3.4', 'E-5.3', 'I-4.2', 'I-2.1'][tridentCriterion]}`,
      source: 'Protocol v2.1 - sponsor packet',
      boundary: 'Draft only',
      authority: 'Sponsor medical monitor',
      events: ['Criterion normalized', 'Site friction compared', tridentStage >= 3 ? 'Bounded draft prepared' : 'Evidence case assembling'],
    },
    {
      object: ['Latency drift', 'Chemistry re-query', 'Query backlog', 'Throughput'][eyeSelected],
      source: 'Site 018 - 90-day baseline',
      boundary: 'Process signal only',
      authority: 'Site quality lead',
      events: ['Baseline window read', 'Deviation source-bound', eyeRouted ? 'Advisory routed' : 'Advisory awaiting review'],
    },
    {
      object: 'Replay RPL-1047',
      source: 'Signed execution chain',
      boundary: 'Read only',
      authority: 'Record remains unchanged',
      events: ['Question parsed', 'Chain rows retrieved', 'Answer cited to source'],
    },
    {
      object: SENTINEL_STUDIES[sentinelSelected].id,
      source: 'Aggregate coverage graph',
      boundary: 'No patient-level data',
      authority: 'Site release required',
      events: ['Open protocols compared', 'Coverage gap checked', sentinelSurfaced ? 'Capacity signal released' : 'Signal awaiting site release'],
    },
  ][active]

  useEffect(() => {
    if (!playing) return undefined
    const traceTimer = window.setInterval(() => setTick((value) => value + 1), AGENT_TICK_MS)
    return () => window.clearInterval(traceTimer)
  }, [playing])

  useEffect(() => {
    if (!playing || tick === 0 || tick % AGENT_ROTATE_TICKS !== 0) return
    swap(() => {
      setActive((value) => (value + 1) % AGENTS.length)
      setTick(0)
    })
  }, [tick, playing, swap])

  useEffect(() => {
    if (!playing || tick === 0 || tick % AGENT_ROTATE_TICKS === 0) return
    if (tridentStage === 0) setTridentCriterion(autoplayIndex(tick, 4))
    setEyeSelected(autoplayIndex(tick, 4))
    setSentinelSelected(autoplayIndex(tick, SENTINEL_STUDIES.length))
  }, [tick, playing, tridentStage])

  useEnterMotion(root, reduced, () => gsap.from('.agent-console', {
    opacity: 0,
    duration: 0.95,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
  }))

  return (
    <section className="agent-operations-section section-space" id="agents" ref={root}>
      <div className="agent-story-heading">
        <span className="section-kicker">The agents</span>
        <h2>Four agents.</h2>
        <p>Find, draft, flag, cite. Never decide.</p>
      </div>
      <div className="agent-console" onClickCapture={(event) => { if (shouldHoldAutoplayFromClick(event.target)) hold() }}>
        <div className="mac-titlebar">
          <div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div>
          <WindowBrand />
          <span aria-hidden="true" />
        </div>
        <div className="agent-console-grid">
          <aside className="agent-console-nav">
            <span>AGENTS</span>
            {AGENTS.map((item, index) => (
              <button className={index === active ? 'active' : ''} type="button" aria-pressed={index === active} aria-label={item.name} onClick={() => { hold(); swap(() => { setActive(index); setTick(0) }, false) }} key={item.name}>
                <i />
                <AgentGlyph kind={item.icon} size={14} />
                {item.name}
              </button>
            ))}
            <div className="agent-console-context"><small>CURRENT RUN</small><strong>DMR-204 - v2.1</strong><span>Site 018 - synthetic</span></div>
          </aside>
          <main className="agent-console-main">
            <div className={`agent-console-state${fading ? ' is-fading' : ''}`}>
              <div className="agent-console-header">
                <div><span>{agent.name}</span><h3>{agent.task}</h3><p>{agent.text}</p></div>
                {isolated ? <em>Isolated</em> : active === 2 ? <em>Read only</em> : ((active === 0 && tridentStage < 5) || (active === 1 && eyeSelected !== 3 && !eyeRouted) || (active === 3 && !sentinelSurfaced)) ? <em className="agent-working-state"><i /> {active === 0 && tridentStage === 0 ? 'Ready' : 'Working'}</em> : <em><CheckCircle size={14} weight="fill" /> {active === 1 && eyeSelected === 3 ? 'No action' : 'Complete'}</em>}
              </div>
              <div className="agent-workspace-body">
                <div className="agent-workspace-live">
              {active === 0 ? <TridentWorkbench selected={tridentCriterion} setSelected={setTridentCriterion} stage={tridentStage} setStage={setTridentStage} /> : active === 1 ? <EyeWorkbench selected={eyeSelected} setSelected={setEyeSelected} routed={eyeRouted} setRouted={setEyeRouted} /> : active === 2 ? <LunaWorkbench asked={lunaAsked} setAsked={setLunaAsked} tick={tick} playing={playing} /> : active === 3 ? <SentinelWorkbench selected={sentinelSelected} setSelected={setSentinelSelected} surfaced={sentinelSurfaced} setSurfaced={setSentinelSurfaced} /> : <><div className="agent-quick-demo">
                <div className="agent-quick-demo-head"><span>{agent.demoLabel}</span><small>{agent.input} <ArrowRight size={12} /> {agent.output}</small></div>
                <div className="agent-quick-demo-columns">{agent.demoColumns.map((column) => <span key={column}>{column}</span>)}</div>
                {agent.demoRows.map((row, index) => <div className={index === tick % agent.demoRows.length ? 'active' : ''} key={row[0]}>{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
              </div><div className="agent-console-trace">
                <div className="agent-console-trace-head"><span>RUN TRACE</span><small>Source-linked - synthetic</small></div>
                {agent.trace.map((event, index) => <div className={index === tick % agent.trace.length ? 'active' : ''} key={event}><span>{String(index + 1).padStart(2, '0')}</span><CheckCircle size={16} weight="fill" /><strong>{event}</strong><small>{index === tick % agent.trace.length ? 'working now' : 'complete'}</small></div>)}
              </div></>}
                </div>
                <aside className="agent-run-rail" aria-label={`${agent.name} run context`}>
                  <div className="agent-run-object"><span>CURRENT OBJECT</span><strong>{runContext.object}</strong><small>DMR-204 - Site 018</small></div>
                  <dl>
                    <div><dt>SOURCE</dt><dd>{runContext.source}</dd></div>
                    <div><dt>BOUNDARY</dt><dd>{runContext.boundary}</dd></div>
                    <div><dt>AUTHORITY</dt><dd>{runContext.authority}</dd></div>
                  </dl>
                  <div className="agent-run-activity"><span>LIVE ACTIVITY</span>{runContext.events.map((event, index) => <div className={index === tick % runContext.events.length ? 'active' : ''} key={event}><i /><span><strong>{event}</strong><small>{index === tick % runContext.events.length ? 'working now' : 'verified'}</small></span></div>)}</div>
                  <div className="agent-run-boundary"><ShieldCheck size={17} /><span><small>CONTROL BOUNDARY</small><strong>{isolated ? 'Model path isolated. No cloud inference.' : agent.guardrail}</strong></span></div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

function SiteNodeSection() {
  const root = useRef(null)
  const reviewTimer = useRef(0)
  const reduced = useReducedMotion()
  const { isolated } = useModelPath()
  const [selectedControl, setSelectedControl] = useState(0)
  const [reviewPhase, setReviewPhase] = useState('idle')
  const [reviewedControls, setReviewedControls] = useState({})
  const sources = [
    { name: 'Epic - FHIR R4', read: 'Last read 10:41', icon: Database },
    { name: 'Lab interface', read: 'Last read 10:41', icon: FileText },
    { name: 'Imaging archive', read: 'Last read 10:40', icon: Fingerprint },
    { name: 'eReg - CTMS', read: 'Signer sync 10:42', icon: ShieldCheck },
  ]
  const controls = [
    { name: 'Evidence visibility', policy: 'Site roles only', title: 'Inspect evidence access boundary', description: 'Only approved site roles can open source evidence or mapped patient facts.', scope: 'FHIR resources, documents, and mapped facts', checked: '10:41 - 4 approved sources', record: 'POL-018-EV4', receipt: 'REV-018-EV4-1044', recipient: '7 approved site roles', patientFields: 'Site-held', action: 'Review access boundary', decision: 'Confirm current access boundary', outcome: 'Access remains limited to 7 approved site roles. No external principal receives patient evidence.', success: 'Access review recorded', guard: 'Patient evidence stays site-held. Approved roles only.' },
    { name: 'Artifact release', policy: 'PI or delegated signer', title: 'Review sponsor artifact release', description: 'Replay bundles remain at the site until a PI or delegated signer releases the exact artifact.', scope: 'Replay bundle - RPL-1047', checked: '10:42 - signer roster current', record: 'POL-018-AR2', receipt: 'REV-018-AR2-1044', recipient: 'Meridian Oncology', patientFields: '0 in sponsor artifact', action: 'Review artifact release', decision: 'Confirm delegated release authority', outcome: 'Replay remains site-held until a PI or delegated signer releases this exact artifact.', success: 'Artifact review recorded', guard: 'Replay stays site-held until a PI signs the exact artifact.' },
    { name: 'Network signal', policy: 'Aggregate coverage only', title: 'Release aggregate coverage signal', description: 'Review the exact outbound payload. Sponsor receives site capability, never patient facts.', scope: 'Protocol capability - Site 018', checked: '10:42 - payload reduced', record: 'POL-018-NS7', receipt: 'REV-018-NS7-1044', recipient: 'Meridian Oncology', patientFields: '0 patient fields', action: 'Review signal release', decision: 'Approve aggregate-only payload', outcome: 'Coverage signal contains 0 patient fields. Site capability is the only outbound payload.', success: 'Signal review recorded', guard: 'Coverage signal carries 0 patient fields.' },
    { name: 'Model execution', policy: isolated ? 'Isolated - no inference' : 'Local inference allowed', title: 'Inspect local model attestation', description: isolated ? 'Model path is isolated. No local inference and no cloud connection until a site reviewer restores the path.' : 'Model execution stays inside the institution boundary and writes only source-linked work products.', scope: 'Site node runtime - Run 018-017', checked: isolated ? 'Isolated - no model path' : '10:43 - runtime attested', record: 'POL-018-ME3', receipt: 'REV-018-ME3-1044', recipient: 'Site execution record', patientFields: 'No raw egress', action: 'Review run attestation', decision: isolated ? 'Keep model path isolated' : 'Accept local runtime attestation', outcome: isolated ? 'No model path is open. Patient evidence never entered an LLM.' : 'Run remains site-bound. Only source-linked work products enter the execution record.', success: 'Attestation review recorded', guard: isolated ? 'No LLM path. No cloud inference.' : 'Inference stays inside the institution boundary.' },
  ]
  const control = controls[selectedControl]
  const completedReview = reviewedControls[control.record]

  useEffect(() => () => window.clearTimeout(reviewTimer.current), [])

  const selectControl = (index) => {
    window.clearTimeout(reviewTimer.current)
    setSelectedControl(index)
    setReviewPhase('idle')
  }

  const openControlReview = () => setReviewPhase(completedReview ? 'complete' : 'review')

  const confirmControlReview = () => {
    const record = control.record
    window.clearTimeout(reviewTimer.current)
    setReviewPhase('saving')
    reviewTimer.current = window.setTimeout(() => {
      setReviewedControls((current) => ({ ...current, [record]: true }))
      setReviewPhase('complete')
    }, reduced ? 120 : 900)
  }
  useEnterMotion(root, reduced, () => [
    gsap.from('.node-copy > *', {
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
    gsap.from('.node-system > *', {
      opacity: 0,
      stagger: 0.1,
      clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
  ])

  return (
    <section className="node-section section-space" id="site-control" ref={root}>
      <div className="node-system" aria-label="Damaros site node control model">
        <div className="mac-titlebar"><div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div><WindowBrand /><span className="window-live"><i /> {isolated ? 'Models isolated' : 'Institution-held'}</span></div>
        <div className="node-product-grid">
          <aside className="node-source-nav">
            <div className="node-policy-list">
              <span>ACTIVE CONTROLS</span>
              {controls.map((item, index) => (
                <button className={`node-policy-item${selectedControl === index ? ' active' : ''}${reviewedControls[item.record] ? ' is-reviewed' : ''}`} type="button" aria-pressed={selectedControl === index} onClick={() => selectControl(index)} key={item.name}>
                  <i />
                  <ShieldCheck size={15} />
                  <span><strong>{item.name}</strong><small>{item.policy}</small></span>
                </button>
              ))}
            </div>
            <div className="node-rail-foot">
              <div className="node-boundary-card"><small>INSTITUTION BOUNDARY</small><strong>Site 018 - Damaros Health</strong><span>4 sources - 7 site roles</span></div>
              <ModelPathSwitch />
            </div>
          </aside>
          <div className="node-policy-main">
            <div className="node-policy-header"><span><small>SITE CONTROL PLANE</small><strong>Local sources. Local signatures.</strong></span><em><ShieldCheck size={16} /> All controls healthy</em></div>
            <div className="node-security-workspace">
              <div className="node-control-detail">
                {reviewPhase !== 'idle' ? <SiteControlReview control={control} phase={reviewPhase} reduced={reduced} onBack={() => setReviewPhase('idle')} onConfirm={confirmControlReview} onReturn={() => setReviewPhase('idle')} /> : <>
                  <div className="node-control-body">
                    <header><span><small>SELECTED CONTROL - {control.record}</small><h4>{control.title}</h4></span><em className={completedReview ? 'is-reviewed' : 'is-pending'}><i /> {completedReview ? 'REVIEWED' : 'ENFORCED'}</em></header>
                    <p>{control.description}</p>
                    <dl className="node-control-facts">
                      <div><dt>SCOPE</dt><dd>{control.scope}</dd></div>
                      <div><dt>BOUNDARY</dt><dd>{control.patientFields}</dd></div>
                      <div><dt>AUTHORITY</dt><dd>{control.policy}</dd></div>
                    </dl>
                    <div className="node-event-ledger">
                      <span>RECENT POLICY EVENTS</span>
                      <div className={completedReview ? 'is-reviewed' : 'is-pending'}><time>{completedReview ? '10:44' : '--:--'}</time><strong>{completedReview ? 'Site review recorded' : 'Site review pending'}</strong><small>{completedReview ? `${control.receipt} - signed` : 'Awaiting reviewer'}</small></div>
                      <div><time>10:43</time><strong>{control.name} checked</strong><small>{control.record} - verified</small></div>
                    </div>
                    <div className="node-source-strip" aria-label="Approved sources">
                      {sources.map((source) => {
                        const Icon = source.icon
                        return <div className="node-source-item" key={source.name}><Icon size={15} /><span><span>{source.name}</span><small>{source.read}</small></span><i /></div>
                      })}
                    </div>
                  </div>
                  <NodeControlFooter control={control}>
                    <button className="node-review-button" type="button" onClick={openControlReview}>{completedReview ? 'Open review receipt' : control.action} <ArrowRight size={17} weight="bold" /></button>
                  </NodeControlFooter>
                </>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="node-copy">
        <h2><span>Evidence stays</span><span>with the site.</span></h2>
        <p>Patient data, evidence, signatures, and execution records remain under site governance. Only aggregate, patient-free coverage signals can leave.</p>
        <div className="node-facts">
          <span><ShieldCheck size={18} /> Replayable proof</span>
          <span><Database size={18} /> Site-approved sources</span>
          <span><Fingerprint size={18} /> Attributable actions</span>
        </div>
      </div>
    </section>
  )
}

function FinalCta({ about = false }) {
  return (
    <section className="final-cta section-space" id="pilot">
      <img className="final-cta-mark" src="/assets/damaros-monogram.svg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <p>{about ? 'Build capacity where care already happens.' : 'Bring one protocol. Leave with a replayable run.'}</p>
      <h2>{about ? 'Make research capacity buildable.' : 'Start with a real site workflow.'}</h2>
      <PilotButton className="button button-primary button-large">Start a pilot <ArrowUpRight size={20} weight="bold" /></PilotButton>
    </section>
  )
}

function HomePage() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  usePageScrollFlow(root, reduced)
  return (
    <main className="page-shell" ref={root}>
      <PageMeta
        title="Damaros | Clinical research execution infrastructure"
        description="Damaros turns protocols into evidence-bound, locally signed, replayable clinical research execution."
        path="/"
      />
      <LandingHero />
      <PageSpine />
      <ThesisSection />
      <CapacityBento />
      <AgentOperations />
      <SiteNodeSection />
      <FinalCta />
    </main>
  )
}

function AboutHero() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  useEnterMotion(root, reduced, () => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    timeline
      .from('.about-hero h1 span', { opacity: 0, stagger: 0.1, duration: 1, clearProps: 'transform' })
      .from('.about-hero-copy p', { opacity: 0, duration: 0.85, clearProps: 'transform' }, '-=0.5')
      .from('.about-network', { opacity: 0, duration: 1, clearProps: 'transform' }, '-=0.65')
      .from('.about-drum', { opacity: 0, duration: 0.9, clearProps: 'transform' }, '-=0.75')
    return timeline
  }, '(min-width: 700px)')

  return (
    <section className="about-hero" id="about-top" ref={root}>
      <div className="about-hero-copy">
        <h1 aria-label="Research capacity, everywhere."><span>Research capacity,</span><span className="accent-text">everywhere.</span></h1>
        <p><BrandName /> makes complex clinical research deployable where patients already receive care.</p>
      </div>
      <div className="about-network">
        <img className="about-drum" src="/assets/damaros-monogram-blue.svg" alt="" aria-hidden="true" decoding="async" />
      </div>
      <a className="about-scroll-cue" href="#founder" aria-label="Continue to the founder letter" onClick={(event) => smoothSection(event, '#founder')}>
        <CaretDown size={22} weight="bold" />
      </a>
    </section>
  )
}

function FounderLetter() {
  return (
    <section className="founder-section section-space" id="founder">
      <div className="founder-signature">
        <span>FROM THE FOUNDER</span>
        <strong>Anirudh C. Nimmagadda</strong>
        <div className="founder-links">
          <a href="mailto:team@damaros.ai"><EnvelopeSimple size={18} /> Email</a>
          <a href="https://www.linkedin.com/in/acnimma" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </div>
      <blockquote>
        I wanted to make clinical research happen where patients already get treated. <span>Any clinic. Any trial. Any patient.</span> Whether you run one protocol a year or a hundred.
      </blockquote>
    </section>
  )
}

function WhyNow() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  useEnterMotion(root, reduced, () => gsap.from('.why-now-line', {
    opacity: 0,
    stagger: 0.16,
    duration: 0.85,
    clearProps: 'transform',
    scrollTrigger: { trigger: root.current, start: 'top 68%', once: true },
  }))

  return (
    <section className="why-now section-space" id="why-now" ref={root}>
      <div className="why-now-title why-now-line">
        <div>
          <h2>Tools scale. Capacity doesn't.</h2>
          <p>Research execution remains limited by local infrastructure, not scientific ambition.</p>
        </div>
        <CaretDown className="why-now-chevron" size={22} weight="bold" aria-hidden="true" />
      </div>
      <div className="why-now-lines">
        <article className="why-now-line"><span>01</span><div><strong>More protocols</strong><p>Discovery compounds. Site-side execution remains bounded by people, systems, and fragmented evidence.</p></div></article>
        <article className="why-now-line"><span>02</span><div><strong>More amendments</strong><p>Every change creates re-screening work and new risk when logic lives in memory.</p></div></article>
        <article className="why-now-line"><span>03</span><div><strong>Same signatures</strong><p>A physician still owns final call. Infrastructure should make decision clearer and reconstructable.</p></div></article>
      </div>
    </section>
  )
}

function HumanOutcomes() {
  const [active, setActive] = useState('coordinator')
  const outcomes = {
    coordinator: ['Coordinator', 'Eligibility work stops depending on memory, sticky notes, and who was present when an amendment landed.'],
    physician: ['Physician', 'Each signature arrives with evidence, protocol logic, and unresolved ambiguity in one accountable view.'],
    patient: ['Patient', 'More capable clinics create more places where a trial can reach the person it was designed to help.'],
  }

  return (
    <section className="human-outcomes section-space" id="people">
      <div className="section-heading"><h2><span className="people-title-line">Built around the people</span><span className="people-title-line">holding the line.</span></h2></div>
      <div className="outcome-accordion" data-active={active} role="tablist" aria-label="Damaros outcomes">
        {Object.entries(outcomes).map(([key, [name, copy]], index) => (
          <button key={key} type="button" role="tab" aria-selected={active === key} className={`outcome-panel${active === key ? ' active' : ''}`} onClick={() => setActive(key)}>
            <span>0{index + 1}</span>
            <div><strong>{name}</strong><p>{copy}</p></div>
            <ArrowRight size={20} />
          </button>
        ))}
      </div>
    </section>
  )
}

function AboutPage() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  usePageScrollFlow(root, reduced)
  return (
    <main className="page-shell" ref={root}>
      <PageMeta
        title="About Damaros | Build clinical research capacity"
        description="Damaros makes clinical research execution capacity buildable where patients already receive care."
        path="/about"
      />
      <AboutHero />
      <PageSpine about />
      <FounderLetter />
      <WhyNow />
      <HumanOutcomes />
      <FinalCta about />
    </main>
  )
}

export default function App() {
  useScrollIdle()
  useDocumentVisible()

  return (
    <PilotProvider>
      <ModelPathProvider>
      <div className="app-root">
        <PageReset />
        <SiteNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/platform" element={<Navigate to="/" replace />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
      </ModelPathProvider>
    </PilotProvider>
  )
}

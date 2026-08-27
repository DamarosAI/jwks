import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { HERO_STAGE_MS, HERO_TICK_MS, NARROW_VIEWPORT, autoplayIndex, nextStageIndex, shouldFollowDemoSelection, shouldHoldAutoplayFromClick, shouldKeepPreviousStage, shouldPlayAutoplay, shouldRunAmbient, useAutoplayHold, useDocumentVisible, useInView, useMediaQuery, useScrollIdle, useSoftSwap } from './autoplay'
import { easeSectionScroll, sectionScrollDuration, sectionScrollTarget, usePaneSettle, viewportHeight } from './motion'
import { useDemoPageWheel } from './page-scroll'
import { PilotButton, PilotProvider } from './PilotInquiry'
const PrivacyPage = lazy(() => import('./PrivacyPage'))
import TridentSchematic from './diagrams/TridentSchematic'
import NectarSchematic from './diagrams/NectarSchematic'
import { useScrollSpread } from './diagrams/useScrollPhase'
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
  Graph,
  List,
  Power,
  ShieldCheck,
  WarningCircle,
  X,
} from '@phosphor-icons/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })


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

const PLATFORM_SCREENING_QUEUE = [
  { id: 'S-1066', name: 'K. Osei', status: 'REVIEW', criterion: 'I-2.1 - biomarker missing', blocker: 'EGFR / ALK molecular status', rule: 'EGFR / ALK status required before randomization.', facts: ['No molecular DiagnosticReport found', 'Order placed 06-19 - no result'], sources: ['Awaiting DiagnosticReport', 'DocumentReference - none'], result: 'REVIEW', reason: 'Required source not yet received' },
  { id: 'S-1051', name: 'P. Larsen', status: 'REVIEW', criterion: 'I-3.4 - CMP stale', blocker: 'Serum chemistry within 7-day window', rule: 'CMP must be drawn within 7 days of C1D1.', facts: ['K+ 5.0 mmol/L drawn 06-09', '11 days old at evaluation'], sources: ['Observation/chem-5521'], result: 'REVIEW', reason: 'Evidence outside freshness window' },
  { id: 'S-1047', name: 'R. Delgado', status: 'REVIEW', criterion: 'E-4.2 - ECOG conflict', blocker: 'ECOG performance status', rule: 'ECOG must be 0-1 within 14 days of C1D1.', facts: ['Structured observation: ECOG 1 - 06-18', 'Oncology note: ECOG 2 - 06-20'], sources: ['Observation/ecog-8841', 'DocumentReference/note-2207'], result: 'REVIEW', reason: 'Conflicting source facts' },
  { id: 'S-1078', name: 'T. Novak', status: 'REVIEW', criterion: 'E-5.3 - washout edge', blocker: 'At least 21-day prior-therapy washout', rule: 'At least 21 days between last systemic therapy and C1D1.', facts: ['Infusion record: 05-30', 'Discharge summary: 06-02'], sources: ['MedicationAdministration/inf-771', 'DocumentReference/dc-3390'], result: 'REVIEW', reason: 'Last-dose date ambiguous across sources' },
  { id: 'S-1088', name: 'D. Whitfield', status: 'FAIL', criterion: 'I-1.1 - histology mismatch', blocker: 'Histologically confirmed NSCLC', rule: 'Histologically confirmed NSCLC required.', facts: ['Pathology: small-cell carcinoma', 'No NSCLC component'], sources: ['Pathology DiagnosticReport/path-3310'], result: 'FAIL', reason: 'Confirmed SCLC; protocol requires NSCLC' },
  { id: 'S-1093', name: 'S. Bergman', status: 'FAIL', criterion: 'I-4.2 - ECOG 3', blocker: 'ECOG performance status 0-1', rule: 'ECOG performance status 0-1 required.', facts: ['ECOG 3 documented 06-18', 'Declining performance status'], sources: ['Observation/ecog-7782'], result: 'FAIL', reason: 'ECOG 3 exceeds protocol limit' },
  { id: 'S-1109', name: 'C. Halloran', status: 'FAIL', criterion: 'E-7 - active CNS metastases', blocker: 'No active CNS metastases', rule: 'No active untreated CNS metastases on steroids.', facts: ['MRI: active untreated CNS lesions', 'On dexamethasone'], sources: ['DocumentReference/mri-5567'], result: 'FAIL', reason: 'Active untreated CNS metastases on steroids' },
  { id: 'S-1044', name: 'M. Iyer', status: 'PASS', criterion: 'All criteria met - confirm', blocker: 'No unresolved blocker', rule: 'All inclusion met. No exclusion triggered.', facts: ['EGFR+ confirmed', 'ECOG 1 - 06-19', 'CMP fresh - 06-20'], sources: ['DiagnosticReport/mol-441', 'Observation/ecog-9920'], result: 'PASS', reason: 'All required evidence present and fresh' },
]

const RESOLVE_WORK_ITEMS = [
  {
    key: 'ecog-conflict', patient: 'R. Delgado', subject: 'S-1047', criterion: 'E-4.2', issue: 'Conflicting ECOG sources',
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
    signer: 'Dr. A. Voss', role: 'PI / Sub-I - clinical interpretation', record: 'R-884', defaultAction: 'note',
  },
  {
    key: 'biomarker-missing', patient: 'K. Osei', subject: 'S-1066', criterion: 'I-2.1', issue: 'Pathology source pending',
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
    signer: 'L. Brenner', role: 'Lead CRA - source follow-up', record: 'R-891', defaultAction: 'hold',
  },
  {
    key: 'renal-stale', patient: 'P. Larsen', subject: 'S-1051', criterion: 'I-7.4', issue: 'Renal value outside window',
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
    signer: 'N. Patel, RN', role: 'Research coordinator - visit control', record: 'R-896', defaultAction: 'await',
  },
  {
    key: 'washout-ambiguity', patient: 'T. Novak', subject: 'S-1078', criterion: 'E-5.3', issue: 'Last-dose date ambiguous',
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
    signer: 'Dr. K. Sandoval', role: 'Medical monitor - treatment chronology', record: 'R-902', defaultAction: 'conservative',
  },
]

const INTEGRATIONS = [
  ['Epic', '/assets/vendor/epic.png'],
  ['Veeva', '/assets/vendor/veeva-live.png'],
  ['Medidata', '/assets/vendor/medidata-live.png'],
  ['Cerner', '/assets/vendor/cerner.png'],
  ['REDCap', '/assets/vendor/redcap.png'],
]

const HOME_SPINE = [['home', 'Home', 'Damaros'], ['thesis', 'Thesis', 'Why now'], ['capacity', 'Capacity', 'Deployment'], ['trident', 'Trident', 'Harness'], ['nectar', 'Nectar', 'Intelligence'], ['pilot', 'Pilot', 'Start here']]
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
  return document.querySelector(selector)
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
          <span>{String(index + 1).padStart(2, '0')}</span>
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

// `brand` is for the two eyebrows that are product names rather than section
// topics. Trident and Nectar are things with names; Thesis, Capacity, Control
// and Pilot are what the section is about, and drawing all six at one volume
// meant a reader met the brand as a caption.
function SectionEyebrow({ children, brand = false }) {
  return <p className={`section-eyebrow${brand ? ' is-brand' : ''}`}>{children}</p>
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
        <p>Clinical research execution infrastructure. Any model can propose. Your site decides.</p>
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
  const inView = useInView(root)
  const [active, setActive] = useState(0)
  const [tick, setTick] = useState(0)
  const [evidenceSelected, setEvidenceSelected] = useState(0)
  const [evidenceLocked, setEvidenceLocked] = useState(false)
  const [evidenceActed, setEvidenceActed] = useState({})
  const { held, hold } = useAutoplayHold(reduced)
  const visible = useDocumentVisible()
  const { fading, swap } = useSoftSwap(reduced)
  const steps = ['Protocol', 'Evidence', 'Screening', 'Resolve', 'Replay']
  const playing = shouldPlayAutoplay({ reduced, held, inView, visible })

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
          <span className="window-breadcrumb"><WindowBrand /><span>DMR-204</span><span>Site 018</span></span>
          <span className="window-live"><i /> Trident on site</span>
        </div>
        <div className="hero-app-grid">
        <aside className="hero-app-nav">
          <strong>DMR-204</strong>
          {steps.map((step, index) => (
            <button key={step} type="button" className={`${index === active ? 'active' : ''}${index < active ? ' visited' : ''}`} aria-current={index === active ? 'step' : undefined} onClick={() => selectStage(index)}>
              <SpineGlyph kind={step} /><span>{step}</span>
            </button>
          ))}
        </aside>
        <div className="hero-app-main">
          <div className={`hero-state-canvas landing-source-demo${fading ? ' is-fading' : ''}`}>
            <div className="hero-state-layer">
              <div className="landing-source-view">
                {active === 0 && <ProtocolView tick={tick} onAdvance={() => selectStage(1)} />}
                {active === 1 && <EvidenceView refreshing={false} tick={tick} playing={playing} selected={evidenceSelected} setSelected={setEvidenceSelected} locked={evidenceLocked} setLocked={setEvidenceLocked} acted={evidenceActed} setActed={setEvidenceActed} onAdvance={() => selectStage(2)} />}
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
          <a className="button button-secondary" href="#trident" onClick={(event) => smoothSection(event, '#trident')}>How it works <ArrowRight size={17} weight="bold" /></a>
        </div>
      </div>
      <div className="hero-workspace-wrap"><MiniRun /></div>
      <a className="hero-scroll-cue" href="#thesis" aria-label="Continue to the thesis" onClick={(event) => smoothSection(event, '#thesis')}>
        <CaretDown size={22} weight="bold" />
      </a>
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
      <SectionEyebrow>Thesis</SectionEyebrow>
      <div className="thesis-head">
        <h2><span className="thesis-line accent-text">The next generation of medicine</span><span className="thesis-line">cannot run on yesterday's research infrastructure.</span></h2>
        <p className="thesis-closer"><BrandName /> is building what comes next.</p>
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

  useEnterMotion(root, reduced, () => gsap.from('.capacity-bento > *', {
    opacity: 0,
    duration: 0.86,
    stagger: 0.1,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
  }))

  return (
    <section className="capacity-section section-space" id="capacity" ref={root}>
      <SectionEyebrow>Capacity</SectionEyebrow>
      <div className="section-heading centered-heading">
        <h2><span className="capacity-title-line">A research department,</span><span className="capacity-title-line">deployed like software.</span></h2>
        <p>Disease-agnostic by design. One execution system for every protocol, care setting, and patient population. Each protocol adds reusable coverage. Every decision keeps human accountability and local control.</p>
      </div>
      {/* Two figures over the row that pairs the third with what it counts: the
          panel is the systems, so the number beside it is its own caption and
          the logos need no label of their own. */}
      <div className="capacity-bento">
        <article className="bento-card metric-card metric-wide metric-blue">
          <MetricDots active={6} total={20} tone="dark" />
          <strong>70%</strong>
          <p>of US counties had no active cancer treatment trial in 2022.</p>
          <cite>Kirkwood et al., JCO Oncology Practice 2025</cite>
        </article>
        <article className="bento-card metric-card metric-wide">
          <MetricDots active={1} total={20} />
          <strong>4.1%</strong>
          <p>Community-program treatment-trial enrollment, versus 21.6% at NCI-designated comprehensive cancer centers.</p>
          <cite>Journal of Clinical Oncology - national benchmark</cite>
        </article>
        <article className="bento-card metric-card metric-systems">
          <MetricDots active={20} total={20} />
          <strong>20+</strong>
          <p>systems touched daily at 60% of research sites.</p>
          <cite>SCRS Site Landscape Survey 2023</cite>
        </article>
        <div className="bento-card connector-closeup">
          <ul className="integration-grid" aria-label="Source systems a site works across">
            {INTEGRATIONS.map(([name, src]) => <li className={`integration-logo integration-${name.toLowerCase()}`} key={name}><img src={src} alt={name} loading="lazy" decoding="async" /></li>)}
          </ul>
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
      <header>{complete ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} />}<div><small>{complete ? 'ACTION COMPLETE' : eyebrow}</small><h5>{panelTitle}</h5></div></header>
      <p>{complete ? successDescription : description}</p>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <footer>{complete ? <button className="button button-primary" type="button" onClick={onClose}>Close</button> : <><button className="button button-secondary" type="button" onClick={onClose}>Back</button><button className="button button-primary" type="button" onClick={onConfirm}>{confirmLabel}</button></>}</footer>
    </section>
  )
}

function SiteControlReview({ control, phase, reduced, onBack, onConfirm, onReturn }) {
  const root = useRef(null)
  const complete = phase === 'complete'
  const saving = phase === 'saving'
  const status = complete ? 'RECORDED' : saving ? 'WRITING' : 'PENDING'
  const title = complete ? control.success : saving ? 'Binding site decision' : control.action
  const summary = complete ? control.outcome : saving ? 'Preserving reviewer authority, boundary result, and source trace.' : control.description

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
    <section className={`workspace-view source-protocol-view control-control-view site-control-review is-${phase}`} ref={root} role="region" aria-label={complete ? `${control.success} receipt` : control.action}>
      <div className="protocol-source-head" data-review-motion>
        <span>{complete ? 'REVIEW RECORDED' : saving ? 'WRITING TO EXECUTION RECORD' : 'SITE REVIEW'}</span>
        <em><i /> {status}</em>
        <small>{control.record} - {complete ? control.receipt : 'institution-held'}</small>
      </div>
      <h4 data-review-motion>{title}</h4>
      <p data-review-motion>{summary}</p>

      {saving ? (
        <>
          <div className="source-amendment" data-review-motion>
            <span>EXECUTION RECORD</span>
            <strong>Recording {control.record}</strong>
            <small>{control.receipt}</small>
          </div>
          <div className="source-criteria-head" data-review-motion>
            <span>WRITE PATH</span>
            <button type="button" disabled>Recording review</button>
          </div>
          <div className="source-criteria-list" data-review-motion>
            <div><span>01</span><strong>Policy scope verified</strong><em>{control.scope}</em></div>
            <div><span>02</span><strong>Patient boundary verified</strong><em>{control.patientFields}</em></div>
            <div className="is-live"><span>03</span><strong>Signing execution record</strong><em>{control.receipt}</em></div>
          </div>
        </>
      ) : complete ? (
        <>
          <div className="source-protocol-summary" data-review-motion>
            <section>
              <span>REVIEW ID</span>
              <h5>{control.receipt}</h5>
              <p>Authenticated site reviewer - Ed25519 verified</p>
              <div>
                <i>RV</i><span><strong>{control.decision}</strong><small>Decision</small></span>
                <i>ID</i><span><strong>{control.record}</strong><small>Policy</small></span>
              </div>
            </section>
            <section>
              <span>BOUND RECORD</span>
              <div className="source-arm"><b>10:42</b><span><strong>Boundary evaluated</strong><small>{control.patientFields}</small></span></div>
              <div className="source-arm"><b>10:43</b><span><strong>Authority matched</strong><small>{control.policy}</small></span></div>
              <p>Execution record updated - {control.record} - 10:44 - institution-held</p>
            </section>
          </div>
          <div className="source-criteria-head" data-review-motion>
            <span>REVIEW SIGNED</span>
            <button type="button" onClick={onReturn}>Return to control <ArrowRight size={14} weight="bold" /></button>
          </div>
        </>
      ) : (
        <>
          <div className="source-amendment" data-review-motion>
            <span>DECISION TO RECORD</span>
            <strong>{control.decision}</strong>
            <small>{control.outcome}</small>
          </div>
          <div className="source-protocol-summary" data-review-motion>
            <section>
              <span>SCOPE</span>
              <h5>{control.scope}</h5>
              <p>{control.recipient}</p>
              <div>
                <i>PH</i><span><strong>{control.patientFields}</strong><small>Patient fields</small></span>
                <i>AU</i><span><strong>{control.policy}</strong><small>Authority</small></span>
              </div>
            </section>
            <section>
              <span>CONTROL BOUNDARY</span>
              <h5>Trident runs inside site boundary</h5>
              <p>{control.guard}</p>
              <div className="source-arm"><b>HOLD</b><span><strong>{control.path[0].value}</strong><small>{control.path[0].label}</small></span></div>
              <div className="source-arm"><b>STOP</b><span><strong>{control.path[2].value}</strong><small>{control.path[2].label}</small></span></div>
            </section>
          </div>
          <div className="source-criteria-head" data-review-motion>
            <span>SITE REVIEW</span>
            <div className="control-review-actions">
              <button className="control-ghost-button" type="button" onClick={onBack}>Back</button>
              <button type="button" onClick={onConfirm}>Record site review <ArrowRight size={14} weight="bold" /></button>
            </div>
          </div>
        </>
      )}
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
      <div className="source-protocol-summary"><section><span>SPONSOR</span><h5>Meridian Oncology Therapeutics</h5><p>NCT00000204 - DMR-204 - v2.1 - Phase II</p><div><i>KS</i><span><strong>Dr. K. Sandoval</strong><small>Medical Monitor</small></span><i>LB</i><span><strong>L. Brenner</strong><small>Lead CRA</small></span></div></section><section><span>STUDY ARMS - LLM-PARSED FROM PACKET</span><div className="source-arm"><b>ARM A</b><span><strong>Velartinib - 80 mg PO daily</strong><small>Investigational - oral 3rd-gen EGFR-TKI</small></span></div><div className="source-arm"><b>ARM B</b><span><strong>Platinum doublet</strong><small>Comparator - standard of care</small></span></div><p>Randomized 1:1 - target n=140 - stratified by ECOG and prior lines</p></section></div>
      <div className="source-criteria-head"><span>ELIGIBILITY - 36 CRITERIA - 25 SOURCE-MAPPED</span><button type="button" onClick={onAdvance}>Open Evidence <ArrowRight size={14} weight="bold" /></button></div>
      <div className="source-criteria-list">{criteria.map(([id, name, type], index) => <div className={index === focus ? 'is-live' : ''} key={id}><span>{id}</span><strong>{name}</strong><em>{type}</em></div>)}</div>
    </div>
  )
}

function EvidenceView({ refreshing, onAdvance, tick = 0, playing = false, selected, setSelected, locked, setLocked, acted, setActed }) {
  const [pendingAction, setPendingAction] = useState(null)
  const [actionComplete, setActionComplete] = useState(false)
  const settle = usePaneSettle()
  useEffect(() => {
    if (!shouldFollowDemoSelection({ playing, locked, busy: refreshing || Boolean(pendingAction) })) return
    setSelected(autoplayIndex(tick, 5))
  }, [tick, playing, locked, refreshing, pendingAction, setSelected])
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
  const detail = obligations[selected] || obligations[0]
  const isActed = Boolean(acted[detail.code])
  const actionOwner = detail.code === 'E-4.2' ? 'PI / Sub-I - Dr. A. Voss' : 'Site coordinator - J. Moreau'
  const actionTicket = `TASK-${detail.code.replace(/[^0-9]/g, '')}-1047`
  const pickObligation = (index) => {
    setLocked(true)
    setSelected(index)
    setPendingAction(null)
    setActionComplete(false)
  }
  const openEvidenceAction = () => {
    setLocked(true)
    setPendingAction(detail)
    setActionComplete(false)
  }
  const confirmEvidenceAction = () => {
    setActed((current) => ({ ...current, [pendingAction.code]: true }))
    setActionComplete(true)
  }
  return (
    <div className="workspace-view source-evidence-view">
      <div className="source-view-intro"><span>EVIDENCE</span><small>How <BrandName /> maps the sponsor packet onto site evidence - PHI-bounded - 09:43</small></div>
      <div className="evidence-coverage"><div><strong>Sponsor packet to evidence coverage</strong><small>Mapped 25 of 36 criteria - Protocol v2.1</small></div><div className="coverage-track"><i /><i /><i /><i /></div><footer><span className="mapped">Mapped - 25</span><span className="missing">Missing - 4</span><span className="conflict">Conflict - 3</span><span className="stale">Stale - 4</span></footer></div>
      <div className="source-evidence-grid">
        <div className="obligation-list">
          <span>PROTOCOL OBLIGATIONS - SOURCE MAPPING</span>
          {obligations.map((item, index) => (
            <button type="button" className={`${selected === index ? 'active ' : ''}${item.status.toLowerCase()}`} aria-label={`${item.code}. ${item.fact}. ${acted[item.code] ? 'ROUTED' : item.status}`} aria-current={selected === index ? 'true' : undefined} onClick={() => pickObligation(index)} key={item.code}>
              <i className="evidence-status-dot" aria-hidden="true" />
              <div><b>{item.code}</b><strong>{item.fact}</strong></div>
              <footer><span>{item.cls}</span><small>{acted[item.code] ? 'Action recorded' : item.action} <ArrowRight size={12} weight="bold" /></small></footer>
            </button>
          ))}
        </div>
        <div className="obligation-detail">
          <div className={settle}>
            <header><span>{detail.code}</span><em className={isActed ? 'routed' : detail.status.toLowerCase()}>{isActed ? 'ROUTED' : detail.status}</em><small>{detail.cls}</small></header>
            <h4>{detail.fact}</h4>
            <p>Maps to protocol {detail.code} - Inclusion - governs screening</p>
            {pendingAction?.code === detail.code ? (
              <InlineActionPanel open complete={actionComplete} eyebrow="ACTION REQUIRED" title={detail.action} description={detail.note} rows={[['Criterion', detail.code], ['Owner', actionOwner], ['Record', `${actionTicket} - replay-linked`]]} confirmLabel={detail.action} successTitle="Work item created" successDescription={`${detail.action} now sits in the site worklist. Nothing left the site.`} onClose={() => setPendingAction(null)} onConfirm={confirmEvidenceAction} />
            ) : (
              <>
                <dl>
                  <div><dt>CURRENT</dt><dd>{detail.current}</dd></div>
                  <div><dt>SOURCE PLANE</dt><dd>{detail.sources}</dd></div>
                  <div><dt>CHECKED</dt><dd>{detail.checked}</dd></div>
                  <div><dt>PROVENANCE</dt><dd>Human decision - source trace available</dd></div>
                </dl>
                <div className={`evidence-guidance ${detail.status === 'CONFIRM' ? 'computable' : ''}`}><span>{detail.status === 'CONFIRM' ? 'NO JUDGMENT REQUIRED' : 'NEXT STEP'}</span><strong>{detail.note}</strong></div>
                {isActed ? (
                  <div className="evidence-action-receipt">
                    <header><span>ACTION RECORDED</span><strong>{actionTicket}</strong></header>
                    <dl>
                      <div><dt>OWNER</dt><dd>{actionOwner}</dd></div>
                      <div><dt>REPLAY</dt><dd>Linked to {detail.code} evidence node</dd></div>
                    </dl>
                    <button type="button" onClick={onAdvance}>Continue to Screening <ArrowRight size={14} weight="bold" /></button>
                  </div>
                ) : (
                  <button className="source-primary-action" type="button" onClick={openEvidenceAction}>{detail.action}</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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
        <div className="source-patient-list"><span>PATIENT QUEUE - DECISIVE CRITERION</span>{PLATFORM_SCREENING_QUEUE.map((patient, index) => <button type="button" className={`${index === selectedSubject ? 'active ' : ''}${patient.status.toLowerCase()}`} aria-current={index === selectedSubject ? 'true' : undefined} onClick={() => setSelectedSubject(index)} key={patient.id}><i /><span><strong>{patient.name}<small>{patient.id}</small></strong><em>{patient.criterion}</em></span><b>{patient.status === 'PASS' ? 'CONFIRM' : patient.status}</b></button>)}</div>
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
      <div className="resolve-person-tabs">{RESOLVE_WORK_ITEMS.map((item, index) => <button type="button" className={`${work === index ? 'active ' : ''}${signedDecisions[item.key] ? 'committed' : ''}`} aria-current={work === index ? 'true' : undefined} onClick={() => selectWork(index)} key={item.key}><i>{item.patient.split(' ').map((part) => part[0]).join('')}</i>{item.patient}</button>)}</div>
      <div className={settle}>
      <div className="resolve-subject-title"><h4>{selectedWork.patient}<small>{selectedWork.subject}</small></h4><span>{selectedWork.criterion} - {selectedWork.rule}</span></div>
      <div className="resolve-compare-bar"><div><span>{selectedWork.evidence[0].label}</span><strong>{selectedWork.evidence[0].value}</strong><small>{selectedWork.evidence[0].meta}</small></div><b>{selectedWork.symbol}</b><div><span>{selectedWork.evidence[1].label}</span><strong>{selectedWork.evidence[1].value}</strong><small>{selectedWork.evidence[1].meta}</small></div></div>
      <p className="resolve-prompt">{selectedWork.prompt}</p>
      <div className="source-decision-list" role="group" aria-label="Decision to sign"><span>YOUR CALL</span>{selectedWork.actions.map((action) => <button className={decision === action.id ? 'selected' : ''} type="button" aria-pressed={decision === action.id} disabled={Boolean(signed)} onClick={() => setDecision(action.id)} key={action.id}><i />{action.label}</button>)}</div>
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
    { event: 'Criterion evaluated', detail: 'I-4.2 ECOG - Protocol v2.1', time: '10:02', actor: 'evaluator', id: 'EVT-1108', flag: 'CONFLICT', rows: [['Screening', 'deterministic - no model'], ['Criterion', 'I-4.2 ECOG 0-1'], ['Facts used', 'structured ECOG 1 (06-18); note ECOG 2 (06-20)'], ['Result', 'REVIEW'], ['Exception', 'CONFLICTING_SOURCE'], ['Integrity', 'Verified - record intact']] },
    { event: 'Screening evaluated', detail: '1 eligible - 4 review - 3 fail', time: '10:03', actor: 'evaluator', id: 'EVT-1110', rows: [['Protocol', 'v2.1'], ['Cohort', '8 subjects'], ['Result', '1 pass - 4 review - 3 fail']] },
    { event: 'Review opened', detail: 'Review R-884 - Screening', time: '10:04', actor: 'system', id: 'EVT-1111', rows: [['Work item', 'Review R-884'], ['Owner', 'PI / Sub-I'], ['State', 'Awaiting site judgment']] },
    { event: 'Resolve committed', detail: 'Review R-884 - PI signature', time: '14:07', actor: 'You', id: 'EVT-1207', rows: [['Decision', 'Accept note - ECOG 2'], ['Signer', 'Dr. A. Voss - PI / Sub-I'], ['Signature', 'Ed25519 verified']] },
    { event: 'Replay sealed', detail: 'RPL-1047 - export bundle', time: '14:08', actor: 'system', id: 'EVT-1208', rows: [['Object', 'RPL-2026-0622-018-1047'], ['Chain', 'intact - 9 / 9 events'], ['PHI', 'sponsor-safe - excluded']] },
  ]
  const selectedEvent = chain[selected]

  useEffect(() => {
    if (exportOpen) return
    setSelected(autoplayIndex(tick, chain.length))
  }, [tick, exportOpen, chain.length])

  return (
    <div className="workspace-view source-replay-view" key="replay">
      <div className="source-replay-head"><span><b>REPLAY</b><small>Subject S-1047 - DMR-204 - Site 018 - Protocol v2.1 - Run RPL-2026-0622-018-1047 - 06-22</small></span><button className={exportReady ? 'ready' : ''} type="button" onClick={() => { setExportOpen(true); if (exportReady) setExportReady(false) }}>{exportReady ? 'Replay ready' : 'Export Replay'}</button></div>
      <div className="source-replay-grid"><div className="replay-ledger"><span>RECONSTRUCTION LEDGER</span><header><small>TIME</small><small>EVENT</small><small>ACTOR</small><small>INTEGRITY</small></header>{chain.map((item, index) => <button type="button" className={selected === index ? 'active' : ''} aria-current={selected === index ? 'true' : undefined} onClick={() => { setSelected(index); setExportOpen(false) }} key={item.id}><time>{item.time}</time><span><strong>{item.event}</strong><small>{item.detail}</small></span><em>{item.actor}</em><b>Verified</b></button>)}</div><div className="replay-event-detail"><div className={settle}>{exportOpen ? <InlineActionPanel open complete={exportReady} eyebrow="ACTION REQUIRED" title="Prepare sponsor-safe replay" description="Review chain integrity and data boundary before marking this replay ready. Raw PHI stays excluded." rows={[["Replay", "RPL-2026-0622-018-1047"], ["Events", "9 verified - chain intact"], ["Signature", "Ed25519 - verified"], ["Data boundary", "Sponsor-safe - raw PHI excluded"]]} confirmLabel="Prepare replay" successTitle="Replay ready" successDescription="Sponsor-safe replay is ready inside Damaros. Nothing downloaded to this device." onClose={() => setExportOpen(false)} onConfirm={() => setExportReady(true)} /> : <><span>SELECTED EVENT</span><header><h4>{selectedEvent.event}</h4>{selectedEvent.flag && <em>{selectedEvent.flag}</em>}<small>{selectedEvent.time} - {selectedEvent.id}</small></header><dl>{selectedEvent.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><footer><span>RELATED EVENTS</span><small>{selected > 0 ? chain[selected - 1].event : 'Protocol intake'} - {selected < chain.length - 1 ? chain[selected + 1].event : 'Export bundle'}</small></footer></>}</div></div></div>
    </div>
  )
}

function TridentSection() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const inView = useInView(root)
  const animate = shouldRunAmbient({ reduced, inView, narrow })
  const field = useScrollSpread({ reduced, start: 'top bottom', end: 'top 40%' })
  useEnterMotion(root, reduced, () => [
    gsap.from('.trident-copy > *', {
      opacity: 0, duration: 0.8, stagger: 0.12, clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
    gsap.from('.trident-diagram', {
      opacity: 0, duration: 1.2, clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
    }),
  ])

  return (
    <section className="trident-section section-space" id="trident" ref={root}>
      <div className="section-field" ref={field} aria-hidden="true" />
      <SectionEyebrow brand>Trident</SectionEyebrow>
      <div className="trident-copy">
        <h2><span>Any model can propose at the point of care.</span></h2>
        <p className="section-dek">None can decide.</p>
        <p>Trident is a governed AI harness. Operators choose the provider. Every task is versioned, schema-validated, and receipted. Checkpoints keep authority with the site.</p>
        <div className="control-facts">
          <span><CheckCircle size={18} /> Schema-validated</span>
          <span><Fingerprint size={18} /> Provider identity</span>
          <span><FileText size={18} /> 19 versioned tasks</span>
        </div>
      </div>
      <div className="trident-diagram">
        <TridentSchematic animate={animate} reduced={reduced} />
      </div>
    </section>
  )
}

function NectarSection() {
  const root = useRef(null)
  const reduced = useReducedMotion()
  const narrow = useMediaQuery(NARROW_VIEWPORT)
  const inView = useInView(root)
  const animate = shouldRunAmbient({ reduced, inView, narrow })
  const field = useScrollSpread({ reduced, start: 'top bottom', end: 'top 40%' })
  useEnterMotion(root, reduced, () => [
    gsap.from('.nectar-copy > *', {
      opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
    gsap.from('.nectar-network', {
      opacity: 0, duration: 1.2, ease: 'power3.out', clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 65%', once: true },
    }),
  ])

  return (
    <section className="nectar-section section-space" id="nectar" ref={root}>
      <div className="section-field" ref={field} aria-hidden="true" />
      <SectionEyebrow brand>Nectar</SectionEyebrow>
      <div className="nectar-network">
        <NectarSchematic animate={animate} reduced={reduced} />
      </div>
      <div className="nectar-copy">
        <h2><span>Execution intelligence that crosses site boundaries.</span></h2>
        <p className="section-dek">Patient data that never does.</p>
        <p>Nectar is the shared execution intelligence every Damaros site draws on. Structure proven at one site becomes capability at all of them. Execution capacity compounds as a property of the network rather than of any single site.</p>
        <div className="control-facts">
          <span><ShieldCheck size={18} /> PHI-free by construction</span>
          <span><Graph size={18} /> Coverage compounds</span>
          <span><Database size={18} /> Records stay at the site</span>
        </div>
      </div>
    </section>
  )
}

function SiteControlSection() {
  const root = useRef(null)
  const reviewTimer = useRef(0)
  const reduced = useReducedMotion()
  const [selectedControl, setSelectedControl] = useState(0)
  const [reviewPhase, setReviewPhase] = useState('idle')
  const [reviewedControls, setReviewedControls] = useState({})
  const { fading, swap } = useSoftSwap(reduced)
  const modelStop = { label: 'TRIDENT', value: 'On site', state: 'held' }
  const controls = [
    { name: 'Evidence visibility', icon: ShieldCheck, policy: 'Site roles only', title: 'Evidence access boundary', meta: 'POL-018-EV4 - 7 site roles - hash-linked', description: 'Only approved site roles can open source evidence or mapped patient facts.', scope: 'FHIR resources, documents, and mapped facts', record: 'POL-018-EV4', receipt: 'REV-018-EV4-1044', recipient: '7 approved site roles', patientFields: 'Site-held', action: 'Review access boundary', decision: 'Confirm current access boundary', outcome: 'Access remains limited to 7 approved site roles. No external principal receives patient evidence.', success: 'Access review recorded', guard: 'Patient evidence stays site-held. Approved roles only.', path: [{ label: 'HOLD', value: '4 site sources', state: 'held' }, { label: 'SCREENING', value: 'Deterministic', state: 'held' }, modelStop, { label: 'ACCESS', value: '7 site roles', state: 'held' }], holdLabel: 'OPEN TO', holdings: [{ code: 'CO', name: 'Site coordinator', hold: 'Evidence and mapped facts' }, { code: 'PI', name: 'PI / sub-I', hold: 'Evidence and mapped facts' }, { code: 'CR', name: 'CRC lead', hold: 'Mapped facts only' }, { code: 'SM', name: 'Sponsor monitor', hold: 'No patient evidence' }], events: [['10:41', 'As-of ingest sealed', 'Synthetic FHIR'], ['10:43', 'Evidence visibility checked', 'POL-018-EV4']] },
    { name: 'Artifact release', icon: FileText, policy: 'PI or delegated signer', title: 'Sponsor artifact release', meta: 'POL-018-AR2 - Replay RPL-1047 - 0 patient fields', description: 'Replay bundles remain at the site until a PI or delegated signer releases the exact artifact.', scope: 'Replay bundle - RPL-1047', record: 'POL-018-AR2', receipt: 'REV-018-AR2-1044', recipient: 'Meridian Oncology', patientFields: '0 in sponsor artifact', action: 'Review artifact release', decision: 'Confirm delegated release authority', outcome: 'Replay remains site-held until a PI or delegated signer releases this exact artifact.', success: 'Artifact review recorded', guard: 'Replay stays site-held until a PI signs the exact artifact.', path: [{ label: 'HOLD', value: 'Replay RPL-1047', state: 'held' }, { label: 'SIGN', value: 'PI or delegate', state: 'held' }, modelStop, { label: 'EGRESS', value: '0 patient fields', state: 'held' }], holdLabel: 'HELD ARTIFACT', holdings: [{ code: 'RP', name: 'Replay RPL-1047', hold: 'Site-held bundle' }, { code: 'PI', name: 'PI roster', hold: 'Signer authority' }, { code: 'SP', name: 'Sponsor packet', hold: '0 patient fields' }, { code: 'EX', name: 'Export manifest', hold: 'Ed25519 pending' }], events: [['10:41', 'Replay bundle sealed', 'RPL-1047'], ['10:43', 'Artifact hold checked', 'POL-018-AR2']] },
    { name: 'Trident execution', icon: Power, policy: 'Required local cognition', title: 'Trident attestation', meta: 'POL-018-TR3 - Run 018-017 - governed', description: 'Trident processes authorized protocol and patient context inside institution boundary and writes source-linked work products.', scope: 'Site runtime - Run 018-017', record: 'POL-018-TR3', receipt: 'REV-018-TR3-1044', recipient: 'Site execution record', patientFields: 'Authorized local context', action: 'Review Trident attestation', decision: 'Accept governed runtime attestation', outcome: 'Run remains site-bound. Source-linked work products enter execution record.', success: 'Attestation review recorded', guard: 'Protocol and patient context remain inside institution boundary.', path: [{ label: 'HOLD', value: 'Site runtime', state: 'held' }, { label: 'SCREENING', value: 'Deterministic', state: 'held' }, modelStop, { label: 'EGRESS', value: 'No PHI egress', state: 'held' }], holdLabel: 'RUNTIME', holdings: [{ code: 'RN', name: 'Run 018-017', hold: 'Governed Trident' }, { code: 'TX', name: 'Protocol context', hold: 'Authorized local input' }, { code: 'PH', name: 'Patient context', hold: 'Authorized local input' }, { code: 'WP', name: 'Work product', hold: 'Source-linked only' }], events: [['10:41', 'Trident attested', 'Run 018-017'], ['10:43', 'Local boundary checked', 'POL-018-TR3']] },
  ]
  const control = controls[selectedControl]
  const completedReview = reviewedControls[control.record]

  useEffect(() => () => window.clearTimeout(reviewTimer.current), [])

  const selectControl = (index) => {
    window.clearTimeout(reviewTimer.current)
    if (index === selectedControl && reviewPhase === 'idle') return
    swap(() => {
      setSelectedControl(index)
      setReviewPhase('idle')
    })
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
    gsap.from('.control-copy > *', {
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
    gsap.from('.control-system > *', {
      opacity: 0,
      stagger: 0.1,
      clearProps: 'transform',
      scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
    }),
  ])

  return (
    <section className="control-section section-space" id="site-control" ref={root}>
      <SectionEyebrow>Control</SectionEyebrow>
      <div className="control-system-wrap">
      <div className="control-system" aria-label="Damaros site control">
        <div className="mac-titlebar"><div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div><WindowBrand /><span className="window-live"><i /> Trident on site</span></div>
        <div className="control-product-grid">
          <aside className="control-source-nav">
            <span>CONTROLS</span>
            <div className="control-policy-list" role="tablist" aria-label="Site controls">
              {controls.map((item, index) => {
                const Icon = item.icon
                return (
                  <button className={`control-policy-item${selectedControl === index ? ' active' : ''}${reviewedControls[item.record] ? ' is-reviewed' : ''}`} type="button" role="tab" aria-selected={selectedControl === index} aria-pressed={selectedControl === index} onClick={() => selectControl(index)} key={item.name}>
                    <i />
                    <Icon size={14} />
                    <strong>{item.name}</strong>
                  </button>
                )
              })}
            </div>
            <div className="control-rail-foot">
              <p className="control-policy-kicker">Local sources. Local signatures.</p>
              <div className="control-boundary-card"><small>SITE 018</small><strong>Site 018 - Damaros Health</strong></div>
            </div>
          </aside>
          <div className="control-policy-main">
            <div className="control-security-workspace">
              <div className={`control-control-detail${fading ? ' is-fading' : ''}`}>
                {reviewPhase !== 'idle' ? <SiteControlReview control={control} phase={reviewPhase} reduced={reduced} onBack={() => setReviewPhase('idle')} onConfirm={confirmControlReview} onReturn={() => setReviewPhase('idle')} /> : (
                  <div className="workspace-view source-protocol-view control-control-view" key={control.record}>
                    <div className="protocol-source-head">
                      <span>CONTROL</span>
                      <em className={completedReview ? 'is-reviewed' : 'is-pending'}><i /> {completedReview ? 'REVIEWED' : 'ENFORCED'}</em>
                      <small>{control.record} - SHA-256 - 10:43Z</small>
                    </div>
                    <h4>{control.title}</h4>
                    <p>{control.meta}</p>
                    <div className="source-amendment">
                      <span>CONTROL BOUNDARY</span>
                      <strong>Governed Trident harness. No PHI egress.</strong>
                      <small>{control.guard}</small>
                    </div>
                    <div className="source-protocol-summary">
                      <section>
                        <span>AUTHORITY</span>
                        <h5>{control.policy}</h5>
                        <p>{control.scope}</p>
                        <div>
                          <i>CH</i><span><strong>SHA-256</strong><small>Hash-linked</small></span>
                          <i>EX</i><span><strong>Ed25519</strong><small>Verified export</small></span>
                        </div>
                      </section>
                      <section aria-label={control.holdLabel}>
                        <span>{control.holdLabel}</span>
                        {control.holdings.slice(0, 2).map((source) => (
                          <div className="source-arm" key={source.name}><b>{source.code}</b><span><strong>{source.name}</strong><small>{source.hold}</small></span></div>
                        ))}
                        <p>{control.holdings.slice(2).map((source) => source.name).join(' - ')}</p>
                      </section>
                    </div>
                    <div className="source-criteria-head">
                      <span>LEDGER - 3 EVENTS - SITE 018</span>
                      <button className="control-review-button" type="button" onClick={openControlReview}>{completedReview ? 'Open review receipt' : control.action} <ArrowRight size={14} weight="bold" /></button>
                    </div>
                    <div className="source-criteria-list">
                      <div><span>{control.events[0][0]}</span><strong>{control.events[0][1]}</strong><em>{control.events[0][2]}</em></div>
                      <div className={completedReview ? 'is-reviewed' : 'is-pending'}><span>{completedReview ? '10:44' : '--:--'}</span><strong>{completedReview ? 'Site review recorded' : 'Site review pending'}</strong><em>{completedReview ? `${control.receipt} - signed` : 'Awaiting reviewer'}</em></div>
                      <div><span>{control.events[1][0]}</span><strong>{control.events[1][1]}</strong><em>{control.events[1][2]}</em></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <div className="control-copy">
        <h2><span>Evidence stays</span><span>with the site.</span></h2>
        <p>Patient data, harness context, evidence, signatures, and execution records remain under site governance. Site release controls every outbound artifact.</p>
        <div className="control-facts">
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
      {!about && <SectionEyebrow>Pilot</SectionEyebrow>}
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
      <TridentSection />
      <NectarSection />
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
    <section className="why-now-section section-space" id="why-now" ref={root}>
      <div className="why-now">
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
  useDemoPageWheel()

  return (
    <PilotProvider>
      <div className="app-root">
        <PageReset />
        <SiteNav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<Suspense fallback={null}><PrivacyPage /></Suspense>} />
          <Route path="/platform" element={<Navigate to="/" replace />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
    </PilotProvider>
  )
}

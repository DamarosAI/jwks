/**
 * Parked landing-agents template.
 * Not imported by the live site.
 * Restore steps live in README.md in this folder.
 */

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
  { q: 'Why was S-1051 deferred?', cat: 'Eligibility', subject: 'S-1051', asked: '10:04', answer: 'S-1051 deferred on criterion I-3.4 because the qualifying potassium was drawn 06-09, 11 days before evaluation, past the 7-day window. It was routed, not failed.', citations: [{ id: 'Observation/chem-5521', type: 'FHIR OBSERVATION', value: 'K+ 5.0 mmol/L - drawn 06-09', source: '10:02 - signed', hash: 'sha256 - 5521...09af' }, { id: 'Criterion/I-3.4', type: 'PROTOCOL RULE', value: 'Serum chemistry - 7-day window', source: 'Protocol v2.1', hash: 'sha256 - i34...v21' }, { id: 'Review/R-901', type: 'SITE WORK ITEM', value: 'STALE_SOURCE - routed', source: '10:04 - worklist', hash: 'Ed25519 - verified' }] },
  { q: 'Who signed the ECOG override on S-1047?', cat: 'Accountability', subject: 'S-1047', asked: '14:08', answer: 'The PI signed at 14:07, citing the latest oncology note as superseding the stale structured ECOG. The decision was signed and hash-anchored.', citations: [{ id: 'Resolve/EVT-1207', type: 'SIGNED SITE DECISION', value: 'PI signature on ECOG conflict', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Actor/PI-018', type: 'ACCOUNTABLE ACTOR', value: 'Dr. M. Avdol - PI / Sub-I', source: '14:07 - site signature', hash: 'sha256 - pi18...1407' }, { id: 'Rationale/R-884', type: 'DECISION RATIONALE', value: 'Latest note supersedes stale ECOG', source: 'Review R-884 - 14:07', hash: 'sha256 - r884...ecog' }] },
  { q: "Is this run's chain intact?", cat: 'Integrity', subject: 'DMR-204', asked: '14:08', answer: 'Yes. Chain remains intact across all 9 events. Signature is verified. Sponsor-safe replay excludes raw PHI.', citations: [{ id: 'Replay/RPL-1047', type: 'REPLAY RECORD', value: 'Chain intact - 9 of 9 events', source: '14:08 - Replay sealed', hash: 'sha256 - rpl...1047' }, { id: 'Signature/EVT-1207', type: 'SIGNATURE', value: 'Verified - Ed25519', source: '14:08 - manifest', hash: 'Ed25519 - verified' }, { id: 'Export/Boundary', type: 'DATA BOUNDARY', value: 'Sponsor-safe - PHI-free', source: '14:08 - export policy', hash: 'policy - verified' }] },
  { q: 'When was Replay sealed for S-1047?', cat: 'Replay', subject: 'S-1047', asked: '14:09', answer: 'Replay sealed at 14:08 after the PI signature. The sealed record is RPL-1047. Later reads cite that row; they do not rewrite it.', citations: [{ id: 'Replay/RPL-1047', type: 'REPLAY RECORD', value: 'Sealed 14:08 - 9 events', source: '14:08 - Replay', hash: 'sha256 - rpl...1047' }, { id: 'Resolve/EVT-1207', type: 'PRIOR WRITE', value: 'PI signature closed the open item', source: '14:07 - Resolve', hash: 'Ed25519 - verified' }, { id: 'Policy/Seal', type: 'SEAL RULE', value: 'Immutable after seal', source: '14:08 - site policy', hash: 'policy - verified' }] },
  { q: 'What bound the potassium on S-1051?', cat: 'Evidence', subject: 'S-1051', asked: '10:03', answer: 'Observation/chem-5521 bound the potassium: 5.0 mmol/L, drawn 06-09, signed into the chain at 10:02. I-3.4 then read that row. Luna did not invent the value.', citations: [{ id: 'Observation/chem-5521', type: 'FHIR OBSERVATION', value: 'K+ 5.0 mmol/L - drawn 06-09', source: '10:02 - signed', hash: 'sha256 - 5521...09af' }, { id: 'Bind/EVT-1104', type: 'EVIDENCE BIND', value: 'Source attached to S-1051', source: '10:02 - Evidence', hash: 'sha256 - bind...1104' }, { id: 'Criterion/I-3.4', type: 'PROTOCOL RULE', value: 'Read bound chem-5521', source: '10:02 - Screening', hash: 'sha256 - i34...v21' }] },
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
  { id: 'NCT00000211', title: 'AXL-211 - EGFR+ NSCLC', phase: 'Ph II', coverage: '9/10', fit: '94%', status: 'Strong fit', sponsor: 'Cascade Therapeutics', pi: 'Dr. Higashikata', sites: '21 active US sites', window: 'Open through 09-30', scanned: '14:02 - coverage graph', gap: 'None material', concepts: ['EGFR T790M / C797S', 'NSCLC IIIB-IV', 'post-osimertinib', 'ECOG 0-1'] },
  { id: 'NCT00000031', title: 'HEM-31 - second-line DLBCL', phase: 'Ph II', coverage: '8/10', fit: '82%', status: 'Strong fit', sponsor: 'Northlake Biosciences', pi: 'Dr. Giovanna', sites: '31 active sites', window: 'Open through 10-12', scanned: '14:02 - coverage graph', gap: 'Apheresis slot', concepts: ['DLBCL', 'second line', 'PET-avid', 'CAR-T naive'] },
  { id: 'NCT00000009', title: 'AVT-9 - KRAS G12C solid tumor', phase: 'Ph I/II', coverage: '6/10', fit: '68%', status: 'Possible fit', sponsor: 'Helix Therapeutics', pi: 'Dr. J. Kujo', sites: '17 active sites', window: 'Dose escalation open', scanned: '14:02 - coverage graph', gap: 'NGS turnaround', concepts: ['KRAS G12C', 'solid tumor', 'dose escalation', 'prior IO allowed'] },
  { id: 'NCT00000184', title: 'CARD-184 - HFpEF outcomes', phase: 'Ph III', coverage: '8/10', fit: '79%', status: 'Strong fit', sponsor: 'Harbor Cardiometabolic', pi: 'Dr. L. Chen', sites: '44 active US sites', window: 'Open through 11-15', scanned: '14:02 - coverage graph', gap: 'Echo read time', concepts: ['HFpEF', 'NT-proBNP', 'echo within 30 days', 'eGFR at least 30'] },
  { id: 'NCT00000077', title: 'IMM-77 - moderate-severe UC', phase: 'Ph II', coverage: '7/10', fit: '74%', status: 'Possible fit', sponsor: 'Solstice Immunology', pi: 'Dr. A. Okonkwo', sites: '28 active sites', window: 'Open through 08-22', scanned: '14:02 - coverage graph', gap: 'Endoscopy calendar', concepts: ['UC', 'Mayo score', 'prior anti-TNF', 'stool calprotectin'] },
]

function AgentGlyph({ kind, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: 1.35, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  if (kind === 'trident') return <svg {...common}><path d="M9 16V8" /><path d="M4.8 8.2V4M9 8V3.4M13.2 8.2V4" /><path d="M4.8 8.2c0 2.2 8.4 2.2 8.4 0" /></svg>
  if (kind === 'eye') return <svg {...common}><path d="M1.5 9S4 3.8 9 3.8 16.5 9 16.5 9 14 14.2 9 14.2 1.5 9 1.5 9Z" /><circle cx="9" cy="9" r="2.1" /></svg>
  if (kind === 'luna') return <svg {...common}><path d="M12.8 3.4a6.6 6.6 0 1 0 0 11.2 5.2 5.2 0 0 1 0-11.2Z" /></svg>
  return <svg {...common}><circle cx="9" cy="9" r="6.5" /><circle cx="9" cy="9" r="3" /><circle cx="9" cy="9" r="0.6" fill="currentColor" stroke="none" /><path d="M9 9 13.6 4.4" /></svg>
}

/* MiniRun sidebar rail
          <strong>AGENTS</strong>
          {AGENTS.map((agent, index) => <span className={`hero-agent${isolated ? ' is-isolated' : index === tick % AGENTS.length ? ' is-active' : ''}`} style={{ '--agent-color': agent.color }} key={agent.name}><i /> <AgentGlyph kind={agent.icon} size={14} /> {agent.name}</span>)}
*/

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
      <SectionEyebrow>Agents</SectionEyebrow>
      <div className="agent-story-heading">
        <h2>Four agents.</h2>
        <p>Find, draft, flag, cite. Never decide.</p>
      </div>
      <MobilePreviewFrame>
      <div className="agent-console" onClickCapture={(event) => { if (shouldHoldAutoplayFromClick(event.target)) hold() }}>
        <div className="mac-titlebar">
          <div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div>
          <WindowBrand />
          <span className="window-live"><i /> {isolated ? 'Models isolated' : 'Institution-held'}</span>
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
                  <dl className="agent-run-path">
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
      </MobilePreviewFrame>
    </section>
  )
}

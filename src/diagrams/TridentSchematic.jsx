import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase } from './useScrollPhase'

/**
 * Trident - the governed execution path, drawn as topology.
 *
 * The figure is a trident because the system is one: three proposal sources on
 * three tines, one crossbar, one shaft, and a wall the shaft cannot pass. The
 * wall has a gate, the gate is hatched shut, and only a site signature opens
 * it. Geometry is orthogonal, annotation is monospace, and every colour,
 * radius and face is a site token.
 *
 * Scrolling the section reveals the path. It stops at the wall and stays there
 * for the widest stretch of scroll, because that stop is the headline: any
 * model can propose, none can decide.
 */

const PROVIDERS = [
  { x: 44, cx: 129, name: 'Anthropic', meta: 'EXTERNAL - ATTESTED' },
  { x: 225, cx: 310, name: 'OpenAI', meta: 'EXTERNAL - ATTESTED' },
  { x: 406, cx: 491, name: 'On-site', meta: 'LOCAL RUNTIME' },
]

const STEPS = [
  { y: 152, label: '01 PROPOSE' },
  { y: 211, label: '02 VALIDATE' },
  { y: 364, label: '03 CHECKPOINT' },
  { y: 474, label: '04 RECEIPT' },
]

// Reveal is in pathLength units along ROUTE, measured from the tine. 72 is the
// wall: the path reaches it and goes no further until the gate opens.
const PHASES = [
  { span: 1, reveal: 43, step: 0, schema: 'idle', gate: 'idle', receipt: false, status: 'PROPOSING', tone: 'run', read: 'Anthropic drafting - a proposal carries no authority' },
  { span: 1, reveal: 54, step: 1, schema: 'run', gate: 'idle', receipt: false, status: 'VALIDATING', tone: 'run', read: 'Checking output against task contract T-07 v3' },
  { span: 1, reveal: 61, step: 1, schema: 'valid', gate: 'idle', receipt: false, status: 'SCHEMA VALID', tone: 'valid', read: '19 of 19 fields bound - contract satisfied' },
  { span: 2.2, reveal: 72, step: 2, schema: 'valid', gate: 'hold', receipt: false, status: 'HELD', tone: 'hold', read: 'Stopped at the wall - the gate needs a site signature' },
  { span: 1.2, reveal: 94, step: 2, schema: 'valid', gate: 'signed', receipt: false, status: 'SIGNED', tone: 'signed', read: 'M. Avdol - PI, Site 018 - 14:07 - authority stayed local' },
  { span: 2, reveal: 100, step: 3, schema: 'valid', gate: 'signed', receipt: true, status: 'RECEIPTED', tone: 'signed', read: 'REV-018-TR3-1044 - replayable without the model' },
]

// Down the first tine, right along the crossbar, then straight down the shaft.
const ROUTE = 'M 129 118 V 152 H 310 V 442'

export default function TridentSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const open = state.gate === 'signed'

  return (
    <figure className="dgm">
      <figcaption className="dgm-head">
        <span>Governed execution path</span>
        <small>Run 018-017 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
      <svg
        className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
        viewBox="0 0 620 600"
        role="img"
        aria-label="Three proposal sources converge on one governed path. The path stops at a site authority wall and only passes the gate once a named person at the site signs."
      >
        <defs>
          <pattern id="tr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path className="dgm-grid" d="M20 0 H0 V20" />
          </pattern>
          <pattern id="tr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
          </pattern>
        </defs>

        <rect className="dgm-ground" x="24" y="14" width="572" height="504" fill="url(#tr-grid)" />
        <text className="dgm-micro" x="24" y="24">PROPOSAL SOURCES - UNTRUSTED</text>

        {/* Three tines. Any of them may propose; the contract does not change. */}
        {PROVIDERS.map((item, i) => (
          <g className={`dgm-source${i === 0 ? ' is-active' : ''}`} key={item.name}>
            <rect className="dgm-node" x={item.x} y="32" width="170" height="86" rx="10" />
            <circle className="dgm-dot" cx={item.x + 18} cy="56" r="3.5" />
            <text className="dgm-title" x={item.x + 30} y="60">{item.name}</text>
            <text className="dgm-mono" x={item.x + 18} y="82">{item.meta}</text>
            <rect className="dgm-chip" x={item.x + 17} y="92" width="82" height="17" rx="5" />
            <text className="dgm-chiptext" x={item.x + 27} y="104">PROPOSE ONLY</text>
            <path className="dgm-edge" d={`M ${item.cx} 118 V 152`} />
          </g>
        ))}

        {/* Crossbar: three tines, one path onward. */}
        <path className="dgm-edge" d="M 129 152 H 491" />
        <path className="dgm-edge" d="M 310 152 V 442" />
        <text className="dgm-edgelabel" x="318" y="170">PROPOSAL</text>

        <g className={`dgm-stage is-${state.schema}`}>
          <rect className="dgm-node" x="168" y="178" width="284" height="66" rx="10" />
          <text className="dgm-title" x="186" y="205">Schema contract</text>
          <text className="dgm-mono" x="186" y="226">T-07 v3 - 19 FIELDS - DETERMINISTIC</text>
          <text className="dgm-stamp" x="434" y="211" textAnchor="end">{state.schema === 'valid' ? 'VALID' : state.schema === 'run' ? 'CHECKING' : 'IDLE'}</text>
        </g>

        <text className="dgm-edgelabel" x="318" y="272">SCHEMA-BOUND</text>

        {/* The wall. One gate, hatched shut until the site signs it open. */}
        <g className={`dgm-gate is-${state.gate}`}>
          <line className="dgm-boundary" x1="8" y1="300" x2="612" y2="300" />
          <line className="dgm-boundary-under" x1="8" y1="304" x2="612" y2="304" />
          <g className={`dgm-gateway is-${state.gate}`}>
            <rect className="dgm-port" x="288" y="293" width="44" height="18" fill={open ? 'var(--surface-solid)' : 'url(#tr-hatch)'} />
            <path className="dgm-jamb" d="M 288 288 V 316 M 332 288 V 316" />
          </g>
          <rect className="dgm-plaque" x="24" y="290" width="126" height="24" rx="6" />
          <text className="dgm-micro is-plaque" x="34" y="306">AUTHORITY</text>
          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="574" y="290" width="21" height="24" />
        </g>

        <g className={`dgm-stage is-${state.gate}`}>
          <rect className="dgm-node is-key" x="152" y="318" width="316" height="92" rx="10" />
          <text className="dgm-micro" x="170" y="343">CHECKPOINT - SITE OF RECORD</text>
          <text className="dgm-title" x="170" y="368">{open ? 'M. Avdol' : 'Awaiting signature'}</text>
          <text className="dgm-mono" x="170" y="390">SITE 018 - PI OR SUB-I{open ? ' - 14:07' : ''}</text>
          <text className="dgm-stamp" x="450" y="343" textAnchor="end">{open ? 'SIGNED' : state.gate === 'hold' ? 'HELD' : 'ARMED'}</text>
        </g>

        <text className="dgm-edgelabel" x="318" y="430">SIGNED</text>

        <g className={`dgm-stage${state.receipt ? ' is-signed' : ''}`}>
          <rect className={`dgm-node${state.receipt ? '' : ' is-pending'}`} x="168" y="442" width="284" height="64" rx="10" />
          <text className="dgm-micro" x="186" y="465">EXECUTION RECEIPT</text>
          <text className="dgm-mono is-id" x="186" y="488">{state.receipt ? 'REV-018-TR3-1044 - SHA256 AEAD45CF' : 'NOT YET WRITTEN'}</text>
        </g>

        {/* The governed path itself, revealed by the reader's scroll. */}
        <path className="dgm-route" d={ROUTE} pathLength="100" style={{ strokeDashoffset: 100 - state.reveal }} />

        {STEPS.map((item, i) => (
          <g className={`dgm-step${i === state.step ? ' is-now' : i < state.step ? ' is-done' : ''}`} key={item.label}>
            <path className="dgm-tick" d={`M 476 ${item.y} H 488`} />
            <text className="dgm-micro" x="496" y={item.y + 3.5}>{item.label}</text>
          </g>
        ))}

        <text className="dgm-side" x="144" y="215" textAnchor="end">DETERMINISTIC</text>
        <text className="dgm-side" x="144" y="368" textAnchor="end">HUMAN</text>
        <text className="dgm-side" x="144" y="478" textAnchor="end">IMMUTABLE</text>

        <line className="dgm-rule" x1="24" y1="536" x2="596" y2="536" />
        <rect className="dgm-status" x="24" y="554" width="132" height="24" rx="6" />
        <text className="dgm-statustext" x="34" y="570">{state.status}</text>
        <text className="dgm-read" x="170" y="570">{state.read}</text>
      </svg>
      </div>
    </figure>
  )
}

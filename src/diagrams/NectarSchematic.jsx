import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase } from './useScrollPhase'

/**
 * Nectar - one site boundary, two lanes, opposite outcomes.
 *
 * Structure leaves the site and lands in the shared library, which is what the
 * rest of the network draws on. Patient records leave by the same wall and are
 * turned back at it. The monogram sits on the boundary because the monogram is
 * two masses with a gap, and the gap is the boundary.
 *
 * Scrolling releases the structure, then sends the record request at the same
 * wall. The refusal owns the widest stretch of scroll, because the refusal is
 * the claim. Boundary behaviour only, no internals (ADR-0001).
 */

const BARS = Array.from({ length: 17 }, (_, i) => 42 + i * 20)

const PARCELS = [
  { x: 120, w: 122, label: 'CRITERION I-4.2' },
  { x: 250, w: 104, label: 'UNIT mg/m2' },
  { x: 362, w: 136, label: 'MAP LOINC 718-7' },
]

const PEERS = [
  { x: 60, cx: 130, id: 'Site 042', meta: '890 RECORDS' },
  { x: 240, cx: 310, id: 'Site 077', meta: '2,338 RECORDS' },
  { x: 420, cx: 490, id: 'Site 103', meta: '614 RECORDS' },
]

const PHASES = [
  { span: 1, out: 0, back: 0, gate: 'idle', coverage: 77, shared: 62, status: 'QUEUED', tone: 'run', read: 'Structure queued at the site wall - nothing has left' },
  { span: 1.6, out: 100, back: 0, gate: 'pass', coverage: 78, shared: 63, status: 'RELEASED', tone: 'pass', read: 'Criterion I-4.2 crossed - definition only, no values' },
  { span: 1, out: 100, back: 100, gate: 'check', coverage: 78, shared: 63, status: 'CHECKING', tone: 'hold', read: 'Network requests the 1,204 records behind the criterion' },
  { span: 2.2, out: 100, back: 100, gate: 'stop', coverage: 78, shared: 63, status: 'REFUSED', tone: 'stop', read: 'Refused at the boundary - records never leave Site 018' },
  { span: 2, out: 100, back: 100, gate: 'stop', coverage: 78, shared: 63, status: 'STEADY', tone: 'stop', read: 'Structure crosses. Records do not.' },
]

export default function NectarSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const refused = state.gate === 'stop'

  return (
    <figure className="dgm">
      <figcaption className="dgm-head">
        <span>Site boundary behaviour</span>
        <small>Site 018 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
      <svg
        className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
        viewBox="0 0 620 620"
        role="img"
        aria-label="Execution structure crosses the site boundary into a shared library that every site draws on. Patient records reach the same boundary and are refused."
      >
        <defs>
          <pattern id="nc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path className="dgm-grid" d="M20 0 H0 V20" />
          </pattern>
          <pattern id="nc-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
          </pattern>
        </defs>

        <rect className="dgm-ground" x="24" y="14" width="572" height="522" fill="url(#nc-grid)" />

        <text className="dgm-micro" x="24" y="24">SITE OF RECORD - PHI RESIDENT</text>
        <text className="dgm-edgelabel" x="170" y="210">DEFINITION</text>
        {refused ? null : <text className="dgm-edgelabel" x="446" y="210">REQUEST</text>}

        {/* The site. The record stack is heavy and never moves. */}
        <g className="dgm-site">
          <rect className="dgm-node" x="24" y="32" width="572" height="132" rx="12" />
          <text className="dgm-title" x="42" y="58">Site 018 - Damaros Health</text>
          <rect className="dgm-chip is-seal" x="500" y="44" width="78" height="18" rx="5" />
          <text className="dgm-chiptext is-seal" x="510" y="57">PHI SEALED</text>
          {BARS.map((x) => <rect className="dgm-bar" x={x} y="78" width="13" height="30" rx="3" key={x} />)}
          <text className="dgm-mono is-id" x="404" y="100">1,204 RECORDS</text>
          <text className="dgm-mono" x="42" y="132">OBSERVATION / DOCUMENTREFERENCE / DIAGNOSTICREPORT</text>
          <text className="dgm-mono" x="42" y="150">EGRESS NONE - RETENTION LOCAL - COLLECTED ON SITE</text>
          <text className="dgm-side" x="162" y="180" textAnchor="middle">STRUCTURE</text>
          <text className="dgm-side" x="438" y="180" textAnchor="middle">RECORDS</text>
        </g>

        {/* Two lanes leave the same wall. */}
        <path className="dgm-edge" d="M 162 164 V 300" />
        <path className="dgm-edge" d="M 438 164 V 252" />

        {/* One wall, two gates. Structure has a gate that opens. Records have
            a gate that does not. The wall itself never changes colour - it is
            not a status light, it is the wall. */}
        <g className="dgm-gate">
          <line className="dgm-boundary" x1="8" y1="252" x2="612" y2="252" />
          <line className="dgm-boundary-under" x1="8" y1="256" x2="612" y2="256" />
          <g className={`dgm-gateway${state.out === 100 ? ' is-open' : ''}`}>
            <rect className="dgm-port" x="140" y="245" width="44" height="18" fill={state.out === 100 ? 'var(--surface-solid)' : 'url(#nc-hatch)'} />
            <path className="dgm-jamb" d="M 140 240 V 268 M 184 240 V 268" />
          </g>
          <g className={`dgm-gateway${state.back === 100 ? ' is-shut' : ''}`}>
            <rect className="dgm-port" x="416" y="245" width="44" height="18" fill="url(#nc-hatch)" />
            <path className="dgm-jamb" d="M 416 240 V 268 M 460 240 V 268" />
          </g>
          <rect className="dgm-plaque" x="252" y="240" width="116" height="28" rx="7" />
          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="264" y="245" width="16" height="18" />
          <text className="dgm-micro is-plaque" x="288" y="258">BOUNDARY</text>
        </g>

        {/* Structure crosses and lands in the library. */}
        <path className="dgm-route is-out" d="M 162 164 V 300" pathLength="100" style={{ strokeDashoffset: 100 - state.out }} />

        {/* Records reach the same wall and stop at it. */}
        <path className="dgm-route is-back" d="M 438 164 V 252" pathLength="100" style={{ strokeDashoffset: 100 - state.back }} />
        {refused ? (
          <g className="dgm-refusal">
            <path className="dgm-cross" d="M 430 246 l 16 16 M 446 246 l -16 16" />
            <text className="dgm-refused" x="438" y="232" textAnchor="middle">REFUSED AT BOUNDARY</text>
          </g>
        ) : null}

        <g className="dgm-stage is-key">
          <rect className="dgm-node is-key" x="104" y="300" width="412" height="126" rx="12" />
          <text className="dgm-micro" x="122" y="324">SHARED EXECUTION LIBRARY</text>
          <text className="dgm-mono" x="122" y="344">DMR-204 - 36 CRITERIA - STRUCTURE ONLY, NO VALUES</text>
          {PARCELS.map((item, i) => (
            <g className={`dgm-parcel${i === 0 && state.out === 100 ? ' is-new' : ''}`} key={item.label}>
              <rect className="dgm-chip" x={item.x} y="356" width={item.w} height="20" rx="5" />
              <text className="dgm-chiptext" x={item.x + 10} y="370">{item.label}</text>
            </g>
          ))}
          <text className="dgm-micro" x="122" y="401">COVERAGE</text>
          <rect className="dgm-meter" x="180" y="394" width="256" height="7" rx="3.5" />
          <rect className="dgm-meterfill" x="180" y="394" width={256 * (state.coverage / 100)} height="7" rx="3.5" />
          <text className="dgm-mono is-id" x="498" y="401" textAnchor="end">{state.coverage}%</text>
        </g>

        {/* Every other site draws on what crossed. */}
        <path className="dgm-edge" d="M 310 426 V 452" />
        <path className="dgm-edge" d="M 130 452 H 490" />
        {PEERS.map((item) => <path className="dgm-edge" d={`M ${item.cx} 452 V 478`} key={`e-${item.id}`} />)}
        {PEERS.map((item) => (
          <g className="dgm-peer" key={item.id}>
            <rect className="dgm-node" x={item.x} y="478" width="140" height="58" rx="10" />
            <text className="dgm-title is-sm" x={item.x + 16} y="504">{item.id}</text>
            <text className="dgm-mono" x={item.x + 16} y="522">{item.meta}</text>
          </g>
        ))}

        <line className="dgm-rule" x1="24" y1="562" x2="596" y2="562" />
        <rect className="dgm-status" x="24" y="578" width="132" height="24" rx="6" />
        <text className="dgm-statustext" x="34" y="594">{state.status}</text>
        <text className="dgm-read" x="170" y="594">{state.read}</text>
      </svg>
      </div>
    </figure>
  )
}

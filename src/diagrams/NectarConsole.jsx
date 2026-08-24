import { ConsoleChrome, ConsoleGlyph } from './ConsoleChrome'
import { useScrollPhase } from './useScrollPhase'

/**
 * Nectar - one boundary, two opposite outcomes.
 *
 * The monogram sits in the gap between its own two halves, so the boundary in
 * this console is drawn with the mark itself: the site above the line, the
 * network below it. Structure crosses downward and coverage rises. Patient
 * records reach the same line and are turned back. Scrolling the section is
 * what runs it, and the refusal owns the widest stretch of scroll, because the
 * refusal is the claim. Boundary level only, no internals (ADR-0001).
 */

const SITES = [
  { id: 'Site 018', org: 'Damaros Health', records: '1,204', shared: 62 },
  { id: 'Site 042', org: 'Meridian Clinic', records: '890', shared: 41 },
  { id: 'Site 077', org: 'Ridgeway Oncology', records: '2,338', shared: 88 },
  { id: 'Site 103', org: 'Bay Cohort Group', records: '614', shared: 27 },
]

const PHASES = [
  { span: 1, released: false, refused: false, gate: 'open', coverage: 77, status: 'QUEUED', caption: 'Structure queued at the site boundary' },
  { span: 1.6, released: true, refused: false, gate: 'pass', coverage: 78, status: 'RELEASED', caption: 'Structure crossed. Coverage rose for every site.' },
  { span: 1, released: true, refused: 'pending', gate: 'check', coverage: 78, status: 'CHECKING', caption: 'The network requests the underlying records' },
  { span: 2.2, released: true, refused: true, gate: 'stop', coverage: 78, status: 'REFUSED', caption: 'Patient records refused at the boundary' },
  { span: 2, released: true, refused: true, gate: 'stop', coverage: 78, status: 'STEADY', caption: 'Structure crosses. Records do not.' },
]

const REST = PHASES.length - 1
const SITE = SITES[0]

export default function NectarConsole({ animate = true, reduced = false, section }) {
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const state = PHASES[phase] ?? PHASES[REST]

  return (
    <div className="pconsole">
      <ConsoleChrome name="Nectar" scope="4 sites" live="Boundary enforced" pulse={animate} />

      <div className="pconsole-body nc-body">
        <div className="nc-coverage">
          <span><strong>Protocol coverage</strong><small>Shared execution library - DMR-204</small></span>
          <em>{state.coverage}%</em>
          <div className="nc-meter" role="presentation">
            <i style={{ width: `${state.coverage}%` }} />
          </div>
        </div>

        <div className="nc-sites">
          <header><small>SITE</small><small>RECORDS</small><small>SHARED</small></header>
          {SITES.map((item, i) => (
            <div className={i === 0 ? 'is-active' : ''} key={item.id}>
              <span><ConsoleGlyph kind="site" size={14} /><strong>{item.id}</strong><small>{item.org}</small></span>
              <b>{item.records}</b>
              <em>{item.shared + (i === 0 && state.released ? 1 : 0)}</em>
            </div>
          ))}
        </div>

        <div className="nc-boundary">
          <div className={`nc-lane is-blocked${state.refused === true ? ' is-on' : ''}`}>
            <ConsoleGlyph kind="record" />
            <span><strong>{SITE.records} patient records</strong><small>Requested by the network</small></span>
            <em>{state.refused === true ? 'REFUSED' : state.refused === 'pending' ? 'CHECKING' : 'AT REST'}</em>
          </div>

          <div className={`nc-gate is-${state.gate}`}>
            <span className="nc-gate-side">{SITE.id}</span>
            <i aria-hidden="true" />
            <span className="nc-gate-mark">
              <img src="/assets/damaros-monogram-blue.svg" alt="" aria-hidden="true" decoding="async" />
              Boundary
            </span>
            <i aria-hidden="true" />
            <span className="nc-gate-side">Network</span>
          </div>

          <div className={`nc-lane is-out${state.released ? ' is-on' : ''}`}>
            <ConsoleGlyph kind="structure" />
            <span><strong>Criterion I-4.2</strong><small>ECOG 0-1 - structure only, no values</small></span>
            <em>{state.released ? 'RELEASED' : 'QUEUED'}</em>
          </div>

          <p className="nc-caption">{state.caption}</p>
        </div>

        {/* The log keeps both outcomes on the record. A refusal is an entry,
            not an absence. */}
        <div className="nc-log">
          <p className="pconsole-kicker">Boundary log</p>
          <header><small>PARCEL</small><small>OUTCOME</small><small>TIME</small></header>
          <div className={`is-refused${state.refused === true ? ' is-new' : ''}`}><code>PATIENT RECORD</code><b>Refused</b><time>14:09</time></div>
          <div className={state.released ? 'is-new' : ''}><code>CRITERION I-4.2</code><b>Released</b><time>14:07</time></div>
          <div><code>UNIT mg/m2</code><b>Released</b><time>11:52</time></div>
        </div>
      </div>
    </div>
  )
}

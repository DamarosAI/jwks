import { usePhaseCycle } from './usePhaseCycle'

/**
 * Nectar - one boundary, two opposite outcomes, shown as a release queue.
 *
 * Same product register as the landing workspace. A site table on top, then the
 * boundary itself: what was released, and what was refused. The refusal is the
 * point, so it stays on screen in the rest state - structure crosses, records
 * do not. Boundary level only, no internals (ADR-0001).
 */

const SITES = [
  { id: 'Site 018', org: 'Damaros Health', records: '1,204', shared: 62 },
  { id: 'Site 042', org: 'Meridian Clinic', records: '890', shared: 41 },
  { id: 'Site 077', org: 'Ridgeway Oncology', records: '2,338', shared: 88 },
  { id: 'Site 103', org: 'Bay Cohort Group', records: '614', shared: 27 },
]

const PARCELS = [
  { label: 'CRITERION I-4.2', detail: 'ECOG 0-1 - structured definition' },
  { label: 'UNIT mg/m2', detail: 'Dose unit normalisation' },
  { label: 'MAP LOINC 718-7', detail: 'Haemoglobin - source mapping' },
  { label: 'SCHEMA v2.1', detail: 'Protocol shape - no values' },
]

const PHASES = [
  { hold: 900, step: 0, released: false, refused: false, status: 'QUEUED', caption: 'Structure queued for release' },
  { hold: 1000, step: 1, released: true, refused: false, status: 'RELEASED', caption: 'Structure crossed the boundary' },
  { hold: 900, step: 2, released: true, refused: 'pending', status: 'CHECKING', caption: 'Record requested by the network' },
  { hold: 1700, step: 3, released: true, refused: true, status: 'REFUSED', caption: 'Patient records refused at the boundary' },
  { hold: 1700, step: 3, released: true, refused: true, status: 'STEADY', caption: 'Structure crosses. Records do not.' },
]

const REST = PHASES.length - 1

export default function NectarConsole({ animate = true }) {
  const { phase, cycle } = usePhaseCycle(PHASES, { animate, restPhase: REST })
  const state = PHASES[phase]
  const active = cycle % SITES.length
  const site = SITES[active]
  const parcel = PARCELS[cycle % PARCELS.length]

  const coverage = 74 + (cycle % 6) + (state.released ? 1 : 0)

  return (
    <div className="pconsole">
      <div className="pconsole-bar">
        <div className="pconsole-lights" aria-hidden="true"><i /><i /><i /></div>
        <span className="pconsole-name">Nectar</span>
        <span className={`pconsole-live${animate ? ' is-live' : ''}`}><i /> 4 sites connected</span>
      </div>

      <div className="pconsole-body nc-body">
        <div className="nc-coverage">
          <span><strong>Shared execution library</strong><small>Coverage compounds as sites contribute structure</small></span>
          <em>{coverage}%</em>
          <div className="nc-meter" role="presentation">
            <i style={{ width: `${coverage}%` }} />
          </div>
        </div>

        <div className="nc-sites">
          <header><small>SITE</small><small>RECORDS</small><small>SHARED</small></header>
          {SITES.map((item, i) => (
            <div className={i === active ? 'is-active' : ''} key={item.id}>
              <span><strong>{item.id}</strong><small>{item.org}</small></span>
              <b>{item.records}</b>
              <em>{item.shared + (i === active && state.released ? 1 : 0)}</em>
            </div>
          ))}
        </div>

        <div className="nc-boundary">
          <p className="pconsole-kicker">Site boundary - {site.id}</p>

          <div className={`nc-lane is-out${state.released ? ' is-on' : ''}`}>
            <i aria-hidden="true" />
            <span><strong>{parcel.label}</strong><small>{parcel.detail}</small></span>
            <em>{state.released ? 'RELEASED' : 'QUEUED'}</em>
          </div>

          <div className={`nc-lane is-blocked${state.refused === true ? ' is-on' : ''}`}>
            <i aria-hidden="true" />
            <span><strong>{site.records} patient records</strong><small>Requested by network - never leaves the site</small></span>
            <em>{state.refused === true ? 'REFUSED' : state.refused === 'pending' ? 'CHECKING' : 'AT REST'}</em>
          </div>

          <p className="nc-caption">{state.caption}</p>
        </div>
      </div>
    </div>
  )
}

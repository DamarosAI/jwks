import { useState } from 'react'

import { EDGE_ANGLE, jitter, planSpace, project, roundedDeck } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollRun } from './useScrollPhase'

/**
 * Nectar - what a site lets out.
 *
 * Trident is one site seen in section: decks piled on one plan, arriving closed
 * and opening out. Nectar is a federation seen in plan - two planes, one above
 * the other. Below: three peer sites standing on one ground, each inside its
 * own reach. Above: the shared library, drawn as a mesh rather than a container,
 * so coverage is the part of it that has lit up rather than a number in a box.
 *
 * Everything in this figure travels one way. Sites run the task locally, on
 * their own records, and publish the structure they used. Nothing is ever asked
 * for back down: the library has no reason to want a record, so no line in the
 * drawing ever points at a site. The records sit under a sealed lid inside each
 * wall, and the only thing that ever crosses that wall is a definition.
 *
 * The network effect is drawn, not asserted: each site carries a reach, and as
 * coverage compounds those reaches grow until they overlap.
 *
 * The library is never idle. Criteria pulse, traffic runs the mesh, and each
 * site keeps sweeping its own records - all on timings scattered by `jitter`,
 * so the drawing is alive without anybody touching it and never falls into a
 * loop a reader can catch.
 *
 * Boundary behaviour only, no internals (ADR-0001).
 */

const MESH = project(310, 208)
const GROUND = project(310, 490)

// The library. A jittered plan lattice so it reads as a body of knowledge and
// not a spreadsheet - the scatter is deterministic, not random, so the same
// mesh is drawn on every render and in every test.
const NODES = []
for (let row = 0; row < 6; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const index = row * 7 + col
    const x = -132 + col * 44 + Math.round((jitter(index, 3) - 0.5) * 24)
    const y = -100 + row * 40 + Math.round((jitter(index, 9) - 0.5) * 22)
    NODES.push({ index, x, y, at: MESH(x, y), seed: jitter(index, 7), life: jitter(index, 11) })
  }
}

// Coverage does not grow in reading order - it grows wherever a site happens to
// contribute, so the mesh fills in unevenly the way a real library does.
const ORDER = [...NODES].sort((a, b) => a.seed - b.seed)
ORDER.forEach((node, rank) => { node.rank = rank })
const TOTAL = NODES.length

const LINKS = []
for (let a = 0; a < NODES.length; a += 1) {
  for (let b = a + 1; b < NODES.length; b += 1) {
    const dx = NODES[a].x - NODES[b].x
    const dy = NODES[a].y - NODES[b].y
    if (dx * dx + dy * dy > 54 * 54) continue
    LINKS.push({
      key: `${a}-${b}`,
      a,
      b,
      from: NODES[a].at,
      to: NODES[b].at,
      rank: Math.max(NODES[a].rank, NODES[b].rank),
      stagger: Math.round(((a + b) / (2 * TOTAL)) * 100) / 100,
      life: jitter(a * 7 + b, 13),
    })
  }
}

// Traffic. A handful of the shortest-ranked links carry a travelling mark, so
// the library reads as something in use rather than a diagram of one. They are
// picked by a stable seed, never by position, so the same eight run every time.
const TRAFFIC = LINKS.filter((link) => link.life > 0.93).slice(0, 8)

// Three peers on one ground, set on a ring so no site sits behind another and
// none of them is the centre. The plan positions are chosen for where they land
// on screen, not for where they are tidy in plan: an equilateral plan triangle
// projects to a lopsided one, so the ring is solved backwards from a balanced
// screen layout.
const SITES = [
  { id: 'SITE 042', plan: [46, -105], records: '890', stagger: 0.08, side: 1 },
  { id: 'SITE 103', plan: [-105, 46], records: '614', stagger: 0.16, side: -1 },
  { id: 'SITE 018', plan: [91, 91], records: '1,204', stagger: 0.26, side: 1 },
].map((site, index) => {
  const [cx, cy] = GROUND(...site.plan)
  const shape = roundedDeck(cx, cy, 54, 13, 16)
  return { ...site, index, cx, cy, shape, port: shape.p(0, -30), life: jitter(index, 17) }
})

const [SITE_042, SITE_103, SITE_018] = SITES

// What each site publishes, and where it lands. The three landing nodes have to
// come from the rank band the run credits, so a chip always arrives at a node
// that is lighting up - and they have to be spread across the library rather
// than clustered, because three definitions landing in one corner of the mesh
// is not what compounding coverage looks like. So: take the band, sort it by
// where it lands on screen, and give each site its own third of the library.
const BAND = [...ORDER.slice(30, 38)].sort((a, b) => (a.x - a.y) - (b.x - b.y))
const JOIN = BAND[Math.floor(BAND.length / 2)]
const CARRIES = [
  { key: 'SITE 018', site: SITE_018, node: JOIN, bow: -1, label: 'CRITERION I-4.2' },
  { key: 'SITE 042', site: SITE_042, node: BAND[BAND.length - 1], bow: 1, label: 'UNIT mg/m2' },
  { key: 'SITE 103', site: SITE_103, node: BAND[0], bow: -1, label: 'MAP LOINC 718-7' },
].map((item) => {
  const [x1, y1] = item.site.port
  const [x2, y2] = item.node.at
  // Bow the arc off the chord rather than lifting it straight up, so a site
  // sitting under its own node still gets a curve instead of a plumb line.
  const span = Math.hypot(x2 - x1, y2 - y1) || 1
  const cx = Math.round((x1 + x2) / 2 - ((y2 - y1) / span) * 52 * item.bow)
  const cy = Math.round((y1 + y2) / 2 + ((x2 - x1) / span) * 52 * item.bow - 34)
  return {
    ...item,
    path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
    // The midpoint of a quadratic, where the label rides.
    mid: [Math.round(0.25 * x1 + 0.5 * cx + 0.25 * x2), Math.round(0.25 * y1 + 0.5 * cy + 0.25 * y2)],
  }
})

const JOINED = new Set(
  LINKS.filter((link) => link.a === JOIN.index || link.b === JOIN.index).map((link) => link.key),
)

const PHASES = [
  { span: 2.2, bound: 30, reach: 84, up: [], joined: false, tone: 'run', status: 'LOCAL', read: 'Every site runs the task on its own records. Nothing has moved.' },
  { span: 1.6, bound: 30, reach: 86, up: ['SITE 018'], joined: false, tone: 'pass', status: 'PUBLISHING', read: 'Site 018 publishes the structure it used - a definition, with no values in it.' },
  { span: 1.4, bound: 34, reach: 94, up: ['SITE 018'], joined: true, tone: 'valid', status: 'LINKED', read: `It binds, and links to ${JOINED.size} criteria the library already held.` },
  { span: 2.2, bound: 38, reach: 108, up: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'COMPOUNDING', read: 'Sites 042 and 103 pick it up. Neither one asked anybody for a record.' },
  { span: 2.4, bound: 38, reach: 108, up: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'STEADY', read: 'Structure crosses. Records do not.' },
]

// Pointing at a site answers for that site; otherwise the run narrates itself.
const READS = {
  'SITE 042': 'Site 042 holds 890 records. It has published structure and released none of them.',
  'SITE 103': 'Site 103 holds 614 records. What it contributed was a mapping, not a value.',
  'SITE 018': 'Site 018 holds 1,204 records. Its definition is the one the other two picked up.',
}

/** A solid: a rounded plan square and its two skirt faces, in one ink. */
function Faces({ shape, className }) {
  return (
    <g className={className}>
      <path className="dgm-face-left" d={shape.faceLeft} />
      <path className="dgm-face-right" d={shape.faceRight} />
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

export default function NectarSchematic({ animate = true, reduced = false }) {
  const frame = useCenterOnOverflow()
  const [figure, phase] = useScrollRun(PHASES, { reduced })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]

  // Pointing at a site lifts it, widens nothing, and lights the structure it
  // has published. Hover only re-weights what is already drawn.
  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three peer sites stand on one ground beneath a shared execution library drawn as a mesh of criteria. Each site runs its task locally and publishes the structure it used up into the mesh, where it binds and links to criteria already held. Nothing in the drawing travels back down to a site, the records inside each site stay under a sealed lid, and the reach of each site grows until the three overlap."
        >
          <defs>
            <pattern id="nc-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            <pattern id="nc-reach" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="1" cy="1" r="0.8" />
            </pattern>
          </defs>

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="22" y="16" width="34" height="40" />

          <g className="dgm-count">
            <rect className="dgm-countbody" x="446" y="22" width="154" height="30" rx="15" />
            <text className="dgm-countval" x="462" y="41">{state.bound}/{TOTAL}</text>
            <text className="dgm-countkey" x="504" y="41">CRITERIA BOUND</text>
          </g>

          {/* The upper plane, then the mesh that lives on it. */}
          <g transform={planSpace(310, 208)}>
            <rect className="dgm-plane" x="-160" y="-160" width="320" height="320" rx="28" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x="-160" y="-160" width="320" height="320" rx="28" fill="url(#nc-grain)" />
          </g>

          <text className="dgm-edge" x="150" y="161" transform={`rotate(${-EDGE_ANGLE} 150 161)`}>DEFINITIONS</text>

          <g className="dgm-mesh">
            {LINKS.map((link) => (
              <line
                className={`dgm-link${link.rank < state.bound ? ' is-bound' : ''}${state.joined && JOINED.has(link.key) ? ' is-new' : ''}`}
                key={link.key}
                style={{ '--stagger': link.stagger }}
                pathLength="100"
                x1={link.from[0]}
                y1={link.from[1]}
                x2={link.to[0]}
                y2={link.to[1]}
              />
            ))}
            {/* Traffic. Eight marks running eight different links on eight
                different clocks, so the library is busy whether or not the
                reader is doing anything to it. */}
            {TRAFFIC.map((link) => (
              <line
                className={`dgm-traffic${link.rank < state.bound ? ' is-bound' : ''}`}
                key={`t-${link.key}`}
                style={{ '--life': link.life }}
                pathLength="100"
                x1={link.from[0]}
                y1={link.from[1]}
                x2={link.to[0]}
                y2={link.to[1]}
              />
            ))}
            {NODES.map((node) => (
              <circle
                className={`dgm-node${node.rank < state.bound ? ' is-bound' : ''}${node.rank === JOIN.rank && state.joined ? ' is-new' : ''}`}
                key={node.index}
                style={{ '--stagger': Math.round((node.rank / TOTAL) * 100) / 100, '--life': node.life }}
                cx={node.at[0]}
                cy={node.at[1]}
                r={node.rank < state.bound ? 4.4 : 2.8}
              />
            ))}
          </g>

          {/* The ground the three peers share, and the reach each one carries.
              The reaches grow with coverage until they overlap - that overlap is
              the network effect, drawn rather than claimed. */}
          <g transform={planSpace(310, 490)}>
            <rect className="dgm-plane" x="-162" y="-162" width="324" height="324" rx="28" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x="-162" y="-162" width="324" height="324" rx="28" fill="url(#nc-grain)" />
            {SITES.map((site) => (
              <g className={`dgm-reach${lit(site.id)}`} key={site.id} style={{ '--stagger': site.stagger, '--life': site.life }}>
                <circle className="dgm-reachfill" cx={site.plan[0]} cy={site.plan[1]} r={state.reach} fill="url(#nc-reach)" />
                <circle className="dgm-reachrim" cx={site.plan[0]} cy={site.plan[1]} r={state.reach} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>

          <text className="dgm-edge is-caption" x="310" y="626" textAnchor="middle">THREE PEERS - ONE GROUND</text>

          {/* Sites, back to front. The wall is the skirt: a double rule, drawn
              identically at every site, and no line ever crosses it. */}
          {SITES.map((site) => (
            <g
              className={`dgm-site${lit(site.id)}`}
              key={site.id}
              style={{ '--stagger': site.stagger, '--life': site.life }}
              {...probe(site.id)}
            >
              <Faces shape={site.shape} className="dgm-solid" />
              <polyline
                className="dgm-wall"
                points={`${site.shape.left[0]},${site.shape.left[1] + 5} ${site.shape.front[0]},${site.shape.front[1] + 5} ${site.shape.right[0]},${site.shape.right[1] + 5}`}
              />
              <g transform={planSpace(site.cx, site.cy)}>
                {[-17, 0, 17].map((y) => (
                  <rect className="dgm-record" key={y} x="-32" y={y - 5} width="64" height="10" rx="5" />
                ))}
                <rect className="dgm-lid" x="-38" y="-27" width="76" height="54" rx="14" vectorEffect="non-scaling-stroke" />
                <rect className="dgm-sweep" x="-36" y="-25" width="7" height="50" rx="3.5" />
                <circle className="dgm-port" cx="0" cy="-30" r="7" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
          ))}

          {/* Structure rising. Every path in this figure points the same way. */}
          {CARRIES.map((item) => (
            <g className={`dgm-lift${state.up.includes(item.key) ? ' is-up' : ''}${lit(item.key)}`} key={item.key}>
              <path className="dgm-liftpath" d={item.path} pathLength="100" />
              <circle className="dgm-liftchip" cx={item.node.at[0]} cy={item.node.at[1]} r="7" />
              <g className="dgm-carry">
                <rect className="dgm-tagbody" x={item.mid[0] - 54} y={item.mid[1] - 11} width="108" height="22" rx="11" />
                <text className="dgm-tagtext" x={item.mid[0]} y={item.mid[1] + 4} textAnchor="middle">{item.label}</text>
              </g>
            </g>
          ))}

          {/* Identities, each tied to its own deck by a leader. */}
          {SITES.map((site) => {
            const anchor = site.side < 0 ? site.shape.left : site.shape.right
            const tip = anchor[0] + site.side * 14
            const x = tip + site.side * 8
            return (
              <g className={`dgm-ident${lit(site.id)}`} key={`id-${site.id}`} {...probe(site.id)}>
                {/* One hit area for the whole strip: a leader is a hairline and
                    a label is a few characters tall. */}
                <rect
                  className="dgm-hit"
                  x={site.side < 0 ? 20 : anchor[0]}
                  y={anchor[1] - 18}
                  width={site.side < 0 ? anchor[0] - 20 : 600 - anchor[0]}
                  height="44"
                />
                <line className="dgm-leader" x1={anchor[0]} y1={anchor[1]} x2={tip} y2={anchor[1]} />
                <text className="dgm-side" x={x} y={anchor[1] - 6} textAnchor={site.side < 0 ? 'end' : 'start'}>{site.id}</text>
                <text className="dgm-sidefact" x={x} y={anchor[1] + 7} textAnchor={site.side < 0 ? 'end' : 'start'}>{site.records} RECORDS</text>
                <text className="dgm-sidefact is-quiet" x={x} y={anchor[1] + 19} textAnchor={site.side < 0 ? 'end' : 'start'}>EGRESS NONE</text>
              </g>
            )
          })}

          <line className="dgm-rule" x1="20" y1="648" x2="600" y2="648" />
          <rect className="dgm-status" x="20" y="660" width="130" height="26" rx="13" />
          <text className="dgm-statustext" x="85" y="677" textAnchor="middle">{state.status}</text>
          <text className="dgm-read" x="164" y="677">{READS[hot] ?? state.read}</text>
        </svg>
      </div>
    </figure>
  )
}

import { useState } from 'react'

import { deck, EDGE_ANGLE, jitter, planSpace, project } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase, useScrollSpread } from './useScrollPhase'

/**
 * Nectar - what a site lets out.
 *
 * Trident is one site seen in section: decks piled on one axis, arriving closed
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
    NODES.push({ index, x, y, at: MESH(x, y), seed: jitter(index, 7) })
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
    })
  }
}

// Three peers on one ground, set on an equilateral ring so no site sits behind
// another and none of them is the centre.
// The plan positions are chosen for where they land on screen, not for where
// they are tidy in plan: an equilateral plan triangle projects to a lopsided
// one, so the ring is solved backwards from a balanced screen layout.
const SITES = [
  { id: 'SITE 042', plan: [46, -105], records: '890', stagger: 0.08, side: 1 },
  { id: 'SITE 103', plan: [-105, 46], records: '614', stagger: 0.16, side: -1 },
  { id: 'SITE 018', plan: [91, 91], records: '1,204', stagger: 0.26, side: 1 },
].map((site) => {
  const [cx, cy] = GROUND(...site.plan)
  const shape = deck(cx, cy, 54, 13)
  return { ...site, cx, cy, shape, port: shape.p(0, -30) }
})

const [SITE_042, SITE_103, SITE_018] = SITES

// What each site publishes, and where it lands. The join ranks are the ones the
// counter credits, so a chip always arrives at the node that just lit.
// The node Site 018's definition lands on. It has to be one the LINKED phase
// is about to credit, and it has to sit where an arc can reach it without
// crossing the drawing, so it is picked from that band by position.
const near = (nodes, x, y) => nodes.reduce((best, node) => (
  (node.x - x) ** 2 + (node.y - y) ** 2 < (best.x - x) ** 2 + (best.y - y) ** 2 ? node : best
))
const JOIN = near(ORDER.slice(30, 34), -10, 40)
const CARRIES = [
  { key: 'SITE 018', site: SITE_018, node: JOIN, bow: -1, label: 'CRITERION I-4.2' },
  { key: 'SITE 042', site: SITE_042, node: ORDER[34], bow: 1, label: 'UNIT mg/m2' },
  { key: 'SITE 103', site: SITE_103, node: ORDER[36], bow: -1, label: 'MAP LOINC 718-7' },
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

/** A solid: three faces of one ink, rounded where they meet. */
function Faces({ shape, className }) {
  return (
    <g className={className}>
      <polygon className="dgm-face-left" points={shape.faceLeft} />
      <polygon className="dgm-face-right" points={shape.faceRight} />
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

/** A label lying along a plane edge, the way a plan names its own ground. */
function EdgeLabel({ x, y, turn, anchor, children }) {
  return (
    <text className="dgm-edge" x={x} y={y} textAnchor={anchor} transform={`rotate(${turn} ${x} ${y})`}>
      {children}
    </text>
  )
}

export default function NectarSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const spread = useScrollSpread({ reduced })
  const phase = useScrollPhase(PHASES, { reduced, target: section })
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
      <figcaption className="dgm-head">
        <strong>What a site lets out</strong>
        <p>Coverage compounds across every site in the federation. The records never leave the one that collected them.</p>
        <small>Library DMR-204 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={spread}
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

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="20" y="10" width="18" height="21" />
          <text className="dgm-micro" x="44" y="26">SHARED EXECUTION LIBRARY</text>
          <text className="dgm-micro is-quiet" x="600" y="26" textAnchor="end">STRUCTURE ONLY - NO VALUES</text>

          {/* The upper plane, then the mesh that lives on it. */}
          <g transform={planSpace(310, 208)}>
            <rect className="dgm-plane" x="-160" y="-160" width="320" height="320" rx="28" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x="-160" y="-160" width="320" height="320" rx="28" fill="url(#nc-grain)" />
          </g>

          <EdgeLabel x="150" y="161" turn={-EDGE_ANGLE} anchor="start">DEFINITIONS</EdgeLabel>
          <EdgeLabel x="470" y="161" turn={EDGE_ANGLE} anchor="end">NO VALUES</EdgeLabel>

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
            {NODES.map((node) => (
              <circle
                className={`dgm-node${node.rank < state.bound ? ' is-bound' : ''}${node.rank === JOIN.rank && state.joined ? ' is-new' : ''}`}
                key={node.index}
                style={{ '--stagger': Math.round((node.rank / TOTAL) * 100) / 100, '--beat': node.rank % 7 }}
                cx={node.at[0]}
                cy={node.at[1]}
                r={node.rank < state.bound ? 4.4 : 2.8}
              />
            ))}
          </g>

          <g className="dgm-count">
            <rect className="dgm-countbody" x="440" y="42" width="160" height="30" rx="15" />
            <text className="dgm-countval" x="456" y="61">{state.bound}/{TOTAL}</text>
            <text className="dgm-countkey" x="498" y="61">CRITERIA BOUND</text>
          </g>

          {/* The ground the three peers share, and the reach each one carries.
              The reaches grow with coverage until they overlap - that overlap is
              the network effect, drawn rather than claimed. */}
          <g transform={planSpace(310, 490)}>
            <rect className="dgm-plane" x="-162" y="-162" width="324" height="324" rx="28" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x="-162" y="-162" width="324" height="324" rx="28" fill="url(#nc-grain)" />
            {SITES.map((site) => (
              <g className={`dgm-reach${lit(site.id)}`} key={site.id} style={{ '--stagger': site.stagger }}>
                <circle className="dgm-reachfill" cx={site.plan[0]} cy={site.plan[1]} r={state.reach} fill="url(#nc-reach)" />
                <circle className="dgm-reachrim" cx={site.plan[0]} cy={site.plan[1]} r={state.reach} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>

          <text className="dgm-edge is-caption" x="310" y="622" textAnchor="middle">THREE PEERS - ONE GROUND</text>

          {/* Sites, back to front. The wall is the skirt: a double rule, drawn
              identically at every site, and no line ever crosses it. */}
          {SITES.map((site) => (
            <g
              className={`dgm-site${lit(site.id)}`}
              key={site.id}
              style={{ '--stagger': site.stagger }}
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
                <rect className="dgm-lid" x="-38" y="-27" width="76" height="54" rx="12" vectorEffect="non-scaling-stroke" />
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
                <line className="dgm-leader" x1={anchor[0]} y1={anchor[1]} x2={tip} y2={anchor[1]} />
                <text className="dgm-side" x={x} y={anchor[1] - 6} textAnchor={site.side < 0 ? 'end' : 'start'}>{site.id}</text>
                <text className="dgm-sidefact" x={x} y={anchor[1] + 7} textAnchor={site.side < 0 ? 'end' : 'start'}>{site.records} RECORDS</text>
                <text className="dgm-sidefact is-quiet" x={x} y={anchor[1] + 19} textAnchor={site.side < 0 ? 'end' : 'start'}>EGRESS NONE</text>
              </g>
            )
          })}

          <line className="dgm-rule" x1="20" y1="640" x2="600" y2="640" />
          <rect className="dgm-status" x="20" y="654" width="130" height="26" rx="13" />
          <text className="dgm-statustext" x="85" y="671" textAnchor="middle">{state.status}</text>
          <text className="dgm-read" x="164" y="671">{state.read}</text>
        </svg>
      </div>
    </figure>
  )
}

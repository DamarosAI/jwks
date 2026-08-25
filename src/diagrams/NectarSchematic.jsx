import { useState } from 'react'

import { EDGE_ANGLE, jitter, planSpace, project, roundedDeck } from './iso'
import { Faces } from './Solid'
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
 * A site is the same kind of object as a Trident deck - a rounded plan square,
 * extruded, drawn by the same component. It used to be a round vessel, which
 * made the two figures look like they came from different drawings and left
 * every label pinned to the edge of an ellipse with nowhere to sit. Square, the
 * three sites tile the ground, and each one has a side of the sheet to itself.
 *
 * The three are deliberately not the same object. A federation of identical
 * shapes is a diagram of a federation; a real one is uneven. So the plan size
 * of each site, the height of its wall and the number of bands inside it all
 * come from how many records that site holds, and its reach grows in
 * proportion. A reader can tell the three apart with every label removed.
 *
 * Everything in this figure travels one way. Sites run the task locally, on
 * their own records, and publish the structure they used. Nothing is ever asked
 * for back down: the library has no reason to want a record, so no line in the
 * drawing ever points at a site. The records sit under a sealed lid inside each
 * wall, and the only thing that ever crosses that wall is a definition, which
 * leaves from the back corner of the site rather than from a badge parked on
 * its roof.
 *
 * The network effect is drawn, not asserted: each site carries a reach, and as
 * coverage compounds those reaches grow until they overlap. They are clipped to
 * the ground the three sites share, because a reach that runs off the edge of
 * the federation is not reach.
 *
 * The library is never idle. Criteria pulse, traffic runs the mesh, a bound
 * definition throws a ring through its neighbours, and each site keeps sweeping
 * its own records - all on timings scattered by `jitter`, so the drawing is
 * alive without anybody touching it and never falls into a loop a reader can
 * catch. None of it starts until the figure has power: every ambient clock is
 * held at zero opacity until `--charge` comes up.
 *
 * Boundary behaviour only, no internals (ADR-0001).
 */

const MESH = project(310, 200)
const GROUND = project(310, 462)

const GROUND_HALF = 172

// The library. A jittered plan lattice so it reads as a body of knowledge and
// not a spreadsheet - the scatter is deterministic, not random, so the same
// mesh is drawn on every render and in every test.
const NODES = []
for (let row = 0; row < 6; row += 1) {
  for (let col = 0; col < 7; col += 1) {
    const index = row * 7 + col
    const x = -132 + col * 44 + Math.round((jitter(index, 3) - 0.5) * 20)
    const y = -100 + row * 40 + Math.round((jitter(index, 9) - 0.5) * 18)
    NODES.push({ index, x, y, at: MESH(x, y), seed: jitter(index, 7), life: jitter(index, 11) })
  }
}

// Coverage does not grow in reading order - it grows wherever a site happens to
// contribute, so the mesh fills in unevenly the way a real library does.
const ORDER = [...NODES].sort((a, b) => a.seed - b.seed)
ORDER.forEach((node, rank) => { node.rank = rank })
const TOTAL = NODES.length

// A library is a body of knowledge, so it is meshed rather than strung: the
// span reaches past the orthogonal neighbours to catch the diagonals too, which
// is the difference between a lattice a reader believes and a row of dots.
const LINKS = []
for (let a = 0; a < NODES.length; a += 1) {
  for (let b = a + 1; b < NODES.length; b += 1) {
    const dx = NODES[a].x - NODES[b].x
    const dy = NODES[a].y - NODES[b].y
    if (dx * dx + dy * dy > 60 * 60) continue
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

// Traffic. Marks running their own links on their own clocks, so the library
// reads as something in use rather than a diagram of one. They are picked by a
// stable seed, never by position, so the same ones run every time.
const TRAFFIC = LINKS.filter((link) => link.life > 0.88).slice(0, 14)

// Three peers on one ground, set well apart so no site sits behind another,
// none of them is the centre, and each one owns a side of the sheet: the two
// outliers take the left and right margins and the near one takes the space
// under the plan. That is what the labels needed and could not get while the
// three were bunched round a small ring.
//
// Everything else about a site follows from what it holds.
const SITES = [
  { id: 'SITE 042', plan: [46, -124], records: '890', half: 44, wall: 18, bands: 4, grew: 0.94, stagger: 0.08, place: 'right' },
  { id: 'SITE 103', plan: [-124, 46], records: '614', half: 40, wall: 15, bands: 3, grew: 0.82, stagger: 0.16, place: 'left' },
  { id: 'SITE 018', plan: [100, 100], records: '1,204', half: 55, wall: 22, bands: 5, grew: 1.08, stagger: 0.26, place: 'below' },
].map((site, index) => {
  const [cx, cy] = GROUND(...site.plan)
  // The corner radius is a fixed share of the plan size, so a small site and a
  // large one are visibly the same object at two scales rather than two shapes.
  const solid = roundedDeck(cx, cy, site.half, site.wall, Math.round(site.half * 0.34))
  // Record bands under the lid that seals them, so the stack fills the site it
  // is in rather than sitting in a box the site happens to contain.
  const lid = site.half - 7
  const rows = []
  for (let band = 0; band < site.bands; band += 1) {
    const y = Math.round((-lid * 0.58 + (band * lid * 1.16) / (site.bands - 1)) * 10) / 10
    rows.push({ y, half: lid - 7 })
  }
  // The site letters its own wall. The right-hand skirt is a flat plan side, so
  // the middle of it is plan (half, 0) carried through the projection, and the
  // mark sits half a wall down from that edge and runs along it. A label lying
  // on the asset is the asset naming itself, which is what a leader pointing at
  // it from the margin can never quite be.
  const [mx, my] = solid.p(site.half, 0)
  return {
    ...site,
    index,
    cx,
    cy,
    solid,
    lid,
    rows,
    mark: [mx, Math.round((my + site.wall / 2 + 2.6) * 10) / 10],
    run: (lid - 7) * 2 - 8,
    life: jitter(index, 17),
  }
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
  // Structure leaves from the back corner of the site - the far edge of its own
  // roof - so the line climbs away from the reader instead of standing on a
  // badge in the middle of the plan.
  const [x1, y1] = item.site.solid.back
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

// The reach numbers are solved against the plan, not chosen: at the opening
// figure no two reaches touch, and by the closing one every pair does. That is
// the only claim in either drawing made by geometry alone, so it has to be true
// of the geometry rather than approximately suggested by it - and the suite
// re-solves it from these numbers rather than trusting them, because moving a
// site without regrowing the reach leaves the last frame asserting an overlap
// it no longer draws.
const PHASES = [
  { span: 2.2, bound: 30, reach: 78, up: [], joined: false, tone: 'run', status: 'LOCAL', read: 'Every site runs the task on its own records. Nothing has moved.' },
  { span: 1.6, bound: 30, reach: 86, up: ['SITE 018'], joined: false, tone: 'pass', status: 'PUBLISHING', read: 'Site 018 publishes the structure it used - a definition, with no values in it.' },
  { span: 1.4, bound: 34, reach: 98, up: ['SITE 018'], joined: true, tone: 'valid', status: 'LINKED', read: `It binds, and links to ${JOINED.size} criteria the library already held.` },
  { span: 2.2, bound: 38, reach: 124, up: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'COMPOUNDING', read: 'Sites 042 and 103 pick it up. Neither one asked anybody for a record.' },
  { span: 2.4, bound: 38, reach: 124, up: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'STEADY', read: 'Structure crosses. Records do not.' },
]

// Pointing at a site hands it the whole readout - the word in the pill, the
// colour of the pill and the line beside it - and what it says is what that
// site did, not how many rows it happens to be sitting on. Otherwise the run
// narrates itself.
const READS = {
  'SITE 042': { tone: 'pass', pill: 'PUBLISHER', read: 'Site 042 published the unit it measures in - the scale, not one reading taken on it.' },
  'SITE 103': { tone: 'pass', pill: 'MAPPER', read: 'Site 103 sent a mapping between two vocabularies. No patient is in a mapping.' },
  'SITE 018': { tone: 'valid', pill: 'ORIGIN', read: 'Site 018 wrote the definition the other two picked up, and sent nothing else to do it.' },
}

/**
 * What a site holds and what leaves it, set on whichever side of the sheet that
 * site owns. The two outliers hang theirs off a real edge of the solid; the
 * near one carries its own under the plan, where there is room for it.
 *
 * The name is not here any more - it is lettered on the site's own wall, so the
 * margin is left carrying the two numbers, which is all a margin was ever good
 * for. Repeating the name in both places would be the figure saying it twice.
 */
function Ident({ site, lit, probe }) {
  const below = site.place === 'below'
  const side = site.place === 'left' ? -1 : 1
  const anchor = side < 0 ? site.solid.left : site.solid.right
  const tip = anchor[0] + side * 16
  const x = below ? site.cx : tip + side * 8
  // Both lines stand on the leader rather than straddling it. With the name
  // gone the strip is two lines, and centring two lines on a hairline runs it
  // straight through the first one.
  const top = below ? site.solid.front[1] + site.wall + 24 : anchor[1] - 17
  const align = below ? 'middle' : (side < 0 ? 'end' : 'start')
  return (
    <g className={`dgm-ident${lit}`} {...probe}>
      {/* One hit area for the whole strip: a leader is a hairline and a label
          is a few characters tall. */}
      <rect
        className="dgm-hit"
        x={below ? site.cx - 76 : (side < 0 ? 8 : anchor[0])}
        y={top - 14}
        width={below ? 152 : (side < 0 ? anchor[0] - 8 : 612 - anchor[0])}
        height="40"
      />
      {below ? (
        <line className="dgm-leader" x1={site.cx} y1={site.solid.front[1] + site.wall + 4} x2={site.cx} y2={top - 11} />
      ) : (
        <line className="dgm-leader" x1={anchor[0]} y1={anchor[1]} x2={tip} y2={anchor[1]} />
      )}
      <text className="dgm-sidefact" x={x} y={top} textAnchor={align}>{site.records} RECORDS</text>
      <text className="dgm-sidefact is-quiet" x={x} y={top + 12} textAnchor={align}>EGRESS NONE</text>
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

  const cue = READS[hot]
  const tone = cue?.tone ?? state.tone
  const pill = cue?.pill ?? state.status
  const read = cue?.read ?? state.read

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${tone}${animate ? ' is-live' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three peer sites of three different sizes stand well apart on one ground beneath a shared execution library drawn as a mesh of criteria. Each site runs its task locally and sends the structure it used up into the mesh - a criterion from one, a unit from another, a mapping from the third - where it binds and links to criteria already held. Nothing in the drawing travels back down to a site, the records inside each site stay under a sealed lid, and the reach of each site grows until they overlap."
        >
          <defs>
            <pattern id="nc-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            <pattern id="nc-reach" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="1" cy="1" r="0.8" />
            </pattern>
            {/* Reach is clipped to the ground the three sites share. Coverage
                that runs off the edge of the federation is not coverage. */}
            <clipPath id="nc-ground">
              <rect x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" />
            </clipPath>
          </defs>

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="22" y="16" width="34" height="40" />

          <g className="dgm-count">
            <rect className="dgm-countbody" x="446" y="22" width="154" height="30" rx="15" />
            <text className="dgm-countval" x="462" y="41">{state.bound}/{TOTAL}</text>
            <text className="dgm-countkey" x="504" y="41">CRITERIA BOUND</text>
          </g>

          {/* The upper plane, then the mesh that lives on it. */}
          <g transform={planSpace(310, 200)}>
            <rect className="dgm-plane" x="-160" y="-160" width="320" height="320" rx="28" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x="-160" y="-160" width="320" height="320" rx="28" fill="url(#nc-grain)" />
          </g>

          <text className="dgm-edge" x="146" y="144" transform={`rotate(${-EDGE_ANGLE} 146 144)`}>DEFINITIONS</text>

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
            {/* Traffic. Marks running their own links on their own clocks, so
                the library is busy whether or not the reader is doing anything
                to it. */}
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
            {/* A definition that binds does not just light up - it propagates.
                The ring is the library resolving against what it already held,
                which is the one thing in this figure that has to look like
                thinking rather than like storage. */}
            {state.joined ? (
              <g className="dgm-resolve">
                <circle className="dgm-ring" cx={JOIN.at[0]} cy={JOIN.at[1]} r="10" />
                <circle className="dgm-ring is-late" cx={JOIN.at[0]} cy={JOIN.at[1]} r="10" />
              </g>
            ) : null}
          </g>

          {/* The ground the three peers share, and the reach each one carries.
              The reaches grow with coverage until they overlap - that overlap is
              the network effect, drawn rather than claimed - and they are three
              sizes, because the site that has contributed most reaches furthest. */}
          <g transform={planSpace(310, 468)}>
            <rect className="dgm-plane" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" fill="url(#nc-grain)" />
            <g clipPath="url(#nc-ground)">
              {SITES.map((site) => {
                const span = Math.round(state.reach * site.grew)
                return (
                  <g className={`dgm-reach${lit(site.id)}`} key={site.id} style={{ '--stagger': site.stagger, '--life': site.life }}>
                    <rect className="dgm-reachfill" x={site.plan[0] - span} y={site.plan[1] - span} width={span * 2} height={span * 2} rx={Math.round(span * 0.18)} fill="url(#nc-reach)" />
                    <rect className="dgm-reachrim" x={site.plan[0] - span} y={site.plan[1] - span} width={span * 2} height={span * 2} rx={Math.round(span * 0.18)} vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
            </g>
            {/* Last, so three overlapping fields never soften the one edge that
                says where the shared ground stops. */}
            <rect className="dgm-planeedge" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" vectorEffect="non-scaling-stroke" />
          </g>

          {/* Sites, back to front. The same solid Trident stands its decks on:
              the skirt is the boundary, ruled along its own footing, and no line
              in the figure ever crosses it. */}
          {SITES.map((site) => (
            <g
              className={`dgm-site${lit(site.id)}`}
              key={site.id}
              style={{ '--stagger': site.stagger, '--life': site.life, '--run': `${site.run}px` }}
              {...probe(site.id)}
            >
              <Faces shape={site.solid} className="dgm-solid" />
              {/* Stencilled on the wall, along it, the way a number is put on
                  the side of the thing it belongs to. */}
              <text
                className="dgm-wallmark"
                x={site.mark[0]}
                y={site.mark[1]}
                textAnchor="middle"
                transform={`rotate(${-EDGE_ANGLE} ${site.mark[0]} ${site.mark[1]})`}
              >
                {site.id}
              </text>
              <g transform={planSpace(site.cx, site.cy)}>
                <rect className="dgm-wall" x={-site.half + 5} y={-site.half + 5} width={(site.half - 5) * 2} height={(site.half - 5) * 2} rx={Math.round(site.half * 0.26)} vectorEffect="non-scaling-stroke" />
                <rect className="dgm-wall is-inner" x={-site.half + 9} y={-site.half + 9} width={(site.half - 9) * 2} height={(site.half - 9) * 2} rx={Math.round(site.half * 0.2)} vectorEffect="non-scaling-stroke" />
                {site.rows.map((row) => (
                  <rect className="dgm-record" key={row.y} x={-row.half} y={row.y - 3.5} width={row.half * 2} height="7" rx="3" />
                ))}
                <rect className="dgm-lid" x={-site.lid} y={-site.lid} width={site.lid * 2} height={site.lid * 2} rx={Math.round(site.lid * 0.28)} vectorEffect="non-scaling-stroke" />
                <rect className="dgm-sweep" x={-site.lid + 7} y={-site.lid + 7} width="6" height={(site.lid - 7) * 2} rx="3" />
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

          {/* Identities, each on the side of the sheet its site owns. */}
          {SITES.map((site) => (
            <Ident key={`id-${site.id}`} site={site} lit={lit(site.id)} probe={probe(site.id)} />
          ))}

          <line className="dgm-rule" x1="20" y1="648" x2="600" y2="648" />
          <rect className="dgm-status" x="20" y="660" width="130" height="26" rx="13" />
          <text className="dgm-statustext" x="85" y="677" textAnchor="middle">{pill}</text>
          <text className="dgm-read" x="164" y="677">{read}</text>
        </svg>
      </div>
    </figure>
  )
}

import { useState } from 'react'

import { EDGE_ANGLE, jitter, planPrism, planSpace, project, roundedDeck } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollRun } from './useScrollPhase'

/**
 * Nectar - what a site lets out, and what it takes back.
 *
 * Trident is one site seen in section: decks piled on one plan, arriving closed
 * and opening out. Nectar is a federation seen in plan - two slabs, one held
 * above the other. Below: three peer sites standing on one ground, each inside
 * its own reach. Above: the shared library, a slab with a thickness to it, and
 * on that slab a mesh of criteria - so coverage is the part of it that has lit
 * up rather than a number in a box.
 *
 * A site is the same kind of object as a Trident deck - a rounded plan square,
 * extruded, drawn by the same component. The three are deliberately not the
 * same object: the plan size of each, the height of its wall and the number of
 * bands inside it all come from how many records it holds, and its reach grows
 * in proportion. A reader can tell the three apart with every label removed.
 *
 * Two things travel here and one thing never does. Structure goes up: a site
 * runs the task on its own records and publishes the definition it used. And
 * structure comes back down: once a definition binds, any site can take it and
 * run it. That second direction is the whole product - a library nobody can
 * read back out of is a filing cabinet - and the figure used to assert it in a
 * caption while drawing three arrows that all pointed the same way.
 *
 * What never travels is a record. The records sit under a sealed lid inside
 * each wall, the local run sweeps across them without ever leaving, and nothing
 * that crosses a channel in either direction is anything but a definition. The
 * claim was never that the site is one-way. It is that the record is nowhere.
 *
 * Binding is elevation, and a criterion is a plate rather than a dot. Unbound,
 * it lies flat on the slab; one the library has bound is standing on that same
 * footprint with two side faces under it, as high as it is connected - so
 * coverage compounding is a skyline growing, the hubs are the tall buildings,
 * and the weight of the library is visible without a legend. The mesh
 * underneath stays printed on the slab, because that lattice is the index and
 * the solids are what the index is holding.
 *
 * Nothing here is nailed down. The library drifts on one slow clock and drops
 * its shade on the federation below it; each site orbits its own footprint on
 * a clock of its own - a true plan circle carried through the projection, so
 * the three of them move in the ground rather than bobbing in the air; traffic
 * runs the mesh; criteria the library already holds keep ringing out through
 * their neighbours. All of it on timings scattered by `jitter`, so the drawing
 * never falls into a loop a reader can catch.
 *
 * Two of those layers are the quiet ones, and they are the ones that make the
 * upper plane read as a place rather than a chart. Every criterion standing on
 * the slab settles on its own long clock, half a pixel at a time, so forty-two
 * solids breathe out of step the way a skyline does; and a channel with no
 * definition crossing it still creeps its dashes toward the library, because a
 * site that is not publishing this second is still reporting. Both are the same
 * two layers the other figure carries, at the two scales the pair works at.
 *
 * The panel takes a pointer as a panel, over a target the size of the slab: a
 * two-pixel node is not something to aim at. Leaning on anything here loads a
 * mechanism rather than re-timing one - a second mark on a run, a second head
 * across a site's records - because changing the rate of a clock teleports
 * whatever it was carrying, which is exactly the jolt a reader feels as jank.
 * None of it starts until the figure has power: every ambient clock is held at
 * zero opacity until `--charge` comes up.
 *
 * Boundary behaviour only, no internals (ADR-0001).
 */

const MESH_Y = 200
const MESH = project(310, MESH_Y)

// The library is a slab, not a sheet. It used to be one rounded rect with a
// hairline round it, which put the two planes of this figure in the same
// register as the dot field behind them - drawn on the page rather than held
// over it. Extruded, it is the same object every deck and every site in both
// drawings is, at the scale of the thing they all publish into.
const LIB_HALF = 160
const LIB_WALL = 13
const LIBRARY = roundedDeck(310, MESH_Y, LIB_HALF, LIB_WALL, 28)

// A criterion is a plate standing on the slab, and how high it stands is how
// many other criteria it is tied to. That is the one thing about a library
// worth drawing in three dimensions: a hub is not a differently coloured dot,
// it is a taller building, and a reader who has never been told what the mesh
// is can still see where its weight sits. Five to fifteen pixels against
// fourteen of vertical node spacing - enough that the slab grows a skyline, not
// so much that a tall one reaches the row behind it.
const CRIT_HALF = 7
const CRIT_RADIUS = 2.5
const CRIT_LOW = 5
const CRIT_SPAN = 10

// One number for the ground, used by the plane and by everything standing on
// it, so the two can never drift apart. They had: the plane was drawn at 468
// and the sites were projected from 462, which put every base below the plane
// it was supposed to be standing on and left each solid sunk through the middle
// of its own reach instead of centred in it.
const GROUND_Y = 468
const GROUND = project(310, GROUND_Y)

const GROUND_HALF = 172

// A jittered plan lattice so the library reads as a body of knowledge and not a
// spreadsheet - the scatter is deterministic, not random, so the same mesh is
// drawn on every render and in every test.
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
// is the difference between a lattice a reader believes and a row of dots. The
// mesh stays printed on the slab while the criteria rise off it, because the
// lattice is the index and the towers are what the index is holding.
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

// How high each criterion stands: its own degree in the mesh, normalised. The
// solid is built once per node here rather than per render, because its shape
// never changes - only whether it is standing or lying flat.
const DEGREE = NODES.map(() => 0)
LINKS.forEach((link) => { DEGREE[link.a] += 1; DEGREE[link.b] += 1 })
const BUSIEST = Math.max(...DEGREE)
NODES.forEach((node) => {
  const depth = CRIT_LOW + Math.round((DEGREE[node.index] / BUSIEST) * CRIT_SPAN)
  node.depth = depth
  node.block = planPrism(node.x, node.y, CRIT_HALF, CRIT_HALF, depth, CRIT_RADIUS)
  // Where the top of this one sits on screen, for anything that has to arrive
  // at the criterion rather than at the slab it is standing on.
  node.up = [node.at[0], Math.round((node.at[1] - depth) * 10) / 10]
})

// Back to front on screen, so a criterion standing in front of another occludes
// it rather than being drawn under it. Forty-two solids on one plane in reading
// order is a pile; in depth order it is a place.
const MASSING = [...NODES].sort((a, b) => a.at[1] - b.at[1])

// Traffic. Marks running their own links on their own clocks, so the library
// reads as something in use rather than a diagram of one. They are picked by a
// stable seed, never by position, so the same ones run every time.
const TRAFFIC = LINKS.filter((link) => link.life > 0.88).slice(0, 14)

// The library resolves against itself, not only when a site has just published.
// A handful of criteria it already holds ring out through their neighbours on
// long clocks, so the upper plane is a panel that is thinking rather than a
// lattice waiting for the next phase to light part of it. They are taken from
// the first thirty ranks, which are bound in every phase of the run, and picked
// by a stable seed so the same ones ring on every render.
const PULSE = ORDER.slice(0, 30).filter((node) => node.life > 0.72).slice(0, 4)

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
  // Where this site's plan origin meets the ground the three of them share. The
  // solid is drawn one wall above that, because `roundedDeck` builds a roof and
  // extrudes downwards - so the base lands on the plane and the site stands
  // centred inside its own reach rather than sunk through it.
  const [cx, base] = GROUND(...site.plan)
  const cy = base - site.wall
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

// The mast. A short post standing on the far corner of a site's own roof, with
// a head on top, and the channel to the library leaves from that head.
//
// It is not decoration. A line springing out of the corner of a solid is a line
// touching a silhouette, and the moment either end moves - and both ends move
// here, the site on its orbit and the library on its drift - it parts from the
// thing it was supposed to be attached to. A head wide enough to swallow the
// foot of the channel is what makes the join survive the motion, which is the
// same repair the plate leaders in Trident needed and for the same reason.
const MAST = 17
const MAST_HEAD = 7.5

// What each site publishes, where it lands, and the channel it keeps open to
// that part of the library. The three landing nodes have to come from the rank
// band the run credits, so a chip always arrives at a node that is lighting up -
// and they have to be spread across the library rather than clustered, because
// three definitions landing in one corner of the mesh is not what compounding
// coverage looks like. So: take the band, sort it by where it lands on screen,
// and give each site its own third of the library.
const BAND = [...ORDER.slice(30, 38)].sort((a, b) => (a.x - a.y) - (b.x - b.y))
const JOIN = BAND[Math.floor(BAND.length / 2)]
const CHANNELS = [
  { key: 'SITE 018', site: SITE_018, node: JOIN, bow: -1, label: 'CRITERION I-4.2' },
  { key: 'SITE 042', site: SITE_042, node: BAND[BAND.length - 1], bow: 1, label: 'UNIT mg/m2' },
  { key: 'SITE 103', site: SITE_103, node: BAND[0], bow: -1, label: 'MAP LOINC 718-7' },
].map((item) => {
  const foot = item.site.solid.back
  const [x1, y1] = [foot[0], Math.round((foot[1] - MAST) * 10) / 10]
  const [x2, y2] = item.node.at
  // Bow the arc off the chord rather than lifting it straight up, so a site
  // sitting under its own node still gets a curve instead of a plumb line.
  const span = Math.hypot(x2 - x1, y2 - y1) || 1
  const cx = Math.round((x1 + x2) / 2 - ((y2 - y1) / span) * 52 * item.bow)
  const cy = Math.round((y1 + y2) / 2 + ((x2 - x1) / span) * 52 * item.bow - 34)
  return {
    ...item,
    foot,
    head: [x1, y1],
    path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
    // The midpoint of a quadratic, where the label rides.
    mid: [Math.round(0.25 * x1 + 0.5 * cx + 0.25 * x2), Math.round(0.25 * y1 + 0.5 * cy + 0.25 * y2)],
  }
})

const BY_SITE = Object.fromEntries(CHANNELS.map((item) => [item.key, item]))

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
//
// `up` is who is publishing and `down` is who is running something the library
// has bound. A site can be both at once, which is the steady state of a
// federation and the frame this run rests on.
const PHASES = [
  { span: 2.2, bound: 30, reach: 78, up: [], down: [], joined: false, tone: 'run', status: 'LOCAL', read: 'Every site runs the task on its own records. Nothing has moved.' },
  { span: 1.6, bound: 30, reach: 86, up: ['SITE 018'], down: [], joined: false, tone: 'pass', status: 'PUBLISHING', read: 'Site 018 publishes the structure it used - a definition, with no values in it.' },
  { span: 1.4, bound: 34, reach: 98, up: ['SITE 018'], down: [], joined: true, tone: 'valid', status: 'LINKED', read: `It binds, and links to ${JOINED.size} criteria the library already held.` },
  { span: 2.2, bound: 38, reach: 124, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'COMPOUNDING', read: 'Sites 042 and 103 take the definition down and run it on records of their own.' },
  { span: 2.4, bound: 38, reach: 124, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'STEADY', read: 'Structure crosses. Records do not.' },
]

// Pointing at a site hands it the whole readout - the word in the pill, the
// colour of the pill and the line beside it - and what it says is what that
// site did, not how many rows it happens to be sitting on. Otherwise the run
// narrates itself.
const READS = {
  'SITE 042': { tone: 'pass', pill: 'PUBLISHER', read: 'Site 042 published the unit it measures in - the scale, not one reading taken on it.' },
  'SITE 103': { tone: 'pass', pill: 'MAPPER', read: 'Site 103 sent a mapping between two vocabularies. No patient is in a mapping.' },
  'SITE 018': { tone: 'valid', pill: 'ORIGIN', read: 'Site 018 wrote the definition the other two picked up, and sent nothing else to do it.' },
  library: { tone: 'valid', pill: 'LIBRARY', read: 'Every criterion here came up from a site, and any site can take one back down.' },
}

// A shade is stepped rather than blurred, and the steps are a share of the
// caster's own size rather than a fixed inset, so the same three numbers hold
// for a 76-unit deck in Trident and a 160-unit slab here.
const SEAT_STEPS = [0.1, 0.26, 0.42]

/**
 * The shade the library drops on the federation under it. Two planes held
 * apart need something between them saying so, and in a drawing with no light
 * source that something is occlusion: the ground is darker where the slab is
 * over it. Stepped rather than blurred, and inset rather than cast at full
 * size, because a shade the size of its own caster covers the whole receiver
 * and reads as dirt on the plane instead of height above it.
 */
function Seat({ half, radius, cy, kind }) {
  return (
    <g className={`dgm-seat is-${kind}`}>
      <g transform={planSpace(310, cy)}>
        {SEAT_STEPS.map((fraction) => {
          const inset = Math.round(half * fraction)
          return <rect className="dgm-seatstep" key={fraction} x={-half + inset} y={-half + inset} width={(half - inset) * 2} height={(half - inset) * 2} rx={radius} />
        })}
      </g>
    </g>
  )
}

/**
 * What a site holds and what leaves it, set on whichever side of the sheet that
 * site owns. The two outliers hang theirs off a real edge of the solid; the
 * near one carries its own under the plan, where there is room for it.
 *
 * The name is not here any more - it is lettered on the site's own wall, so the
 * margin is left carrying the two facts, which is all a margin was ever good
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
      {/* A count, not a slogan. `EGRESS NONE` was a policy word for a figure
          that now has traffic running both ways over it, and the thing worth
          saying is the number: of the records this site holds, none moves. Two
          mono values under each other, which is what the margin is for. */}
      <text className="dgm-sidefact is-quiet" x={x} y={top + 12} textAnchor={align}>0 LEAVE</text>
    </g>
  )
}

export default function NectarSchematic({ animate = true, reduced = false }) {
  const frame = useCenterOnOverflow()
  const [figure, phase, booted] = useScrollRun(PHASES, { reduced })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const joinUp = JOIN.rank < state.bound

  // Pointing at a site lifts it and lights the structure it has published.
  // Hover only re-weights what is already drawn.
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
          className={`dgm-svg is-${tone}${animate ? ' is-live' : ''}${booted ? ' is-booted' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three peer sites of three different sizes stand well apart on one ground, beneath a shared execution library drawn as a slab held above them with a mesh of criteria on it. Each site runs its task locally and sends the structure it used up a channel from a mast on its own roof - a criterion from one, a unit from another, a mapping from the third. A criterion the library binds stands up off the slab, and any site can take a bound definition back down its channel and run it. Structure crosses in both directions and no record crosses in either: the records inside every site stay under a sealed lid, and the reach of each site grows until they overlap."
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

          {/* The library, and the mesh that lives on it, drawn as one panel. It
              is a slab rather than a sheet, it drifts as one, and it answers a
              pointer as one - over a target the size of the whole plane, because
              a two-pixel node is not something a reader can aim at. */}
          <g className={`dgm-library${lit('library')}`} {...probe('library')}>
            <Faces shape={LIBRARY} className="dgm-solid" />
            <g transform={planSpace(310, MESH_Y)}>
              <rect className="dgm-planefill" x="-160" y="-160" width="320" height="320" rx="28" fill="url(#nc-grain)" />
              <rect className="dgm-hit" x="-160" y="-160" width="320" height="320" rx="28" />
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
                  to it. Leaning on the panel puts a second mark on every run. */}
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
              {/* Binding is elevation, and a criterion is a plate rather than a
                  dot. One the library has not bound is its own footprint lying
                  flat on the slab; one it has is standing on that footprint with
                  two side faces under it, as high as it is connected. So the
                  slab grows a skyline with a shape to it - the hubs are the tall
                  buildings - and coverage compounding is a thing a reader
                  watches happen rather than dots changing colour.

                  Drawn back to front, so a criterion standing in front of
                  another occludes it the way the decks in the other figure do.
                  Sorting on screen y is what makes forty-two solids on one plane
                  read as a place instead of as a pile. */}
              <g transform={planSpace(310, MESH_Y)}>
                {MASSING.map((node) => {
                  const bound = node.rank < state.bound
                  return (
                    <g
                      className={`dgm-crit${bound ? ' is-bound' : ''}${node.rank === JOIN.rank && state.joined ? ' is-new' : ''}`}
                      key={node.index}
                      style={{ '--stagger': Math.round((node.rank / TOTAL) * 100) / 100, '--life': node.life, '--lift': `${node.block.step}px` }}
                    >
                      <path className="dgm-face-left" d={node.block.faceLeft} />
                      <path className="dgm-face-right" d={node.block.faceRight} />
                      <polygon className="dgm-node" points={node.block.base} />
                    </g>
                  )
                })}
              </g>
              {/* The library settling on its own. Criteria it already holds keep
                  resolving against their neighbours, so the panel is thinking
                  between phases rather than only when a site arrives. Each rings
                  at the roof height of the criterion it belongs to, in the air
                  over the index rather than flat on it. */}
              {PULSE.map((node) => (
                <circle
                  className="dgm-pulse"
                  key={`p-${node.index}`}
                  style={{ '--life': node.life }}
                  cx={node.up[0]}
                  cy={node.up[1]}
                  r="9"
                />
              ))}
              {/* A definition that binds does not just light up - it propagates.
                  The ring is the library resolving against what it already held,
                  which is the one thing in this figure that has to look like
                  thinking rather than like storage. It rides the node it came
                  from, so it rings at the height that node is standing at. */}
              {state.joined ? (
                <g className={`dgm-resolve${joinUp ? ' is-up' : ''}`} style={{ '--rise': `${JOIN.depth}px` }}>
                  <circle className="dgm-ring" cx={JOIN.at[0]} cy={JOIN.at[1]} r="10" />
                  <circle className="dgm-ring is-late" cx={JOIN.at[0]} cy={JOIN.at[1]} r="10" />
                </g>
              ) : null}
            </g>
          </g>

          {/* The ground the three peers share, and the reach each one carries.
              The reaches grow with coverage until they overlap - that overlap is
              the network effect, drawn rather than claimed - and they are three
              sizes, because the site that has contributed most reaches furthest.
              Each one orbits with the site it belongs to, so a site never drifts
              inside its own coverage. */}
          <g transform={planSpace(310, GROUND_Y)}>
            <rect className="dgm-plane" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" vectorEffect="non-scaling-stroke" />
            <rect className="dgm-planefill" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" fill="url(#nc-grain)" />
          </g>

          {/* The slab's own shade on the federation, breathing with the drift
              that casts it. This is the whole of what makes the upper plane read
              as held above the ground rather than printed further up the page -
              and it goes on the bare plane, under the reaches, because a shade
              laid over three overlapping coverage fields mutes the one thing in
              this figure that is a claim made by geometry alone. */}
          <Seat half={LIB_HALF} radius={28} cy={GROUND_Y} kind="library" />

          <g transform={planSpace(310, GROUND_Y)}>
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

          {/* The channels, drawn before the sites so every foot ends up under
              the mast head it belongs to. Each one is a standing route that is
              always there, the arc filling in when that site publishes, and two
              marks running it in opposite directions on separate clocks.

              Both directions carry structure and neither carries a record.
              Drawing only the rising half was the figure asserting in a caption
              what it would not draw: a library nobody can take anything out of
              is a filing cabinet, and the phase that says two sites picked the
              definition up showed nothing at all coming down. */}
          {CHANNELS.map((item) => {
            const up = state.up.includes(item.key)
            const down = state.down.includes(item.key)
            return (
              <g
                className={`dgm-lift${up ? ' is-up' : ''}${down ? ' is-down' : ''}${lit(item.key)}`}
                key={item.key}
                style={{ '--life': item.site.life }}
              >
                <path className="dgm-channel" d={item.path} />
                <path className="dgm-liftpath" d={item.path} pathLength="100" />
                <path className="dgm-rise" d={item.path} pathLength="100" />
                <path className="dgm-fall" d={item.path} pathLength="100" />
                <circle className="dgm-liftchip" cx={item.node.at[0]} cy={item.node.at[1]} r="7" />
              </g>
            )
          })}

          {/* Sites, back to front. The same solid Trident stands its decks on:
              the skirt is the boundary, ruled along its own footing, and no line
              in the figure ever crosses it.

              Each one orbits its own footprint inside `dgm-orbit`, so the hover
              lift on the site itself still composes with the drift instead of
              replacing it - two groups, two transforms, and neither one has to
              know about the other. */}
          {SITES.map((site) => {
            const chan = BY_SITE[site.id]
            return (
              <g
                className={`dgm-site${state.down.includes(site.id) ? ' is-running' : ''}${lit(site.id)}`}
                key={site.id}
                style={{ '--stagger': site.stagger, '--life': site.life, '--run': `${site.run}px` }}
                {...probe(site.id)}
              >
                <g className="dgm-orbit">
                  <Faces shape={site.solid} className="dgm-solid" />
                  {/* Stencilled on the wall, along it, the way a number is put
                      on the side of the thing it belongs to. */}
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
                    {/* The second head. It runs when this site has taken a
                        definition down and is running it, and it runs while a
                        reader is leaning on the site - because both are the same
                        statement, that there is more work crossing these records
                        than there was. Without it a definition arriving down a
                        channel lands on a mast and stops, which is the same
                        thing the figure was already criticised for doing in the
                        other direction.

                        A second head, never a faster one. Re-timing a running
                        clock teleports whatever it was carrying, which is the
                        jolt a reader feels the moment their cursor arrives - so
                        the run keeps its rate and simply carries more. */}
                    <g className="dgm-second">
                      <rect className="dgm-sweep is-again" x={-site.lid + 7} y={-site.lid + 7} width="6" height={(site.lid - 7) * 2} rx="3" />
                    </g>
                  </g>
                  {/* The mast, and the head the channel leaves from. */}
                  <line className="dgm-mast" x1={chan.foot[0]} y1={chan.foot[1]} x2={chan.head[0]} y2={chan.head[1]} />
                  <circle className="dgm-masthead" cx={chan.head[0]} cy={chan.head[1]} r={MAST_HEAD} />
                </g>
              </g>
            )
          })}

          {/* What a channel is carrying, when it is carrying it. Drawn last so a
              tag is never lost behind the slab it crosses - and small, because
              three filled pills parked in mid-air were the least drafted thing
              in either figure. */}
          {CHANNELS.map((item) => (
            <g className={`dgm-ticket${state.up.includes(item.key) ? ' is-up' : ''}${lit(item.key)}`} key={`tag-${item.key}`}>
              <g className="dgm-carry">
                <rect className="dgm-tagbody" x={item.mid[0] - 48} y={item.mid[1] - 9.5} width="96" height="19" rx="9.5" />
                <text className="dgm-tagtext" x={item.mid[0]} y={item.mid[1] + 3.4} textAnchor="middle">{item.label}</text>
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

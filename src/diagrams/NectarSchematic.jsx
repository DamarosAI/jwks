import { useState } from 'react'

import { EDGE_ANGLE, ISO_X, ISO_Y, jitter, planCyl, planPrism, planSpace, project, roundedDeck } from './iso'
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
 * on that slab a board of definitions - so coverage is the part of it that has
 * lit up rather than a number in a box.
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
 * Binding is elevation, and a definition is a solid rather than a dot. Unbound,
 * it lies flat on the slab; one the library has bound is standing on that same
 * footprint with its sides under it, as high as it is connected - so coverage
 * compounding is a skyline growing, the hubs are the tall buildings, and the
 * weight of the library is visible without a legend. The index underneath stays
 * printed on the slab, because that lattice is the index and the solids are
 * what the index is holding.
 *
 * THE SLAB IS A BOARD, AND THAT IS THE WHOLE OF WHAT MAKES IT A LIBRARY.
 *
 * It was one jittered lattice across the whole plane: forty-two solids in three
 * state colours and two shapes, positioned by a bricked grid with the grid
 * beaten out of it. Every one of those decisions was defensible and the sum was
 * a heap. A reader could see that the library held a lot of things and could not
 * see that it held KINDS of thing, which is the entire difference between a
 * library and a pile.
 *
 * Four districts now - criteria, units, mappings, endpoints - one to each corner
 * of the plan square, each in its own ink and built as its own solid: a block, a
 * drum, a bar, a post. Colour, shape and place say the same thing three times
 * over, so none of them has to be learned, and there is no legend anywhere on
 * this sheet. Each district letters itself on the slab it is part of.
 *
 * Inside a district the index is a mesh, because everything in it is the same
 * kind of thing and the ties are dense and short. Between districts nothing is
 * dense, so nothing between them is a mesh: a bus runs round the four, four taps
 * meet a junction at the middle of the slab, and every one of those runs lies on
 * a plan axis - the same two directions every skirt and every wall marking in
 * both figures already runs at, which is what puts a run on the board rather
 * than over it.
 *
 * Nothing here is nailed down, and none of it is scattered either. The library
 * drifts on one slow clock and drops its shade on the federation below it; each
 * site orbits its own footprint on a clock of its own - a true plan circle
 * carried through the projection, so the three of them move in the ground
 * rather than bobbing in the air.
 *
 * On the slab itself there is exactly one clock, and every solid standing on it
 * reads that clock at a phase taken from where it is standing. The floor rises
 * and settles as a single wave crossing it, and the lamps brighten and dim as a
 * second, slower one. That is the whole of the motion up there.
 *
 * It used to be the opposite: forty-two lamps switching on forty-two
 * incommensurable clocks, forty-two solids wandering two plan units on
 * forty-two more, twelve marks flying along twelve different links, four
 * expanding rings and a fifth pair on top of them. Every one of those was
 * defensible on its own and the sum was noise - a floor where nothing was ever
 * still and nothing was ever together, which is what a reader means by busy.
 * One wave says the same thing (a working floor, not a diagram of one) and says
 * it as a system rather than as forty-two accidents.
 *
 * A channel with no definition crossing it still creeps its dashes toward the
 * library, because a site that is not publishing this second is still
 * reporting - the same quiet layer the other figure runs on its idle tines, at
 * the scale this drawing works at.
 *
 * A channel also stops at the rim, and that is the one repair in this figure
 * that is geometry rather than styling. An arc ending on the slab's top face has
 * to cross the near skirt to get there, and in an axonometric the band just
 * outside a near edge is the same band the near face occupies - so the eye reads
 * the whole run as a wire laid over a photograph. Instead each one lands on the
 * underside rim, arriving along one of the drawing's own plan axes, climbs the
 * skirt to the rim above it, and a run on the board carries the definition the
 * rest of the way in - to a pad on the district that kind of definition belongs
 * to, drawn among the mesh, so every solid taller than it passes in front. That
 * last part is the move no arc in screen space can make, and it is what puts the
 * leg on the slab rather than above it.
 *
 * Nothing is built where a route arrives, and nothing is written on it. There
 * were three prisms on the rim once, then three dots, and three filled pills
 * riding the channels saying CRITERION, UNIT and MAP - all of them furniture
 * answering a question the board now answers by having places on it. A route
 * arrives in a lettered district. That is what crossed and where it went.
 *
 * Nothing on the route is a line. The standing route is a run of dots, and what
 * travels it is a packet of three or four more, so an exchange between a site
 * and the library is a signal rather than a pipe with something sliding down
 * it. Three solid arcs across the middle of the sheet were the heaviest ink in
 * the drawing and said the wrong thing besides: a federation is not plumbed
 * together, it is in contact.
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

// A definition is a solid standing on the slab, and how high it stands is how
// many others of its own kind it is tied to. That is the one thing about a
// library worth drawing in three dimensions: a hub is not a differently
// coloured dot, it is a taller building, and a reader who has never been told
// what the index is can still see where its weight sits. The footprint and the
// floor of that range come from the kind - see `KINDS` below - so a post is
// always the tallest thing on the board and a bar is always the flattest.

// One number for the ground, used by the plane and by everything standing on
// it, so the two can never drift apart. They had: the plane was drawn at 468
// and the sites were projected from 462, which put every base below the plane
// it was supposed to be standing on and left each solid sunk through the middle
// of its own reach instead of centred in it.
const GROUND_Y = 468
const GROUND = project(310, GROUND_Y)

const GROUND_HALF = 172

// FOUR DISTRICTS, AND WHY THE FLOOR IS NOT SCATTERED ANY MORE.
//
// It was one jittered lattice across the whole slab: forty-two solids in three
// state colours and two shapes, positioned by a bricked grid with the grid
// beaten out of it. Every one of those decisions was defensible and the sum was
// a heap. A reader looking at it could see that the library held a lot of
// things and could not see that it held KINDS of thing - which is the entire
// difference between a library and a pile, and the one claim this panel exists
// to make.
//
// So the floor is districted. Four kinds of definition, each with a quarter of
// the slab to itself, each drawn in its own ink and built as its own solid:
//
//   CRITERIA    what a study will accept - a block, in the house blue
//   UNITS       the scales a reading is taken on - a drum, green
//   MAPPINGS    one vocabulary carried into another - a bar, violet
//   ENDPOINTS   what a study is measuring - a post, amber
//
// Colour, shape and place all say the same thing, three times, so none of them
// has to be learned from a legend - and there is no legend anywhere on this
// sheet. A reader who never reads a word of it can still see four kinds.
//
// The four sit at the four corners of the plan square, which in this projection
// is a diamond on screen: one district at the front, one at each side, one at
// the back. That is what puts each of the three sites under the district it
// publishes into - the site on the front corner feeds CRITERIA, the one on the
// right feeds UNITS, the one on the left feeds MAPPINGS - so a route is short,
// lands somewhere named, and never crosses another.
//
// The three tickets that used to float over the middle of this figure saying
// CRITERION I-4.2, UNIT mg/m2 and MAP LOINC 718-7 are gone with them. They were
// three filled pills parked in mid-air over the one plane that was supposed to
// read as held above the ground, and every word on them is now a place on the
// board instead of a caption over it.
//
// `mark` is where the district letters itself: sixty-four plan units out from
// its own centre, which clears the ring round the cluster, on the side that
// faces the wide middle of the slab rather than the corner behind it. The slab
// is a diamond on screen and its two tips are narrow, so a name set straight
// outboard of the front or back district runs off the sheet - each one is turned
// a quarter of the way round the diamond instead, which puts all four in the
// widest band the board has and none of them over a cluster or a run.
const DISTRICTS = [
  { key: 'CRITERIA', at: [84, 84], mark: [-16, 62], tone: 'is-blue', kind: 'block', count: 11, spread: 47 },
  { key: 'UNITS', at: [84, -84], mark: [62, 16], tone: 'is-green', kind: 'drum', count: 10, spread: 45 },
  { key: 'MAPPINGS', at: [-84, 84], mark: [-62, -16], tone: 'is-violet', kind: 'bar', count: 10, spread: 45 },
  { key: 'ENDPOINTS', at: [-84, -84], mark: [16, -62], tone: 'is-amber', kind: 'post', count: 11, spread: 47 },
]

// What each kind of definition is built as. A criterion is a block, a unit is a
// drum, a mapping is a bar - because a mapping is one thing carried into
// another and a bar is the only footprint here with a direction - and an
// endpoint is a post, the narrowest and tallest of the four.
//
// Half-sizes in plan, and a base storey. How high a solid actually stands is
// still its own degree in the district's index, so the tall ones are the hubs;
// the kind sets the footprint and the floor of that range.
const KINDS = {
  block: { halfX: 8, halfY: 8, radius: 3, low: 5, span: 9 },
  drum: { halfX: 7, halfY: 7, radius: 7, low: 5, span: 9 },
  bar: { halfX: 11, halfY: 4.5, radius: 2, low: 4, span: 7 },
  post: { halfX: 5, halfY: 5, radius: 1.6, low: 8, span: 12 },
}

// Where the members of a district stand. A phyllotactic disc - the arrangement a
// sunflower head uses - because it fills a circle evenly at every count without
// a grid in it and without a random source: the radius is the square root of the
// rank and the angle steps by the golden angle, so no two members ever line up
// and the density is the same at the rim as at the middle.
//
// A grid inside a cluster would have been a table with a circle drawn round it;
// scatter would have put two solids on top of each other. This is the one
// construction that gives a group of things a shape a reader recognises as a
// group.
const GOLDEN = 137.507764

const NODES = []
DISTRICTS.forEach((district, band) => {
  for (let member = 0; member < district.count; member += 1) {
    const index = NODES.length
    const radius = district.spread * Math.sqrt((member + 0.55) / district.count)
    const angle = ((member * GOLDEN + band * 41) * Math.PI) / 180
    const x = Math.round(district.at[0] + Math.cos(angle) * radius)
    const y = Math.round(district.at[1] + Math.sin(angle) * radius)
    NODES.push({
      index,
      band,
      district,
      x,
      y,
      at: MESH(x, y),
      seed: jitter(index, 7),
      tone: district.tone,
      kind: district.kind,
    })
  }
})

// The wave, solved over the floor that was actually built. `--wave` is where a
// solid sits along the plan diagonal, normalised - which in this projection is
// simply how far down the screen it is, because screen y depends on (x + y) and
// nothing else. Every animation on this floor is one keyframe read at a delay of
// -wave * period, so the back and the front are at opposite phases and
// everything between them is in order. Nought and one land a whole period apart,
// which is the same phase, so the wave wraps with no seam in it.
const WAVE_LOW = Math.min(...NODES.map((node) => node.x + node.y))
const WAVE_SPAN = Math.max(...NODES.map((node) => node.x + node.y)) - WAVE_LOW
NODES.forEach((node) => {
  node.wave = Math.round(((node.x + node.y - WAVE_LOW) / WAVE_SPAN) * 100) / 100
})

// Coverage does not grow in reading order - it grows wherever a site happens to
// contribute, so the library fills in unevenly the way a real one does.
const ORDER = [...NODES].sort((a, b) => a.seed - b.seed)
ORDER.forEach((node, rank) => { node.rank = rank })
const TOTAL = NODES.length

// The index inside a district. A definition is tied to its neighbours in its own
// kind - a criterion to other criteria, a unit to other units - so the mesh is
// local and dense rather than one lattice smeared across the whole slab. What
// crosses between kinds is not a mesh link; it is a routed trace, and it is
// drawn as one.
const LINKS = []
for (let a = 0; a < NODES.length; a += 1) {
  for (let b = a + 1; b < NODES.length; b += 1) {
    if (NODES[a].band !== NODES[b].band) continue
    const dx = NODES[a].x - NODES[b].x
    const dy = NODES[a].y - NODES[b].y
    if (dx * dx + dy * dy > 34 * 34) continue
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

// How high each one stands: its own degree inside its district, normalised
// against the busiest thing on the floor. The solid is built once per node here
// rather than per render, because its shape never changes - only whether it is
// standing or lying flat.
const DEGREE = NODES.map(() => 0)
LINKS.forEach((link) => { DEGREE[link.a] += 1; DEGREE[link.b] += 1 })
const BUSIEST = Math.max(...DEGREE, 1)
NODES.forEach((node) => {
  const shape = KINDS[node.kind]
  const depth = shape.low + Math.round((DEGREE[node.index] / BUSIEST) * shape.span)
  node.depth = depth
  // A drum is the same solid as a block built on a circle instead of a square:
  // same footprint, same storey, same extrusion solved the same way, so the
  // floor carries four kinds of thing as one population rather than as four
  // symbol sets.
  node.round = node.kind === 'drum'
  node.block = node.round
    ? planCyl(node.x, node.y, shape.halfX, depth)
    : planPrism(node.x, node.y, shape.halfX, shape.halfY, depth, shape.radius)
  // Where the top of this one sits on screen, for anything that has to arrive
  // at the definition rather than at the slab it is standing on.
  node.up = [node.at[0], Math.round((node.at[1] - depth) * 10) / 10]
})

const BY_BAND = DISTRICTS.map((district, band) => ({
  ...district,
  band,
  members: NODES.filter((node) => node.band === band),
  // The busiest member of a district is its hub, and it is where a route into
  // that district ends up - a definition arriving joins the part of its own kind
  // that is already carrying the most.
  hub: NODES.filter((node) => node.band === band)
    .reduce((best, node) => (DEGREE[node.index] > DEGREE[best.index] ? node : best)),
}))

// THE BUS. What crosses between two kinds of definition, and how it is drawn.
//
// Inside a district the index is a mesh, because everything in it is the same
// kind of thing and the ties are dense and short. Between districts nothing is
// dense: a unit is tied to the criteria written in it, a mapping to the
// endpoints it carries, and those ties are few, long and deliberate. Drawing
// them as more mesh would say the opposite - that the whole slab is one
// undifferentiated web - which is exactly what the old lattice did say.
//
// So they are routed, the way a board routes: a bus round the four districts,
// four taps into a junction at the middle of the slab, and a run in from the rim
// for each site. Every one of those is a straight run along a plan axis.
//
// THAT CONSTRAINT IS GEOMETRY, NOT STYLING. In this projection plan +x lands as
// screen down-right and plan +y as screen down-left, which are the two
// directions every skirt, every wall marking and every deck edge in both figures
// already runs at - so a run on either of them is unmistakably lying on the
// slab. The plan diagonals are the trap: plan (1, 1) projects to STRAIGHT DOWN
// the screen, and a vertical line in an axonometric is what a riser looks like.
// A first cut at this used forty-five degree chamfers the way a real board does,
// and every chamfer came out as a short vertical - three of them, reading as
// posts standing on the library. The corners are square in plan instead, which
// on screen is the same corner every solid in the drawing already turns.
//
// A pad sits one clear step outside a district on each of its four sides. The
// bus uses two of them, the run in from the rim uses a third, and a via is drawn
// wherever a run starts, turns or ends - because a corner in a hairline is not
// something a reader sees, and a board is legible precisely because it says
// where its runs change direction.
const PAD_OUT = 11
const VIA_R = 3.2

// The junction at the middle of the board. The four districts sit at the four
// corners of the plan square, which left the centre of the slab empty - and an
// empty middle is what made the first districted floor read as four separate
// diagrams rather than as one board. Everything taps it.
const JUNCTION = [0, 0]
const JUNCTION_HALF = 15

function padOn(district, axis, sign) {
  const out = district.spread + PAD_OUT
  return axis === 'x'
    ? [district.at[0] + sign * out, district.at[1]]
    : [district.at[0], district.at[1] + sign * out]
}

// A run of one or two legs, each along a plan axis. `first` names the axis the
// run leaves on; a single-axis run needs no corner at all and gets none.
function run(from, to, first) {
  if (from[0] === to[0] || from[1] === to[1]) {
    return { d: `M ${from[0]} ${from[1]} L ${to[0]} ${to[1]}`, bends: [] }
  }
  const corner = first === 'x' ? [to[0], from[1]] : [from[0], to[1]]
  return { d: `M ${from[0]} ${from[1]} L ${corner[0]} ${corner[1]} L ${to[0]} ${to[1]}`, bends: [corner] }
}

const [CRITERIA, UNITS, MAPPINGS, ENDPOINTS] = BY_BAND

// The four sides of the bus. Each pair of districts that shares a plan
// coordinate is joined along the other one, so all four are single straight
// runs and the bus comes out as a square in plan - a diamond on screen, the same
// diamond the slab it is printed on already is.
const SIDES = [
  { key: 'CRITERIA-UNITS', from: CRITERIA, to: UNITS, along: 'y' },
  { key: 'UNITS-ENDPOINTS', from: UNITS, to: ENDPOINTS, along: 'x' },
  { key: 'ENDPOINTS-MAPPINGS', from: ENDPOINTS, to: MAPPINGS, along: 'y' },
  { key: 'MAPPINGS-CRITERIA', from: MAPPINGS, to: CRITERIA, along: 'x' },
].map((side, index) => {
  const axis = side.along === 'x' ? 0 : 1
  const dir = Math.sign(side.to.at[axis] - side.from.at[axis])
  const head = padOn(side.from, side.along, dir)
  const foot = padOn(side.to, side.along, -dir)
  // Where the junction taps this side: the point on it that keeps the side's own
  // fixed coordinate and drops the running one to zero, which is the middle of
  // the run and the only tap that leaves a straight spur.
  const tap = side.along === 'x' ? [0, head[1]] : [head[0], 0]
  return {
    key: side.key,
    index,
    ...run(head, foot),
    ends: [head, foot],
    tap,
    life: jitter(index, 19),
  }
})

// The four taps. Each one is a single straight run from the junction to the
// middle of a side, which is a T on the bus - and a T is what says the bus is a
// bus rather than four wires that happen to meet at the corners.
const SPURS = SIDES.map((side, index) => ({
  key: `tap-${side.key}`,
  index,
  ...run(JUNCTION, side.tap),
  ends: [JUNCTION, side.tap],
  life: jitter(index, 23),
}))

const TRACES = [...SIDES, ...SPURS].map((trace) => ({
  ...trace,
  vias: [...trace.ends, ...trace.bends],
}))

// Three peers on one ground, set well apart so no site sits behind another,
// none of them is the centre, and each one owns a side of the sheet: the two
// outliers take the left and right margins and the near one takes the space
// under the plan. That is what the labels needed and could not get while the
// three were bunched round a small ring.
//
// THE THREE ARE EQUILATERAL IN PLAN, AND THAT IS THE WHOLE OF THE REACH REPAIR.
//
// They used to sit on an isoceles triangle - the two outliers half again as far
// from each other as either was from the near one. Reach is a claim made by
// geometry here: no two touch in the opening frame, every pair touches in the
// closing one. So the reach had to be grown until the FURTHEST pair met, which
// meant the two nearer pairs had long since met and gone on swallowing each
// other. Three coverage fields piled into one blue smear across the federation,
// and a reader could no longer see that there were three sites in it.
//
// Screen x here depends only on (x - y) and screen y only on (x + y), so a
// triangle that is equilateral in plan can still be placed left, right and
// front. Writing u = x - y and v = x + y, plan distance is
// sqrt((du^2 + dv^2) / 2), so three points at (-U, v), (+U, v) and (0, v + H)
// are equilateral when 4U^2 = U^2 + H^2, which is H = sqrt(3) * U. U = 140 and
// v = -70 puts the three the same 198 plan units apart - so one reach number
// touches all three pairs at once, and none of them has to overshoot for
// another one to arrive.
//
// Everything else about a site follows from what it holds.
const SITES = [
  { id: 'SITE 042', plan: [35, -105], records: '890', half: 44, wall: 18, bands: 4, grew: 0.96, stagger: 0.08, place: 'right' },
  { id: 'SITE 103', plan: [-105, 35], records: '614', half: 40, wall: 15, bands: 3, grew: 0.92, stagger: 0.16, place: 'left' },
  { id: 'SITE 018', plan: [86, 86], records: '1,204', half: 55, wall: 22, bands: 5, grew: 1.04, stagger: 0.26, place: 'below' },
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

// What each site publishes, and into which district. A site does not put a
// definition down at a coordinate; it puts it into a kind, and the kind is a
// place on the board - so the criterion goes to CRITERIA, the unit to UNITS and
// the mapping to MAPPINGS, and each of the three routes is short because the
// district it feeds is the one on that site's own side of the sheet.
//
// This is what the three floating tickets were for and could never quite do.
// Naming a payload in a pill over the middle of the drawing says what crossed;
// landing it in a district says what crossed AND what it joined, which is the
// only part a reader could not already see.
const JOIN = CRITERIA.hub

// Where a channel arrives, and why it stopped arriving on the top face.
//
// A curve that ends on the slab's roof has to cross the near skirt to get
// there, and in an axonometric the band just outside a near edge is the same
// band the near face occupies - so the eye resolves the ambiguity as "in front
// of everything" and the whole run reads as a wire laid over a photograph. The
// old arcs did exactly that: the one from Site 042 started well outside the
// near-right skirt and ended inside it. It crossed.
//
// The repair is geometric rather than cosmetic, and it is three things.
//
// The terminus moves to the skirt's bottom rim - the lowest, nearest boundary
// of the whole silhouette, and the only point on it a line coming from below
// cannot be read as passing in front of. A quadratic lies inside the hull of its
// three points, so with the control point outboard as well the curve cannot
// touch the slab; that is a guarantee rather than an inspection.
//
// The terminal tangent becomes a plan axis. Putting the control point on the
// outward plan normal makes the arc arrive perpendicular to the face it lands
// on in the drawing's own geometry - which on screen is the same 21-degree
// slope every skirt and every wall marking already runs at.
//
// And nothing is built where the route arrives. There were three prisms on the
// rim once - each with two lit faces and a crown that went full accent whenever
// its site published - which made three of the four brightest objects in the
// figure and parked them on the one edge that has to read as an edge. Then a
// dot, which was better and still an object placed on a boundary to mark a
// thing that needs no marking: the route crosses the rim and keeps going. What
// says where it changed surface is the corner in the run itself.
//
// Which rim point is not chosen either. Screen x here depends only on (x - y),
// so the rim point directly over a site is the one that keeps that site's own
// (x - y). Two sites resolve onto a flat edge and the third, sitting on the plan
// diagonal, resolves to the front corner - the one place where the outward plan
// normal and the height axis project to the same screen direction, which is why
// a site under it can send a line straight up and still be telling the truth.
const GATE_REACH = 58
// The rim's diagonal extreme, solved rather than read off `LIBRARY.front`:
// `roundedPlan` samples its corner arcs in seven steps and never lands on 45
// degrees, so the sampled front corner sits four pixels off the true one - and
// four pixels is the whole composition off centre.
const RIM_CORNER = LIB_HALF - 28 + 28 / Math.SQRT2
const r1 = (value) => Math.round(value * 10) / 10

function gateFor(site) {
  const reach = site.plan[0] - site.plan[1]
  if (reach > 40) return { edge: 'right', rim: [LIB_HALF, LIB_HALF - reach], out: [1, 0] }
  if (reach < -40) return { edge: 'left', rim: [LIB_HALF + reach, LIB_HALF], out: [0, 1] }
  return { edge: 'corner', rim: [RIM_CORNER, RIM_CORNER], out: [1, 1] }
}

const CHANNELS = [
  { key: 'SITE 018', site: SITE_018, into: CRITERIA },
  { key: 'SITE 042', site: SITE_042, into: UNITS },
  { key: 'SITE 103', site: SITE_103, into: MAPPINGS },
].map((item) => {
  const foot = item.site.solid.back
  const [x1, y1] = [foot[0], r1(foot[1] - MAST)]
  const gate = gateFor(item.site)
  const rim = MESH(...gate.rim)
  // The two points of the arrival: the underside rim where the curve stops, and
  // the rim above it where the route reaches the floor. They are one skirt
  // thickness apart on screen and nothing else, so the last leg of the route is
  // the skirt's own vertical edge - a mark lying on a surface the drawing has
  // already committed to, rather than a riser climbing something in the air.
  const land = [rim[0], r1(rim[1] + LIB_WALL)]
  // The outward plan normal of the face the curve lands on, carried through the
  // projection. A quadratic's tangent at the end is (end - control), so putting
  // the control this far outboard locks the last stretch of the arc to a plan
  // axis of the drawing.
  const away = [(gate.out[0] - gate.out[1]) * ISO_X, (gate.out[0] + gate.out[1]) * ISO_Y]
  const span = Math.hypot(...away) || 1
  const ctrl = [r1(land[0] + (GATE_REACH * away[0]) / span), r1(land[1] + (GATE_REACH * away[1]) / span)]
  // At the corner the outward normal projects to screen-vertical, so a quadratic
  // there is a plumb line. One extra control point off the mast gives that
  // channel a bow of its own and still arrives on the same vertical tangent.
  const bow = [x1 + 34, r1(y1 - 56)]
  const arc = gate.edge === 'corner'
    ? `C ${bow[0]} ${bow[1]} ${ctrl[0]} ${ctrl[1]} ${land[0]} ${land[1]}`
    : `Q ${ctrl[0]} ${ctrl[1]} ${land[0]} ${land[1]}`
  // The last leg, on the slab. A channel stops at the rim, so something has to
  // carry the definition the rest of the way in - and it is a run on the board
  // like every other, along the board's own axes, ending at a pad on the side of
  // its district that faces the rim it came from. It is not a line drawn from
  // the edge to a node in the middle of a cluster: that was the old feeder, and
  // it crossed the floor at a screen angle matching nothing it crossed.
  const into = item.into
  const side = Math.abs(gate.rim[0] - into.at[0]) >= Math.abs(gate.rim[1] - into.at[1])
    ? { axis: 'x', sign: Math.sign(gate.rim[0] - into.at[0]) }
    : { axis: 'y', sign: Math.sign(gate.rim[1] - into.at[1]) }
  const dock = padOn(into, side.axis, side.sign || 1)
  // Turn on the short axis first, so the jog happens at the rim and the long leg
  // is the one that crosses the open slab.
  const feed = run(
    gate.rim,
    dock,
    Math.abs(dock[0] - gate.rim[0]) <= Math.abs(dock[1] - gate.rim[1]) ? 'x' : 'y',
  )
  return {
    ...item,
    node: item.into.hub,
    foot,
    head: [x1, y1],
    gate: { ...gate, at: rim },
    // Mast head, arc, skirt: one `d`, so every mark already running this route
    // keeps running it, and the join at the rim is a corner in a single stroke
    // rather than two strokes meeting.
    path: `M ${x1} ${y1} ${arc} L ${rim[0]} ${rim[1]}`,
    feed: feed.d,
    feedVias: [gate.rim, ...feed.bends, dock],
  }
})

const BY_SITE = Object.fromEntries(CHANNELS.map((item) => [item.key, item]))

// Back to front on screen, so a solid standing in front of another occludes it
// rather than being drawn under it. Forty-two solids on one plane in reading
// order is a pile; in depth order it is a place.
const FLOOR = [...NODES].sort((a, b) => (a.x + a.y) - (b.x + b.y))

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
// A reach is a plan circle now rather than a plan square, and with the three
// sites equilateral 112 lands every pair between six and thirteen per cent
// inside each other. That is a federation whose members are visibly in contact
// and still visibly three. On the old isoceles plan the two near pairs were
// already deep into each other before the far pair had touched at all - the
// closing frame drew one blue field with three sites sunk in it, which is a
// picture of a merger and not of a federation.
//
// `up` is who is publishing and `down` is who is running something the library
// has bound. A site can be both at once, which is the steady state of a
// federation and the frame this run rests on.
const PHASES = [
  { span: 2.2, bound: 30, reach: 66, up: [], down: [], joined: false, tone: 'run', status: 'LOCAL', read: 'Every site runs the task on its own records. Nothing has moved.' },
  { span: 1.6, bound: 30, reach: 76, up: ['SITE 018'], down: [], joined: false, tone: 'pass', status: 'PUBLISHING', read: 'Site 018 publishes the structure it used - a definition, with no values in it.' },
  { span: 1.4, bound: 34, reach: 92, up: ['SITE 018'], down: [], joined: true, tone: 'valid', status: 'LINKED', read: `It binds, and links to ${JOINED.size} criteria the library already held.` },
  { span: 2.2, bound: 38, reach: 112, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'COMPOUNDING', read: 'Sites 042 and 103 take the definition down and run it on records of their own.' },
  { span: 2.4, bound: 38, reach: 112, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'STEADY', read: 'Structure crosses. Records do not.' },
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
          aria-label="Three peer sites of three different sizes stand well apart on one ground, beneath a shared execution library drawn as a slab held above them with a mesh of criteria on it. Each site runs its task locally and beams the structure it used up a channel from a mast on its own roof - a criterion from one, a unit from another, a mapping from the third. A criterion the library binds stands up off the slab, and any site can take a bound definition back down its channel and run it. Structure crosses in both directions and no record crosses in either: the records inside every site stay under a sealed lid, and the reach of each site grows until they overlap."
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

            {/* The slab used to be lettered DEFINITIONS along its back edge.
                It is not any more: the board names its four districts on its own
                surface, and a fifth word on the same plane naming the category
                all four belong to is the drawing saying the same thing twice -
                once where it is useful and once over the top of a cluster. */}

            <g className="dgm-mesh">
              {/* The board, in plan: district grounds, then the traces between
                  them, then the index inside each one, then the solids standing
                  on all of it. Every layer here is drawn inside `planSpace`, so
                  a trace is on the slab rather than over it - which is the one
                  move no line in screen space can make, and the thing that lets
                  a solid taller than a trace pass in front of it. */}
              <g transform={planSpace(310, MESH_Y)}>
                {/* Each district stands on a ground of its own - a plan disc,
                    faint, the width of the cluster on it. It is not a container
                    and it is not a legend: it is the part of the board given
                    over to one kind of definition, which is exactly what a
                    reader needs in order to see four kinds rather than
                    forty-two things. */}
                {BY_BAND.map((district) => (
                  <circle
                    className={`dgm-district ${district.tone}`}
                    key={district.key}
                    cx={district.at[0]}
                    cy={district.at[1]}
                    r={district.spread + 13}
                  />
                ))}

                {/* The junction the four taps meet at. It is a footprint, not a
                    decoration: the middle of the slab was empty once the four
                    districts moved out to the corners, and an empty middle is
                    what made the first districted floor read as four separate
                    diagrams instead of one board. */}
                <rect
                  className="dgm-junction"
                  x={-JUNCTION_HALF}
                  y={-JUNCTION_HALF}
                  width={JUNCTION_HALF * 2}
                  height={JUNCTION_HALF * 2}
                  rx="5"
                  vectorEffect="non-scaling-stroke"
                />

                {/* The bus round the four districts, its four taps into the
                    junction, and a pad wherever a run starts, turns or ends.
                    What crosses between two kinds of definition is few, long and
                    deliberate, so it is drawn as a route and not as more mesh. */}
                {TRACES.map((trace) => (
                  <g className="dgm-trace" key={trace.key} style={{ '--life': trace.life }}>
                    <path className="dgm-tracepath" d={trace.d} />
                    <path className="dgm-tracerun" d={trace.d} pathLength="100" />
                    {trace.vias.map((via, spot) => (
                      <circle className="dgm-via" key={spot} cx={via[0]} cy={via[1]} r={VIA_R} />
                    ))}
                  </g>
                ))}

                {/* The last leg of a site's route, on the slab. A channel stops
                    at the rim, so something has to carry the definition the rest
                    of the way in - and it is a routed trace like every other run
                    on this board, ending at the hub of the district that kind of
                    definition belongs to. It is drawn among the mesh, so every
                    solid taller than it passes in front. */}
                {CHANNELS.map((item) => (
                  <g
                    className={`dgm-trace is-feed${state.up.includes(item.key) ? ' is-up' : ''}${lit(item.key)}`}
                    key={`f-${item.key}`}
                    style={{ '--life': item.site.life }}
                  >
                    <path className="dgm-tracepath" d={item.feed} />
                    <path className="dgm-tracerun" d={item.feed} pathLength="100" />
                    {item.feedVias.map((via, spot) => (
                      <circle className="dgm-via" key={spot} cx={via[0]} cy={via[1]} r={VIA_R} />
                    ))}
                  </g>
                ))}

                {/* The index inside a district. Short, dense, local - a
                    criterion tied to other criteria and a unit to other units,
                    never across a kind. */}
                {LINKS.map((link) => (
                  <line
                    className={`dgm-link${link.rank < state.bound ? ' is-bound' : ''}${state.joined && JOINED.has(link.key) ? ' is-new' : ''}`}
                    key={link.key}
                    style={{ '--stagger': link.stagger }}
                    pathLength="100"
                    x1={NODES[link.a].x}
                    y1={NODES[link.a].y}
                    x2={NODES[link.b].x}
                    y2={NODES[link.b].y}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* Binding is elevation, and a definition is a solid rather than
                    a dot. One the library has not bound is its own footprint
                    lying flat on the slab; one it has is standing on that
                    footprint with its sides under it, as high as it is connected
                    inside its own district. So the board grows a skyline with a
                    shape to it - the hubs are the tall buildings - and coverage
                    compounding is a thing a reader watches happen rather than
                    dots changing colour.

                    Four kinds, four inks, four footprints, four places. The
                    colour is what kind of definition it is and nothing else: it
                    used to be red, amber and green - a state the library was in
                    about that criterion - which is a second thing for colour to
                    mean on a floor where colour now has to carry the kind, and
                    two meanings on one channel is one meaning nobody reads.

                    All of it on one clock, read at a phase taken from where the
                    solid stands: the floor swells and settles as a single wave
                    crossing the slab, and the lamps breathe as a slower one
                    behind it.

                    Drawn back to front, so a solid standing in front of another
                    occludes it the way the decks in the other figure do. */}
                {FLOOR.map((node) => {
                  const bound = node.rank < state.bound
                  return (
                    <g
                      className={`dgm-crit ${node.tone}${bound ? ' is-bound' : ''}${node.rank === JOIN.rank && state.joined ? ' is-new' : ''}`}
                      key={node.index}
                      style={{ '--stagger': Math.round((node.rank / TOTAL) * 100) / 100, '--wave': node.wave, '--lift': `${node.block.step}px` }}
                    >
                      {node.round ? (
                        <>
                          <path className="dgm-face-right" d={node.block.wall} />
                          <circle className="dgm-node" cx={node.block.base.cx} cy={node.block.base.cy} r={node.block.r} />
                        </>
                      ) : (
                        <>
                          <path className="dgm-face-left" d={node.block.faceLeft} />
                          <path className="dgm-face-right" d={node.block.faceRight} />
                          <polygon className="dgm-node" points={node.block.base} />
                        </>
                      )}
                    </g>
                  )
                })}
              </g>
            </g>

            {/* What each district is called, lettered on the board beside it and
                held still while the slab drifts under the words. Set along the
                plan x axis, which is the same slope every skirt and every wall
                marking in both figures runs at, so a name lies on the surface it
                belongs to rather than floating over it.

                This is where the three tickets went. CRITERION, UNIT and MAP
                were three filled pills parked in mid-air over the middle of the
                drawing, naming payloads a reader had no way to place; the same
                four words are now places on the board, printed once each, and
                every route that arrives arrives at one of them. */}
            <g className="dgm-steady">
              {BY_BAND.map((district) => {
                // Outward along the district's own diagonal, so the four names
                // land at the four corners of the slab - clear of the cluster
                // each one belongs to, clear of every trace crossing the middle,
                // and as far from each other as the board allows.
                const [lx, ly] = MESH(district.at[0] + district.mark[0], district.at[1] + district.mark[1])
                return (
                  <text
                    className="dgm-district-name"
                    key={district.key}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    transform={`rotate(${-EDGE_ANGLE} ${lx} ${ly})`}
                  >
                    {district.key}
                  </text>
                )
              })}
            </g>
          </g>

          {/* The ground the three peers share, and the reach each one carries.
              The reaches grow with coverage until they overlap - that overlap is
              the network effect, drawn rather than claimed - and they are three
              sizes, because the site that has contributed most reaches furthest.
              Each one orbits with the site it belongs to, so a site never drifts
              inside its own coverage.

              A reach is a plan circle. It was a plan square, on the argument
              that it should be the same shape as the site standing in it - which
              is true of a thing that has an extent and false of a thing that has
              a radius. Coverage does not have corners, and squared off, three of
              them met along flat edges and locked together into one rectilinear
              field. Circles meet at a point and part again, which is what lets a
              reader see three of them where the drawing has three. */}
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
                    <circle className="dgm-reachfill" cx={site.plan[0]} cy={site.plan[1]} r={span} fill="url(#nc-reach)" />
                    <circle className="dgm-reachrim" cx={site.plan[0]} cy={site.plan[1]} r={span} vectorEffect="non-scaling-stroke" />
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
              always there, and two packets running it in opposite directions.

              Nothing on a channel is a line. The route is a run of dots and what
              travels it is a short burst of them, so what crosses between a site
              and the library reads as a signal rather than as something sliding
              down a pipe. There used to be a solid two-pixel accent arc under
              all of this, drawn in when a site published - five hundred pixels
              of unbroken stroke, the heaviest single mark in the figure, and the
              one thing in it that claimed a federation is plumbed together.

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
                <path className="dgm-rise" d={item.path} pathLength="100" />
                <path className="dgm-fall" d={item.path} pathLength="100" />
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

          {/* Three tickets used to ride here - CRITERION I-4.2, UNIT mg/m2,
              MAP LOINC 718-7 - filled pills parked in mid-air over the middle of
              the sheet, each naming what its channel was carrying. They were the
              least drafted thing in either figure and they were solving a
              problem the drawing has now solved properly: a reader could see
              something crossing and had no way to see what kind of thing it was.
              The board answers that by having places on it. A route from a site
              arrives in CRITERIA, or in UNITS, or in MAPPINGS, and the district
              is lettered on the slab it is part of - so what crossed is said
              once, in the drawing, where it landed. */}

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

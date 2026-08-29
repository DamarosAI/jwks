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
 * its own reach. Above: the shared execution intelligence, a slab with a
 * thickness to it, and on that slab a board of definitions - so coverage is
 * the part of it that has lit up rather than a number in a box.
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
 * run it. That second direction is the whole product - intelligence nobody can
 * read back out of is a filing cabinet - and the figure used to assert it in a
 * caption while drawing three arrows that all pointed the same way.
 *
 * What never travels is a record. The records sit under a sealed lid inside
 * each wall, the local run sweeps across them without ever leaving, and nothing
 * that crosses a channel in either direction is anything but a definition. The
 * claim was never that the site is one-way. It is that the record is nowhere.
 *
 * Binding is elevation, and a definition is a solid rather than a dot. Unbound,
 * it lies flat on the slab; one the intelligence has bound is standing on that
 * same footprint with its sides under it, as high as it is connected - so
 * coverage compounding is a skyline growing, the hubs are the tall buildings,
 * and the weight of the intelligence is visible without a legend. The index
 * underneath stays
 * printed on the slab, because that lattice is the index and the solids are
 * what the index is holding.
 *
 * THE SLAB IS A BOARD, NOT A HEAP, AND THAT IS WHAT MAKES IT INTELLIGENCE.
 *
 * It was one jittered lattice across the whole plane: forty-two solids in three
 * state colours and two shapes, positioned by a bricked grid with the grid
 * beaten out of it. Every one of those decisions was defensible and the sum was
 * a heap. A reader could see that it held a lot of things and could not see
 * that it held KINDS of thing, which is the entire difference between
 * intelligence and a heap of it.
 *
 * Four districts now - criteria, units, mappings, endpoints - one to each corner
 * of the plan square, each in its own ink and built as its own solid: a block, a
 * drum, a bar, a post. Colour, shape and place say the same thing three times
 * over, so none of them has to be learned, and there is no legend anywhere on
 * this sheet - and no lettering either. Nothing is printed on the board.
 *
 * Inside a district the index is a mesh, because everything in it is the same
 * kind of thing and the ties are dense and short. Between districts nothing is
 * dense, so nothing between them is a mesh: a bus runs round the four, four taps
 * meet a junction at the middle of the slab, and every one of those runs lies on
 * a plan axis - the same two directions every skirt and every wall marking in
 * both figures already runs at, which is what puts a run on the board rather
 * than over it.
 *
 * Nothing here is nailed down, and none of it is scattered either. The
 * intelligence drifts on one slow clock and drops its shade on the federation below it; each
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
 * intelligence, because a site that is not publishing this second is still
 * reporting - the same quiet layer the other figure runs on its idle tines, at
 * the scale this drawing works at.
 *
 * A CHANNEL GOES THROUGH THE SLAB, NOT ONTO ITS EDGE, and that is the one
 * repair in this figure that is geometry rather than styling. An arc ending on
 * the slab's top face has to cross the near skirt to get there, and in an
 * axonometric the band just outside a near edge is the same band the near face
 * occupies - so the eye reads the whole run as a wire laid over a photograph.
 * The repair after that was worse in a quieter way: stop dead on the underside
 * rim, climb the skirt, hand off to a trace that set out from the boundary.
 * Three marks pretending to be one, all of them balanced on the one line in the
 * drawing that has to read as an edge, and a route that arrived nowhere because
 * it arrived AT the outline.
 *
 * A board takes a signal from the other side of itself through a hole. So each
 * site has one: a port cut clean through the slab, twenty-four plan units in
 * from the rim, drawn exactly the way the intake throat in the other figure is -
 * a plan circle for the wall, the floor a step below it, both clipped to the
 * bore. The route rises from the site, passes beneath the near skirt, and comes
 * up through its port; the packets on it go under the edge and reappear in the
 * hole. That is only honest because the slab is painted after the channels, so
 * the order those two groups are drawn in is load-bearing and says so where it
 * happens. And it is what got every run off the boundary: a trace on this board
 * now starts at a port and ends beside a district, and touches neither edge.
 *
 * Nothing is built where a route arrives, and nothing is written on it. There
 * were three prisms on the rim once, then three dots, and three filled pills
 * riding the channels saying CRITERION, UNIT and MAP - all of them furniture
 * answering a question the board now answers by having places on it. A route
 * arrives in a district of its own kind. That is what crossed and where it went.
 *
 * Nothing on the route is a line. The standing route is a run of dots, and what
 * travels it is a packet of three or four more, so an exchange between a site
 * and the intelligence is a signal rather than a pipe with something sliding down
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

// The intelligence is a slab, not a sheet. It used to be one rounded rect with a
// hairline round it, which put the two planes of this figure in the same
// register as the dot field behind them - drawn on the page rather than held
// over it. Extruded, it is the same object every deck and every site in both
// drawings is, at the scale of the thing they all publish into.
const INTEL_HALF = 160
const INTEL_WALL = 13
const INTEL = roundedDeck(310, MESH_Y, INTEL_HALF, INTEL_WALL, 28)

// A definition is a solid standing on the slab, and how high it stands is how
// many others of its own kind it is tied to. That is the one thing about
// intelligence worth drawing in three dimensions: a hub is not a differently
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
// a heap. A reader looking at it could see that it held a lot of things and
// could not see that it held KINDS of thing - which is the entire difference
// between intelligence and a pile of it, and the one claim this panel exists
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
// None of them is lettered. Each district printed its own name on the slab for
// a while, one word turned a quarter of the way round the diamond so it cleared
// its own cluster - and four words on the one plane in this figure that has to
// read as a held surface is type back over the drawing, which is exactly what
// the three floating tickets were doing before they came off it.
//
// The board does not need them. Kind is already carried by ink, by solid and by
// corner, three times over, and a name printed on top of all three is the
// drawing saying out loud what it has finished showing. `key` stays because the
// code is read by people too, and because it is what a route is matched into.
const DISTRICTS = [
  { key: 'CRITERIA', at: [84, 84], tone: 'is-blue', kind: 'block', count: 11, spread: 47 },
  { key: 'UNITS', at: [84, -84], tone: 'is-green', kind: 'drum', count: 10, spread: 45 },
  { key: 'MAPPINGS', at: [-84, 84], tone: 'is-violet', kind: 'bar', count: 10, spread: 45 },
  { key: 'ENDPOINTS', at: [-84, -84], tone: 'is-amber', kind: 'post', count: 11, spread: 47 },
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
  block: { halfX: 8, halfY: 8, radius: 5, low: 5, span: 9 },
  drum: { halfX: 7, halfY: 7, radius: 7, low: 5, span: 9 },
  bar: { halfX: 11, halfY: 4.5, radius: 3.5, low: 4, span: 7 },
  post: { halfX: 5, halfY: 5, radius: 3, low: 8, span: 12 },
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
// contribute, so it fills in unevenly, the way real intelligence does.
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
// posts standing on the intelligence. The corners are square in plan instead, which
// on screen is the same corner every solid in the drawing already turns.
//
// How far a district's ground reaches past the cluster standing on it. It is
// named because three separate things now measure themselves against it - the
// disc itself, the bus pads, and where a site's route lands - and while it was
// a literal in the JSX those three could and did drift apart.
const GROUND_OUT = 10

// A pad sits one clear step outside a district on each of its four sides, and
// the step has to clear the ground as well as the cluster. It used to be 11
// against a ground of 13, which put every pad on this board a couple of units
// INSIDE the disc it was supposed to be standing clear of - so the bus appeared
// to start under the district rather than beside it, and the one thing a pad
// exists to show, that a run leaves from outside, was the one thing it did not.
// 20 against a ground of 10 leaves ten clear units all the way round.
//
// A via is drawn wherever a run starts, turns or ends - because a corner in a
// hairline is not something a reader sees, and a board is legible precisely
// because it says where its runs change direction.
const PAD_OUT = 20
const VIA_R = 3.2

// The junction at the middle of the board, centred on the origin. The four
// districts sit at the four corners of the plan square, which left the centre of
// the slab empty - and an empty middle is what made the first districted floor
// read as four separate diagrams rather than as one board. Everything taps it,
// and every tap stops on its edge.
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
//
// A tap starts on the EDGE of the junction square, not at its centre. They used
// to run to [0, 0], which meant four runs converging on one point under a
// filled square - so the square read as something printed over the top of a
// crossing rather than as a part the four runs arrive at, and the four last
// segments were drawn and then covered up. A run that stops where the part it
// meets begins is the same run with nothing wasted, and it is what makes the
// junction a component on this board instead of a lid.
function onJunction(tap) {
  return tap[0] === 0
    ? [0, Math.sign(tap[1]) * JUNCTION_HALF]
    : [Math.sign(tap[0]) * JUNCTION_HALF, 0]
}

const SPURS = SIDES.map((side, index) => {
  const start = onJunction(side.tap)
  return {
    key: `tap-${side.key}`,
    index,
    ...run(start, side.tap),
    ends: [start, side.tap],
    life: jitter(index, 23),
  }
})

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
  { id: 'SITE 042', plan: [35, -105], records: '890', half: 44, wall: 18, bands: 4, grew: 0.96, stagger: 0.08 },
  { id: 'SITE 103', plan: [-105, 35], records: '614', half: 40, wall: 15, bands: 3, grew: 0.92, stagger: 0.16 },
  { id: 'SITE 018', plan: [86, 86], records: '1,204', half: 55, wall: 22, bands: 5, grew: 1.04, stagger: 0.26 },
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
  // THE RECORDS ARE CELLS. They used to be bands - filing-cabinet furniture -
  // and what a site actually holds is patients: the records under the sealed
  // lid are the one population in either figure that is ALIVE, so they are
  // drawn by the sheet's law - life is round, structure is faceted. Each row
  // is a run of plan circles with a nucleus printed off-centre on each, and
  // the local head still sweeps across them without any of them leaving.
  // Everything else about the stack holds: the count of rows and the cells in
  // each come from what the site holds, so the three sites still tell apart
  // with every label removed.
  const lid = site.half - 7
  const rows = []
  for (let band = 0; band < site.bands; band += 1) {
    const y = Math.round((-lid * 0.58 + (band * lid * 1.16) / (site.bands - 1)) * 10) / 10
    const half = lid - 7
    const count = Math.max(2, Math.floor((half * 2) / 13))
    const cells = []
    for (let slot = 0; slot < count; slot += 1) {
      cells.push(Math.round((-half + 6.5 + slot * 13) * 10) / 10)
    }
    rows.push({ y, half, cells })
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
// a head on top, and the channel to the intelligence leaves from that head.
//
// It is not decoration. A line springing out of the corner of a solid is a line
// touching a silhouette, and the moment either end moves - and both ends move
// here, the site on its orbit and the intelligence on its drift - it parts from the
// thing it was supposed to be attached to. A head wide enough to swallow the
// foot of the channel is what makes the join survive the motion, which is the
// same repair the plate leaders in Trident needed and for the same reason.
const MAST = 17
const MAST_HEAD = 7.5

// WHERE A ROUTE CROSSES THE PLANE OF THE BOARD: A HOLE IN IT.
//
// A site and the intelligence are two surfaces at two heights, and everything that
// passes between them has to get from one to the other. For a long time the
// drawing dodged that. The route ran up from the site, stopped dead on the
// bottom rim of the intelligence's near skirt, climbed the thirteen pixels of that
// skirt, and then a separate trace set off across the board - three marks
// pretending to be one, all of them balanced on the one line in the figure that
// has to read as an edge, and the corner where they met parked on the boundary
// itself. It arrived nowhere. It arrived AT the outline.
//
// A board does not do that. A board takes a signal from the other side of
// itself through a hole, and the hole is a part with a position, a size and a
// wall you can see down. So each site gets one: a port, cut clean through the
// slab, drawn exactly the way the intake throat in the other figure is drawn -
// a plan circle for the wall, the floor a few units below it, both clipped to
// the bore. The route rises from the site, goes under the slab, and comes up
// through its port. The packets running it disappear beneath the near edge and
// reappear in the hole, which is what going through something looks like.
//
// This is also what got every trace off the edge of the tile. The run across
// the board starts at the port now, and the port is twenty-four plan units in,
// so nothing on this board begins on its boundary any more.
//
// THE PORT SITS DIRECTLY ABOVE ITS SITE. Screen x depends only on (x - y), so a
// port that keeps its site's own (x - y) is drawn in the same column as the
// site under it, and the two halves of a route that is mostly hidden still read
// as one route. Two of the three resolve onto a flat face and take the standard
// inset. The third sits on the plan diagonal, under the front corner, and the
// diagonal is the narrow direction of a diamond: a plan unit is worth 0.48 of a
// pixel there against 0.93 on a face, and CRITERIA is parked on the same
// diagonal. 138 is where those two squeezes are equal - about nine pixels of
// clear board on each side of it - and it is solved rather than chosen.
const PORT_IN = 24
const PORT_CORNER = 138
// The bore, in plan. A plan circle of radius r comes out as a screen ellipse
// 2.45r wide and 0.96r tall, so 7.5 is about eighteen pixels by seven at the
// size this figure is printed - large enough to read as an opening with a wall
// and a floor in it, and still inside the nine pixels of clear board the front
// corner has to spare on each side of its own port.
const PORT_R = 7.5

// How far down the wall of the port the floor sits. Equal positive steps on
// both plan axes cancel in x and add in y, so this is straight down the screen -
// the same solve every riser in both figures uses.
const PORT_DROP = 4.5

// A port is fed by a curve from below, and the curve arrives along the plan
// normal of the face its port is nearest. That keeps the last stretch of every
// channel on one of the two slopes every skirt, every wall marking and every
// deck edge in both drawings already runs at, so the part of it a reader can
// still see before it passes under the slab is lying in the drawing's own
// geometry rather than cutting across it.
const GATE_REACH = 58
const r1 = (value) => Math.round(value * 10) / 10

function portFor(site) {
  const reach = site.plan[0] - site.plan[1]
  const inset = INTEL_HALF - PORT_IN
  if (reach > 40) return { face: 'right', at: [inset, inset - reach], out: [1, 0] }
  if (reach < -40) return { face: 'left', at: [inset + reach, inset], out: [0, 1] }
  return { face: 'corner', at: [PORT_CORNER, PORT_CORNER], out: [1, 1] }
}

// Where a route lands. Not at a node in the middle of a cluster - that was the
// old feeder, and it crossed the floor at a screen angle matching nothing it
// crossed - and not at a bus pad either, because a definition arriving from a
// site is not traffic between two kinds, it is a new member of one kind.
//
// It lands on the rim of its district's own ground, five units clear of it, on
// the side the port is on, reached by a single straight run along a plan axis.
// One leg, no corner, nothing to route around: the port is already outside
// everything and the district is the next thing the run meets.
const DOCK_GAP = 5

function dockOn(district, port) {
  const [cx, cy] = district.at
  const reach = district.spread + GROUND_OUT + DOCK_GAP
  // Along x when a horizontal run from the port actually meets the disc, along
  // y otherwise. On the diagonal both do and x wins, which is the same tie the
  // rest of this file breaks the same way.
  if (Math.abs(port[1] - cy) < reach) {
    const off = Math.sqrt(reach * reach - (port[1] - cy) ** 2)
    return [r1(cx + Math.sign(port[0] - cx) * off), r1(port[1])]
  }
  const off = Math.sqrt(Math.max(reach * reach - (port[0] - cx) ** 2, 0))
  return [r1(port[0]), r1(cy + Math.sign(port[1] - cy) * off)]
}

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

const CHANNELS = [
  { key: 'SITE 018', site: SITE_018, into: CRITERIA },
  { key: 'SITE 042', site: SITE_042, into: UNITS },
  { key: 'SITE 103', site: SITE_103, into: MAPPINGS },
].map((item) => {
  const foot = item.site.solid.back
  const [x1, y1] = [foot[0], r1(foot[1] - MAST)]
  const port = portFor(item.site)
  const land = MESH(...port.at)
  // The outward plan normal of the face the port is nearest, carried through
  // the projection. A quadratic's tangent at the end is (end - control), so
  // putting the control this far outboard locks the last stretch of the arc to
  // a plan axis of the drawing - and puts the whole of the control triangle
  // outboard of the port, so the curve reaches it from outside the slab and
  // passes under the near skirt rather than over it.
  const away = [(port.out[0] - port.out[1]) * ISO_X, (port.out[0] + port.out[1]) * ISO_Y]
  const span = Math.hypot(...away) || 1
  const ctrl = [r1(land[0] + (GATE_REACH * away[0]) / span), r1(land[1] + (GATE_REACH * away[1]) / span)]
  // At the corner the outward normal projects to screen-vertical, so a quadratic
  // there is a plumb line. One extra control point off the mast gives that
  // channel a bow of its own and still arrives on the same vertical tangent.
  const bow = [x1 + 34, r1(y1 - 56)]
  const arc = port.face === 'corner'
    ? `C ${bow[0]} ${bow[1]} ${ctrl[0]} ${ctrl[1]} ${land[0]} ${land[1]}`
    : `Q ${ctrl[0]} ${ctrl[1]} ${land[0]} ${land[1]}`
  const dock = dockOn(item.into, port.at)
  const feed = run(port.at, dock, 'x')
  return {
    ...item,
    node: item.into.hub,
    foot,
    head: [x1, y1],
    port: { ...port, screen: land },
    // Mast head and arc: one `d`, so every mark already running this route keeps
    // running it, and the part of it that is under the slab is under the slab in
    // the same stroke rather than in a second one that has to be kept in step.
    path: `M ${x1} ${y1} ${arc}`,
    feed: feed.d,
    feedVias: [port.at, ...feed.bends, dock],
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
// `up` is who is publishing and `down` is who is running something the
// intelligence has bound. A site can be both at once, which is the steady state of a
// federation and the frame this run rests on.
const PHASES = [
  { span: 2.2, bound: 30, reach: 66, up: [], down: [], joined: false, tone: 'run', status: 'LOCAL', read: 'Three sites, three sets of definitions. None of them can run the others.' },
  { span: 1.6, bound: 30, reach: 76, up: ['SITE 018'], down: [], joined: false, tone: 'pass', status: 'PUBLISHING', read: 'Site 018 publishes the definition it just ran, so another site can run the same one.' },
  { span: 1.4, bound: 34, reach: 92, up: ['SITE 018'], down: [], joined: true, tone: 'valid', status: 'LINKED', read: `It binds against ${JOINED.size} criteria already here, so the three now agree what this test means.` },
  { span: 2.2, bound: 38, reach: 112, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'COMPOUNDING', read: 'Sites 042 and 103 pull it down and run it. Two more sites open, no protocol rewritten.' },
  { span: 2.4, bound: 38, reach: 112, up: ['SITE 018', 'SITE 042', 'SITE 103'], down: ['SITE 018', 'SITE 042', 'SITE 103'], joined: true, tone: 'valid', status: 'STEADY', read: 'One definition, three sites executing it. Structure crosses; records never do.' },
]

// Pointing at a site hands it the whole readout - the word in the pill, the
// colour of the pill and the line beside it - and what it says is what that
// site did, not how many rows it happens to be sitting on. Otherwise the run
// narrates itself.
const READS = {
  'SITE 042': { tone: 'pass', pill: 'PUBLISHER', read: 'Site 042 published the scale it measures on, so a reading taken here is comparable anywhere.' },
  'SITE 103': { tone: 'pass', pill: 'MAPPER', read: 'Site 103 sent a mapping between two vocabularies. The other two can now read its codes.' },
  'SITE 018': { tone: 'valid', pill: 'ORIGIN', read: 'Site 018 wrote the definition the other two are running. One author, three sites executing.' },
  intel: { tone: 'valid', pill: 'INTELLIGENCE', read: 'Every definition in the shared intelligence came up from a site, and any site can take one down and run it.' },
}

// A shade is stepped rather than blurred, and the steps are a share of the
// caster's own size rather than a fixed inset, so the same three numbers hold
// for a 76-unit deck in Trident and a 160-unit slab here.
const SEAT_STEPS = [0.1, 0.26, 0.42]

/**
 * The shade the intelligence drops on the federation under it. Two planes held
 * apart need something between them saying so, and in a drawing with no light
 * source that something is occlusion: the ground is darker where the slab is
 * over it. Stepped rather than blurred, and inset rather than cast at full
 * size, because a shade the size of its own caster covers the whole receiver
 * and reads as dirt on the plane instead of height above it.
 */
function Seat({ half, radius, cy, kind }) {
  return (
    <g className={`dgm-seat is-${kind}`}>
      {/* The shift rides between the seat's own clock and its geometry: the
          shadow slides against the pointer, so the slab reads as suspended
          without the slab - whose ports three channels arrive through -
          moving a single unit. Occlusion is the one part of this figure that
          is not plumbed to anything. */}
      <g className="dgm-seatshift">
        <g transform={planSpace(310, cy)}>
          {SEAT_STEPS.map((fraction) => {
            const inset = Math.round(half * fraction)
            return <rect className="dgm-seatstep" key={fraction} x={-half + inset} y={-half + inset} width={(half - inset) * 2} height={(half - inset) * 2} rx={radius} />
          })}
        </g>
      </g>
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
          aria-label="Three peer sites of three different sizes stand well apart on one ground, beneath shared execution intelligence drawn as a slab held above them with a mesh of criteria on it. Each site runs its task locally and beams the structure it used up a channel from a mast on its own roof - a criterion from one, a unit from another, a mapping from the third. A criterion the intelligence binds stands up off the slab, and any site can take a bound definition back down its channel and run it. Structure crosses in both directions and no record crosses in either: the records inside every site - drawn as the cells they are, each with its nucleus - stay under a sealed lid, and the reach of each site grows until they overlap."
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
            {/* One clip per port. A port is a wall and a floor a few units
                below it, and without this the floor - the same circle, moved
                straight down the screen - hangs out under the bore and the hole
                comes out as a crescent stuck to a disc. `userSpaceOnUse` is the
                default, and these are referenced from inside `planSpace`, so
                the circle is written in plan units exactly like the port. */}
            {CHANNELS.map((item) => (
              <clipPath id={`nc-port-${item.key.replace(' ', '-')}`} key={item.key}>
                <circle cx={item.port.at[0]} cy={item.port.at[1]} r={PORT_R} />
              </clipPath>
            ))}

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
          <Seat half={INTEL_HALF} radius={28} cy={GROUND_Y} kind="intel" />

          <g transform={planSpace(310, GROUND_Y)}>
            <g clipPath="url(#nc-ground)">
              {SITES.map((site) => {
                const span = Math.round(state.reach * site.grew)
                return (
                  <g className={`dgm-reach${lit(site.id)}`} key={site.id} style={{ '--stagger': site.stagger, '--life': site.life }}>
                    <circle className="dgm-reachfill" cx={site.plan[0]} cy={site.plan[1]} r={span} fill="url(#nc-reach)" />
                    <circle className="dgm-reachrim" cx={site.plan[0]} cy={site.plan[1]} r={span} vectorEffect="non-scaling-stroke" />
                    {/* The growth ring: the reach a phase ago, still visible
                        inside the rim, so coverage reads as grown rather than
                        stamped. It rides the same transition the rim does. */}
                    <circle className="dgm-reachrim is-ring" cx={site.plan[0]} cy={site.plan[1]} r={Math.max(span - 9, 4)} vectorEffect="non-scaling-stroke" />
                  </g>
                )
              })}
            </g>
            {/* Last, so three overlapping fields never soften the one edge that
                says where the shared ground stops. */}
            <rect className="dgm-planeedge" x={-GROUND_HALF} y={-GROUND_HALF} width={GROUND_HALF * 2} height={GROUND_HALF * 2} rx="30" vectorEffect="non-scaling-stroke" />
          </g>

          {/* The channels, drawn before the sites so every foot ends up under
              the mast head it belongs to - and before the intelligence, so every head
              ends up under the slab it goes into. Each one is a standing route
              that is always there, and two packets running it in opposite
              directions.

              A route no longer stops on the intelligence's rim. It runs to that
              site's port, which is well inside the plan, so its last stretch
              passes beneath the near skirt and is painted over by the slab. What
              a reader sees is a packet going under the edge and coming up in a
              hole, which is what crossing between two surfaces looks like when
              the drawing is willing to say which side of the slab it is on.

              Nothing on a channel is a line. The route is a run of dots and what
              travels it is a short burst of them, so what crosses between a site
              and the intelligence reads as a signal rather than as something sliding
              down a pipe. There used to be a solid two-pixel accent arc under
              all of this, drawn in when a site published - five hundred pixels
              of unbroken stroke, the heaviest single mark in the figure, and the
              one thing in it that claimed a federation is plumbed together.

              Both directions carry structure and neither carries a record.
              Drawing only the rising half was the figure asserting in a caption
              what it would not draw: intelligence nobody can take anything out of
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

          {/* THE INTELLIGENCE IS DRAWN AFTER THE CHANNELS, AND THAT IS LOAD-BEARING.

              A route from a site goes UNDER this slab and comes up through a
              port cut in it. Nothing about that is a trick of stroke order:
              the arc genuinely ends inside the plan, and the only thing that
              stops it being drawn across the near skirt is the slab being
              painted over it afterwards. Move this group back above the
              channels and every one of them turns into a wire laid over a
              photograph - which is exactly what the old arcs were, and why
              they had to stop dead on the rim instead of arriving anywhere.

              The sites still come after it, so a site is never drawn under
              the slab it publishes into, and the ground and the reaches
              still come before it, so a channel crosses the coverage it
              belongs to rather than hiding beneath it. */}
          {/* The intelligence, and the mesh that lives on it, drawn as one panel. It
              is a slab rather than a sheet, it drifts as one, and it answers a
              pointer as one - over a target the size of the whole plane, because
              a two-pixel node is not something a reader can aim at. */}
          <g className={`dgm-intel${lit('intel')}`} {...probe('intel')}>
            <Faces shape={INTEL} className="dgm-solid" />
            <g transform={planSpace(310, MESH_Y)}>
              <rect className="dgm-planefill" x="-160" y="-160" width="320" height="320" rx="28" fill="url(#nc-grain)" />
              <rect className="dgm-hit" x="-160" y="-160" width="320" height="320" rx="28" />
            </g>

            {/* Nothing is written on the slab. It was lettered DEFINITIONS
                along its back edge once, and after that its four districts
                printed their own names on its surface. Both are off it now, for
                the same reason: this is the one plane in the figure that has to
                read as a held surface, and a word lying on it is a word between
                the reader and the thing the panel is claiming. */}

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
                  <g key={district.key}>
                    <circle
                      className={`dgm-district ${district.tone}`}
                      cx={district.at[0]}
                      cy={district.at[1]}
                      r={district.spread + GROUND_OUT}
                    />
                    {/* The district's own cytoplasm: the fine stipple, inside
                        its ground, so a quarter given to one kind of thing
                        reads as grown ground rather than blank disc. */}
                    <circle
                      className="dgm-districtfill"
                      cx={district.at[0]}
                      cy={district.at[1]}
                      r={district.spread + GROUND_OUT - 3}
                      fill="url(#nc-reach)"
                    />
                  </g>
                ))}

                {/* The junction the four taps meet at. It is a footprint, not a
                    decoration: the middle of the slab was empty once the four
                    districts moved out to the corners, and an empty middle is
                    what made the first districted floor read as four separate
                    diagrams instead of one board. */}
                {/* THE CENTROSOME. The junction the four taps meet is the
                    board's organising centre, so it is drawn as the cell's
                    own: a round hub with an aster of short spokes inside it.
                    The geometry is unchanged - a circle of JUNCTION_HALF
                    passes exactly through the four points the taps already
                    stop on - so every run still arrives where it always did. */}
                <circle
                  className="dgm-junction"
                  cx="0"
                  cy="0"
                  r={JUNCTION_HALF}
                  vectorEffect="non-scaling-stroke"
                />
                <g className="dgm-aster">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const a = (deg * Math.PI) / 180
                    const r0 = 5
                    const r2 = 11.5
                    return (
                      <line
                        key={deg}
                        x1={Math.round(Math.cos(a) * r0 * 10) / 10}
                        y1={Math.round(Math.sin(a) * r0 * 10) / 10}
                        x2={Math.round(Math.cos(a) * r2 * 10) / 10}
                        y2={Math.round(Math.sin(a) * r2 * 10) / 10}
                        vectorEffect="non-scaling-stroke"
                      />
                    )
                  })}
                  <circle className="dgm-asterhub" cx="0" cy="0" r="2.6" />
                </g>

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

                {/* The three ports, and the run each one feeds.

                    A port is a hole through the slab: the wall is a plan circle
                    in the board's own dark, the floor is the same circle four
                    and a half units further down the screen, and both are
                    clipped to the bore so what is drawn is exactly what can be
                    seen down it. It is the same part, built the same way, as the
                    intake throat on the other figure's first deck - because it
                    is the same thing, a place where something crosses the plane.

                    The run leaves the port and lands on the rim of its own
                    district's ground. One leg, along a plan axis, and both ends
                    a long way from every edge of the tile: the leg the port
                    replaced started ON the boundary and its first corner sat on
                    it too, which is how a board ends up looking like it has been
                    drawn round its own outline.

                    All of it is inside `planSpace`, so a run is on the slab
                    rather than over it and any solid taller than it passes in
                    front. */}
                {CHANNELS.map((item) => (
                  <g className={`dgm-portal${lit(item.key)}`} key={`p-${item.key}`}>
                    <g clipPath={`url(#nc-port-${item.key.replace(' ', '-')})`}>
                      <circle className="dgm-shaft" cx={item.port.at[0]} cy={item.port.at[1]} r={PORT_R} />
                      <circle
                        className="dgm-shaftfloor"
                        cx={item.port.at[0] + PORT_DROP}
                        cy={item.port.at[1] + PORT_DROP}
                        r={PORT_R}
                      />
                    </g>
                    <circle
                      className="dgm-portrim"
                      cx={item.port.at[0]}
                      cy={item.port.at[1]}
                      r={PORT_R}
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* The pore's collar, one ring out from the rim - the same
                        line the membranes are drawn with, because a port is a
                        hole IN the board's boundary layer. */}
                    <circle
                      className="dgm-membrane is-collar"
                      cx={item.port.at[0]}
                      cy={item.port.at[1]}
                      r={PORT_R + 2.6}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
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
                    a dot. One the intelligence has not bound is its own footprint
                    lying flat on the slab; one it has is standing on that
                    footprint with its sides under it, as high as it is connected
                    inside its own district. So the board grows a skyline with a
                    shape to it - the hubs are the tall buildings - and coverage
                    compounding is a thing a reader watches happen rather than
                    dots changing colour.

                    Four kinds, four inks, four footprints, four places. The
                    colour is what kind of definition it is and nothing else: it
                    used to be red, amber and green - a state the intelligence was in
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

          </g>

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
                      <g className="dgm-record" key={row.y}>
                        {row.cells.map((x) => (
                          <g key={x}>
                            <circle className="dgm-recordcell" cx={x} cy={row.y} r="4.2" />
                            <circle className="dgm-recordcore" cx={x + 1.1} cy={row.y + 0.6} r="1.4" />
                          </g>
                        ))}
                      </g>
                    ))}
                    <rect className="dgm-lid" x={-site.lid} y={-site.lid} width={site.lid * 2} height={site.lid * 2} rx={Math.round(site.lid * 0.28)} vectorEffect="non-scaling-stroke" />
                    <rect className="dgm-sweep" x={-site.lid + 7} y={-site.lid + 7} width="6" height={(site.lid - 7) * 2} rx="3" />
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
              The board answers that by having places on it. A route from a
              site arrives among the blocks, or among the drums, or among the
              bars, and the district it lands in is drawn in its own ink and
              built as its own solid - so what crossed is said once, in the
              drawing, by where it landed. */}

          {/* NOTHING IS LABELLED IN THE MARGINS.

              Each site used to carry a two-line strip out to the side of the
              sheet on a leader - "890 RECORDS" over "0 LEAVE" - and before that
              the same strip said EGRESS NONE. Both were the drawing arguing in
              the margin about something the drawing already does in the middle:
              the records sit under a sealed lid inside every wall, the local run
              sweeps across them without leaving, and not one of the three routes
              overhead carries anything but a definition. A count printed beside
              a figure that shows a thing is a figure that does not trust itself.

              A site still names itself, on its own wall, and still answers a
              pointer - the probe is on the solid, where it always was, so the
              strip took nothing with it when it went. */}

          <line className="dgm-rule" x1="20" y1="648" x2="600" y2="648" />
          <rect className="dgm-status" x="20" y="660" width="130" height="26" rx="13" />
          <text className="dgm-statustext" x="85" y="677" textAnchor="middle">{pill}</text>
          <text className="dgm-read" x="164" y="677">{read}</text>
        </svg>
      </div>
    </figure>
  )
}

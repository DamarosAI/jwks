import { useState } from 'react'

import { jitter, planCyl, planPrism, planSpace, project, pts, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * The floor - what trial execution is spread across today, and what it could
 * stand on instead.
 *
 * Trident is a stack and its axis is AUTHORITY: a proposal descends through a
 * contract, a signature and a ledger. Nectar is a plane and its axis is
 * GEOGRAPHY: peers stand apart on one ground and structure crosses between
 * them. Neither can say what the thesis has to say, because the thesis is not
 * about a product. It is about the ground the whole discipline is standing on.
 *
 * ABOVE IS NOT THE SAME KIND OF THING AS BELOW, AND THAT IS THE FIGURE.
 *
 * An earlier version of this drawing put five stages of work on five plates and
 * lowered them onto a deck. It was wrong in a way worth writing down: five
 * things moving down is a picture of a WORKFLOW being tidied, and nobody needs
 * a diagram to be told their work would go better if it were in one place. The
 * claim is not that the stages should be rearranged. It is that what is running
 * them should be replaced.
 *
 * So the sheet has two halves that are two different kinds of object.
 *
 * In the air is the FRAGMENTED WORLD: a scatter of plates at nine different
 * heights, off every axis, each one holding something inert - rows, a grid, a
 * page. They are general-purpose software that a site, a sponsor and a patient
 * have each been made to do research inside, and the drawing gives them no
 * ink of their own. Every one hangs on a hairline leader down to the place on
 * the ground its work actually belongs, so a reader can see the distance the
 * work is being held at without a word being written about it.
 *
 * On the ground is ONE SURFACE, in three districts - sponsors, sites, patients -
 * and it is the only thing in the figure drawn in the house blue. At the middle
 * of it stands the drum: two stacked plan cylinders, which is the Damaros mark
 * built as geometry rather than pasted on as a logo. Everything routes through
 * it, because that is what the mark is for.
 *
 * NOTHING ON THE SHEET IS LABELLED.
 *
 * No word sits on any object. The three districts are told apart by what stands
 * in them - blocks, a dense works, round solids - and by where they are, and
 * nothing else. What a reader wants named, they point at, and the readout at
 * the foot answers in a sentence. That is the whole annotation budget, and it
 * buys back the one thing a figure this dense cannot otherwise have: air.
 *
 * THE RUN IS A CLEAN-UP, AND IT IS SCROLL THAT DRIVES IT.
 *
 * District by district, the plates over one part of the world go out and the
 * ground under them stands up: footprints become solids, the routes between
 * districts light, and the drum comes on. By the end the air holds nothing but
 * the ghosts of what was there - a site does not delete its EHR, it stops
 * running research inside it - and the floor is one lit, populated, moving
 * surface with sponsors, sites and patients on the same run.
 *
 * Depth is not a renderer. The cloud drifts against the ground off the same
 * scroll value the ground rises on, so the two layers separate as a reader
 * arrives; every solid breathes on its own long clock; and the routes carry
 * packets at a rate nothing else on the sheet uses. That is where the immersion
 * comes from - rates and parallax on flat, projected geometry - not from a
 * third dimension the page has to download.
 */

const W = 1200
const H = 740
const CX = 600
// The middle of the frame, which is the point the camera centres a district on.
const MID_Y = 370

// The ground. Wider and deeper than it was, because the camera now TRAVELS
// across it: the three districts are far enough apart that arriving at one puts
// the others off the edge of the frame, which is the whole reason the flight
// reads as a flight rather than as a zoom on a static picture.
const PLANE_Y = 470
const PLANE_X = 690
const PLANE_Z = 268
// A SUBSTRATE, NOT A SHEET. Fifteen units of thickness drew the ground as a
// tablet lying on the page. Thirty-four gives the bottom of the figure mass and
// gives the composition a base to stand on - which is the honest reading as
// well as the better one, because infrastructure has depth under its surface
// and a rug does not.
const PLANE_T = 34
const PLANE = roundedSlab(CX, PLANE_Y, PLANE_X, PLANE_Z, PLANE_T, 30)
const PLAN = project(CX, PLANE_Y)

/* THREE DISTRICTS, AND THE THREE THINGS THAT WERE WRONG WITH THEM.

   They were strung along one plan axis at one plan depth, at one size, on one
   level. Which is a row of beads on a wire: the plane had a whole second axis
   and the drawing never used it, so however much air went in above the floor
   the floor itself stayed one-dimensional and the screen's vertical read had
   nothing in it but three things side by side.

   All three of the depth cues a parallel projection has are now in use, and
   each one is doing the same job:

   STAGGERED IN BOTH PLAN AXES. Sponsors sit back and left, the site in the
   middle, patients forward and right - a diagonal through the plan rather than
   a line across it. That is a hundred and eighty pixels of screen height
   between the far district and the near one, where there used to be none.

   SIZED BY DISTANCE. The far district is the smallest and the near one is the
   largest, so the stagger is confirmed by scale instead of having to be
   inferred from position alone.

   AND THEY ARE NOT ON ONE LEVEL UNTIL THEY ARE FIXED. See `drop`. */
/* Plan positions, named once and used twice - by the districts that stand on
   them and by the camera that flies to them. Two copies of the same coordinate
   is how a camera ends up looking at where a district used to be. */
const AT = {
  sponsors: [-330, -90],
  sites: [0, 0],
  patients: [330, 90],
}

const ZONES = [
  {
    key: 'sponsors',
    at: AT.sponsors,
    r: 78,
    // How far out of true this district sits while the ground is still broken.
    // Two are sunk and one is heaved, because ground that has failed does not
    // fail in one direction - and three different offsets is three different
    // screen heights, which is the whole of what the vertical axis was missing.
    drop: 22,
    pill: 'SPONSORS',
    before: 'A protocol leaves a sponsor as a document. Every site rebuilds it by hand, differently.',
    after: 'One versioned protocol, executed the same way at every site, with its evidence attached.',
  },
  {
    key: 'sites',
    at: AT.sites,
    r: 104,
    drop: -16,
    pill: 'SITES',
    before: 'Twenty-odd systems, none built for research, and a person carrying work between them.',
    after: 'Governed agents on ground the site controls. Records stay put; decisions are signed there.',
  },
  {
    key: 'patients',
    at: AT.patients,
    r: 92,
    drop: 32,
    pill: 'PATIENTS',
    before: 'Whether a patient can join a trial depends on the building they can reach that week.',
    after: 'Participation stops depending on geography. The trial runs where care already happens.',
  },
].map((zone) => {
  const [sx, sy] = PLAN(zone.at[0], zone.at[1])
  return {
    ...zone,
    // Where the district stands on the sheet, and the tile it stands on. Each
    // district is now its own plate rather than a disc drawn on a shared plane,
    // which is what lets it sit out of true while the ground is broken and come
    // level when it is fixed.
    screen: [sx, sy],
    tile: roundedSlab(sx, sy, zone.r + 8, zone.r + 8, 13, 24),
    // Depth order: further along the plan diagonal is nearer the reader.
    depth: zone.at[0] + zone.at[1],
  }
}).sort((a, b) => a.depth - b.depth)

/**
 * A district's population, scattered inside its own tile on a stable pseudo
 * random walk rather than on a grid. A grid would read as a table of contents;
 * what this has to read as is a place with things in it.
 *
 * The coordinates are LOCAL to the tile now. A district is a plate that stands
 * out of true until it is fixed, so everything on it has to travel with it -
 * which it cannot do if its solids are positioned against a plane it is no
 * longer level with.
 *
 * `kind` is the only thing telling the three districts apart, because nothing
 * here is lettered: sponsors are upright blocks, the site is a dense low works,
 * patients are round solids. Three silhouettes, three populations.
 */
/* THREE POPULATIONS, AND THEY HAVE TO BE THREE SILHOUETTES.

   Nothing on this sheet is lettered, so the only thing telling a reader which
   district they are looking at is what is standing in it. That put the whole
   weight of the distinction on `kind` - and for a long time two of the three
   kinds were the same object at slightly different heights, so sponsors and
   sites came out as two identical fields of blue cubes and the sheet read as
   the same place drawn three times.

   They are now three genuinely different builds, and each one is the shape its
   own population actually has:

   TOWERS, for sponsors. Few and tall and narrow. A handful of very large
   institutions, and the drawing says so by putting five things on the plate
   instead of fourteen.

   WORKS, for the site. Many, low, and packed tight - the densest thing on the
   sheet, because a site really is running twenty-odd systems in one building
   and that is the entire complaint.

   PODS, for patients. Small, round, and far apart, because that is what
   coverage looks like when it depends on the building somebody can reach. */

const BUILDS = {
  towers: { count: 5, inner: 0.24, spread: 0.9, base: 34, rise: 46, half: 7, grow: 4 },
  works: { count: 15, inner: 0.4, spread: 0.98, base: 7, rise: 15, half: 9, grow: 6 },
  pods: { count: 8, inner: 0.3, spread: 0.94, base: 12, rise: 15, half: 5, grow: 4 },
}

/**
 * A district's population, scattered inside its own tile on a stable pseudo
 * random walk rather than on a grid. A grid would read as a table of contents;
 * what this has to read as is a place with things in it.
 *
 * The coordinates are LOCAL to the tile. A district is a plate that stands out
 * of true until it is fixed, so everything on it has to travel with it - which
 * it cannot do if its solids are positioned against a plane it is no longer
 * level with.
 */
function populate(zone, kind, salt) {
  const build = BUILDS[kind]
  // The site district is drawn round a hole, because the drum stands in it. A
  // district that fills its own centre has nothing at its centre.
  const grain = zone.r / 96
  return Array.from({ length: build.count }, (_, index) => {
    const angle = jitter(index, salt) * Math.PI * 2
    const radius = (build.inner + jitter(index, salt + 5) * (build.spread - build.inner)) * (zone.r - 14)
    const x = Math.round(Math.cos(angle) * radius)
    const y = Math.round(Math.sin(angle) * radius * 0.88)
    const grade = jitter(index, salt + 11)
    const tall = Math.round((build.base + grade * build.rise) * grain)
    const half = Math.round((build.half + grade * build.grow) * grain)
    return {
      key: `${zone.key}-${index}`,
      zone: zone.key,
      kind,
      // Depth order within the tile, so a solid in front occludes the one
      // behind it. Fifteen solids in list order is a pile.
      depth: x + y,
      round: kind === 'pods',
      solid: kind === 'pods'
        ? planCyl(x, y, half, tall)
        : planPrism(x, y, half, half, tall, 4),
      life: jitter(index, salt + 17),
      wave: Math.round(((x + y + 200) / 400) * 100) / 100,
      // How far back inside its own tile the solid stands, for the air.
      far: 0,
    }
  }).sort((a, b) => a.depth - b.depth)
}

const KINDS = { sponsors: 'towers', sites: 'works', patients: 'pods' }
const SALTS = { sponsors: 3, sites: 19, patients: 41 }

// The air, solved per district rather than across the whole sheet: a solid is
// faded by how far back it stands inside its own tile, and the tile itself is
// faded by how far back the district stands on the ground. Two ramps, and they
// compound - which is what makes the far district read as further away rather
// than merely smaller.
const POPULATED = ZONES.map((zone) => {
  const items = populate(zone, KINDS[zone.key], SALTS[zone.key])
  const near = items[items.length - 1].depth
  const back = items[0].depth
  return {
    ...zone,
    items: items.map((item) => ({
      ...item,
      far: Math.round(((near - item.depth) / (near - back || 1)) * 100) / 100,
    })),
    // Zero at the front of the ground, one at the back.
    haze: 0,
  }
})

const FAR = Math.min(...POPULATED.map((zone) => zone.depth))
const FORE = Math.max(...POPULATED.map((zone) => zone.depth))
const DISTRICTS = POPULATED.map((zone) => ({
  ...zone,
  haze: Math.round(((FORE - zone.depth) / (FORE - FAR)) * 100) / 100,
}))

const BY_ZONE = Object.fromEntries(DISTRICTS.map((zone) => [zone.key, zone]))

/* -- THE CAMERA -----------------------------------------------------------

   THE ONE THING THE FIGURE WAS MISSING, AND THE REASON IT READ AS FLAT.

   Every version of this drawing until now framed the whole world at once and
   held perfectly still while the world changed inside the frame. That is a
   diagram with an animation playing in it. A reader is outside it, looking in,
   and no amount of motion inside a fixed frame will make them feel otherwise -
   the frame is the thing that says where they are standing.

   So the camera moves. It opens wide on the whole broken world, flies in and
   tracks along the plan diagonal - sponsors, then the site, then patients -
   and pulls back at the end onto a world that is now one surface. Scroll is
   the only thing driving it, which is what turns the reader's gesture from
   "leave this section" into "travel across it".

   The pull-back at the end is the beat that matters. You are shown the whole
   thing broken, taken down into it for three beats, and lifted back out over
   something that has been repaired while you were inside it.

   `lift` sets a district BELOW the middle of the frame rather than at it, so
   the plates still hanging in the air above that district stay in shot. A
   camera centred on the ground crops off the half of the argument that is not
   on it. */

function camera(target, k, lift = 0) {
  return {
    k,
    x: Math.round(-(target[0] - CX) * k),
    y: Math.round(-(target[1] - lift - MID_Y) * k),
  }
}

/**
 * THE CAMERA IS SCRUBBED, NOT TRANSITIONED, AND THAT IS THE WHOLE DIFFERENCE.
 *
 * It used to hold a stop per beat and let the stylesheet ease between them. The
 * flight was correct and it felt wrong, for one reason: an eased transition
 * runs on ITS OWN clock. The reader turns the wheel, the beat flips, and the
 * camera then takes a second and a half to catch up on a timer nobody is
 * driving. Every frame in between is the drawing moving while the hand is
 * still, or the hand moving while the drawing is still, and that is exactly
 * what "not synced" is.
 *
 * So the camera is a pure function of scroll. `cameraAt` interpolates between
 * the stops on the raw progress value - no easing between gesture and frame, no
 * CSS transition on the way out - and it is written straight to custom
 * properties, so the whole flight runs on the compositor without React ever
 * hearing about it.
 *
 * The stops are anchored at the MIDDLE of each beat rather than at its edge. A
 * camera parked at a boundary would be moving fastest exactly where the state
 * changes, which puts the two loudest events in the section on top of each
 * other; anchored at the centre it is nearly still when a district stands, and
 * does its travelling in between.
 */
const CLOSE = 1.12
const CAMS = {
  // Wide enough to hold the plane's own edges, because the edge of the ground
  // is what says this is a place with a size rather than a field with no end.
  wide: camera([CX, PLANE_Y - 58], 1.02),
  sponsors: camera(PLAN(...AT.sponsors), CLOSE, 38),
  sites: camera(PLAN(...AT.sites), CLOSE, 54),
  patients: camera(PLAN(...AT.patients), CLOSE, 24),
  // The last frame sits a touch closer than the first, so the world you are
  // lifted back out over is not the identical shot you started on.
  home: camera([CX, PLANE_Y - 46], 1.06),
}

// THE DRUM, AND IT IS THE ONE THING ON THE FLOOR THAT GOES UP.
//
// It is the Damaros mark built as geometry rather than pasted on as a logo: the
// monogram is two stacked forms, so this is two stacked plan cylinders with the
// lower one wider, at the exact middle of the floor, with every route in the
// figure running into its foot.
//
// It used to be thirty-six units tall on a sheet with nothing else vertical in
// it, which is to say a coin lying in the middle of a rug. It now stands on a
// plinth: fifty-four units against works of twenty-four, so the composition has
// a vertical axis at its centre and the eye has somewhere to arrive. Narrow
// rather than broad, because height is what makes an accent and width only made
// it a tank.
const DRUM_R = 21
const DRUM_BASE = planCyl(0, 4, DRUM_R + 7, 10)
const DRUM_LOW = planCyl(DRUM_BASE.top.cx, DRUM_BASE.top.cy, DRUM_R, 24)
const DRUM_TOP = planCyl(DRUM_LOW.top.cx, DRUM_LOW.top.cy, DRUM_R - 5, 20)
const DRUM_CAP = { cx: DRUM_TOP.top.cx, cy: DRUM_TOP.top.cy, r: DRUM_R - 5 }

/* -- HOW THE THREE DISTRICTS ARE JOINED -----------------------------------

   THE OLD ANSWER WAS A DOTTED LINE, AND A DOTTED LINE IS NOT INFRASTRUCTURE.

   Every other object in this figure is a SOLID - projected from plan, extruded,
   with skirt faces catching the light. The routes were strokes drawn on top of
   the floor, which is why they read as annotation ON a drawing rather than as
   part of the world: a stroke has no thickness in the projection, so it never
   belonged to the same space as the things it was joining.

   So the route is a solid too. One conduit, running the plan line that happens
   to pass exactly through all three districts, at floor level - it goes UNDER
   each tile and comes out the other side, the way a service run does. What the
   reader sees is the two spans crossing the open ground between them.

   AND THE BROKEN STATE IS NOT A BROKEN CONDUIT. It is no conduit at all, and
   the work going over the gap BY HAND: a packet lifts off one district, arcs
   through the air, and comes down on the next. That arc is the only thing in
   the whole figure that leaves the ground plane - which is exactly what it
   costs a site to move work today. When the ground is fixed the arc stops, the
   span lights, and the same packet travels flat, fast, and without being picked
   up by anybody. */

const SPAN_U = (() => {
  const dx = AT.patients[0] - AT.sponsors[0]
  const dy = AT.patients[1] - AT.sponsors[1]
  const len = Math.hypot(dx, dy)
  return [dx / len, dy / len]
})()

const along = (from, distance) => [
  Math.round(from[0] + SPAN_U[0] * distance),
  Math.round(from[1] + SPAN_U[1] * distance),
]

/**
 * A bar lying on the floor between two plan points, extruded downward - built
 * the way every other solid on this sheet is built, so it is lit by the same
 * projection rather than drawn over it.
 *
 * Which two of the four skirts are visible depends on which way the bar runs,
 * and it is answered rather than assumed: an edge is on the near hull when its
 * screen midpoint sits below the quad's own centre, and only those are drawn.
 * Drawing all four lays the far skirts across the top face, which is the
 * classic way an extruded quad comes out looking inside-out.
 */
function planBar(from, to, half, depth) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = (-dy / len) * half
  const ny = (dx / len) * half
  const top = [
    [from[0] + nx, from[1] + ny],
    [to[0] + nx, to[1] + ny],
    [to[0] - nx, to[1] - ny],
    [from[0] - nx, from[1] - ny],
  ].map(([x, y]) => PLAN(x, y))
  const mid = top.reduce((sum, point) => [sum[0] + point[0] / 4, sum[1] + point[1] / 4], [0, 0])
  const skirts = []
  top.forEach((a, index) => {
    const b = top[(index + 1) % 4]
    if ((a[1] + b[1]) / 2 <= mid[1]) return
    skirts.push(`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${b[0]} ${b[1] + depth} L ${a[0]} ${a[1] + depth} Z`)
  })
  const [ax, ay] = PLAN(...from)
  const [bx, by] = PLAN(...to)
  return { top: pts(top), skirts, line: `M ${ax} ${ay} L ${bx} ${by}` }
}

const CLEAR = { sponsors: 88, sites: 114, patients: 102 }

/**
 * The two open spans, and the carried arc that stands in for each while the
 * ground under it is still broken.
 *
 * IT IS ON THE SAME GRID AS EVERYTHING ELSE. The first pass drew it as a
 * screen-space curve, on the argument that this is the one thing not lying on
 * the floor. That was true and it was the wrong conclusion: a squashed
 * isometric has a perfectly good height axis - it is straight up the screen -
 * so a lift IS expressible in the projection, and a smooth bezier was the only
 * mark in the figure with no axonometric cue on it at all. It read as a line
 * drawn over the drawing rather than as a movement inside it.
 *
 * So it is three legs on the grid: straight UP the height axis, ALONG the plan
 * line at height, and straight DOWN again. That is what carrying something
 * looks like - lift, traverse, set down - and every one of those legs is a real
 * direction in this projection. Vias at both corners, the way every other bend
 * in the three figures is marked, because a corner with nothing at it is a line
 * that changed its mind.
 */
const SPANS = [
  { key: 'in', from: 'sponsors', to: 'sites', bow: 104, life: 0.1 },
  { key: 'out', from: 'sites', to: 'patients', bow: 88, life: 0.58 },
].map((span) => {
  const a = AT[span.from]
  const b = AT[span.to]
  const gap = Math.hypot(b[0] - a[0], b[1] - a[1])
  const start = along(a, CLEAR[span.from])
  const end = along(a, gap - CLEAR[span.to])
  const [sx, sy] = PLAN(...start)
  const [ex, ey] = PLAN(...end)
  // Off the tile tops rather than off the floor beside them: a packet is picked
  // up from the district, not from the ground next to it.
  const deck = 16
  const high = deck + span.bow
  return {
    ...span,
    bar: planBar(start, end, 9, 7),
    carry: `M ${sx} ${sy - deck} L ${sx} ${sy - high} L ${ex} ${ey - high} L ${ex} ${ey - deck}`,
    corners: [[sx, sy - high], [ex, ey - high]],
  }
})

// THE FRAGMENTED WORLD, in the air.
//
// Nine plates, at nine heights, on no axis at all - which is the one property
// they have to have, because the whole of what is wrong up there is that
// nothing was ever laid out together. Each one belongs to a district and hangs
// on a hairline down to the place on the ground its work belongs, so the
// distance the work is being held at is drawn rather than described.
//
// `motif` is what the plate is holding, and there are only three, because a
// general-purpose system holds only three kinds of thing: rows, a sheet of
// cells, or a page. None of them is something that runs.
// SIZE IS DISTANCE, AND IT IS THE HALF OF THIS THAT WAS MISSING.
//
// These were nine plates of roughly one size at nine positions, which is not a
// depth field - it is a pattern, and a pattern lies flat however far apart you
// scatter it. They are now nine plates at nine SIZES, ramped with how low each
// one sits on the sheet: twenty-two units at the back, forty-four at the front,
// and the ink ramps with the size. Same nine objects, nine distances.
//
// The top left is deliberately empty. The dek is set into it - see the section
// stylesheet - so the sentence sits inside the space the figure is drawing
// rather than in a band above it, and nothing here may drift into that corner.
/* THE SKY IS THE SUBJECT, AND IT IS WHAT ACTUALLY CHANGES.

   For three versions the cloud was scenery: nine plates hung in the air, and
   the run made them fade out. Fading is not a transformation - it is a thing
   being deleted - and it left the whole argument resting on three tiles that
   look broadly the same at the start and the end.

   So the sky does the work now, in three states, and the reader watches all
   three:

   SCATTERED. Nine plates at nine heights on no axis at all, each tethered down
   to the place on the ground its work actually belongs. That is the world as
   found, and the tethers are what say it: the work is up here, and where it
   belongs is down there.

   RANKED. On the first scroll they STOP and SORT - each district's plates
   pulling into an ordered stack directly above the district that owns them,
   evenly spaced, largest at the bottom. Nothing has moved to the ground yet and
   nothing has been fixed; what changed is that the mess became a schedule. It
   is the single largest visual change in the figure and it happens immediately,
   because the first thing a reader does with a pinned section is test whether
   scrolling does anything at all.

   LANDED. Then, district by district, each stack comes DOWN and becomes the
   ground: the plates travel into the tile below them and the solids stand up
   out of it. The sky empties from the far end forward, and by the last beat
   there is nothing overhead at all - which is the whole claim, drawn.

   Three positions per plate, one transform, and the stylesheet moves between
   them. The geometry is built once at the scattered position; ranked and landed
   are offsets from it, so a plate is always the same object in three places
   rather than three objects pretending to be one. */

/* A rank sits above its district AND clear to the right of it. Directly above
   was the obvious placement and it walked the far district's stack straight
   into the corner the sentence occupies - the one region of this sheet nothing
   is allowed into. Seventy units to the right costs the alignment nothing and
   buys the type its corner back. */
const RANK_LIFT = 104
const RANK_STEP = 38
const RANK_SHIFT = 96

const RAW_SHARDS = [
  { zone: 'sponsors', to: [-386, -128], at: [664, 196], size: 23, motif: 'page' },
  { zone: 'sponsors', to: [-296, -50], at: [504, 244], size: 20, motif: 'rows' },
  { zone: 'sponsors', to: [-352, -34], at: [366, 232], size: 28, motif: 'cells' },
  { zone: 'sites', to: [-58, -46], at: [512, 258], size: 26, motif: 'rows' },
  { zone: 'sites', to: [66, 26], at: [704, 228], size: 23, motif: 'cells' },
  { zone: 'sites', to: [4, 70], at: [606, 350], size: 33, motif: 'page' },
  { zone: 'patients', to: [288, 40], at: [744, 408], size: 29, motif: 'cells' },
  { zone: 'patients', to: [392, 122], at: [930, 448], size: 26, motif: 'rows' },
  { zone: 'patients', to: [326, 148], at: [826, 522], size: 36, motif: 'rows' },
]

const RANKED = {}
const SHARDS = RAW_SHARDS.map((shard, index) => {
  const plate = roundedSlab(shard.at[0], shard.at[1], shard.size, shard.size, 8, 10)
  const [gx, gy] = PLAN(shard.to[0], shard.to[1])
  const home = BY_ZONE[shard.zone].screen
  // Largest at the bottom of its own stack, so a rank reads as sorted rather
  // than as merely aligned.
  const seat = RANKED[shard.zone] ?? (RANKED[shard.zone] = [])
  seat.push(shard)
  const order = seat.length - 1
  return {
    ...shard,
    index,
    key: `shard-${index}`,
    plate,
    // WHERE IT GOES WHEN THE MESS BECOMES A SCHEDULE: directly over the district
    // that owns it, on the district's own centre line, evenly spaced.
    rank: [
      Math.round(home[0] + RANK_SHIFT - shard.at[0]),
      Math.round(home[1] - RANK_LIFT - order * RANK_STEP - shard.at[1]),
    ],
    // AND WHERE IT GOES WHEN IT LANDS: into the tile, which is the moment the
    // thing overhead stops being separate from the ground.
    land: [Math.round(home[0] - shard.at[0]), Math.round(home[1] - 8 - shard.at[1])],
    // How far this plate swings against the pointer, and how far back it reads.
    // Both come from its own height on the sheet: the ones held highest are
    // furthest away, so they swing widest and carry the least ink.
    sway: Math.round((6 + (532 - shard.at[1]) * 0.022) * 10) / 10,
    haze: Math.round(((532 - shard.at[1]) / 440) * 100) / 100,
    // The hairline runs from the plate's own front corner to the ground point,
    // never from its middle: a leader that starts inside a solid is a leader
    // drawn over it.
    leader: `M ${plate.front[0]} ${plate.front[1] + 8} L ${gx} ${gy}`,
    ground: [gx, gy],
    life: jitter(index, 61),
  }
})

const MOTIFS = {
  rows: [-7, 0, 7].map((y) => <rect className="dgm-inertmark" key={y} x="-13" y={y - 1.8} width="26" height="3.6" rx="1.8" />),
  cells: [-7, 0, 7].flatMap((y) => [-8, 0, 8].map((x) => (
    <rect className="dgm-inertmark" key={`${x}:${y}`} x={x - 3} y={y - 3} width="6" height="6" rx="1.4" />
  ))),
  page: [
    <rect className="dgm-inertmark is-open" key="sheet" x="-11" y="-13" width="22" height="26" rx="3" />,
    ...[-5, 1, 7].map((y) => <rect className="dgm-inertmark" key={y} x="-6" y={y - 1.2} width="12" height="2.4" rx="1.2" />),
  ],
}

// `up` is which districts have been cleaned up and stood, in the order the work
// moves: a protocol leaves a sponsor, a site executes it, a patient is reached.
// Everything else on the sheet reads off it - which plates have gone, which
// routes carry, whether the drum is running - so nothing can disagree with
// anything else.
/* SIX BEATS, AND THE FIRST TWO ARE SHORT ON PURPOSE.

   The run used to open on two and a half screens of a world that did nothing.
   The reasoning was that the fracture needs to be sat in - which is true of a
   still figure and false of a pinned one, because the first thing a reader does
   inside a pin is test whether scrolling moves anything at all. If the answer
   is "not yet", they have already decided the section is broken.

   So the very first scroll sorts the sky. Nothing has been fixed and nothing
   has reached the ground; what changed is that nine scattered plates became
   three ordered stacks, which is the largest single change in the figure and it
   is paid out in the first beat and a half. Everything after it is a landing.

   `up` is which districts have been cleaned up and stood, in the order the work
   moves. Everything else on the sheet reads off it - which stacks have come
   down, which spans carry, whether the drum is running - so nothing can
   disagree with anything else. */

const PHASES = [
  { span: 1.3, cam: 'wide', sky: 'scatter', up: [], drum: false, tone: 'run', status: 'AS FOUND', read: 'Nine systems, nine places, and not one of them was built to run a trial.' },
  { span: 1.4, cam: 'wide', sky: 'rank', up: [], drum: false, tone: 'run', status: 'SORTED', read: 'Sorted, and nothing is fixed yet. Every system now belongs to somebody who answers for it.' },
  { span: 1.5, cam: 'sponsors', sky: 'rank', up: ['sponsors'], drum: false, tone: 'pass', status: 'PROTOCOL', read: 'The protocol stops being a document to re-type. It arrives as something that executes.' },
  { span: 1.5, cam: 'sites', sky: 'rank', up: ['sponsors', 'sites'], drum: true, tone: 'pass', status: 'EXECUTION', read: 'The site runs it on its own ground, under governed agents, signed by a named person.' },
  { span: 1.5, cam: 'patients', sky: 'rank', up: ['sponsors', 'sites', 'patients'], drum: true, tone: 'pass', status: 'REACH', read: 'Participation stops depending on which building a patient can reach on a given week.' },
  { span: 2.4, cam: 'home', sky: 'rank', up: ['sponsors', 'sites', 'patients'], drum: true, tone: 'valid', status: 'ONE SURFACE', read: 'Nothing left overhead. Sponsors, sites and patients on one surface, end to end.' },
]

const CAM_TOTAL = PHASES.reduce((sum, item) => sum + item.span, 0)
const ANCHORS = (() => {
  let run = 0
  return PHASES.map((item) => {
    const at = (run + item.span / 2) / CAM_TOTAL
    run += item.span
    return { at, cam: CAMS[item.cam] ?? CAMS.wide }
  })
})()

const smooth = (t) => t * t * (3 - 2 * t)
const mix = (a, b, t) => a + (b - a) * t

/** Where the camera stands at a given point in the run. Pure, so it can be
 *  called from a scroll handler sixty times a second without allocating a
 *  render. */
export function cameraAt(progress) {
  const t = Math.min(1, Math.max(0, progress))
  if (t <= ANCHORS[0].at) return ANCHORS[0].cam
  const last = ANCHORS[ANCHORS.length - 1]
  if (t >= last.at) return last.cam
  const index = ANCHORS.findIndex((anchor, i) => i > 0 && t < anchor.at)
  const from = ANCHORS[index - 1]
  const to = ANCHORS[index]
  const u = smooth((t - from.at) / (to.at - from.at))
  return {
    x: Math.round(mix(from.cam.x, to.cam.x, u)),
    y: Math.round(mix(from.cam.y, to.cam.y, u)),
    k: Math.round(mix(from.cam.k, to.cam.k, u) * 1000) / 1000,
  }
}

const SEAT_STEPS = [0.12, 0.3, 0.5]

export default function ChainSchematic({ phase = 0, booted = false, animate = true, camera: camRef = null }) {
  const frame = useCenterOnOverflow()
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  // The camera is NOT read from the beat any more - the section scrubs it
  // straight onto this node off raw scroll. What is left here is a resting
  // position for the frames nobody is scrolling: reduced motion, and the first
  // paint before the trigger has reported anything.
  const cam = cameraAt(ANCHORS[phase]?.at ?? 0)

  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')
  const risen = (key) => state.up.includes(key)

  // Four things answer a pointer, and only four: the three districts and the
  // drum. What each says depends on which side of the change it is on, so the
  // figure never narrates a state it is not currently in.
  const zone = hot && hot !== 'drum' ? BY_ZONE[hot] : null
  const drum = hot === 'drum'
  const tone = drum ? 'valid' : zone ? (risen(zone.key) ? 'pass' : 'run') : state.tone
  const pill = drum ? 'DAMAROS' : zone ? zone.pill : state.status
  const read = drum
    ? 'One execution surface under all three, and every crossing over it leaves a receipt.'
    : zone ? (risen(zone.key) ? zone.after : zone.before) : state.read

  return (
    <figure className="dgm">
      {/* SLICE, NOT MEET, AND A FRAME THAT IS NOT A FRAME.

          `meet` fits the whole viewBox inside whatever box the layout gives it
          and letterboxes the remainder - which is what put a band of empty
          paper down both sides of this figure and made it read as a picture
          hung on the section rather than a place the section opens onto.
          `slice` covers instead: the drawing always fills its box and the
          overflow is cropped. The ground was enlarged to suit, so what sits at
          the crop is more ground, and the stylesheet dissolves the last few per
          cent of every edge rather than cutting it. */}
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor is-${tone}${animate ? ' is-live' : ''}${booted ? ' is-booted' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="One floor seen in axonometric projection, with a scattered world of software floating above it. In the air, nine plates hang at nine different heights on no shared axis, each holding something inert - rows, a sheet of cells, a page - and each tethered by a hairline down to the place on the ground where that work actually belongs. On the ground is a single surface in three districts: sponsors at one end drawn as upright blocks, patients at the other drawn as round solids, and the site between them as a dense low works. At the exact middle stands the Damaros drum, two stacked cylinders, and routes run through it from one district to the next carrying packets. As the figure advances, district by district the plates overhead go out and the ground beneath them stands up out of its own footprints, the routes light and the drum begins to run - until the air holds only faint ghosts of what was there and the floor is one lit, populated, moving surface."
        >
          <defs>
            <pattern id="fl-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            {/* THREE GROUNDS, THREE TEXTURES.

                Silhouette and clock already told the three districts apart; the
                surface each one stands on did not, so all three read as the
                same plate with different things on it. Each now has a ground of
                its own, and each is what that population's ground actually is -
                a sponsor's is ruled and sparse, a site's is a dense working
                grid, and a patient's is scattered and mostly empty. */}
            <pattern id="fl-sponsors" width="18" height="18" patternUnits="userSpaceOnUse">
              <path className="dgm-rule" d="M 0 0 L 18 0" />
            </pattern>
            <pattern id="fl-sites" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="1" cy="1" r="0.75" />
            </pattern>
            <pattern id="fl-patients" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle className="dgm-grainring" cx="4" cy="4" r="1.6" />
            </pattern>
            {/* The air. One soft field on the sheet under the floor, centred on
                the drum, so the ground the figure stands on is lit from the
                middle of the thing that is running rather than being flat
                paper. It is the only gradient in any of the three figures, and
                it is here because this is the only one of them that is a place
                rather than an instrument. */}
            <radialGradient id="fl-air" cx="50%" cy="50%" r="50%">
              <stop className="dgm-air-in" offset="0%" />
              <stop className="dgm-air-out" offset="100%" />
            </radialGradient>
          </defs>

          {/* EVERYTHING THE CAMERA CAN SEE RIDES IN HERE.

              One group, one transform, and it is a translate and a scale rather
              than anything the page has to render twice. The stops are per beat
              and the stylesheet eases between them, so the flight is a move a
              reader watches happen at its own pace instead of a scrub that
              stalls when they stop turning the wheel and runs backwards when
              they scroll up. */}
          <g
            className="fl-cam"
            ref={camRef}
            style={{ '--cam-x': `${cam.x}px`, '--cam-y': `${cam.y}px`, '--cam-k': cam.k }}
          >
          <ellipse className="dgm-air" cx={CX} cy={PLANE_Y + 30} rx="470" ry="230" fill="url(#fl-air)" />

          {/* THE TWO LAYERS ARRIVE AT TWO RATES.

              The cloud comes up off `--spread` and every solid on the floor
              stands out of its own footprint off the same number a beat later,
              so the sheet separates into two layers as a reader reaches it
              rather than being handed to them already apart. That is the whole
              of the depth here - two flat, projected layers on two clocks -
              and it is what an axonometric can do without a third dimension the
              page has to download. */}

          {/* The ground's own shade. One plane held over a sheet needs occlusion
              under it or it is printed further down the page rather than laid on
              it. */}
          <g className="dgm-seat is-floor">
            <g transform={planSpace(CX, PLANE_Y + 5)}>
              {SEAT_STEPS.map((fraction) => (
                <rect
                  className="dgm-seatstep"
                  key={fraction}
                  x={-PLANE_X + Math.round(PLANE_X * fraction * 0.2)}
                  y={-PLANE_Z + Math.round(PLANE_Z * fraction)}
                  width={(PLANE_X - Math.round(PLANE_X * fraction * 0.2)) * 2}
                  height={(PLANE_Z - Math.round(PLANE_Z * fraction)) * 2}
                  rx="26"
                />
              ))}
            </g>
          </g>

          {/* THE GROUND, AND IT IS BROKEN UNTIL IT IS FIXED.

              The continuous slab is the surface all three districts are meant
              to be on, and it is not there at the start. It arrives as they
              come level - a third of it per district - so the last thing to
              appear in the figure is the thing the whole section is claiming
              exists. */}
          <g className="dgm-floor" style={{ '--knit': state.up.length / ZONES.length }}>
            <Faces shape={PLANE} className="dgm-solid" />

            <g transform={planSpace(CX, PLANE_Y)}>
              <rect className="dgm-planefill" x={-PLANE_X} y={-PLANE_Z} width={PLANE_X * 2} height={PLANE_Z * 2} rx="30" fill="url(#fl-grain)" />
            </g>
          </g>

          {/* THE CONDUIT, IN ABSOLUTE SHEET COORDINATES.

                Everything else on the floor is drawn inside the plane's own
                plan space; the spans are not, because they are solved against
                the district plan positions rather than against the plane, and a
                thing measured from two different origins is a thing that will
                eventually be drawn in two different places.

                Drawn before the tiles, so a district occludes the run passing
                under it - which is what makes it read as a service run through
                the ground rather than as a line painted between two objects. */}
          {SPANS.map((span) => {
            const joined = risen(span.from) && risen(span.to)
            return (
              <g className={`fl-span${joined ? ' is-up' : ''}${lit(span.from)}${lit(span.to)}`} key={span.key} style={{ '--life': span.life }}>
                {span.bar.skirts.map((skirt) => <path className="dgm-face-right" d={skirt} key={skirt} />)}
                <polygon className="dgm-face-top" points={span.bar.top} />
                <path className="fl-flow" d={span.bar.line} pathLength="100" vectorEffect="non-scaling-stroke" />
              </g>
            )
          })}

          {/* THE DISTRICTS, EACH ON ITS OWN PLATE.

              They used to be three discs drawn on one plane, strung along one
              plan axis at one depth, one size and one level - a row of beads on
              a wire, which is why the sheet had nothing in its vertical read but
              three things side by side.

              Every depth cue a parallel projection has is now carrying the same
              statement. They are staggered across BOTH plan axes, so the far one
              is a hundred and eighty pixels up the sheet from the near one. They
              are sized by that distance, so the stagger is confirmed by scale
              rather than inferred from position. And until its district is
              fixed each plate sits out of true - two sunk, one heaved - so the
              ground is visibly broken and the fix is visibly a fix.

              Drawn back to front, so a near district occludes the one behind it.
              Everything a district owns rides inside its own group, because a
              plate that moves has to take its buildings with it. */}
          {DISTRICTS.map((zone) => (
            <g
              className={`dgm-district-tile${risen(zone.key) ? ' is-level' : ''}${lit(zone.key)}`}
              key={zone.key}
              style={{ '--drop': `${zone.drop}px`, '--haze': zone.haze }}
              {...probe(zone.key)}
            >
              <Faces shape={zone.tile} className="dgm-solid" />

              <g transform={planSpace(zone.screen[0], zone.screen[1])}>
                <rect
                  className="dgm-tilefill"
                  x={-zone.r - 8}
                  y={-zone.r - 8}
                  width={(zone.r + 8) * 2}
                  height={(zone.r + 8) * 2}
                  rx="24"
                  fill={`url(#fl-${zone.key})`}
                />
                <rect className="dgm-hit" x={-zone.r - 8} y={-zone.r - 8} width={(zone.r + 8) * 2} height={(zone.r + 8) * 2} rx="24" />

                {/* WHAT EACH PLATE OVERHEAD PUTS ON THIS TILE.

                    The one cue that cannot be read any other way - it says this
                    is above that - and it has to be drawn ON the district,
                    because a tile stands thirteen units proud of the ground and
                    a shadow cast onto the floor beneath it is a shadow nobody
                    can see. Wider and weaker the higher its plate is held,
                    which is what height looks like from underneath. */}
                {SHARDS.filter((shard) => shard.zone === zone.key).map((shard) => (
                  <ellipse
                    className={`dgm-cast${risen(zone.key) ? ' is-gone' : ''}${lit(zone.key)}`}
                    key={`cast-${shard.key}`}
                    cx={shard.to[0] - zone.at[0]}
                    cy={shard.to[1] - zone.at[1]}
                    rx={shard.size * (0.72 + shard.haze * 0.5)}
                    ry={shard.size * (0.72 + shard.haze * 0.5) * 0.92}
                    style={{ '--haze': shard.haze }}
                  />
                ))}

                {zone.items.map((item) => (
                  <g
                    className={`dgm-plot ${item.kind}${risen(zone.key) ? ' is-up' : ''}${lit(zone.key)}`}
                    key={item.key}
                    style={{ '--life': item.life, '--wave': item.wave, '--far': item.far, '--lift': `${item.solid.step}px` }}
                  >
                    {item.round ? (
                      <>
                        <path className="dgm-face-right" d={item.solid.wall} />
                        <circle className="dgm-plotcap" cx={item.solid.base.cx} cy={item.solid.base.cy} r={item.solid.r} />
                      </>
                    ) : (
                      <>
                        <path className="dgm-face-left" d={item.solid.faceLeft} />
                        <path className="dgm-face-right" d={item.solid.faceRight} />
                        <polygon className="dgm-plotcap" points={item.solid.base} />
                      </>
                    )}
                  </g>
                ))}

                {/* THE DRUM stands in the site district and travels with it,
                    because it is on that ground and not beside it. */}
                {zone.key === 'sites' && (
                  <g className={`dgm-drum${state.drum ? ' is-up' : ''}${lit('drum')}`} {...probe('drum')}>
                    <path className="dgm-face-right" d={DRUM_BASE.wall} />
                    <circle className="dgm-drumhead is-plinth" cx={DRUM_BASE.top.cx} cy={DRUM_BASE.top.cy} r={DRUM_BASE.r} />
                    <path className="dgm-face-right" d={DRUM_LOW.wall} />
                    <circle className="dgm-drumhead" cx={DRUM_LOW.top.cx} cy={DRUM_LOW.top.cy} r={DRUM_LOW.r} />
                    <path className="dgm-face-right" d={DRUM_TOP.wall} />
                    <circle className="dgm-drumhead" cx={DRUM_CAP.cx} cy={DRUM_CAP.cy} r={DRUM_CAP.r} />
                    <circle className="dgm-drumring" cx={DRUM_CAP.cx} cy={DRUM_CAP.cy} r={DRUM_CAP.r - 6} pathLength="100" vectorEffect="non-scaling-stroke" />
                    <circle className="dgm-hit" cx={DRUM_BASE.base.cx} cy={DRUM_BASE.base.cy} r={DRUM_R + 14} />
                  </g>
                )}
              </g>
            </g>
          ))}

          {/* THE WORK GOING OVER BY HAND.

              Drawn after the districts because it passes OVER them, and it is
              the only curve on the sheet - which is the point. Everything that
              belongs to the floor is straight and lies on it; this is work
              being lifted off the ground to get somewhere, and it stops the
              moment there is ground to carry it instead. */}
          {SPANS.map((span) => {
            const joined = risen(span.from) && risen(span.to)
            return (
              <g className={`fl-carry${joined ? ' is-done' : ''}${lit(span.from)}${lit(span.to)}`} key={`carry-${span.key}`} style={{ '--life': span.life }}>
                <path className="fl-carrypath" d={span.carry} vectorEffect="non-scaling-stroke" />
                {span.corners.map((corner) => (
                  <circle className="fl-corner" key={`${corner[0]}`} cx={corner[0]} cy={corner[1]} r="2.6" />
                ))}
                {/* A plan square, projected - so the parcel is a solid lying in
                    the same world as the ground it is being carried over. A
                    circle is the one shape with no orientation, which makes it
                    the one shape that can never be on the grid. */}
                <polygon className="fl-parcel" points={`0,-3.1 7.8,0 0,3.1 -7.8,0`}>
                  <animateMotion dur="4.6s" repeatCount="indefinite" path={span.carry} keyPoints="0;0;1;1" keyTimes="0;0.18;0.72;1" calcMode="spline" keySplines="0 0 1 1;0.45 0 0.2 1;0 0 1 1" />
                </polygon>
              </g>
            )
          })}

          {/* THE FRAGMENTED WORLD. Drawn last, because it is above everything -
              and every leader is drawn before its plate, so a hairline arrives
              at the underside of the thing it is holding up rather than being
              laid across its face. */}
          {SHARDS.map((shard) => (
            <g
              className={`dgm-shard is-${risen(shard.zone) ? 'landed' : state.sky}${lit(shard.zone)}`}
              key={shard.key}
              style={{
                '--life': shard.life,
                '--sway': `${shard.sway}px`,
                '--haze': shard.haze,
                '--rank-x': `${shard.rank[0]}px`,
                '--rank-y': `${shard.rank[1]}px`,
                '--land-x': `${shard.land[0]}px`,
                '--land-y': `${shard.land[1]}px`,
                '--order': shard.index,
              }}
              {...probe(shard.zone)}
            >
              <path className="dgm-tether" d={shard.leader} />
              <circle className="dgm-tetherfoot" cx={shard.ground[0]} cy={shard.ground[1]} r="2.6" />
              <Faces shape={shard.plate} className="dgm-solid" />
              <g className="dgm-inert" transform={planSpace(shard.at[0], shard.at[1])}>{MOTIFS[shard.motif]}</g>
            </g>
          ))}
          </g>

        </svg>
      </div>

      {/* THE READOUT IS A CAPTION, NOT PART OF THE DRAWING.

          The other two sheets letter their readout inside the SVG, which is
          right for figures that are lettered throughout - it is one more label
          among many, set in the same units as the rest of them.

          Nothing is written on this one. A drawn readout would have been the
          only text on the sheet AND tied to the drawing's scale, which costs
          twice on a phone: it shrinks with the figure and it pans away with it.
          Out here it is ordinary text at an ordinary size, it holds still while
          the drawing scales, a screen reader gets it as part of the document
          rather than as a label inside an image, and the SVG is left as what it
          is - a drawing with nothing written on it. */}
      <figcaption className={`dgm-readout is-${tone}`} aria-live="polite">
        <span className="dgm-readpill">{pill}</span>
        <span className="dgm-readline">{read}</span>
      </figcaption>
    </figure>
  )
}

export { PHASES as CHAIN_PHASES }

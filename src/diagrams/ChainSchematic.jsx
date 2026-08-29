import { useEffect, useRef, useState } from 'react'

import { ISO_Y, jitter, planCircle, planSpace, project, roundedBox, roundedCylinder, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * THIRTY FRAGMENTS BECOME FIVE SURFACES, ONCE.
 *
 * The figure opens as a mess: thirty tiles off every axis, wandering, belonging
 * to nothing. When the reader reaches it they draw together and set down flush
 * into five plates in a row - Protocol, Evidence, Screening, Resolve, Replay -
 * and THEY STAY THERE. That is the whole argument of the section, and an
 * argument you can watch come undone every fourteen seconds is not an argument.
 *
 * So this does not loop. `--fuse` is a registered custom property that runs
 * 0 to 1 exactly once, latched by the reader arriving, and every calc()
 * downstream of it eases on that one timeline: the tiles travel, the six seams
 * in each group close into a single plate, the run's datum draws itself under
 * the row, and the machine on each plate comes on last.
 *
 * THE PLATE IS PAPER. WHAT STANDS ON IT IS INK. A surface drawn in blue under
 * objects drawn in blue an eighth of a step apart is a haze, and no reader can
 * tell where the plane stops and the machine on it starts. So the plate is a
 * sheet of the page's own paper with one drawn edge, everything on it carries
 * real body, and the line work is near-black.
 *
 * AND EACH PLATE IS PRINTED BEFORE IT IS BUILT ON.
 *
 * A machine standing on a blank sheet is a sticker: nothing about the surface
 * says the thing standing there belongs to it. Every plate carries its own PLAN
 * drawn in hairline on its own face inside the projection - a breaker board and
 * its bus rails, a bed and the slots material is sorted into, three targets, a
 * lane with a ram rail across it, a tape path between two reels. The machine
 * stands in its own drawing.
 *
 * THE SHEET'S LAW, THIS PASS: STRUCTURE IS FACETED, LIFE IS ROUND.
 *
 * This is clinical research, and the material the row handles is a patient's
 * own biology - so the drawing says so. The unit that runs the five stations
 * is a CELL: a plan circle carried through the projection, standing on its own
 * wall, with its nucleus printed off-centre on top. A verdict reaches it the
 * way a stain reaches a section - body first, nucleus deepest. Everything
 * built ON the plates stays faceted, because the machines are the site's own
 * structure; only the subject is alive. Every plate carries its own MEMBRANE,
 * the double wall a section drawing gives a boundary, printed inside the
 * plate's edge; where material crosses a surface it crosses through a pore -
 * Screening's three throats were always drawn as bores - and the one place
 * material leaves the run by a person's decision, Resolve's near edge, is the
 * one place the wall is drawn PARTING.
 *
 * Nothing is hoverable until the plates are down. A target on a tile still in
 * the air is a target on nothing.
 */

const W = 1200
/* TWO THIRDS OF THE CELL WAS DOING NOTHING. Measured against the assembled
   frame, the sentence ended at 62 and the first label started at 261 - two
   hundred units of blank between the claim and the thing that proves it. The
   frame is cut to what the figure, the run's datum and the sentence occupy. */
const H = 286
const CX = 600
// The row sits low, because everything above it belongs to two other things:
// the sentence, which is set into the top of this same cell, and the scatter,
// which needs somewhere to be that is not on top of the sentence.
const CY = 178

/* WHERE THE MESS IS ALLOWED TO BE.
 *
 * The scatter used to be a reach and an angle with nothing bounding it, so
 * tiles ran two hundred and seventy units above their seat - off the top of the
 * viewBox entirely, and straight through the headline that is set into the top
 * of this cell. A drawing that collides with its own sentence is a drawing
 * that has stopped being read. The floor of the box is the plate row's own
 * foot, because the band under that belongs to the lettering now. */
const KEEP = { top: 96, bottom: 224, left: 62, right: 1138 }

/* The clamp needs a PER-TILE inset, or every tile whose reach overshoots lands
   on the identical boundary pixel and the edges of the scatter grow clumps -
   which is the one thing a scatter is not allowed to have. */
const clamp = (value, low, high, slack) => Math.max(low + slack, Math.min(high - slack, value))

/* THE PACKING IS SOLVED, NOT EYEBALLED. A plan rectangle of half-extents
   (hx, hy) projects to a top face 2(hx + hy) * ISO_X wide, and a row stepped by
   (+t, -t) advances 2t * ISO_X. So planes collide unless t exceeds hx + hy. */
const CELL = 53
const TILE = 25.5
const COLS = 3
const ROWS = 2
const STEP = 136
const PLAN = project(CX, CY)
const HALF_X = 79.5
const HALF_Y = 53
/* One thickness for every surface in the drawing. A plate and the six tiles it
   is made of are the same sheet, so they are the same nine pixels of body -
   otherwise the handoff between them is a step change in an object that is
   supposed to be continuous. */
const SHEET = 9
/* Twenty, not twelve. A softer corner is most of what separates a grown
   surface from a machined one, and the plate is the largest radius in the
   figure - every other one is read against it. At twelve the plates were
   panels; at twenty they are the plan of something that was cultured rather
   than cut, without a single wobble of the outline, because an organic reading
   does not need an irregular line - it needs a radius that is not apologising
   for itself. */
const PLATE_R = 20

/* THE PITCH THE RESOLVE LINE INDEXES BY, and it is a constant because the whole
   seamlessness of that station is an arithmetic identity about it. See the
   note on the ram. */
const PITCH = 24

/* THE MEMBRANE EVERY PLATE CARRIES.

   A surface that holds the material owns a boundary, and a boundary in a
   section drawing is a DOUBLE line - the bilayer every textbook membrane is
   drawn as. It is printed in plan inside the projection like every other mark
   on a plate, inset from the edge so the plate's own corner survives it, and
   it is drawn with the PLATE rather than with the machine, because the wall
   belongs to the surface. Solids stand over it and occlude it, which is what
   a printed line under a machine does.

   Resolve's wall PARTS. The one place material leaves the run by a person's
   decision is the one place the boundary is drawn open: both lines stop short
   of the exit lane and end in terminal dots, so the gap reads as a drawn
   opening rather than a missing stretch. The gap brackets plan x 28 - where
   the ram carries the pushed cell over the edge - with a cell radius of
   clearance each side, and the printed chevron already points through it. */
const WALL_OUT = { hx: 66, hy: 40.5, r: 15 }
const WALL_IN = { hx: 63.5, hy: 38, r: 13 }
const WALL_GAP = [14, 42]

/* A rounded plan rectangle as one open stroke: from one side of the gap in the
   +y edge, the long way round, to the other. The corner arcs sweep 0 because
   the path runs counterclockwise on screen. */
const wallPath = ({ hx, hy, r }, [g0, g1]) => [
  `M ${g1} ${hy}`,
  `L ${hx - r} ${hy}`,
  `A ${r} ${r} 0 0 0 ${hx} ${hy - r}`,
  `L ${hx} ${r - hy}`,
  `A ${r} ${r} 0 0 0 ${hx - r} ${-hy}`,
  `L ${r - hx} ${-hy}`,
  `A ${r} ${r} 0 0 0 ${-hx} ${r - hy}`,
  `L ${-hx} ${hy - r}`,
  `A ${r} ${r} 0 0 0 ${r - hx} ${hy}`,
  `L ${g0} ${hy}`,
].join(' ')

const WALL_OPEN = {
  outer: wallPath(WALL_OUT, WALL_GAP),
  inner: wallPath(WALL_IN, WALL_GAP),
  ends: WALL_GAP.flatMap((x) => [[x, WALL_OUT.hy], [x, WALL_IN.hy]]),
}

/* THE VESSEL. EVERY PLATE IS A WALLED DISH NOW, NOT A SHEET WITH A LINE ON IT.

   The reference for this whole pass is the plant cell: a thick WALL you can
   see the body of, with the thin membrane just inside it. A printed bilayer
   alone reads as ruling; a wall with a top band, an outer skirt and an inner
   face you can see down into reads as a vessel - and five walled vessels in a
   row read as a culture bench, which is what a run over living material is.

   It is built the way everything here is built: a rounded plan rectangle,
   sampled by `roundedBox` and carried through the projection, extruded
   straight up the screen. Four visible parts, split into two draw groups by
   an honest painter's argument:

     BACK  - the inner far wall (the inside surface a reader sees down onto)
             and the far half of the top band. Everything standing on the
             plate is nearer than these, so they go down before the machine.
     FRONT - the outer near skirt and the near half of the top band. These
             are nearer than anything on the plate, so they go down after it.

   The split lands exactly on the left and right screen corners, where the
   band's two halves share their cut points - so the seam is two identical
   coordinates, not a drawn line.

   Resolve's wall OPENS, like its membrane: the front pieces stop either side
   of the exit lane, each cut end is capped with its own cross-section face,
   and a small pylon stands on each cap - the wall thickening at its own
   opening, which is what a boundary does at a regulated gate. */
const DISH = { hx: 76.5, hy: 50, r: 18, t: 5, h: 7 }

/* THE GATES. Where material crosses a wall, the wall opens - and the opening
   is architecture, not absence: each cut end is capped with its own
   cross-section face and wears a small pylon, the wall thickening at its own
   opening the way a boundary does at a regulated gate.

   EVERY SEAM IS PLUMBED NOW, one handoff per gap, all in one grammar, and
   what crosses each seam is what the story says crosses it. Protocol ships
   no material - it has none; it ships THE TRANSCRIPT: a small faceted
   tablet in the protocol's own violet, compiled by the switch bank,
   staged beside the nucleus and sent through the far wall to dock at the
   foot of Evidence's gantry - the machine that organises receives the
   instructions it organises by, and a nucleus exporting a transcript
   through its own envelope is what a nucleus is for. Evidence ships its
   organised material on through its far gate; Screening receives it at the
   back of its wait bed, runs its verdicts along its own far edge - green
   and red are pores, amber is a GATE, its pylons stained amber - and
   Resolve answers with an entry gate at the back of its lane and the exit
   over its near edge where the signed decision pushes one cell out. Each
   handoff pair runs on the RECEIVING plate's clock, so one subject is seen
   leaving and arriving on one period, with neither plate reaching across
   the seam. Entry gates keep the station's own ink; only the amber gate
   wears a verdict, because only there has one been given.

   Every gap is written in the wall's own plan units, on the straight run of
   its edge - the corner arcs are never cut. */
const GATES = {
  protocol: { far: [33, 51] },
  evidence: { back: [9, 27], far: [-5, 13] },
  screening: { back: [-7, 11], far: [31, 49] },
  resolve: { back: [-7, 11], front: [14, 42] },
}

const r1 = (v) => Math.round(v * 100) / 100

/* THE VESSEL. EVERY PLATE IS A WALLED DISH, NOT A SHEET WITH A LINE ON IT.

   The reference is the plant cell: a thick WALL with the thin membrane just
   inside it. A rounded plan rectangle, sampled by `roundedBox`, carried
   through the projection and extruded straight up the screen. Four visible
   surfaces, split into two draw groups by an honest painter's argument:

     BACK  - the inner far wall and the far half of the top band; everything
             standing on the plate is nearer, so these go down first.
     FRONT - the outer near skirt and the near half of the top band; nearer
             than anything on the plate, so they go down after it.

   The split lands on the left and right screen corners, where the two halves
   share their cut coordinates - a seam that is a coordinate, not a mark.

   Gates cut the straight runs: `right` is a span of plan y on the +x edge
   (front-right face), `front` a span of plan x on the +y edge (front-left
   face), `back` a span of plan y on the -x edge (back-left face), and `far`
   a span of plan x on the -y edge (the far long face). The first two belong
   to the near half, the last two to the far half. */
const vessel = (seat, gates = null) => {
  const p = project(seat[0], seat[1])
  const { hx, hy, r, t, h } = DISH

  // Cut points spliced into a ring's straight runs, in the ring's own
  // sampling order: +x edge ascending y, +y edge descending x, -x edge
  // descending y.
  const splice = (ring, dx, dy) => {
    if (!gates) return ring
    const out = []
    ring.forEach((pt, i) => {
      out.push(pt)
      const next = ring[(i + 1) % ring.length]
      if (gates.right && pt[0] === hx - dx && next[0] === hx - dx && pt[1] < next[1]) {
        out.push([hx - dx, gates.right[0]], [hx - dx, gates.right[1]])
      }
      if (gates.front && pt[1] === hy - dy && next[1] === hy - dy && pt[0] > next[0]) {
        out.push([gates.front[1], hy - dy], [gates.front[0], hy - dy])
      }
      if (gates.back && pt[0] === -(hx - dx) && next[0] === -(hx - dx) && pt[1] > next[1]) {
        out.push([-(hx - dx), gates.back[1]], [-(hx - dx), gates.back[0]])
      }
      if (gates.far && pt[1] === -(hy - dy) && next[1] === -(hy - dy) && pt[0] < next[0]) {
        out.push([gates.far[0], -(hy - dy)], [gates.far[1], -(hy - dy)])
      }
    })
    return out
  }

  const outer = splice(roundedBox(hx, hy, r, 11), 0, 0)
  const inner = splice(roundedBox(hx - t, hy - t, r - t, 11), t, t)
  const pick = (ring, score) => ring.reduce((b, pt, i) => (score(pt) > score(ring[b]) ? i : b), 0)
  const find = (ring, x, y) => ring.findIndex((pt) => pt[0] === x && pt[1] === y)
  const at = (pt, up) => {
    const [x, y] = p(pt[0], pt[1])
    return `${x} ${r1(y - up)}`
  }
  const seg = (ring, from, to) => (from <= to ? ring.slice(from, to + 1) : [...ring.slice(from), ...ring.slice(0, to + 1)])
  const run = (pts, up) => pts.map((pt) => at(pt, up)).join(' L ')
  const wall = (pts, cls) => ({ d: `M ${run(pts, h)} L ${run([...pts].reverse(), 0)} Z`, cls })
  const band = (out, back) => ({ d: `M ${run(out, h)} L ${run([...back].reverse(), h)} Z`, cls: 'fl-vessel-band' })
  const edge = (pts) => ({ d: `M ${run(pts, h)}`, cls: 'fl-vessel-edge' })

  // A half runs corner to corner, broken wherever a gate cuts it. The cuts
  // arrive as [begin, resume] pairs in path order, on both rings at once.
  const spans = (oFrom, oTo, nFrom, nTo, cuts) => {
    const oStops = [oFrom]
    const nStops = [nFrom]
    cuts.forEach(([oPt, nPt]) => {
      oStops.push(find(outer, oPt[0], oPt[1]))
      nStops.push(find(inner, nPt[0], nPt[1]))
    })
    oStops.push(oTo)
    nStops.push(nTo)
    const out = []
    for (let i = 0; i < oStops.length; i += 2) {
      out.push([seg(outer, oStops[i], oStops[i + 1]), seg(inner, nStops[i], nStops[i + 1])])
    }
    return out
  }

  // A gate's furniture: the pylon standing on each cut end, and - on ONE end
  // only - the wall's cross-section face. A cut face is a plane in the wall's
  // own thickness, and its outward normal points into the gap: on every edge,
  // one flank's normal points toward the viewer and the other's points away.
  // Drawing the away-facing one paints a face the viewer cannot physically
  // see, which reads as the projection breaking at exactly the place a gate
  // asks to be looked at. The pylon terminates the unlit flank instead.
  // Each piece carries its edge's name, so the stylesheet can stain ONE
  // gate's pylons - the amber exit - without dressing every opening.
  const mouth = (oPt, nPt, edge, lit) => {
    const parts = []
    if (lit) {
      parts.push({ d: `M ${at(oPt, h)} L ${at(nPt, h)} L ${at(nPt, 0)} L ${at(oPt, 0)} Z`, cls: 'fl-vessel-cut' })
    }
    const [sx, sy] = p((oPt[0] + nPt[0]) / 2, (oPt[1] + nPt[1]) / 2)
    const post = roundedCylinder(sx, sy - 11, 3.4, 11 - h)
    parts.push({ d: post.wall, cls: `fl-pylon-wall is-${edge}` })
    parts.push({ ellipse: { cx: post.cx, cy: post.cy, rx: post.rx, ry: post.ry }, cls: `fl-pylon-cap is-${edge}` })
    return parts
  }

  const o = { right: pick(outer, ([x, y]) => x - y), left: pick(outer, ([x, y]) => y - x) }
  const n = { right: pick(inner, ([x, y]) => x - y), left: pick(inner, ([x, y]) => y - x) }

  const frontCuts = []
  const backCuts = []
  if (gates?.right) {
    frontCuts.push(
      [[hx, gates.right[0]], [hx - t, gates.right[0]], 'right', true],
      [[hx, gates.right[1]], [hx - t, gates.right[1]], 'right', false],
    )
  }
  if (gates?.front) {
    frontCuts.push(
      [[gates.front[1], hy], [gates.front[1], hy - t], 'front', false],
      [[gates.front[0], hy], [gates.front[0], hy - t], 'front', true],
    )
  }
  if (gates?.back) {
    backCuts.push(
      [[-hx, gates.back[1]], [-(hx - t), gates.back[1]], 'back', false],
      [[-hx, gates.back[0]], [-(hx - t), gates.back[0]], 'back', true],
    )
  }
  if (gates?.far) {
    backCuts.push(
      [[gates.far[0], -hy], [gates.far[0], -(hy - t)], 'far', true],
      [[gates.far[1], -hy], [gates.far[1], -(hy - t)], 'far', false],
    )
  }

  const back = []
  spans(o.left, o.right, n.left, n.right, backCuts).forEach(([oPts, nPts]) => {
    back.push(wall(nPts, 'fl-vessel-in'), band(oPts, nPts), edge(oPts), edge(nPts))
  })

  const front = []
  spans(o.right, o.left, n.right, n.left, frontCuts).forEach(([oPts, nPts]) => {
    front.push(wall(oPts, 'fl-vessel-out'), band(oPts, nPts), edge(oPts), edge(nPts))
  })

  // A GATE'S FURNITURE SORTS BY ITS OWN GEOMETRY, NOT BY THE HALF THAT OWNS
  // ITS WALL. Cargo crosses the gap BETWEEN the two jambs, so the far jamb -
  // the lit cut face and its pylon - must be painted before whatever crosses,
  // and the near jamb's pylon after it: the one draw order in which a cell
  // passing through the opening goes in front of one post and behind the
  // other, which is what passing through an opening looks like. Sorting both
  // jambs with their wall half painted crossing cargo OVER the near post, and
  // the projection broke at exactly the place a gate asks to be looked at.
  // The lit flank is the far jamb on every edge - the same normal argument
  // decides both questions - so `lit` is the sort key.
  ;[...backCuts, ...frontCuts].forEach(([oPt, nPt, edge, lit]) => {
    ;(lit ? back : front).push(...mouth(oPt, nPt, edge, lit))
  })

  return { back, front }
}

/* THE RUN, AS A LINE THE FIVE STATIONS ARE REGISTERED TO.
 *
 * The names used to sit ABOVE the plates in fourteen-pixel blue caps, which put
 * the loudest type in the figure in the middle of it - over the scatter's own
 * airspace, competing with the machines for the reader's first look, and
 * lettered in the one colour the drawing was already using for everything else.
 *
 * A survey does not letter a station over the top of it. It runs a datum under
 * the whole line, ticks each station on it, and hangs the name beneath in the
 * quietest ink on the sheet. So does this: one rule under the row, five leaders
 * down onto it, and five names in near-black at ten pixels. The type is the
 * last thing you read rather than the first, which is what it is for. */
const FOOT = Math.round(CY + (HALF_X + HALF_Y) * ISO_Y) + SHEET + 4
const DATUM = 244
const NAME_Y = DATUM + 16
const FACT_Y = DATUM + 29

/* -- WHAT RUNS ON EACH PLATE --------------------------------------------

   FIVE MACHINES, AND EACH ONE HANDLES THE MATERIAL DIFFERENTLY.

   Four passes built these plates and every one of them found a way to make the
   five stations the same object: first one kit rearranged five ways, then five
   properties changing, then five hinges. The last of those was the clearest
   failure, because it came from extracting the wrong lesson - Resolve worked
   because a LEVER is a thing a person can picture their hand on, and what got
   generalised was the hinge rather than the hand.

   What ties a run together is not the machines. It is the CELL passing through
   them: it arrives in a pile, is put in order, drops down one of three pores,
   runs a lane where a person can push it off, and ends up recorded on a tape
   that can be wound back. The cell carries its stain from the pore that gave
   it one - and it is a cell, not a block, because what a run actually handles
   is a patient's biology. The frames on the tape stay faceted: by Replay the
   subject has become RECORD, and records are structure.

   So each station is a different KIND of machine working on that cell, and no
   two of them share a kinematic:

   PROTOCOL IS A BREAKER BOARD. A grid of switches on a bank - the same relief
   grid Trident's contract deck is built on, at switch scale - thrown one at a
   time in reading order, each settling green or red. That is what a protocol is
   once it stops being prose: a board of conditions that are met or not.

   EVIDENCE IS A PICK AND PLACE. A pile of material on one side, an ordered bed
   of round sockets on the other, and a claw on a gantry that goes down into
   the pile, comes up with a cell, carries it across and sets it in a socket.
   Nothing is created and nothing is taken away. The pile visibly loses the
   cell and the bed visibly gains it, which is the only way a reader can see
   that the machine is ORGANISING rather than hovering.

   SCREENING IS THREE PORES, cut through the plate along its front-right edge
   and drawn the way Trident draws its intake: the far wall, the floor, and the
   throat standing on it. They sit against the plate's own membrane, because a
   pore is a hole IN a boundary. Cells arrive unstained - plain house blue -
   and sink into one of the three; the pore is what stains them. The amber one
   is the machine admitting it cannot settle the question, so that cell does
   not stay: it is thrown to the next plate, where a person is.

   RESOLVE IS A HORIZONTAL RAM. Amber cells run a lane, a hand throws the
   lever, and a ram comes across the lane and pushes the cell at the station
   clean off the near edge of the plate - through the one gap in the membrane,
   because leaving the boundary is the decision - where it falls away. The line
   then indexes one pitch and a new cell arrives at the back. That is the honest
   picture of a judgement call: the rules have run out and somebody decides.

   REPLAY IS A TRANSPORT. Two reels, a tape path between them, the run's own
   decisions lying on it as frames, and a head that straddles the tape and reads
   its way along. Then it RUNS BACK, and the reels unwind with it. Nothing else
   in either figure reverses, which is exactly why this is the one that can:
   replay is not a thing that goes round, it is a thing that goes BACK. */

function mechanism(key, t) {
  const [seatX, seatY] = PLAN(t, -t)
  // The plate's own face as a drawing surface. Anything inside this is in the
  // SAME plan coordinates the solids are placed with, so a printed tape path
  // and the frames lying on it cannot drift apart.
  const FACE = planSpace(seatX, seatY)

  // `base` is what the part is standing ON. Without it everything has its feet
  // on the plate, so a switch on a bank has to be drawn beside the bank rather
  // than on it.
  const stand = (px, py, hx, hy, high, radius = 2, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - base - high, hx, hy, high, radius) }
  }
  const drum = (px, py, r, high, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, round: true, shape: roundedCylinder(sx, sy - base - high, r, high) }
  }

  /* A HOLE, DRAWN THE WAY TRIDENT DRAWS ITS INTAKE - WHICH MEANS CLIPPED.

     Everything a reader can see of a bore, they see THROUGH ITS MOUTH: the
     far inner wall across the top, the floor a step down, the throat on the
     floor, and whatever is being swallowed. So every interior surface is
     clipped to the mouth ellipse, exactly as the intake clips its shaft. The
     first cut of this drew the floor a full step BELOW the mouth, unclipped -
     and a mouth ellipse with a band hanging under it is the silhouette of a
     short drum standing ON the plate, which is precisely what a hole is not.
     The rim is the one hard edge, and the collar rides outside it.

     The throat is what separates a hole from a dark disc. Without it the mouth
     is a filled ellipse with a ring round it - a symbol for taking something in
     rather than somewhere for something to go. */
  const well = (px, py, r, deep, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    const { rx, ry } = planCircle(r)
    const gape = planCircle(r * 0.42)
    const band = planCircle(r * 1.18)
    const cy = sy - base
    return {
      depth: px + py,
      hole: { cx: sx, cy, rx, ry, deep, throat: gape, collar: band },
    }
  }

  /* EVERY TRAVEL IN THIS FIGURE IS ALONG A PLAN AXIS OR STRAIGHT DOWN THE
     SCREEN, AND THE TWO ARE WRITTEN SEPARATELY.

     A solid translating on any other bearing slides OVER the projection: it
     passes in front of things it is behind and behind things it is in front of,
     for as long as it moves. Along a plan axis the screen move is
     (+/-ISO_X, +ISO_Y) per unit and the solid stays inside the drawing.

     So a claw that crosses the plate AND drops into a pile does it as
     `translate(dx, dy) translateY(drop)` rather than as one combined vector.
     Two honest moves composed, each readable as what it is, and the stylesheet
     spec can check the plan-axis one on its own. */
  const OVER = 999
  // `raise` is a second plan face, parked one storey up. A plan face is placed
  // by where its origin lands on screen, so lifting one is subtracting from
  // that y and nothing else - which keeps the raised drawing in the same plan
  // coordinates as the solid it is printed on the top of.
  const printed = (depth, cls, mark, raise = 0) => ({
    depth,
    plan: raise ? planSpace(seatX, seatY - raise) : FACE,
    cls: `fl-plan ${cls}`,
    mark,
  })
  /* An instrument with a handle, hinged at a plan point and swinging in the
     vertical plane. `reach` is signed, so an arm can open to the left or the
     right of its own hinge without the caller doing the arithmetic. Three
     stations use one: a switch, a catapult, a lever. Nothing else does. */
  const arm = (cls, px, py, base, reach, thick, extra = {}) => ({
    arm: PLAN(t + px, -t + py),
    base,
    reach,
    thick,
    cls,
    depth: OVER + 2,
    ...extra,
  })

  /* A CELL. THE MATERIAL THE WHOLE ROW IS MADE OF.

     The run handles a patient's own biology, so the material is drawn ALIVE:
     a plan circle carried through the projection, standing on its own wall,
     with its nucleus printed off-centre on the top. Everything built on these
     plates stays faceted - the machines are the site's structure - and only
     the subject is round. One radius for every cell on the sheet, because the
     subject does not change size between stations, and seven is the smallest
     plan radius whose projected width (2r * ISO_X * sqrt2 = 17.2px) clears
     the size at which a solid stops reading as a solid.

     It arrives with NO verdict - plain house blue, because a cell nobody has
     ruled on is not a state, it is material - and it takes its colour from
     the hole it falls down, the way a section takes a stain: green for
     eligible, red for not, amber for the ones a machine cannot settle, which
     is the only reason Resolve exists and the reason a person is standing at
     it. The stain reaches the nucleus deepest, because that is where a stain
     goes.

     Two layers that do not fight: the station's ink dresses the plate and the
     machine, and the cell's stain is the state of one subject. The same green
     on Screening is the same green on Replay because it is the same cell.

     The nucleus is offset by plan (2.3, 0) carried through the projection -
     the same offset on every cell, because a drafted sheet places a repeated
     mark the same way every time. */
  const CORE = { dx: 1.99, dy: 0.78, ...planCircle(2.4) }
  const cell = (px, py, verdict, high = 5, base = 0, extra = {}) => ({
    ...drum(px, py, 7, high, base),
    core: CORE,
    cls: `fl-blk${verdict ? ` is-${verdict}` : ''}`,
    ...extra,
  })

  const build = {
    // PROTOCOL IS A BREAKER BOARD, AND IT IS LAID OUT AS A GRID.
    //
    // It used to be five switches on a diagonal, which is a row of things and
    // not a board of them. Trident's contract deck is nineteen solids in a plan
    // grid and it is the most legible thing in that figure, because a grid is
    // something a reader can total at a glance and a diagonal is something they
    // have to follow. So: twelve switches, four across and three back, standing
    // on a bank with the bus rails printed under them.
    protocol: () => {
      const cols = [-30, -10, 10, 30]
      const rows = [-22, 0, 22]
      const verdict = ['pass', 'pass', 'fail', 'pass', 'pass', 'pass', 'fail', 'pass', 'pass', 'fail', 'pass', 'pass']
      const bank = rows.flatMap((py, r) => cols.map((px, c) => [px, py, r * cols.length + c]))
      // THE BOARD IS THE NUCLEUS NOW. The protocol is the run's genome - the
      // one document everything downstream executes - so the bank it is
      // thrown on is drawn as the organelle that holds a genome: an oval
      // platform (the same rounded slab at a radius that turns it into a
      // stadium), wearing its double envelope printed on its own face, with
      // four pores on the envelope's rim and one chromatin thread snaking
      // through all twelve criteria in reading order. The switches stay a
      // grid, because a grid is what a reader can total - the nucleus is the
      // body, not the layout.
      const thread = rows
        .flatMap((py, r) => (r % 2 ? [...cols].reverse() : cols).map((px) => `${px} ${py}`))
        .join(' L ')
      return [
        printed(-800, 'fl-print', [
          <rect key="seat" x="-46" y="-38" width="92" height="76" rx="28" />,
          // The export lane: from the nucleus's edge to the gate in the far
          // wall, printed before anything travels it.
          <line className="fl-ruled" key="issue" x1="42" y1="-34" x2="42" y2="-52" />,
        ]),
        // THE BANK IS DRAWN FIRST, AND NOT AT ITS OWN DEPTH. Sorted by its
        // centre, a plate-sized bank draws OVER every switch standing on its
        // far half, and six of the twelve went missing.
        { ...stand(0, 0, 44, 36, 3, 26), cls: 'fl-board', depth: -700 },
        // Everything the nucleus wears goes on its own top face: the double
        // envelope, its four pores, and the thread. On the plate underneath,
        // the bank would cover all of it.
        printed(-699, 'fl-print', [
          <rect className="fl-ruled" key="env" x="-40" y="-32" width="80" height="64" rx="24" />,
          <rect className="fl-ruled" key="env2" x="-36" y="-28" width="72" height="56" rx="21" />,
          ...[[0, -32], [40, 0], [0, 32], [-40, 0]].map(([px, py]) => (
            <g key={`${px}:${py}`}>
              <circle className="fl-porering" cx={px} cy={py} r="3" />
              <circle className="fl-poredot" cx={px} cy={py} r="1.1" />
            </g>
          )),
          <path className="fl-thread" key="thread" d={`M ${thread}`} />,
        ], 3),
        ...bank.flatMap(([px, py, i]) => [
          { ...stand(px, py, 5, 5, 5, 4.5, 3), cls: 'fl-seat' },
          arm(`fl-toggle is-${verdict[i]}`, px, py, 11, 11, 4, { knob: 3.2, turn: i }),
        ]),
        // THE TRANSCRIPT. This plate holds no material - it holds the
        // document, and the document is what it ships. It crossed as a
        // faceted tablet once, and a lone cube commuting between plates of
        // round material read as a second animation grammar at the first
        // seam a reader meets - so the transcript rides in the run's own
        // vessel now: a cell in the protocol's violet, the ink and not the
        // silhouette saying this one is the document. It stages off the
        // bank's rounded corner and ships through the gate on EVIDENCE'S
        // clock, so the violet cell seen leaving here is the violet cell
        // seen docking at the gantry next door two beats later. Natural
        // depth: nothing stands on its lane, and a cell riding OVER the
        // whole plate paints over the near gate pylon it should pass behind.
        { ...cell(42, -39, null, 5), cls: 'fl-blk is-script fl-issue' },
      ]
    },
    // EVIDENCE IS A PICK AND PLACE.
    //
    // The last pass put a disc over the plate that swept back and forth while
    // blocks underneath went up and down on their own clocks - so it read as
    // something hovering over material rather than as something handling it,
    // and nothing the disc did had any consequence for anything below it.
    //
    // A machine that organises has to be seen taking one thing out of the mess
    // and putting it in the right place. So the claw goes DOWN into the pile,
    // closes, comes up with a cell, crosses to the bed and sets it in a socket.
    // The pile loses that cell and the bed gains it. Same material, better
    // order, which is the entire claim of the step.
    evidence: () => {
      // A PILE, NOT A SCATTER: some of these stand on the others, which is the
      // only difference between material heaped up and material laid out.
      const pile = [
        [-56, -30, 5, 0], [-38, -34, 6, 0], [-58, -12, 4, 0], [-36, -10, 6, 0],
        [-56, 6, 5, 0], [-40, 6, 4, 0], [-54, -32, 4, 5], [-52, 4, 4, 5],
      ]
      const slot = [-20, 8].flatMap((py) => [4, 28, 50].map((px) => [px, py]))
      return [
        printed(-800, 'fl-print', [
          <rect key="pit" x="-60" y="-40" width="30" height="52" rx="12" />,
          // ROUND SOCKETS FOR ROUND MATERIAL. A square slot under a cell says
          // the bed was cut for some other cargo.
          ...slot.map(([px, py]) => (
            <circle key={`${px}:${py}`} cx={px} cy={py} r="8.5" />
          )),
          // The shipping lane: from the bed to the gate in the far wall,
          // printed before anything travels it.
          <line className="fl-ruled" key="ship" x1="4" y1="-28" x2="4" y2="-52" />,
        ]),
        // THE GANTRY THE CLAW RIDES, and it is the whole reason the claw is not
        // a UFO. A carriage hanging in the air over a plate is a thing hovering
        // over material; the same carriage under a beam bolted to two posts is
        // part of the machine, and it can only go where the beam goes.
        // THIRTY, NOT FORTY-TWO. A beam spanning the plate is carried at the
        // height of its FAR end, where the plate surface is already forty
        // pixels up the screen - so every pixel of gantry costs the row twice,
        // and at forty-two this station stood thirty-six pixels taller than
        // every other one. A bench of five reads as a bench.
        { ...stand(-58, -20, 5, 5, 30, 4.5), cls: 'fl-rig is-post' },
        { ...stand(56, -20, 5, 5, 30, 4.5), cls: 'fl-rig is-post' },
        { ...stand(-1, -20, 60, 3.5, 4, 3.5, 30), cls: 'fl-rig is-beam', depth: -600 },
        // The beam is ruled along its own top the way a protofilament is
        // drawn - segmented - so the track the carriage rides reads as grown
        // structure rather than rolled steel. A raised print at the beam's own
        // roof (base 30 + high 4), in the same plan units as the beam.
        printed(-599, 'fl-print', [-54, -42, -30, -18, -6, 6, 18, 30, 42, 54].map((x) => (
          <line className="fl-ruled" key={x} x1={x} y1="-23" x2={x} y2="-17" />
        )), 34),
        ...pile.map(([px, py, high, base], i) => cell(px, py, null, high, base, { turn: i })),
        // The one the claw takes. It is on top of the pile, because that is
        // where a claw can reach.
        { ...cell(-52, -20, null, 5), cls: 'fl-blk fl-pick' },
        ...slot.slice(1).map(([px, py], i) => cell(px, py, null, 5, 0, { turn: i })),
        // The slot it fills - and the slot is a WAYPOINT, not a terminus.
        // Empty until the claw sets the carried cell down INTO it (the
        // crossfade happens at floor level, under the open jaws), it holds
        // the cell for a beat and then sends it up the printed lane to the
        // staging seat, where the shipment cycle takes over. One subject:
        // picked, placed, staged, shipped.
        { ...cell(slot[0][0], slot[0][1], null, 5), cls: 'fl-blk fl-lay' },
        // THE CARRIAGE. Two jaws hanging off a head, and a cell held between
        // them. All three ride one clock, so the cell travels because the claw
        // is carrying it rather than beside it.
        { ...cell(-52, -20, null, 5, 14), cls: 'fl-blk fl-carry', depth: OVER + 1 },
        // THE DOCKED TRANSCRIPT. The instructions this machine organises by,
        // arrived through the entry gate in the back wall on this plate's own
        // clock - the same violet cell that left the nucleus - resting on
        // the apron by the pile until the work consumes it and the next one
        // arrives.
        { ...cell(-65, 18, null, 5), cls: 'fl-blk is-script fl-dock' },
        // THE SHIPMENT. Organised material does not pile up on the bed - it
        // goes on to be screened. The staging seat sits between the bed and
        // the far wall on the same printed lane the first socket feeds: the
        // laid cell slides up to it late in the cycle, and this is the cell
        // that ships through the gate on the next beat - so departure is the
        // continuation of the putdown, not an apparition at the wall. At its
        // own honest depth: the staging seat is FARTHER than the bed's first
        // socket, and a cell drawn at OVER painted over the nearer socket's
        // cell - and over the near gate pylon it should pass behind.
        { ...cell(4, -36, null, 5), cls: 'fl-blk fl-ship' },
        { ...stand(-52, -30, 3, 8, 10, 3, 14), cls: 'fl-claw is-jaw', depth: OVER },
        { ...stand(-52, -10, 3, 8, 10, 3, 14), cls: 'fl-claw is-jaw', depth: OVER + 2 },
        // The motor's head is round - the one part of the carriage that is
        // the organelle rather than the frame it hangs from.
        { ...drum(-52, -20, 8, 6, 24), cls: 'fl-claw is-head', depth: OVER + 3 },
      ]
    },
    // SCREENING IS THREE THROATS, ON THE EDGE THE ROW RUNS ALONG.
    //
    // They used to sit on a bearing that is not a plan axis, which is why the
    // perspective read as broken: three holes stepped 84 across and 16 back
    // land on a screen line of the wrong slope, so the plate looked bent under
    // them. These sit at one plan x with the plan y stepping, which puts them
    // exactly parallel to the plate's own front-right edge - green, red, amber,
    // left to right, with the amber one nearest the corner that points at
    // Resolve, because that is the one that goes there.
    //
    // The cells arrive with NO stain. The pore is what gives them one.
    screening: () => {
      // THE THREE VERDICTS LINE THE FAR LONG EDGE, at one plan y, stepping
      // along the plan x the edge itself runs on: green, red, amber, left to
      // right, with the amber seat nearest the corner that points at Resolve.
      // The first two are terminal pores. The third is not a pore at all -
      // it is the GATE, cut through the wall dead ahead of it.
      const hole = [[-40, -28, 'pass'], [0, -28, 'fail'], [40, -28, 'hold']]
      // The bed's first column stands on the green pore's own plan x, so the
      // seat that feeds the pore is DIRECTLY behind it and the feed travels
      // one pure -y step down a printed lane - the same bearing every
      // verdict on this plate travels.
      const wait = [2, 24].flatMap((py) => [-62, -40, -18].map((px) => [px, py]))
      return [
        printed(-800, 'fl-print', [
          <rect key="bed" x="-70" y="-6" width="64" height="40" rx="14" />,
          // Two vesicles budding off the stack toward the verdict line,
          // printed - sorted material leaving the organelle.
          <circle className="fl-ruled" key="v1" cx="6" cy="4" r="3.4" />,
          <circle className="fl-ruled" key="v2" cx="16" cy="-4" r="2.6" />,
          // THE FEED LANE. From the bed's pore column to the green mouth,
          // printed before anything travels it - the same convention as
          // every other travel on the sheet.
          <line className="fl-ruled" key="feed" x1="-40" y1="-2" x2="-40" y2="-12" />,
          // THE AMBER LANE. From the hold bay straight through the gate in
          // the far wall, printed before anything travels it.
          <rect key="bay" x="28" y="-46" width="24" height="38" rx="10" />,
          <line className="fl-ruled" key="lane" x1="40" y1="-10" x2="40" y2="-52" />,
        ]),
        // THE GOLGI STACK. The organelle whose whole job is sorting and
        // dispatch stands between the bed and the verdict line, in the
        // station's own ink. The machinery of the step stays the pores and
        // the gate - the stack is the body those mechanisms belong to.
        { ...drum(26, 24, 16, 2.5), cls: 'fl-golgi' },
        { ...drum(26, 24, 12.5, 2.5, 2.5), cls: 'fl-golgi' },
        { ...drum(26, 24, 9, 2.5, 5), cls: 'fl-golgi' },
        // THE BED FEEDS THE GREEN PORE AS A LINE, NOT AS AN APPARITION.
        // One 5.6s clock - the period the shipment arrives on - moves one
        // subject one seat per beat: the cell on the pore's own column
        // slides a pure -y step onto the mouth and goes down; the cell at
        // the entry seat shunts one column over to take its place; and the
        // cell sliding in through the back gate takes the entry seat. Every
        // handover is a crossfade at rest, two identical cells sharing one
        // seat for a beat, so nothing on this plate materialises in the air.
        { ...cell(wait[0][0], wait[0][1], null, 5), cls: 'fl-blk fl-join' },
        { ...cell(wait[0][0], wait[0][1], null, 5), cls: 'fl-blk fl-shunt' },
        { ...cell(wait[1][0], wait[1][1], null, 5), cls: 'fl-blk fl-faller' },
        ...wait.slice(2).map(([px, py], i) => cell(px, py, null, 5, 0, { turn: i })),
        // The two terminal pores. The green one carries the cell it is
        // swallowing: a stained cell standing INSIDE the bore, clipped to
        // the opening the way Trident clips its shaft, so a reader watches
        // the material go down the hole rather than vanish behind a painted
        // disc. The stain is the pore's own - what the pore swallows, it
        // has ruled. The red pore stands ready and open, its ring saying
        // what it rules; it does not need to be fed on a loop for a reader
        // to believe it - one line into the green mouth is the story, and a
        // second faller was a second thing to watch on one plate.
        // The radius is sized to the wall, not to taste: the collar rides at
        // 1.18r, the vessel's inner face is 17 plan units from the pore line,
        // and a collar that touches the wall reads as a hole cut through the
        // FOUNDATION rather than the floor. 11.9 keeps ~3 units of floor
        // between collar and wall; the r=7 cell still clears the mouth.
        ...hole.slice(0, 2).map(([px, py, v], i) => ({
          ...well(px, py, 11.9, 8),
          cls: `fl-hole is-${v}`,
          stain: v,
          turn: i,
          ...(v === 'pass' ? { swallow: cell(px, py, null, 5, -6) } : {}),
        })),
        // The amber cell, at the hold bay, already ruled: it runs the lane on
        // RESOLVE'S OWN CLOCK, through the gate in ONE unbroken motion, and
        // the feed entering the back of Resolve's lane picks up the beat two
        // frames later - one subject, two plates, one period. Honest depth:
        // nothing stands on the amber lane, and a cell drawn OVER the plate
        // paints over the near gate pylon it should pass behind.
        { ...cell(40, -16, 'hold', 5), cls: 'fl-blk is-hold fl-handoff' },
      ]
    },
    // RESOLVE IS A HORIZONTAL RAM.
    //
    // The press used to come straight down onto an anvil, which is a stamp and
    // not a decision - and the anvil was a disc on a plate that nothing else in
    // the station referred to. A judgement is something coming OFF the line, so
    // the ram lies flat, crosses the lane, and pushes the cell at the station
    // clean off the near edge - through the gap the membrane leaves for it -
    // where it falls away.
    //
    // THE LINE THEN INDEXES, AND THAT IS WHY IT LOOPS WITHOUT A SEAM. Three
    // cells each step forward exactly one PITCH while a fourth fades in at the
    // back, so the set of occupied slots at the end of a cycle is the set at the
    // start shifted by one. When the clock turns over, every cell lands on the
    // slot its neighbour just left and the picture is identical. Nothing has to
    // travel backwards to close the loop.
    resolve: () => {
      const lane = 2
      const at = (i) => -44 + i * PITCH
      return [
        printed(-800, 'fl-print', [
          <line key="lane" x1="-60" y1={lane} x2="48" y2={lane} />,
          // The rail the ram runs on, and the edge the cell goes over. A plate
          // has to say where something leaves it, or the cell is just falling
          // off a drawing - and here the membrane says it too: its gap
          // brackets this lane, and the chevron points through it.
          <line className="fl-ruled" key="rail" x1="28" y1="-40" x2="28" y2="42" />,
          <path className="fl-ruled" key="edge" d="M 18 32 L 28 42 L 38 32" />,
          // The sensor pad before the opening: the iris language at bench
          // scale, printed where the signed decision lets a cell out.
          ...[5, 9, 13].map((ring) => <circle className="fl-ruled" key={ring} cx="28" cy="22" r={ring} />),
        ]),
        ...[0, 1, 2].map((i) => ({ ...cell(at(i), lane, 'hold'), cls: 'fl-blk is-hold fl-index' })),
        // The one at the station, which is the one that gets pushed off.
        { ...cell(at(3), lane, 'hold'), cls: 'fl-blk is-hold fl-pushed', depth: OVER + 3 },
        // And the one that arrives to replace it, at the back of the lane.
        { ...cell(at(0), lane, 'hold'), cls: 'fl-blk is-hold fl-feed' },
        // THE RAM, IN THREE STEPS. One slab crossing a lane is a slab. A body
        // at the back, a thin rod out of it, and a BLADE at the front that is
        // wider across the lane than the cell and stands twice its height:
        // the stepping is the only thing that says which end does the work, and
        // the blade is the only part a reader has to read.
        //
        // AND IT IS SORTED ABOVE THE LANE RATHER THAN AT ITS OWN PLAN POINT.
        // Every other solid here is sorted by where it stands, which is right
        // for something that stays there; the ram crosses the lane, so its
        // depth relationship with the cells on it genuinely REVERSES halfway
        // through the stroke. Sorted at rest it was drawn behind the cell it
        // was pushing for the whole of the stroke.
        // The body is a drum now - a contractile vacuole, the organelle that
        // expels - with the rod and blade still frankly mechanical, because a
        // person's decision drives them.
        { ...drum(28, -34, 7, 7), cls: 'fl-ram is-body', depth: OVER - 3 },
        { ...stand(28, -20, 3, 7, 4, 3, 3), cls: 'fl-ram is-neck', depth: OVER - 2 },
        // The blade RESTS IN CONTACT: its leading edge sits exactly on the
        // waiting cell's back tangent, and the two share one travel and one
        // easing from the first frame of the stroke - so the push is a push,
        // never a blade phasing through the thing it is pushing.
        { ...stand(28, -7.5, 9, 2.5, 11, 2.5), cls: 'fl-ram is-face', depth: OVER - 1 },
        // The lever a person throws, and it is still the only hinge on this
        // plate. Nothing about a lever is ambient. It used to stand twenty-six
        // pixels tall in the station's own crimson, which made the one human
        // part of the figure the largest object on the sheet.
        { ...drum(-54, -28, 9, 13), cls: 'fl-pivot' },
        arm('fl-lever', -54, -28, 13, 22, 4.8, { knob: 4.8 }),
      ]
    },
    // REPLAY IS A TRANSPORT.
    //
    // Not a shelf, and not a ledger: Trident already has a ledger, and a stack
    // of chained rows is that figure's word. The claim here is different -
    // any decision RECONSTRUCTS, which means going back to the beginning and
    // running it again and getting the same answers.
    //
    // So: two reels, a tape path printed between them, the run's own decisions
    // lying on the tape as frames in the verdicts they were given, and a head
    // that straddles the tape and reads its way along. Then it runs BACK, and
    // the reels unwind with it. A clock goes round; this goes back, and it is
    // the only thing in either figure that reverses.
    replay: () => {
      const at = [-33, -22, -11, 0, 11, 22, 33]
      const mark = ['pass', 'hold', 'fail', 'pass', 'pass', 'fail', 'hold']
      // A COIL, NOT SPOKES. Four crossed spokes are a wheel; what winds onto
      // a reel of biology is a strand, so each reel prints its own spiral -
      // two and a half turns, drawn as a polyline in the reel's own plan -
      // and the same clock that turned the spokes turns the coil.
      const coil = (cx) => {
        const pts = []
        for (let i = 0; i <= 40; i += 1) {
          const t = i / 40
          const a = t * 2.5 * Math.PI * 2 + 0.6
          const r = 2.4 + t * 8.4
          pts.push(`${Math.round((cx + Math.cos(a) * r) * 10) / 10} ${Math.round((2 + Math.sin(a) * r) * 10) / 10}`)
        }
        return <path className="fl-coil" d={`M ${pts.join(' L ')}`} />
      }
      return [
        printed(-800, 'fl-print', [
          ...at.map((px) => <line className="fl-ruled" key={px} x1={px - 5.5} y1="-12" x2={px - 5.5} y2="16" />),
        ]),
        // THE TAPE IS A SOLID, NOT TWO PRINTED LINES. Frames standing on a pair
        // of hairlines are seven coloured cubes in a row; frames standing on a
        // strip that runs onto both reels are a record on a tape.
        { ...stand(0, 2, 54, 8, 2, 4), cls: 'fl-tape', depth: -600 },
        { ...drum(-52, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(52, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(-52, 2, 8, 3, 7), cls: 'fl-reel is-hub' },
        { ...drum(52, 2, 8, 3, 7), cls: 'fl-reel is-hub' },
        // The reels wind as the head runs and unwind as it goes back, which is
        // what makes two cylinders a transport rather than two cylinders.
        printed(760, 'fl-print', [
          <g className="fl-spin" key="l">{coil(-52)}</g>,
          <g className="fl-spin" key="r">{coil(52)}</g>,
        ], 7),
        // A frame is wider ACROSS the tape than along it, which is the whole
        // difference between a frame and a cube.
        ...at.map((px, i) => ({
          ...stand(px, 2, 4, 7, 5, 3.5, 2),
          cls: `fl-blk is-${mark[i]} fl-frame`,
          turn: i,
        })),
        // THE HEAD. Two legs either side of the tape and a bar over the top, so
        // the tape passes UNDER it - which is the whole difference between a
        // head reading a tape and a solid sitting on one.
        // The far leg is SORTED BEHIND THE FRAMES, not at OVER: its plan y
        // puts it behind every frame it will ever pass, always, so its depth
        // says so - a head crossing a tape must never paint over the record
        // it is reading. Both legs also stand clear of the frames' own band,
        // because a gate that grazes what passes through it is a collision,
        // not a reader.
        { ...stand(-34, -11, 5, 5, 17, 4.5), cls: 'fl-head is-leg', depth: -500 },
        { ...stand(-34, 15, 5, 5, 17, 4.5), cls: 'fl-head is-leg', depth: OVER + 1 },
        { ...stand(-34, 2, 4, 15, 6, 4, 17), cls: 'fl-head is-bar', depth: OVER + 2 },
      ]
    },
  }

  // Back to front, or a mechanism is a pile rather than an object - and every
  // solid gets its own phase in the settle, so a plate breathes as a population
  // of separate things rather than as one object going up and down.
  return build[key]()
    .sort((a, b) => a.depth - b.depth)
    .map((part, index) => ({ ...part, life: jitter(index, 23) }))
}

/* THE PLATES ARE NOT WIRED TOGETHER.

   A coupling stood in each of the two plan corners where a plate came nearest
   its neighbours, with a hairline run passing between them, on the argument
   that five plates in a row are five islands. The argument was right and the
   answer was wrong: what it produced was four thin lines crossing the empty
   gaps between the plates and ten small blocks doing nothing on ten corners,
   which is a diagram of a connection rather than a connection. The datum under
   the row already says these five are one run, and it says it with one line
   instead of fourteen marks. */

const STEPS = [
  {
    key: 'protocol',
    label: 'PROTOCOL',
    fact: 'V2.1 - 36 CRITERIA',
    read: 'The study arrives as something that executes, with its criteria as logic rather than prose.',
  },
  {
    key: 'evidence',
    label: 'EVIDENCE',
    fact: '25 / 36 MAPPED',
    read: 'Site records bind to the criteria that need them, and stay where they already are.',
  },
  {
    key: 'screening',
    label: 'SCREENING',
    fact: '1 PASS - 4 REVIEW - 3 FAIL',
    read: 'Deterministic. The same protocol against the same evidence reaches the same result.',
  },
  {
    key: 'resolve',
    label: 'RESOLVE',
    fact: 'PI SIGNED - ED25519',
    read: 'Where the answer needs judgement, a named person makes the call and signs it.',
  },
  {
    key: 'replay',
    label: 'REPLAY',
    fact: 'CHAIN INTACT 9 / 9',
    read: 'Any decision reconstructs cold: protocol version, evidence as of then, and who decided.',
  },
].map((step, index) => {
  const t = (index - 2) * STEP

  const tiles = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const px = t + (col - (COLS - 1) / 2) * CELL
      const py = -t + (row - (ROWS - 1) / 2) * CELL
      const [sx, sy] = PLAN(px, py)
      const seed = index * 11 + row * COLS + col
      /* A LOW-DISCREPANCY SCATTER, NOT THIRTY RANDOM DRAWS.
         Thirty independent reaches clump: three or four tiles land on the same
         spot and leave a hole beside it, and a clump in a mess reads as a
         mistake rather than as disorder. Two irrational strides walk the frame
         instead. Every tile lands somewhere different, the coverage is even at
         any count, and nothing is on a grid - which is the whole difference
         between disorder and a pattern. */
      const spot = (seed * 0.6180339887) % 1
      const band = (seed * 0.7548776662) % 1
      const slack = Math.round(jitter(seed, 79) * 44)
      tiles.push({
        key: `${step.key}-${row}-${col}`,
        // BUILT AT ITS SEAT, so the assembled group is a true plan grid with
        // every seam landing on every other seam - which is what lets the six
        // of them hand off to one plate without the outline moving. Scatter is
        // an offset from that, so the whole travel is a compositor transform
        // with nothing recomputed on any frame.
        shape: roundedSlab(sx, sy, TILE, TILE, SHEET, 9),
        // TWO SCATTER POSITIONS, NOT ONE. The mess has to be alive while it is
        // still a mess: tiles holding perfectly still read as a paused video.
        driftX: Math.round(clamp(KEEP.left + 76 + spot * (KEEP.right - KEEP.left - 152) + (jitter(seed, 37) - 0.5) * 58, KEEP.left, KEEP.right, slack) - sx),
        driftY: Math.round(clamp(KEEP.top + 12 + band * 128 + (jitter(seed, 53) - 0.5) * 28, KEEP.top, KEEP.bottom, slack * 0.5) - sy),
        // The wander is a DELTA off the drift, not a second absolute position.
        // Written absolutely it is a several-hundred-pixel offset, and an
        // ambient loop between two points that far apart is not a tile
        // floating, it is a tile being thrown across the frame.
        wanderX: Math.round((jitter(seed, 97) - 0.5) * 30),
        wanderY: Math.round((jitter(seed, 103) - 0.5) * 22),
        // Where it falls in the fuse. Every tile is seated well before the
        // seams close, so nothing is still travelling when the plate arrives.
        lag: Math.round(jitter(seed, 89) * 100) / 100,
        life: Math.round(jitter(seed, 61) * 100) / 100,
      })
    }
  }

  const seat = PLAN(t, -t)
  return {
    ...step,
    index,
    tiles,
    seat,
    // Where this station sits across the sheet, in the pointer field's own
    // units, so the stylesheet can read nearness without measuring anything.
    sx: Math.round(((seat[0] / W) - 0.5) * 2 * 1000) / 1000,
    emblem: mechanism(step.key, t),
    // The one surface the six tiles become, cut from the same geometry at the
    // same thickness. Its corner is the group's corner, so the handoff changes
    // what the object IS without changing where its edge falls.
    plate: roundedSlab(seat[0], seat[1], HALF_X, HALF_Y, SHEET, PLATE_R),
    // The wall standing on it, split into the half that goes down before the
    // machine and the half that goes down after it. Screening's opens toward
    // Resolve; Resolve's opens where the material arrives and where it leaves.
    dish: vessel(seat, GATES[step.key] ?? null),
  }
})

/**
 * A ROUND SOLID, IN THE SAME THREE FACES.
 *
 * `Faces` draws the flat-plan solids and this draws the round ones, and both
 * hand out the same three class names - so one set of ink rules dresses a
 * switch seat and a tape reel alike, and a machine built out of both is one
 * object rather than two drawings sharing a plate. A plan circle lands as an
 * axis-aligned ellipse in this projection, so the top is an ordinary <ellipse>
 * and only the wall has to be solved.
 */
function Drum({ shape, core, className }) {
  return (
    <g className={className}>
      <path className="dgm-face-right" d={shape.wall} />
      <ellipse className="dgm-face-top" cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />
      {/* The nucleus, on the cells only. A plan circle like the body it sits
          on, offset the same way on every cell, and drawn after the top so it
          reads as printed ON the material rather than showing through it. */}
      {core ? (
        <ellipse className="fl-core" cx={shape.cx + core.dx} cy={shape.cy + core.dy} rx={core.rx} ry={core.ry} />
      ) : null}
    </g>
  )
}

export default function ChainSchematic({ animate = true }) {
  const frame = useCenterOnOverflow()
  const root = useRef(null)
  // Latched as the initial value where there is no observer to latch it - a
  // renderer without one is not a reader arriving, it is a snapshot, and a
  // snapshot of the scatter states nothing.
  const [fused, setFused] = useState(() => typeof IntersectionObserver !== 'function')
  const [hot, setHot] = useState(null)
  const step = STEPS.find((item) => item.key === hot) ?? null

  /* THE LATCH.
   *
   * One observer, one direction, no teardown of state. `animate` cannot do this
   * job: it is the site's ambient power gate and it goes off every time the
   * section leaves the viewport, so a figure driven by it would fall back to a
   * scatter the moment a reader scrolled past and reassemble behind their back.
   * What the reader has already watched happen has happened.
   *
   * AND IT FIRES LATE ON PURPOSE. The mess is the opening, and a latch that
   * trips on the first pixel of the figure spends it off screen. Well into
   * view, then. Two ways in, because either one alone has a viewport that
   * defeats it - a ratio never reaches four tenths if the figure is taller than
   * the window, and a top line never crosses if the figure is short enough to
   * enter from the bottom already whole. */
  useEffect(() => {
    const node = root.current
    if (!node || typeof IntersectionObserver !== 'function') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const arrived = entries.some(
          (entry) =>
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.4 || entry.boundingClientRect.top <= window.innerHeight * 0.45),
        )
        if (!arrived) return
        setFused(true)
        observer.disconnect()
      },
      { threshold: [0, 0.15, 0.4, 0.7] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <figure className="dgm" ref={root}>
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor${animate ? ' is-live' : ''}${fused ? ' is-fused' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Thirty surfaces scattered in the air, seen in axonometric projection. As the reader reaches the figure they draw together and set down flush, six at a time, into five plates in a row, and stay there - each plate bounded by its own printed double-walled membrane, the way a section drawing bounds a cell. A survey line rules under the row and letters the five stations beneath it: Protocol, Evidence, Screening, Resolve, Replay. One cell - a round body with its nucleus drawn on top - runs the whole row. A grid of twelve switches on a breaker board is thrown one at a time, each settling green or red, and the compiled protocol ships out through a gate in the plate's wall as a violet-stained cell - the transcript in the run's own vessel. It docks beside the next plate's gantry, where a claw closes on one cell in a heap, lifts it, carries it across, and sets it down into an ordered bed of round sockets; the placed cell then slides up a printed lane to a staging seat and ships onward through that plate's far gate. Along the far long edge of the next plate, three verdict seats wait in a line - green, red, amber. The bed feeds the green pore as a moving line: one cell slides onto the mouth and is visibly swallowed down the bore while the seat behind it shuffles forward and the newly arrived cell takes the empty place; the red pore stands open and ringed; the amber seat is a gate cut through the plate's wall, its pylons stained amber, and the unsettled cell is sent through it in one motion. On the plate beyond it enters a matching gate at the back of the lane, on the same clock it left on. There a hand throws a lever, a horizontal ram crosses the lane and pushes one cell clean off the edge through the one gap in the membrane, and the line indexes forward as the next arrives. On the last plate the run lies as frames on a tape between two reels, and a head reads its way along and then runs back. Pointing at a plate lifts it off the ground and darkens the ground beneath it."
        >
          <defs>
            <pattern id="fl-grain" width="13" height="13" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="0.9" />
            </pattern>
            {/* The cytoplasm's finer grain: a second dot scale, offset off the
                first, so the floor of every vessel carries the ribosome
                stipple a section drawing gives living ground. */}
            <pattern id="fl-plasm" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="4.5" cy="3.5" r="0.55" />
            </pattern>
          </defs>

          <line
            className="fl-datum"
            x1={KEEP.left}
            y1={DATUM}
            x2={KEEP.right}
            y2={DATUM}
            style={{ '--from': `${KEEP.left}px`, '--at': `${DATUM}px` }}
            aria-hidden="true"
          />

          {STEPS.map((item) => (
            <g
              className={`fl-step is-${item.key}${hot === item.key ? ' is-hot' : ''}`}
              key={item.key}
              style={{ '--sx': item.sx }}
              onMouseEnter={() => setHot(item.key)}
              onMouseLeave={() => setHot((current) => (current === item.key ? null : current))}
              onFocus={() => setHot(item.key)}
              onBlur={() => setHot(null)}
              tabIndex={fused ? 0 : -1}
              role="button"
              aria-label={`${item.label}, ${item.fact} - ${item.read}`}
            >
              {/* IT WAS READING AS RECESSED, AND THE HALO WAS WHY.
                  A held plate used to grow a ring of pale blue all the way
                  round it, which is an INSET cue - the same thing every sunken
                  panel on the web is drawn with - so leaning on a step pushed
                  it into the page instead of lifting it out.
                  Elevation is not a glow. It is an object moving up and its
                  contact with the ground moving DOWN and AWAY from it: five
                  copies of the plate's own footprint, each offset further under
                  the lift and each fainter than the last, which is a soft
                  shadow drawn with no filter and no ring anywhere. They stay on
                  the ground while the plate goes up. */}
              <g className="fl-cast">
                {/* Five steps rather than three, and the falloff is quadratic.
                    A real shadow is two shadows: a tight dark one where the
                    object nearly touches the ground, and a wide faint one from
                    the light the room is full of. Three linear steps could only
                    draw the first, so a lifted plate had a hard little smudge
                    under it and nothing around that. */}
                {[[1, 0.5], [2, 0.33], [3, 0.21], [4, 0.13], [5, 0.07]].map(([n, a]) => (
                  <polygon key={n} className="fl-caststep" points={item.plate.top} style={{ '--n': n, '--a': a }} />
                ))}
              </g>

              <g className="fl-body">
                {/* THE FRAGMENTS. They travel, they seat, and then they are
                    gone: six seams under a machine is six things competing
                    with the thing worth reading. */}
                <g className="fl-tiles">
                  {item.tiles.map((tile) => (
                    <g
                      className="fl-tile"
                      key={tile.key}
                      style={{
                        '--drift-x': `${tile.driftX}px`,
                        '--drift-y': `${tile.driftY}px`,
                        '--sway-x': `${tile.wanderX}px`,
                        '--sway-y': `${tile.wanderY}px`,
                        '--lag': tile.lag,
                        '--life': tile.life,
                      }}
                    >
                      <g className="fl-drift">
                        <Faces shape={tile.shape} className="dgm-solid" />
                      </g>
                    </g>
                  ))}
                </g>

                {/* THE SURFACE THEY BECOME. One sheet of the page's own paper
                    with one drawn edge, so everything standing on it is the
                    only dark thing in its own band. */}
                <g className="fl-plate">
                  <Faces shape={item.plate} className="dgm-solid" />
                  <polygon className="fl-grain" points={item.plate.top} fill="url(#fl-grain)" />
                  <polygon className="fl-plasm" points={item.plate.top} fill="url(#fl-plasm)" />
                  {/* The far half of the wall: the inside surface a reader
                      sees down onto, and the far rim band. Everything on the
                      plate is nearer, so these go down first. */}
                  <g className="fl-vessel is-back">
                    {item.dish.back.map((piece, n) => (
                      <path key={n} className={piece.cls} d={piece.d} />
                    ))}
                  </g>
                  {/* THE MEMBRANE. The plate's own boundary, printed as the
                      double wall a section drawing gives one, in the same plan
                      space as everything standing on the surface - so the wall
                      and the machine inside it are solved from the same two
                      numbers. On Resolve it PARTS at the exit lane and its cut
                      ends thicken into terminal dots; see `wallPath`. */}
                  <g className="fl-membrane" transform={planSpace(item.seat[0], item.seat[1])}>
                    {item.key === 'resolve' ? (
                      <>
                        <path className="fl-bilayer" d={WALL_OPEN.outer} />
                        <path className="fl-bilayer is-inner" d={WALL_OPEN.inner} />
                        {WALL_OPEN.ends.map(([x, y]) => (
                          <circle className="fl-cut" key={`${x}:${y}`} cx={x} cy={y} r="1.7" />
                        ))}
                      </>
                    ) : (
                      <>
                        <rect className="fl-bilayer" x={-WALL_OUT.hx} y={-WALL_OUT.hy} width={WALL_OUT.hx * 2} height={WALL_OUT.hy * 2} rx={WALL_OUT.r} />
                        <rect className="fl-bilayer is-inner" x={-WALL_IN.hx} y={-WALL_IN.hy} width={WALL_IN.hx * 2} height={WALL_IN.hy * 2} rx={WALL_IN.r} />
                      </>
                    )}
                  </g>
                </g>

                {/* THE PLAN OF THE WORK, AND THE WORK STANDING IN IT. Printed
                    geometry and solids are one depth-sorted list, because the
                    tape path has to go down before the frames lie on it and the
                    targets have to be printed before the throats are cut. */}
                <g className="fl-emblem">
                  {item.emblem.map((part, n) => {
                    if (part.plan) {
                      return (
                        <g className={part.cls} key={`${item.key}-e${n}`} transform={part.plan}>
                          {part.mark}
                        </g>
                      )
                    }
                    {/* A HOLE, DRAWN THE WAY TRIDENT DRAWS ITS INTAKE: the far
                        inner wall, the floor, the throat standing on the floor,
                        and the rim as the one hard edge. The throat is what
                        separates a hole from a dark disc - without it the mouth
                        is a filled ellipse with a ring round it, which is a
                        symbol for taking something in rather than somewhere for
                        something to go. */}
                    if (part.hole) {
                      const { cx, cy, rx, ry, deep, throat, collar } = part.hole
                      const bore = `fl-bore-${item.key}-${n}`
                      return (
                        <g className={part.cls} key={`${item.key}-e${n}`}>
                          {/* The mouth is the only window into the bore, so it
                              is the clip for everything inside: the far wall,
                              the dropped floor, the throat, and the cell being
                              swallowed. Nothing of the interior ever draws
                              outside it, which is the whole difference between
                              a hole cut INTO the plate and a drum standing on
                              one. */}
                          <clipPath id={bore}>
                            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
                          </clipPath>
                          <g clipPath={`url(#${bore})`}>
                            <ellipse className="fl-wall" cx={cx} cy={cy} rx={rx} ry={ry} />
                            <ellipse className="fl-floor" cx={cx} cy={cy + deep} rx={rx} ry={ry} />
                            <ellipse className="fl-throat" cx={cx} cy={cy + deep} rx={throat.rx} ry={throat.ry} />
                            {/* THE SWALLOW. The cell going down is drawn inside
                                the same window, stained by the pore that ruled
                                it; the approach cell outside fades at the rim
                                on the beat this one appears. */}
                            {part.swallow ? (
                              <g
                                className={`fl-blk is-${part.stain} fl-sunk`}
                                style={{ '--turn': part.turn ?? 0 }}
                              >
                                <Drum shape={part.swallow.shape} core={part.swallow.core} className="dgm-solid" />
                              </g>
                            ) : null}
                          </g>
                          <ellipse className="fl-rim" cx={cx} cy={cy} rx={rx} ry={ry} />
                          {/* The collar, one ring out from the rim - the same
                              line Trident's intake wears - and it is where the
                              verdict lives: a green or red RING around a quiet
                              machined bore, not a bowl of paint. */}
                          <ellipse className="fl-collar" cx={cx} cy={cy} rx={collar.rx} ry={collar.ry} />
                        </g>
                      )
                    }
                    {/* A HINGED AGENT. Three stations have one and two do not,
                        which is the correction to the pass where all five did.
                        Resolve was the only station a reader liked and the
                        reason was not its geometry - it was that a LEVER is a
                        thing a person can picture their hand on. What got
                        generalised from that was the hinge, when the lesson was
                        the hand: a switch, a catapult and a lever are three
                        things somebody operates, and a claw, a ram and a tape
                        head are not hinged at all. */}
                    if (part.arm) {
                      const [ax, ay] = part.arm
                      const y = ay - part.base
                      const x = part.reach < 0 ? ax + part.reach : ax
                      return (
                        <g
                          className={part.cls}
                          key={`${item.key}-e${n}`}
                          style={{ transformOrigin: `${ax}px ${y}px`, '--turn': part.turn ?? 0 }}
                        >
                          <rect
                            className="fl-limb"
                            x={x}
                            y={y - part.thick / 2}
                            width={Math.abs(part.reach)}
                            height={part.thick}
                            rx={part.radius ?? Math.min(part.thick, Math.abs(part.reach)) / 2}
                          />
                          {part.knob ? (
                            <circle
                              className="fl-grip"
                              cx={ax + part.reach - Math.sign(part.reach) * part.knob}
                              cy={y}
                              r={part.knob}
                            />
                          ) : null}
                        </g>
                      )
                    }
                    return (
                      <g
                        className={part.cls}
                        key={`${item.key}-e${n}`}
                        style={{ '--turn': part.turn ?? 0, '--idle': part.idle ? 1 : 0, '--life': part.life }}
                      >
                        {/* The settle sits INSIDE whatever the part is already
                            doing, so a cell can be riding a claw across the
                            plate and breathing at the same time. */}
                        <g className="fl-settle">
                          {part.round ? (
                            <Drum shape={part.shape} core={part.core} className="dgm-solid" />
                          ) : (
                            <Faces shape={part.shape} className="dgm-solid" />
                          )}
                        </g>
                      </g>
                    )
                  })}
                </g>

                {/* The near half of the wall - outer skirt and near rim band -
                    nearer than anything on the plate, so it goes down after
                    the machine. On Resolve it stops either side of the exit,
                    each cut end capped and wearing its pylon. */}
                <g className="fl-vessel is-front">
                  {item.dish.front.map((piece, n) =>
                    piece.ellipse ? (
                      <ellipse key={n} className={piece.cls} cx={piece.ellipse.cx} cy={piece.ellipse.cy} rx={piece.ellipse.rx} ry={piece.ellipse.ry} />
                    ) : (
                      <path key={n} className={piece.cls} d={piece.d} />
                    ),
                  )}
                </g>
              </g>

              {/* THE STATION, AND ITS NAME UNDER IT. Below the plate, on the
                  datum, in the quietest ink on the sheet - a leader down onto
                  the rule, a tick where this step sits on the run, and the name
                  hanging beneath. The type does not travel with the plate: the
                  solids float and the lettering stays nailed to the ground. */}
              <line className="fl-leader" x1={item.seat[0]} y1={FOOT} x2={item.seat[0]} y2={DATUM} />
              <circle className="fl-station" cx={item.seat[0]} cy={DATUM} r="2.4" />
              <text className="fl-name" x={item.seat[0]} y={NAME_Y} textAnchor="middle">
                {item.label}
              </text>
              {/* THE VALUE UNDER THE NAME. Trident letters every deck with a
                  name and the one number that deck is currently holding, and it
                  is most of why that figure reads as an instrument rather than
                  as an illustration. These are the product's own counts, taken
                  off the replay chain the section is about - and on Screening
                  the drawing above is those exact three verdicts, in the three
                  holes that hand them out. */}
              <text className="fl-fact" x={item.seat[0]} y={FACT_Y} textAnchor="middle">
                {item.fact}
              </text>
              <rect
                className="fl-hit"
                x={item.seat[0] - 116}
                y={item.plate.back[1] - 26}
                width="232"
                height={FACT_Y + 8 - (item.plate.back[1] - 26)}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Prose in the document rather than type inside the drawing: it holds
          its size while the figure scales, a screen reader gets it as text, and
          it is where the curiosity a hover creates has somewhere to go. */}
      <figcaption className={`fl-readout${step ? ' is-hot' : ''}`} aria-live="polite">
        <span className="fl-readpill">{step ? step.label : 'FIVE STEPS'}</span>
        <span className="fl-readline">
          {step ? step.read : 'One protocol, executed the same way at every site, and reconstructable end to end.'}
        </span>
      </figcaption>
    </figure>
  )
}

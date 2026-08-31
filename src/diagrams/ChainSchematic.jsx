import { memo, useState } from 'react'

import { ISO_X, ISO_Y, jitter, planCircle, planSpace, project, roundedBox, roundedCylinder, roundedSlab } from './iso'
import { Faces } from './Solid'
import { Courier } from './Courier'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * FIVE SURFACES, ALREADY DOWN, ALREADY WORKING.
 *
 * The figure used to open as a mess - thirty tiles wandering, drawing together
 * into the five plates as the reader arrived. The entrance was a claim about
 * consolidation, but it spent the row's first seconds on furniture assembling
 * itself, and the machinery is the argument: Protocol, Evidence, Screening,
 * Resolve, Replay, seated in a row and RUNNING. So the plates are simply
 * there, the way a survey sheet is simply drawn, and the only choreography a
 * reader ever watches is the material moving through the run. The machines
 * still gate on `is-live` - clocks run when the figure is on screen, and every
 * seam handoff starts from one shared class flip, which is what keeps the five
 * plates phase-locked.
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
 */

const W = 1200
/* TWO THIRDS OF THE CELL WAS DOING NOTHING. Measured against the assembled
   frame, the sentence ended at 62 and the first label started at 261 - two
   hundred units of blank between the claim and the thing that proves it. The
   frame is cut to what the figure, the run's datum and the sentence occupy. */
const H = 286
const CX = 600
// The row sits low, because the band above it belongs to the sentence, which
// is set into the top of this same cell.
const CY = 178

/* THE PACKING IS SOLVED, NOT EYEBALLED. A plan rectangle of half-extents
   (hx, hy) projects to a top face 2(hx + hy) * ISO_X wide, and a row stepped by
   (+t, -t) advances 2t * ISO_X. So planes collide unless t exceeds hx + hy. */
const STEP = 136
const PLAN = project(CX, CY)
const HALF_X = 79.5
const HALF_Y = 53
/* One thickness for every surface in the drawing: a plate is nine pixels of
   body, and everything cut from the same sheet keeps the same nine. */
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
   its edge - the corner arcs are never cut.

   A GATE CLEARS ITS CARGO'S DRAWN SILHOUETTE, NOT ITS PLAN RADIUS. A plan
   circle of radius r projects to an ellipse rx = r * sqrt(2) * ISO_X - a
   seven-unit cell is seventeen pixels wide on screen - while a gap of span s
   opens s * ISO_X pixels. Eighteen units of gap is fifteen and a half pixels
   of opening: slivers of every crossing cell painted over both jambs for the
   whole crossing, which reads as the cargo showing THROUGH the wall. Every
   cargo gate runs twenty-four units now, centred on its lane. */
const GATES = {
  protocol: { far: [30, 54] },
  evidence: { back: [6, 30], far: [-8, 16] },
  screening: { back: [-10, 14], far: [28, 52] },
  resolve: { back: [-10, 14], front: [14, 42] },
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

/* WHERE THE COURIER'S ROUNDS CALL. One anchor per station, each directly
 * over the thing the courier works there: Protocol's export mouth where the
 * transcript stages, Evidence's entry gate where the led cell docks,
 * Screening's hold bay where the amber bud waits, the back of Resolve's
 * lane where the haul is set down (the lever is a sideways step from
 * there), and Replay's take-up reel. Solved from the same projection the
 * plates are placed with, so a station can move and the rounds follow -
 * and the two cargo drums are drawn at the home anchor, because anything
 * riding inside the courier's own wrappers inherits every leg from there. */
const call = (station, px, py) => r1(CX + ((station - 2) * STEP * 2 + px - py) * ISO_X)
const CALLS = [call(0, 42, -46), call(1, -74, 18), call(2, 40, -16), call(3, -68, 2), call(4, -52, 2)]

/* THE CARGO DRUM. What the courier moves is the run's own cell, drawn at
 * the courier's home anchor just under its body, in the beam - the same
 * seven-unit plan circle every cell on the sheet is - and duplicated once:
 * a violet escort for the transcript leg, an amber haul for the unsettled
 * cell. Both ride inside the courier's dip wrapper, so every leg is
 * inherited rather than mirrored, and their keyframes are pure opacity. */
const CARGO = roundedCylinder(CALLS[0], 99, 7, 5)
const CARGO_CORE = { dx: 1.99, dy: 0.78, ...planCircle(2.4) }

/* THE LETTERING STANDS ALONE. The names ran on a survey datum once - one
 * rule under the row, leaders down onto it, ticks at every station - and the
 * apparatus outweighed the words: a line whose whole job was to hold five
 * labels that already sat in a row. The rule went. Each station's name hangs
 * under its plate in full ink, the value in the machine face under that, and
 * the row itself is the only line the reader needs. */
const NAME_Y = 260
const FACT_Y = 273

/* THE ONE INSTRUCTION ON THE SHEET, and it is set where the sheet has room
 * for it. The five reads are the best writing in this section and a visitor
 * can leave without ever finding out they exist, because the only thing that
 * says so is a cursor change over a plate. So the figure says it itself, in
 * its own lettering, centred over the run.
 *
 * It sits in the AIR BAND the courier works, above the highest point of the
 * round: the body rests at 72 and the climb home is the one leg that lifts it
 * (fl-duck, minus fourteen), so nothing on the sheet reaches 56, and a
 * baseline at 34 clears the courier by a full body without crowding the top
 * edge. The line and the courier share that band and never share a pixel.
 *
 * And it retires the moment it is obeyed - `is-read` on the sheet the first
 * time a station goes hot - because an instruction still standing after it has
 * been followed is just furniture. It is not in the aria-label: the figure's
 * description says what is DRAWN, and a screen reader has the reads already,
 * on five focusable stations, without being told to point at anything. */
const INVITE_Y = 34

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
        // vessel: a cell in the protocol's violet, the ink and not the
        // silhouette saying this one is the document. It stages off the
        // bank's rounded corner - and it only ever reaches the mouth under
        // the courier's beam, once per round, where the crossing becomes
        // the courier's own escort drum. Natural depth: nothing stands on
        // its lane, and a cell riding OVER the whole plate paints over the
        // near gate pylon it should pass behind.
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
      // The pile keeps clear of the far rail's line: its deepest cells sit
      // at plan y -27, so nothing material ever shares ground with the
      // gantry's running gear - the perspective law holds the gap.
      const pile = [
        [-56, -27, 5, 0], [-38, -27, 6, 0], [-58, -12, 4, 0], [-36, -10, 6, 0],
        [-56, 6, 5, 0], [-40, 6, 4, 0], [-46, -28, 4, 5], [-52, 4, 4, 5],
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
        // THE GANTRY IS A BACK RUNWAY WITH A CANTILEVER ARM - the way a
        // bench liquid handler actually stands: an elevated runway along
        // the deck's far edge on two end towers, a carriage riding it, and
        // a thin arm reaching forward at height with the head hung off its
        // tip. Two earlier constructions failed on this projection: a beam
        // on mid-plate posts read as a clothesline, and a front-to-back
        // bridge projected end-on into a clump that sat over the entry
        // gate, and its towers crowded the shipping lane. A runway along x
        // projects LONG AND FLAT - the one clean reading this projection
        // gives a rail. PLAN CLEARANCE IS NOT SCREEN CLEARANCE: the right
        // tower once stood at 24, past the gate's lane in plan, and its
        // twenty-six-unit box still rose across the gate mouth on screen -
        // and the outbound shipment, sliding through ground BEHIND it,
        // painted in front of it, because a mover's honest seat depth
        // cannot follow it behind a post's early paint slot. AND A SLIVER
        // OF DAYLIGHT STILL READS AS BLOCKED: at 44 the tower cleared the
        // gate's traffic by four units, and next to a tall dark pillar
        // four units is nothing - the mouth still read walled off. So the
        // tower plants at 54, the deck's own right corner, with a full
        // cell silhouette of open wall between the pillar and everything
        // that crosses the gate - the cut, both pylons, and the shipment's
        // whole swept silhouette - and the spec holds that daylight, at
        // that width, in numbers. Towers first, runway over their caps,
        // sliders in the OVER band.
        { ...stand(-58, -38, 5.5, 4.5, 26, 2.5), cls: 'fl-rig is-tower', depth: -102 },
        { ...stand(54, -38, 5.5, 4.5, 26, 2.5), cls: 'fl-rig is-tower', depth: -101 },
        { ...stand(-2, -38, 56, 3, 4, 2, 26), cls: 'fl-rig is-rail', depth: -100 },
        { ...stand(-52, -38, 6, 4, 8, 2.5, 24), cls: 'fl-gant', depth: OVER - 6 },
        { ...stand(-52, -27, 2.5, 11, 3, 1.5, 27), cls: 'fl-gant is-beam', depth: OVER - 5 },
        ...pile.map(([px, py, high, base], i) => cell(px, py, null, high, base, { turn: i })),
        // The one the claw takes. It is on top of the pile, because that is
        // where a claw can reach. The claw keeps its own 5.6s rhythm: the
        // courier runs the seams, not the housework.
        { ...cell(-52, -20, null, 5), cls: 'fl-blk fl-pick' },
        ...slot.slice(1).map(([px, py], i) => cell(px, py, null, 5, 0, { turn: i })),
        // The first socket is a WAYPOINT, not a terminus - and the cell that
        // lands in it is the fl-ship element below, one drawing for the whole
        // journey. Two elements used to split it at the staging seat, and the
        // relay showed: the shipment faded up on the seat while the laid cell
        // was still sliding toward it, so a reader saw the subject twice.
        // THE CARRIAGE. Two jaws hanging off a head, and a cell held between
        // them. All three ride one clock, so the cell travels because the claw
        // is carrying it rather than beside it.
        { ...cell(-52, -20, null, 5, 14), cls: 'fl-blk fl-carry', depth: OVER + 1 },
        // THE DOCKED TRANSCRIPT. The instructions this machine organises
        // by - the same violet cell that left the nucleus, delivered once
        // per round by the courier and set in through this gate. It fades
        // up at the mouth beneath the hovering escort, slides to the apron,
        // and rests there until the work absorbs it.
        { ...cell(-65, 18, null, 5), cls: 'fl-blk is-script fl-dock' },
        // THE SHIPMENT, END TO END IN ONE ELEMENT. Organised material does
        // not pile up on the bed - it goes on to be screened - and the whole
        // leg is one cell now: it appears in the first socket at floor level
        // under the lowered jaws (the crossfade IS the release), slides the
        // printed lane to the staging seat, dwells there through the cycle
        // seam, and continues straight out through the gate - socket, seat
        // and gate all on one plan line, one bearing, one drawing. Splitting
        // it into a laid cell and a shipping cell put two pucks on the seat
        // at once. Drawn at the socket, its own honest depth.
        { ...cell(slot[0][0], slot[0][1], null, 5), cls: 'fl-blk fl-ship' },
        { ...stand(-52, -30, 3, 8, 10, 3, 14), cls: 'fl-claw is-jaw', depth: OVER },
        { ...stand(-52, -10, 3, 8, 10, 3, 14), cls: 'fl-claw is-jaw', depth: OVER + 2 },
        // THE HEAD HOUSING hangs off the cantilever's tip, over the work
        // line - its roof laps the arm's underside, the jaws hang from its
        // foot, and the whole sliding set (carriage, arm, housing) rides
        // the runway's x-only clock while only the jaws descend.
        { ...stand(-52, -20, 5.5, 5.5, 8, 2.5, 21), cls: 'fl-gant is-head', depth: OVER + 3 },
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
          // THE VESICLE TRAIL. Three rings thinning from the reticulum's
          // outer sac toward the verdict line - sorted material leaving the
          // organelle. Printed, not solid, by the sheet's own size law: a
          // body under seventeen pixels is a mark, so traffic this small
          // draws as print, the same ink every lane on the sheet is drawn
          // in. The bud on the amber lane is the same story at solid size.
          <circle className="fl-ruled" key="v1" cx="8" cy="2" r="4" />,
          <circle className="fl-ruled" key="v2" cx="-2" cy="-8" r="3.2" />,
          <circle className="fl-ruled" key="v3" cx="-12" cy="-18" r="2.4" />,
          // THE FEED LANE. From the bed's pore column to the green mouth,
          // printed before anything travels it - the same convention as
          // every other travel on the sheet.
          <line className="fl-ruled" key="feed" x1="-40" y1="-2" x2="-40" y2="-12" />,
          // THE AMBER LANE. Out of the reticulum's pocket - where the hold
          // cell forms - past the bay and straight through the gate in the
          // far wall, printed before anything travels it.
          <rect key="bay" x="28" y="-46" width="24" height="38" rx="10" />,
          <line className="fl-ruled" key="lane" x1="40" y1="18" x2="40" y2="-52" />,
        ]),
        // THE SORTING BODY IS DRAWN IN THE ROUGH ER'S OWN LANGUAGE. Not a
        // tiered cake, not three pills bolted into a U: nested curved
        // LAMELLAE - thin sacs of one constant width, wrapping a pocket
        // that opens toward the gate, studded with ribosome grit - the
        // reference drawing every biology text gives the reticulum, bent to
        // this plate's use: the pocket is where the amber cell forms, and
        // the mouth is the way out to the wall.
        //
        // Each lamella is an ARC STROKE in plan space. The plan matrix
        // squashes the pen anisotropically, so the stroke IS the projected
        // band - a curved sac keeps one true plan width the whole way
        // round, which no capsule composition could do. Two strokes make
        // the solid: the under at ground, the sac lifted a storey; the
        // sliver of under showing along the screen-low edge is the wall,
        // and it falls on the viewer-facing flank of any curve by
        // construction. And the nesting is depth-honest: every band splits
        // at one angle into a far arc painted behind the bud's seat and a
        // near arc painted in front of it - the shared round cap covers
        // the seam - so the cell forming in the pocket sits inside every
        // sac that wraps it.
        ...(() => {
          const RER = { cx: 38, cy: 15, lift: 4 }
          const lam = [
            [14.5, 3.8, -29, 216],
            [20, 3.8, -36, 208],
            [25.5, 3.8, -44, 196],
          ]
          const spot = (r, deg) => [
            r1(RER.cx + r * Math.cos((deg * Math.PI) / 180)),
            r1(RER.cy + r * Math.sin((deg * Math.PI) / 180)),
          ]
          const arc = (r, from, to) => {
            const [x0, y0] = spot(r, from)
            const [x1, y1] = spot(r, to)
            return `M ${x0} ${y0} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1} ${y1}`
          }
          const grit = (r, from, to, step) => {
            const dots = []
            for (let a = from + 14; a < to - 8; a += step) dots.push(spot(r + (dots.length % 2 ? 1.4 : -1.4), a))
            return dots
          }
          return lam.flatMap(([r, w, a0, a1], i) => (
            [[a0, 120, RER.cx + RER.cy + r], [120, a1, RER.cx + RER.cy - r]].flatMap(([from, to, depth]) => [
              printed(depth, 'fl-rer is-under', <path key="u" d={arc(r, from, to)} strokeWidth={w} />),
              printed(depth + 0.001, 'fl-rer is-sac', <path key="s" d={arc(r, from, to)} strokeWidth={w} />, RER.lift),
              printed(depth + 0.002, 'fl-rer is-grit', grit(r, from, to, 24 + i * 5).map(([x, y], n) => (
                <circle key={n} cx={x} cy={y} r="1.05" />
              )), RER.lift),
            ])
          ))
        })(),
        // THE BUD. The amber cell does not appear at the bay - it is
        // DISPATCHED: it forms in the reticulum's pocket, wrapped by every
        // sac that nests around it, exactly the way the vesicle trail
        // already leaving the body says this organelle works, then slides
        // out through the mouth and down the lane to the bay - once per
        // round, timed so the courier hanging overhead watches it form and
        // takes it the moment it lands. The one plate whose machine is a
        // sorting organelle gets the one arrival drawn as secretion - no
        // claw, no ram, its own grammar. It buds already amber: dispatch
        // IS the ruling.
        { ...cell(40, 18, 'hold', 5), cls: 'fl-blk is-hold fl-bud' },
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
        // The amber gate stays cut and stained - the wall saying where this
        // cargo is allowed out - but nothing runs its lane on a loop any
        // more: the unsettled cell leaves this plate only in the courier's
        // haul, once per round, from the bay the bud slides into.
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
          // The lane runs from the entry gate to the exit rail, because
          // the courier sets the new cell down AT the gate - one pitch
          // behind the line, on a seat nothing occupies - and the index
          // carries it forward onto the lane proper.
          <line key="lane" x1="-72" y1={lane} x2="48" y2={lane} />,
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
        // And the one the courier sets down: AT the entry gate, one full
        // pitch behind the first occupied seat - never on top of a cell
        // already standing - and the next index carries it onto at(0).
        { ...cell(at(0) - PITCH, lane, 'hold'), cls: 'fl-blk is-hold fl-feed' },
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
        // The take-up reel's raised hub is the transport's one button: the
        // courier lands on it once per round and the hub alone visibly
        // gives - the frame before the head turns for home - while the
        // reel base stays planted, solid on the plate like a housing.
        { ...drum(-52, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(52, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(-52, 2, 8, 3, 7), cls: 'fl-reel is-hub is-pressed' },
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

/* WHAT THE CAPTION SAYS WHEN NO STATION IS HOT - and one of the lines the
   readout reserves room for, so it is a name, not an inline string.

   The section used to close with a slogan under the drawing. The slogan was
   answering a claim the page had already made twice, and it sat where the one
   piece of writing this figure actually needs belongs: the reads. So the
   slogan went, the reads grew, and this line carries the run at rest.

   THE READS SAY WHAT CHANGES, NOT WHAT IS THERE. A reader who has never run a
   trial needs to know what each station replaces: the binder, the checklist
   worked by hand, the judgement call that lands differently twice, the day
   spent chasing twenty systems, the audit nobody can answer. And they need to
   know who does that work now.

   AND THEY SAY IT IN THE PRODUCT'S OWN LAW, which is one sentence long: agents
   prepare the work at every step, and deterministic code and a named person
   decide. So every station shows an agent doing the preparation, screening
   included, because a fact does not map itself onto a criterion. The boundary
   is then carried by what the sentence says NEXT, in the positive: at
   Screening the ENGINE decides, at Resolve a NAMED PERSON picks the action and
   signs. Written as a negative it read as a denial of something the reader had
   not suspected, which is a strange thing to put in a caption.

   FIVE READS, FIVE SHAPES. Written to one template they came out as five
   verses of the same hymn - agent verb, object, consequence - and a reader
   skims the second one and stops. Each station is a different problem, so
   each read is a different sentence. Protocol states a transformation.
   Evidence opens on the day the coordinator actually has and answers it.
   Screening opens on a principle nobody argues with, then earns it. Resolve
   opens on the work itself. Replay opens on the bill. Five different first
   words, and only one read that begins by naming the agent.

   AND EACH ONE IS AIMED AT SOMETHING THAT ACTUALLY HURTS - the amendment that
   silently invalidates what the coordinator knows, the value that takes four
   systems and a phone call to confirm, the eligibility call that lands
   differently depending on who read the chart, the inbox that is really a
   worklist wearing the wrong clothes, and the audit that pays a person to
   rebuild by hand what a machine already decided. In PROSE, not in figures:
   the market brief carries numbers this site has no verified source for, and
   a caption that quotes one is a claim the company then has to defend. Name
   the pain; leave the arithmetic to the cited panels downpage.

   NO DASHES, AND NO SHOUTING. The reads are sentences, so they break on full
   stops rather than on a punctuation mark holding two clauses apart, and a
   verdict named in prose is set in prose: pass, review, fail. The demo chrome
   is where those words are stamped in capitals, because there they are states
   of a record rather than words in a sentence.

   Every claim here is one the kernel makes: a criterion cited back to the
   source text, facts bound to their record and sealed as of the day, one
   deterministic verdict for a given protocol and evidence, a signature on
   every decision, and a run that reproduces rather than gets rebuilt. */
const READ_REST = 'One protocol, executed the same way at every site. Agents prepare the work at every step. Deterministic code and a named person make every decision that counts.'

const STEPS = [
  {
    key: 'protocol',
    label: 'PROTOCOL',
    fact: 'V2.1 - 36 CRITERIA',
    read: 'The trial arrives as a document and transforms into an object that runs. Agents draft each criterion as executable logic, cited back to the sentence it came from. A person signs the version, and when an amendment lands the logic moves with it.',
  },
  {
    key: 'evidence',
    label: 'EVIDENCE',
    fact: '25 / 36 MAPPED',
    read: 'A single lab value used to mean opening system after system, then a phone call. Agents now bring the record to the criterion that needs it, each fact tied to the document it came from and sealed on the day it was read. Nothing about the patient leaves the site.',
  },
  {
    key: 'screening',
    label: 'SCREENING',
    fact: '1 PASS - 4 REVIEW - 3 FAIL',
    read: 'Two people reading the same chart should not reach two answers. Agents line each fact up against what a criterion actually requires; the engine returns pass, review or fail, and the same evidence returns the same verdict tomorrow, with its reasons attached.',
  },
  {
    key: 'resolve',
    label: 'RESOLVE',
    fact: 'PI SIGNED - ED25519',
    read: 'Hard cases are the job, and they usually arrive as a full inbox. Here they arrive as a worklist: agents stage each review with its citations already attached, and a named person picks the action and signs it. One surface, and the day stops being a search.',
  },
  {
    key: 'replay',
    label: 'REPLAY',
    fact: 'CHAIN INTACT 9 / 9',
    read: 'An audit is where a trial gets expensive, because someone has to rebuild every decision by hand, record by record. A run here does not get rebuilt. It reproduces, holding the protocol version, the evidence as of that day and every signature.',
  },
].map((step, index) => {
  const t = (index - 2) * STEP

  const seat = PLAN(t, -t)
  return {
    ...step,
    index,
    seat,
    // Where this station sits across the sheet, in the pointer field's own
    // units, so the stylesheet can read nearness without measuring anything.
    sx: Math.round(((seat[0] / W) - 0.5) * 2 * 1000) / 1000,
    emblem: mechanism(step.key, t),
    // The plate: one sheet of the page's own paper with one drawn edge.
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

/* ONE STATION'S ENTIRE DRAWING, MEMOISED ON ITS OWN GEOMETRY. Every part
   below depends only on the module-level station record, but the figure's
   hover state lives on the common ancestor - so before this memo, leaning
   on any plate made React reconcile all five stations' full trees: a
   couple of thousand nodes of pure churn at the exact moment a reader
   interacts, which is a visible hitch on a weak device. The memo pins each
   station's subtree to its `item`, whose identity never changes, so a
   hover now touches five wrapper groups and the caption and nothing else. */
const StationBody = memo(function StationBody({ item }) {
  return (
    <>
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
                {/* THE SURFACE. One sheet of the page's own paper
                    with one drawn edge, so everything standing on it is the
                    only dark thing in its own band. */}
                <g className="fl-plate">
                  <Faces shape={item.plate} className="dgm-solid" />
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

              {/* THE STATION, AND ITS NAME UNDER IT. Below the plate, bare
                  and in full ink - no rule, no leader, no tick: the label
                  alone. The type does not travel with the plate: the solids
                  float and the lettering stays nailed to the ground. */}
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
    </>
  )
})

export default function ChainSchematic({ animate = true }) {
  const frame = useCenterOnOverflow()
  const [hot, setHot] = useState(null)
  // Once a station has been read the invitation has done its job and goes.
  const [read, setRead] = useState(false)
  // The monitor's one nerve: clicked, it bolts; the flee animation ending
  // brings it back on its own, so there is no timer to leak.
  const [shy, setShy] = useState(false)
  const step = STEPS.find((item) => item.key === hot) ?? null

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor${animate ? ' is-live' : ''}${read ? ' is-read' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Five plates in a row, seen in axonometric projection, their machines already running - each plate bounded by its own printed double-walled membrane, the way a section drawing bounds a cell. The five stations are lettered in ink beneath their plates: Protocol, Evidence, Screening, Resolve, Replay. A small hovering courier shaped as the flat blue Damaros mark - a plump two-part silhouette that bobs with a soft jelly squash, its floor shadow beneath it - works the air above the row on one slow round, and the seams of the run move only under it. One cell - a round body with its nucleus drawn on top - runs the whole row. A grid of twelve switches on a breaker board is thrown one at a time, each settling green or red, and once per round the courier drops to the export gate: the compiled violet transcript slides to the mouth under its beam and crosses the seam riding just below the courier's body, led to the next plate and set in through the entry gate, where it docks beside the gantry. There a claw closes on one cell in a heap, lifts it, carries it across, and sets it down into an ordered bed of round sockets; the placed cell then slides up a printed lane to a staging seat, waits its beat, and continues straight out through that plate's far gate - one cell, one line, socket to seat to gate. Along the far long edge of the next plate, three verdict seats wait in a line - green, red, amber. The bed feeds the green pore as a moving line: one cell slides onto the mouth and is visibly swallowed down the bore while the seat behind it shuffles forward and the newly arrived cell takes the empty place; the red pore stands open and ringed; the amber seat is a gate cut through the plate's wall, its pylons stained amber. The unsettled amber cell forms inside the plate's reticulum - nested curved sacs opening toward the gate - slides down the lane to the bay while the courier waits overhead, and leaves only in the courier's hold: carried through the air and set down at the resolve lane's entry gate, one seat behind the line, so it never lands where a cell already stands. The courier then steps sideways onto the lever and throws it - nothing else ever moves that lever - so the horizontal ram crosses the lane, pushes one cell clean off the edge through the one gap in the membrane, and the line indexes forward. On the last plate the run lies as frames on a tape between two reels, and a head reads its way out along the tape; the courier lands on the take-up reel's raised hub - the transport's one button - the hub gives under the press, and only then does the head turn and rewind, the courier stepping backwards alongside it before allowing itself one full spin on the climb home. Clicked anywhere on its round, the courier drops whatever it is carrying and darts off the sheet, drifting back on its own. Pointing at a plate darkens the ground beneath it and brings its verdicts forward."
        >
          <defs>
            {/* One stipple only. The plate used to carry a second, coarser
                dot grid as well, and at 13px pitch it read as the page's own
                matrix showing THROUGH the plate - a solid surface looking
                see-through. The fine ribosome stipple below is clearly
                texture; the lookalike grid is gone. */}
            <pattern id="fl-plasm" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="4.5" cy="3.5" r="0.55" />
            </pattern>
          </defs>

          {/* Two lines, one shown. A phone has no hover to offer and the
              stations answer a tap through their own focus, so the sheet asks
              for the gesture the reader actually has. Swapped in CSS off
              `(hover: none)` rather than in JS, because a media query is the
              thing that knows. */}
          <text className="fl-invite is-pointer" x={CX} y={INVITE_Y} textAnchor="middle">Hover a station to read the step</text>
          <text className="fl-invite is-touch" x={CX} y={INVITE_Y} textAnchor="middle">Tap a station to read the step</text>

          {STEPS.map((item) => (
            <g
              className={`fl-step is-${item.key}${hot === item.key ? ' is-hot' : ''}`}
              key={item.key}
              style={{ '--sx': item.sx }}
              onMouseEnter={() => { setHot(item.key); setRead(true) }}
              onMouseLeave={() => setHot((current) => (current === item.key ? null : current))}
              onFocus={() => { setHot(item.key); setRead(true) }}
              onBlur={() => setHot(null)}
              tabIndex={0}
              role="button"
              aria-label={`${item.label}, ${item.fact}. ${item.read}`}
            >
              <StationBody item={item} />
            </g>
          ))}

          {/* THE COURIER ON ITS ROUNDS. The one figure clinical research
              already has for visiting every site and moving the paperwork
              along, drawn as a small character built from the company mark
              (unnamed on the sheet - the christening is the company's) and
              working the air band above the row on a 16.8-second round.
              THE ROUND IS THE LINE'S CLOCK: the seams the courier owns
              move only under it. At Protocol it drops to the export mouth
              and the staged transcript slides under its beam; the crossing
              to Evidence is its own violet escort drum, riding in the dip
              wrapper below; at Evidence it sets the cell in through the
              entry gate. At Screening it waits out the reticulum forming
              the one amber bud, drops onto the bay and takes it; the haul
              rides the same way to the back of Resolve's lane, where it is
              set down as the line's new feed - then the sideways step onto
              the lever, the dip that lands on the knob, and the throw that
              follows two tenths of a second later, driving the ram, the
              push and the index. At Replay it lands on the take-up reel,
              the reel gives, and the head turns for home - then the one
              backward step alongside the rewind, which on this sheet only
              Replay may do. Then altitude, and the ride home. Hops run the
              one plan axis that projects flat, dips ride the height axis
              all the way to contact, and the one ground contact is a
              shadow. Clicked, it bolts straight off the sheet and drifts
              back - the flee composes on its own wrapper, so the round
              underneath never stutters, and any cargo mid-leg bolts with
              the body the way a startled courier keeps hold of the parcel. */}
          <g className={`fl-watch${shy ? ' is-shy' : ''}`} aria-hidden="true">
            <g className="fl-patrolled">
              <g className="fl-groundwrap">
                <ellipse className="fl-monitorshade" cx={CALLS[0]} cy="170" rx="14" ry="4.6" />
              </g>
              <g
                className="fl-dart"
                onAnimationEnd={(event) => { if (event.animationName === 'fl-flee') setShy(false) }}
              >
                <g className="fl-duck">
                  {/* THE SPEED LINES. Three short strokes trailing the body
                      whenever it flies a leg - the cartoon word for motion,
                      which is exactly the register this character lives in.
                      One set trails left for the working legs (they all run
                      rightward), the mirrored set trails right for the ride
                      home, and both ride inside the dip wrapper so they
                      follow every move the body makes. */}
                  {/* Each drum rides in a parcel wrapper: startled, the
                      courier drops what it carries - the wrapper fades
                      whatever the cargo clock says. */}
                  <g className="fl-parcel">
                    <g className="fl-blk is-script fl-escort">
                      <Drum shape={CARGO} core={CARGO_CORE} className="dgm-solid" />
                    </g>
                  </g>
                  <g className="fl-parcel">
                    <g className="fl-blk is-hold fl-haul">
                      <Drum shape={CARGO} core={CARGO_CORE} className="dgm-solid" />
                    </g>
                  </g>
                  <g className="fl-hover">
                    <line className="fl-beam" x1={CALLS[0]} y1="86" x2={CALLS[0]} y2="102" />
                    <g className="fl-monitor" onClick={() => setShy(true)}>
                      <Courier x={CALLS[0]} y={72} />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </svg>
        {/* THE WARP. The courier genuinely distorts the page's dot matrix
            as it flies: this div rides the flight line BEHIND the sheet
            (the svg's air band is transparent, so it shows through there
            and can never cover a plate or the body), carrying the field's
            own dot gradient magnified over a patch of page ground, edge
            feathered - so inside the circle the real lattice reads bent
            and swollen, and the boundary shear moves with the flight.
            Its stops are the patrol's own anchors, derived to the same
            hundredth, and it lights only mid-leg and on the ride home. */}
        <div className="fl-warplens" aria-hidden="true" />
      </div>

      {/* Prose in the document rather than type inside the drawing: it holds
          its size while the figure scales, a screen reader gets it as text, and
          it is where the curiosity a hover creates has somewhere to go. */}
      <figcaption className={`fl-readout${step ? ' is-hot' : ''}`} aria-live="polite">
        <span className="fl-readpill">{step ? step.label : 'FIVE STEPS'}</span>
        {/* THE CAPTION HOLDS ITS GROUND. Every read the pill can show is
            drawn in the same grid cell, hidden - so the line box stands as
            tall as the tallest caption at ANY width, and the closer under
            the figure never moves when the narration changes. Reserving a
            guessed number of lines broke at exactly the widths a guess
            breaks at. */}
        <span className="fl-readline">
          {[...STEPS.map((s) => s.read), READ_REST].map((text) => (
            <span className="fl-readghost" aria-hidden="true" key={text}>{text}</span>
          ))}
          <span className="fl-readtext">{step ? step.read : READ_REST}</span>
        </span>
      </figcaption>
    </figure>
  )
}

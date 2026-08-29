import { useEffect, useRef, useState } from 'react'

import { ISO_Y, jitter, planCircle, planSpace, project, roundedCylinder, roundedSlab } from './iso'
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
const CELL = 50
const TILE = 24
const COLS = 3
const ROWS = 2
const STEP = 136
const PLAN = project(CX, CY)
const HALF_X = 75
const HALF_Y = 50
/* One thickness for every surface in the drawing. A plate and the six tiles it
   is made of are the same sheet, so they are the same nine pixels of body -
   otherwise the handoff between them is a step change in an object that is
   supposed to be continuous. */
const SHEET = 9
/* Twelve, not ten. A softer corner is most of what separates a drawn panel from
   a machined one, and the plate is the largest radius in the figure - every
   other one is read against it. */
const PLATE_R = 12

/* THE PITCH THE RESOLVE LINE INDEXES BY, and it is a constant because the whole
   seamlessness of that station is an arithmetic identity about it. See the
   note on the ram. */
const PITCH = 24

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

   What ties a run together is not the machines. It is the BLOCK passing through
   them: it arrives in a pile, is put in order, drops down one of three holes,
   runs a line where a person can push it off, and ends up on a tape that can be
   wound back. The block carries its verdict from the hole that gave it one.

   So each station is a different KIND of machine working on that block, and no
   two of them share a kinematic:

   PROTOCOL IS A BREAKER BOARD. A grid of switches on a bank - the same relief
   grid Trident's contract deck is built on, at switch scale - thrown one at a
   time in reading order, each settling green or red. That is what a protocol is
   once it stops being prose: a board of conditions that are met or not.

   EVIDENCE IS A PICK AND PLACE. A pile of material on one side, an ordered bed
   of slots on the other, and a claw on a gantry that goes down into the pile,
   comes up with a block, carries it across and sets it in a slot. Nothing is
   created and nothing is taken away. The pile visibly loses the block and the
   bed visibly gains it, which is the only way a reader can see that the machine
   is ORGANISING rather than hovering.

   SCREENING IS THREE THROATS, cut through the plate along its front-right edge
   and drawn the way Trident draws its intake: the far wall, the floor, and the
   throat standing on it. Blocks arrive with no verdict at all - plain house
   blue - and sink into one of the three. The hole is what gives them a colour.
   The amber one is the machine admitting it cannot settle the question, so that
   block does not stay: it is thrown to the next plate, where a person is.

   RESOLVE IS A HORIZONTAL RAM. Amber blocks run a lane, a hand throws the
   lever, and a ram comes across the lane and pushes the block at the station
   clean off the near edge of the plate, where it falls away. The line then
   indexes one pitch and a new block arrives at the back. That is the honest
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

  /* A HOLE, DRAWN THE WAY TRIDENT DRAWS ITS INTAKE.

     Looking into a bore from above and to the side you see the FAR inner wall,
     the floor, and whatever stands on that floor. So that is what is drawn: the
     band between the two rims on the far side, the floor under it, the throat
     standing on the floor, and the rim itself as the one hard edge. Four
     shapes, no filter, and it reads as depth at any size.

     The throat is what separates a hole from a dark disc. Without it the mouth
     is a filled ellipse with a ring round it - a symbol for taking something in
     rather than somewhere for something to go. */
  const well = (px, py, r, deep, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    const { rx, ry } = planCircle(r)
    const gape = planCircle(r * 0.36)
    const cy = sy - base
    const [left, right] = [Math.round((sx - rx) * 10) / 10, Math.round((sx + rx) * 10) / 10]
    return {
      depth: px + py,
      hole: {
        cx: sx,
        cy,
        rx,
        ry,
        deep,
        throat: gape,
        // Over the far rim, down the bore, and back along the near edge of the
        // floor: the wall a reader can actually see into.
        wall: `M ${left} ${cy} A ${rx} ${ry} 0 0 1 ${right} ${cy} L ${right} ${cy + deep} A ${rx} ${ry} 0 0 0 ${left} ${cy + deep} Z`,
      },
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

  /* A BLOCK. THE MATERIAL THE WHOLE ROW IS MADE OF.

     It arrives in a pile with NO verdict - plain house blue, because a block
     nobody has ruled on is not a state, it is material - and it takes a colour
     from the hole it falls down. Green for eligible, red for not, amber for the
     ones a machine cannot settle, which is the only reason Resolve exists and
     the reason a person is standing at it.

     Two layers that do not fight: the station's ink dresses the plate and the
     machine, and the block's colour is the state of one subject. The same green
     on Screening is the same green on Replay because it is the same block. */
  const block = (px, py, verdict, high = 6, base = 0, extra = {}) => ({
    ...stand(px, py, 5, 5, high, 1.5, base),
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
      const cols = [-34, -11, 12, 35]
      const rows = [-26, 0, 26]
      const verdict = ['pass', 'pass', 'fail', 'pass', 'pass', 'pass', 'fail', 'pass', 'pass', 'fail', 'pass', 'pass']
      const bank = rows.flatMap((py, r) => cols.map((px, c) => [px, py, r * cols.length + c]))
      return [
        printed(-800, 'fl-print', [
          <rect key="board" x="-54" y="-46" width="108" height="92" rx="6" />,
        ]),
        // THE BANK IS DRAWN FIRST, AND NOT AT ITS OWN DEPTH. Everything else
        // here is sorted by the depth of the plan point it stands on, which is
        // right for a small solid and wrong for a large one: sorted by its
        // centre, a plate-sized bank draws OVER every switch standing on its
        // far half, and six of the twelve went missing.
        { ...stand(0, 0, 46, 38, 3, 4), cls: 'fl-board', depth: -700 },
        // The bus rails go on the bank's own top face, not on the plate
        // underneath it, where the bank would cover them.
        printed(-699, 'fl-print', rows.map((py) => (
          <line className="fl-ruled" key={py} x1="-40" y1={py} x2="40" y2={py} />
        )), 3),
        ...bank.flatMap(([px, py, i]) => [
          { ...stand(px, py, 5, 5, 5, 1.5, 3), cls: 'fl-seat' },
          arm(`fl-toggle is-${verdict[i]}`, px, py, 11, 11, 4, { knob: 3.2, turn: i }),
        ]),
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
    // closes, comes up with a block, crosses to the bed and sets it in a slot.
    // The pile loses that block and the bed gains it. Same material, better
    // order, which is the entire claim of the step.
    evidence: () => {
      // A PILE, NOT A SCATTER: some of these stand on the others, which is the
      // only difference between material heaped up and material laid out.
      const pile = [
        [-62, -30, 9, 0], [-44, -34, 11, 0], [-64, -12, 7, 0], [-42, -10, 12, 0],
        [-62, 6, 10, 0], [-46, 6, 8, 0], [-60, -32, 6, 8], [-58, 4, 5, 9],
      ]
      const slot = [-20, 8].flatMap((py) => [4, 28, 50].map((px) => [px, py]))
      return [
        printed(-800, 'fl-print', [
          <rect key="pit" x="-70" y="-42" width="34" height="58" rx="5" />,
          ...slot.map(([px, py]) => (
            <rect key={`${px}:${py}`} x={px - 8} y={py - 8} width="16" height="16" rx="2" />
          )),
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
        { ...stand(-68, -20, 5, 5, 30, 1.5), cls: 'fl-rig is-post' },
        { ...stand(62, -20, 5, 5, 30, 1.5), cls: 'fl-rig is-post' },
        { ...stand(-3, -20, 67, 3.5, 4, 2, 30), cls: 'fl-rig is-beam', depth: -600 },
        ...pile.map(([px, py, high, base], i) => block(px, py, null, high, base, { turn: i })),
        // The one the claw takes. It is on top of the pile, because that is
        // where a claw can reach.
        { ...block(-52, -20, null, 6), cls: 'fl-blk fl-pick' },
        ...slot.slice(1).map(([px, py], i) => block(px, py, null, 6, 0, { turn: i })),
        // The slot it fills. Empty until the claw lets go of what it is
        // carrying, so the bed is one block fuller for having been worked on.
        { ...block(slot[0][0], slot[0][1], null, 6), cls: 'fl-blk fl-lay' },
        // THE CARRIAGE. Two jaws hanging off a head, and a block held between
        // them. All three ride one clock, so the block travels because the claw
        // is carrying it rather than beside it.
        { ...block(-52, -20, null, 6, 14), cls: 'fl-blk fl-carry', depth: OVER + 1 },
        { ...stand(-52, -30, 3, 8, 10, 1, 14), cls: 'fl-claw is-jaw', depth: OVER },
        { ...stand(-52, -10, 3, 8, 10, 1, 14), cls: 'fl-claw is-jaw', depth: OVER + 2 },
        { ...stand(-52, -20, 8, 8, 6, 2, 24), cls: 'fl-claw is-head', depth: OVER + 3 },
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
    // The blocks arrive with NO verdict. The hole is what gives them one.
    screening: () => {
      const hole = [[55, 32, 'pass'], [55, 0, 'fail'], [55, -32, 'hold']]
      const wait = [-30, -6].flatMap((py) => [-56, -34, -12].map((px) => [px, py]))
      return [
        printed(-800, 'fl-print', [
          <rect key="bed" x="-64" y="-40" width="60" height="44" rx="4" />,
          // ONE RING PER THROAT. Two turned three holes into nine concentric
          // circles that all ran into each other, which is a target pattern and
          // not a plan.
          ...hole.map(([px, py]) => <circle className="fl-ruled" key={px + py} cx={px} cy={py} r="20" />),
        ]),
        ...wait.map(([px, py], i) => block(px, py, null, 6, 0, { turn: i })),
        ...hole.map(([px, py, v]) => ({ ...well(px, py, 14, 8), cls: `fl-hole is-${v}` })),
        ...hole.map(([px, py], i) => block(px, py, null, 6, 0, { cls: 'fl-blk fl-faller', turn: i })),
        // THE CATAPULT. The amber block is the only thing that leaves this
        // plate, and it leaves thrown - the one moment in the figure where a
        // machine hands a decision to a person because it has run out of rules.
        //
        // IT STANDS ON A PIVOT, INBOARD OF THE HOLE IT SERVES. Hinged straight
        // over the amber throat it sat on the plate's own back-right corner
        // with nothing underneath it, and at that corner every pixel of height
        // carries an object above the plate's outline - so it read as a lollipop
        // stuck to the edge of the drawing. Bolted to a boss a little inboard,
        // the same arm reaches over the throat and is plainly part of the plate.
        { ...drum(30, -38, 8, 10), cls: 'fl-pivot' },
        arm('fl-catapult', 30, -38, 10, 22, 4.6, { knob: 3.8 }),
        { ...block(55, -32, 'hold', 6), cls: 'fl-blk is-hold fl-shot', depth: OVER + 4 },
      ]
    },
    // RESOLVE IS A HORIZONTAL RAM.
    //
    // The press used to come straight down onto an anvil, which is a stamp and
    // not a decision - and the anvil was a disc on a plate that nothing else in
    // the station referred to. A judgement is something coming OFF the line, so
    // the ram lies flat, crosses the lane, and pushes the block at the station
    // clean off the near edge, where it falls away.
    //
    // THE LINE THEN INDEXES, AND THAT IS WHY IT LOOPS WITHOUT A SEAM. Three
    // blocks each step forward exactly one PITCH while a fourth fades in at the
    // back, so the set of occupied slots at the end of a cycle is the set at the
    // start shifted by one. When the clock turns over, every block lands on the
    // slot its neighbour just left and the picture is identical. Nothing has to
    // travel backwards to close the loop.
    resolve: () => {
      const lane = 2
      const at = (i) => -44 + i * PITCH
      return [
        printed(-800, 'fl-print', [
          <line key="lane" x1="-60" y1={lane} x2="48" y2={lane} />,
          // The rail the ram runs on, and the edge the block goes over. A plate
          // has to say where something leaves it, or the block is just falling
          // off a drawing.
          <line className="fl-ruled" key="rail" x1="28" y1="-46" x2="28" y2="42" />,
          <path className="fl-ruled" key="edge" d="M 18 32 L 28 42 L 38 32" />,
          <rect key="gate" x="14" y="-18" width="28" height="40" rx="4" />,
        ]),
        ...[0, 1, 2].map((i) => ({ ...block(at(i), lane, 'hold'), cls: 'fl-blk is-hold fl-index' })),
        // The one at the station, which is the one that gets pushed off.
        { ...block(at(3), lane, 'hold'), cls: 'fl-blk is-hold fl-pushed', depth: OVER + 3 },
        // And the one that arrives to replace it, at the back of the lane.
        { ...block(at(0), lane, 'hold'), cls: 'fl-blk is-hold fl-feed' },
        // THE RAM, IN THREE STEPS. One slab crossing a lane is a slab. A body
        // at the back, a thin rod out of it, and a BLADE at the front that is
        // wider across the lane than the block and stands twice its height:
        // the stepping is the only thing that says which end does the work, and
        // the blade is the only part a reader has to read.
        //
        // AND IT IS SORTED ABOVE THE LANE RATHER THAN AT ITS OWN PLAN POINT.
        // Every other solid here is sorted by where it stands, which is right
        // for something that stays there; the ram crosses the lane, so its
        // depth relationship with the blocks on it genuinely REVERSES halfway
        // through the stroke. Sorted at rest it was drawn behind the block it
        // was pushing for the whole of the stroke.
        { ...stand(28, -38, 7, 9, 9, 3), cls: 'fl-ram is-body', depth: OVER - 3 },
        { ...stand(28, -22, 3, 9, 4, 1.5, 3), cls: 'fl-ram is-neck', depth: OVER - 2 },
        { ...stand(28, -8, 9, 2.5, 11, 1.5), cls: 'fl-ram is-face', depth: OVER - 1 },
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
      const at = [-36, -24, -12, 0, 12, 24, 36]
      const mark = ['pass', 'hold', 'fail', 'pass', 'pass', 'fail', 'hold']
      const spoke = (cx) =>
        [0, 45, 90, 135].map((deg) => {
          const a = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={Math.round((cx + Math.cos(a) * 11) * 10) / 10}
              y1={Math.round((2 + Math.sin(a) * 11) * 10) / 10}
              x2={Math.round((cx - Math.cos(a) * 11) * 10) / 10}
              y2={Math.round((2 - Math.sin(a) * 11) * 10) / 10}
            />
          )
        })
      return [
        printed(-800, 'fl-print', [
          ...at.map((px) => <line className="fl-ruled" key={px} x1={px - 6} y1="-12" x2={px - 6} y2="16" />),
        ]),
        // THE TAPE IS A SOLID, NOT TWO PRINTED LINES. Frames standing on a pair
        // of hairlines are seven coloured cubes in a row; frames standing on a
        // strip that runs onto both reels are a record on a tape.
        { ...stand(0, 2, 58, 8, 2, 2), cls: 'fl-tape', depth: -600 },
        { ...drum(-58, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(58, 2, 13, 7), cls: 'fl-reel' },
        { ...drum(-58, 2, 8, 3, 7), cls: 'fl-reel is-hub' },
        { ...drum(58, 2, 8, 3, 7), cls: 'fl-reel is-hub' },
        // The reels wind as the head runs and unwind as it goes back, which is
        // what makes two cylinders a transport rather than two cylinders.
        printed(760, 'fl-print', [
          <g className="fl-spin" key="l">{spoke(-58)}</g>,
          <g className="fl-spin" key="r">{spoke(58)}</g>,
        ], 7),
        // A frame is wider ACROSS the tape than along it, which is the whole
        // difference between a frame and a cube.
        ...at.map((px, i) => ({
          ...stand(px, 2, 4, 7, 5, 1.5, 2),
          cls: `fl-blk is-${mark[i]} fl-frame`,
          turn: i,
        })),
        // THE HEAD. Two legs either side of the tape and a bar over the top, so
        // the tape passes UNDER it - which is the whole difference between a
        // head reading a tape and a block sitting on one.
        { ...stand(-38, -9, 5, 5, 17, 1.5), cls: 'fl-head is-leg', depth: OVER },
        { ...stand(-38, 13, 5, 5, 17, 1.5), cls: 'fl-head is-leg', depth: OVER + 1 },
        { ...stand(-38, 2, 4, 15, 6, 2, 17), cls: 'fl-head is-bar', depth: OVER + 2 },
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
        shape: roundedSlab(sx, sy, TILE, TILE, SHEET, 7),
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
    emblem: mechanism(step.key, t),
    // The one surface the six tiles become, cut from the same geometry at the
    // same thickness. Its corner is the group's corner, so the handoff changes
    // what the object IS without changing where its edge falls.
    plate: roundedSlab(seat[0], seat[1], HALF_X, HALF_Y, SHEET, PLATE_R),
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
function Drum({ shape, className }) {
  return (
    <g className={className}>
      <path className="dgm-face-right" d={shape.wall} />
      <ellipse className="dgm-face-top" cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />
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
          aria-label="Thirty surfaces scattered in the air, seen in axonometric projection. As the reader reaches the figure they draw together and set down flush, six at a time, into five plates in a row, and stay there. A survey line rules under the row and letters the five stations beneath it: Protocol, Evidence, Screening, Resolve, Replay. One block runs the whole row. A grid of twelve switches on a breaker board is thrown one at a time, each settling green or red. A claw on a gantry lifts a block out of a heap and sets it into an ordered bed of slots. Three throats cut through the next plate along its front-right edge take blocks that arrive with no verdict - green, red, and an amber one for what the machine cannot settle, which is catapulted to the plate beyond. There a hand throws a lever, a horizontal ram crosses the lane and pushes one block clean off the edge, and the line indexes forward as another arrives. On the last plate the run lies on a tape between two reels, and a head reads its way along and then runs back. Pointing at a plate lifts it off the ground and darkens the ground beneath it."
        >
          <defs>
            <pattern id="fl-grain" width="13" height="13" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="0.9" />
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
                      const { cx, cy, rx, ry, deep, throat, wall } = part.hole
                      return (
                        <g className={part.cls} key={`${item.key}-e${n}`}>
                          <path className="fl-wall" d={wall} />
                          <ellipse className="fl-floor" cx={cx} cy={cy + deep} rx={rx} ry={ry} />
                          <ellipse className="fl-throat" cx={cx} cy={cy + deep} rx={throat.rx} ry={throat.ry} />
                          <ellipse className="fl-rim" cx={cx} cy={cy} rx={rx} ry={ry} />
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
                            doing, so a block can be riding a claw across the
                            plate and breathing at the same time. */}
                        <g className="fl-settle">
                          {part.round ? (
                            <Drum shape={part.shape} className="dgm-solid" />
                          ) : (
                            <Faces shape={part.shape} className="dgm-solid" />
                          )}
                        </g>
                      </g>
                    )
                  })}
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

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
 * The pass before this stood five machines on five blank sheets, and a solid
 * balanced on a blank sheet is a sticker: nothing about the surface says the
 * thing standing there belongs to it. Every plate now carries its own PLAN,
 * drawn in hairline on the plate's own face inside the projection - a document
 * margin and a walked track, a spine with the bindings that come off it, three
 * lanes out of a mouth, a target the seal lands in, a dial with nine stations.
 * The machine stands in its own drawing. That is the difference between a
 * figure and a thing set down on top of one.
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
   other one is read against it. It stops at twelve because the couplings sit in
   the two corners it rounds, and past that the corner eats them. */
const PLATE_R = 12

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

   FIVE INSTRUMENTS, NOT FIVE ARRANGEMENTS OF THE SAME KIT.

   Three passes have now built these plates out of one vocabulary - blocks,
   bars, cylinders, and something small sliding past them - and rearranging one
   kit five ways is one machine drawn five times however different the
   topologies are. The last one even came out looking like a clock, which is the
   single worst thing Replay could be mistaken for: a clock is a thing that goes
   round, and replay is a thing that goes BACK.

   Trident is the calibration, and what makes its four decks unmistakable is
   that each one is a different KIND of instrument with a different mechanical
   idea, not a different layout of the same parts. A throat cut through a deck
   that swallows a queue. Nineteen tiles that physically STAND UP off the
   surface as they bind. A barrel with two blades clipped to its bore, so all
   that is ever drawn of a shutter is the two leading edges. A stack of bars
   chained by travelling hashes. Cover the labels and you can still tell them
   apart, because a hole is not a relief and a relief is not a shutter.

   So: five verbs, and each plate does exactly one of them.

   PROTOCOL CUTS. A sheet of prose lies on the plate, ruled with the lines that
   make it prose. A die comes down on it, and it comes up with four bites
   punched clean through - and the four things that came out of those bites are
   standing beside it as separate solids at four heights. Continuous on one
   side of the press, discrete on the other. That is the whole step.

   EVIDENCE SINKS. The records are BELOW the surface, at the bottom of sockets
   drilled through the plate, and they never come up - because the claim of the
   step is that nothing is moved and nothing is copied. What Damaros holds is
   the plug seated in the socket above each one: a reference, not a record. One
   socket has no plug, because not everything is mapped when a snapshot closes.

   SCREENING DROPS. Three throats are cut through the plate, a rank of subjects
   waits at the back, and each one goes down whichever throat the protocol sends
   it. What is left standing beside each throat is the count that went through
   it: one, four and three. Many arrive, few come out anywhere.

   RESOLVE IS PULLED. Every other plate here runs itself; this one has a LEVER
   on it, because this is the only step where the actor is a person. Two
   readings stand at two heights and disagree, a hand throws the lever, and a
   die comes down and stamps the plate. Nothing about a lever is ambient.

   REPLAY LIFTS. A core comes up out of a borehole - nine bands, the whole run
   read as a section, with a depth scale printed down the plate beside it. A
   core is the one drawing that says a past state was recovered INTACT and can
   be counted band by band, and there is nothing rotating anywhere in it. */

function mechanism(key, t) {
  const [seatX, seatY] = PLAN(t, -t)
  // The plate's own face as a drawing surface. Anything inside this is in the
  // SAME plan coordinates the solids are placed with, so a printed depth scale
  // and the core it measures cannot drift apart.
  const FACE = planSpace(seatX, seatY)

  // `base` is what the part is standing ON. Without it everything has its feet
  // on the plate, so a die that comes down on a sheet has to be drawn beside it
  // rather than over it.
  const stand = (px, py, hx, hy, high, radius = 2, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - base - high, hx, hy, high, radius) }
  }
  const drum = (px, py, r, high, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, round: true, shape: roundedCylinder(sx, sy - base - high, r, high) }
  }

  /* A HOLE, WHICH IS THE THING THIS FIGURE HAD NO WAY OF DRAWING.
     Everything on these plates stood ON the surface, so the only sentence any
     of them could form was "an object is here" - and half of what the five
     steps do is take something OUT of the surface or put something INTO it.
     Looking into a bore from above and to the side you see the FAR inner wall
     and the floor, so that is what is drawn: the band between the two rims on
     the far side, the floor under it, and the rim itself as the one hard edge.
     Three shapes, no filter, and it reads as depth at any size. */
  const well = (px, py, r, deep, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    const { rx, ry } = planCircle(r)
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
        // Over the far rim, down the bore, and back along the near edge of the
        // floor: the wall a reader can actually see into.
        wall: `M ${left} ${cy} A ${rx} ${ry} 0 0 1 ${right} ${cy} L ${right} ${cy + deep} A ${rx} ${ry} 0 0 0 ${left} ${cy + deep} Z`,
      },
    }
  }

  /* NOTHING TRAVELS ALONG A PLAN AXIS ANY MORE, AND THAT IS THE FIX.

     A `glide` helper stood here, turning a plan displacement into the screen
     move it makes, and three solids rode it: a head along a rail, a binder
     along a spine, a subject across to a throat. Every one was a solid
     TRANSLATING through a depth-sorted scene while keeping the draw order it
     was sorted into - so a traveller passed in front of things it was behind
     and behind things it was in front of, and the projection came apart for as
     long as it moved. That is what was breaking the perspective, and the helper
     going unused is the proof it is gone.

     Height is the one axis in an axonometric that cannot lie: it is screen y
     and nothing else is. So everything that moves here now moves straight up or
     straight down, or turns in place. A die falls, a subject drops down a
     throat, a core rises out of a borehole, a lever swings in its own vertical
     plane. None of it needs a resort and all of it occludes what it should. */
  const OVER = 999
  const printed = (depth, cls, mark) => ({ depth, plan: FACE, cls: `fl-plan ${cls}`, mark })
  /* An instrument with a handle, hinged at a plan point and swinging in the
     vertical plane. `reach` is signed, so an arm can open to the left or the
     right of its own hinge without the caller doing the arithmetic. */
  const arm = (cls, px, py, base, reach, thick, extra = {}) => ({
    arm: PLAN(t + px, -t + py),
    base,
    reach,
    thick,
    cls,
    depth: OVER + 2,
    ...extra,
  })

  /* THE LAMP IDIOM IS GONE, AND THE BLOCK IS WHY.

     State used to be a small lit cap sitting on top of a solid, because a
     half-opaque solid in an axonometric reads as a hole and something had to
     carry it. That was the right answer to the wrong question. The thing whose
     state matters here is not a fixture on a plate - it is the SUBJECT moving
     through the row, and a subject can simply be the colour it is. Green,
     amber, red, on the block itself, all the way from the heap to the shelf.

     One fewer object per state, and the state is now attached to the thing it
     is actually about. */

  /* A BLOCK. THE MATERIAL THE WHOLE ROW IS MADE OF.

     Every pass before this built five machines and gave them nothing to work
     on, so the figure was five instruments demonstrating themselves. What ties
     a run together is not the machines, it is the THING PASSING THROUGH THEM -
     and here that is a block: it arrives in a heap, gets ordered into rows,
     falls into one of three holes, and ends up shelved where it can be pulled
     back out.

     It carries its verdict as it goes. Green for eligible, red for not, and
     amber for the ones a machine cannot settle - which is the only reason
     Resolve exists, and the reason a person is standing at it. The station's
     own ink still dresses the plate and the instrument; the block's colour is
     the state of one subject, and it is the same green on Screening as it is on
     Replay because it is the same block. */
  const block = (px, py, verdict, high = 6, extra = {}) => ({
    ...stand(px, py, 5, 5, high, 1.5),
    cls: `fl-blk${verdict ? ` is-${verdict}` : ''}`,
    ...extra,
  })

  const build = {
    // PROTOCOL IS A BREAKER BOARD. Five criteria, five switches, thrown one at
    // a time, and each one settles green or red - which is what a protocol IS
    // once it stops being prose: a bank of conditions that are either met or
    // not. Nothing here is a metaphor for the step; it is the step.
    protocol: () => {
      const at = [-22, -11, 0, 11, 22]
      const verdict = ['pass', 'pass', 'fail', 'pass', 'fail']
      return [
        printed(-800, 'fl-print', [
          <rect key="board" x="-26" y="-22" width="64" height="56" rx="4" />,
          ...at.map((s) => (
            <line key={s} x1={s + 6 - 7} y1={-s + 6 + 7} x2={s + 6 + 7} y2={-s + 6 - 7} />
          )),
        ]),
        { ...stand(6, 6, 30, 26, 3, 3), cls: 'fl-board' },
        ...at.flatMap((s, i) => [
          { ...stand(s + 6, -s + 6, 5, 5, 5, 1.5, 3), cls: 'fl-seat' },
          arm(`fl-toggle is-${verdict[i]}`, s + 6, -s + 6, 11, 13, 4.6, { knob: 3.8, turn: i }),
        ]),
      ]
    },
    // EVIDENCE IS A SHAPER. A heap of records on one side, ordered rows on the
    // other, and something overhead working its way across turning one into the
    // other. That is the whole step: nothing is created and nothing is taken
    // away, it is the same blocks in a different order.
    evidence: () => {
      const heap = [[-63, -11, 13], [-49, 8, 5], [-66, 26, 8], [-44, -25, 17], [-57, -34, 6], [-41, 6, 11], [-54, -4, 21]]
      const rows = [0, 1].flatMap((r) => [0, 1, 2].map((c) => [12 + c * 24, -18 + r * 24]))
      return [
        printed(-800, 'fl-print', [
          <rect key="bed" x="-70" y="-40" width="42" height="76" rx="4" />,
          ...rows.map(([px, py]) => (
            <rect key={`${px}:${py}`} x={px - 8} y={py - 8} width="16" height="16" rx="2" />
          )),
        ]),
        ...heap.map(([px, py, high], i) => block(px, py, null, high, { turn: i })),
        ...rows.map(([px, py], i) => block(px, py, null, 6, { cls: 'fl-blk is-set', turn: i % 3 })),
        // THE SHAPER. It hovers, and it works its way along the rows rather
        // than sitting over the middle of them looking decorative.
        { ...drum(-6, -6, 15, 4, 34), cls: 'fl-shaper', sweep: true },
        { ...drum(-6, -6, 7, 5, 38), cls: 'fl-shaper is-dome', sweep: true },
      ]
    },
    // SCREENING IS THREE HOLES. The ordered rows arrive, and each block goes
    // down the one its verdict sends it to - green through, red out, and amber
    // for the ones the machine cannot settle. Those do not stop here: they are
    // thrown to the next plate, which is where a person is standing.
    screening: () => {
      const hole = [[-30, 22, 'pass'], [12, 14, 'hold'], [54, 6, 'fail']]
      const feed = [0, 1].flatMap((r) => [0, 1].map((c) => [-58 + c * 22, -34 + r * 20]))
      return [
        printed(-800, 'fl-print', [
          ...hole.map(([px, py]) => <line key={px} x1="-48" y1="-24" x2={px} y2={py} />),
          ...hole.map(([px, py]) => <circle key={`r${px}`} cx={px} cy={py} r="19" />),
        ]),
        ...feed.map(([px, py], i) => block(px, py, null, 6, { turn: i })),
        ...hole.map(([px, py, v]) => ({ ...well(px, py, 13, 4), cls: `fl-hole is-${v}` })),
        ...hole.map(([px, py, v], i) => block(px, py, v, 6, { cls: `fl-blk is-${v} fl-faller`, turn: i })),
        // THE CATAPULT. The amber block is the only one that leaves this plate,
        // and it leaves it thrown - which is the one moment in the figure where
        // a machine hands a decision to a person because it cannot make it.
        arm('fl-catapult', 12, 14, 10, 26, 5, { knob: 4.4 }),
        { ...block(12, 14, 'hold', 6), cls: 'fl-blk is-hold fl-shot', depth: OVER + 4 },
      ]
    },
    // RESOLVE IS A PRESS ON A LINE. The amber blocks land here and run down a
    // line, and a hand throws the lever that drops the press - which pushes one
    // of them off. That is the honest picture of a judgement call: the machine
    // has run out of rules and somebody decides.
    resolve: () => {
      const line = [-40, -18, 4, 26].map((px) => [px, px * 0.2 - 4])
      return [
        printed(-800, 'fl-print', [
          <line key="rail" x1="-52" y1="-14" x2="38" y2="4" />,
          <rect key="bed" x="4" y="6" width="44" height="44" rx="4" />,
          ...Array.from({ length: 8 }, (_, k) => {
            const a = (k * 45 * Math.PI) / 180
            return (
              <line
                className="fl-stamp"
                key={k}
                x1={Math.round((26 + Math.cos(a) * 10) * 10) / 10}
                y1={Math.round((28 + Math.sin(a) * 10) * 10) / 10}
                x2={Math.round((26 + Math.cos(a) * 17) * 10) / 10}
                y2={Math.round((28 + Math.sin(a) * 17) * 10) / 10}
              />
            )
          }),
        ]),
        ...line.map(([px, py], i) => block(px, py, 'hold', 6, { turn: i })),
        // The one that gets pushed off the line, which is the decision.
        { ...block(26, 1.2, 'pass', 6), cls: 'fl-blk is-pass fl-pushed', depth: OVER + 3 },
        { ...drum(26, 28, 15, 3), cls: 'fl-anvil' },
        { ...stand(26, 28, 9, 9, 13, 2.5, 24), cls: 'fl-plunge is-head', depth: OVER },
        { ...stand(26, 28, 5, 5, 12, 2, 37), cls: 'fl-plunge is-shaft', depth: OVER + 1 },
        { ...drum(26, 28, 7.5, 4, 49), cls: 'fl-plunge is-knob', depth: OVER + 2 },
        { ...stand(-40, 26, 5, 5, 28, 1.5), cls: 'fl-post' },
        arm('fl-lever', -40, 26, 28, 28, 5.4, { knob: 5.4 }),
      ]
    },
    // REPLAY IS A SHELF. Everything the row decided is shelved here in the
    // order it happened, and any one of it can be taken down and read - which
    // is the only claim this step makes and the only thing a shelf is for. The
    // block that comes out is the same block, with the same verdict on it.
    replay: () => {
      const shelf = [0, 1, 2].flatMap((r) => [0, 1, 2, 3].map((c) => [-42 + c * 24, -30 + r * 22 + c * 2]))
      const mark = ['pass', 'hold', 'fail', 'pass', 'pass', 'fail', 'hold', 'pass', 'fail', 'pass', 'pass', 'hold']
      return [
        printed(-800, 'fl-print', [
          ...[0, 1, 2].map((r) => (
            <line key={r} x1="-54" y1={-30 + r * 22} x2="42" y2={-30 + r * 22 + 8} />
          )),
        ]),
        ...shelf.map(([px, py], i) => block(px, py, mark[i], 7, { cls: `fl-blk is-${mark[i]} is-shelved`, turn: i })),
        // The one taken down. It rises clear of the shelf, holds where a reader
        // can see which of the three it is, and goes back.
        { ...block(-18, -8, 'hold', 7), cls: 'fl-blk is-hold fl-pull', depth: OVER },
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

/* THE PLATES ARE NOT WIRED TOGETHER ANY MORE.

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
 * criterion post and a record pad alike, and a machine built out of both is one
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
          aria-label="Thirty surfaces scattered in the air, seen in axonometric projection. As the reader reaches the figure they draw together and set down flush, six at a time, into five plates in a row, and stay there. A survey line rules under the row and letters the five stations beneath it: Protocol, Evidence, Screening, Resolve, Replay. Each plate is printed with the plan of its own work and runs the machine that plan describes - a document walked by a gantry head into four criteria under one version, a patch bay whose crossed routes bind four site records without moving them, a mouth feeding three bays that hold one, four and three counted units, two disagreeing readings settled by a seal pressed into a target, and a nine-station dial swept by an arm. Pointing at a plate lifts it off the ground and darkens the ground beneath it."
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
                  contact with the ground moving DOWN and AWAY from it: three
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
                    dial has to be laid on the disc and the lanes have to go
                    down before the bays stand on them. */}
                <g className="fl-emblem">
                  {item.emblem.map((part, n) => {
                    if (part.plan) {
                      return (
                        <g className={part.cls} key={`${item.key}-e${n}`} transform={part.plan}>
                          {part.mark}
                        </g>
                      )
                    }
                    {/* A HOLE. Three shapes and no filter: the far inner wall,
                        the floor under it, and the rim as the one hard edge.
                        Everything on these plates used to stand ON the surface,
                        so the only sentence any of them could form was that an
                        object was there - and half of what these five steps do
                        is take something out of the surface or put something
                        into it. */}
                    if (part.hole) {
                      const { cx, cy, rx, ry, deep, wall } = part.hole
                      return (
                        <g className={part.cls} key={`${item.key}-e${n}`}>
                          <path className="fl-wall" d={wall} />
                          <ellipse className="fl-floor" cx={cx} cy={cy + deep} rx={rx} ry={ry} />
                          <ellipse className="fl-rim" cx={cx} cy={cy} rx={rx} ry={ry} />
                        </g>
                      )
                    }
                    {/* A HINGED AGENT, AND EVERY PLATE NOW HAS ONE.
                        Resolve was the only station a reader liked and the
                        reason was not its geometry - it was that a LEVER is a
                        thing a person can picture their hand on. The other four
                        had no agent at all: a hole scaling, a dash creeping, a
                        stack breathing three pixels. Those are properties
                        changing, not a machine being worked. Each plate has an
                        instrument with a handle now, hinged and swinging in the
                        vertical plane, which is the one motion in an
                        axonometric that needs no depth sort and the one a hand
                        already knows how to make. */}
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
                        {/* The core lifts inside its own group, because the
                            band is placed at its depth in the section and the
                            whole column comes up as one thing - and the settle
                            sits inside THAT, so a band can be rising out of a
                            borehole and breathing at the same time. */}
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
                  the drawing above is those exact three numbers, stacked and
                  countable. */}
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

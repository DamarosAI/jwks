import { useEffect, useRef, useState } from 'react'

import { ISO_Y, jitter, planSpace, project, roundedCylinder, roundedSlab } from './iso'
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
const H = 318
const CX = 600
// The row sits low, because everything above it belongs to two other things:
// the sentence, which is set into the top of this same cell, and the scatter,
// which needs somewhere to be that is not on top of the sentence.
const CY = 204

/* WHERE THE MESS IS ALLOWED TO BE.
 *
 * The scatter used to be a reach and an angle with nothing bounding it, so
 * tiles ran two hundred and seventy units above their seat - off the top of the
 * viewBox entirely, and straight through the headline that is set into the top
 * of this cell. A drawing that collides with its own sentence is a drawing
 * that has stopped being read. The floor of the box is the plate row's own
 * foot, because the band under that belongs to the lettering now. */
const KEEP = { top: 74, bottom: 250, left: 62, right: 1138 }

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
const DATUM = 276
const NAME_Y = DATUM + 16
const FACT_Y = DATUM + 29

/* -- WHAT RUNS ON EACH PLATE --------------------------------------------

   FIVE MACHINES, AND FIVE DIFFERENT KINDS OF MACHINE.

   An earlier pass gave every plate the same vocabulary - a population of
   rounded boxes with a rounded box travelling past them - and five
   arrangements of one object is one machine drawn five ways. The pass after it
   gave them five topologies but built all five out of the same two solids, on
   five blank sheets, and it was still one hand writing five words.

   THE PLATE'S OWN PLAN IS THE DIFFERENCE. Each surface is printed with the
   drawing of the work that happens on it, in hairline, inside the projection -
   and the solids are then stood in that drawing. A machine bedded in its own
   plan cannot read as a machine set down on a plate, because the plate is part
   of the machine.

   PROTOCOL is a GANTRY. A ruled document at one end, four criteria stood in a
   row at the other, a rail overhead and a head hanging off it that walks from
   the paper to the logic - lighting each criterion as it reaches it, and
   leaving a version bar clamped across all four. Printed: the document's
   margin, and the track with a stop under each criterion.

   EVIDENCE is a PATCH BAY. The records are round pads standing where they
   already stand, and they never move, because the whole claim of the step is
   that nothing is copied anywhere. What is made is the ROUTE: an elbowed
   hairline from the spine to a pad, drawn on the plate rather than built on it,
   and the routes CROSS - which criterion needs which record is not in order.
   One route is printed open and never made.

   SCREENING is a TALLY. One mouth takes the cohort in, three lanes run out of
   it, and what stands in the bays is the count itself: one unit, four, three,
   stacked and stepped so a reader can count them. The value line under the
   plate and the solids on it are the same number.

   RESOLVE is a PRESS. Two readings at two heights, out at the corners; a call
   that travels straight down the middle of the plate; a seal onto an anvil
   inside a printed target. It leaves a mark in the plate that stays.

   REPLAY is a DIAL. A disc printed with a nine-station track and an arm
   sweeping it, drawn inside the plan matrix so the sweep is a true plan circle
   rather than a screen one - which is the difference between a record being
   read and a line spinning on top of a picture.

   A PLAN RECTANGLE IS AS WIDE AS ITS PERIMETER, WHICHEVER WAY IT FACES.
   2(hx + hy) * ISO_X, always - so a thin blade is exactly as wide on screen as
   the fat block with the same half-sum, and the four criteria that used to be
   half (4, 24) stepped 17 apart were 48 pixels wide sitting 15 apart. They were
   not a comb; they were a smear. Everything standing on these plates is
   compact in plan and tall in HEIGHT, which is the one axis in an axonometric
   that costs nothing on the ground. */

function mechanism(key, t) {
  const [seatX, seatY] = PLAN(t, -t)
  // The plate's own face as a drawing surface. Anything inside this is in the
  // SAME plan coordinates the solids are placed with, so a printed lane and the
  // puck that runs down it cannot drift apart.
  const FACE = planSpace(seatX, seatY)

  // `base` is what the part is standing ON. Without it everything in a
  // mechanism has its feet on the plate, so a bar that clamps a row of posts
  // has to be drawn beside them instead of across their tops - which is a
  // drawing of two unrelated objects rather than of one holding the other.
  const stand = (px, py, hx, hy, high, radius = 2, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - base - high, hx, hy, high, radius) }
  }
  // The same thing with a round plan. A source, a mouth, a pan and a seal are
  // not milled parts and should not be drawn as though they were.
  const drum = (px, py, r, high, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, round: true, shape: roundedCylinder(sx, sy - base - high, r, high) }
  }
  // A plan displacement, expressed as the screen move it actually is. Anything
  // that travels across a plate has to travel along the plate's own axes or it
  // is sliding over the top of the projection rather than moving inside it.
  const glide = (dx, dy) => `${Math.round((dx - dy) * 0.866)}px, ${Math.round((dx + dy) * 0.34)}px`
  // A traveller is drawn last whatever its plan position, because it crosses
  // the population it is working on. Sorted by where it starts, the head would
  // spend the first half of its walk behind the criteria it is reading.
  const OVER = 999
  // The printed plan. Negative depths, so the ink goes down before anything
  // stands on it - except the dial, which is printed on a disc and has to be
  // laid after it.
  const printed = (depth, cls, mark) => ({ depth, plan: FACE, cls: `fl-plan ${cls}`, mark })

  /* A SOLID AND THE LAMP THAT REPORTS ITS STATE.
     State used to be the solid's own opacity, and in an axonometric a
     half-opaque solid is not a dim solid - it is a hole. You saw the plate's
     plan and whatever stood behind it straight through a record that had
     simply not been reached yet, and five mechanisms came out as five sets of
     ghosts. So the population is always solid, and what moves is the light. */
  const lit = (kind, px, py, hx, hy, high, radius, turn, base = 0, extra = {}) => [
    { ...stand(px, py, hx, hy, high, radius, base), cls: `fl-${kind}`, turn, ...extra },
    {
      ...stand(px, py, Math.max(1.4, hx - 1.7), Math.max(1.4, hy - 1.7), 2.3, Math.max(0.7, radius - 0.7), base + high),
      cls: `fl-lamp is-${kind}`,
      turn,
      ...extra,
    },
  ]

  // The round one wears a round lamp, or a disc comes back with a square cap on
  // it and stops being a disc.
  const litDrum = (kind, px, py, r, high, turn, extra = {}) => [
    { ...drum(px, py, r, high), cls: `fl-${kind}`, turn, ...extra },
    { ...drum(px, py, Math.max(1.6, r - 2.4), 2.3, high), cls: `fl-lamp is-${kind}`, turn, ...extra },
  ]

  const build = {
    // A GANTRY. Paper at one end, logic at the other, a head riding between.
    protocol: () => {
      const at = [-6, 16, 38, 60]
      const rise = [13, 19, 10, 16]
      return [
        printed(-800, 'fl-print', [
          // The document's margin. The sheets sit inside it, so the paper has a
          // registered place on the plate rather than lying where it fell - and
          // the margin itself clears the plate's ROUNDED corner, which the last
          // pass did not and which left the whole document hanging off the
          // back-left edge in mid-air.
          <rect key="doc" x="-62" y="-27" width="32" height="38" rx="3" />,
          // Out of the document, and along the track the head walks. The track
          // is the whole route from paper to logic; the rail above only spans
          // the working zone, which is why they are not the same length.
          <line key="out" x1="-46" y1="11" x2="-46" y2="30" />,
          <line key="run" x1="-46" y1="30" x2="68" y2="30" />,
          // A stop under each criterion, so the walk has somewhere to arrive.
          ...at.map((px) => <line key={px} x1={px} y1="30" x2={px} y2="22" />),
        ]),
        // The document, as it arrives: three loose sheets, stacked and offset.
        ...[0, 1, 2].map((i) => ({
          ...stand(-46 + i * 3, -8 - i * 3, 12, 13, 3, 2, i * 3),
          cls: 'fl-sheet',
        })),
        // Four criteria at four heights, lit in the order they compile. Compact
        // in plan and tall in height, which is the only way four things stand
        // apart on a surface this shallow - and run down the plate's long plan
        // axis, so the comb fills the front-right rather than crowding the
        // paper it came out of.
        ...at.flatMap((px, i) => lit('crit', px, 14, 5, 5, rise[i], 1.5, i)),
        // The rail the head hangs from. A head on nothing is a cursor - and the
        // rail is drawn after the posts it passes over, or half the criteria
        // stand in front of the thing that is supposed to be above them.
        // HEIGHT IS WHAT OVERHANGS. The plate's back-left edge slopes UP as it
        // goes left, so anything standing near it and raised far enough leaves
        // the plate - the rail at a base of thirty-six had its far end four
        // pixels out in the air beside the figure. The criteria came down to
        // nineteen and the rail to twenty-eight, which puts the whole assembly
        // inside its own surface with three pixels to spare.
        { ...stand(23, 14, 49, 2, 2, 1, 28), cls: 'fl-gantry', depth: 900 },
        { ...stand(-26, 14, 5, 5, 7, 1.5, 21), cls: 'fl-head', span: glide(92, 0), depth: OVER },
        // And the version closes over all four at once.
        { ...stand(27, 14, 40, 3.5, 3, 1.2, 20), cls: 'fl-lock', depth: OVER + 1 },
      ]
    },
    // A PATCH BAY. The pads never move; the routes reach them, and they cross.
    evidence: () => {
      const pads = [[-50, 8, 9], [-12, 32, 15], [22, 0, 8], [58, 20, 13]]
      const from = [-45, -15, 15, 45]
      // Which criterion needs which record is not in the order either of them
      // happens to be in. Crossed routes are what makes this a patch bay
      // instead of a rake.
      const wire = [0, 2, 1, 3]
      const bend = [-20, -14, -8, -2]
      return [
        printed(-800, 'fl-print', [
          ...from.map((x, i) => {
            const [px, py] = pads[wire[i]]
            return (
              <polyline
                className={`fl-route${i === 3 ? ' is-open' : ''}`}
                key={x}
                points={`${x},-30 ${x},${bend[i]} ${px},${bend[i]} ${px},${py}`}
                style={{ '--turn': i }}
              />
            )
          }),
          // Where a record stands, printed whether or not anything has bound to
          // it yet. The bay is wired before the snapshot is taken.
          ...pads.map(([px, py]) => <circle key={px} cx={px} cy={py} r="15" />),
        ]),
        // The spine: the criteria asking for evidence, along the back edge.
        { ...stand(0, -34, 54, 2.5, 5, 1.2), cls: 'fl-spine' },
        // The records themselves, round because they are sources rather than
        // parts, standing at the depths they happen to stand at.
        ...pads.flatMap(([px, py, high], i) => litDrum('res', px, py, 11, high, i, { idle: i === 3 })),
        { ...stand(-54, -34, 5, 5, 7, 1.5, 5), cls: 'fl-binder', span: glide(108, 0), depth: OVER },
      ]
    },
    // A TALLY. One mouth in, three lanes out, and the count is the drawing.
    screening: () => {
      // STEPPED ON BOTH PLAN AXES, because one is not enough. Three bays walked
      // along plan x alone sit 27 screen pixels apart carrying 38-pixel
      // footprints, so the bays overlapped and the counts ran into each other.
      // Walking x forward and y back at the same time spreads them 40 apart and
      // stairs them down the plate.
      const bays = [[-16, 20, 1], [22, 12, 4], [60, 4, 3]]
      return [
        printed(-800, 'fl-print', [
          ...bays.map(([px, py]) => <line key={px} x1="-42" y1="-22" x2={px} y2={py} />),
          ...bays.map(([px, py]) => <rect key={`b${px}`} x={px - 11} y={py - 11} width="22" height="22" rx="3" />),
        ]),
        { ...drum(-42, -22, 16, 10), cls: 'fl-hopper' },
        // ONE, FOUR AND THREE, STACKED SO THEY CAN BE COUNTED. The value line
        // under this plate says 1 PASS - 4 REVIEW - 3 FAIL, and until now the
        // drawing above it said nothing of the kind: three blocks at three
        // arbitrary heights are a bar chart of numbers nobody can read off.
        // Each unit steps in half a plan unit as it goes up, so every one of
        // them keeps a visible rim and the pile is countable.
        ...bays.flatMap(([px, py, count], i) => {
          const half = (j) => 7 - j * 0.5
          const cap = half(count - 1) - 1.6
          return [
            ...Array.from({ length: count }, (_, j) => ({
              ...stand(px, py, half(j), half(j), 6, 1.5, j * 6),
              cls: `fl-unit${j % 2 ? ' is-alt' : ''}`,
              turn: i,
            })),
            { ...stand(px, py, cap, cap, 2.3, 1, count * 6), cls: 'fl-lamp is-bin', turn: i },
          ]
        }),
        // Down its own lane, then into the bay. Two moves, because a sort is a
        // thing that happens on a path and not a thing that flies.
        // Out of the mouth rather than off the lid: at a base above the mouth's
        // own height a waiting subject reads as a cap sitting on the hopper.
        ...bays.map(([px, py], i) => ({
          ...stand(-42, -22, 5, 5, 7, 1.5, 10),
          cls: 'fl-puck',
          turn: i,
          span: glide(px + 42, py + 22),
          drop: '0px, 13px',
          depth: OVER,
        })),
      ]
    },
    // A PRESS. Two readings out at the corners, a call down the middle, a seal.
    resolve: () => [
      printed(-800, 'fl-print', [
        <polyline key="v" points="-32,4 28,26 4,-32" />,
        <circle key="ring" cx="28" cy="26" r="23" />,
        // The impression the seal leaves, and it does not lift with it. A
        // signature that vanishes when the press goes back up is not a
        // signature, it is an animation of one.
        ...Array.from({ length: 10 }, (_, k) => {
          const a = (k * 36 * Math.PI) / 180
          const [c, s] = [Math.cos(a), Math.sin(a)]
          return (
            <line
              className="fl-stamp"
              key={k}
              x1={Math.round((28 + c * 18) * 10) / 10}
              y1={Math.round((26 + s * 18) * 10) / 10}
              x2={Math.round((28 + c * 23) * 10) / 10}
              y2={Math.round((26 + s * 23) * 10) / 10}
            />
          )
        }),
      ]),
      // Inboard of the back edge. A round solid two dozen pixels tall standing
      // where its plan circle only just fits hangs its whole top face out over
      // the plate's edge, because height goes straight up the screen and the
      // edge it is standing near slopes away.
      ...litDrum('read', -32, 4, 12, 24, 0),
      ...litDrum('read', 4, -32, 12, 14, 1),
      { ...drum(28, 26, 18, 5), cls: 'fl-anvil' },
      // Straight down the screen: the two readings sit either side of the plate
      // and the call they resolve to travels the bisector between them.
      { ...stand(-14, -14, 5, 5, 8, 1.5, 18), cls: 'fl-call', span: glide(42, 40), depth: OVER },
      { ...drum(28, 26, 10, 24), cls: 'fl-seal', depth: OVER + 1 },
    ],
    // A DIAL. Nine stations round a disc, and an arm across the whole face.
    replay: () => {
      const ring = Array.from({ length: 9 }, (_, k) => {
        const a = ((k * 40 - 90) * Math.PI) / 180
        return [Math.round(Math.cos(a) * 42), Math.round(Math.sin(a) * 42)]
      })
      return [
        { ...drum(0, 0, 45, 3), cls: 'fl-disc', depth: -999 },
        // Printed ON the disc, so it is laid after it rather than under it.
        printed(-990, 'fl-print fl-dial', [
          <circle key="track" cx="0" cy="0" r="42" />,
          <circle key="inner" cx="0" cy="0" r="24" />,
          ...ring.map(([px, py], k) => (
            <line key={k} x1={Math.round(px * 0.6)} y1={Math.round(py * 0.6)} x2={Math.round(px * 0.78)} y2={Math.round(py * 0.78)} />
          )),
        ]),
        // The sweep is drawn INSIDE the plan matrix, so a rotation of it is a
        // true plan circle that the projection turns into the right ellipse. A
        // bar rotated in screen space sweeps a circle over an axonometric and
        // reads as a line spinning on top of the picture rather than as an arm
        // running across a face. It is a full diameter so its own centre is the
        // plan origin, which is what it has to turn about.
        { sweep: planSpace(seatX, seatY - 4), depth: -980 },
        // FLAT, AND THAT IS THE WHOLE FIX. Nine posts eleven pixels tall on a
        // ring bunch into each other at the two places the projected ellipse
        // flattens, because height runs straight up the screen while the ring
        // there does not - two of the nine came out fused. Nine low markers
        // clear each other completely, and a dial is what a record disc has
        // anyway. The event the chain closes on keeps its height, because one
        // of the nine is allowed to be the one you look at.
        ...ring.flatMap(([px, py], k) => {
          const pair = lit('event', px, py, 5, 5, k === 0 ? 13 : 5, 1.5, k)
          if (k === 0) pair[0].cls = 'fl-event is-origin'
          return pair
        }),
        { ...drum(0, 0, 9, 8), cls: 'fl-hub', depth: OVER },
      ]
    },
  }

  // Back to front, or a mechanism is a pile rather than an object.
  return build[key]().sort((a, b) => a.depth - b.depth)
}

/* -- THE SKY ------------------------------------------------------------

   The figure had one plane in it and the whole drawing sat on that plane, so
   everything a reader's eye could do was run left to right along a row. There
   was no height in it anywhere - which in an axonometric is the one thing the
   projection is for.

   So work moves overhead. Each carrier ferries exactly ONE plate-pitch, from
   the airspace of one step to the airspace of the next, which is the run
   itself seen from above: nothing here is decoration flying about. They are
   small, pale, and on five long clocks that share no factor, so the sky is
   never still and never busy.

   THE SKY IS TWO-TIER, AND THE SENTENCE IS WHY. Measured, the headline runs to
   78 at a wide desktop and 86 at 1180 - it grows a line as the column narrows.
   Under the sentence's own column that leaves about thirty units of air, which
   is not enough altitude to be worth drawing: five carriers at one height is a
   row, and a row is the one thing this figure already had too many of. But the
   sentence is a left-hand column and it ends around 850. To the RIGHT of it the
   air runs all the way to the top of the cell, so the carriers over the last
   two steps fly high and the three over the sentence fly low. Below 1180 the
   sentence takes the whole band and the sky is turned off in the sheet: a
   carrier crossing a word is worse than no carrier. */
const SKY = [[250, 110], [450, 106], [660, 112], [900, 70], [1050, 86]].map(([x, y], i) => ({
  key: `sky-${i}`,
  // A hull, a mast and a rotor. A disc with a block on it came out as a
  // thumbtack; what makes a small thing read as a craft at twenty pixels is
  // the GAP - a plate held above a body on a post, which nothing standing on
  // the ground in this figure has.
  hull: roundedCylinder(x, y, 6, 3),
  mast: roundedSlab(x, y - 4, 1.3, 1.3, 3.5, 0.6),
  rotor: roundedCylinder(x, y - 7.8, 8, 1.1),
  beat: [17, 21, 26, 19, 23][i],
  lag: jitter(i, 41),
}))

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
    plate: roundedSlab(seat[0], seat[1], HALF_X, HALF_Y, SHEET, 10),
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

          {/* WORK MOVING OVERHEAD. Behind the row, because it is above the
              plates in the world and further from the reader on the page. */}
          <g className="fl-sky" aria-hidden="true">
            {SKY.map((bot) => (
              <g className="fl-bot" key={bot.key} style={{ '--beat': `${bot.beat}s`, '--lag': bot.lag }}>
                <g className="fl-hover">
                  <Drum shape={bot.hull} className="dgm-solid" />
                  <Faces shape={bot.mast} className="dgm-solid" />
                  <Drum shape={bot.rotor} className="dgm-rotor" />
                </g>
              </g>
            ))}
          </g>

          {/* THE DATUM. One rule the whole run is registered to, drawn on the
              same timeline as everything else - it draws itself left to right
              as the plates land, so the line arrives WITH the row rather than
              waiting under an empty stage. */}
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
              {/* THE GROUND UNDER THE PLATE. Not a cast shadow - there is no
                  light source in an axonometric - but a slab held above a plane
                  still darkens it, and that is the only cue this projection has
                  for height. It stays on the ground while the plate goes up. */}
              <polygon className="fl-shade" points={item.plate.top} />

              <g className="fl-body">
                {/* THE HALO, AND WHY IT IS NOT A BLUR.
                    A Gaussian on five polygons is five full-frame filter passes
                    every frame, for a thing that is invisible on four of them -
                    it ground a headless render to a stop, and it would cost a
                    real reader the same on every scroll. Four steps at a low
                    alpha each ramp from the rim inward and leave no single edge
                    strong enough to read as a drawn line. */}
                <g className="fl-aura">
                  {[1.2, 1.14, 1.09, 1.045].map((ring) => (
                    <polygon key={ring} className="fl-aurastep" points={item.plate.top} style={{ '--step': ring }} />
                  ))}
                </g>

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
                    if (part.sweep) {
                      return (
                        <g className="fl-face" key={`${item.key}-e${n}`} transform={part.sweep}>
                          {/* Turned inside the projection, so the arm sweeps a
                              true plan circle. A full diameter, so its own
                              bounding box is centred on the plan origin it has
                              to turn about. */}
                          <g className="fl-arm">
                            <rect x="-45" y="-2.4" width="90" height="4.8" rx="2.4" />
                          </g>
                        </g>
                      )
                    }
                    return (
                      <g
                        className={part.cls}
                        key={`${item.key}-e${n}`}
                        style={{ '--turn': part.turn ?? 0, '--span': part.span, '--drop': part.drop, '--idle': part.idle ? 1 : 0 }}
                      >
                        {/* Two moves need two groups: one transform cannot both
                            ride a lane and come off it. */}
                        {part.drop ? (
                          <g className="fl-hop"><Faces shape={part.shape} className="dgm-solid" /></g>
                        ) : part.round ? (
                          <Drum shape={part.shape} className="dgm-solid" />
                        ) : (
                          <Faces shape={part.shape} className="dgm-solid" />
                        )}
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

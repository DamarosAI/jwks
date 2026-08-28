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

  const glide = (dx, dy) => `${Math.round((dx - dy) * 0.866)}px, ${Math.round((dx + dy) * 0.34)}px`
  const OVER = 999
  const printed = (depth, cls, mark) => ({ depth, plan: FACE, cls: `fl-plan ${cls}`, mark })

  /* A SOLID AND THE LAMP THAT REPORTS ITS STATE. State used to be the solid's
     own opacity, and in an axonometric a half-opaque solid is not a dim solid -
     it is a hole. Now that this figure draws real holes that would be worse
     than it was. So the population is always solid and the light moves. */
  const lit = (kind, px, py, hx, hy, high, radius, turn, base = 0, extra = {}) => [
    { ...stand(px, py, hx, hy, high, radius, base), cls: `fl-${kind}`, turn, ...extra },
    {
      ...stand(px, py, Math.max(1.4, hx - 1.7), Math.max(1.4, hy - 1.7), 2.3, Math.max(0.7, radius - 0.7), base + high),
      cls: `fl-lamp is-${kind}`,
      turn,
      ...extra,
    },
  ]

  const build = {
    // PROTOCOL CUTS. Prose in, four rules out, and the sheet keeps the holes.
    protocol: () => {
      // The punches run along the plan ANTI-DIAGONAL, which is the only
      // direction in this projection that separates on screen: a step of one
      // plan unit there is 1.73 pixels of screen x and none of screen y, so
      // four bites land in a flat row across the sheet instead of on top of
      // each other. Along either plan axis alone they would be ten pixels apart
      // carrying seventeen pixels of width.
      const bite = [[-61, 25], [-51, 15], [-41, 5], [-31, -5]]
      const at = [-6, 16, 38, 60]
      const rise = [12, 18, 9, 15]
      return [
        printed(-800, 'fl-print', [
          // Where the sheet is registered, and where its output stands.
          <line key="edge" x1="-20" y1="-16" x2="-20" y2="36" />,
          ...at.map((px) => <line key={px} x1={px} y1="-14" x2={px} y2="-6" />),
        ]),
        // The prose: one sheet, ruled, continuous, and the only thing on any
        // plate that is bigger than the machine working it.
        { ...stand(-46, 10, 22, 22, 4, 3), cls: 'fl-sheet' },
        printed(-35, 'fl-print fl-ruled', [
          ...[-15, -9, -3, 3, 9, 15].map((u) => (
            <line key={u} x1={-46 + u - 9} y1={10 + u + 9} x2={-46 + u + 9} y2={10 + u - 9} />
          )),
        ]),
        // Four bites punched clean through it. This is the step, drawn once.
        ...bite.map(([px, py]) => ({ ...well(px, py, 7, 4, 4), cls: 'fl-bite' })),
        // The die. One decisive stroke rather than a head strolling along a
        // rail: a press is a thing that happens at a moment.
        { ...stand(-46, 10, 16, 16, 6, 3, 26), cls: 'fl-die', depth: OVER },
        // And what came out of the bites, standing separately.
        ...at.flatMap((px, i) => lit('crit', px, 10, 5, 5, rise[i], 1.5, i)),
      ]
    },
    // EVIDENCE SINKS. The records are under the floor and stay there.
    evidence: () => {
      // Four sockets walked along the plan anti-diagonal, which is the only
      // direction in this projection that separates on screen without also
      // stepping down it - so they land as one flat rank across the plate.
      const socket = [-27, -9, 9, 27].map((s) => [s - 8, -s - 8])
      // Which criterion needs which record is not the order either of them
      // happens to be in, so the routes cross. Routes that never cross are a
      // rake, and a rake is not a bay.
      const wire = [1, 3, 0, 2]
      const from = [-42, -14, 14, 42]
      const bend = [-30, -24, -18, -12]
      return [
        printed(-800, 'fl-print', [
          <line key="spine" x1="-52" y1="-40" x2="52" y2="-40" />,
          ...from.map((x, i) => {
            const [px, py] = socket[wire[i]]
            return (
              <polyline
                className={`fl-route${wire[i] === 3 ? ' is-open' : ''}`}
                key={x}
                points={`${x},-40 ${x},${bend[i]} ${px - 16},${bend[i]} ${px - 16},${py - 16}`}
                style={{ '--turn': i }}
              />
            )
          }),
        ]),
        // Four sockets drilled through the plate.
        ...socket.map(([px, py]) => ({ ...well(px, py, 12, 7), cls: 'fl-socket' })),
        // THE RECORD, AT THE BOTTOM OF THE SOCKET, AND NOWHERE ELSE.
        //
        // This is the step's whole claim made as geometry rather than as a
        // caption: the record is at the site, below the floor, and nothing on
        // this plate ever picks one up. The pass before this stood a plug on top
        // of every socket and the plugs were taller than the holes were wide, so
        // six records were drawn and not one of them could be seen - which
        // argued the exact opposite of the step.
        ...socket.map(([px, py], i) => ({
          ...drum(px, py, 8, 2, -5),
          cls: `fl-record${i === 3 ? ' is-cold' : ''}`,
          depth: px + py + 0.1,
        })),
        // And the reference: a patch node standing on the plate BEHIND the
        // socket, where the route lands. What Damaros holds is this, not what is
        // down the hole - so it is small, it is on the surface, and it never
        // covers the thing it points at.
        ...socket.flatMap(([px, py], i) => (i === 3 ? [] : lit('res', px - 16, py - 16, 5, 5, 4, 1.5, i))),
        { ...stand(-52, -40, 5, 5, 7, 1.5, 0), cls: 'fl-binder', span: glide(104, 0), depth: OVER },
      ]
    },
    // SCREENING DROPS. Three throats, and what is left standing is the count.
    screening: () => {
      const throat = [[-16, 26, 1], [20, 18, 4], [56, 10, 3]]
      return [
        printed(-800, 'fl-print', [
          ...throat.map(([px, py]) => <line key={px} x1="-46" y1="-24" x2={px} y2={py} />),
          ...throat.map(([px, py]) => <circle key={`r${px}`} cx={px - 14} cy={py - 14} r="13" />),
        ]),
        // Where the cohort comes in. One mouth, and everything goes through it.
        { ...drum(-46, -24, 11, 8), cls: 'fl-mouth' },
        // THE TALLY, STANDING BEHIND ITS OWN THROAT. The value line under this
        // plate reads 1 PASS - 4 REVIEW - 3 FAIL and these are those three
        // numbers: each unit steps in half a plan unit as it goes up so every
        // one of them keeps a visible rim, and the pile can be counted rather
        // than estimated off a height.
        ...throat.flatMap(([px, py, count], i) => {
          const half = (j) => 7 - j * 0.5
          const cap = half(count - 1) - 1.6
          return [
            ...Array.from({ length: count }, (_, j) => ({
              ...stand(px - 14, py - 14, half(j), half(j), 6, 1.5, j * 6),
              cls: `fl-unit${j % 2 ? ' is-alt' : ''}`,
              turn: i,
            })),
            { ...stand(px - 14, py - 14, cap, cap, 2.3, 1, count * 6), cls: 'fl-lamp is-bin', turn: i },
          ]
        }),
        // Three throats cut clean through the plate. NO FLOOR is drawn in them,
        // because what goes down one does not stop inside the plate - which is
        // the difference between a bin and a throat, and the reason this plate
        // can say many arrive and few come out anywhere.
        ...throat.map(([px, py]) => ({ ...well(px, py, 13, 4), cls: 'fl-throat' })),
        // One subject down each, forever, and always the same one down the same
        // throat: the same protocol against the same evidence reaches the same
        // result, and that is the only way a drawing can say deterministic.
        ...throat.map(([px, py], i) => ({
          ...stand(-46, -24, 5, 5, 7, 1.5, 0),
          cls: 'fl-faller',
          turn: i,
          span: glide(px + 46, py + 24),
          depth: OVER,
        })),
      ]
    },
    // RESOLVE IS PULLED. The only plate here with a hand on it.
    resolve: () => [
      printed(-800, 'fl-print', [
        <line key="beam" x1="-46" y1="10" x2="-10" y2="-26" />,
        <rect key="bed" x="10" y="6" width="44" height="44" rx="4" />,
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k * 45 * Math.PI) / 180
          return (
            <line
              className="fl-stamp"
              key={k}
              x1={Math.round((32 + Math.cos(a) * 10) * 10) / 10}
              y1={Math.round((28 + Math.sin(a) * 10) * 10) / 10}
              x2={Math.round((32 + Math.cos(a) * 17) * 10) / 10}
              y2={Math.round((28 + Math.sin(a) * 17) * 10) / 10}
            />
          )
        }),
      ]),
      // Two readings, at two heights, disagreeing.
      ...lit('read', -46, 10, 8, 8, 26, 2, 0),
      ...lit('read', -10, -26, 8, 8, 15, 2, 1),
      // THE LEVER. Everything else in this figure runs unattended; this is the
      // step where a named person decides, so this is the one plate with a
      // control on it that only a hand can work. It is also the only part in
      // the drawing that turns, now that Replay has stopped being a clock.
      { ...stand(-4, 4, 5, 5, 30, 1.5), cls: 'fl-post' },
      { pivot: PLAN(t - 4, -t + 4), lift: 30, depth: OVER },
      // And the die it drops.
      { ...stand(32, 28, 11, 11, 22, 2, 4), cls: 'fl-die is-seal', depth: OVER + 1 },
    ],
    // REPLAY LIFTS. A core out of a borehole, nine bands, counted.
    replay: () => {
      const bands = 9
      return [
        printed(-800, 'fl-print', [
          <circle key="rim" cx="-14" cy="14" r="26" />,
          <line key="run" x1="-40" y1="40" x2="12" y2="-12" />,
        ]),
        // The depth scale, up the screen beside the core. Depth is the one
        // quantity in this projection that runs straight up the page, so a log
        // measured on a plan axis would be measured on a diagonal - which is
        // not a log, it is a decoration lying next to a stack.
        { scale: PLAN(t - 14, -t + 14), bands, depth: OVER - 1 },
        // The borehole. Deep, because the thing coming out of it is long.
        { ...well(-14, 14, 19, 7), cls: 'fl-bore' },
        // THE CORE. Nine bands, alternating, and it comes UP - which is the one
        // motion a record being reconstructed can honestly be given. There is
        // nothing rotating on this plate.
        ...Array.from({ length: bands }, (_, k) => ({
          ...stand(-14, 14, 10, 10, 4.4, 1.5, k * 4.4),
          cls: `fl-band${k % 2 ? ' is-alt' : ''}${k === bands - 1 ? ' is-latest' : ''}`,
          turn: k,
          core: true,
          depth: OVER,
        })),
      ]
    },
  }

  // Back to front, or a mechanism is a pile rather than an object.
  return build[key]().sort((a, b) => a.depth - b.depth)
}

/* -- THE SKY ------------------------------------------------------------

   Work moves overhead: each carrier ferries exactly ONE plate-pitch, from the
   airspace of one step to the airspace of the next, which is the run itself
   seen from above.

   AND IT FLIES UNDER THE SENTENCE, NOT THROUGH IT. Measured, the headline
   occupies viewBox y 13 to 77 at a wide desktop, 85 at 1200 and 94 at 1000 -
   and one carrier was parked at 70, which is inside that band. It read as a
   piece of punctuation floating in the middle of the claim. The whole flight
   band now sits between 116 and 142: clear of the deepest line the sentence
   ever reaches, clear of the plates, and in the one strip of the cell that
   nothing else was using. That also retires the two-tier arrangement and the
   width gate it needed, because there is no longer anywhere on the sheet where
   a carrier and a word can meet. */
const SKY = [[250, 138], [450, 120], [660, 142], [900, 116], [1050, 132]].map(([x, y], i) => ({
  key: `sky-${i}`,
  // A hull, a mast and a rotor. What makes a small thing read as a craft at
  // twenty pixels is the GAP - a plate held above a body on a post, which
  // nothing standing on the ground in this figure has.
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
                {[1, 2, 3].map((n) => (
                  <polygon key={n} className="fl-caststep" points={item.plate.top} style={{ '--n': n }} />
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
                    {/* THE DEPTH SCALE, in screen space because depth is the
                        one quantity here that runs straight up the page. */}
                    if (part.scale) {
                      const [x, y] = part.scale
                      return (
                        <g className="fl-scale" key={`${item.key}-e${n}`}>
                          <line x1={x + 34} y1={y + 4} x2={x + 34} y2={y - 42} />
                          {Array.from({ length: part.bands }, (_, k) => (
                            <line key={k} x1={x + 34} y1={y - 1 - k * 4.6} x2={x + (k % 2 ? 39 : 43)} y2={y - 1 - k * 4.6} />
                          ))}
                        </g>
                      )
                    }
                    {/* THE LEVER, and it is the only thing in the figure that
                        turns. It swings in the vertical plane about the top of
                        its own post, which is a screen rotation because that is
                        what a lever's plane is here. */}
                    if (part.pivot) {
                      return (
                        <g
                          className="fl-lever"
                          key={`${item.key}-e${n}`}
                          style={{ transformOrigin: `${part.pivot[0]}px ${part.pivot[1] - part.lift}px` }}
                        >
                          <rect
                            className="fl-throw"
                            x={part.pivot[0] - 2.6}
                            y={part.pivot[1] - part.lift - 26}
                            width="5.2"
                            height="28"
                            rx="2.6"
                          />
                          <circle className="fl-grip" cx={part.pivot[0]} cy={part.pivot[1] - part.lift - 24} r="5" />
                        </g>
                      )
                    }
                    return (
                      <g
                        className={part.cls}
                        key={`${item.key}-e${n}`}
                        style={{ '--turn': part.turn ?? 0, '--span': part.span, '--idle': part.idle ? 1 : 0 }}
                      >
                        {/* The core lifts inside its own group, because the
                            band is placed at its depth in the section and the
                            whole column comes up as one thing. */}
                        {part.core ? (
                          <g className="fl-core"><Faces shape={part.shape} className="dgm-solid" /></g>
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

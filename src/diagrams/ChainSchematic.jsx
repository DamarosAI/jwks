import { useEffect, useRef, useState } from 'react'

import { jitter, planSpace, project, roundedCylinder, roundedSlab } from './iso'
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
 * in each group close into a single plate, the name rises under it, and the
 * mechanism on top comes on last. Nothing can scrub it and nothing puts it
 * back.
 *
 * THE PLATE IS PAPER. WHAT STANDS ON IT IS INK.
 *
 * The previous pass drew the surface in blue and the objects on it in blue, an
 * eighth of a step apart, and the result was a haze - no reader could tell
 * where the plane stopped and the machine on it started. Trident does not have
 * that problem because a deck there is nearly white with a hard edge, and every
 * solid standing on it carries real body. Same rule here: the plate is a sheet
 * of the page's own paper with one drawn edge, and the mechanism is the only
 * dark thing in its own band.
 *
 * AND THE SEAMS CLOSE. Six tiles arrive; one plate remains. The fragments are
 * the point of the opening and would be noise afterwards - six outlines under a
 * mechanism is six things competing with the thing worth reading - so the tiles
 * hand off to a single slab as they seat. That handoff IS the thesis: what
 * arrives in pieces leaves as one surface.
 *
 * POINTING AT ONE LIFTS IT, THE WAY A DECK LIFTS.
 *
 * It used to extrude - the body grew downwards and the plane just got thicker,
 * which reads as a slab swelling rather than as a slab being picked up. A held
 * plate now rises off the ground as one object and DARKENS THE GROUND UNDER
 * IT. That is the only cue an axonometric has for height, it is the one both
 * other figures already use, and it separates the surface from what is standing
 * on it without either of them changing colour.
 *
 * Nothing is hoverable until the plates are down. A target on a tile still in
 * the air is a target on nothing.
 */

const W = 1200
/* TWO THIRDS OF THE CELL WAS DOING NOTHING. Measured against the assembled
   frame, the sentence ended at 62 and the first label started at 261 - two
   hundred units of blank between the claim and the thing that proves it, and
   another hundred and thirty under the row. Dead space is not composure; it is
   a drawing that has been told to fill a box it does not need. The frame is cut
   to what the figure and the sentence actually occupy. */
const H = 330
const CX = 600
// The row sits low, because everything above it belongs to two other things:
// the sentence, which is set into the top of this same cell, and the scatter,
// which needs somewhere to be that is not on top of the sentence.
const CY = 212

/* WHERE THE MESS IS ALLOWED TO BE.
 *
 * The scatter used to be a reach and an angle with nothing bounding it, so
 * tiles ran two hundred and seventy units above their seat - off the top of the
 * viewBox entirely, and straight through the headline that is set into the top
 * of this cell. A drawing that collides with its own sentence is a drawing
 * that has stopped being read. */
const KEEP = { top: 74, bottom: 308, left: 62, right: 1138 }

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
const HALF_X = (COLS * CELL) / 2
const HALF_Y = (ROWS * CELL) / 2
/* One thickness for every surface in the drawing. A plate and the six tiles it
   is made of are the same sheet, so they are the same nine pixels of body -
   otherwise the handoff between them is a step change in an object that is
   supposed to be continuous. */
const SHEET = 9

/* -- WHAT RUNS ON EACH PLATE --------------------------------------------

   FIVE MACHINES, AND FIVE DIFFERENT KINDS OF MACHINE.

   The pass before this gave every plate the same vocabulary - a population of
   rounded boxes with a rounded box travelling past them - and five different
   arrangements of one object is not five machines, it is one machine drawn five
   ways. Trident does not work like that: a proposal surface is a dish with a
   hub sunk into it, a schema is a lattice of standing tiles, an approval is a
   BARREL with two blades across its bore, and a ledger is a stack of rows. Four
   decks, four form languages, and a reader can tell them apart with the labels
   covered.

   So can these, now:

   PROTOCOL is a GANTRY. A stack of loose sheets at one end, four criteria stood
   on edge at the other, and a head that rides an overhead rail from the paper
   to the logic - lighting each criterion as it reaches it, and leaving a version
   bar clamped across all four. Prose in, executable criteria out, under one
   version. Nothing else here is orthogonal like this.

   EVIDENCE is a PATCH BAY. The records are round pads standing where they
   already stand, and they never move, because the whole claim of this step is
   that nothing is copied anywhere. What moves is a binder running a spine, and
   what appears is a TETHER down to each pad it reaches. One pad is never
   reached, because not every criterion is mapped when a snapshot closes.

   SCREENING is a HOPPER. One round mouth takes the cohort in, three chutes run
   out of it, and three bins stand at one, four and three. Many in, few through -
   and the same path every cycle, which is the only way to draw determinism.

   RESOLVE is a PRESS. Two readings capped at different heights, a carriage that
   carries the call across, and a round seal that comes down onto a round anvil.
   Nothing is settled until something presses.

   REPLAY is a TURNTABLE. A disc with the events stood round its rim and an arm
   sweeping the whole face, drawn inside the plan matrix so the sweep is a true
   plan circle rather than a screen one - which is the difference between a
   record being read and a line spinning on top of a picture.

   Every part is solved from its own plate's seat. Built against the plan origin
   - which is the middle of the row - four of the five draw on top of the third
   one and the rest come out bare. */

function mechanism(key, t) {
  const [seatX, seatY] = PLAN(t, -t)
  // `base` is what the part is standing ON. Without it everything in a
  // mechanism has its feet on the plate, so a bar that clamps a row of fins has
  // to be drawn beside them instead of across their tops - which is a drawing
  // of two unrelated objects rather than of one holding the other.
  const stand = (px, py, hx, hy, high, radius = 2, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - base - high, hx, hy, high, radius) }
  }
  // The same thing with a round plan. A source, a mouth, a pan and a seal are
  // not milled parts and should not be drawn as though they were: half of what
  // makes Trident's four decks tell themselves apart is that two of them are
  // built out of circles.
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

  /* A SOLID AND THE LAMP THAT REPORTS ITS STATE.
     State used to be the solid's own opacity, and in an axonometric a
     half-opaque solid is not a dim solid - it is a hole. You saw the plate's
     lattice and whatever stood behind it straight through a record that had
     simply not been reached yet, and five mechanisms came out as five sets of
     ghosts. Trident does not do this: a criterion there keeps its body and
     wears a lamp, and only the lamp changes. So the population is always
     solid, and what moves is the light on top of it. */
  const lit = (kind, px, py, hx, hy, high, radius, turn, extra = {}) => [
    { ...stand(px, py, hx, hy, high, radius), cls: `fl-${kind}`, turn, ...extra },
    {
      ...stand(px, py, Math.max(1.4, hx - 1.7), Math.max(1.4, hy - 1.7), 2.4, Math.max(0.7, radius - 0.7), high),
      cls: `fl-lamp is-${kind}`,
      turn,
      ...extra,
    },
  ]

  // The round one wears a round lamp, or a disc comes back with a square cap on
  // it and stops being a disc.
  const litDrum = (kind, px, py, r, high, turn, extra = {}) => [
    { ...drum(px, py, r, high), cls: `fl-${kind}`, turn, ...extra },
    { ...drum(px, py, Math.max(1.6, r - 2.4), 2.4, high), cls: `fl-lamp is-${kind}`, turn, ...extra },
  ]

  const build = {
    // A GANTRY. Paper at one end, logic at the other, a head riding between.
    protocol: () => [
      // The document, as it arrives: three loose sheets, stacked and offset.
      ...[0, 1, 2].map((i) => ({
        ...stand(-48 + i * 3, 2 - i * 3, 19, 22, 3, 2, i * 3),
        cls: 'fl-sheet',
      })),
      // Four criteria, stood on edge, lit in the order they compile.
      ...[0, 1, 2, 3].flatMap((i) => lit('crit', 2 + i * 17, 0, 4, 24, 16, 1.2, i)),
      // The rail the head rides. It spans the whole travel, so the head is
      // carried rather than floating - a head on nothing is a cursor.
      { ...stand(2, -20, 40, 2, 2.5, 1, 22), cls: 'fl-gantry' },
      { ...stand(-38, -20, 5, 5, 7, 1.5, 15), cls: 'fl-head', span: glide(80, 0), depth: OVER },
      { ...stand(28, 0, 30, 3, 4, 1.5, 17), cls: 'fl-lock', depth: OVER + 1 },
    ],
    // A PATCH BAY. The pads never move; the tethers reach them.
    evidence: () => {
      const at = [-46, -15, 15, 46]
      const high = [9, 14, 8, 12]
      return [
        // The spine: the criteria asking for evidence, along the back edge.
        { ...stand(0, -32, 46, 2.5, 7, 1.2), cls: 'fl-spine' },
        // The tethers. One per pad, and the fourth pad never gets one.
        ...at.slice(0, 3).map((px, i) => ({
          ...stand(px, -12, 1.4, 17, 1.6, 0.7),
          cls: 'fl-tether',
          turn: i,
        })),
        // The records themselves, round because they are sources rather than
        // parts, standing at the depths they happen to stand at.
        ...at.flatMap((px, i) => litDrum('res', px, 16, 11, high[i], i, { idle: i === 3 })),
        { ...stand(-50, -32, 5, 5, 6, 1.5, 7), cls: 'fl-binder', span: glide(100, 0), depth: OVER },
      ]
    },
    // A HOPPER. One mouth in, three chutes out, three bins that are not equal.
    screening: () => [
      { ...drum(0, -24, 21, 12), cls: 'fl-hopper' },
      ...[-26, 0, 26].map((px, i) => ({ ...stand(px, 13, 2.5, 11, 3, 1), cls: 'fl-chute', turn: i })),
      ...[[-26, 7], [0, 26], [26, 19]].flatMap(([px, high], i) => lit('bin', px, 36, 11, 9, high, 2, i)),
      // In through the mouth, then down its own chute. Two moves, because a
      // sort is a thing that happens on a path and not a thing that flies.
      ...[-26, 0, 26].map((px, i) => ({
        ...stand(0, -24, 5, 5, 8, 1.5, 26),
        cls: 'fl-puck',
        turn: i,
        span: '0px, 24px',
        drop: glide(px, 60),
        depth: OVER,
      })),
    ],
    // A PRESS. Two readings, a call carried across, a seal that lands.
    resolve: () => [
      ...litDrum('read', -42, -22, 11, 26, 0),
      ...litDrum('read', -42, 22, 11, 13, 1),
      // The beam. Without it the two readings are two lone posts rather than
      // two sides of one question, and a disagreement nobody has drawn a
      // connection across is not a disagreement.
      { ...stand(-42, 0, 5, 26, 3, 1.2, 13), cls: 'fl-beam' },
      { ...stand(-42, 0, 5, 5, 8, 1.5, 16), cls: 'fl-call', span: glide(80, 0), depth: OVER },
      { ...drum(38, 0, 17, 6), cls: 'fl-anvil' },
      { ...drum(38, 0, 9, 23), cls: 'fl-seal', depth: OVER + 1 },
    ],
    // A TURNTABLE. A disc, six events round its rim, and an arm across the face.
    replay: () => {
      const ring = [[44, 0], [22, 25], [-22, 25], [-44, 0], [-22, -25], [22, -25]]
      return [
        { ...drum(0, 0, 46, 3), cls: 'fl-disc', depth: -999 },
        // The sweep is drawn INSIDE the plan matrix, so a rotation of it is a
        // true plan circle that the projection turns into the right ellipse. A
        // bar rotated in screen space sweeps a circle over an axonometric and
        // reads as a line spinning on top of the picture rather than as an arm
        // running across a face. It is a full diameter so its own centre is the
        // plan origin, which is what it has to turn about.
        { sweep: planSpace(seatX, seatY - 4), depth: -998 },
        ...ring.flatMap(([px, py], i) => lit('event', px, py, 6, 6, i === 0 ? 19 : 12, 1.8, i)),
        { ...drum(0, 0, 9, 9), cls: 'fl-hub', depth: OVER },
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

   They keep out of the sentence's band. A drawing that collides with its own
   headline is a drawing that has stopped being read, and that is as true at
   the top of the cell as it was for the scatter. */

/* THE SKY IS TWO-TIER, AND THE SENTENCE IS WHY.
   Measured, the headline runs to 78 at a wide desktop and 86 at 1180 - it grows
   a line as the column narrows - and the first step name starts at 120. Under
   the sentence's own column that leaves about thirty units of air, which is not
   enough altitude to be worth drawing: five carriers at one height is a row,
   and a row is the one thing this figure already had too many of.
   But the sentence is a left-hand column and it ends around 850. To the RIGHT
   of it the air runs all the way to the top of the cell. So the carriers over
   the last two steps fly high and the three over the sentence fly low, which is
   both the only safe arrangement and the one that actually puts height in the
   drawing. Below 1180 the sentence takes the whole band and the sky is turned
   off in the sheet: a carrier crossing a word is worse than no carrier. */
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
         mistake rather than as disorder. Scattering each tile from its OWN seat
         made it worse - every tile in the two outer plates overshot the same
         wall, the clamp put them all on it, and the figure opened with two
         clots at the edges and a hole in the middle.
         Two irrational strides walk the frame instead. Every tile lands
         somewhere different, the coverage is even at any count, and nothing is
         on a grid - which is the whole difference between disorder and a
         pattern. */
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
        // still a mess: tiles holding perfectly still read as a paused video,
        // and the floating is the part worth watching. So each one wanders
        // between two nearby points until it is called in.
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
 * criterion fin and a record pad alike, and a machine built out of both is one
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
   * trips on the first pixel of the figure spends it off screen: the tiles
   * assemble below the fold and a reader arrives at a drawing that is already
   * finished. Well into view, then. Two ways in, because either one alone has a
   * viewport that defeats it - a ratio never reaches four tenths if the figure
   * is taller than the window, and a top line never crosses if the figure is
   * short enough to enter from the bottom already whole. */
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
          aria-label="Thirty surfaces scattered in the air, seen in axonometric projection. As the reader reaches the figure they draw together and set down flush, six at a time, into five plates in a row - lettered Protocol, Evidence, Screening, Resolve and Replay - and stay there. Each plate then runs its own mechanism: five criteria walked and locked under one version, eight site records bound by a passing as-of cut, a cohort sorted down one rail into three unequal bins, two disagreeing readings levelled by a seal, and six events verified round a closing ring. Pointing at a plate lifts it off the ground and darkens the ground beneath it."
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
                    real reader the same on every scroll. Trident already
                    answers this: three steps at a low alpha each, which ramp
                    from the rim inward and leave no single edge strong enough to
                    read as a drawn line. Same answer here, no filter, and it
                    lifts with the plate rather than staying on the page. */}
                <g className="fl-aura">
                  {[1.2, 1.14, 1.09, 1.045].map((step) => (
                    <polygon key={step} className="fl-aurastep" points={item.plate.top} style={{ '--step': step }} />
                  ))}
                </g>

                {/* THE FRAGMENTS. They travel, they seat, and then they are
                    gone: six seams under a mechanism is six things competing
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

                {/* WHAT THE STEP ACTUALLY DOES, STOOD UP ON ITS OWN PLATE. It
                    arrives after the plate does, because a mechanism drawn over
                    a surface that has not landed is a claim about a thing that
                    is not there yet. */}
                <g className="fl-emblem">
                  {item.emblem.map((part, n) => (part.sweep ? (
                    <g className="fl-face" key={`${item.key}-e${n}`} transform={part.sweep}>
                      {/* Turned inside the projection, so the arm sweeps a true
                          plan circle. A full diameter, so its own bounding box
                          is centred on the plan origin it has to turn about. */}
                      <g className="fl-arm">
                        <rect x="-46" y="-2.4" width="92" height="4.8" rx="2.4" />
                      </g>
                    </g>
                  ) : (
                    <g
                      className={part.cls}
                      key={`${item.key}-e${n}`}
                      style={{ '--turn': part.turn ?? 0, '--span': part.span, '--drop': part.drop, '--idle': part.idle ? 1 : 0 }}
                    >
                      {/* Two moves need two groups: one transform cannot both
                          ride a rail and come off it. */}
                      {part.drop ? (
                        <g className="fl-hop"><Faces shape={part.shape} className="dgm-solid" /></g>
                      ) : part.round ? (
                        <Drum shape={part.shape} className="dgm-solid" />
                      ) : (
                        <Faces shape={part.shape} className="dgm-solid" />
                      )}
                    </g>
                  )))}
                </g>
              </g>

              {/* Above the plate, and it does not travel with it: the solids
                  float and the type does not. */}
              <text className="fl-name" x={item.seat[0]} y={item.plate.back[1] - 38} textAnchor="middle">
                {item.label}
              </text>
              {/* THE VALUE UNDER THE NAME. Trident letters every deck with a
                  name and the one number that deck is currently holding, and it
                  is most of why that figure reads as an instrument rather than
                  as an illustration. These are the product's own counts, taken
                  off the replay chain the section is about - the same numbers
                  the mechanism above is drawn from. */}
              <text className="fl-fact" x={item.seat[0]} y={item.plate.back[1] - 22} textAnchor="middle">
                {item.fact}
              </text>
              <rect
                className="fl-hit"
                x={item.seat[0] - 130}
                y={item.plate.back[1] - 58}
                width="260"
                height={item.plate.front[1] - item.plate.back[1] + 96}
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

import { useEffect, useRef, useState } from 'react'

import { jitter, project, roundedSlab } from './iso'
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

   FIVE MECHANISMS, AND FEWER PARTS THAN BEFORE.

   The last pass put twelve criteria, fourteen resources and a nine-event ring
   on plates two hundred pixels wide. Every one of those was three to five
   pixels across, which is under the size at which a solid reads as a solid -
   so five machines came out as five smudges. Trident's smallest legible object
   is a contract field at about nine pixels and there are nineteen of them in
   one ordered grid, not twenty-six scattered around.

   So each plate now carries between five and nine substantial parts, none
   smaller than about eighteen pixels on screen, and every one of them is a
   thing rather than a mark:

   PROTOCOL - five criteria stood on edge, a carriage that rides along their
   tops, and a version bar that comes down across them once it has passed. A
   criterion lights as the carriage reaches it and STAYS lit, because compiling
   is a thing that finishes.

   EVIDENCE - eight site records in a plan grid and one as-of cut travelling
   across them. A record binds as the cut passes its column; two never bind,
   because not every criterion is mapped when a snapshot closes.

   SCREENING - one intake rail, three bins at one, four and three, and a cohort
   that rides the rail to its own bin before it drops into it. Many in, few
   through.

   RESOLVE - two readings that disagree, a beam that sits at whichever is
   governing, and a seal that comes down and levels it.

   REPLAY - six events in a ring with a verifier going round them, closing on
   where it started. The links do not light: the chain is structure.

   AND STATE IS A LAMP, NOT AN OPACITY. Every population here keeps its body and
   wears a light, because a half-opaque solid in an axonometric is not a dim
   solid - it is a hole, and you see the plate's lattice through a record that
   has simply not been reached yet.

   Every part is solved from its own plate's seat. Built against the plan origin
   - which is the middle of the row - four of the five draw on top of the third
   one and the rest come out bare. */

function mechanism(key, t) {
  // `base` is what the part is standing ON. Without it everything in a
  // mechanism has its feet on the plate, so a bar that clamps a row of fins has
  // to be drawn beside them instead of across their tops - which is a drawing
  // of two unrelated objects rather than of one holding the other.
  const stand = (px, py, hx, hy, high, radius = 2, base = 0) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - base - high, hx, hy, high, radius) }
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

  const build = {
    // Five criteria stood on edge, a carriage that rides along their tops, and
    // a version bar that comes down ACROSS them once it has passed.
    //
    // The reader used to be a full-height blade, which made it the largest and
    // darkest object on the plate: the population vanished behind the thing
    // reading it. A read head is a small thing riding a large thing, so it is
    // drawn as one - and the bar lands on the fins rather than beside them,
    // which is the difference between a clamp and a stick.
    protocol: () => [
      ...[0, 1, 2, 3, 4].flatMap((i) => lit('crit', -36 + i * 18, 0, 4, 22, 17, 1.2, i)),
      { ...stand(-50, 0, 6, 6, 9, 1.5, 20), cls: 'fl-head', span: glide(100, 0), depth: OVER },
      { ...stand(0, 0, 36, 4, 5, 1.5, 21), cls: 'fl-lock', depth: OVER + 1 },
    ],
    // Eight records, bound column by column as one as-of cut crosses them.
    evidence: () => {
      const records = []
      ;[-45, -15, 15, 45].forEach((px, col) => {
        ;[-18, 18].forEach((py, row) => {
          records.push(...lit('res', px, py, 11, 11, row === 0 ? 8 : 13, 2, col, {
            // Two of the eight never bind. A snapshot that mapped everything
            // would be claiming something the product does not claim.
            idle: (col === 3 && row === 0) || (col === 2 && row === 1),
          }))
        })
      })
      return [...records, { ...stand(-62, 0, 2.5, 32, 22, 1), cls: 'fl-asof', span: glide(124, 0), depth: OVER }]
    },
    // One intake rail, three bins at one, four and three, and a cohort that
    // rides the rail to its own bin before it drops into it.
    //
    // The pucks used to leave the rail on frame one and cross open plate on a
    // diagonal, which is a drawing of three things falling past a stick. A
    // sort is a thing that happens ON a track, so the travel is two moves: the
    // ride along the rail, then the drop off it.
    screening: () => [
      { ...stand(0, -26, 46, 3, 5, 1.5), cls: 'fl-rail' },
      ...[[-32, 7], [0, 28], [32, 21]].flatMap(([px, high], i) => lit('bin', px, 20, 13, 11, high, 2, i)),
      ...[-32, 0, 32].map((bx, i) => ({
        ...stand(-46, -26, 5, 5, 9, 1.6),
        cls: 'fl-puck',
        turn: i,
        span: glide(bx + 46, 0),
        drop: glide(0, 46),
        depth: OVER,
      })),
    ],
    // Two readings that disagree, and a seal that levels them. Neither is
    // taller than the plate can carry: at thirty-two they broke the silhouette
    // upward and ran into the line of type naming the step.
    resolve: () => [
      ...lit('read', -46, -20, 9, 9, 26, 2, 0),
      ...lit('read', -46, 20, 9, 9, 14, 2, 1),
      { ...stand(-8, 0, 22, 4, 16, 1.5), cls: 'fl-beam' },
      { ...stand(42, 0, 15, 15, 9, 2.5), cls: 'fl-anvil' },
      { ...stand(42, 0, 9, 9, 24, 2), cls: 'fl-seal', depth: OVER },
    ],
    // Six events in a ring, verified in order, closing on the start. The links
    // do not light: the chain is structure, and structure that keeps switching
    // on is structure a reader is entitled to think might switch off.
    replay: () => {
      const ring = [[46, 0], [23, 26], [-23, 26], [-46, 0], [-23, -26], [23, -26]]
      const events = ring.flatMap(([px, py], i) => {
        const pair = lit('event', px, py, 7, 7, i === 0 ? 20 : 13, 2, i)
        // The one it closes on, marked by its own ink rather than by position.
        if (i === 0) pair[0].cls = 'fl-event is-origin'
        return pair
      })
      const links = ring.map(([px, py], i) => {
        const [qx, qy] = ring[(i + 1) % ring.length]
        return {
          ...stand((px + qx) / 2, (py + qy) / 2, Math.max(2.5, Math.abs(qx - px) / 2 - 7), Math.max(2.5, Math.abs(qy - py) / 2 - 7), 5, 1.2),
          cls: 'fl-link',
          turn: i,
        }
      })
      return [...links, ...events]
    },
  }

  // Back to front, or a mechanism is a pile rather than an object.
  return build[key]().sort((a, b) => a.depth - b.depth)
}

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
                  {item.emblem.map((part, n) => (
                    <g
                      className={part.cls}
                      key={`${item.key}-e${n}`}
                      style={{ '--turn': part.turn ?? 0, '--span': part.span, '--drop': part.drop, '--idle': part.idle ? 1 : 0 }}
                    >
                      {/* Two moves need two groups: one transform cannot both
                          ride a rail and come off it. */}
                      {part.drop ? (
                        <g className="fl-hop"><Faces shape={part.shape} className="dgm-solid" /></g>
                      ) : (
                        <Faces shape={part.shape} className="dgm-solid" />
                      )}
                    </g>
                  ))}
                </g>
              </g>

              {/* Above the plate, and it does not travel with it: the solids
                  float and the type does not. */}
              <text className="fl-name" x={item.seat[0]} y={item.plate.back[1] - 30} textAnchor="middle">
                {item.label}
              </text>
              {/* THE VALUE UNDER THE NAME. Trident letters every deck with a
                  name and the one number that deck is currently holding, and it
                  is most of why that figure reads as an instrument rather than
                  as an illustration. These are the product's own counts, taken
                  off the replay chain the section is about - the same numbers
                  the mechanism above is drawn from. */}
              <text className="fl-fact" x={item.seat[0]} y={item.plate.back[1] - 14} textAnchor="middle">
                {item.fact}
              </text>
              <rect
                className="fl-hit"
                x={item.seat[0] - 130}
                y={item.plate.back[1] - 50}
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

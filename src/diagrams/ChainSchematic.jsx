import { useState } from 'react'

import { jitter, project, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * FIVE PLANES, EACH ASSEMBLED OUT OF THE SAME SCATTER.
 *
 * The loop is the one that worked: a scatter of tiles off every axis, drawing
 * together and setting down flush into a plane. What changed is where they
 * land. One plane was an abstraction - a rectangle is not a shape this business
 * makes - so the scatter now resolves into FIVE, and the five are the product:
 * Protocol, Evidence, Screening, Resolve, Replay, in the order work moves
 * through them.
 *
 * Six tiles per plane, thirty in the air. They do not converge on a point; each
 * one has a seat in a specific plane, and the plane is only a plane once all
 * six are in it.
 *
 * EACH PLANE THEN RUNS ITS OWN THING.
 *
 * A charge crosses every plane on its own clock, in an order that is a fact
 * about that step rather than a decoration: Protocol lights row by row, the way
 * a document is written. Evidence lights out of order, the way records actually
 * arrive. Screening lights every tile and lets only the last column stay up -
 * many in, few through. Resolve lights from both ends and meets in the middle.
 * Replay goes round the ring and starts again. Five orders, five rates, one
 * keyframe: the difference is in the delays, which is where a difference of
 * this kind belongs.
 *
 * AND THE PLANE STANDS UP WHEN YOU POINT AT IT.
 *
 * Flat is what a step looks like from outside. Hovered, it extrudes: every tile
 * gains its full depth and rises by its own amount, so the plane becomes a
 * solid with relief in it - the same move Trident and Nectar make with their
 * decks, done on demand. That is the reward for being curious, and the readout
 * underneath says what the step does while it is up.
 */

const W = 1200
const H = 520
const CX = 600
// The row sits low, because everything above it belongs to two other things:
// the sentence, which is set into the top of this same cell, and the scatter,
// which needs somewhere to be that is not on top of the sentence.
const CY = 340

/* WHERE THE MESS IS ALLOWED TO BE.
 *
 * The scatter used to be a reach and an angle with nothing bounding it, so
 * tiles ran two hundred and seventy units above their seat - off the top of the
 * viewBox entirely, and straight through the headline that is set into the top
 * of this cell. A drawing that collides with its own sentence is a drawing
 * that has stopped being read.
 *
 * So the drift is CLAMPED rather than merely chosen. Reach and angle still
 * scatter the tiles the way they always did; the clamp only stops one leaving
 * the box. It is written as a box because that is what it is - the region the
 * figure is entitled to, with the sentence's own space kept out of it. */
const KEEP = { top: 168, bottom: 498, left: 62, right: 1138 }

/* The clamp needs a PER-TILE inset, or every tile whose reach overshoots lands
   on the identical boundary pixel and the edges of the scatter grow clumps -
   which is the one thing a scatter is not allowed to have. Each tile stops a
   little short of the wall, by its own amount. */
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

/* The order the charge visits the six tiles, per step. Each is a fact about
   what that step does, not a pattern picked to look busy. */
const ORDERS = {
  // Written line by line.
  protocol: (col, row) => row * COLS + col,
  // Records do not arrive in order.
  evidence: (col, row) => Math.round(jitter(row * COLS + col, 23) * 5),
  // Everything in, one column through.
  screening: (col) => col,
  // Two readings, meeting.
  resolve: (col) => (col === 1 ? 2 : 0),
  // Round the ring, and again.
  replay: (col, row) => (row === 0 ? col : 5 - col),
}


/* -- WHAT RUNS ON EACH PLANE --------------------------------------------

   FIVE MECHANISMS, NOT FIVE EMBLEMS.

   The first attempt put a small arrangement of blocks on each plane and called
   it done. It was not: an arrangement is a picture of a step, and Trident sets
   the bar higher than that. Every deck in that figure has a POPULATION and a
   MECHANISM running through it - a distribution that resamples, a contract that
   walks its nineteen fields in the order it checks them, a gate whose two
   blades hold, a ledger that posts each hash to the row it commits. That is the
   difference between a machine and a diagram of one.

   So each plane here carries the same two things, and both are taken from the
   product's own record rather than invented:

   PROTOCOL - twelve criteria stood on edge, a reader head that walks them left
   to right, and a version bar that drops across all of them once it has. Each
   criterion lights as the head reaches it and stays lit, because compiling is
   a thing that finishes.

   EVIDENCE - resources at every depth and one as-of plane descending through
   them. A resource lights when the cut passes it; the ones standing proud of it
   stay dark, because not every criterion is mapped when a snapshot closes.

   SCREENING - a cohort travelling one rail to a splitter that sorts it three
   ways, into bins at one, four and three. The bins are not the same size and
   the drawing is not going to pretend they are.

   RESOLVE - two readings that disagree, a beam that sits at whichever one is
   currently governing, and a seal that comes down and levels it. Nothing is
   settled until something presses.

   REPLAY - nine events in a ring with a verifier going round them, lighting
   each event and the link behind it, closing on where it started.

   Every part is solved from its own plane's seat. Built against the plan origin
   - which is the middle of the row - four of the five draw on top of the third
   one and the rest come out bare. */

function mechanism(key, t) {
  const stand = (px, py, hx, hy, high, radius = 2) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - high, hx, hy, high, radius) }
  }
  // A plan displacement, expressed as the screen move it actually is. Anything
  // that travels across a plane has to travel along the plane's own axes or it
  // is sliding over the top of the projection rather than moving inside it.
  const glide = (dx, dy) => `${Math.round((dx - dy) * 0.866)}px, ${Math.round((dx + dy) * 0.34)}px`

  const build = {
    // Twelve criteria, walked, then locked under one version.
    protocol: () => {
      const blades = Array.from({ length: 12 }, (_, i) => ({
        ...stand(-46 + i * 8.4, -6, 2.2, 12, 9 + Math.round(jitter(i, 5) * 15), 1),
        cls: 'fl-blade',
        turn: i,
      }))
      return [
        ...blades,
        { ...stand(-52, -6, 2.6, 15, 26, 1), cls: 'fl-head', span: glide(104, 0) },
        { ...stand(-1, -6, 50, 2.4, 30, 1.2), cls: 'fl-lock' },
      ]
    },
    // Resources at every depth, and one as-of cut descending through them.
    evidence: () => {
      const pins = Array.from({ length: 14 }, (_, i) => {
        const high = 5 + Math.round(jitter(i, 43) * 24)
        return {
          ...stand(-42 + jitter(i, 11) * 84, -22 + jitter(i, 29) * 44, 2.8, 2.8, high, 1),
          cls: 'fl-pin',
          // Its turn is its own height: the cut reaches the tall ones last.
          turn: Math.round((high / 29) * 11),
          under: high < 17,
        }
      })
      return [...pins, { ...stand(0, 0, 46, 23, 17, 3), cls: 'fl-sheet' }]
    },
    // One cohort, one rail, one splitter, three bins that are not equal.
    screening: () => {
      const bins = [
        { px: -26, high: 8, cls: 'fl-bin' },
        { px: 0, high: 24, cls: 'fl-bin' },
        { px: 26, high: 18, cls: 'fl-bin' },
      ].map((bin, i) => ({ ...stand(bin.px, 10, 9, 10, bin.high, 1.6), cls: bin.cls, turn: i }))
      const pucks = Array.from({ length: 6 }, (_, i) => {
        const lane = i % 3
        return {
          ...stand(-40, -20, 3.4, 3.4, 26, 1.4),
          cls: 'fl-puck',
          turn: i,
          span: glide(40 + (lane - 1) * 26, 30),
        }
      })
      return [
        { ...stand(0, -20, 42, 2.2, 24, 1), cls: 'fl-rail' },
        ...bins,
        ...pucks,
      ]
    },
    // Two readings that disagree, and a seal that levels them.
    resolve: () => [
      { ...stand(-34, -14, 3.6, 9, 26, 1.2), cls: 'fl-read is-high' },
      { ...stand(-34, 14, 3.6, 9, 12, 1.2), cls: 'fl-read is-low' },
      { ...stand(-12, 0, 16, 2.2, 19, 1), cls: 'fl-beam' },
      { ...stand(22, 0, 12, 12, 14, 2.2), cls: 'fl-anvil' },
      { ...stand(22, 0, 7, 7, 34, 1.6), cls: 'fl-seal' },
    ],
    // Nine events in a ring, verified in order, closing on the start.
    replay: () => {
      const ring = [[-36, -16], [-12, -23], [12, -23], [36, -16], [36, 16], [12, 23], [-12, 23], [-36, 16]]
      const events = ring.map(([px, py], i) => ({
        ...stand(px, py, 4.2, 4.2, i === 0 ? 20 : 9, 1.6),
        cls: 'fl-event',
        turn: i,
      }))
      const links = ring.map(([px, py], i) => {
        const [qx, qy] = ring[(i + 1) % ring.length]
        return {
          ...stand((px + qx) / 2, (py + qy) / 2, Math.max(1.8, Math.abs(qx - px) / 2), Math.max(1.8, Math.abs(qy - py) / 2), 3.5, 1),
          cls: 'fl-link',
          turn: i,
        }
      })
      return [...events, ...links]
    },
  }

  // Back to front, or a mechanism is a pile rather than an object.
  return build[key]().sort((a, b) => a.depth - b.depth)
}

const STEPS = [
  {
    key: 'protocol',
    label: 'PROTOCOL',
    beat: 4.4,
    read: 'The study arrives as something that executes, with its criteria as logic rather than prose.',
  },
  {
    key: 'evidence',
    label: 'EVIDENCE',
    beat: 3.4,
    read: 'Site records bind to the criteria that need them, and stay where they already are.',
  },
  {
    key: 'screening',
    label: 'SCREENING',
    beat: 5.2,
    read: 'Deterministic. The same protocol against the same evidence reaches the same result.',
  },
  {
    key: 'resolve',
    label: 'RESOLVE',
    beat: 3.8,
    read: 'Where the answer needs judgement, a named person makes the call and signs it.',
  },
  {
    key: 'replay',
    label: 'REPLAY',
    beat: 4.8,
    read: 'Any decision reconstructs cold: protocol version, evidence as of then, and who decided.',
  },
].map((step, index) => {
  const t = (index - 2) * STEP
  const order = ORDERS[step.key]

  const tiles = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const px = t + (col - (COLS - 1) / 2) * CELL
      const py = -t + (row - (ROWS - 1) / 2) * CELL
      const [sx, sy] = PLAN(px, py)
      const seed = index * 11 + row * COLS + col
      const spin = jitter(seed, 17) * Math.PI * 2
      const reach = 230 + jitter(seed, 37) * 340
      const slack = Math.round(jitter(seed, 79) * 74)
      tiles.push({
        key: `${step.key}-${row}-${col}`,
        col,
        row,
        // BUILT AT ITS SEAT, so the assembled plane is a true plan grid with
        // every seam landing on every other seam. Scatter is an offset from it.
        // FLAT is what a step looks like from outside; TALL is the same tile
        // with its full depth, which is what the pointer brings up. Two shapes,
        // one top face - so the surface never moves, only what is under it.
        flat: roundedSlab(sx, sy, TILE, TILE, 7, 7),
        tall: roundedSlab(sx, sy, TILE, TILE, 30, 7),
        // TWO SCATTER POSITIONS, NOT ONE. The mess has to be alive while it is
        // still a mess: tiles that hold perfectly still for a fifth of the loop
        // read as a paused video, and the floating is the part worth watching.
        // So each one wanders between two nearby points before it is called in.
        driftX: Math.round(clamp(sx + Math.cos(spin) * reach, KEEP.left, KEEP.right, slack) - sx),
        driftY: Math.round(clamp(sy - 24 - jitter(seed, 53) * 150 + Math.sin(spin) * 62, KEEP.top, KEEP.bottom, slack * 0.5) - sy),
        swayX: Math.round(clamp(sx + Math.cos(spin) * reach + (jitter(seed, 97) - 0.5) * 52, KEEP.left, KEEP.right, slack) - sx),
        swayY: Math.round(clamp(sy - 24 - jitter(seed, 53) * 150 + Math.sin(spin) * 62 + (jitter(seed, 103) - 0.5) * 44, KEEP.top, KEEP.bottom, slack * 0.5) - sy),
        // How far it rises when the plane stands up. Varied, so what comes up
        // is a solid with relief in it rather than a slab on a lift.
        rise: 8 + Math.round(jitter(seed, 71) * 22),
        // Its turn in the charge, and how far it settles back afterwards.
        beat: order(col, row),
        // Screening is the one step where most of what goes in does not come
        // through, so its tiles do not all hold the light.
        holds: step.key !== 'screening' || col === COLS - 1,
        lag: Math.round(jitter(seed, 89) * 100) / 100,
      })
    }
  }

  const seat = PLAN(t, -t)
  return { ...step, index, tiles, seat, emblem: mechanism(step.key, t), span: roundedSlab(seat[0], seat[1], (COLS * CELL) / 2, (ROWS * CELL) / 2, 1, 10) }
})

export default function ChainSchematic({ animate = true }) {
  const frame = useCenterOnOverflow()
  const [hot, setHot] = useState(null)
  const step = STEPS.find((item) => item.key === hot) ?? null

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor${animate ? ' is-live' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Thirty surfaces scattered in the air, seen in axonometric projection. They draw together and set down flush into five separate planes in a row, lettered Protocol, Evidence, Screening, Resolve and Replay. A charge then crosses each plane in an order particular to that step - line by line for Protocol, out of order for Evidence, many in and one column through for Screening, from both ends inward for Resolve, and round the ring for Replay. Pointing at a plane stands it up: every tile gains its full depth and rises, turning the flat surface into a solid. The scatter and assembly repeat."
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
              style={{ '--beat': `${item.beat}s` }}
              onMouseEnter={() => setHot(item.key)}
              onMouseLeave={() => setHot((current) => (current === item.key ? null : current))}
              onFocus={() => setHot(item.key)}
              onBlur={() => setHot(null)}
              tabIndex={0}
              role="button"
              aria-label={`${item.label} - ${item.read}`}
            >
              {item.tiles.map((tile) => (
                <g
                  className={`fl-tile${tile.holds ? ' is-holds' : ''}`}
                  key={tile.key}
                  style={{
                    '--drift-x': `${tile.driftX}px`,
                    '--drift-y': `${tile.driftY}px`,
                    '--sway-x': `${tile.swayX}px`,
                    '--sway-y': `${tile.swayY}px`,
                    '--rise': `${tile.rise}px`,
                    '--turn': tile.beat,
                    '--lag': tile.lag,
                  }}
                >
                  {/* The deep body, held at nothing until the plane stands up.
                      Drawn first so the flat faces sit over it and the swap is
                      a fade rather than a pop. */}
                  <g className="fl-deep">
                    <Faces shape={tile.tall} className="dgm-solid" />
                  </g>
                  <g className="fl-shallow">
                    <Faces shape={tile.flat} className="dgm-solid" />
                  </g>
                  <polygon className="fl-grain" points={tile.flat.top} fill="url(#fl-grain)" />
                  <polygon className="fl-lit" points={tile.flat.top} />
                </g>
              ))}

              {/* WHAT THE STEP ACTUALLY DOES, STOOD UP ON ITS OWN PLANE. Drawn
                  after the tiles so it sits on them, and faded out with the
                  scatter because an emblem floating over an unassembled plane
                  is a claim about a thing that is not there yet. */}
              <g className="fl-emblem">
                {item.emblem.map((part, n) => (
                  <g
                    className={part.cls}
                    key={`${item.key}-e${n}`}
                    style={{ '--turn': part.turn ?? 0, '--span': part.span, '--under': part.under ? 1 : 0 }}
                  >
                    <Faces shape={part.shape} className="dgm-solid" />
                  </g>
                ))}
              </g>

              {/* Above the plane, where there is nothing. The space under it
                  belongs to the depth the plane gains when it stands up. */}
              <text className="fl-name" x={item.seat[0]} y={item.span.back[1] - 22} textAnchor="middle">
                {item.label}
              </text>
              <rect
                className="fl-hit"
                x={item.seat[0] - 130}
                y={item.span.back[1] - 40}
                width="260"
                height={item.span.front[1] - item.span.back[1] + 90}
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

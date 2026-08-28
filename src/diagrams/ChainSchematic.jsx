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
const H = 400
const CX = 600
const CY = 232

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


/* -- WHAT STANDS ON EACH PLANE -------------------------------------------

   THESE ARE BUILT FROM THE PRODUCT'S OWN RECORD, NOT FROM AN ICON SET.

   The replay chain in the demo says exactly what each step does, and the counts
   in it are real: a protocol locks at v2.1 with 36 criteria; an evidence
   snapshot freezes 1,284 resources with 25 of 36 mapped; screening returns one
   pass, four review and three fail; resolve closes a conflict with a PI
   signature; replay seals a chain of nine events. So every emblem is that
   sentence built as a solid, and the proportions in them are those numbers
   rather than shapes chosen because they balanced.

   THEY ALSO HAD TO NOT BE TRIDENT OR NECTAR. Those two are stacked round decks
   and districts of scattered blocks, so this sheet uses a different vocabulary
   entirely: BLADES stood on edge, a SHEET cutting across at a height, open
   BINS at unequal fill, a notched SEAL, and a closed RING. Nothing here is a
   deck and nothing is a drum.

   EVERY PART IS PLACED RELATIVE TO ITS OWN STEP. The first pass built them all
   against the plan origin, which is the middle of the row - so four of the five
   emblems were drawn on top of the third one and the other four planes came out
   bare. An emblem belongs to a plane, so it is solved from that plane's seat.

   A solid's top face sits where it is drawn and its skirt hangs down, so
   standing something ON the plane means placing its face one height above it.
   That is what `stand` does, which is why no table below carries an offset
   anybody had to work out by hand. */

function emblem(key, t) {
  const stand = (px, py, hx, hy, high, radius = 3) => {
    const [sx, sy] = PLAN(t + px, -t + py)
    return { depth: px + py, shape: roundedSlab(sx, sy - high, hx, hy, high, radius) }
  }

  const parts = {
    // 36 criteria, and one version locked across all of them.
    protocol: () => [
      ...Array.from({ length: 8 }, (_, i) =>
        stand(-46 + i * 13, -8, 2.8, 11, 11 + Math.round(jitter(i, 5) * 17), 1.4)),
      stand(-1, -8, 52, 2.6, 24, 1.4),
    ],
    // Resources at every depth, and one as-of plane frozen across them. A few
    // stand proud of it, because not every criterion is mapped when it closes.
    evidence: () => [
      ...Array.from({ length: 11 }, (_, i) => {
        const a = jitter(i, 11)
        const b = jitter(i, 29)
        return stand(-42 + a * 84, -22 + b * 44, 3.2, 3.2, 6 + Math.round(jitter(i, 43) * 20), 1.4)
      }),
      stand(0, 0, 47, 24, 15, 3),
    ],
    // One cohort, sorted three ways, and the three are not the same size:
    // one pass, four review, three fail.
    screening: () => [
      stand(0, -26, 42, 2.6, 30, 1.4),
      stand(-26, 6, 10, 11, 8, 1.8),
      stand(0, 6, 10, 11, 26, 1.8),
      stand(26, 6, 10, 11, 20, 1.8),
    ],
    // Two readings that disagree, and one signature that settles it.
    resolve: () => [
      stand(-36, -13, 4, 10, 24, 1.4),
      stand(-36, 13, 4, 10, 13, 1.4),
      stand(-13, 0, 18, 2.4, 9, 1.4),
      stand(22, 0, 13, 13, 17, 2.4),
      stand(22, 0, 6, 6, 25, 1.6),
    ],
    // Nine events, linked, closing back on where they started.
    replay: () => {
      const ring = [[-38, -17], [-13, -24], [13, -24], [38, -17], [38, 17], [13, 24], [-13, 24], [-38, 17]]
      return [
        ...ring.map(([px, py], i) => stand(px, py, 4.6, 4.6, i === 0 ? 21 : 9, 1.6)),
        ...ring.map(([px, py], i) => {
          const [qx, qy] = ring[(i + 1) % ring.length]
          return stand((px + qx) / 2, (py + qy) / 2, Math.max(2.2, Math.abs(qx - px) / 2), Math.max(2.2, Math.abs(qy - py) / 2), 4, 1.2)
        }),
      ]
    },
  }

  // Back to front, or an emblem is a pile rather than an object.
  return parts[key]().sort((a, b) => a.depth - b.depth)
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
      const reach = 210 + jitter(seed, 37) * 300
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
        driftX: Math.round(Math.cos(spin) * reach),
        driftY: Math.round(-46 - jitter(seed, 53) * 168 + Math.sin(spin) * 60),
        swayX: Math.round(Math.cos(spin) * reach + (jitter(seed, 97) - 0.5) * 46),
        swayY: Math.round(-46 - jitter(seed, 53) * 168 + Math.sin(spin) * 60 + (jitter(seed, 103) - 0.5) * 40),
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
  return { ...step, index, tiles, seat, emblem: emblem(step.key, t), span: roundedSlab(seat[0], seat[1], (COLS * CELL) / 2, (ROWS * CELL) / 2, 1, 10) }
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
                  <Faces shape={part.shape} className="dgm-solid" key={`${item.key}-e${n}`} />
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

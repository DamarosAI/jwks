import { useState } from 'react'

import { jitter, planSpace, project, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * THE FIVE STEPS, AND THE MESS THAT KEEPS ARRIVING AT THEM.
 *
 * What was here was twenty-eight identical plates assembling into a rectangle.
 * The assembly read well and the rectangle meant nothing: twenty-eight is not a
 * number about this business, a rectangle is not a shape it makes, and a plate
 * with nothing on it is a plate nobody has a reason to look at. It was a
 * beautiful animation of an abstraction.
 *
 * The five steps ARE the product - Protocol, Evidence, Screening, Resolve,
 * Replay, in that order, per ADR-0001 - so they are what the figure resolves
 * into. Order carries real information here, which is the one condition under
 * which a sequence is allowed to be drawn as one.
 *
 * WHAT LOOPS IS THE MESS, NOT THE STEPS.
 *
 * The steps are always there, always solid, always legible. What cycles is the
 * scatter: fragments fade in off-axis, travel, and are absorbed into the step
 * they belong to - then a pulse runs the length of the row confirming the five
 * are one run, and it happens again. That is the honest shape of the claim.
 * Work does not arrive once and get tidied; it keeps arriving, and the system
 * keeps taking it. A figure whose subject disappears for half its own loop is
 * also a figure that is unreadable to half the people who see it.
 *
 * NO WAKE. The charge used to leave a tint behind it, which meant the deck
 * ended every cycle a different colour from the one it started in and the
 * front was hard to find. It is a short pulse now: each step lights, hands on,
 * and returns. Five quick beats down the row.
 *
 * THE POINTER IS THE POINT. Every step lifts under the cursor and says what it
 * does in the readout underneath. That is the whole reason the tiles are five
 * named things instead of twenty-eight anonymous ones - there is now something
 * to be curious about, and somewhere for the curiosity to go.
 */

const W = 1200
/* The frame is cut to what the drawing needs: room above the row for the mess
   arriving into it, and only the depth of a tile below. A viewBox with a
   hundred and seventy empty units under the subject is a hundred and seventy
   units of the section's height spent on nothing. */
const H = 380
const CX = 600
const CY = 268

/* THE ROW RUNS ALONG THE HORIZONTAL AXIS OF THE ISOMETRIC, NOT DOWN IT.
 *
 * Stepping the row along plan x alone sends it down and to the right, which
 * costs twice: each step's label lands exactly where the next step's tile is,
 * and the composition becomes a long diagonal with two empty corners.
 *
 * Stepping (+t, -t) instead moves along the one ground direction that projects
 * flat - screen y is (x + y) times a constant, so equal and opposite is zero -
 * and the row comes out horizontal while every tile stays a properly projected
 * solid. It is still isometric; it is just the axis that suits a wide frame and
 * a reading order. */
/* THE PACKING IS SOLVED, NOT EYEBALLED.
 *
 * A plan square of half H projects to a top face 3.464H wide on screen, and a
 * row stepped by (+t, -t) advances 1.732t. So the tiles overlap unless
 * t > 2H - which the first pass did not satisfy, and five tiles ran into each
 * other exactly the way the old figure did. At 142 against a half of 64 there
 * are twenty-four pixels of daylight between each pair, and the five of them
 * come to a shade over eleven hundred: a row that fills a twelve hundred frame
 * without touching its edges. */
const STEP = 142
const HALF = 64
const PLAN = project(CX, CY)

/* THE FIVE, IN ORDER. The order is the argument - one piece of work passing
   through five places, in sequence - so it is drawn as a row and lettered, and
   the lettering is the one place this figure spends words. */

const STEPS = [
  {
    key: 'protocol',
    label: 'PROTOCOL',
    motif: 'rules',
    read: 'The study arrives as something that executes, with its criteria as logic rather than prose.',
  },
  {
    key: 'evidence',
    label: 'EVIDENCE',
    motif: 'cells',
    read: 'Site records bind to the criteria that need them, and stay where they already are.',
  },
  {
    key: 'screening',
    label: 'SCREENING',
    motif: 'sift',
    read: 'Deterministic. The same protocol against the same evidence reaches the same result.',
  },
  {
    key: 'resolve',
    label: 'RESOLVE',
    motif: 'fork',
    read: 'Where the answer needs judgement, a named person makes the call and signs it.',
  },
  {
    key: 'replay',
    label: 'REPLAY',
    motif: 'loop',
    read: 'Any decision reconstructs cold: protocol version, evidence as of then, and who decided.',
  },
].map((step, index) => {
  const t = (index - 2) * STEP
  const [sx, sy] = PLAN(t, -t)
  return {
    ...step,
    index,
    screen: [sx, sy],
    shape: roundedSlab(sx, sy, HALF, HALF, 13, 15),
    // Where the charge reaches it. A real position down the row rather than an
    // index, so the pulse crosses at a constant speed.
    wave: Math.round((index / 4) * 100) / 100,
  }
})

/* WHAT EACH STEP HOLDS.

   Five marks, drawn in the tile's own plan space so they lie ON the surface
   rather than over it - and each one is the shape of the thing it names rather
   than a picture of it. A protocol is ruled lines. Evidence is a field of
   records. Screening is a sort: many in, few through. Resolve is two readings
   meeting at one decision. Replay is a closed circuit back to the start.

   None of them is a logo and none is an icon set. They are the smallest marks
   that make five blank plates into five different things. */

const MOTIFS = {
  rules: [
    <rect className="fl-ring" key="sheet" x={-46} y={-52} width="92" height="104" rx="12" />,
    ...[-28, -8, 12].map((y) => <rect className="fl-mark" key={y} x={-30} y={y - 3} width="60" height="6" rx="3" />),
    <rect className="fl-mark is-set" key="seal" x={-30} y={30} width="26" height="8" rx="4" />,
  ],
  cells: [-28, 0, 28].flatMap((y) => [-28, 0, 28].map((x) => (
    <rect className={`fl-mark${(x + y) % 56 === 0 ? ' is-set' : ''}`} key={`${x}:${y}`} x={x - 11} y={y - 11} width="22" height="22" rx="5" />
  ))),
  sift: [
    ...[-46, -24, -2].map((y, i) => (
      <rect className="fl-mark" key={y} x={-(50 - i * 16)} y={y - 4} width={(50 - i * 16) * 2} height="8" rx="4" />
    )),
    <path className="fl-line" key="throat" d="M -18 12 L 0 30 L 18 12" />,
    <rect className="fl-mark is-set" key="out" x={-11} y={36} width="22" height="22" rx="6" />,
  ],
  fork: [
    <path className="fl-line" key="a" d="M -44 -34 L 0 4" />,
    <path className="fl-line" key="b" d="M 44 -34 L 0 4" />,
    <rect className="fl-mark is-set" key="seal" x={-13} y={10} width="26" height="26" rx="6" />,
  ],
  loop: [
    <rect className="fl-ring" key="outer" x={-44} y={-38} width="88" height="76" rx="20" />,
    <rect className="fl-ring" key="inner" x={-24} y={-20} width="48" height="40" rx="12" />,
    <rect className="fl-mark is-set" key="head" x={-38} y={-6} width="12" height="12" rx="3" />,
  ],
}

/* THE MESS THAT KEEPS ARRIVING.

   Six fragments per step, off every axis, fading in at a scatter and travelling
   into the step that will absorb them. They are the same house slab at a
   fraction of the size, because what arrives is not a different KIND of thing
   from what it becomes - it is the same work, unplaced.

   They are absorbed rather than parked: each one shrinks into the tile and goes
   out as it lands. Nothing accumulates, because the claim is not that the steps
   collect things, it is that they resolve them. */

const SHARDS = STEPS.flatMap((step) =>
  Array.from({ length: 6 }, (_, n) => {
    const seed = step.index * 7 + n
    const spin = jitter(seed, 13) * Math.PI * 2
    const reach = 190 + jitter(seed, 29) * 260
    const size = 20 + Math.round(jitter(seed, 41) * 16)
    return {
      key: `${step.key}-${n}`,
      step: step.key,
      // Built AT the step it belongs to, so its resting place is exact and the
      // scatter is an offset from it. The same reason the plates were built
      // seated: one object in two places, not two pretending to be one.
      shape: roundedSlab(step.screen[0], step.screen[1], size, size, 6, 6),
      driftX: Math.round(Math.cos(spin) * reach),
      driftY: Math.round(-40 - jitter(seed, 53) * 150 + Math.sin(spin) * 58),
      // Staggered arrival, so six fragments land as six events rather than one.
      lag: Math.round(jitter(seed, 67) * 100) / 100,
    }
  }),
)

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
          aria-label="Five surfaces in a row, seen in axonometric projection and lettered Protocol, Evidence, Screening, Resolve and Replay. Each carries a mark for the work it does: ruled lines, a field of records, a sort that narrows, two readings meeting at one signed decision, and a closed circuit back to the start. Fragments fade in off-axis around them, travel, and are absorbed into the step they belong to, after which a pulse runs the length of the row from Protocol to Replay. The sequence repeats."
        >
          <defs>
            <pattern id="fl-grain" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
          </defs>

          {/* The mess, under the steps, so a fragment passes BEHIND the thing
              that is about to absorb it rather than over its face. */}
          <g className="fl-mess">
            {SHARDS.map((shard) => (
              <g
                className="fl-shard"
                key={shard.key}
                style={{ '--drift-x': `${shard.driftX}px`, '--drift-y': `${shard.driftY}px`, '--lag': shard.lag }}
              >
                <Faces shape={shard.shape} className="dgm-solid" />
              </g>
            ))}
          </g>

          <g className="fl-row">
            {STEPS.map((item) => (
              <g
                className={`fl-step${hot === item.key ? ' is-hot' : ''}`}
                key={item.key}
                style={{ '--wave': item.wave, '--order': item.index }}
                onMouseEnter={() => setHot(item.key)}
                onMouseLeave={() => setHot((current) => (current === item.key ? null : current))}
                onFocus={() => setHot(item.key)}
                onBlur={() => setHot(null)}
                tabIndex={0}
                role="button"
                aria-label={`${item.label} - ${item.read}`}
              >
                <g className="fl-tile">
                  <Faces shape={item.shape} className="dgm-solid" />
                  <polygon className="fl-grain" points={item.shape.top} fill="url(#fl-grain)" />
                  <polygon className="fl-lit" points={item.shape.top} />
                  {/* Scaled inside the tile's own plan space, so a mark keeps
                      its proportions and its projection while fitting the plate
                      it lies on. */}
                  <g className="fl-motif" transform={`${planSpace(item.screen[0], item.screen[1])} scale(0.74)`}>
                    {MOTIFS[item.motif]}
                  </g>
                </g>
                {/* Above the tile, at its back corner, because the space under
                    a tile in a row like this belongs to the tile's own skirt
                    and the space beside it belongs to its neighbour. Above it
                    there is nothing at all. */}
                <text className="fl-name" x={item.screen[0]} y={item.shape.back[1] - 18} textAnchor="middle">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* The readout is prose in the document rather than type inside the
          drawing: it holds its size while the figure scales, a screen reader
          gets it as text, and it is where the curiosity a hover creates has
          somewhere to go. */}
      <figcaption className={`fl-readout${step ? ' is-hot' : ''}`} aria-live="polite">
        <span className="fl-readpill">{step ? step.label : 'FIVE STEPS'}</span>
        <span className="fl-readline">
          {step ? step.read : 'One protocol, executed the same way at every site, and reconstructable end to end.'}
        </span>
      </figcaption>
    </figure>
  )
}

import { jitter, project, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'

/**
 * ONE SURFACE, ASSEMBLING. On a loop, forever, whether anybody scrolls or not.
 *
 * WHAT WAS HERE BEFORE, AND WHY IT WENT.
 *
 * A landscape: three district plates with towers on one, a tiered drum and a
 * field of blocks on the next, cylinders on the third, and a straight conduit
 * joining them - flown over by a camera scrubbed off a pinned scroll.
 *
 * Every one of those was a thing added to explain the last thing. The drum
 * needed a district to stand in; the district needed buildings so it was not
 * empty; the buildings needed a road so they were not unrelated; and the road
 * needed a camera to be worth looking at. That is how a diagram turns into a
 * toy town - not by one bad decision but by nine reasonable ones - and no
 * amount of ink discipline saves a drawing whose subject is a model village.
 *
 * WHAT IT DRAWS NOW, AND IT IS ONE THING.
 *
 * Twenty-eight plates. Scattered - at no shared height, on no shared axis,
 * every one of them a perfectly good surface and not one of them level with the
 * next. Then they sort, travel, and set down flush into a single continuous
 * deck. A run crosses the whole of it end to end, which is only possible
 * because it is now one surface. Then it comes apart and does it again.
 *
 * That is the thesis with nothing else in the frame: research is not short of
 * surfaces, it is short of ONE. The figure has a single primitive - the house
 * slab, the same solid Trident stacks and Nectar stands things on - repeated,
 * and it earns its whole effect from where those slabs are rather than from
 * what else got put on top of them.
 *
 * IT RUNS ON ITS OWN CLOCK.
 *
 * No pin, no scrub, no scroll. The section is an ordinary section again. Tying
 * this to scroll meant it only ever played at the rate a reader happened to
 * turn a wheel, and on a live page where the pin misbehaved it did not play at
 * all. A mechanism that needs to be operated to be seen working is not a
 * mechanism a visitor sees working. Trident and Nectar both run unattended;
 * this now does too, and it is the only one of the three whose entire content
 * is a single continuous move.
 *
 * The whole cycle is CSS. One keyframe set, one duration, and a per-plate lag
 * baked into `animation-delay` - so twenty-eight solids converge as a flock
 * rather than in lockstep, and the assembled state is held long enough that
 * every one of them is home at the same time in the middle of it.
 */

const W = 1200
const H = 700
const CX = 600
const CY = 430

// The deck. Seven by four, because a rectangle wide enough to need crossing is
// what makes the run across it mean anything - and because an odd count on the
// long axis gives the run a middle plate to pass over rather than a seam.
const COLS = 7
const ROWS = 4
// FLUSH, AND THIN. Pitch equal to the full plate width, so the seated plates
// touch on every edge instead of leaving a gap - and thin, because the skirt is
// what shows between two solids standing side by side. A thick slab in a grid
// puts a wall between every plate and its neighbour, which is precisely the
// overlapping-boxes mess this figure was built to get away from. At six units
// the seam is a line rather than a wall, and twenty-eight of them read as one
// paved surface.
const PITCH = 128
const HALF = 64
const PLAN = project(CX, CY)

/**
 * A plate: where it belongs, and where it is when it does not belong anywhere.
 *
 * The geometry is built ONCE, at the seated position, so the assembled deck is
 * a true plan grid with no accumulated error in it - every seam lands on every
 * other seam. Scatter is an offset from that, applied as a transform, which is
 * why a plate is the same object in both states rather than two objects
 * pretending to be one. It is also why the whole cycle is a compositor move:
 * nothing is recomputed on any frame of it.
 */
const PLATES = Array.from({ length: COLS * ROWS }, (_, index) => {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  const px = (col - (COLS - 1) / 2) * PITCH
  const py = (row - (ROWS - 1) / 2) * PITCH
  const [sx, sy] = PLAN(px, py)

  // Thickness varies a little, so the seated deck has relief in it rather than
  // reading as one flat sheet somebody scored into squares.
  const thick = 7 + Math.round(jitter(index, 7) * 4)

  // WHERE IT IS WHEN IT IS NOT PART OF ANYTHING. Spread wide and mostly HIGH:
  // held above where it belongs is the honest picture, because none of these
  // systems is missing - every one of them exists and works, at its own level,
  // answering to nobody else's.
  const spin = jitter(index, 19) * Math.PI * 2
  const reach = 210 + jitter(index, 31) * 330
  return {
    key: `p${index}`,
    index,
    // Depth order, so a nearer plate occludes the one behind it. Twenty-eight
    // slabs in list order is a pile; in plan order it is a floor.
    depth: px + py,
    shape: roundedSlab(sx, sy, HALF, HALF, thick, 12),
    driftX: Math.round(Math.cos(spin) * reach),
    driftY: Math.round(-52 - jitter(index, 43) * 178 + Math.sin(spin) * 64),
    // Further out reads smaller, which is the only depth cue a parallel
    // projection will give for free.
    scale: Math.round((0.52 + jitter(index, 53) * 0.34) * 100) / 100,
    // Its place in the flock. Plates near the middle of the deck settle first
    // and leave last, so the surface grows outward from its centre and retreats
    // back into it rather than sweeping across like a wipe.
    lag: Math.round((Math.abs(px) / (PITCH * 3) * 0.6 + Math.abs(py) / (PITCH * 2) * 0.4) * 100) / 100,
    life: jitter(index, 61),
  }
}).sort((a, b) => a.depth - b.depth)

// THE RUN. One path down the long axis of the seated deck, and it exists for
// the same reason the deck does: a signal that crosses the whole thing is the
// only proof that the whole thing is one thing. It is drawn from plan
// coordinates like everything else, so it lies ON the surface rather than over
// it, and it is the single blue mark in the figure.
const RUN_FROM = PLAN(-(COLS - 1) / 2 * PITCH - 40, -(ROWS - 1) / 2 * PITCH + 18)
const RUN_TO = PLAN((COLS - 1) / 2 * PITCH + 40, (ROWS - 1) / 2 * PITCH - 18)
const RUN_MID = PLAN(0, 0)
const RUN = `M ${RUN_FROM[0]} ${RUN_FROM[1]} Q ${RUN_MID[0]} ${RUN_MID[1] - 26} ${RUN_TO[0]} ${RUN_TO[1]}`

export default function ChainSchematic({ animate = true }) {
  const frame = useCenterOnOverflow()

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor${animate ? ' is-live' : ''}`}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Twenty-eight surfaces seen in axonometric projection, scattered in the air at no shared height and on no shared axis. They sort, travel and set down flush into one continuous deck, and a single run then crosses the whole of it from one end to the other - which is only possible because it has become one surface. The sequence comes apart and repeats."
        >
          <defs>
            <pattern id="fl-grain" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
          </defs>

          {/* The plates. Back to front, on one clock, each a little behind the
              one inside it. */}
          <g className="fl-deck">
            {PLATES.map((plate) => (
              <g
                className="fl-plate"
                key={plate.key}
                style={{
                  '--drift-x': `${plate.driftX}px`,
                  '--drift-y': `${plate.driftY}px`,
                  '--loose': plate.scale,
                  '--lag': plate.lag,
                  '--life': plate.life,
                }}
              >
                <Faces shape={plate.shape} className="dgm-solid" />
                <polygon className="fl-grain" points={plate.shape.top} fill="url(#fl-grain)" />
              </g>
            ))}
          </g>

          {/* The run, and it only exists while there is one surface to run on. */}
          <g className="fl-run">
            <path className="fl-run-live" d={RUN} pathLength="100" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
      </div>
    </figure>
  )
}

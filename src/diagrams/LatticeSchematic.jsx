import { useState } from 'react'

import { jitter } from './iso'
import { useScrollRun } from './useScrollPhase'

/**
 * The lattice - the surface trial execution runs on, torn, and closing.
 *
 * THIS SHEET IS NOT DRAWN IN THE OTHER TWO FIGURES' LANGUAGE, ON PURPOSE.
 *
 * Trident and Nectar are axonometric: a parallel projection with no vanishing
 * point, solids with three shaded faces, everything the same size wherever it
 * stands. That is exactly right for an instrument you look AT, and three
 * attempts at this section proved it is exactly wrong for a place you are
 * supposed to be INSIDE. A parallel projection has no depth axis to travel
 * along, so every version came out as objects arranged on a tray - and no
 * amount of staggering objects on a tray makes a tray into a space.
 *
 * So this one is drawn in perspective. It has a horizon, it converges, it is
 * denser and fainter with distance, and it runs off three sides of the sheet
 * because a surface that stops inside the frame is a diagram of a surface. None
 * of the shared solid vocabulary appears anywhere in it: no shaded faces, no
 * plan projection, no extruded solids. What it keeps is the house blue, the dot
 * grain and the one-ink rule, because those are the brand and the rest was only
 * ever a habit.
 *
 * WHAT IT DRAWS. One lattice, and it is BROKEN. Whole clusters of cells are
 * missing, their edges left ragged, and the pieces that came out of them drift
 * above the holes. That is the sentence beside it, drawn: research runs on
 * ground that was never one surface, and every gap in it is a person carrying
 * something across.
 *
 * Three anchors stand on the lattice at three depths - a sponsor at the far
 * end, the site in the middle, the patient near - and they are three sizes
 * because they are three distances, which perspective gives for nothing.
 *
 * THE RUN CLOSES IT, AND IT CLOSES TOWARD THE READER. The far band repairs
 * first, then the middle, then the near - so the fix arrives out of the horizon
 * and comes at you, which is the one direction a perspective grid can make
 * something feel like it is approaching. Shards drop back into their holes,
 * edges knit, the anchors light, and a signal finally runs the whole length of
 * the surface from the far anchor to the near one.
 *
 * Nothing on it is lettered. What a reader wants named they point at, and the
 * caption underneath answers in one line.
 */

const W = 900
const H = 560

// The camera. `K` is focal length times camera height, which is the only number
// that matters in a one-point projection of a ground plane: screen height above
// the horizon is K over distance, and screen width is that times how far off
// the centre line a point is. Everything else here falls out of it.
const CX = 450
const HORIZON = 130
const K = 1330
const SPREAD = 0.82

// Near and far edges of the drawn surface, in camera distances. The near rows
// are wide enough to run off both sides of the sheet - deliberately, because a
// surface that stops inside the frame is a picture of a surface rather than one
// the reader is standing on.
// Rows are ground distances, so their SCREEN spacing is K over distance and the
// nearest band is always the tallest - that is what perspective is. The first
// pass put the camera so close that the front row was a third of the sheet, and
// the fix is not to cheat the projection but to stand further back and cut the
// surface finer: twenty-seven bands from three-and-a-bit out to twenty, which
// puts the front row at about eighty pixels instead of a hundred and eighty.
const NEAR = 3.2
const FAR = 20
const ROWS = 28
const COLS = 25

const round = (value) => Math.round(value * 10) / 10

const depthOf = (row) => NEAR + ((FAR - NEAR) * row) / (ROWS - 1)
const lateralOf = (col) => -2 + (4 * col) / (COLS - 1)

/** A lattice point, projected. `row` counts away from the reader. */
function at(col, row) {
  const scale = K / depthOf(row)
  return [round(CX + lateralOf(col) * scale * SPREAD), round(HORIZON + scale)]
}

/**
 * The same point, `high` world units off the ground.
 *
 * Camera height is already baked into K, so raising a point is simply taking it
 * out again: a thing at height h projects at (K - h) over distance, and its
 * lateral position does not change at all. That one line is what lets this
 * sheet carry real buildings rather than markers - and it is why they get their
 * size from where they stand for nothing, which is the whole reason the figure
 * changed projection.
 */
function up(col, row, high) {
  const w = depthOf(row)
  return [round(CX + lateralOf(col) * (K / w) * SPREAD), round(HORIZON + (K - high) / w)]
}

/** A lateral position that is not on a column line, for things placed freely. */
function atU(u, w, high = 0) {
  return [round(CX + u * (K / w) * SPREAD), round(HORIZON + (K - high) / w)]
}

const quad = (points) => points.map(([x, y]) => `${x},${y}`).join(' ')

/**
 * A block standing on the lattice, in perspective.
 *
 * Placed by where it stands in the world - lateral position and distance -
 * rather than by which lattice cell it happens to sit on. Cells are a texture
 * on the ground; a city is not laid out on them.
 *
 * Four ground corners and the same four raised, drawn as the two lateral faces,
 * then the near face, then the roof. Nothing is hidden by hand: an opaque near
 * face covers the far one, and the roof covers the tops of all of them, which
 * is what a solid does. `high` is a WORLD height, so the same building is
 * shorter on screen the further back it stands.
 */
function block(u, w, du, dw, high) {
  const g = [atU(u - du, w - dw), atU(u + du, w - dw), atU(u + du, w + dw), atU(u - du, w + dw)]
  const t = [
    atU(u - du, w - dw, high), atU(u + du, w - dw, high),
    atU(u + du, w + dw, high), atU(u - du, w + dw, high),
  ]
  return {
    foot: quad(g),
    roof: quad(t),
    near: quad([g[0], g[1], t[1], t[0]]),
    left: quad([g[0], g[3], t[3], t[0]]),
    right: quad([g[1], g[2], t[2], t[1]]),
  }
}

const GRID = Array.from({ length: ROWS }, (_, row) => Array.from({ length: COLS }, (_, col) => at(col, row)))

// Three bands of the surface, far to near, and the constituency standing in
// each. The repair runs in this order, which is also out of the horizon and
// toward the reader - the one direction a perspective grid can make something
// feel like it is coming at you.
const BANDS = [
  {
    key: 'sponsors',
    from: 18,
    to: ROWS - 2,
    pill: 'SPONSORS',
    before: 'A protocol leaves a sponsor as a document. Every site rebuilds it by hand, differently.',
    after: 'One versioned protocol, executed the same way at every site, with its evidence attached.',
  },
  {
    key: 'sites',
    from: 9,
    to: 17,
    pill: 'SITES',
    before: 'Twenty-odd systems, none built for research, and a person carrying work between them.',
    after: 'Governed agents on ground the site controls. Records stay put; decisions are signed there.',
  },
  {
    key: 'patients',
    from: 0,
    to: 8,
    pill: 'PATIENTS',
    before: 'Whether a patient can join a trial depends on the building they can reach that week.',
    after: 'Participation stops depending on geography. The trial runs where care already happens.',
  },
]

const BY_BAND = Object.fromEntries(BANDS.map((band) => [band.key, band]))
const bandOf = (row) => BANDS.find((band) => row >= band.from && row <= band.to) ?? BANDS[0]

/**
 * WHAT STANDS ON THE SURFACE.
 *
 * The first perspective pass drew the lattice and three markers on it, and it
 * was an empty floor with three pins in it - a wireframe placeholder rather
 * than a figure. A projection change fixes depth; it does not put anything in
 * the frame worth looking at, and this is what does.
 *
 * Three populations, three silhouettes, and nothing is lettered: sponsors are
 * tall slender towers at the far end, the site is a dense low works in the
 * middle, patients are small round pods near. A reader tells them apart by
 * shape and by where they stand, which is the same rule the sheet has always
 * run on - it is only the projection underneath that changed.
 *
 * Every one is a WORLD height rather than a screen height, so a tower at the
 * horizon is genuinely shorter on the page than a pod at your feet. That is the
 * cue three axonometric versions of this figure had to fake by hand and never
 * convincingly; here it is arithmetic.
 */
const TOWERS = [
  [-1.42, 17.4, 1180], [-1.05, 15.2, 940], [-0.72, 18.1, 1420], [-0.34, 14.6, 1060],
  [0.02, 16.8, 1320], [0.36, 14.1, 880], [0.71, 17.2, 1180], [1.04, 15.0, 1020],
  [1.38, 18.0, 1300], [-0.9, 12.9, 820], [0.58, 12.6, 900], [1.24, 13.2, 760],
].map(([u, w, high], index) => ({
  key: `t${index}`, band: 'sponsors', w, kind: 'tower', ...block(u, w, 0.115, 0.42, high),
}))

const WORKS = [
  [-1.34, 9.4, 620], [-0.98, 10.6, 480], [-0.62, 8.8, 700], [-0.3, 10.2, 430],
  [0.42, 9.1, 640], [0.78, 10.5, 470], [1.12, 8.6, 720], [1.42, 10.1, 520],
  [-1.1, 7.6, 400], [1.0, 7.3, 440],
].map(([u, w, high], index) => ({
  key: `w${index}`, band: 'sites', w, kind: 'works', ...block(u, w, 0.17, 0.4, high),
}))

const PODS = [
  [-1.44, 4], [-0.92, 3.5], [-0.46, 4.7], [0.1, 3.7], [0.62, 4.4], [1.16, 3.6],
  [-1.18, 5.6], [0.34, 5.7], [1.38, 5.2], [-0.2, 6.4], [0.9, 6.2],
].map(([u, w]) => [u, w, 0.072, 190]).map(([u, w, r, high], index) => {
  const rx = round(r * (K / w) * SPREAD)
  return {
    key: `p${index}`,
    band: 'patients',
    w,
    kind: 'pod',
    rx,
    // A circle lying on the ground is very flat from a low camera. A quarter is
    // slightly rounder than the exact foreshortening and is what keeps a pod
    // legible as a solid rather than as a line.
    ry: round(rx * 0.26),
    base: atU(u, w),
    cap: atU(u, w, high),
  }
})

// THE DRUM, in this sheet's terms. The monogram is two stacked forms, so the
// mark is two stacked drums standing at the middle of the site works - the one
// round thing in a district of blocks, at the middle distance, with the run
// passing through it. In scale with what it stands among: a mark that dwarfs
// the city it is in is a logo dropped on a drawing, which is exactly what the
// first attempt at it looked like.
const DRUM_W = 7.9
const DRUM_U = 0.04
const DRUM_R = 0.2
const DRUM_RX = round(DRUM_R * (K / DRUM_W) * SPREAD)
const DRUM = {
  rx: DRUM_RX,
  ry: round(DRUM_RX * 0.26),
  base: atU(DRUM_U, DRUM_W),
  waist: atU(DRUM_U, DRUM_W, 620),
  cap: atU(DRUM_U, DRUM_W, 1080),
}

// Back to front, so a nearer solid occludes the one behind it. Twenty-eight
// buildings in list order is a pile; in depth order it is a skyline.
const BUILT = [...TOWERS, ...WORKS].sort((a, b) => b.w - a.w)

/**
 * Where the surface has failed.
 *
 * Two octaves of the same stable hash the other figures scatter with: a fine
 * one for the edge of a hole and a coarse one three cells wide for its body.
 * One octave gives speckle, which reads as a texture and not as damage - what a
 * broken surface looks like is a few large holes with ragged edges, and the
 * coarse term is what clusters the fine one into them.
 */
function torn(col, row) {
  const fine = jitter(col * 3 + row * 5, 11)
  const coarse = jitter(Math.floor(col / 4) * 4 + Math.floor(row / 4) * 9, 23)
  return coarse * 0.7 + fine * 0.3 > 0.57
}

const CELLS = []
for (let row = 0; row < ROWS - 1; row += 1) {
  for (let col = 0; col < COLS - 1; col += 1) {
    const gone = torn(col, row)
    const band = bandOf(row)
    const [ax, ay] = GRID[row][col]
    const [bx, by] = GRID[row][col + 1]
    const [cx2, cy2] = GRID[row + 1][col + 1]
    const [dx, dy] = GRID[row + 1][col]
    CELLS.push({
      key: `${col}:${row}`,
      col,
      row,
      band: band.key,
      gone,
      // Aerial perspective: the far end of a surface is fainter. It is the one
      // depth cue a parallel projection cannot have at all, and here it costs
      // nothing because distance is already in the geometry.
      haze: Math.round((row / (ROWS - 2)) * 100) / 100,
      points: `${ax},${ay} ${bx},${by} ${cx2},${cy2} ${dx},${dy}`,
      // How far the piece that came out of this hole is drifting above it, and
      // how far it has to fall back. Scaled by the cell's own distance, so a
      // near shard lifts further than a far one - which is what perspective
      // does to equal heights and what makes the drift read as depth.
      lift: round((K / depthOf(row)) * 0.1),
    })
  }
}

// The pieces adrift over the holes. Not every torn cell throws one - a surface
// with a shard over every gap is a surface that exploded, and this one has
// simply failed.
const SHARDS = CELLS.filter((cell) => cell.gone && jitter(cell.col * 5 + cell.row * 3, 41) > 0.68)

/**
 * The signal, once there is a surface to carry it: a run from the far anchor to
 * the near one, bent through the middle. It is drawn as one path because the
 * whole claim is that it does not stop, and it does not exist at all until
 * every band is closed.
 */
const RUN_A = atU(-0.42, 16.6)
const RUN_B = atU(-0.06, 11.4)
const RUN_C = atU(0.2, 8.2)
const RUN_D = atU(0.62, 4.6)
const RUN = `M ${RUN_A[0]} ${RUN_A[1]} Q ${RUN_B[0]} ${RUN_B[1]} ${RUN_C[0]} ${RUN_C[1]} T ${RUN_D[0]} ${RUN_D[1]}`

// `closed` is which bands have been repaired, far to near. Everything else on
// the sheet reads off it - which cells are back, which shards have fallen, which
// anchors are lit, whether the signal runs - so nothing can disagree.
const PHASES = [
  { span: 2.4, closed: [], tone: 'run', status: 'FRACTURED', read: 'Trial execution runs on ground that was never one surface. Every gap in it is a person.' },
  { span: 1.6, closed: ['sponsors'], tone: 'run', status: 'PROTOCOL', read: 'The protocol arrives as something that executes, versioned and receipted at every task.' },
  { span: 1.6, closed: ['sponsors', 'sites'], tone: 'pass', status: 'EXECUTION', read: 'The site runs it on ground it controls. Records stay put; decisions are signed there.' },
  { span: 1.6, closed: ['sponsors', 'sites', 'patients'], tone: 'pass', status: 'REACH', read: 'Participation stops depending on which building a patient can reach that week.' },
  { span: 2.6, closed: ['sponsors', 'sites', 'patients'], tone: 'valid', status: 'ONE SURFACE', read: 'Sponsors, sites and patients on one surface and one run, reconstructable end to end.' },
]

export default function LatticeSchematic({ animate = true, reduced = false }) {
  const [figure, phase, booted] = useScrollRun(PHASES, { reduced, travel: 1.4 })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]

  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')
  const shut = (key) => state.closed.includes(key)
  const whole = state.closed.length === BANDS.length

  const cue = hot ? BY_BAND[hot] : null
  const tone = cue ? (shut(cue.key) ? 'pass' : 'run') : state.tone
  const pill = cue ? cue.pill : state.status
  const read = cue ? (shut(cue.key) ? cue.after : cue.before) : state.read

  return (
    <figure className="ltc">
      <div className="ltc-frame">
        <svg
          className={`ltc-svg is-${tone}${animate ? ' is-live' : ''}${booted ? ' is-booted' : ''}${whole ? ' is-whole' : ''}`}
          ref={figure}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="A lattice seen in perspective, running from a horizon near the top of the frame to a near edge that passes off both sides and the bottom. The surface is broken: whole clusters of cells are missing, their edges left ragged, and the pieces that came out of them drift above the holes. Three anchors stand on it at three distances - a sponsor at the far end, a site in the middle, a patient near - drawn at three sizes because they are at three distances. As the figure advances the surface closes from the horizon toward the reader: the far band first, then the middle, then the near, with each shard falling back into the hole it came out of and each anchor lighting as its ground is made whole. When the last band closes, a signal runs the full length of the surface from the far anchor to the near one."
        >
          <defs>
            <pattern id="ltc-grain" width="15" height="15" patternUnits="userSpaceOnUse">
              <circle className="ltc-grain" cx="1" cy="1" r="1" />
            </pattern>
            {/* The horizon takes the surface rather than the surface stopping at
                it. Everything on the sheet is masked out into the distance, so
                the lattice thins into the paper instead of ending on a line. */}
            <linearGradient id="ltc-fade" x1="0" y1="0" x2="0" y2="1">
              <stop className="ltc-fade-far" offset="0%" />
              <stop className="ltc-fade-mid" offset="34%" />
              <stop className="ltc-fade-near" offset="100%" />
            </linearGradient>
            <mask id="ltc-air">
              <rect x="0" y={HORIZON - 30} width={W} height={H} fill="url(#ltc-fade)" />
            </mask>
          </defs>

          <rect className="ltc-sky" x="0" y="0" width={W} height={H} fill="url(#ltc-grain)" />

          <g mask="url(#ltc-air)">
            {/* THE SURFACE. Every cell is drawn or it is not there; a hole is an
                absence rather than a shape, which is what leaves its edge
                ragged without a single edge having to be drawn. */}
            <g className="ltc-deck">
              {CELLS.map((cell) => (
                <polygon
                  className={`ltc-cell${cell.gone && !shut(cell.band) ? ' is-gone' : ''}${lit(cell.band)}`}
                  key={cell.key}
                  points={cell.points}
                  style={{ '--haze': cell.haze, '--wake': Math.round((1 - cell.haze) * 100) / 100 }}
                />
              ))}
            </g>

            {/* THE PIECES THAT CAME OUT. Each one is its own cell, drawn again
                above the hole it left, and it falls back into it when the band
                closes - the same polygon returning to the same coordinates,
                which is the only way a repair reads as a repair rather than as
                something new arriving. */}
            <g className="ltc-drift">
              {SHARDS.map((cell) => (
                <polygon
                  className={`ltc-shard${shut(cell.band) ? ' is-home' : ''}${lit(cell.band)}`}
                  key={`s-${cell.key}`}
                  points={cell.points}
                  style={{ '--lift': `${cell.lift}px`, '--haze': cell.haze, '--life': jitter(cell.col + cell.row * 7, 13) }}
                />
              ))}
            </g>

            {/* THE RUN. One path, and it does not exist until the whole surface
                does - a signal crossing a torn lattice would be the drawing
                contradicting its own sentence. */}
            <g className="ltc-signal">
              <path className="ltc-signalpath" d={RUN} />
              <path className="ltc-signalrun" d={RUN} pathLength="100" />
            </g>

            {/* WHAT STANDS ON IT.

                Nothing is up until its ground is. A building rises out of the
                surface as its band closes, which makes the repair something a
                reader watches happen rather than a state they are handed - and
                it is the same move in a different projection as a solid gaining
                a dimension, which is what this figure has always done.

                Back to front, so a nearer solid occludes the one behind it. */}
            <g className="ltc-built">
              {BUILT.map((item) => (
                <g
                  className={`ltc-block is-${item.kind}${shut(item.band) ? ' is-up' : ''}${lit(item.band)}`}
                  key={item.key}
                  style={{ '--haze': Math.round(((item.w - NEAR) / (FAR - NEAR)) * 100) / 100 }}
                  {...probe(item.band)}
                >
                  <polygon className="ltc-foot" points={item.foot} />
                  <polygon className="ltc-side" points={item.left} />
                  <polygon className="ltc-side" points={item.right} />
                  <polygon className="ltc-face" points={item.near} />
                  <polygon className="ltc-roof" points={item.roof} />
                </g>
              ))}
            </g>

            {/* THE DRUM. The monogram is two stacked forms, so the mark is two
                stacked drums standing at the middle of the works - the one round
                thing in a district of blocks, with the run passing through it. */}
            <g className={`ltc-drum${shut('sites') ? ' is-up' : ''}${lit('sites')}`} {...probe('sites')}>
              <path
                className="ltc-drumwall"
                d={`M ${DRUM.base[0] - DRUM.rx} ${DRUM.base[1]} L ${DRUM.waist[0] - DRUM.rx} ${DRUM.waist[1]} A ${DRUM.rx} ${DRUM.ry} 0 0 0 ${DRUM.waist[0] + DRUM.rx} ${DRUM.waist[1]} L ${DRUM.base[0] + DRUM.rx} ${DRUM.base[1]} A ${DRUM.rx} ${DRUM.ry} 0 0 1 ${DRUM.base[0] - DRUM.rx} ${DRUM.base[1]} Z`}
              />
              <ellipse className="ltc-drumhead" cx={DRUM.waist[0]} cy={DRUM.waist[1]} rx={DRUM.rx} ry={DRUM.ry} />
              <path
                className="ltc-drumwall"
                d={`M ${DRUM.waist[0] - DRUM.rx * 0.76} ${DRUM.waist[1]} L ${DRUM.cap[0] - DRUM.rx * 0.76} ${DRUM.cap[1]} A ${DRUM.rx * 0.76} ${DRUM.ry * 0.76} 0 0 0 ${DRUM.cap[0] + DRUM.rx * 0.76} ${DRUM.cap[1]} L ${DRUM.waist[0] + DRUM.rx * 0.76} ${DRUM.waist[1]} A ${DRUM.rx * 0.76} ${DRUM.ry * 0.76} 0 0 1 ${DRUM.waist[0] - DRUM.rx * 0.76} ${DRUM.waist[1]} Z`}
              />
              <ellipse className="ltc-drumhead is-cap" cx={DRUM.cap[0]} cy={DRUM.cap[1]} rx={DRUM.rx * 0.76} ry={DRUM.ry * 0.76} />
              <ellipse className="ltc-hit" cx={DRUM.base[0]} cy={DRUM.base[1] - 20} rx={DRUM.rx * 2} ry={40} />
            </g>

            {/* The patients, nearest and roundest: small pods rather than
                blocks, because the third population has to be told from the
                other two by silhouette alone. */}
            <g className="ltc-pods">
              {PODS.map((pod) => (
                <g
                  className={`ltc-pod${shut('patients') ? ' is-up' : ''}${lit('patients')}`}
                  key={pod.key}
                  {...probe('patients')}
                >
                  <path
                    className="ltc-podwall"
                    d={`M ${pod.base[0] - pod.rx} ${pod.base[1]} L ${pod.cap[0] - pod.rx} ${pod.cap[1]} A ${pod.rx} ${pod.ry} 0 0 0 ${pod.cap[0] + pod.rx} ${pod.cap[1]} L ${pod.base[0] + pod.rx} ${pod.base[1]} A ${pod.rx} ${pod.ry} 0 0 1 ${pod.base[0] - pod.rx} ${pod.base[1]} Z`}
                  />
                  <ellipse className="ltc-podcap" cx={pod.cap[0]} cy={pod.cap[1]} rx={pod.rx} ry={pod.ry} />
                </g>
              ))}
            </g>

          </g>
        </svg>
      </div>

      {/* The readout is a caption in the document rather than type inside the
          drawing: it holds its size while the figure scales, a screen reader
          gets it as text, and the sheet is left with nothing written on it. */}
      <figcaption className={`ltc-readout is-${tone}`} aria-live="polite">
        <span className="ltc-pill">{pill}</span>
        <span className="ltc-line">{read}</span>
      </figcaption>
    </figure>
  )
}

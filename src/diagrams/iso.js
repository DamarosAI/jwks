/**
 * Axonometric helpers for the Trident and Nectar figures.
 *
 * A squashed isometric: the horizontal spread is a true 30-degree isometric,
 * the vertical spread is flattened to 0.34 so a stack of decks reads as a
 * stack rather than a tower. Everything is projected from plan coordinates,
 * so the geometry stays honest - a square deck is a square deck, and a plan
 * grid lands on the deck as a lattice instead of being faked.
 */

export const ISO_X = 0.866
export const ISO_Y = 0.34

const round = (value) => Math.round(value * 100) / 100

/** Projection onto a deck whose plan origin sits at (cx, cy) on screen. */
export function project(cx, cy) {
  return (x, y) => [round(cx + (x - y) * ISO_X), round(cy + (x + y) * ISO_Y)]
}

export function pts(list) {
  return list.map(([x, y]) => `${x},${y}`).join(' ')
}

/**
 * A plan-aligned rounded square, sampled into plan points in outline order:
 * right corner, front, left, back. Projected, that order runs clockwise on
 * screen, which is what lets a slice of it be read as a silhouette.
 *
 * Damaros rounds its edges, so the solids in these figures round theirs. The
 * radius is a plan radius carried through the projection rather than a screen
 * radius pasted on afterwards, so a corner stays the same corner at every
 * height of the stack.
 */
export function roundedPlan(half, radius, steps = 7) {
  const r = Math.max(0, Math.min(radius, half))
  const inset = half - r
  const arcs = [
    [inset, -inset, -90, 0],
    [inset, inset, 0, 90],
    [-inset, inset, 90, 180],
    [-inset, -inset, 180, 270],
  ]
  const out = []
  arcs.forEach(([ax, ay, from, to]) => {
    for (let step = 0; step <= steps; step += 1) {
      const angle = ((from + ((to - from) * step) / steps) * Math.PI) / 180
      out.push([round(ax + Math.cos(angle) * r), round(ay + Math.sin(angle) * r)])
    }
  })
  return out
}

/**
 * A rounded solid centred on screen (cx, cy): a rounded plan square extruded
 * `height` pixels straight down. Returns the top face, the two skirt faces cut
 * at the front corner, and the four extreme corners so callers can hang a
 * leader or an arc off a real edge rather than a guessed one.
 */
export function roundedDeck(cx, cy, half, height, radius) {
  const p = project(cx, cy)
  const plan = roundedPlan(half, radius)
  const ring = plan.map(([x, y]) => p(x, y))
  const pick = (score) => plan.reduce((best, point, index) => (score(point) > score(plan[best]) ? index : best), 0)
  const iRight = pick(([x, y]) => x - y)
  const iFront = pick(([x, y]) => x + y)
  const iLeft = pick(([x, y]) => y - x)
  const iBack = pick(([x, y]) => -x - y)

  const trace = (list) => list.map(([x, y]) => `${x} ${y}`).join(' L ')
  const skirt = (from, to) => {
    const face = ring.slice(from, to + 1)
    const under = face.map(([x, y]) => [x, round(y + height)])
    return `M ${trace(face)} L ${trace(under.reverse())} Z`
  }

  return {
    p,
    height,
    top: pts(ring),
    faceRight: skirt(iRight, iFront),
    faceLeft: skirt(iFront, iLeft),
    back: ring[iBack],
    right: ring[iRight],
    front: ring[iFront],
    left: ring[iLeft],
  }
}

/** The screen angle of a plan x-axis edge, for labels that run with the deck. */
export const EDGE_ANGLE = round((Math.atan2(ISO_Y, ISO_X) * 180) / Math.PI)

/**
 * The projection as an SVG transform, so ordinary primitives can be drawn in
 * plan coordinates and land correctly on a deck. This is what lets the figures
 * carry rounded corners and true circles: a `<rect rx>` drawn inside this
 * group is a rounded plan square seen in projection, not a fudged diamond.
 *
 * The matrix scales anisotropically, so anything stroked inside it needs
 * `vector-effect="non-scaling-stroke"` to keep an even hairline.
 */
export function planSpace(cx, cy) {
  return `matrix(${ISO_X}, ${ISO_Y}, ${-ISO_X}, ${ISO_Y}, ${cx}, ${cy})`
}

/**
 * A stable value in [0, 1) for an index. Both figures need scatter that reads
 * as organic - positions that are not on a grid, ambient timings that never
 * fall into step - but it has to be identical on every render and in every
 * test, so this stands in for a random source rather than calling one.
 */
export function jitter(index, salt) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return round(value - Math.floor(value))
}

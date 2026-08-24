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

const drop = (height) => ([x, y]) => [x, round(y + height)]

/**
 * A plan-aligned box: half-extents hx/hy in plan units, extruded `height`
 * screen pixels straight down. Returns the three visible faces plus the four
 * projected corners, so callers can hang leaders off a real edge.
 */
export function box(p, x, y, hx, hy, height) {
  const back = p(x - hx, y - hy)
  const right = p(x + hx, y - hy)
  const front = p(x + hx, y + hy)
  const left = p(x - hx, y + hy)
  const under = drop(height)
  return {
    back,
    right,
    front,
    left,
    top: pts([back, right, front, left]),
    faceRight: pts([right, front, under(front), under(right)]),
    faceLeft: pts([left, front, under(front), under(left)]),
  }
}

/** A deck centred on screen (cx, cy). Carries its own projection. */
export function deck(cx, cy, half, height) {
  const p = project(cx, cy)
  return { p, ...box(p, 0, 0, half, half, height) }
}

/** A flat plan square on a deck - the unit the field grids are built from. */
export function tile(p, x, y, r) {
  return pts([p(x - r, y - r), p(x + r, y - r), p(x + r, y + r), p(x - r, y + r)])
}

/** Painter's order for extruded plan grids: back of the deck first. */
export function depthSort(cells) {
  return [...cells].sort((a, b) => a[0] + a[1] - (b[0] + b[1]))
}

/** Point a fraction of the way along one of a deck's two front edges. */
export function alongFront(shape, side, t) {
  const from = side === 'left' ? shape.left : shape.right
  return [round(from[0] + (shape.front[0] - from[0]) * t), round(from[1] + (shape.front[1] - from[1]) * t)]
}

/** The screen angle of a plan x-axis edge, for labels that run with the deck. */
export const EDGE_ANGLE = round((Math.atan2(ISO_Y, ISO_X) * 180) / Math.PI)

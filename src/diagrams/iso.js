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

/**
 * A plan circle seen in this projection. The two plan axes are squashed by the
 * same pair of factors, so a circle lands as an axis-aligned ellipse rather
 * than a tilted one - which is what lets a round solid be drawn with an
 * ordinary <ellipse> and still be honest geometry rather than a decoration.
 */
export const CIRCLE_X = round(ISO_X * Math.SQRT2)
export const CIRCLE_Y = round(ISO_Y * Math.SQRT2)

export function planCircle(r) {
  return { rx: round(r * CIRCLE_X), ry: round(r * CIRCLE_Y) }
}

/**
 * A round solid centred on screen (cx, cy): a plan circle of radius `r`
 * extruded `height` pixels straight down. Returns the top ellipse, the wall
 * silhouette cut at the horizon the way a real cylinder hides its far base,
 * and `arc(dy)` for any front-edge rule the caller wants to lay along it.
 */
export function roundedCylinder(cx, cy, r, height) {
  const { rx, ry } = planCircle(r)
  const left = round(cx - rx)
  const right = round(cx + rx)
  const base = round(cy + height)
  // Left to right with sweep 0 runs through the near side of the ellipse.
  const arc = (dy) => `M ${left} ${round(cy + dy)} A ${rx} ${ry} 0 0 0 ${right} ${round(cy + dy)}`
  return {
    p: project(cx, cy),
    cx,
    cy,
    r,
    rx,
    ry,
    height,
    arc,
    wall: `${arc(0)} L ${right} ${base} A ${rx} ${ry} 0 0 1 ${left} ${base} Z`,
    left: [left, cy],
    right: [right, cy],
  }
}

/** The screen angle of a plan x-axis edge, for labels that run with the deck. */
export const EDGE_ANGLE = round((Math.atan2(ISO_Y, ISO_X) * 180) / Math.PI)

/**
 * A translation, written in plan units, that lands `depth` pixels straight down
 * the screen. Inside `planSpace` a plain y offset is not a drop - it slides
 * along a plan axis, which moves the shape sideways as well - so anything that
 * needs to be extruded downwards while it is drawn in plan has to solve for it:
 * equal steps on both plan axes cancel in x and add in y.
 *
 * This is what lets a tile, a ledger row or a shutter plinth carry a side face
 * without leaving the projection to draw it.
 */
export function planDrop(depth) {
  const step = round(depth / (2 * ISO_Y))
  return `translate(${step} ${step})`
}

/**
 * A rounded plan rectangle, sampled in the same outline order `roundedPlan`
 * samples a square: right corner, front, left, back. Same corner construction,
 * two half-sizes, so a ledger row and a field tile are one shape at two ratios.
 */
export function roundedBox(halfX, halfY, radius, steps = 5) {
  const r = Math.max(0, Math.min(radius, halfX, halfY))
  const ix = halfX - r
  const iy = halfY - r
  const arcs = [
    [ix, -iy, -90, 0],
    [ix, iy, 0, 90],
    [-ix, iy, 90, 180],
    [-ix, -iy, 180, 270],
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
 * A solid standing on a plane, built and drawn in plan coordinates: the top
 * face and the two near skirt faces, extruded `depth` pixels straight up off
 * the surface it is standing on.
 *
 * This is `roundedDeck` at object scale and inside the projection instead of
 * outside it, and it is why a field tile, a ledger row, a waiting proposal and
 * a criterion in the library are all the same object as the deck they stand on,
 * several scales down. Everything on a plane in either figure is a thing with a
 * volume; nothing is a glyph printed on the surface.
 *
 * `(cx, cy)` is where the solid stands, not where its roof is. Inside
 * `planSpace` a plain y offset is not a drop - it slides along a plan axis and
 * carries the shape sideways - so the extrusion runs equal steps on both plan
 * axes, which cancel in x and add in y. `base` is the footprint that lands
 * exactly on `(cx, cy)`; `top` is the same ring one storey up. Callers get both
 * so a solid can be drawn lying flat and then raised without its outline
 * changing shape on the way.
 */
export function planPrism(cx, cy, halfX, halfY, depth, radius) {
  const step = round(depth / (2 * ISO_Y))
  const ring = roundedBox(halfX, halfY, radius).map(([x, y]) => [round(x + cx - step), round(y + cy - step)])
  const under = ring.map(([x, y]) => [round(x + step), round(y + step)])
  const pick = (score) => ring.reduce((best, point, index) => (score(point) > score(ring[best]) ? index : best), 0)
  const iRight = pick(([x, y]) => x - y)
  const iFront = pick(([x, y]) => x + y)
  const iLeft = pick(([x, y]) => y - x)
  const trace = (list) => list.map(([x, y]) => `${x} ${y}`).join(' L ')
  const face = (from, to) => `M ${trace(ring.slice(from, to + 1))} L ${trace(under.slice(from, to + 1).reverse())} Z`
  return {
    step,
    depth,
    top: pts(ring),
    base: pts(under),
    faceRight: face(iRight, iFront),
    faceLeft: face(iFront, iLeft),
  }
}

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

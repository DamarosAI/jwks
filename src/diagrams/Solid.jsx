/**
 * A solid, in one ink: a rounded plan square and the two skirt faces under it.
 *
 * Both figures stand things on the same ground now - a Trident deck and a
 * Nectar site are the same kind of object seen at two scales - so they are
 * drawn by the same component rather than by two that drift apart. The three
 * faces carry almost the same value on purpose. A solid here is a drafted
 * object with an edge caught by the light, not a rendered one with a light
 * source: the depth comes from the projection, and shading it any harder is
 * what makes an axonometric read as a toy block.
 */
export function Faces({ shape, className }) {
  return (
    <g className={className}>
      <path className="dgm-face-left" d={shape.faceLeft} />
      <path className="dgm-face-right" d={shape.faceRight} />
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

/**
 * THE LIGHT ON A SURFACE. A flat fill is not a material: a real panel catches
 * more light along the edge nearest the source and less along the far one, and
 * that single fact is most of the difference between a drawing of a thing and a
 * thing.
 *
 * One gradient laid over a solid's top face - a wash of white along the back,
 * nothing through the middle, a breath of the surface's own ink at the front,
 * tilted off vertical because the light in an axonometric comes from wherever
 * the projection says up-and-back is. The gradient is declared HERE rather than
 * in a shared defs, so its stops resolve `--ink` against whichever deck it is
 * rendered inside: a violet tier and a green one are lit in their own colour.
 *
 * It is for the large surfaces only. A sheen on a nine-pixel contract field is
 * a gradient nobody can see costing a paint nobody asked for.
 */
export function Sheen({ shape, id }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0.14" y1="0" x2="0" y2="1">
          <stop className="dgm-sheen-back" offset="0" />
          <stop className="dgm-sheen-mid" offset="0.52" />
          <stop className="dgm-sheen-front" offset="1" />
        </linearGradient>
      </defs>
      <polygon className="dgm-sheen" points={shape.top} fill={`url(#${id})`} />
    </>
  )
}

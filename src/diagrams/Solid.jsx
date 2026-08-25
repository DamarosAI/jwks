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

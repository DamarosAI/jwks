/* THE COURIER. One small character, drawn once, working the workflow sheet.
 *
 * Clinical research has a figure who visits every site in turn and moves the
 * paperwork along - and this is them. THE BODY IS THE MARK AND NOTHING BUT
 * THE MARK: the two rounded trapezoids off the favicon, verbatim, flat and
 * solid in the house blue, with the favicon's own fat round stroke supplying
 * the plumpness. No face, no antenna, no fake depth - the whole character is
 * the silhouette everyone already knows, and the cute lives in the MOTION:
 * a jelly squash-and-stretch riding the same beat as the hover bob, and a
 * floor shadow doing the grounding (the shadow lives with the round, in the
 * figure's own markup, because it belongs to the floor and not the body).
 *
 * It has no name, and it is not getting one: it is the Damaros drum logo
 * personified a bit, and "courier" is its job on this sheet, not a
 * christening.
 *
 * The body is only the drawing. Where it flies and what it moves belong to
 * the figure that hosts it.
 */
const MARK = [
  'M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z',
  'M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z',
]

// The mark's own box (68..403 across, 74..446 down, before the fat stroke),
// for standing the character on a point.
const S = 0.048
const CX = 235.5
const TOP = 74

export function Courier({ x, y }) {
  return (
    <g className="courier">
      <g className="courier-body" transform={`translate(${Math.round((x - CX * S) * 100) / 100}, ${Math.round((y - TOP * S) * 100) / 100}) scale(${S})`}>
        {/* The whirl (one full victory spin at the end of a round) and the
            jelly each live on their own wrapper inside the placing
            transform, because a CSS animation on the placed group would
            replace the translate and scale that stand the character on
            its point - and on one shared wrapper the spin would replace
            the wobble. */}
        <g className="courier-whirl">
          <g className="courier-trunk">
            {/* The outline is the same two paths once more, one stroke
                width fatter in the ink, drawn under the blue - a subtle
                dark rim the way a printed sticker keeps its keyline. */}
            <path className="courier-line" d={MARK[0]} />
            <path className="courier-line" d={MARK[1]} />
            <path className="courier-shape" d={MARK[0]} />
            <path className="courier-shape" d={MARK[1]} />
          </g>
        </g>
      </g>
    </g>
  )
}

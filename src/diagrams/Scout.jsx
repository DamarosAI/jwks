/* THE SCOUT. One small character, drawn once, visiting all three figures.
 *
 * Clinical research has a figure who hovers over every site in turn and
 * looks at the work without touching it - the monitor - and this is them.
 * THE BODY IS THE MARK ITSELF: the two rounded trapezoids off the favicon,
 * verbatim, stood up and made someone - the upper shape is the head and it
 * carries the eyes, the lower is the body, an antenna with a breathing tip
 * light rides on top. Drawn the way the favicon draws the mark - the fat
 * rounded stroke IS the plumpness - so the character and the logo are one
 * geometry, the way the best mascots are their own wordmark.
 *
 * The body is only the drawing. Where it flies, what it does at each stop,
 * and what happens when somebody clicks it belong to the figure that hosts
 * it - the chain gives it a full round of station calls, Trident and
 * Nectar let it drift and mess about.
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

export function Scout({ x, y }) {
  return (
    <g className="scout">
      <line className="scout-antenna" x1={x} y1={y - 1.6} x2={x} y2={y - 6.4} />
      <circle className="scout-tip" cx={x} cy={y - 7.6} r="1.15" />
      <g className="scout-body" transform={`translate(${Math.round((x - CX * S) * 100) / 100}, ${Math.round((y - TOP * S) * 100) / 100}) scale(${S})`}>
        <path className="scout-shape" d={MARK[0]} />
        <path className="scout-shape" d={MARK[1]} />
        {/* The eyes, on the head, off-centre the way the cells wear their
            nuclei - the sheet's own way of saying alive. */}
        <circle className="scout-eye" cx="178" cy="152" r="27" />
        <circle className="scout-eye" cx="294" cy="152" r="27" />
      </g>
    </g>
  )
}

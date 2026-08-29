/* THE COURIER. One small character, drawn once, working the workflow sheet.
 *
 * Clinical research has a figure who visits every site in turn and moves the
 * paperwork along - and this is them. THE BODY IS STILL THE MARK: the two
 * rounded trapezoids off the favicon, verbatim, stood up and made someone.
 * But a flat black logo is a sticker, not a character, so the mark is built
 * the way everything on the sheet is built - AS A SOLID. The same two paths
 * are drawn twice: a depth copy thrown down and to the right in the mark's
 * old deep ink, and the face copies over it in the house blue, so the
 * character has a lit face and a shaded flank exactly like the row's own
 * drums. The upper shape is the head and carries the eyes - white, with
 * pupils dropped toward the work below and a glint up where the light is -
 * and the antenna's tip is the accent, blinking like an instrument light.
 *
 * The character is deliberately not named anywhere a reader can see. The
 * component name is a placeholder until the company christens it.
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

// The depth throw, in the mark's own units: down and a step to the right,
// the same lower-right every extrusion on the sheet falls. About (1.7, 3.2)
// screen pixels once the body scale is applied.
const D = [36, 66]

export function Scout({ x, y }) {
  return (
    <g className="scout">
      <line className="scout-antenna" x1={x} y1={y - 1.6} x2={x} y2={y - 6.4} />
      <circle className="scout-tip" cx={x} cy={y - 7.6} r="1.3" />
      <g className="scout-body" transform={`translate(${Math.round((x - CX * S) * 100) / 100}, ${Math.round((y - TOP * S) * 100) / 100}) scale(${S})`}>
        {/* The sway lives on its own wrapper inside the placing transform,
            because a CSS animation on the placed group would replace the
            translate and scale that stand the character on its point. */}
        <g className="scout-trunk">
          <path className="scout-flank" d={MARK[0]} transform={`translate(${D[0]}, ${D[1]})`} />
          <path className="scout-flank" d={MARK[1]} transform={`translate(${D[0]}, ${D[1]})`} />
          <path className="scout-shape" d={MARK[0]} />
          <path className="scout-shape" d={MARK[1]} />
          {/* The eyes, on the head. Sclera, a pupil dropped toward the work
              the character hangs over, and a glint - and the pair blinks on
              its own slow clock, which is most of what separates a face
              from two printed dots. */}
          <g className="scout-eyes">
            <circle className="scout-eye" cx="172" cy="151" r="34" />
            <circle className="scout-eye" cx="299" cy="151" r="34" />
            <circle className="scout-pupil" cx="180" cy="157" r="15" />
            <circle className="scout-pupil" cx="307" cy="157" r="15" />
            <circle className="scout-glint" cx="173" cy="148" r="6.5" />
            <circle className="scout-glint" cx="300" cy="148" r="6.5" />
          </g>
        </g>
      </g>
    </g>
  )
}

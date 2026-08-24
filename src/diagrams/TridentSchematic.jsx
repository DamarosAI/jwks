import { useState } from 'react'

import { box, deck, depthSort, EDGE_ANGLE, tile } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase, useScrollSpread } from './useScrollPhase'

/**
 * Trident - the governed execution stack, drawn axonometrically.
 *
 * Three proposal surfaces float above one site. Whatever they emit lands on a
 * single deck and descends one axis: contract, then site authority, then the
 * receipt ledger. The authority deck carries a gate, the gate is hatched shut,
 * and the descent halts on it until a named person at the site signs.
 *
 * The stack arrives closed and opens as the section enters, so a reader watches
 * the assembly come apart before anything runs through it. Then the run itself
 * is theirs to advance: scroll is the only clock in the figure.
 *
 * Nothing here names a vendor. The three sources are kinds of proposer, not
 * products, because the claim is about authority and not about whose model it
 * is: any of them can propose, none of them can decide.
 */

const CX = 310
const HALF = 106
const THICK = 11
const MIDDLE = 376

const LAYERS = [
  { key: 'surface', cy: 244, label: ['PROPOSAL', 'SURFACE'] },
  { key: 'contract', cy: 332, label: ['SCHEMA', 'CONTRACT'] },
  { key: 'authority', cy: 420, label: ['SITE', 'AUTHORITY'] },
  { key: 'receipt', cy: 508, label: ['RECEIPT', 'LEDGER'] },
].map((layer) => ({
  ...layer,
  ...deck(CX, layer.cy, HALF, THICK),
  // Where this deck sits while the stack is still closed.
  lift: Math.round((MIDDLE - layer.cy) * 0.44),
}))

const [SURFACE, CONTRACT, AUTHORITY, RECEIPT] = LAYERS

// Three sources, three kinds. Each plate carries a small plan motif so the
// figure reads at a glance without a legend.
const SOURCES = [
  { key: 'MODEL', cx: 126, cy: 116, land: [-80, 0] },
  { key: 'AGENT', cx: 310, cy: 78, land: [-56, -56] },
  { key: 'AUTOMATION', cx: 494, cy: 116, land: [0, -80] },
].map((source) => ({
  ...source,
  plate: deck(source.cx, source.cy, 40, 6),
  pad: SURFACE.p(...source.land),
}))

const RUN = SURFACE.p(0, 0)

// 19 contract fields, laid out as a plan grid on the validation deck. They
// bind in reading order, so "11 of 19" is a thing a reader can count.
const FIELD_CELLS = []
for (let row = 0; row < 4; row += 1) {
  for (let col = 0; col < 5; col += 1) FIELD_CELLS.push([-60 + col * 30, -45 + row * 30])
}
const FIELDS = FIELD_CELLS.slice(0, 19).map(([x, y]) => tile(CONTRACT.p, x, y, 11))

const GATE = tile(AUTHORITY.p, 0, 0, 26)
const MARK = AUTHORITY.p(-84, 4)

// The ledger: one block per committed run, oldest at the back of the deck.
const BLOCK_CELLS = []
for (let row = 0; row < 2; row += 1) {
  for (let col = 0; col < 4; col += 1) BLOCK_CELLS.push([-54 + col * 36, -20 + row * 40])
}
const BLOCKS = depthSort(BLOCK_CELLS).map(([x, y]) => ({
  key: `${x}:${y}`,
  ...box(RECEIPT.p, x, y, 11, 11, 10),
}))

// The single descent axis. Reveal is in pathLength units from the run node;
// 60 is the lip of the gate, which is where it stops when the site holds it.
const SPINE = `M ${RUN[0]} ${RUN[1]} V ${RECEIPT.cy}`

const PHASES = [
  { span: 2.4, reveal: 0, bound: 0, gate: 'idle', receipt: false, tone: 'run', status: 'PROPOSING', read: 'A model proposes - a proposal carries no authority' },
  { span: 1, reveal: 33, bound: 11, gate: 'idle', receipt: false, tone: 'run', status: 'VALIDATING', read: 'Checking the proposal against task contract T-07 v3' },
  { span: 1, reveal: 45, bound: 19, gate: 'idle', receipt: false, tone: 'valid', status: 'BOUND', read: '19 of 19 fields bound - contract satisfied' },
  { span: 3.2, reveal: 60, bound: 19, gate: 'hold', receipt: false, tone: 'hold', status: 'HELD', read: 'Stopped at the site deck - the gate needs a signature' },
  { span: 1.2, reveal: 74, bound: 19, gate: 'signed', receipt: false, tone: 'signed', status: 'SIGNED', read: 'M. Avdol - PI, Site 018 - 14:07 - authority stayed local' },
  { span: 2, reveal: 100, bound: 19, gate: 'signed', receipt: true, tone: 'signed', status: 'RECEIPTED', read: 'REV-018-TR3-1044 - replayable without the model' },
]

const MOTIFS = {
  MODEL: (p) => [-18, -6, 6, 18].map((y) => (
    <line key={y} x1={p(-22, y)[0]} y1={p(-22, y)[1]} x2={p(22, y)[0]} y2={p(22, y)[1]} />
  )),
  AGENT: (p) => {
    const hub = p(0, 0)
    const spokes = [p(-22, -8), p(20, -14), p(6, 20)]
    return [
      ...spokes.map((point) => (
        <line key={`s${point[0]}`} x1={hub[0]} y1={hub[1]} x2={point[0]} y2={point[1]} />
      )),
      ...[hub, ...spokes].map((point) => (
        <ellipse key={`n${point[0]}`} cx={point[0]} cy={point[1]} rx="4" ry="1.7" />
      )),
    ]
  },
  AUTOMATION: (p) => [
    [-20, -12], [0, -12], [20, -12], [-20, 12], [0, 12], [20, 12],
  ].map(([x, y]) => <polygon key={`${x}:${y}`} points={tile(p, x, y, 7)} />),
}

/** A solid: three faces, with the skirt hatched the way a section is hatched. */
function Faces({ shape, className, hatch }) {
  return (
    <g className={className}>
      <polygon className="dgm-face-left" points={shape.faceLeft} />
      <polygon className="dgm-face-right" points={shape.faceRight} />
      {hatch ? <polygon className="dgm-skirt" points={shape.faceLeft} fill={`url(#${hatch})`} /> : null}
      {hatch ? <polygon className="dgm-skirt" points={shape.faceRight} fill={`url(#${hatch})`} /> : null}
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

function Rail({ layer, live, hot, probe }) {
  return (
    <g className={`dgm-rail${live ? ' is-live' : ''}${hot ? ' is-hot' : ''}`} {...probe}>
      <line className="dgm-leader" x1={layer.right[0]} y1={layer.right[1]} x2="512" y2={layer.right[1]} />
      <text className="dgm-side" x="520" y={layer.right[1] - 3}>{layer.label[0]}</text>
      <text className="dgm-side" x="520" y={layer.right[1] + 11}>{layer.label[1]}</text>
    </g>
  )
}

export default function TridentSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const spread = useScrollSpread({ reduced })
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const open = state.gate === 'signed'

  // Pointing at any part of the drawing lifts it and lights everything tied to
  // it - a plate brings its leader, its pad and its tine with it. Hover only
  // re-weights what is already drawn, so nothing is hidden behind a cursor.
  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')
  const slide = (layer) => ({ '--lift': `${layer.lift}px` })

  const rows = [
    ['CONTRACT', 'T-07 v3', state.bound > 0],
    ['FIELDS', `${state.bound} / 19`, state.bound === 19],
    ['CHECKPOINT', 'SITE 018', state.gate !== 'idle'],
    ['SIGNATURE', open ? 'M. AVDOL' : 'PENDING', open],
    ['RECEIPT', state.receipt ? 'REV-018-TR3-1044' : '- -', state.receipt],
  ]

  return (
    <figure className="dgm">
      <figcaption className="dgm-head">
        <span>Governed execution stack</span>
        <small>Run 018-017 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={spread}
          viewBox="0 0 620 672"
          role="img"
          aria-label="Three kinds of proposal source feed one governed stack. A proposal descends through a schema contract deck to a site authority deck, where a hatched gate holds it until a named person at the site signs, and only then does it reach the receipt ledger."
        >
          <defs>
            <pattern id="tr-latt-a" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(111.44)">
              <line className="dgm-lattice" x1="0" y1="0" x2="0" y2="26" />
            </pattern>
            <pattern id="tr-latt-b" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(68.56)">
              <line className="dgm-lattice" x1="0" y1="0" x2="0" y2="26" />
            </pattern>
            <pattern id="tr-skirt" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-skirtline" x1="0" y1="0" x2="0" y2="4" />
            </pattern>
            <pattern id="tr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
          </defs>

          <rect className="dgm-field" x="0" y="0" width="620" height="672" />
          <rect className="dgm-lattice-wash" x="0" y="0" width="620" height="672" fill="url(#tr-latt-a)" />
          <rect className="dgm-lattice-wash" x="0" y="0" width="620" height="672" fill="url(#tr-latt-b)" />

          <text className="dgm-micro" x="24" y="28">PROPOSAL SOURCES</text>
          <text className="dgm-micro is-quiet" x="596" y="28" textAnchor="end">PROPOSE ONLY - NO AUTHORITY</text>

          {/* Bottom deck first, so each deck occludes the one behind it. Each
              sits in a slide group that closes the stack before the section
              opens, and settles it into the drawn position as the reader
              arrives. */}
          <g className="dgm-slide" style={slide(RECEIPT)}>
            <g className={`dgm-deck${state.receipt ? ' is-live' : ''}${lit('receipt')}`} {...probe('receipt')}>
              <Faces shape={RECEIPT} className="dgm-solid" hatch="tr-skirt" />
              {BLOCKS.map((cell, index) => (
                <Faces
                  key={cell.key}
                  shape={cell}
                  className={`dgm-block${state.receipt && index === BLOCKS.length - 1 ? ' is-written' : ''}`}
                />
              ))}
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} probe={probe('receipt')} />
          </g>

          <g className="dgm-slide" style={slide(AUTHORITY)}>
            <g className={`dgm-deck${state.gate !== 'idle' ? ' is-live' : ''}${lit('authority')}`} {...probe('authority')}>
              <Faces shape={AUTHORITY} className="dgm-solid" hatch="tr-skirt" />
              <polygon
                className="dgm-gatefill"
                points={GATE}
                fill={open ? 'var(--surface-solid)' : 'url(#tr-hatch)'}
              />
              <polygon className={`dgm-gatering is-${state.gate}`} points={GATE} />
              <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x={MARK[0] - 9} y={MARK[1] - 11} width="19" height="22" />
              <text className="dgm-mono" x={MARK[0] - 26} y={MARK[1] + 26}>SITE 018</text>
            </g>
            <Rail layer={AUTHORITY} live={state.gate !== 'idle'} hot={hot === 'authority'} probe={probe('authority')} />
          </g>

          <g className="dgm-slide" style={slide(CONTRACT)}>
            <g className={`dgm-deck${state.bound > 0 ? ' is-live' : ''}${lit('contract')}`} {...probe('contract')}>
              <Faces shape={CONTRACT} className="dgm-solid" hatch="tr-skirt" />
              {FIELDS.map((points, index) => (
                <polygon
                  className={`dgm-fieldtile${index < state.bound ? ' is-bound' : ''}`}
                  points={points}
                  key={points}
                />
              ))}
            </g>
            <Rail layer={CONTRACT} live={state.bound > 0} hot={hot === 'contract'} probe={probe('contract')} />
          </g>

          {/* The top assembly travels together: plates, their leaders, the deck
              they land on, and the card that reads the run off it. */}
          <g className="dgm-slide" style={slide(SURFACE)}>
            {SOURCES.map((source) => (
              <line
                className={`dgm-leader${lit(source.key)}`}
                key={`lead-${source.key}`}
                x1={source.plate.front[0]}
                y1={source.plate.front[1]}
                x2={source.pad[0]}
                y2={source.pad[1]}
              />
            ))}

            <g className={`dgm-deck is-live${lit('surface')}`} {...probe('surface')}>
              <Faces shape={SURFACE} className="dgm-solid" hatch="tr-skirt" />
              {SOURCES.map((source, index) => (
                <line
                  className={`dgm-tine${index === 0 ? ' is-live' : ''}${lit(source.key)}`}
                  key={`tine-${source.key}`}
                  x1={source.pad[0]}
                  y1={source.pad[1]}
                  x2={RUN[0]}
                  y2={RUN[1]}
                />
              ))}
              {SOURCES.map((source, index) => (
                <ellipse
                  className={`dgm-pad${index === 0 ? ' is-live' : ''}${lit(source.key)}`}
                  key={`pad-${source.key}`}
                  cx={source.pad[0]}
                  cy={source.pad[1]}
                  rx="13"
                  ry="5.2"
                />
              ))}
              <ellipse className="dgm-pad is-run" cx={RUN[0]} cy={RUN[1]} rx="17" ry="6.8" />
            </g>

            <Rail layer={SURFACE} live hot={hot === 'surface'} probe={probe('surface')} />

            {SOURCES.map((source) => (
              <g className={`dgm-plate${source.key === 'MODEL' ? ' is-live' : ''}${lit(source.key)}`} key={source.key} {...probe(source.key)}>
                <Faces shape={source.plate} className="dgm-solid" />
                <g className="dgm-motif">{MOTIFS[source.key](source.plate.p)}</g>
                <text
                  className="dgm-platelabel"
                  x={source.plate.left[0] + 8}
                  y={source.plate.left[1] + 14}
                  transform={`rotate(${EDGE_ANGLE} ${source.plate.left[0] + 8} ${source.plate.left[1] + 14})`}
                >
                  {source.key}
                </text>
              </g>
            ))}

            <line className="dgm-leader" x1="212" y1="281" x2={RUN[0]} y2={RUN[1]} />
            <g className={`dgm-card${lit('card')}`} {...probe('card')}>
              <rect className="dgm-cardbody" x="16" y="210" width="196" height="142" rx="10" />
              <text className="dgm-cardtitle" x="30" y="234">RUN 018-017</text>
              <line className="dgm-cardrule" x1="30" y1="244" x2="198" y2="244" />
              {rows.map(([key, value, good], index) => (
                <g className={`dgm-cardrow${good ? ' is-good' : ''}`} key={key}>
                  <text className="dgm-cardkey" x="30" y={266 + index * 18}>{key}</text>
                  <text className="dgm-cardval" x="104" y={266 + index * 18}>{value}</text>
                  <circle className="dgm-carddot" cx="196" cy={262 + index * 18} r="2.6" />
                </g>
              ))}
            </g>
          </g>

          {/* The descent. The only line in the figure that carries authority. */}
          <path
            className={`dgm-route is-${state.gate}`}
            d={SPINE}
            pathLength="100"
            style={{ strokeDashoffset: 100 - state.reveal }}
          />

          <line className="dgm-rule" x1="24" y1="616" x2="596" y2="616" />
          <rect className="dgm-status" x="24" y="628" width="132" height="24" rx="6" />
          <text className="dgm-statustext" x="34" y="644">{state.status}</text>
          <text className="dgm-read" x="170" y="644">{state.read}</text>
        </svg>
      </div>
    </figure>
  )
}

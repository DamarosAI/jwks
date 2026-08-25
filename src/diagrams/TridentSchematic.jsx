import { useState } from 'react'

import { jitter, planSpace, roundedDeck } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollRun } from './useScrollPhase'

/**
 * Trident - where a proposal stops.
 *
 * Three proposal surfaces sit above one site. None of them is privileged: the
 * figure draws all three the same way and lets the reader pick which one is
 * proposing, because that is the claim. Whatever they emit lands on a single
 * run node and descends the stack - contract, then site authority, then the
 * receipt - one short arc at a time, down the free left edge, rather than as a
 * long line ruled over the top of four solids.
 *
 * The authority deck carries an aperture. It is shut, and the descent halts on
 * it. Nothing about it is a status light: the leaves are closed, and when a
 * named person at the site signs, they slide apart and the run continues.
 *
 * The drawing is never still. Proposals keep arriving on all three tines, the
 * contract keeps checking its fields, and the shut aperture keeps taking the
 * load - on timings scattered by `jitter` so nothing falls into step. Scroll
 * advances the run; the pointer reads it; neither is needed for it to be alive.
 *
 * Nothing here names a vendor. The three sources are kinds of proposer, not
 * products, because the claim is about authority and not about whose model it
 * is: any of them can propose, none of them can decide.
 */

const CX = 258
const HALF = 76
const THICK = 11
const RAD = 22
const SEP = 104
const TOP = 196
const MIDDLE = TOP + SEP * 1.5
const GROUND = 562

const LAYERS = [
  { key: 'surface', label: 'PROPOSAL SURFACE' },
  { key: 'contract', label: 'SCHEMA CONTRACT' },
  { key: 'authority', label: 'SITE AUTHORITY' },
  { key: 'receipt', label: 'RECEIPT LEDGER' },
].map((layer, index) => {
  const cy = TOP + index * SEP
  return {
    ...layer,
    cy,
    ...roundedDeck(CX, cy, HALF, THICK, RAD),
    // Where this deck rests while the stack is still closed.
    lift: Math.round((MIDDLE - cy) * 0.44),
  }
})

const [SURFACE, CONTRACT, AUTHORITY, RECEIPT] = LAYERS

// Three sources, three kinds, drawn identically. Each plate carries a plan
// motif so the figure reads without a legend, and a landing pad on the surface
// deck directly under it, so no leader has to cross another.
const SOURCES = [
  { key: 'MODEL', cx: 126, land: [-42, 42], note: 'any provider' },
  { key: 'AGENT', cx: 258, land: [-42, -42], note: 'tool loop' },
  { key: 'AUTOMATION', cx: 390, land: [42, -42], note: 'scheduled' },
].map((source, index) => ({
  ...source,
  index,
  plate: roundedDeck(source.cx, 118, 34, 7, 12),
  pad: SURFACE.p(...source.land),
  life: jitter(index, 4),
}))

const HUB = SURFACE.p(0, 0)

// 19 contract fields as a plan grid, laid out 5-5-5-4 with the short row
// centred. Nineteen is the count, so the grid is the count: it is a thing a
// reader can total, and the centre is left clear rather than pinned under a
// node the tiles have to make room for.
const NAMES = [
  'SUBJECT', 'SITE', 'PROTOCOL', 'ARM', 'CYCLE',
  'DAY', 'DOSE', 'UNIT', 'ROUTE', 'LOINC',
  'VALUE', 'RANGE', 'GRADE', 'CTCAE', 'ONSET',
  'ACTION', 'SOURCE', 'PAGE', 'HASH',
]

const FIELDS = []
let cursor = 0
;[5, 5, 5, 4].forEach((count, row) => {
  for (let col = 0; col < count; col += 1) {
    const x = (col - (count - 1) / 2) * 28
    const y = -42 + row * 28
    FIELDS.push({ name: NAMES[cursor], x, y, at: CONTRACT.p(x, y), life: jitter(cursor, 6) })
    cursor += 1
  }
})

// The ledger writes one row per committed run, front row last.
const LEDGER = [-28, 0, 28]

// The descent. Three short arcs down the free left edge of the stack, each one
// leaving the underside of a deck's left corner and landing on the left corner
// of the deck below it. One arc lights at a time, which is all a reader needs:
// a full-height rule over four solids was flatter and said less.
const DROPS = LAYERS.slice(0, 3).map((from, index) => {
  const to = LAYERS[index + 1]
  const [x1, y1] = from.left
  const [x2, y2] = to.left
  const lip = Math.round((y1 + THICK + 2) * 100) / 100
  const bow = 34
  return {
    key: `${from.key}-${to.key}`,
    index,
    path: `M ${x1} ${lip} C ${x1 - bow} ${lip + 14} ${x2 - bow} ${y2 - 20} ${x2} ${y2}`,
    tip: [x2, y2],
    life: jitter(index, 8),
  }
})

const PHASES = [
  { span: 2.4, drops: 0, bound: 0, gate: 'shut', receipt: false, tone: 'run', status: 'PROPOSING' },
  { span: 1.2, drops: 1, bound: 11, gate: 'shut', receipt: false, tone: 'run', status: 'VALIDATING' },
  { span: 1.2, drops: 1, bound: 19, gate: 'shut', receipt: false, tone: 'valid', status: 'BOUND' },
  { span: 3.2, drops: 2, bound: 19, gate: 'shut', receipt: false, tone: 'hold', status: 'HELD' },
  { span: 1.4, drops: 3, bound: 19, gate: 'open', receipt: false, tone: 'signed', status: 'SIGNED' },
  { span: 2.2, drops: 3, bound: 19, gate: 'open', receipt: true, tone: 'signed', status: 'RECEIPTED' },
]

// The caption belongs to the pointer, not to the scroll. Scrolling advances the
// run and the status says where it is; the line under the rule answers whatever
// the reader is actually pointing at, and states the claim when they are not.
const RESTING = 'Any of the three can propose. Only the site can decide.'

const READS = {
  MODEL: 'A model drafts the proposal. Change the model and nothing below this line changes.',
  AGENT: 'An agent loop drafts it, calling tools until it has something worth submitting.',
  AUTOMATION: 'A scheduled job drafts it, and gets no more authority than a person would.',
  surface: 'Anything can propose. A proposal is a request, and a request is not a decision.',
  contract: 'Task contract T-07 v3. Nineteen named fields, each one checked before anything moves.',
  authority: 'The aperture is shut. It opens for a signature from the site, and for nothing else.',
  receipt: 'One row per committed run: what ran, who signed it, and what it produced.',
}

const MOTIFS = {
  MODEL: [-14, -4, 6, 16].map((y) => (
    <rect key={y} x="-22" y={y - 2} width="44" height="4" rx="2" vectorEffect="non-scaling-stroke" />
  )),
  AGENT: [
    <circle key="hub" cx="0" cy="0" r="6" vectorEffect="non-scaling-stroke" />,
    ...[[-20, -10], [18, -14], [4, 20]].map(([x, y]) => [
      <line key={`l${x}`} x1="0" y1="0" x2={x} y2={y} vectorEffect="non-scaling-stroke" />,
      <circle key={`c${x}`} cx={x} cy={y} r="4" vectorEffect="non-scaling-stroke" />,
    ]).flat(),
  ],
  AUTOMATION: [[-18, -11], [0, -11], [18, -11], [-18, 11], [0, 11], [18, 11]].map(([x, y]) => (
    <rect key={`${x}:${y}`} x={x - 7} y={y - 7} width="14" height="14" rx="4" vectorEffect="non-scaling-stroke" />
  )),
}

/** A solid: a rounded plan square and its two skirt faces, in one ink. */
function Faces({ shape, className }) {
  return (
    <g className={className}>
      <path className="dgm-face-left" d={shape.faceLeft} />
      <path className="dgm-face-right" d={shape.faceRight} />
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

/**
 * A label tied to a real edge, carrying the deck's live value under its name.
 * A leader is a hairline and a label is a few characters tall, so the whole
 * strip gets one invisible hit area - otherwise the reader has to land on a
 * one-pixel line to read what the rail is about.
 */
function Rail({ layer, live, hot, fact, probe }) {
  return (
    <g className={`dgm-rail${live ? ' is-live' : ''}${hot ? ' is-hot' : ''}`} {...probe}>
      <rect className="dgm-hit" x={layer.right[0]} y={layer.right[1] - 18} width={600 - layer.right[0]} height="36" />
      <line className="dgm-leader" x1={layer.right[0]} y1={layer.right[1]} x2="424" y2={layer.right[1]} />
      <circle className="dgm-railnode" cx="424" cy={layer.right[1]} r="2.6" />
      <text className="dgm-side" x="434" y={layer.right[1] - 3}>{layer.label}</text>
      <text className="dgm-sidefact" x="434" y={layer.right[1] + 12}>{fact}</text>
    </g>
  )
}

export default function TridentSchematic({ animate = true, reduced = false }) {
  const frame = useCenterOnOverflow()
  const [figure, phase] = useScrollRun(PHASES, { reduced })
  const [hot, setHot] = useState(null)
  const [source, setSource] = useState(null)
  const [field, setField] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const open = state.gate === 'open'

  // Pointing at a part of the drawing lifts it and lights everything tied to
  // it. Hover only re-weights what is already drawn, so a reader who cannot
  // hover loses nothing.
  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')

  // Picking a source is the interaction that carries the claim: the reader
  // chooses who proposes, and the aperture holds all the same.
  const pick = (key) => ({
    tabIndex: 0,
    role: 'button',
    'aria-label': `Propose from ${key.toLowerCase()}`,
    onMouseEnter: () => { setHot(key); setSource(key) },
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
    onFocus: () => { setHot(key); setSource(key) },
    onBlur: () => setHot((current) => (current === key ? null : current)),
    onKeyDown: (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSource(key) }
    },
  })

  const facts = {
    surface: source ? `SOURCE ${source}` : 'ANY OF THREE',
    contract: 'T-07 V3',
    authority: open ? 'SIGNED - A. VOSS' : 'SHUT - NEEDS A SIGNATURE',
    receipt: state.receipt ? 'REV-018-TR3-1044' : 'NOT YET WRITTEN',
  }

  const read = field === null
    ? READS[hot] ?? RESTING
    : `${FIELDS[field].name} - one of the nineteen fields the contract checks.`

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three kinds of proposal source - a model, an agent loop and a scheduled job - sit above one site, drawn identically because any of them can be swapped for another. A proposal descends the stack in three short arcs: through a schema contract deck of nineteen named fields, down to a site authority deck where a shut aperture holds it until a named person at the site signs, and only then to the receipt ledger."
        >
          <defs>
            <pattern id="tr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
            <pattern id="tr-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
          </defs>

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="22" y="16" width="34" height="40" />

          <g className="dgm-count">
            <rect className="dgm-countbody" x="446" y="22" width="154" height="30" rx="15" />
            <text className="dgm-countval" x="462" y="41">{state.bound}/19</text>
            <text className="dgm-countkey" x="500" y="41">FIELDS BOUND</text>
          </g>

          {/* The ground the stack is measured against. Two hairlines carry the
              footprint down from the top deck, so the four decks read as one
              plan seen at four heights rather than four unrelated shapes. */}
          <g className="dgm-ground">
            <line className="dgm-axis" x1={SURFACE.left[0]} y1={SURFACE.left[1]} x2={SURFACE.left[0]} y2={GROUND} />
            <line className="dgm-axis" x1={SURFACE.right[0]} y1={SURFACE.right[1]} x2={SURFACE.right[0]} y2={GROUND} />
            <g transform={planSpace(CX, GROUND)}>
              <rect className="dgm-plane" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} vectorEffect="non-scaling-stroke" />
              <rect className="dgm-planefill" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} fill="url(#tr-grain)" />
            </g>
            <text className="dgm-edge is-caption" x={CX} y="626" textAnchor="middle">ONE PLAN - FOUR HEIGHTS</text>
          </g>

          {/* Decks, top last: the deck above occludes the one it sits over. */}
          <g className="dgm-slide" style={{ '--lift': `${RECEIPT.lift}px` }}>
            <g className={`dgm-deck${state.receipt ? ' is-live' : ''}${lit('receipt')}`} {...probe('receipt')}>
              <Faces shape={RECEIPT} className="dgm-solid" />
              <g transform={planSpace(CX, RECEIPT.cy)}>
                {LEDGER.map((y, index) => (
                  <g className={`dgm-ledgerrow${state.receipt && index === LEDGER.length - 1 ? ' is-written' : ''}`} key={y}>
                    <rect className="dgm-ledgerbar" x="-52" y={y - 7} width="104" height="14" rx="7" vectorEffect="non-scaling-stroke" />
                    <rect className="dgm-ledgertick" x="-46" y={y - 2} width={index === LEDGER.length - 1 ? 68 : 44} height="4" rx="2" />
                  </g>
                ))}
              </g>
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} fact={facts.receipt} probe={probe('receipt')} />
            <g className={`dgm-seal${state.receipt ? ' is-struck' : ''}`}>
              <rect className="dgm-sealbody" x="434" y={RECEIPT.right[1] + 22} width="116" height="28" rx="14" />
              <text className="dgm-sealtext" x="492" y={RECEIPT.right[1] + 41} textAnchor="middle">RECEIPT SEALED</text>
            </g>
          </g>

          <g className="dgm-slide" style={{ '--lift': `${AUTHORITY.lift}px` }}>
            <g className={`dgm-deck${open ? ' is-live' : ''}${lit('authority')}`} {...probe('authority')}>
              <Faces shape={AUTHORITY} className="dgm-solid" />
              <g transform={planSpace(CX, AUTHORITY.cy)}>
                <rect className="dgm-sigbar" x="-44" y="42" width="88" height="18" rx="9" vectorEffect="non-scaling-stroke" />
                <rect className={`dgm-sigfill${open ? ' is-signed' : ''}`} x="-38" y="47" width={open ? 76 : 26} height="8" rx="4" />
                {/* The aperture. Shut is drawn shut - two leaves over a hole -
                    so the claim survives with every colour removed. */}
                {/* The run crosses the deck to reach the aperture, so where it
                    stops is where the aperture is rather than a corner away. */}
                <line
                  className={`dgm-approach${state.drops >= 2 ? ' is-here' : ''}`}
                  x1="-58"
                  y1="58"
                  x2="-32"
                  y2="32"
                  pathLength="100"
                  vectorEffect="non-scaling-stroke"
                />
                <rect className="dgm-aperture" x="-26" y="-26" width="52" height="52" rx="11" fill="url(#tr-hatch)" />
                <g className={`dgm-leaf is-left${open ? ' is-open' : ''}`}>
                  <rect x="-26" y="-26" width="26" height="52" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <g className={`dgm-leaf is-right${open ? ' is-open' : ''}`}>
                  <rect x="0" y="-26" width="26" height="52" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <rect className={`dgm-gatering is-${state.gate}`} x="-31" y="-31" width="62" height="62" rx="15" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
            <Rail layer={AUTHORITY} live={open} hot={hot === 'authority'} fact={facts.authority} probe={probe('authority')} />
          </g>

          <g className="dgm-slide" style={{ '--lift': `${CONTRACT.lift}px` }}>
            <g className={`dgm-deck${state.bound > 0 ? ' is-live' : ''}${lit('contract')}`} {...probe('contract')}>
              <Faces shape={CONTRACT} className="dgm-solid" />
              <g transform={planSpace(CX, CONTRACT.cy)}>
                {FIELDS.map((cell, index) => (
                  <rect
                    className={`dgm-fieldtile${index < state.bound ? ' is-bound' : ''}${field === index ? ' is-named' : ''}`}
                    key={cell.name}
                    style={{ '--life': cell.life }}
                    x={cell.x - 9}
                    y={cell.y - 9}
                    width="18"
                    height="18"
                    rx="5"
                    vectorEffect="non-scaling-stroke"
                    onMouseEnter={() => setField(index)}
                    onMouseLeave={() => setField((current) => (current === index ? null : current))}
                  />
                ))}
              </g>
            </g>
            <Rail layer={CONTRACT} live={state.bound > 0} hot={hot === 'contract'} fact={facts.contract} probe={probe('contract')} />
            {field === null ? null : (
              <g className="dgm-tag is-named">
                <line className="dgm-leader" x1="118" y1={FIELDS[field].at[1]} x2={FIELDS[field].at[0] - 10} y2={FIELDS[field].at[1]} />
                <rect className="dgm-tagbody" x="20" y={FIELDS[field].at[1] - 11} width="98" height="22" rx="11" />
                <text className="dgm-tagtext" x="69" y={FIELDS[field].at[1] + 4} textAnchor="middle">{FIELDS[field].name}</text>
              </g>
            )}
          </g>

          {/* The proposal surface travels with its plates and their leaders, so
              nothing detaches while the stack is still opening. */}
          <g className="dgm-slide" style={{ '--lift': `${SURFACE.lift}px` }}>
            {SOURCES.map((item) => (
              <line
                className={`dgm-leader${lit(item.key)}`}
                key={`lead-${item.key}`}
                x1={item.plate.front[0]}
                y1={item.plate.front[1] + item.plate.height}
                x2={item.pad[0]}
                y2={item.pad[1]}
              />
            ))}

            <g className={`dgm-deck is-live${lit('surface')}`} {...probe('surface')}>
              <Faces shape={SURFACE} className="dgm-solid" />
              <g transform={planSpace(CX, SURFACE.cy)}>
                <rect className="dgm-planefill" x={-HALF + 10} y={-HALF + 10} width={HALF * 2 - 20} height={HALF * 2 - 20} rx="14" fill="url(#tr-grain)" />
              </g>
              {SOURCES.map((item) => (
                <line
                  className={`dgm-tine${source === item.key ? ' is-live' : ''}${lit(item.key)}`}
                  key={`tine-${item.key}`}
                  x1={item.pad[0]}
                  y1={item.pad[1]}
                  x2={HUB[0]}
                  y2={HUB[1]}
                />
              ))}
              {/* Proposals keep arriving whether or not anyone is watching: one
                  spark per tine, on three timings that never fall into step. */}
              {SOURCES.map((item) => (
                <line
                  className="dgm-spark"
                  key={`spark-${item.key}`}
                  style={{ '--life': item.life }}
                  pathLength="100"
                  x1={item.pad[0]}
                  y1={item.pad[1]}
                  x2={HUB[0]}
                  y2={HUB[1]}
                />
              ))}
              {SOURCES.map((item) => (
                <ellipse
                  className={`dgm-pad${source === item.key ? ' is-live' : ''}${lit(item.key)}`}
                  key={`pad-${item.key}`}
                  cx={item.pad[0]}
                  cy={item.pad[1]}
                  rx="12"
                  ry="4.8"
                />
              ))}
              <g transform={planSpace(CX, SURFACE.cy)}>
                <circle className="dgm-port is-hub" cx="0" cy="0" r="13" vectorEffect="non-scaling-stroke" />
              </g>
            </g>

            <Rail layer={SURFACE} live hot={hot === 'surface'} fact={facts.surface} probe={probe('surface')} />

            {SOURCES.map((item) => (
              <g className={`dgm-plate${source === item.key ? ' is-live' : ''}${lit(item.key)}`} key={item.key} {...pick(item.key)}>
                <Faces shape={item.plate} className="dgm-solid" />
                <g className="dgm-motif" transform={planSpace(item.cx, 118)}>{MOTIFS[item.key]}</g>
                <text className="dgm-platelabel" x={item.cx} y="74" textAnchor="middle">{item.key}</text>
                <text className="dgm-platenote" x={item.cx} y="86" textAnchor="middle">{item.note}</text>
              </g>
            ))}
          </g>

          {/* The descent: one arc lights at a time, and the arc out of the site
              deck does not exist until somebody there has signed. */}
          {DROPS.map((leg) => {
            const done = leg.index < state.drops
            return (
              <g
                className={`dgm-drop${done ? ' is-done' : ''}${leg.index === state.drops - 1 ? ' is-latest' : ''}`}
                key={leg.key}
                style={{ '--life': leg.life }}
              >
                <path className="dgm-droppath" d={leg.path} pathLength="100" />
                <path className="dgm-dropflow" d={leg.path} pathLength="100" />
                <circle className="dgm-dropnode" cx={leg.tip[0]} cy={leg.tip[1]} r="4.6" />
              </g>
            )
          })}

          <line className="dgm-rule" x1="20" y1="648" x2="600" y2="648" />
          <rect className="dgm-status" x="20" y="660" width="122" height="26" rx="13" />
          <text className="dgm-statustext" x="81" y="677" textAnchor="middle">{state.status}</text>
          <text className="dgm-read" x="156" y="677">{read}</text>
        </svg>
      </div>
    </figure>
  )
}

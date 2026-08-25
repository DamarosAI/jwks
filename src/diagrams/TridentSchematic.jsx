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
 * intake, crosses to the corner of the deck and descends the stack - contract,
 * then site authority, then the receipt - one short drop at a time.
 *
 * Each drop is drawn inside the deck it lands on, and its head runs a few
 * pixels up under the deck above. That is what keeps it attached: lifting
 * either solid never opens a gap, because the drop belongs to one of them and
 * hides beneath the other. A connector hanging in the space between two things
 * is a connector that is not connected to either.
 *
 * The authority deck carries an aperture in a hatch housing. It is shut, and
 * the descent halts on it. Nothing about it is a status light: the leaves are
 * closed, and when a named person at the site signs - a stroke, drawn as they
 * make it - they slide apart and the run continues to the ledger.
 *
 * The drawing is never still. Proposals keep arriving on all three tines, the
 * agent's tool loop keeps going round, the contract keeps checking its fields
 * and the shut aperture keeps taking the load - on timings scattered by
 * `jitter` so nothing falls into step. Scroll advances the run; the pointer
 * reads it; neither is needed for it to be alive.
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
// deck directly under it, so no leader has to cross another. The agent stands
// higher than its two peers: its plate is the one with a loop running in it,
// and it needs the air to be seen turning.
const SOURCES = [
  { key: 'MODEL', cx: 126, y: 122, land: [-42, 42], note: 'any provider' },
  { key: 'AGENT', cx: 258, y: 94, land: [-42, -42], note: 'tool loop' },
  { key: 'AUTOMATION', cx: 390, y: 122, land: [42, -42], note: 'scheduled' },
].map((source, index) => ({
  ...source,
  index,
  plate: roundedDeck(source.cx, source.y, 34, 7, 12),
  pad: SURFACE.p(...source.land),
  life: jitter(index, 4),
}))

const HUB = SURFACE.p(0, 0)

// Proposals waiting their turn, in the one quadrant of the intake deck that no
// source lands in. A queue is what an intake looks like when it is working.
const QUEUE = [0, 1, 2, 3].map((step) => ({ step, x: 14 + step * 13, y: 52, life: jitter(step, 21) }))

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

// What a named person at the site actually does. It is a stroke, drawn in as
// they make it, rather than a bar filling itself up.
const SIGNATURE = 'M -33 -58 C -28 -67 -22 -55 -16 -62 C -11 -68 -6 -56 -1 -61'
  + ' C 4 -66 9 -56 14 -61 C 19 -64 25 -58 32 -62'

// The ledger writes one row per committed run, each chained to the row above it
// by its hash, front row last.
const LEDGER = [-33, -11, 11, 33]

// The descent. One short drop per deck, and it belongs to the deck it lands on
// - drawn inside that deck's group, so it travels with the solid it is bolted
// to. Its head starts under the skirt of the deck above, which is why lifting
// either one never opens a gap: there is no free end left to hang.
const DROPS = LAYERS.slice(1).map((deck, index) => {
  const [x, y] = deck.left
  const head = [x + 13, Math.round((y - SEP + 6) * 100) / 100]
  return {
    key: `${LAYERS[index].key}-${deck.key}`,
    index,
    owner: deck.key,
    path: `M ${head[0]} ${head[1]} C ${x - 32} ${head[1] + 24} ${x - 38} ${y - 30} ${x} ${y}`,
    foot: [x, y],
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

// The readout belongs to the pointer, not to the scroll. Scrolling advances the
// run and the pill says where it is; point at any part of the drawing and the
// whole readout answers for that part instead - the word in the pill, the
// colour of the pill, and the line beside it. It states the claim when the
// reader is not pointing at anything.
const RESTING = 'Any of the three can propose. Only the site can decide.'

const READS = {
  MODEL: { tone: 'run', pill: 'PROPOSER', read: 'A model drafts the proposal. Change the model and nothing below this line changes.' },
  AGENT: { tone: 'run', pill: 'PROPOSER', read: 'An agent loop drafts it, calling tools until it has something worth submitting.' },
  AUTOMATION: { tone: 'run', pill: 'PROPOSER', read: 'A scheduled job drafts it, and gets no more authority than a person would.' },
  surface: { tone: 'run', pill: 'INTAKE', read: 'Anything can propose. A proposal is a request, and a request is not a decision.' },
  contract: { tone: 'valid', pill: 'CHECKED', read: 'Task contract T-07 v3. Nineteen named fields, each one checked before anything moves.' },
  authority: { tone: 'hold', pill: 'GATED', read: 'The aperture is shut. It opens for a signature from the site, and for nothing else.' },
  receipt: { tone: 'signed', pill: 'LEDGER', read: 'One row per committed run, each one chained to the row above it by its hash.' },
}

const LOOP = 'M -6 -13 H 6 A 13 13 0 0 1 6 13 H -6 A 13 13 0 0 1 -6 -13 Z'

const MOTIFS = {
  // Stacked weights, unevenly - a model, not a menu icon.
  MODEL: [[-14, 44], [-4, 30], [6, 40], [16, 22]].map(([y, w]) => (
    <rect key={y} x={-w / 2} y={y - 2} width={w} height="4" rx="2" vectorEffect="non-scaling-stroke" />
  )),
  // A tool loop, drawn as a loop and running as one. The old motif ran three
  // spokes into the middle of a hub disc, which read as lines crossing inside a
  // circle rather than as anything an agent does.
  AGENT: [
    <path key="track" className="dgm-loop" d={LOOP} vectorEffect="non-scaling-stroke" />,
    <path key="flow" className="dgm-loopflow" d={LOOP} pathLength="100" vectorEffect="non-scaling-stroke" />,
    // Beads on the track, filled rather than outlined: an outlined circle
    // sitting on an outlined track is a bump in the silhouette, and three of
    // them turned the loop into a blob.
    ...[[-19, 0], [19, 0], [0, -13]].map(([x, y]) => (
      <circle className="dgm-loopnode" key={`${x}:${y}`} cx={x} cy={y} r="3.4" />
    )),
  ],
  // A schedule: the same slot filled on every run of it.
  AUTOMATION: [[-18, -11], [0, -11], [18, -11], [-18, 11], [0, 11], [18, 11]].map(([x, y], slot) => (
    <rect
      className={slot % 3 === 0 ? 'is-on' : undefined}
      key={`${x}:${y}`}
      x={x - 7}
      y={y - 7}
      width="14"
      height="14"
      rx="4"
      vectorEffect="non-scaling-stroke"
    />
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
 * The drop that lands on a deck. It lives inside that deck's group, so it moves
 * with the deck under the pointer and under the scroll, and its head is tucked
 * under the deck above rather than stopping in mid-air.
 */
function Drop({ leg, drops }) {
  const done = leg.index < drops
  return (
    <g
      className={`dgm-drop${done ? ' is-done' : ''}${leg.index === drops - 1 ? ' is-latest' : ''}`}
      style={{ '--life': leg.life }}
    >
      <path className="dgm-droppath" d={leg.path} pathLength="100" />
      <path className="dgm-dropflow" d={leg.path} pathLength="100" />
      <circle className="dgm-dropnode" cx={leg.foot[0]} cy={leg.foot[1]} r="4.6" />
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

  const cue = field === null
    ? READS[hot]
    : { tone: 'valid', pill: 'FIELD', read: `${FIELDS[field].name} - one of the nineteen fields the contract checks.` }
  const tone = cue?.tone ?? state.tone
  const pill = cue?.pill ?? state.status
  const read = cue?.read ?? RESTING

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${tone}${animate ? ' is-live' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three kinds of proposal source - a model, an agent loop and a scheduled job - sit above one site, drawn identically because any of them can be swapped for another. A proposal lands on an intake deck, drops to a schema contract deck of nineteen named fields, and drops again to a site authority deck where a shut aperture holds it until a named person at the site signs. Only then does it reach the receipt ledger, where every row is chained to the row above it by its hash."
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

          {/* Decks, top last: the deck above occludes the one it sits over, and
              occludes the head of the drop that lands on it. */}
          <g className="dgm-slide" style={{ '--lift': `${RECEIPT.lift}px` }}>
            <g className={`dgm-deck${state.receipt ? ' is-live' : ''}${lit('receipt')}`} {...probe('receipt')}>
              <Faces shape={RECEIPT} className="dgm-solid" />
              <Drop leg={DROPS[2]} drops={state.drops} />
              <g transform={planSpace(CX, RECEIPT.cy)}>
                <line
                  className={`dgm-approach${state.drops >= 3 ? ' is-here' : ''}`}
                  x1="-67"
                  y1="67"
                  x2="-56"
                  y2="44"
                  pathLength="100"
                  vectorEffect="non-scaling-stroke"
                />
                <line className="dgm-ledgerchain" x1="-54" y1={LEDGER[0]} x2="-54" y2={LEDGER[LEDGER.length - 1]} vectorEffect="non-scaling-stroke" />
                {LEDGER.map((y, index) => {
                  const last = index === LEDGER.length - 1
                  const written = state.receipt || !last
                  return (
                    <g className={`dgm-ledgerrow${written ? ' is-written' : ''}`} key={y}>
                      <rect className="dgm-ledgerbar" x="-44" y={y - 7.5} width="96" height="15" rx="7.5" vectorEffect="non-scaling-stroke" />
                      <rect className="dgm-ledgerhash" x="-59" y={y - 5} width="10" height="10" rx="3" vectorEffect="non-scaling-stroke" />
                      <rect className="dgm-ledgertick" x="-36" y={y - 2} width="32" height="4" rx="2" />
                      <rect className="dgm-ledgertick" x="2" y={y - 2} width={last ? 30 : 18} height="4" rx="2" />
                      <circle className="dgm-ledgerseal" cx="44" cy={y} r="4" />
                    </g>
                  )
                })}
              </g>
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} fact={facts.receipt} probe={probe('receipt')} />
          </g>

          <g className="dgm-slide" style={{ '--lift': `${AUTHORITY.lift}px` }}>
            <g className={`dgm-deck${open ? ' is-live' : ''}${lit('authority')}`} {...probe('authority')}>
              <Faces shape={AUTHORITY} className="dgm-solid" />
              <Drop leg={DROPS[1]} drops={state.drops} />
              <g transform={planSpace(CX, AUTHORITY.cy)}>
                {/* The run crosses the deck to reach the hatch, so where it
                    stops is where the aperture is rather than a corner away. */}
                <line
                  className={`dgm-approach${state.drops >= 2 ? ' is-here' : ''}`}
                  x1="-67"
                  y1="67"
                  x2="-43"
                  y2="43"
                  pathLength="100"
                  vectorEffect="non-scaling-stroke"
                />
                {/* The hatch. Shut is drawn shut - two leaves over a hole, set
                    in a housing - so the claim survives with every colour
                    removed. */}
                <rect className="dgm-housing" x="-48" y="-48" width="96" height="96" rx="18" vectorEffect="non-scaling-stroke" />
                <rect className="dgm-rebate" x="-41" y="-41" width="82" height="82" rx="14" vectorEffect="non-scaling-stroke" />
                <rect className="dgm-aperture" x="-26" y="-26" width="52" height="52" rx="11" fill="url(#tr-hatch)" />
                <g className={`dgm-leaf is-left${open ? ' is-open' : ''}`}>
                  <rect x="-26" y="-26" width="26" height="52" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <g className={`dgm-leaf is-right${open ? ' is-open' : ''}`}>
                  <rect x="0" y="-26" width="26" height="52" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <rect className={`dgm-gatering is-${state.gate}`} x="-31" y="-31" width="62" height="62" rx="15" vectorEffect="non-scaling-stroke" />
                {/* The signature block, clear of the housing along the back
                    edge of the deck. */}
                <rect className="dgm-sigplate" x="-40" y="-70" width="80" height="18" rx="8" vectorEffect="non-scaling-stroke" />
                <line className="dgm-sigrule" x1="-33" y1="-54" x2="33" y2="-54" vectorEffect="non-scaling-stroke" />
                <path className={`dgm-sigstroke${open ? ' is-signed' : ''}`} d={SIGNATURE} pathLength="100" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
            <Rail layer={AUTHORITY} live={open} hot={hot === 'authority'} fact={facts.authority} probe={probe('authority')} />
          </g>

          <g className="dgm-slide" style={{ '--lift': `${CONTRACT.lift}px` }}>
            <g className={`dgm-deck${state.bound > 0 ? ' is-live' : ''}${lit('contract')}`} {...probe('contract')}>
              <Faces shape={CONTRACT} className="dgm-solid" />
              <Drop leg={DROPS[0]} drops={state.drops} />
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
                {/* Everything that lands on this deck lands inside one
                    catchment, and everything in the catchment goes to one
                    throat. */}
                <rect className="dgm-catch" x="-56" y="-56" width="112" height="112" rx="20" vectorEffect="non-scaling-stroke" />
                {QUEUE.map((chip) => (
                  <rect
                    className="dgm-queue"
                    key={chip.step}
                    style={{ '--life': chip.life }}
                    x={chip.x - 5}
                    y={chip.y - 5}
                    width="10"
                    height="10"
                    rx="3"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
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
                <circle className="dgm-port is-hub" cx="0" cy="0" r="14" vectorEffect="non-scaling-stroke" />
                <circle className="dgm-throat" cx="0" cy="0" r="5" />
              </g>
            </g>

            <Rail layer={SURFACE} live hot={hot === 'surface'} fact={facts.surface} probe={probe('surface')} />

            {SOURCES.map((item) => (
              <g
                className={`dgm-plate${source === item.key ? ' is-live' : ''}${lit(item.key)}`}
                key={item.key}
                style={{ '--life': item.life }}
                {...pick(item.key)}
              >
                <Faces shape={item.plate} className="dgm-solid" />
                <g className="dgm-motif" transform={planSpace(item.cx, item.y)}>{MOTIFS[item.key]}</g>
                <text className="dgm-platelabel" x={item.cx} y={item.y - 48} textAnchor="middle">{item.key}</text>
                <text className="dgm-platenote" x={item.cx} y={item.y - 36} textAnchor="middle">{item.note}</text>
              </g>
            ))}
          </g>

          <line className="dgm-rule" x1="20" y1="648" x2="600" y2="648" />
          <rect className="dgm-status" x="20" y="660" width="122" height="26" rx="13" />
          <text className="dgm-statustext" x="81" y="677" textAnchor="middle">{pill}</text>
          <text className="dgm-read" x="156" y="677">{read}</text>
        </svg>
      </div>
    </figure>
  )
}

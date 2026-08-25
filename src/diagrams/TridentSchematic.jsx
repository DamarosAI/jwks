import { useState } from 'react'

import { deck, EDGE_ANGLE, frontDrop, planSpace } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase, useScrollSpread } from './useScrollPhase'

/**
 * Trident - where a proposal stops.
 *
 * Three proposal surfaces sit above one site. None of them is privileged: the
 * figure draws all three the same way and lets the reader pick which one is
 * proposing, because that is the claim. Whatever they emit lands on a single
 * run node and descends one axis - contract, then site authority, then the
 * receipt - and the axis is drawn the way a drawing draws an axis: solid where
 * it is in the open, dashed where it passes through a solid. That is what makes
 * the stack read as a stack instead of a line laid over four rectangles.
 *
 * The authority deck carries an aperture. It is shut, and the descent halts on
 * it. Nothing about it is a status light: the leaves are closed, and when a
 * named person at the site signs, they slide apart and the axis continues.
 *
 * Nothing here names a vendor. The three sources are kinds of proposer, not
 * products, because the claim is about authority and not about whose model it
 * is: any of them can propose, none of them can decide.
 */

const CX = 258
const HALF = 76
const THICK = 11
const DROP = frontDrop(HALF)
const SEP = 104
const TOP = 196
const MIDDLE = TOP + SEP * 1.5

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
    ...deck(CX, cy, HALF, THICK),
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
].map((source) => ({
  ...source,
  plate: deck(source.cx, 118, 34, 7),
  pad: SURFACE.p(...source.land),
}))

const HUB = SURFACE.p(0, 0)

// 19 contract fields as a plan grid. They bind in reading order, so "11 of 19"
// is a thing a reader can count, and each one names itself when pointed at.
const FIELDS = [
  'SUBJECT', 'SITE', 'PROTOCOL', 'ARM', 'CYCLE',
  'DAY', 'DOSE', 'UNIT', 'ROUTE', 'LOINC',
  'VALUE', 'RANGE', 'GRADE', 'CTCAE', 'ONSET',
  'ACTION', 'SOURCE', 'PAGE', 'HASH',
].map((name, index) => {
  const x = -56 + (index % 5) * 28
  const y = -42 + Math.floor(index / 5) * 28
  return { name, x, y, at: CONTRACT.p(x, y) }
})

// The ledger writes one row per committed run, front row last.
const LEDGER = [-28, 0, 28]

// The descent. Screen stations down the one axis at x = CX, and the reveal
// scale that maps a phase onto them.
const STATIONS = LAYERS.map((layer) => layer.cy)
const SPAN = RECEIPT.cy - SURFACE.cy
const at = (y) => Math.round(((y - SURFACE.cy) / SPAN) * 10000) / 100

// Six segments: through each deck body, then across each open gap. Hidden runs
// are drawn dashed on top of the solid they pass through, which is how a
// drawing says "this continues behind here" without breaking the line.
const RUN = STATIONS.slice(0, 3).flatMap((cy) => {
  const under = cy + DROP + THICK
  const next = cy + SEP
  return [
    { key: `in${cy}`, hidden: true, y1: cy, y2: under, from: at(cy), to: at(under) },
    { key: `out${cy}`, hidden: false, y1: under, y2: next, from: at(under), to: at(next) },
  ]
})

const GATE_AT = at(AUTHORITY.cy)

const PHASES = [
  { span: 2.4, reveal: 0, bound: 0, gate: 'shut', receipt: false, tone: 'run', status: 'PROPOSING', read: 'Any of the three surfaces can propose. A proposal carries no authority.' },
  { span: 1.2, reveal: at(CONTRACT.cy), bound: 11, gate: 'shut', receipt: false, tone: 'run', status: 'VALIDATING', read: 'Checking the proposal against task contract T-07 v3.' },
  { span: 1.2, reveal: at(CONTRACT.cy + DROP + THICK), bound: 19, gate: 'shut', receipt: false, tone: 'valid', status: 'BOUND', read: '19 of 19 fields bound. The contract is satisfied.' },
  { span: 3.2, reveal: GATE_AT, bound: 19, gate: 'shut', receipt: false, tone: 'hold', status: 'HELD', read: 'Stopped on the site deck. The aperture stays shut until a person signs.' },
  { span: 1.4, reveal: at(AUTHORITY.cy + DROP + THICK), bound: 19, gate: 'open', receipt: false, tone: 'signed', status: 'SIGNED', read: 'M. Avdol, PI at Site 018, 14:07. The authority never left the site.' },
  { span: 2.2, reveal: 100, bound: 19, gate: 'open', receipt: true, tone: 'signed', status: 'RECEIPTED', read: 'REV-018-TR3-1044 - replayable later without the model that proposed it.' },
]

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

/** A solid: three faces of one ink, rounded where they meet. */
function Faces({ shape, className }) {
  return (
    <g className={className}>
      <polygon className="dgm-face-left" points={shape.faceLeft} />
      <polygon className="dgm-face-right" points={shape.faceRight} />
      <polygon className="dgm-face-top" points={shape.top} />
    </g>
  )
}

/** A label tied to a real edge, carrying the deck's live value under its name. */
function Rail({ layer, live, hot, fact, probe }) {
  return (
    <g className={`dgm-rail${live ? ' is-live' : ''}${hot ? ' is-hot' : ''}`} {...probe}>
      <line className="dgm-leader" x1={layer.right[0]} y1={layer.right[1]} x2="424" y2={layer.right[1]} />
      <circle className="dgm-railnode" cx="424" cy={layer.right[1]} r="2.6" />
      <text className="dgm-side" x="434" y={layer.right[1] - 3}>{layer.label}</text>
      <text className="dgm-sidefact" x="434" y={layer.right[1] + 12}>{fact}</text>
    </g>
  )
}

export default function TridentSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const spread = useScrollSpread({ reduced })
  const phase = useScrollPhase(PHASES, { reduced, target: section })
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
    contract: `${state.bound} / 19 BOUND`,
    authority: open ? 'SIGNED - M. AVDOL' : 'SHUT - NEEDS A SIGNATURE',
    receipt: state.receipt ? 'REV-018-TR3-1044' : 'NOT YET WRITTEN',
  }

  return (
    <figure className="dgm">
      <figcaption className="dgm-head">
        <strong>What a harness is for</strong>
        <p>Swap the provider without renegotiating anything. The site still decides, and the run is still replayable a year later.</p>
        <small>Run 018-017 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={spread}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three kinds of proposal source sit above the harness, drawn identically because any of them can be swapped for another. Inside the harness a proposal descends a single axis through a schema contract deck to a site authority deck, where a shut aperture holds it until a named person at the site signs, and only then does it reach the receipt ledger. The part inside the bracket is what does not change when the model does."
        >
          <defs>
            <pattern id="tr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
            <pattern id="tr-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
          </defs>

          <text className="dgm-micro" x="20" y="26">ANY SOURCE - INTERCHANGEABLE</text>
          <text className="dgm-micro is-quiet" x="600" y="26" textAnchor="end">ONE HARNESS - EVERY RUN THE SAME</text>

          {/* The harness itself. The three sources sit outside this bracket and
              can be swapped for each other; everything inside it is the part
              that does not change when they are. */}
          <g className="dgm-harness">
            <path className="dgm-bracket" d="M 122 158 H 106 A 7 7 0 0 0 99 165 V 559 A 7 7 0 0 0 106 566 H 122" />
            <text className="dgm-brackettext" x="88" y="362" textAnchor="middle" transform="rotate(-90 88 362)">TRIDENT - THE HARNESS</text>
          </g>

          {/* The ground the stack is measured against. Two hairlines carry the
              footprint down from the top deck, so the four decks read as one
              plan seen at four heights rather than four unrelated shapes. */}
          <g className="dgm-ground">
            <line className="dgm-axis" x1={SURFACE.left[0]} y1={SURFACE.left[1]} x2={SURFACE.left[0]} y2="572" />
            <line className="dgm-axis" x1={SURFACE.right[0]} y1={SURFACE.right[1]} x2={SURFACE.right[0]} y2="572" />
            <g transform={planSpace(CX, 572)}>
              <rect className="dgm-plane" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx="18" vectorEffect="non-scaling-stroke" />
              <rect className="dgm-planefill" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx="18" fill="url(#tr-grain)" />
            </g>
            <text className="dgm-edge" x="140" y="577" transform={`rotate(${EDGE_ANGLE} 140 577)`}>ONE FOOTPRINT</text>
            <text className="dgm-edge" x="376" y="577" textAnchor="end" transform={`rotate(${-EDGE_ANGLE} 376 577)`}>FOUR HEIGHTS</text>
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
                <circle className="dgm-port" cx="0" cy="0" r="9" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} fact={facts.receipt} probe={probe('receipt')} />
            <g className={`dgm-seal${state.receipt ? ' is-struck' : ''}`}>
              <rect className="dgm-sealbody" x="434" y={RECEIPT.right[1] + 22} width="96" height="28" rx="14" />
              <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="444" y={RECEIPT.right[1] + 26} width="17" height="20" />
              <text className="dgm-sealtext" x="468" y={RECEIPT.right[1] + 41}>SEALED</text>
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
                <rect className="dgm-aperture" x="-22" y="-22" width="44" height="44" rx="8" fill="url(#tr-hatch)" />
                <g className={`dgm-leaf is-left${open ? ' is-open' : ''}`}>
                  <rect x="-22" y="-22" width="22" height="44" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <g className={`dgm-leaf is-right${open ? ' is-open' : ''}`}>
                  <rect x="0" y="-22" width="22" height="44" rx="6" vectorEffect="non-scaling-stroke" />
                </g>
                <rect className={`dgm-gatering is-${state.gate}`} x="-26" y="-26" width="52" height="52" rx="10" vectorEffect="non-scaling-stroke" />
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
                    x={cell.x - 10}
                    y={cell.y - 10}
                    width="20"
                    height="20"
                    rx="6"
                    vectorEffect="non-scaling-stroke"
                    onMouseEnter={() => setField(index)}
                    onMouseLeave={() => setField((current) => (current === index ? null : current))}
                  />
                ))}
                <circle className="dgm-port" cx="0" cy="0" r="9" vectorEffect="non-scaling-stroke" />
              </g>
            </g>
            <Rail layer={CONTRACT} live={state.bound > 0} hot={hot === 'contract'} fact={facts.contract} probe={probe('contract')} />
            {field === null ? null : (
              <g className="dgm-tag is-named">
                <line className="dgm-leader" x1="112" y1={FIELDS[field].at[1]} x2={FIELDS[field].at[0] - 10} y2={FIELDS[field].at[1]} />
                <rect className="dgm-tagbody" x="14" y={FIELDS[field].at[1] - 10} width="98" height="20" rx="10" />
                <text className="dgm-tagtext" x="63" y={FIELDS[field].at[1] + 4} textAnchor="middle">{FIELDS[field].name}</text>
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
                y1={item.plate.front[1]}
                x2={item.pad[0]}
                y2={item.pad[1]}
              />
            ))}

            <g className={`dgm-deck is-live${lit('surface')}`} {...probe('surface')}>
              <Faces shape={SURFACE} className="dgm-solid" />
              <g transform={planSpace(CX, SURFACE.cy)}>
                <rect className="dgm-planefill" x={-HALF + 8} y={-HALF + 8} width={HALF * 2 - 16} height={HALF * 2 - 16} rx="12" fill="url(#tr-grain)" />
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

          {/* The axis. Solid in the open, dashed where it runs through a solid. */}
          {RUN.map((leg) => {
            const cut = Math.min(1, Math.max(0, (state.reveal - leg.from) / (leg.to - leg.from)))
            return (
              <line
                className={`dgm-run${leg.hidden ? ' is-hidden' : ''} is-${state.gate}`}
                key={leg.key}
                x1={CX}
                y1={leg.y1}
                x2={CX}
                y2={leg.y2}
                pathLength="100"
                // A hidden run keeps its dash pattern, so it cannot also use the
                // dash offset to reveal itself. Every phase lands on a station
                // boundary, so a hidden leg is only ever fully behind or fully
                // through, and fades rather than draws.
                style={leg.hidden ? { '--cut': cut } : { strokeDashoffset: 100 - cut * 100 }}
              />
            )
          })}

          <line className="dgm-rule" x1="20" y1="640" x2="600" y2="640" />
          <rect className="dgm-status" x="20" y="654" width="122" height="26" rx="13" />
          <text className="dgm-statustext" x="81" y="671" textAnchor="middle">{state.status}</text>
          <text className="dgm-read" x="156" y="671">{state.read}</text>
        </svg>
      </div>
    </figure>
  )
}

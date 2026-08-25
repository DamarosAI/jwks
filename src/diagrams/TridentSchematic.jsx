import { useState } from 'react'

import { jitter, planSpace, roundedDeck } from './iso'
import { Faces } from './Solid'
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
 * The approval deck carries a shutter set in a frame. It is shut, bolted at the
 * seam, and the descent halts on it. Nothing about it is a status light: the
 * blades are across the hole, and when a named person at the site signs, the
 * bolts withdraw and the blades run back into the frame.
 *
 * Every deck runs its own mechanism, and runs it unattended. The plates ride
 * over the intake and keep proposing; the intake keeps drawing the queue down
 * its runs and swallowing them; the contract keeps walking its nineteen fields
 * in the order it checks them; something keeps trying the shutter and the bolts
 * keep taking it; and the ledger keeps posting, each hash travelling the link to
 * the row it commits. That is the difference between a machine and a diagram of
 * one, and it is the whole reason the pointer is no longer load-bearing: what a
 * reader does with the cursor is lean on a mechanism that is already running -
 * the intake carries a second mark, the contract re-checks from the first field,
 * the ledger lights its chain, the shutter gives and holds. Nothing is hidden
 * behind a hover, because nothing was ever worth hiding behind a four-pixel
 * target.
 *
 * None of it runs while the figure is still assembling: every ambient clock is
 * held at zero opacity until `--charge` comes up, so the stack lands and then
 * the system starts, rather than arriving already busy. Scroll advances the run;
 * the pointer reads it; neither is needed for it to be alive.
 *
 * Nothing here names a vendor. The three sources are kinds of proposer, not
 * products, because the claim is about authority and not about whose model it
 * is: any of them can propose, none of them can decide.
 */

const CX = 258
const HALF = 76
const THICK = 11
const RAD = 16
const SEP = 104
const TOP = 196
const MIDDLE = TOP + SEP * 1.5
const GROUND = 562

// One plain word per deck. `PROPOSAL SURFACE` and `SITE AUTHORITY` are what
// these decks are called inside the product; a reader meeting the figure for
// the first time should not have to learn four two-word terms to follow a
// drawing whose whole point is that it is obvious. The rail underneath each
// one still carries the exact value, so nothing is lost by being plain.
const LAYERS = [
  { key: 'surface', label: 'PROPOSAL' },
  { key: 'contract', label: 'SCHEMA' },
  { key: 'authority', label: 'APPROVAL' },
  { key: 'receipt', label: 'LEDGER' },
].map((layer, index) => {
  const cy = TOP + index * SEP
  return {
    ...layer,
    cy,
    ...roundedDeck(CX, cy, HALF, THICK, RAD),
    // Where this deck rests while the stack is still closed.
    lift: Math.round((MIDDLE - cy) * 0.44),
    // Its own drift clock, so the four tiers never breathe in step.
    life: jitter(index, 12),
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
    FIELDS.push({ name: NAMES[cursor], x, y, at: CONTRACT.p(x, y), seq: Math.round((cursor / 19) * 100) / 100 })
    cursor += 1
  }
})

// The shutter on the approval deck, in plan.
//
// It used to be a housing, a rebate, a ring and two rounded leaves - four
// nested rounded squares that collapsed into one grey blob at reading size -
// with a hand-drawn signature stroke laid over the top of them, which measured
// out as overlapping the ring it sat beside. The leaves were worse: split at
// plan x = 0 and stroked all the way round, each one projected to a
// parallelogram, so the two met on a diagonal and the seam came out as a
// doubled line with a notch at either end.
//
// So: one frame, one opening, and two blades clipped to that opening. The clip
// takes every edge of a blade except the one at the seam, which is the only
// edge that should ever be visible, and it guarantees a blade can never be
// drawn outside the hole it is supposed to be filling.
const SHUT_FRAME = 50
const SHUT_HOLE = 30
const BLADE = 36

// Two bolts across the seam. Shut is a mechanism holding, not a light that has
// gone red: they lie over the join itself, bridging the two blades, and
// withdraw along it into the frame when the site signs. Set at the ends of the
// seam instead they read as tabs stuck to the side of the opening, which is a
// picture of a shut thing rather than a drawing of what is holding it shut.
const BOLTS = [-1, 1]

// The ledger writes one row per committed run, each chained to the row above it
// by its hash, front row last. Each row carries the revision it is a record of,
// so pointing at one can show which run it belongs to rather than say so.
const LEDGER = [-33, -11, 11, 33].map((y, index, all) => ({
  y,
  index,
  seq: Math.round((index / all.length) * 100) / 100,
  rev: `REV-018-TR3-104${index + 1}`,
}))

// The descent. One short drop per deck, and it belongs to the deck it lands on
// - drawn inside that deck's group, so it travels with the solid it is bolted
// to. Its head starts under the skirt of the deck above, which is why lifting
// either one never opens a gap: there is no free end left to hang.
const DROPS = LAYERS.slice(1).map((deck, index) => {
  const [x, y] = deck.left
  // Eleven pixels under the deck above, not six. Thirteen pixels right of that
  // deck's left corner its front edge has already fallen five, so a head at six
  // sat less than a pixel inside an eleven-pixel skirt - fine while the stack
  // was rigid, and the moment the tiers started drifting apart the head came out
  // from under the deck it is supposed to be tucked into. Eleven puts it in the
  // middle of the band, with five pixels of tolerance either way.
  const head = [x + 13, Math.round((y - SEP + 11) * 100) / 100]
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
  contract: { tone: 'valid', pill: 'CHECKED', read: 'Task contract T-07 v3. Nineteen named fields, each checked before anything moves.' },
  authority: { tone: 'hold', pill: 'GATED', read: 'The shutter is shut. It opens for a signature from the site, and for nothing else.' },
  receipt: { tone: 'signed', pill: 'LEDGER', read: 'One row per committed run, each one chained to the row above it by its hash.' },
}

/**
 * A field answers for itself. It is the one part of the stack small enough to
 * need naming and numerous enough to be worth pointing at - nineteen of them in
 * a grid a reader sweeps across without aiming.
 *
 * Everything else a deck does, it does on its own: the intake keeps drawing
 * proposals off the queue, the contract keeps walking its fields, the ledger
 * keeps posting rows, and the shutter keeps taking the load. None of that was
 * ever worth hiding behind a four-pixel target, and a mechanism that only moves
 * when a cursor finds it is not a machine, it is a tooltip.
 */
function fieldCue(index, state) {
  if (index === null) return null
  return index < state.bound
    ? { tone: 'valid', pill: 'CHECKED', read: `${FIELDS[index].name} checked against task contract T-07 v3.` }
    : { tone: 'run', pill: 'UNCHECKED', read: `${FIELDS[index].name} has not been checked, so nothing below has moved.` }
}

const LOOP = 'M -6 -13 H 6 A 13 13 0 0 1 6 13 H -6 A 13 13 0 0 1 -6 -13 Z'

const MOTIFS = {
  // A distribution standing on the plate: a model's output is a shape over
  // possibilities, and the uneven heights are the only part of that a mark this
  // size can carry. Four stacked bars, which is what this was, is a list icon -
  // the same doodle every menu button in the world already uses.
  MODEL: [7, 13, 21, 26, 20, 11, 6].map((height, slot) => {
    const x = -21 + slot * 7
    return <rect key={x} x={x - 2} y={13 - height} width="4" height={height} rx="1.5" vectorEffect="non-scaling-stroke" />
  }),
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
      <circle className="dgm-loopnode" key={`${x}:${y}`} cx={x} cy={y} r="2.4" />
    )),
  ],
  // A schedule: one rule, evenly spaced runs standing on it, and the one that
  // has just fired. Even spacing is the whole difference between this mark and
  // the model's beside it - a job runs on the clock, a model does not. Six
  // rounded tiles in two rows, which is what this was, is an app launcher.
  AUTOMATION: [
    <line key="rule" x1="-22" y1="13" x2="22" y2="13" vectorEffect="non-scaling-stroke" />,
    ...[0, 1, 2, 3, 4, 5].map((slot) => {
      const fired = slot === 3
      const x = -18 + slot * 7.2
      return (
        <rect
          className={fired ? 'is-on' : undefined}
          key={x}
          x={x - 2.5}
          y={fired ? -10 : -3}
          width="5"
          height={fired ? 23 : 16}
          rx="1.5"
          vectorEffect="non-scaling-stroke"
        />
      )
    }),
  ],
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
  const [figure, phase, booted] = useScrollRun(PHASES, { reduced })
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

  const touch = (index) => ({
    onMouseEnter: () => setField(index),
    onMouseLeave: () => setField((current) => (current === index ? null : current)),
  })

  // Every deck runs on its own. Pointing at one leans on the mechanism it is
  // already running rather than opening a panel about it: the intake pulls a
  // second mark down every run, the contract re-checks its fields from the
  // first, the ledger lights the chain that holds it together, and the shutter
  // gives a hair against its bolts and comes straight back to shut. The deck is
  // the target because the deck is the size of a thing a reader can point at -
  // a queue chip and a ledger row are four pixels of nothing anybody would aim
  // for, which is why the mechanisms that used to hide behind them now run
  // whether or not a cursor ever arrives.
  const tried = hot === 'authority' && !open

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
    authority: open ? 'SIGNED A. VOSS 09:41Z' : 'SHUT - NEEDS A SIGNATURE',
    receipt: state.receipt ? LEDGER[LEDGER.length - 1].rev : 'NOT YET WRITTEN',
  }

  const cue = fieldCue(field, state) ?? READS[hot]
  const tone = cue?.tone ?? state.tone
  const pill = cue?.pill ?? state.status
  const read = cue?.read ?? RESTING

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${tone}${animate ? ' is-live' : ''}${booted ? ' is-booted' : ''}`}
          ref={figure}
          viewBox="0 0 620 700"
          role="img"
          aria-label="Three kinds of proposal source - a model, an agent loop and a scheduled job - sit above one site, drawn identically because any of them can be swapped for another. A proposal lands on an intake deck, drops to a schema contract deck of nineteen named fields, and drops again to an approval deck where a shutter holds it closed until a named person at the site signs. Only then does it reach the receipt ledger, where every row is chained to the row above it by its hash."
        >
          <defs>
            <pattern id="tr-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
            <pattern id="tr-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            {/* The opening the blades run in. Clipping to it is what keeps a
                blade inside the hole it is filling, at any throw. */}
            <clipPath id="tr-hole">
              <rect x={-SHUT_HOLE} y={-SHUT_HOLE} width={SHUT_HOLE * 2} height={SHUT_HOLE * 2} rx="8" />
            </clipPath>
          </defs>

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="22" y="16" width="34" height="40" />

          <g className="dgm-count">
            <rect className="dgm-countbody" x="446" y="22" width="154" height="30" rx="15" />
            <text className="dgm-countval" x="462" y="41">{state.bound}/19</text>
            <text className="dgm-countkey" x="500" y="41">FIELDS BOUND</text>
          </g>

          {/* The ground the stack is measured against. Two hairlines carry the
              footprint down from the top deck, so the four decks read as one
              plan seen at four heights rather than four unrelated shapes. They
              are drawn from the ground upwards and gated on `--charge`, so as
              the figure takes power the footprint climbs out of the plan and
              ties the stack together in front of the reader. */}
          {/* Each hairline stops five pixels below the top deck's corner rather
              than on it. The skirt there is a vertical edge collinear with the
              hairline and eleven pixels deep, so the two overlap and read as one
              line - and the tier can drift its three pixels without the corner
              pulling away from the footprint it is supposed to be standing on.
              Every deck below occludes its own band of the same hairline. */}
          <g className="dgm-ground">
            <line className="dgm-axis" pathLength="100" x1={SURFACE.left[0]} y1={GROUND} x2={SURFACE.left[0]} y2={SURFACE.left[1] + 5} />
            <line className="dgm-axis" pathLength="100" x1={SURFACE.right[0]} y1={GROUND} x2={SURFACE.right[0]} y2={SURFACE.right[1] + 5} />
            <g transform={planSpace(CX, GROUND)}>
              <rect className="dgm-plane" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} vectorEffect="non-scaling-stroke" />
              <rect className="dgm-planefill" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} fill="url(#tr-grain)" />
            </g>
            <text className="dgm-edge is-caption" x={CX} y="626" textAnchor="middle">ONE PLAN - FOUR HEIGHTS</text>
          </g>

          {/* Decks, top last: the deck above occludes the one it sits over, and
              occludes the head of the drop that lands on it. */}
          <g className="dgm-slide" style={{ '--lift': `${RECEIPT.lift}px`, '--life': RECEIPT.life }}>
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
                {/* The chain is drawn a link at a time rather than as one rule
                    down the margin, and each link carries the hash down to the
                    row below it on the ledger's own clock. A ledger is a ledger
                    because of that link, and it was the one thing in the deck a
                    reader could not see happen. */}
                {LEDGER.slice(1).map((row) => (
                  <g key={row.y} style={{ '--seq': row.seq }}>
                    <line
                      className="dgm-ledgerchain"
                      x1="-54"
                      y1={LEDGER[row.index - 1].y}
                      x2="-54"
                      y2={row.y}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      className="dgm-ledgerflow"
                      pathLength="100"
                      x1="-54"
                      y1={LEDGER[row.index - 1].y}
                      x2="-54"
                      y2={row.y}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
                {LEDGER.map((row) => {
                  const last = row.index === LEDGER.length - 1
                  const written = state.receipt || !last
                  return (
                    <g
                      className={`dgm-ledgerrow${written ? ' is-written' : ''}`}
                      key={row.y}
                      style={{ '--seq': row.seq }}
                    >
                      <rect className="dgm-ledgerbar" x="-44" y={row.y - 5.5} width="96" height="11" rx="3" vectorEffect="non-scaling-stroke" />
                      <rect className="dgm-ledgerhash" x="-59" y={row.y - 4.5} width="9" height="9" rx="2" vectorEffect="non-scaling-stroke" />
                      <rect className="dgm-ledgertick" x="-37" y={row.y - 1.5} width="30" height="3" rx="1.5" />
                      <rect className="dgm-ledgertick" x="0" y={row.y - 1.5} width={last ? 28 : 17} height="3" rx="1.5" />
                      <rect className="dgm-ledgerseal" x="41" y={row.y - 3.5} width="7" height="7" rx="2" />
                    </g>
                  )
                })}
              </g>
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} fact={facts.receipt} probe={probe('receipt')} />
          </g>

          <g className="dgm-slide" style={{ '--lift': `${AUTHORITY.lift}px`, '--life': AUTHORITY.life }}>
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
                {/* The shutter. Shut is drawn shut - two blades across a hole,
                    bolted at the seam - so the claim survives with every colour
                    removed. Push on it with the pointer and it answers the way
                    the mechanism would: the blades give a hair, the bolts take
                    the load, and it comes straight back. */}
                {/* Open is carried on the group, not inferred, so the frame can
                    stop bracing against something nobody is holding any more. */}
                <g className={`dgm-shutter${open ? ' is-open' : ''}${tried ? ' is-tried' : ''}`}>
                  <rect className="dgm-housing" x={-SHUT_FRAME} y={-SHUT_FRAME} width={SHUT_FRAME * 2} height={SHUT_FRAME * 2} rx="13" vectorEffect="non-scaling-stroke" />
                  <rect className="dgm-aperture" x={-SHUT_HOLE} y={-SHUT_HOLE} width={SHUT_HOLE * 2} height={SHUT_HOLE * 2} rx="8" fill="url(#tr-hatch)" />
                  <g clipPath="url(#tr-hole)">
                    <g className={`dgm-leaf is-left${open ? ' is-open' : ''}`} style={{ '--blade': -1 }}>
                      <rect x={-BLADE} y={-BLADE} width={BLADE} height={BLADE * 2} vectorEffect="non-scaling-stroke" />
                    </g>
                    <g className={`dgm-leaf is-right${open ? ' is-open' : ''}`} style={{ '--blade': 1 }}>
                      <rect x="0" y={-BLADE} width={BLADE} height={BLADE * 2} vectorEffect="non-scaling-stroke" />
                    </g>
                  </g>
                  {/* Drawn over the blades, so the hole keeps one clean edge
                      whatever is behind it. */}
                  <rect className={`dgm-holerim is-${state.gate}`} x={-SHUT_HOLE} y={-SHUT_HOLE} width={SHUT_HOLE * 2} height={SHUT_HOLE * 2} rx="8" vectorEffect="non-scaling-stroke" />
                  {BOLTS.map((end) => (
                    <rect
                      className={`dgm-bolt${open ? ' is-clear' : ''}`}
                      key={end}
                      style={{ '--end': end }}
                      x="-13"
                      y={end * 14 - 4.5}
                      width="26"
                      height="9"
                      rx="3"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </g>
              </g>
            </g>
            <Rail layer={AUTHORITY} live={open} hot={hot === 'authority'} fact={facts.authority} probe={probe('authority')} />
          </g>

          <g className="dgm-slide" style={{ '--lift': `${CONTRACT.lift}px`, '--life': CONTRACT.life }}>
            <g className={`dgm-deck${state.bound > 0 ? ' is-live' : ''}${lit('contract')}`} {...probe('contract')}>
              <Faces shape={CONTRACT} className="dgm-solid" />
              <Drop leg={DROPS[0]} drops={state.drops} />
              <g transform={planSpace(CX, CONTRACT.cy)}>
                {/* The contract walks its own fields. `--seq` is the field's
                    place in the run, so the check travels the grid in the order
                    the contract checks it rather than nineteen tiles blinking
                    independently, which is a decoration and not a pass. */}
                {FIELDS.map((cell, index) => (
                  <rect
                    className={`dgm-fieldtile${index < state.bound ? ' is-bound' : ''}${field === index ? ' is-named' : ''}`}
                    key={cell.name}
                    style={{ '--seq': cell.seq }}
                    x={cell.x - 9}
                    y={cell.y - 9}
                    width="18"
                    height="18"
                    rx="5"
                    vectorEffect="non-scaling-stroke"
                    {...touch(index)}
                  />
                ))}
                {/* The field answers in the tile, not in the margin: a tick if
                    the contract has checked it, an open bar if it has not. The
                    name in the tag is only there to say which one it was. */}
                {field === null ? null : (
                  <path
                    className="dgm-fieldcheck"
                    d={field < state.bound
                      ? `M ${FIELDS[field].x - 4.4} ${FIELDS[field].y + 0.4} l 3.1 3.3 l 5.9 -6.8`
                      : `M ${FIELDS[field].x - 4.4} ${FIELDS[field].y} h 8.8`}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
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
              nothing detaches while the stack is still opening.

              Each leader starts five pixels up inside the skirt of the plate it
              hangs from rather than on its bottom tip, and the plates are drawn
              last, so the head is always hidden under the solid. That is what
              lets a plate ride: an endpoint parked exactly on a silhouette parts
              from it the moment either end moves. */}
          <g className="dgm-slide" style={{ '--lift': `${SURFACE.lift}px`, '--life': SURFACE.life }}>
            {SOURCES.map((item) => (
              <line
                className={`dgm-leader${lit(item.key)}`}
                key={`lead-${item.key}`}
                x1={item.plate.front[0]}
                y1={item.plate.front[1] + item.plate.height - 5}
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
                {/* The intake never stops pulling. Each waiting proposal has a
                    run to the throat, and a mark keeps travelling it - so the
                    deck is seen doing the one thing it is for, whether or not
                    anybody is pointing at it.

                    The run is drawn twice, the way a drop is: a hairline that is
                    always there, and the mark that travels it. With only the
                    mark, four chips sat in a corner unattached to anything for
                    most of every cycle. */}
                {QUEUE.map((chip) => (
                  <g key={`in-${chip.step}`} style={{ '--life': chip.life }}>
                    <line className="dgm-intakepath" x1={chip.x} y1={chip.y} x2="0" y2="0" vectorEffect="non-scaling-stroke" />
                    <line className="dgm-intake" pathLength="100" x1={chip.x} y1={chip.y} x2="0" y2="0" vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
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
                  style={{ '--life': item.life }}
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

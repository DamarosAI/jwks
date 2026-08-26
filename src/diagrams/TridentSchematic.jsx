import { useState } from 'react'

import { jitter, planCyl, planDrop, planPrism, planSpace, roundedDeck } from './iso'
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
 * The approval deck carries a gate set in a barrel. It is closed - two blades
 * overlapped across the bore - and the descent halts on it. Nothing about it is
 * a status light: the blades are across the hole, and when a named person at the
 * site signs they run out along the deck's own axis and the way through opens
 * between them.
 *
 * Every deck runs its own mechanism, and runs it unattended. The plates ride
 * over the intake and keep proposing; the intake keeps drawing the queue down
 * its runs and swallowing them; the contract keeps walking its nineteen fields
 * in the order it checks them; something keeps trying the gate and the two
 * blades keep holding it; and the ledger keeps posting, each hash travelling to
 * the row it commits. That is the difference between a machine and a diagram of
 * one, and it is the whole reason the pointer is no longer load-bearing: what a
 * reader does with the cursor is lean on a mechanism that is already running -
 * the intake carries a second mark, the contract re-checks from the first field,
 * the ledger lights its chain, the gate braces and holds. Nothing is hidden
 * behind a hover, because nothing was ever worth hiding behind a four-pixel
 * target.
 *
 * Under all of that are two quieter layers, running at rates nothing else here
 * uses. Every small solid standing on a deck - nineteen contract fields, four
 * waiting proposals, three landing pads - settles on its own long clock, half a
 * pixel at a time; and a tine with no proposal on it still creeps its dashes
 * toward the intake, because a source that has not published this second is
 * still attached. Rates are what make a drawing read as a system rather than as
 * a loop: the throat swallows in two seconds, the contract walks its fields in
 * six, a tier breathes in eight, and the things standing on it settle in twelve.
 *
 * None of it runs while the figure is still assembling: every ambient clock is
 * held at zero opacity until `--charge` comes up, so the stack lands and then
 * the system starts, rather than arriving already busy. Scroll advances the run;
 * the pointer reads it; neither is needed for it to be alive.
 *
 * THE WHOLE STACK IS ONE INK, AND IT DEEPENS AS THE RUN DESCENDS.
 *
 * The four decks used to carry four hues - violet for the machine tier, blue for
 * the contract, amber for the one holding and green for the one that had
 * committed - on the theory that the deck owning a state should own a colour.
 * The theory is sound and the drawing it produced was not: four saturated hues
 * stacked over one plan is four unrelated objects, and the two warm ones sat
 * forward of the two cool ones, so the middle of the figure bowed out of the
 * page. A governed stack that reads as four things bolted together is arguing
 * against its own claim, which is that this is one instrument.
 *
 * So it is one blue at four depths, and the depth is the order: authority
 * accumulates on the way down, and the ledger is the darkest thing in the
 * drawing because it is the only deck nothing can be taken back out of. A drop
 * takes the ink of whatever it lands on, so the descent gets visibly heavier
 * three times rather than changing colour three times.
 *
 * Nothing here names a vendor. The three sources are kinds of proposer, not
 * products, because the claim is about authority and not about whose model it
 * is: any of them can propose, none of them can decide.
 */

const CX = 258
const HALF = 76
// Fifteen, not eleven. A deck is a solid held in the air, and at eleven the two
// skirt faces were a band too thin to read as sides - four tiers came out as
// four outlines printed on one sheet. The extra four pixels are what let the
// body colours separate and the tier read as an object with a thickness.
const THICK = 15
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
//
// Each one also carries its own ink, set on the tier in the stylesheet: violet
// for the machine tier, blue for the contract, amber for the deck that is
// holding and green for the one that has committed. Those are the four states
// the run passes through, so the deck that owns a state owns the colour - which
// is why a drop takes the ink of whichever deck it lands on and the descent
// visibly changes hands on its way down.
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

// What each tier is held above, and therefore where its shade falls: the deck
// below it, or the ground for the bottom one. A slab floating over a plane
// darkens it - that is not a light source, it is the absence of one - and it is
// the only cue in an axonometric that says four tiers are apart rather than
// stacked. Each shade carries the clock of the tier casting it, so it spreads
// as that tier rises and tightens as it comes back down.
const SEATS = LAYERS.map((deck, index) => ({
  key: deck.key,
  onto: index === LAYERS.length - 1 ? GROUND : LAYERS[index + 1].cy,
  life: deck.life,
}))

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
  plate: roundedDeck(source.cx, source.y, 34, 9, 12),
  pad: SURFACE.p(...source.land),
  // The landing pad is a puck standing on the deck, not an ellipse painted on
  // it. A plan disc is a plan square whose corner radius is its own half-size,
  // so it comes out of the same construction as everything else here.
  puck: planPrism(source.land[0], source.land[1], 12, 12, 4, 12),
  life: jitter(index, 4),
}))

const HUB = SURFACE.p(0, 0)

// Proposals waiting their turn, in the one quadrant of the intake deck that no
// source lands in. A queue is what an intake looks like when it is working.
const QUEUE = [0, 1, 2, 3].map((step) => {
  const x = 14 + step * 13
  return { step, x, y: 52, life: jitter(step, 21), block: planPrism(x, 52, 5, 5, 5, 3) }
})

// 19 contract fields as a plan grid, laid out 5-5-5-4 with the short row
// centred. Nineteen is the count, so the grid is the count: it is a thing a
// reader can total, and the centre is left clear rather than pinned under a
// node the tiles have to make room for.
// The nineteen fields, and they are not decoration. These are the variable
// names a study actually carries - CDISC, the standard every regulated trial
// submits in - grouped one domain to a row, which is why the grid is five, five,
// five and four rather than an even block:
//
//   who and where   DM and SV: the study, the site, the subject, the arm they
//                   were assigned to and the visit this run belongs to
//   what was given  EX: the treatment, the dose, its units, the route and when
//                   it started
//   what was read   LB: the lab test, the result as collected, its units,
//                   whether it fell outside the reference range, and when
//   what was judged AE: the reported term, the CTCAE toxicity grade, whether it
//                   was serious, and what was done about the treatment
//
// A reader who works in trials recognises every one of these on sight, and the
// row a field sits in tells them which domain it came from before they read it.
// That is the whole claim of this deck made in nineteen words: a task does not
// run on "the data", it runs on named fields from named domains, each checked.
//
// Each one also carries what it is checked against, because that is the only
// part of this deck a reader cannot see. A tile that rises has visibly been
// checked; what the drawing could not say is checked against WHAT - and
// "against task contract T-07 v3", repeated nineteen times, is the answer to a
// question nobody asked. A field is bound by being matched to a specific
// authority: a register, a roster, a randomisation list, a lab manual, a
// dictionary, a grading scale. Naming that authority is the whole content of
// this deck, and it is different for every one of the nineteen.
const NAMES = [
  ['STUDYID', 'against the protocol registered for this study'],
  ['SITEID', 'against the site roster on the delegation log'],
  ['USUBJID', 'against the enrolment list held at this site'],
  ['ARMCD', 'against the arm the randomisation list assigned'],
  ['VISITNUM', 'against the visit in the schedule of assessments'],
  ['EXTRT', 'against the study treatment the protocol names'],
  ['EXDOSE', 'against the dose level this arm is allowed'],
  ['EXDOSU', 'against the units the protocol doses in'],
  ['EXROUTE', 'against the route of administration on label'],
  ['EXSTDTC', 'against the dosing window for this visit'],
  ['LBTESTCD', 'against the assay the lab manual specifies'],
  ['LBORRES', 'against the result as the lab reported it'],
  ['LBORRESU', 'against the units on the lab report itself'],
  ['LBNRIND', 'against this lab reference range for this subject'],
  ['LBDTC', 'against the collection window for this visit'],
  ['AETERM', 'against the MedDRA preferred term'],
  ['AETOXGR', 'against the CTCAE grade for this term'],
  ['AESER', 'against the regulatory seriousness criteria'],
  ['AEACN', 'against the dose-modification rules for this arm'],
]

// Each field is a solid standing on the deck, not a tile printed on it. Bound,
// it is up on its own storey with two side faces under it; unbound, the same
// footprint is lying flat on the deck waiting to be built on. So the count is
// something a reader watches rise rather than watches change colour, and the
// deck a reader spends longest on has a relief instead of a wallpaper.
const FIELD_HALF = 9
const FIELD_RISE = 7

const FIELDS = []
let cursor = 0
;[5, 5, 5, 4].forEach((count, row) => {
  for (let col = 0; col < count; col += 1) {
    const x = (col - (count - 1) / 2) * 28
    const y = -42 + row * 28
    const [name, against] = NAMES[cursor]
    FIELDS.push({
      name,
      against,
      x,
      y,
      at: CONTRACT.p(x, y),
      seq: Math.round((cursor / 19) * 100) / 100,
      block: planPrism(x, y, FIELD_HALF, FIELD_HALF, FIELD_RISE, 5),
      // `seq` is the order the contract checks in, which is what the pass runs
      // on. Settling is not a run, so it gets a scattered clock instead - a
      // grid of nineteen breathing in reading order is a wave, not a relief.
      life: jitter(cursor, 17),
    })
    cursor += 1
  }
})

// The stop on the approval deck, in plan.
//
// Three mechanisms have stood here. A sliding hatch, split at plan x = 0 and
// stroked all the way round, which projected to a pair of parallelograms
// meeting on a diagonal - so the seam came out doubled with a notch at either
// end. Then two bolts drawn across the way through, which was the right claim
// on the wrong instrument: at reading size two pale bars over a sixty-pixel
// recess read as stripes. Then a six-blade diaphragm, which sealed honestly and
// drew as a pinwheel - six arcs crossing each other inside a twenty-eight pixel
// bore is more mechanism than a reader can resolve at the size this deck is
// printed at, and what they were left with was a decorated circle.
//
// It is two blades now, and the two leading edges are the whole drawing. Held,
// they lie across the bore on its own centre line, overlapped, and the run
// stops on them. Signed, they run out along a plan axis and the way through
// opens between them. One line becomes two: that is the smallest true picture
// of a stop, it is legible at any size this figure is ever printed at, and it
// needs no reader to work out what kind of instrument they are looking at.
//
// The bore is a plan circle carried through this projection, which is the same
// honest ellipse the intake deck's throat is drawn as, so the barrel reads as a
// barrel seen from above and to the side.
const SHUT_FRAME = 50
const SHUT_HOLE = 28

// The barrel is a short cylinder standing on the deck with the bore cut through
// it, so the whole assembly - bore, blades and rim - sits one storey up and the
// run arrives at the foot of something rather than at a drawing of one.
const HOUSE_RISE = 7
const BARREL = planCyl(0, 0, SHUT_FRAME, HOUSE_RISE)

// The two blades, one to each side of the bore's centre line.
//
// A blade is a plan rectangle wider and taller than the bore it runs in, and
// the clip is what gives it three of its four edges: only the leading one is
// ever inside the hole, so only the leading one is ever drawn. That is what
// keeps this to two lines rather than two outlined slabs.
const LEAVES = [-1, 1]
const LEAF_HALF = 40

// Closed is nought: each blade runs up to the centre line and stops on it, so
// the two leading edges land on the same line and the pair meets there.
//
// They used to be thrown six plan units past it each way, on the reasoning that
// a two-leaf shutter seals by overlapping and an overlap is what makes a seal
// light-tight. Both of those are true of the hardware and neither survives the
// drawing. What an overlap looks like from directly above is two edges twelve
// units apart with a band of doubled blade between them - which is not a pair
// of blades meeting, it is a pair of blades that have gone past each other, and
// the one thing this mechanism has to say at a glance is that the way through
// is closed by two parts arriving at the same place.
//
// Nought also takes a whole class of accident out of the assembly. With no
// overlap there is no blade lying on top of another blade, so neither can paint
// the other's leading edge out and neither needs to be drawn twice to get it
// back: one pass, one face and one edge per blade, and the seam down the middle
// is the two edges landing on the same line rather than a gap between them.
//
// It is also why nothing moves the blades any more except opening. See the
// stylesheet: a load that pushed them a hair further in had somewhere to go
// while they overlapped and has nowhere to go now, because past the centre line
// is through the other blade.
const LEAF_SHUT = 0

// Open parks each blade a few units inside its own side of the bore, so a
// sliver of each stays in the drawing. A blade that clears the opening entirely
// leaves nothing behind to say there was ever a blade, and the deck goes back
// to being a plate with a hole in it.
const LEAF_OPEN = 24

// The ledger writes one row per committed run, each chained to the row above it
// by its hash, front row last. Each row carries the revision it is a record of,
// so pointing at one can show which run it belongs to rather than say so.
// Spread wider than the rows used to be. Twenty-two plan units apart came out
// as seven and a half pixels on screen, and a row with a thickness is nearly
// nine - so the stack had every bar sitting on the one behind it. Twenty-six
// gives each record its own band.
const LEDGER = [-39, -13, 13, 39].map((y, index, all) => ({
  y,
  index,
  seq: Math.round((index / all.length) * 100) / 100,
  rev: `REV-018-TR3-104${index + 1}`,
  // A committed row is a bar with a thickness, standing on the deck. Same
  // construction as a field tile at another ratio, because a record and a
  // checked field are the same kind of thing to this drawing: something the
  // system now holds, and holds up.
  bar: planPrism(4, y, 48, 5.5, 5, 3),
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
  { span: 2.4, drops: 0, bound: 0, gate: 'closed', receipt: false, tone: 'run', status: 'PROPOSING' },
  { span: 1.2, drops: 1, bound: 11, gate: 'closed', receipt: false, tone: 'run', status: 'VALIDATING' },
  { span: 1.2, drops: 1, bound: 19, gate: 'closed', receipt: false, tone: 'valid', status: 'BOUND' },
  { span: 3.2, drops: 2, bound: 19, gate: 'closed', receipt: false, tone: 'hold', status: 'HELD' },
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
  authority: { tone: 'hold', pill: 'GATED', read: 'The gate is closed. It opens for a signature from the site, and for nothing else.' },
  receipt: { tone: 'signed', pill: 'LEDGER', read: 'One row per committed run, each one chained to the row above it by its hash.' },
}

/**
 * A field answers for itself, and it answers with the one fact the drawing
 * cannot draw: what it is checked against. It is the one part of the stack small
 * enough to need naming and numerous enough to be worth pointing at - nineteen
 * of them in a grid a reader sweeps across without aiming.
 *
 * The line used to say "checked against task contract T-07 v3" for all nineteen,
 * which is the identifier of the contract doing the checking and not the thing
 * being checked against. It told a reader nothing they had not already read off
 * the rail, and it told them the same nothing nineteen times. Every field now
 * names its own authority - a register, a roster, a randomisation list, a lab
 * manual, a dictionary, a grading scale - so sweeping the grid is a tour of what
 * a task contract is actually made of.
 *
 * Everything else a deck does, it does on its own: the intake keeps drawing
 * proposals off the queue, the contract keeps walking its fields, the ledger
 * keeps posting rows, and the gate keeps taking the load. None of that was
 * ever worth hiding behind a four-pixel target, and a mechanism that only moves
 * when a cursor finds it is not a machine, it is a tooltip.
 */
function fieldCue(index, state) {
  if (index === null) return null
  const cell = FIELDS[index]
  return index < state.bound
    ? { tone: 'valid', pill: 'CHECKED', read: `${cell.name} checked ${cell.against}.` }
    : { tone: 'run', pill: 'UNCHECKED', read: `${cell.name} is not yet checked ${cell.against}.` }
}

const LOOP = 'M -6 -13 H 6 A 13 13 0 0 1 6 13 H -6 A 13 13 0 0 1 -6 -13 Z'

const MOTIFS = {
  // A distribution standing on the plate: a model's output is a shape over
  // possibilities, and the uneven heights are the only part of that a mark this
  // size can carry. Four stacked bars, which is what this was, is a list icon -
  // the same doodle every menu button in the world already uses.
  //
  // It resamples. Each column breathes on a clock of its own, so the shape
  // keeps re-forming without ever losing its envelope - which is the difference
  // between a drawing of a distribution and a thing drawing from one. The bars
  // scale from their own feet, so the rule they stand on never moves.
  MODEL: [7, 13, 21, 26, 20, 11, 6].map((height, slot) => {
    const x = -21 + slot * 7
    return (
      <rect
        className="dgm-draw"
        key={x}
        style={{ '--life': jitter(slot, 31) }}
        x={x - 2}
        y={13 - height}
        width="4"
        height={height}
        rx="1.5"
        vectorEffect="non-scaling-stroke"
      />
    )
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
  // A schedule, and it had to stop being a bar chart. Evenly spaced columns
  // standing on a rule is the same object as the model's distribution beside
  // it at a different set of heights - two of the three plates were reading as
  // one mark, and the difference between them was a fact about spacing that
  // nobody was going to measure.
  //
  // A schedule is a line of time with fixed stops on it and a head moving along
  // it. So: one rule, seven ticks hanging under it rather than standing on it,
  // and a marker that steps stop to stop and comes back to the start. Nothing
  // about it is a column, and the one thing it does - advance - is the one
  // thing a scheduled job does.
  AUTOMATION: [
    <line key="rule" x1="-22" y1="0" x2="22" y2="0" vectorEffect="non-scaling-stroke" />,
    ...[0, 1, 2, 3, 4, 5, 6].map((slot) => {
      const x = Math.round((-21 + slot * 7) * 10) / 10
      return <line className="dgm-stop" key={x} x1={x} y1="0" x2={x} y2="7" vectorEffect="non-scaling-stroke" />
    }),
    <rect className="dgm-hand" key="head" x="-24" y="-7" width="6" height="7" rx="1.5" vectorEffect="non-scaling-stroke" />,
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
 * The shade a floating tier drops on whatever is under it. Two steps of
 * penumbra rather than a blur: a filter over four groups costs more than it
 * buys at this scale, and there is no light here to blur anyway - this is the
 * plane being occluded, not lit.
 *
 * It is drawn outside the tier's own group on purpose. A shade belongs to the
 * surface it falls on, so it must not travel with the solid casting it; what it
 * does carry is that solid's clock, which is what keeps the two locked while
 * the tier drifts.
 *
 * Inset, and hard, rather than the caster's own footprint softened. Every deck
 * here is the same size as every other, so an occlusion cast straight down
 * covers the whole of the one below and reads as that deck being dirty rather
 * than as anything being above it. A shade needs a receiver visible around it.
 * Insetting it is also the honest approximation: occlusion between two parallel
 * planes is deepest in the middle and lifts towards the edges, where the field
 * gets in.
 */
function Seat({ seat }) {
  return (
    <g className="dgm-seat" style={{ '--life': seat.life }}>
      <g transform={planSpace(CX, seat.onto)}>
        {[8, 20, 32].map((inset) => (
          <rect className="dgm-seatstep" key={inset} x={-HALF + inset} y={-HALF + inset} width={(HALF - inset) * 2} height={(HALF - inset) * 2} rx={RAD} />
        ))}
      </g>
    </g>
  )
}

/**
 * A label tied to a real edge, carrying the deck's live value under its name.
 * A leader is a hairline and a label is a few characters tall, so the whole
 * strip gets one invisible hit area - otherwise the reader has to land on a
 * one-pixel line to read what the rail is about.
 *
 * The leader rides the tier, because it is tied to a corner of that tier and has
 * to stay tied to it. The words do not: they sit in `dgm-steady`, which subtracts
 * the tier's float straight back out, so a reader gets a deck that breathes and
 * type that is nailed down. The node is the joint between the two, so it is
 * wide enough that three pixels of travel never shows the end of the hairline
 * coming out from under it.
 */
function Rail({ layer, live, hot, fact, probe }) {
  return (
    <g className={`dgm-rail${live ? ' is-live' : ''}${hot ? ' is-hot' : ''}`} {...probe}>
      <rect className="dgm-hit" x={layer.right[0]} y={layer.right[1] - 18} width={600 - layer.right[0]} height="36" />
      <line className="dgm-leader" x1={layer.right[0]} y1={layer.right[1]} x2="424" y2={layer.right[1]} />
      <g className="dgm-steady">
        <circle className="dgm-railnode" cx="424" cy={layer.right[1]} r="3.4" />
        <text className="dgm-side" x="434" y={layer.right[1] - 3}>{layer.label}</text>
        <text className="dgm-sidefact" x="434" y={layer.right[1] + 12}>{fact}</text>
      </g>
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
  // first, the ledger lights the chain that holds it together, and the gate
  // takes the load in its frame without either blade giving. The deck is
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
    authority: open ? 'SIGNED A. VOSS 09:41Z' : 'CLOSED - NEEDS A SIGNATURE',
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
          aria-label="Three kinds of proposal source - a model, an agent loop and a scheduled job - sit above one site, drawn identically because any of them can be swapped for another. A proposal lands on an intake deck, drops to a schema contract deck of nineteen named fields, and drops again to an approval deck whose gate stays closed until a named person at the site signs. Only then does it reach the receipt ledger, where every row is chained to the row above it by its hash."
        >
          <defs>
            <pattern id="tr-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            {/* The bore the blades run in. Clipping to it is what turns a
                whole disc into a blade - all that is ever drawn of one is the
                arc it cuts across the bore - and what lets the shaft under it
                be drawn as exactly the part of itself that can be seen down. */}
            <clipPath id="tr-hole">
              <circle cx="0" cy="0" r={SHUT_HOLE} />
            </clipPath>
            {/* The mouth of the intake, for the same reason. */}
            <clipPath id="tr-well">
              <circle cx="0" cy="0" r="14" />
            </clipPath>
          </defs>

          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x="22" y="16" width="34" height="40" />

          <g className="dgm-count">
            <rect className="dgm-countbody" x="446" y="22" width="154" height="30" rx="15" />
            <text className="dgm-countval" x="462" y="41">{state.bound}/19</text>
            <text className="dgm-countkey" x="500" y="41">FIELDS BOUND</text>
          </g>

          {/* The ground the stack is measured against.

              Two hairlines used to run the full height of the drawing here,
              corner to corner, carrying the top deck's footprint down to this
              plane. They were there to say "one plan, four heights" - which the
              four skirts standing over one footprint, and the shade each drops
              on the deck below, already say, and say in three dimensions rather
              than with a pair of rules. What they actually did was fence the
              figure: two verticals down the outside of it, crossing every tier,
              with the decks cut into them. The plane is enough. */}
          <g className="dgm-ground">
            <g transform={planSpace(CX, GROUND)}>
              <rect className="dgm-plane" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} vectorEffect="non-scaling-stroke" />
              <rect className="dgm-planefill" x={-HALF} y={-HALF} width={HALF * 2} height={HALF * 2} rx={RAD} fill="url(#tr-grain)" />
            </g>
          </g>

          {/* Decks, top last: the deck above occludes the one it sits over, and
              occludes the head of the drop that lands on it.

              Each tier is preceded by the shade it drops on the plane below,
              which is why the shades are here rather than inside the tiers -
              drawn in document order they land on the deck beneath and are then
              covered by the deck above, exactly as an occlusion should be. */}
          <Seat seat={SEATS[3]} />
          <g className="dgm-slide is-receipt" style={{ '--lift': `${RECEIPT.lift}px`, '--life': RECEIPT.life }}>
            <g className={`dgm-deck${state.receipt ? ' is-live' : ''}${lit('receipt')}`} {...probe('receipt')}>
              <Faces shape={RECEIPT} className="dgm-solid" />
              <Drop leg={DROPS[2]} drops={state.drops} />
              <g transform={planSpace(CX, RECEIPT.cy)}>
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
                    {/* The verifier. It walks the same links the hashes came
                        down, on the same clock, half a period out of step - so
                        the deck is being written and being audited at once and
                        the two marks never meet. It runs whether or not anyone
                        is looking; pointing at the deck is what makes it
                        visible, which is why arriving never restarts it. */}
                    <line
                      className="dgm-ledgeraudit"
                      pathLength="100"
                      x1="-54"
                      y1={LEDGER[row.index - 1].y}
                      x2="-54"
                      y2={row.y}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                ))}
                {/* A committed row is a bar with a thickness standing on the
                    deck, and one that has not been written yet is the same
                    footprint lying flat on it. The hash chip and the chain stay
                    down on the deck where the links run - the record stands up,
                    the thing binding it to the record above does not. */}
                {LEDGER.map((row) => {
                  const last = row.index === LEDGER.length - 1
                  const written = state.receipt || !last
                  return (
                    <g
                      className={`dgm-ledgerrow${written ? ' is-written' : ''}`}
                      key={row.y}
                      style={{ '--seq': row.seq, '--lift': `${row.bar.step}px` }}
                    >
                      <path className="dgm-face-left" d={row.bar.faceLeft} />
                      <path className="dgm-face-right" d={row.bar.faceRight} />
                      <rect className="dgm-ledgerhash" x="-59" y={row.y - 4.5} width="9" height="9" rx="2" vectorEffect="non-scaling-stroke" />
                      <g className="dgm-ledgercap">
                        <polygon className="dgm-ledgerbar" points={row.bar.base} />
                        {/* Two marks on a row, not four. Two rules and a seal
                            ruled across every record was a drawing of a line of
                            text, and four of those stacked in eighty pixels
                            read as hatching rather than as four records. One
                            rule is enough to say something is written there;
                            stripped to none, the row came out as a length of
                            pipe with a stud on the end. */}
                        <rect className="dgm-ledgertick" x="-34" y={row.y - 1.5} width={last ? 42 : 30} height="3" rx="1.5" />
                        <rect className="dgm-ledgerseal" x="38" y={row.y - 3.5} width="7" height="7" rx="2" />
                      </g>
                    </g>
                  )
                })}
              </g>
            </g>
            <Rail layer={RECEIPT} live={state.receipt} hot={hot === 'receipt'} fact={facts.receipt} probe={probe('receipt')} />
          </g>

          <Seat seat={SEATS[2]} />
          <g className="dgm-slide is-authority" style={{ '--lift': `${AUTHORITY.lift}px`, '--life': AUTHORITY.life }}>
            <g className={`dgm-deck${open ? ' is-live' : ''}${lit('authority')}`} {...probe('authority')}>
              <Faces shape={AUTHORITY} className="dgm-solid" />
              <Drop leg={DROPS[1]} drops={state.drops} />
              <g transform={planSpace(CX, AUTHORITY.cy)}>
                {/* The stop. Closed is drawn closed - two blades run up to the
                    centre line of the bore and meeting on it - so the claim
                    survives with every colour removed. Push on it with the
                    pointer and it answers the way a stop answers: the frame
                    takes the load and the seam thickens, and neither blade
                    moves, because there is nowhere for a closed blade to go
                    that is not through the other one. */}
                {/* Open is carried on the group, not inferred, so the frame can
                    stop bracing against something nobody is holding any more. */}
                <g className={`dgm-shutter${open ? ' is-open' : ''}${tried ? ' is-tried' : ''}`}>
                  {/* The frame is a block bolted to the deck, with the shaft cut
                      through it. Its own two side faces are what say so in every
                      phase - the shaft below only becomes visible once the
                      blades have run back, which is late in a run to be
                      establishing that this deck has a hole in it at all. */}
                  <path className="dgm-face-right" d={BARREL.wall} />
                  <circle className="dgm-housing" cx={BARREL.top.cx} cy={BARREL.top.cy} r={SHUT_FRAME} />
                  {/* Everything the frame carries sits on the frame, one storey
                      up, so the opening is cut through a block rather than
                      printed beside one. The clip travels with the group, so the
                      blades are still guaranteed to stay inside the hole. */}
                  <g transform={planDrop(-HOUSE_RISE)}>
                    <g clipPath="url(#tr-hole)">
                      {/* The shaft. Clipped to the opening, so what is drawn is
                          exactly what can be seen down it: the far wall across
                          the top and the floor six pixels below. Two tones and
                          nothing else - the hatch that used to be printed on
                          that floor was the fourth pattern inside a sixty-pixel
                          square, and it turned the assembly into a smudge. */}
                      <circle className="dgm-shaft is-bore" cx="0" cy="0" r={SHUT_HOLE} />
                      <g transform={planDrop(6)}>
                        <circle className="dgm-shaftfloor is-bore" cx="0" cy="0" r={SHUT_HOLE} />
                      </g>
                      {/* The two blades, inside the clip. The clip is what
                          turns a rectangle into a blade: all a reader ever sees
                          of one is the edge it lays across the bore.

                          One pass now, face and edge together. The pair used to
                          be thrown past each other and had to be drawn in two
                          passes because of it - every fill first, then every
                          edge - since the blade lying on top would otherwise
                          paint the other one's leading edge out and leave a
                          mechanism whose whole point is that there are two of
                          them looking like one rule across a hole. With both
                          blades stopping on the centre line nothing lies on
                          anything, so each is drawn complete in turn and the
                          seam is simply where the two edges land.

                          The two throws travel with the assembly as custom
                          properties rather than being written into the
                          keyframes, so the geometry is stated once - up there,
                          beside the note that solves it - and the stylesheet
                          animates between whatever this file says it is. The
                          side rides on each blade for the same reason: one class
                          carries the throw, and a blade only has to know which
                          way out is. */}
                      <g
                        className={`dgm-bank${open ? ' is-clear' : ''}`}
                        style={{ '--shut': `${LEAF_SHUT}px`, '--open': `${LEAF_OPEN}px` }}
                      >
                        {LEAVES.map((side) => (
                          <g className="dgm-blade" key={side} style={{ '--side': side }}>
                            <rect className="dgm-bladeface" x={side < 0 ? -LEAF_HALF : 0} y={-LEAF_HALF} width={LEAF_HALF} height={LEAF_HALF * 2} />
                            <rect className="dgm-bladeedge" x={side < 0 ? -LEAF_HALF : 0} y={-LEAF_HALF} width={LEAF_HALF} height={LEAF_HALF * 2} vectorEffect="non-scaling-stroke" />
                          </g>
                        ))}
                      </g>
                    </g>
                    {/* Drawn over the blades, so the bore keeps one clean edge
                        whatever is inside it. */}
                    <circle className={`dgm-holerim is-${state.gate}`} cx="0" cy="0" r={SHUT_HOLE} vectorEffect="non-scaling-stroke" />
                  </g>
                </g>
              </g>
            </g>
            <Rail layer={AUTHORITY} live={open} hot={hot === 'authority'} fact={facts.authority} probe={probe('authority')} />
          </g>

          <Seat seat={SEATS[1]} />
          <g className="dgm-slide is-contract" style={{ '--lift': `${CONTRACT.lift}px`, '--life': CONTRACT.life }}>
            <g className={`dgm-deck${state.bound > 0 ? ' is-live' : ''}${lit('contract')}`} {...probe('contract')}>
              <Faces shape={CONTRACT} className="dgm-solid" />
              <Drop leg={DROPS[0]} drops={state.drops} />
              <g transform={planSpace(CX, CONTRACT.cy)}>
                {/* Nineteen solids on a deck. A bound field is standing on its
                    own storey with two side faces under it; an unbound one is
                    the same footprint lying flat, waiting to be built on. The
                    faces come in as the cap goes up, on one clock, so binding is
                    a thing that rises rather than a colour that changes.

                    The contract walks its own fields too. `--seq` is the field's
                    place in the run, so the check travels the grid in the order
                    the contract checks it rather than nineteen tiles blinking
                    independently, which is a decoration and not a pass. */}
                {FIELDS.map((cell, index) => {
                  const bound = index < state.bound
                  return (
                    <g
                      className={`dgm-field${bound ? ' is-bound' : ''}`}
                      key={cell.name}
                      style={{ '--seq': cell.seq, '--life': cell.life, '--lift': `${cell.block.step}px` }}
                    >
                      <path className="dgm-face-left" d={cell.block.faceLeft} />
                      <path className="dgm-face-right" d={cell.block.faceRight} />
                      <polygon
                        className={`dgm-fieldtile${bound ? ' is-bound' : ''}${field === index ? ' is-named' : ''}`}
                        points={cell.block.base}
                        style={{ '--life': cell.life }}
                        {...touch(index)}
                      />
                    </g>
                  )
                })}
                {/* The tile used to carry a tick when the contract had checked
                    it. A tick is an icon of being checked, drawn on top of a
                    solid that is already standing up because it was checked -
                    the figure saying the same thing twice, once in its own
                    vocabulary and once in a borrowed one. The tile's own state
                    is the answer, and the pill in the margin names it. */}
              </g>
            </g>
            <Rail layer={CONTRACT} live={state.bound > 0} hot={hot === 'contract'} fact={facts.contract} probe={probe('contract')} />
            {field === null ? null : (
              <g className="dgm-tag is-named">
                {/* The leader rides the deck it points into; the pill does not.
                    It runs six pixels under the pill it arrives at, so three
                    pixels of tier float can never open a gap at the joint. */}
                <line className="dgm-leader" x1="112" y1={FIELDS[field].at[1]} x2={FIELDS[field].at[0] - 10} y2={FIELDS[field].at[1]} />
                <g className="dgm-steady">
                  <rect className="dgm-tagbody" x="20" y={FIELDS[field].at[1] - 11} width="98" height="22" rx="11" />
                  <text className="dgm-tagtext" x="69" y={FIELDS[field].at[1] + 4} textAnchor="middle">{FIELDS[field].name}</text>
                </g>
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
          <Seat seat={SEATS[0]} />
          <g className="dgm-slide is-surface" style={{ '--lift': `${SURFACE.lift}px`, '--life': SURFACE.life }}>
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
                {/* A proposal waiting its turn is a thing with a size, sitting
                    on the apron. Four flat chips read as marks printed on the
                    deck; four blocks read as a queue. */}
                {QUEUE.map((chip) => (
                  <g className="dgm-stand" key={chip.step} style={{ '--life': chip.life }}>
                    <path className="dgm-face-left" d={chip.block.faceLeft} />
                    <path className="dgm-face-right" d={chip.block.faceRight} />
                    <polygon className="dgm-queue" points={chip.block.top} />
                  </g>
                ))}
              </g>
              {SOURCES.map((item) => (
                <line
                  className={`dgm-tine${source === item.key ? ' is-live' : ''}${lit(item.key)}`}
                  key={`tine-${item.key}`}
                  style={{ '--life': item.life }}
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
              {/* The pads, in plan, standing on the deck. Each tine and each
                  spark ends at the plan point the puck is standing on, and the
                  puck is drawn over the top of both - so a leader never shows a
                  free end beside the thing it is supposed to reach. */}
              <g transform={planSpace(CX, SURFACE.cy)}>
                {SOURCES.map((item) => (
                  <g className="dgm-stand" key={`pad-${item.key}`} style={{ '--life': item.life }}>
                    <path className="dgm-face-left" d={item.puck.faceLeft} />
                    <path className="dgm-face-right" d={item.puck.faceRight} />
                    <polygon
                      className={`dgm-pad${source === item.key ? ' is-live' : ''}${lit(item.key)}`}
                      points={item.puck.top}
                    />
                  </g>
                ))}
              </g>
              {/* The throat is a hole, so it is drawn as one: clipped to the
                  mouth of the hub, the far wall shows across the top and the
                  floor sits five pixels down with the throat standing on it.
                  An intake whose middle is a filled dot on a flat deck is a
                  symbol for taking something in; this one has somewhere for a
                  proposal to go. */}
              <g transform={planSpace(CX, SURFACE.cy)}>
                <g clipPath="url(#tr-well)">
                  <circle className="dgm-shaft" cx="0" cy="0" r="14" />
                  <g transform={planDrop(5)}>
                    <circle className="dgm-shaftfloor" cx="0" cy="0" r="14" />
                    <circle className="dgm-throat" cx="0" cy="0" r="5" />
                  </g>
                </g>
                <circle className="dgm-port is-hub" cx="0" cy="0" r="14" vectorEffect="non-scaling-stroke" />
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
                {/* The plate rides and its name does not. Two offsets to undo
                    here rather than one - the plate's own ride, and the bob of
                    the tier this whole group sits inside. */}
                <g className="dgm-steady">
                  <text className="dgm-platelabel" x={item.cx} y={item.y - 48} textAnchor="middle">{item.key}</text>
                  <text className="dgm-platenote" x={item.cx} y={item.y - 36} textAnchor="middle">{item.note}</text>
                </g>
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

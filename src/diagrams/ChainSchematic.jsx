import { useState } from 'react'

import { jitter, planCyl, planPrism, planSpace, project, roundedSlab } from './iso'
import { Faces } from './Solid'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollRun } from './useScrollPhase'

/**
 * The floor - what trial execution is spread across today, and what it could
 * stand on instead.
 *
 * Trident is a stack and its axis is AUTHORITY: a proposal descends through a
 * contract, a signature and a ledger. Nectar is a plane and its axis is
 * GEOGRAPHY: peers stand apart on one ground and structure crosses between
 * them. Neither can say what the thesis has to say, because the thesis is not
 * about a product. It is about the ground the whole discipline is standing on.
 *
 * ABOVE IS NOT THE SAME KIND OF THING AS BELOW, AND THAT IS THE FIGURE.
 *
 * An earlier version of this drawing put five stages of work on five plates and
 * lowered them onto a deck. It was wrong in a way worth writing down: five
 * things moving down is a picture of a WORKFLOW being tidied, and nobody needs
 * a diagram to be told their work would go better if it were in one place. The
 * claim is not that the stages should be rearranged. It is that what is running
 * them should be replaced.
 *
 * So the sheet has two halves that are two different kinds of object.
 *
 * In the air is the FRAGMENTED WORLD: a scatter of plates at nine different
 * heights, off every axis, each one holding something inert - rows, a grid, a
 * page. They are general-purpose software that a site, a sponsor and a patient
 * have each been made to do research inside, and the drawing gives them no
 * ink of their own. Every one hangs on a hairline leader down to the place on
 * the ground its work actually belongs, so a reader can see the distance the
 * work is being held at without a word being written about it.
 *
 * On the ground is ONE SURFACE, in three districts - sponsors, sites, patients -
 * and it is the only thing in the figure drawn in the house blue. At the middle
 * of it stands the drum: two stacked plan cylinders, which is the Damaros mark
 * built as geometry rather than pasted on as a logo. Everything routes through
 * it, because that is what the mark is for.
 *
 * NOTHING ON THE SHEET IS LABELLED.
 *
 * No word sits on any object. The three districts are told apart by what stands
 * in them - blocks, a dense works, round solids - and by where they are, and
 * nothing else. What a reader wants named, they point at, and the readout at
 * the foot answers in a sentence. That is the whole annotation budget, and it
 * buys back the one thing a figure this dense cannot otherwise have: air.
 *
 * THE RUN IS A CLEAN-UP, AND IT IS SCROLL THAT DRIVES IT.
 *
 * District by district, the plates over one part of the world go out and the
 * ground under them stands up: footprints become solids, the routes between
 * districts light, and the drum comes on. By the end the air holds nothing but
 * the ghosts of what was there - a site does not delete its EHR, it stops
 * running research inside it - and the floor is one lit, populated, moving
 * surface with sponsors, sites and patients on the same run.
 *
 * Depth is not a renderer. The cloud drifts against the ground off the same
 * scroll value the ground rises on, so the two layers separate as a reader
 * arrives; every solid breathes on its own long clock; and the routes carry
 * packets at a rate nothing else on the sheet uses. That is where the immersion
 * comes from - rates and parallax on flat, projected geometry - not from a
 * third dimension the page has to download.
 */

const W = 900
const H = 640
const CX = 450

// The ground. A wide plan rectangle rather than the square the other two
// figures are built over: this one is a floor being looked across, not a tier
// being looked at.
const PLANE_Y = 392
const PLANE_X = 292
const PLANE_Z = 132
const PLANE_T = 15
const PLANE = roundedSlab(CX, PLANE_Y, PLANE_X, PLANE_Z, PLANE_T, 30)
const PLAN = project(CX, PLANE_Y)

// Three districts, on the plan axis that runs across the sheet. Sponsors at one
// end, patients at the other, and the site between them - which is not a
// decorative ordering. The site is where a protocol meets a person, so it is
// the only one of the three that both of the others have to reach through.
const ZONES = [
  {
    key: 'sponsors',
    at: [-196, -6],
    r: 96,
    pill: 'SPONSORS',
    before: 'A protocol leaves a sponsor as a document. Every site that receives it rebuilds it by hand, differently.',
    after: 'One versioned protocol, executed the same way at every site, with the evidence for each decision attached.',
  },
  {
    key: 'sites',
    at: [0, 4],
    r: 104,
    pill: 'SITES',
    before: 'Twenty-odd systems, none of them built for research, and a person carrying work between every pair of them.',
    after: 'Governed agents running on the site own ground. Records never leave; every decision is signed locally.',
  },
  {
    key: 'patients',
    at: [196, -6],
    r: 96,
    pill: 'PATIENTS',
    before: 'Whether a patient can join a trial depends on which building they can reach on a Tuesday.',
    after: 'Participation stops depending on geography. The trial runs where the patient already receives care.',
  },
]

const BY_ZONE = Object.fromEntries(ZONES.map((zone) => [zone.key, zone]))

/**
 * A district's population, scattered inside its own disc on a stable pseudo
 * random walk rather than on a grid. A grid would read as a table of contents;
 * what this has to read as is a place with things in it.
 *
 * `kind` is the only thing telling the three districts apart, because nothing
 * here is lettered: sponsors are upright blocks, the site is a dense low works,
 * patients are round solids. Three silhouettes, three populations.
 */
function populate(zone, count, kind, salt) {
  // The site district is drawn round a hole, because the drum stands in it. A
  // district that fills its own centre has nothing at its centre.
  const inner = kind === 'works' ? 0.54 : 0.3
  return Array.from({ length: count }, (_, index) => {
    const angle = jitter(index, salt) * Math.PI * 2
    const radius = (inner + jitter(index, salt + 5) * (0.96 - inner)) * (zone.r - 20)
    const x = Math.round(zone.at[0] + Math.cos(angle) * radius)
    const y = Math.round(zone.at[1] + Math.sin(angle) * radius * 0.86)
    const grade = jitter(index, salt + 11)
    const tall = Math.round((kind === 'people' ? 15 : 9) + grade * (kind === 'works' ? 15 : 24))
    return {
      key: `${zone.key}-${index}`,
      zone: zone.key,
      kind,
      x,
      y,
      // Depth order on screen, so a solid in front occludes the one behind it
      // rather than being drawn under it. Forty solids in list order is a pile.
      depth: x + y,
      tall,
      round: kind === 'people',
      solid: kind === 'people'
        ? planCyl(x, y, Math.round(7 + grade * 5), tall)
        : planPrism(x, y, Math.round(11 + grade * 7), Math.round(11 + grade * 7), tall, 4),
      life: jitter(index, salt + 17),
      wave: Math.round(((x + y + 400) / 900) * 100) / 100,
    }
  })
}

const POPULATION = [
  ...populate(ZONES[0], 7, 'blocks', 3),
  ...populate(ZONES[1], 9, 'works', 19),
  ...populate(ZONES[2], 9, 'people', 41),
].sort((a, b) => a.depth - b.depth)

// THE DRUM. The Damaros mark built as geometry instead of pasted on as a logo:
// the monogram is two stacked forms, so this is two stacked plan cylinders, the
// lower one wider, standing at the exact middle of the floor. Everything routes
// through it, which is what the mark is for.
const DRUM_R = 32
const DRUM_LOW = planCyl(0, 4, DRUM_R, 19)
const DRUM_TOP = planCyl(DRUM_LOW.top.cx, DRUM_LOW.top.cy, DRUM_R - 5, 17)
const DRUM_CAP = { cx: DRUM_TOP.top.cx, cy: DRUM_TOP.top.cy, r: DRUM_R - 5 }

/**
 * A route between two districts, in plan, turning on plan axes only - so every
 * leg lies along the floor rather than being drawn over it. Vias wherever it
 * turns, the way the other figures do it, because a bend with nothing at it is
 * a line that changed its mind.
 */
function route(from, to, bow) {
  const mid = [Math.round((from[0] + to[0]) / 2), Math.round(from[1] + bow)]
  const bends = [[from[0], mid[1]], [to[0], mid[1]]]
  return {
    d: `M ${from[0]} ${from[1]} L ${bends[0][0]} ${bends[0][1]} L ${bends[1][0]} ${bends[1][1]} L ${to[0]} ${to[1]}`,
    vias: [from, ...bends, to],
  }
}

const ROUTES = [
  { key: 'in', zone: 'sponsors', ...route([-150, -6], [-38, 4], -78), life: 0.2 },
  { key: 'out', zone: 'patients', ...route([38, 4], [150, -6], -78), life: 0.62 },
  { key: 'back', zone: 'patients', ...route([160, 52], [-160, 52], 66), life: 0.85 },
]

// THE FRAGMENTED WORLD, in the air.
//
// Nine plates, at nine heights, on no axis at all - which is the one property
// they have to have, because the whole of what is wrong up there is that
// nothing was ever laid out together. Each one belongs to a district and hangs
// on a hairline down to the place on the ground its work belongs, so the
// distance the work is being held at is drawn rather than described.
//
// `motif` is what the plate is holding, and there are only three, because a
// general-purpose system holds only three kinds of thing: rows, a sheet of
// cells, or a page. None of them is something that runs.
const SHARDS = [
  { zone: 'sponsors', to: [-206, -34], at: [232, 96], size: 34, motif: 'page' },
  { zone: 'sponsors', to: [-150, 30], at: [318, 168], size: 28, motif: 'rows' },
  { zone: 'sponsors', to: [-224, 34], at: [148, 158], size: 30, motif: 'cells' },
  { zone: 'sites', to: [-44, -40], at: [402, 62], size: 32, motif: 'rows' },
  { zone: 'sites', to: [16, 44], at: [498, 148], size: 36, motif: 'cells' },
  { zone: 'sites', to: [-16, 60], at: [356, 214], size: 26, motif: 'page' },
  { zone: 'sites', to: [56, -34], at: [576, 96], size: 28, motif: 'rows' },
  { zone: 'patients', to: [166, -38], at: [686, 138], size: 32, motif: 'cells' },
  { zone: 'patients', to: [214, 36], at: [612, 220], size: 26, motif: 'rows' },
].map((shard, index) => {
  const plate = roundedSlab(shard.at[0], shard.at[1], shard.size, shard.size, 8, 10)
  const [gx, gy] = PLAN(shard.to[0], shard.to[1])
  return {
    ...shard,
    index,
    key: `shard-${index}`,
    plate,
    // The hairline runs from the plate's own front corner to the ground point,
    // never from its middle: a leader that starts inside a solid is a leader
    // drawn over it.
    leader: `M ${plate.front[0]} ${plate.front[1] + 8} L ${gx} ${gy}`,
    ground: [gx, gy],
    life: jitter(index, 61),
  }
})

const MOTIFS = {
  rows: [-7, 0, 7].map((y) => <rect className="dgm-inertmark" key={y} x="-13" y={y - 1.8} width="26" height="3.6" rx="1.8" />),
  cells: [-7, 0, 7].flatMap((y) => [-8, 0, 8].map((x) => (
    <rect className="dgm-inertmark" key={`${x}:${y}`} x={x - 3} y={y - 3} width="6" height="6" rx="1.4" />
  ))),
  page: [
    <rect className="dgm-inertmark is-open" key="sheet" x="-11" y="-13" width="22" height="26" rx="3" />,
    ...[-5, 1, 7].map((y) => <rect className="dgm-inertmark" key={y} x="-6" y={y - 1.2} width="12" height="2.4" rx="1.2" />),
  ],
}

// `up` is which districts have been cleaned up and stood, in the order the work
// moves: a protocol leaves a sponsor, a site executes it, a patient is reached.
// Everything else on the sheet reads off it - which plates have gone, which
// routes carry, whether the drum is running - so nothing can disagree with
// anything else.
const PHASES = [
  { span: 2.4, up: [], drum: false, tone: 'run', status: 'FRAGMENTED', read: 'Trial execution is spread across systems that were never built to run one. Everything between them is carried by a person.' },
  { span: 1.5, up: ['sponsors'], drum: false, tone: 'run', status: 'PROTOCOL', read: 'The protocol stops being a document to be rebuilt at every site. It arrives as something that executes.' },
  { span: 1.6, up: ['sponsors', 'sites'], drum: true, tone: 'pass', status: 'EXECUTION', read: 'The site runs it on its own ground, under governed agents, with every decision signed by a named person.' },
  { span: 1.6, up: ['sponsors', 'sites', 'patients'], drum: true, tone: 'pass', status: 'REACH', read: 'Participation stops depending on which building a patient can reach. The trial runs where care already happens.' },
  { span: 2.6, up: ['sponsors', 'sites', 'patients'], drum: true, tone: 'valid', status: 'ONE SURFACE', read: 'Sponsors, sites and patients on one surface and one run - reconstructable end to end, at any site, on demand.' },
]

const SEAT_STEPS = [0.12, 0.3, 0.5]

export default function ChainSchematic({ animate = true, reduced = false }) {
  const frame = useCenterOnOverflow()
  const [figure, phase, booted] = useScrollRun(PHASES, { reduced, travel: 1.4 })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]

  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')
  const risen = (key) => state.up.includes(key)

  // Four things answer a pointer, and only four: the three districts and the
  // drum. What each says depends on which side of the change it is on, so the
  // figure never narrates a state it is not currently in.
  const zone = hot && hot !== 'drum' ? BY_ZONE[hot] : null
  const drum = hot === 'drum'
  const tone = drum ? 'valid' : zone ? (risen(zone.key) ? 'pass' : 'run') : state.tone
  const pill = drum ? 'DAMAROS' : zone ? zone.pill : state.status
  const read = drum
    ? 'One execution surface underneath all three. Everything a trial does crosses it, and every crossing leaves a receipt.'
    : zone ? (risen(zone.key) ? zone.after : zone.before) : state.read

  return (
    <figure className="dgm">
      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-floor is-${tone}${animate ? ' is-live' : ''}${booted ? ' is-booted' : ''}`}
          ref={figure}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="One floor seen in axonometric projection, with a scattered world of software floating above it. In the air, nine plates hang at nine different heights on no shared axis, each holding something inert - rows, a sheet of cells, a page - and each tethered by a hairline down to the place on the ground where that work actually belongs. On the ground is a single surface in three districts: sponsors at one end drawn as upright blocks, patients at the other drawn as round solids, and the site between them as a dense low works. At the exact middle stands the Damaros drum, two stacked cylinders, and routes run through it from one district to the next carrying packets. As the figure advances, district by district the plates overhead go out and the ground beneath them stands up out of its own footprints, the routes light and the drum begins to run - until the air holds only faint ghosts of what was there and the floor is one lit, populated, moving surface."
        >
          <defs>
            <pattern id="fl-grain" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain" cx="1" cy="1" r="1" />
            </pattern>
            <pattern id="fl-fine" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle className="dgm-grain is-fine" cx="1" cy="1" r="0.8" />
            </pattern>
          </defs>

          {/* THE TWO LAYERS ARRIVE AT TWO RATES.

              The cloud comes up off `--spread` and every solid on the floor
              stands out of its own footprint off the same number a beat later,
              so the sheet separates into two layers as a reader reaches it
              rather than being handed to them already apart. That is the whole
              of the depth here - two flat, projected layers on two clocks -
              and it is what an axonometric can do without a third dimension the
              page has to download. */}

          {/* The ground's own shade. One plane held over a sheet needs occlusion
              under it or it is printed further down the page rather than laid on
              it. */}
          <g className="dgm-seat is-floor">
            <g transform={planSpace(CX, PLANE_Y + 5)}>
              {SEAT_STEPS.map((fraction) => (
                <rect
                  className="dgm-seatstep"
                  key={fraction}
                  x={-PLANE_X + Math.round(PLANE_X * fraction * 0.2)}
                  y={-PLANE_Z + Math.round(PLANE_Z * fraction)}
                  width={(PLANE_X - Math.round(PLANE_X * fraction * 0.2)) * 2}
                  height={(PLANE_Z - Math.round(PLANE_Z * fraction)) * 2}
                  rx="26"
                />
              ))}
            </g>
          </g>

          <g className="dgm-floor">
            <Faces shape={PLANE} className="dgm-solid" />

            <g transform={planSpace(CX, PLANE_Y)}>
              <rect className="dgm-planefill" x={-PLANE_X} y={-PLANE_Z} width={PLANE_X * 2} height={PLANE_Z * 2} rx="30" fill="url(#fl-grain)" />

              {/* Three districts, as three grounds. Not containers and not a
                  legend: the part of the floor given over to one kind of thing,
                  which is what lets a reader see three places rather than
                  twenty-seven solids. */}
              {ZONES.map((item) => (
                <g className={`dgm-zone${risen(item.key) ? ' is-up' : ''}${lit(item.key)}`} key={item.key} {...probe(item.key)}>
                  <ellipse className="dgm-zonefill" cx={item.at[0]} cy={item.at[1]} rx={item.r} ry={item.r * 0.9} fill="url(#fl-fine)" />
                  <ellipse className="dgm-zonerim" cx={item.at[0]} cy={item.at[1]} rx={item.r} ry={item.r * 0.9} vectorEffect="non-scaling-stroke" />
                  <ellipse className="dgm-hit" cx={item.at[0]} cy={item.at[1]} rx={item.r} ry={item.r * 0.9} />
                </g>
              ))}

              {/* The routes between districts, and what crosses them. A route is
                  always drawn, because the floor is always there; what changes is
                  whether anything is moving on it. */}
              {ROUTES.map((item) => (
                <g className={`dgm-run${risen(item.zone) ? ' is-up' : ''}${lit(item.zone)}`} key={item.key} style={{ '--life': item.life }}>
                  <path className="dgm-runpath" d={item.d} vectorEffect="non-scaling-stroke" />
                  <path className="dgm-runflow" d={item.d} pathLength="100" vectorEffect="non-scaling-stroke" />
                  {item.vias.map((via) => (
                    <circle className="dgm-via" key={`${via[0]}:${via[1]}`} cx={via[0]} cy={via[1]} r="3" />
                  ))}
                </g>
              ))}

              {/* THE POPULATION. Every solid is drawn twice over the run: as a
                  footprint lying on the floor before its district is stood, and
                  as a solid standing on that same footprint after. Standing up is
                  the clean-up, drawn - the same move Nectar uses when the shared
                  intelligence binds a definition and it rises off the slab.

                  Back to front, so a solid in front occludes the one behind it. */}
              {POPULATION.map((item) => (
                <g
                  className={`dgm-plot ${item.kind}${risen(item.zone) ? ' is-up' : ''}${lit(item.zone)}`}
                  key={item.key}
                  style={{ '--life': item.life, '--wave': item.wave, '--lift': `${item.solid.step}px` }}
                >
                  {item.round ? (
                    <>
                      <path className="dgm-face-right" d={item.solid.wall} />
                      <circle className="dgm-plotcap" cx={item.solid.base.cx} cy={item.solid.base.cy} r={item.solid.r} />
                    </>
                  ) : (
                    <>
                      <path className="dgm-face-left" d={item.solid.faceLeft} />
                      <path className="dgm-face-right" d={item.solid.faceRight} />
                      <polygon className="dgm-plotcap" points={item.solid.base} />
                    </>
                  )}
                </g>
              ))}

              {/* THE DRUM. The mark, built as geometry: two stacked plan
                  cylinders at the exact middle of the floor, the lower one
                  wider, with a ring turning on its head once the surface is
                  running. Nothing is written on it and nothing needs to be -
                  it is the only round thing at the centre of everything, and
                  every route in the figure passes through it. */}
              <g className={`dgm-drum${state.drum ? ' is-up' : ''}${lit('drum')}`} {...probe('drum')}>
                <path className="dgm-face-right" d={DRUM_LOW.wall} />
                <circle className="dgm-drumhead" cx={DRUM_LOW.top.cx} cy={DRUM_LOW.top.cy} r={DRUM_LOW.r} />
                <path className="dgm-face-right" d={DRUM_TOP.wall} />
                <circle className="dgm-drumhead" cx={DRUM_CAP.cx} cy={DRUM_CAP.cy} r={DRUM_CAP.r} />
                <circle className="dgm-drumring" cx={DRUM_CAP.cx} cy={DRUM_CAP.cy} r={DRUM_CAP.r - 7} pathLength="100" vectorEffect="non-scaling-stroke" />
                <circle className="dgm-hit" cx={DRUM_LOW.base.cx} cy={DRUM_LOW.base.cy} r={DRUM_R + 8} />
              </g>
            </g>
          </g>

          {/* THE FRAGMENTED WORLD. Drawn last, because it is above everything -
              and every leader is drawn before its plate, so a hairline arrives
              at the underside of the thing it is holding up rather than being
              laid across its face. */}
          {SHARDS.map((shard) => (
            <g
              className={`dgm-shard${risen(shard.zone) ? ' is-gone' : ''}${lit(shard.zone)}`}
              key={shard.key}
              style={{ '--life': shard.life }}
              {...probe(shard.zone)}
            >
              <path className="dgm-tether" d={shard.leader} />
              <circle className="dgm-tetherfoot" cx={shard.ground[0]} cy={shard.ground[1]} r="2.6" />
              <Faces shape={shard.plate} className="dgm-solid" />
              <g className="dgm-inert" transform={planSpace(shard.at[0], shard.at[1])}>{MOTIFS[shard.motif]}</g>
            </g>
          ))}

          <line className="dgm-rule" x1="22" y1="586" x2={W - 22} y2="606" />
          <rect className="dgm-status" x="22" y="598" width="146" height="26" rx="13" />
          <text className="dgm-statustext" x="95" y="615" textAnchor="middle">{pill}</text>
          <text className="dgm-read" x="182" y="615">{read}</text>
        </svg>
      </div>
    </figure>
  )
}

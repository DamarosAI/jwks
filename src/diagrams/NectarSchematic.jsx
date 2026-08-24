import { useState } from 'react'

import { alongFront, box, deck, depthSort, tile } from './iso'
import { useCenterOnOverflow } from './useCenterOnOverflow'
import { useScrollPhase, useScrollSpread } from './useScrollPhase'

/**
 * Nectar - the federation, drawn as a constellation rather than a stack.
 *
 * Trident is one site seen in section: decks piled on one axis, arriving closed
 * and opening out. Nectar is many sites seen in plan: one shared deck with
 * tethers that draw outward to each site as the section enters. The two figures
 * share a drawing language and share no move, because they are not one claim.
 *
 * Site 018 runs two tethers to the same deck. One carries structure and lands.
 * One carries a request for the records behind that structure, and is turned
 * back at the site wall. Boundary behaviour only, no internals (ADR-0001).
 */

const LIBRARY = deck(310, 236, 112, 12)

const SITES = [
  { id: 'SITE 042', cx: 120, cy: 424, half: 60, stagger: 0.06, vault: [[-15, -15], [15, -15], [-15, 15], [15, 15]] },
  { id: 'SITE 103', cx: 500, cy: 424, half: 60, stagger: 0.14, vault: [[-15, -15], [15, -15], [-15, 15], [15, 15]] },
  { id: 'SITE 018', cx: 310, cy: 506, half: 66, stagger: 0.24, vault: [[-30, -15], [0, -15], [30, -15], [-30, 15], [0, 15], [30, 15]] },
].map((site) => {
  const shape = deck(site.cx, site.cy, site.half, 14)
  return {
    ...site,
    shape,
    vaultBoxes: depthSort(site.vault).map(([x, y]) => ({
      key: `${site.id}${x}:${y}`,
      ...box(shape.p, x, y, 12, 12, 13),
    })),
  }
})

const [SITE_042, SITE_103, SITE_018] = SITES

// Peers tether to the shared deck. Site 018 runs two tethers instead of one,
// because the whole point is that the same wall answers them differently.
const TETHERS = [
  { key: 'SITE 042', stagger: 0.06, from: SITE_042.shape.back, to: alongFront(LIBRARY, 'left', 0.32) },
  { key: 'SITE 103', stagger: 0.14, from: SITE_103.shape.back, to: alongFront(LIBRARY, 'right', 0.32) },
]
const OUT_FROM = SITE_018.shape.left
const OUT_TO = alongFront(LIBRARY, 'left', 0.78)
const BACK_FROM = alongFront(LIBRARY, 'right', 0.78)
const BACK_TO = SITE_018.shape.right
const MARK = SITE_018.shape.front

const along = (from, to, t) => [
  Math.round((from[0] + (to[0] - from[0]) * t) * 100) / 100,
  Math.round((from[1] + (to[1] - from[1]) * t) * 100) / 100,
]
const OUT_CHIP = along(OUT_FROM, OUT_TO, 0.62)
const BACK_CHIP = along(BACK_FROM, BACK_TO, 0.38)

// 36 criteria on the shared deck. What is bound is countable; what is not
// bound is visibly not bound. There is no meter, because there is no need.
const CRITERIA = []
for (let row = 0; row < 6; row += 1) {
  for (let col = 0; col < 6; col += 1) CRITERIA.push(tile(LIBRARY.p, -65 + col * 26, -65 + row * 26, 10))
}

const PHASES = [
  { span: 2.2, out: 0, back: 0, gate: 'idle', bound: 28, tone: 'run', status: 'QUEUED', read: 'Structure queued at the site wall - nothing has left' },
  { span: 1.6, out: 100, back: 0, gate: 'pass', bound: 29, tone: 'pass', status: 'RELEASED', read: 'Criterion I-4.2 crossed - definition only, no values' },
  { span: 1, out: 100, back: 100, gate: 'check', bound: 29, tone: 'hold', status: 'CHECKING', read: 'The network asks for the 1,204 records behind it' },
  { span: 3, out: 100, back: 100, gate: 'stop', bound: 29, tone: 'stop', status: 'REFUSED', read: 'Refused at the wall - records never leave Site 018' },
  { span: 2, out: 100, back: 100, gate: 'stop', bound: 29, tone: 'stop', status: 'STEADY', read: 'Structure crosses. Records do not.' },
]

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

export default function NectarSchematic({ animate = true, reduced = false, section }) {
  const frame = useCenterOnOverflow()
  const spread = useScrollSpread({ reduced })
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const [hot, setHot] = useState(null)
  const state = PHASES[phase] ?? PHASES[PHASES.length - 1]
  const refused = state.gate === 'stop'

  // Pointing at a site lifts it and lights its tether to the shared deck.
  // Hover only re-weights what is already drawn - nothing hides behind it.
  const probe = (key) => ({
    onMouseEnter: () => setHot(key),
    onMouseLeave: () => setHot((current) => (current === key ? null : current)),
  })
  const lit = (key) => (hot === key ? ' is-hot' : '')

  const rows = [
    ['CRITERIA', '36', true],
    ['BOUND', `${state.bound} / 36`, state.bound > 28],
    ['VALUES', 'NONE', true],
    ['SITES', '4 FEDERATED', true],
  ]

  return (
    <figure className="dgm">
      <figcaption className="dgm-head">
        <span>Federated site boundary</span>
        <small>Site 018 - synthetic</small>
      </figcaption>

      <div className="dgm-frame" ref={frame}>
        <svg
          className={`dgm-svg is-${state.tone}${animate ? ' is-live' : ''}`}
          ref={spread}
          viewBox="0 0 620 640"
          role="img"
          aria-label="Several sites are tethered to one shared execution library. Site 018 sends structure up to the library, where it binds as a criterion. A request for the patient records behind that criterion travels back down and is refused at the site wall."
        >
          <defs>
            <pattern id="nc-dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle className="dgm-dotgrid" cx="1" cy="1" r="1" />
            </pattern>
            <pattern id="nc-skirt" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-skirtline" x1="0" y1="0" x2="0" y2="4" />
            </pattern>
            <pattern id="nc-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line className="dgm-hatch" x1="0" y1="0" x2="0" y2="5" />
            </pattern>
          </defs>

          <rect className="dgm-field" x="0" y="0" width="620" height="640" />
          <rect className="dgm-lattice-wash" x="0" y="0" width="620" height="640" fill="url(#nc-dots)" />

          <text className="dgm-micro" x="24" y="28">SHARED EXECUTION LIBRARY</text>
          <text className="dgm-micro is-quiet" x="596" y="28" textAnchor="end">STRUCTURE ONLY - NO VALUES</text>

          {/* Tethers draw outward from the shared deck as the section enters. */}
          {TETHERS.map((tether) => (
            <line
              className={`dgm-tether${lit(tether.key)}`}
              key={tether.key}
              style={{ '--stagger': tether.stagger }}
              pathLength="100"
              x1={tether.to[0]}
              y1={tether.to[1]}
              x2={tether.from[0]}
              y2={tether.from[1]}
            />
          ))}
          <line className={`dgm-tether${lit('SITE 018')}`} style={{ '--stagger': 0.24 }} pathLength="100" x1={OUT_TO[0]} y1={OUT_TO[1]} x2={OUT_FROM[0]} y2={OUT_FROM[1]} />
          <line className={`dgm-tether${lit('SITE 018')}`} style={{ '--stagger': 0.24 }} pathLength="100" x1={BACK_FROM[0]} y1={BACK_FROM[1]} x2={BACK_TO[0]} y2={BACK_TO[1]} />

          {/* The shared deck. Criteria bind on it; values never reach it. */}
          <g className={`dgm-deck is-live${lit('library')}`} {...probe('library')}>
            <Faces shape={LIBRARY} className="dgm-solid" hatch="nc-skirt" />
            {CRITERIA.map((points, index) => (
              <polygon
                className={`dgm-fieldtile${index < state.bound ? ' is-bound' : ''}${index === 28 && state.bound > 28 ? ' is-new' : ''}`}
                points={points}
                key={points}
              />
            ))}
          </g>

          {/* Sites. Back pair first, Site 018 in front. Their skirt is the
              wall: hatched, drawn the same at every site, never a status light. */}
          {[SITE_042, SITE_103, SITE_018].map((site) => (
            <g
              className={`dgm-site${site.id === 'SITE 018' ? ' is-focus' : ''}${lit(site.id)}`}
              key={site.id}
              style={{ '--stagger': site.stagger }}
              {...probe(site.id)}
            >
              <Faces shape={site.shape} className="dgm-solid" />
              <polygon className="dgm-seal dgm-boundary" points={site.shape.faceLeft} fill="url(#nc-hatch)" />
              <polygon className="dgm-seal dgm-boundary" points={site.shape.faceRight} fill="url(#nc-hatch)" />
              {site.vaultBoxes.map((cell) => (
                <Faces key={cell.key} shape={cell} className="dgm-vault" />
              ))}
            </g>
          ))}

          {/* The mark sits on Site 018's wall - the gap in it is the boundary. */}
          <image className="dgm-mark" href="/assets/damaros-monogram-blue.svg" x={MARK[0] + 16} y={MARK[1] - 12} width="21" height="24" />

          {/* Structure leaves and lands. */}
          <path
            className={`dgm-route is-out is-${state.gate}`}
            d={`M ${OUT_FROM[0]} ${OUT_FROM[1]} L ${OUT_TO[0]} ${OUT_TO[1]}`}
            pathLength="100"
            style={{ strokeDashoffset: 100 - state.out }}
          />

          {/* The request comes back down the other tether and stops at the wall. */}
          <path
            className={`dgm-route is-back is-${state.gate}`}
            d={`M ${BACK_FROM[0]} ${BACK_FROM[1]} L ${BACK_TO[0]} ${BACK_TO[1]}`}
            pathLength="100"
            style={{ strokeDashoffset: 100 - state.back }}
          />

          <g className={`dgm-tag${state.out === 100 ? ' is-pass' : ''}`}>
            <rect className="dgm-tagbody" x={OUT_CHIP[0] - 41} y={OUT_CHIP[1] - 9} width="82" height="18" rx="5" />
            <text className="dgm-tagtext" x={OUT_CHIP[0]} y={OUT_CHIP[1] + 4} textAnchor="middle">STRUCTURE</text>
          </g>
          <g className={`dgm-tag${state.back === 100 ? ' is-stop' : ''}`}>
            <rect className="dgm-tagbody" x={BACK_CHIP[0] - 53} y={BACK_CHIP[1] - 9} width="106" height="18" rx="5" />
            <text className="dgm-tagtext" x={BACK_CHIP[0]} y={BACK_CHIP[1] + 4} textAnchor="middle">RECORD REQUEST</text>
          </g>

          {refused ? (
            <g className="dgm-refusal">
              <path className="dgm-cross" d={`M ${BACK_TO[0] - 8} ${BACK_TO[1] - 8} l 16 16 M ${BACK_TO[0] + 8} ${BACK_TO[1] - 8} l -16 16`} />
              <text className="dgm-refused" x={BACK_TO[0] + 16} y={BACK_TO[1] - 15}>REFUSED AT THE WALL</text>
            </g>
          ) : null}

          {/* Site identities. */}
          <text className="dgm-side" x="16" y="504">SITE 042</text>
          <text className="dgm-mono" x="16" y="518">890 RECORDS</text>
          <text className="dgm-side" x="604" y="504" textAnchor="end">SITE 103</text>
          <text className="dgm-mono" x="604" y="518" textAnchor="end">614 RECORDS</text>
          <text className="dgm-side is-focus" x="180" y="500" textAnchor="end">SITE 018</text>
          <text className="dgm-mono" x="180" y="514" textAnchor="end">1,204 RECORDS</text>
          <text className="dgm-mono" x="180" y="527" textAnchor="end">EGRESS NONE</text>

          {/* Library card. */}
          <line className="dgm-leader" x1="212" y1="152" x2="242.1" y2="186.5" />
          <g className={`dgm-card${lit('library')}`} {...probe('library')}>
            <rect className="dgm-cardbody" x="16" y="40" width="196" height="124" rx="10" />
            <text className="dgm-cardtitle" x="30" y="64">LIBRARY DMR-204</text>
            <line className="dgm-cardrule" x1="30" y1="74" x2="198" y2="74" />
            {rows.map(([key, value, good], index) => (
              <g className={`dgm-cardrow${good ? ' is-good' : ''}`} key={key}>
                <text className="dgm-cardkey" x="30" y={96 + index * 18}>{key}</text>
                <text className="dgm-cardval" x="104" y={96 + index * 18}>{value}</text>
                <circle className="dgm-carddot" cx="196" cy={92 + index * 18} r="2.6" />
              </g>
            ))}
          </g>

          <line className="dgm-rule" x1="24" y1="584" x2="596" y2="584" />
          <rect className="dgm-status" x="24" y="596" width="132" height="24" rx="6" />
          <text className="dgm-statustext" x="34" y="612">{state.status}</text>
          <text className="dgm-read" x="170" y="612">{state.read}</text>
        </svg>
      </div>
    </figure>
  )
}

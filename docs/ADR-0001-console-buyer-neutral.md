# ADR-0001  -  Sites are the buyer; Console is buyer-neutral field command; the website is canon

Status: Accepted. Revised 2026-07-04 (previously 2026-06-27; originally 2026-06-24).

> **Revision (2026-07-04).** Applied "the website is canon" to the agent framing.
> The shipped site presents **four operator-facing agents**  -  Sentinel (Opportunity
> radar), Trident (At protocol), Eye (Quality signals), Luna (Audit chain); "Four
> agents. Zero verdicts."  -  and never names Console as a surface. The Field readme
> was updated to match: the agents section replaces the old "substrate  -  never
> operator-facing modules" framing (Operations Mesh remains true substrate), the
> surfaces table is Node-only, and Console leaves the product-noun list (retired;
> the product repo's ADR 0142 retired it independently). The deferred
> "persona-neutral pass" item below also landed in part: the inverted internal
> identifiers (`navLuna`/`navEye`, `isAgLuna`/`isAgEye`, and the `ln.*` state
> machinery feeding the Eye panel) were renamed to match the rendered labels  - 
> zero visual change; code and copy now describe the same product. The hard
> guardrails are unchanged: no model casts an eligibility verdict, PHI never
> enters a model, screening is deterministic.

> **Revision (2026-06-27).** Sharpened the GTM from "site networks are the initial
> persona" to **sites are the buyer**, established **the website (damaros.ai) as
> canon** for positioning and language, and **blessed "agentic"** as canonical brand
> vocabulary (it leads the hero). The original network-persona reasoning is preserved
> below and still holds: the network is the expansion motion, the individual site is
> the wedge.

## Context

Console was originally framed as a sponsor command center. Field feedback (Raj) is that
leading with sponsors front-loads scope, sales-cycle, validation, and credibility burden
before Node has enough installed execution memory. The sharper near-term wedge is selling
Damaros to **sites** as the execution system that makes them trial-capable. The immediate
goal is getting Damaros into sites; site networks and master sites are the expansion, and
sponsors / CROs are downstream pull-through.

The Console backend is unchanged: a PHI-free projection layer over Node's Execution Graph
with four engines (Trust, Activation, Friction, and Eye / Field Command). Those primitives
are correct for any buyer. What changes is the **persona, public surface language, and
proof story**, not the engine.

The public surface has also moved ahead of the docs. **damaros.ai is now the most current
statement of what Damaros is.** Rather than treat the live site as drift to reconcile
against an internal spec, we invert it: the site is the spec.

## Decision

1. **Sites are the buyer. Site-first GTM.** Damaros sells to clinical sites as the execution
   system that makes them trial-capable, and to site networks / master sites as the way to
   run many sites as one. Sponsors and CROs are a downstream persona and pull-through, never
   the wedge.

2. **The website is canon.** damaros.ai (this repo's `index.html`, `about.html`,
   `privacy.html`) is the single source of truth for positioning, product language, and
   brand voice. ADRs, the Field design system, decks, and product copy conform to the
   shipped site. When they disagree, the site wins. There is no upstream marketing spec to
   reconcile to: the site is upstream.

3. **Console is buyer-neutral field command.** ~~Public copy says "Console" (and "Network
   Console" when specificity helps).~~ *(Revised 2026-07-04, per the revision note above:
   the shipped site names no Console surface at all, and Console left the product-noun
   list. The four engine questions below survive as PHI-free projections behind the one
   surface. Retained for history.)* "Sponsor Console" is retired as visible copy. For the
   site-network operator the four engines answer:
   - Trust Profile: "Which clinics in my network are execution-ready and provable?"
   - Activation Readiness: "Which clinics can we stand up for this protocol, and what blocks them?"
   - Eligibility Friction: "Where is this protocol colliding with our field reality?"
   - Eye: "Where is execution pressure moving across our network?"

4. **"Agentic" is canon vocabulary.** The hero leads *the agentic execution platform for
   clinical trials*. The brand previously quarantined "agentic"; the website overrides that.
   The word describes the **operations layer** (Luna-governed agents stage, assemble,
   accelerate, and draft); it never describes the verdict. The hard guardrails are unchanged
   and orthogonal to the word: no model casts an eligibility verdict, PHI never enters a
   model, screening is deterministic. The Field brand rules are updated to match (see
   Consequences).

5. **The four engines do not change.** PHI-free projection and Replay proof remain the basis
   of Console.

6. ~~**Damaros Eye is Console-only (not Node).** Initial user: the site-network operator.
   Future user: sponsor / CRO.~~ *(Revised 2026-07-04: superseded by the agent framing in
   the revision note above. Eye is one of the four operator-facing agents the shipped site
   presents, inside the one surface. Retained for history.)*

## Canon

> Node runs the clinic. ~~Console runs the network.~~ Replay proves the work.

> The site is the buyer. Node makes it trial-capable, ~~Console makes the network legible,~~
> Replay makes the work provable.

> *(Revised 2026-07-04: Console was retired as a surface, per the revision note above. The
> network-legibility capability survives as PHI-free projections, not as a named surface.
> The struck clauses are preserved as the historical record.)*

Hero (canonical, damaros.ai): **The agentic execution platform for clinical trials.**
Site-first in substance throughout: the live demo runs the spine at a site, "Damaros runs
the site," "Run one protocol through Damaros."

## Invariants (unchanged)

- PHI never touches an LLM.
- Eligibility decisions are deterministic and traceable.
- Screening runs and protocol versions are immutable once written.
- No candidacy claims. No eligible-patient claims. No patient matching. No sponsor authority.
- PHI-free projection and Replay proof remain the basis of Console.

## Consequences / deferred work

- **Website is canon (this change).** Positioning and voice are governed by `index.html`.
  The earlier instruction to "treat damaros.ai copy as drift to reconcile" is retired:
  damaros.ai is the source.
- **Brand rules updated** (`_ds/field-damaros-design-system-*/readme.md`): "agentic" moved
  out of *Words to AVOID* and into approved positioning, with a note pinning its meaning to
  the operations layer (never the verdict); Console reframed from "sponsor command center"
  to buyer-neutral field command for the site network; CTA canon set to **"Start a pilot"**
  (primary) and **"See the live demo"**; the canonical positioning line aligned to the hero;
  a house "no em dashes in body copy" rule recorded. If the Field design system is maintained
  upstream as well, propagate these there.
- **Stale design apparatus removed.** The WebGL "Datum Lattice" instrument described in the
  old `docs/MOTION.md` never shipped in the current site (the live page is a DOM
  product-demo built on the `dc-runtime` templating in `support.js`, with no Three.js).
  Removed `docs/MOTION.md`, the `tests/` suite (visual-smoke, brief6-audit, shot, and
  auto-shot, all of which exercised the decommissioned engine), and `assets/vendor/three/*`
  (orphaned). The live motion spec lives in the Field readme (Max 300ms, settle ease,
  scramble-resolve hero, monogram drift).
- **File references corrected.** A prior draft of this ADR cited `runtime.html`,
  `docs/fhir.html`, and `docs/privacy.html`; none exist. The canon surfaces are
  `index.html`, `about.html`, and `privacy.html`.
- **Internal identifiers are intentionally left in place** to avoid churn and CSS/JS
  coupling risk:
  - CSS: `.ti-sponsor`, `.ey-zone--sponsor`, keyframe `eyZoneGlowSponsor`
  - JS: `var sponsor` / `ey-zone--sponsor` in the Eye builder
  These are non-visible. A future **persona-neutral pass** can introduce a role abstraction:
  `sponsor` (external funder), `network_operator` (site-network operator), `site_admin`
  (clinic/site admin), `cra_or_ops`.
- **Routes (backend, not in this repo):** keep `/v1/console/*`; do not add a divergent API.
  Neutral aliases (`/v1/network/*` or `/v1/console/network/*`) can be added later without
  breaking working routes.

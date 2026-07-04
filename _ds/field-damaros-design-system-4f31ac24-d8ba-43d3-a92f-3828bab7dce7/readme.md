# Field — the Damaros Design System

> **Field is the Damaros design language for live trial operations.** It treats every protocol, site, candidate, evidence gap, and human decision as part of one operational field — calm, dark, spatial, replayable, and built for trust.

**One field. One surface. Five steps. Every decision replayable.**

This project is the brand + product design system for **Damaros**. It exists so design agents can produce on-brand Damaros interfaces, decks, and assets — for production or for throwaway mocks — without re-deriving the look from scratch.

---

## What Damaros is

**Damaros makes trial execution visible.** Today, clinical trials run through PDFs, spreadsheets, inboxes, EHR fragments, and delayed status reports. Damaros turns that chaos into a live execution field: protocols become operable, evidence becomes traceable, screening becomes deterministic, human judgment becomes accountable, and every decision can be replayed.

Positioning line (canonical, per damaros.ai): *the agentic execution platform for clinical trials.* **AI-native where operations scale, deterministic where trust requires.** No model ever casts an eligibility verdict; PHI never enters an LLM path.

### One surface — the product grammar

| Surface | What it is |
|---|---|
| **Node** | The **site runtime**. Where execution happens — a care site runs the trial under local control with replayable proof. Executes the one workflow: **Protocol → Evidence → Screening → Resolve → Replay**. (Helper label: *Clinic Node*.) |

Node is the one operator surface (Console was retired as a surface; the site never names it). The live demo on damaros.ai is a single-site Node runtime.

### The one workflow (five steps)

**Protocol** (import & lock versioned logic) → **Evidence** (site-controlled ingest, PHI trust boundary) → **Screening** (deterministic PASS / REVIEW / FAIL) → **Resolve** (the human trust boundary — commit / defer / escalate / supersede / reject) → **Replay** (reconstruct & prove what happened).

### The four agents (operator-facing, per damaros.ai)

**Four agents. Zero verdicts.** *Sentinel finds trials. Trident tunes protocols. Eye guards quality. Luna answers audits.* Each is a visible agent panel the operator works with inside Node — never a verdict-caster.

- **Sentinel** — *Opportunity radar.* Matches open protocols to the site's real capabilities. No patient data.
- **Trident** — *At protocol.* Compiles criteria into locked logic and drafts amendments. Never commits an amendment.
- **Eye** — *Quality signals.* Flags drift and deviations early, site-scoped, so the team can act before they harden into findings. Watches process, not people.
- **Luna** — *Audit chain.* Rebuilds any finding from the chain, every row cited. Read-only on the record; PHI provably never enters it.

The hard guardrails are unchanged and orthogonal to the framing: no model casts an eligibility verdict, PHI never enters a model, screening is deterministic.

### Substrate (powers the product behind the surfaces)

- **Operations Mesh** — governed worker substrate (Forge = evidence assembly, Router = review triage). Workers add priority/proof, never authority.

### CTAs (canon, per damaros.ai)
The primary CTA is **"Start a pilot"** (mailto). The demo link is **"See the live demo"** (it scrolls to the live runtime demo on synthetic FHIR). **Do not** use "Field" anywhere in public or product copy: "Field" is the internal name of this design system only, never a product noun, label, or CTA. Never "Explore platform."

---

## Sources (for whoever builds on this)

This system was reverse-engineered from the real Damaros codebases. If you have access, read them to do an even better job:

- **Product app + API** — `DamarosAI/damaros` (private). The Next.js operator console lives at `damaros/webapp/`; design tokens in `app/globals.css` (`:root`), component primitives in `components/design-system/`, polish layer in `app/common.css`. Canonical product language: `damaros/docs/product/PRODUCT_LANGUAGE.md` and `IDENTITY.md`.
  → https://github.com/DamarosAI/damaros
- **Public marketing site (damaros.ai)** — `DamarosAI/damaros-jwks` (the visual canon). Brand palette + type live in `shared/journey.css`; the hero/landing experience is `index.html`; brand assets (logos, monogram, fonts) in `assets/`.
  → https://github.com/DamarosAI/damaros-jwks

Logos and the monogram in `assets/` were copied directly from the marketing repo. Color and type tokens in `tokens/` are lifted verbatim from these two sources and unified.

> Two real surfaces, two font stacks. The **public brand** (damaros.ai) uses **Archivo + Hanken Grotesk**; the **operator console** historically uses **Chakra Petch + Plus Jakarta Sans + IBM Plex Mono**. Field standardizes on the public brand canon (Archivo / Hanken / IBM Plex Mono) as the default and documents the operator alternate. All are Google Fonts — see Font note in CAVEATS.

---

## CONTENT FUNDAMENTALS — how Damaros writes

The voice is **declarative, mineral, and disciplined.** It sounds like an instrument's manual written by someone with strong convictions, not a SaaS landing page. Copy earns trust by being precise about boundaries, not by hyping.

**Tone & vibe**
- **Calm, precise, expensive.** Short declarative sentences. One idea per line. The copy *is* the product.
- **Convictions stated flatly**, often as two-beat oppositions: *"Engine accelerates. **Humans decide.**"* · *"A verdict, **not a guess.**"* · *"Judgment, then **signature.**"* · *"Records become **evidence.**"*
- **Honest about limits.** Damaros names what it does NOT do as confidently as what it does. *"Replay proves what happened — not clinical correctness."* *"The site becomes sponsor-legible without becoming sponsor-controlled."*

**Casing & mechanics**
- **Sentence case** for headlines and body. **UPPERCASE** reserved for: tracked eyebrows/labels, status chips, and the verdict words **PASS / REVIEW / FAIL** (always all-caps when naming the deterministic state).
- Product nouns are **Capitalized**: Node, Protocol, Evidence, Screening, Resolve, Replay, Sentinel, Trident, Eye, Luna. (Console is retired; do not introduce it in new copy.)
- The accent device: in a headline, the **emphasized clause is set in steel (stone-blue)**, not bold or italic. Example: "Care happens everywhere. *The trials that save lives do not.*"
- **No emoji. Ever.** No exclamation marks. Numbers are tabular; stats cite a source in a tiny uppercase tag (e.g. "Community Oncology Alliance").
- **No em dashes in body copy.** Use periods and commas, and let short sentences carry the rhythm. House convention: the live site copy is em-dash-free.

**Person**
- Speaks about the system in third person ("Node admits site-approved evidence…") and to the operator in second person for actions ("Commit Resolution", "Open Signal"). Avoids "we/our" marketing-speak.

**Words to USE:** the agentic execution platform · Luna-governed agents (stage · assemble · accelerate · draft, never decide) · deterministic patient-path screening · permissioned execution truth · replayable proof · evidence-bound · requires review · human committed · governed · PHI-free · as-of the latest evidence ingest.
**Words to AVOID:** "AI found this patient" · "the model decides" · "the model determines eligibility" · real-time/live screening · "regulatory-grade / FDA-ready / HIPAA compliant" (full stop) · CTMS replacement · trial matching · dashboard. (Full quarantine list lives in the repo's `PRODUCT_LANGUAGE.md`.)

**On "agentic":** the canonical hero is *the agentic execution platform for clinical trials* (damaros.ai). "Agentic" names the operations layer: Luna-governed agents stage, assemble, accelerate, and draft. It never names the verdict. The hard line holds regardless of the word: no model casts an eligibility verdict, PHI never enters a model, screening is deterministic. Use "agentic" for the platform; never say a model found a patient or decided eligibility.

---

## VISUAL FOUNDATIONS — the look of the field

> **Theme scope (2026-07-04, site-is-canon).** The shipped marketing site (damaros.ai) runs a **light cold-paper theme**: paper ground `#f8fafb`, cold ink `#10161d`, one steel signal `#2f6193`, with the demo instrument floating on it as light chrome. Per ADR-0001, the site wins where they disagree, so the dark-mineral foundations below are scoped to **operator/product surfaces** (and dark brand artifacts such as decks). Read "never a light theme" in that scope, not as a claim about damaros.ai.

**Overall feeling:** a dark, mineral instrument. Geological black grounds, cold-white text, a single stone-blue signal carrying all structure. "Light is never decoration here." Spatial and quiet; nothing glows unless it means something.

**Color**
- **Backgrounds** are near-black mineral: jet `#06080b` (page ground), lifted `#0c1118`, surface `#121820`. The operator console goes fully to `#000`. Never a light theme on operator surfaces (the marketing site ships light; see the theme-scope note above).
- **One accent:** stone-blue **steel `#A9C0D6`** (with `#7b96b2` muted operator variant). It is the signal — borders, active states, links, structure all derive from it. Deep blue `#2F5F8C` marks boundaries.
- **Semantic color is rationed** and reserved for trial state: PASS green `#5BB98C`, REVIEW amber `#D9A23E`, FAIL red `#F2566E` ("rare red — breach only"), and governance ultraviolet `#8C7CF0` (Luna / AI provenance / ceremony). Operator surfaces use brighter variants (`#4ade80 / #facc15 / #fb7185`).
- **Imagery vibe:** cool, dark, blue-grey. WebGL terrain and topology in the marketing site; no warm tones, no stock photography. When real imagery is needed it should read cold and structural.

**Type** — Archivo (display, tight −0.03em tracking, structural), Hanken Grotesk (body, humanist, calm), IBM Plex Mono (the data register). Headlines are big and tight; body is generous (1.5–1.6 line-height); anything machine-generated is mono. Four registers: Command / Narrative / Data / Annotation.

**Backgrounds & texture:** radial mineral washes (`radial-gradient(ellipse at 50% 46%, #080b10, #04060a)`), occasional 1px scanline texture at very low opacity, faint monogram watermark behind hero/closer. No busy patterns. No bright gradients — ever avoid bluish-purple SaaS gradients.

**Cards & panels:** the signature is **glass** — a faint stone-blue inset ring (`inset 0 0 0 1px rgba(169,192,214,0.2)`), 4px backdrop-blur, over a near-black gradient `linear-gradient(180deg, rgba(169,192,214,0.07), rgba(169,192,214,0.02)), rgba(8,11,17,0.55)`. Brand panels round at **14–16px**; operator instrument chrome is much tighter (**2–3px**, 8px for panels). Hover lifts the card 2px and adds a deep, quiet shadow + a brighter ring — never a glow-burst.

**Borders & shadows:** borders are stone-blue at low alpha (hairline `.1`, default `.18`, strong `.32`) — never pure grey or white. Shadows are deep and dark (`0 14px 40px rgba(5,7,11,0.5)`), used for elevation, not decoration. There are no soft drop-shadows on a light background — on operator surfaces there is no light background.

**Motion:** fast and restrained. **Max 300ms.** Signature ease is `cubic-bezier(0.16, 1, 0.3, 1)` (a settle, no overshoot/bounce). Entrances fade + translateY(14px)→0. Hover transitions 120–140ms. The one decorative motion is a slow monogram drift (22s) and a scramble-resolve headline effect on the marketing hero. Everything respects `prefers-reduced-motion`.

**Hover / press states:** hover = brighter steel border + 2px lift + quiet shadow (or a faint steel-tinted background wash `rgba(169,192,214,0.05)`). Press = no shrink; the instrument feel is firm. Links/key words get a steel underline that wipes in left-to-right with a tiny diamond "lock-in" tick.

**Transparency & blur:** used deliberately — glass panels, modal scrims `rgba(2,6,12,0.72)`, sticky header washes. Blur is always small (3–8px); it signals "a surface floating over the field," not frosted-glass-everywhere.

**Layout rules:** dense, grid-driven, instrument-like in the product; full-bleed and centered/spatial in the marketing site. Fixed top nav, fixed section dots, fixed progress bar on the brand site. Generous page gutters that scale fluidly. Tabular numerals everywhere numbers appear.

---

## ICONOGRAPHY

Damaros uses **thin-stroke geometric line icons drawn as inline SVG** — there is **no icon font and no emoji**. Both surfaces hand-roll small SVGs with `stroke="currentColor"`, `fill="none"`, round caps/joins, on a 16–24 viewBox:
- Product disposition icons (PASS check, FAIL ×, REVIEW i, BLOCKED lock) use **stroke-width 1.25** on a `0 0 16 16` box.
- Marketing CTA / nav icons (e.g. the paper-plane "Get in Touch") use **stroke-width ~1.85** on a `0 0 24 24` box.
- Icons inherit text color (steel or cold-white) and are sized to the type beside them. Status icons always pair with a text label — **never color-only**.
- The brand glyph is the **monogram**: two stacked rounded trapezoids forming an eye/hourglass — "the live field, mirrored." Provided in `assets/` as white PNGs and as a recolorable `currentColor` SVG.

**For new work:** prefer **[Lucide](https://lucide.dev)** (CDN) — it matches the brand's thin, geometric, round-cap line style almost exactly. Set `stroke-width: 1.5–1.75` and `color` to a Field token. This is a documented *substitution* (the real product hand-draws its few icons); flag if pixel-exact fidelity to a specific product glyph is required. Never substitute filled/duotone icon sets or emoji.

---

## CONTENT INDEX — what's in this system

- **`styles.css`** — global entry point (imports only). Consumers link this.
- **`tokens/`** — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`.
- **`assets/`** — Damaros logos + monogram (white PNGs, brand SVG, recolorable `currentColor` SVG), favicon.
- **`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.
- **`components/`** — reusable React primitives (see below).
- **`ui_kits/`** — full-screen product recreations: `node/` (site runtime). (The retired Console kit exists upstream as reference-only; see the UI kits note below.)
- **`SKILL.md`** — Agent-Skills wrapper so this system works in Claude Code.

**Components:** Button · StatusBadge (PASS/REVIEW/FAIL/governed disposition chip) · Card (glass) · Input / Textarea / Select · Eyebrow · Stepper (the five-step spine) · TrustPill · ReviewChip · Kbd. See `components/<group>/` and each `.prompt.md`.

**UI kits:** Node (Resolve workspace + Replay) — an interactive click-through where present. (The upstream Field system also carried a Console kit; Console is retired and its kit is reference-only, not a pattern for new work. Kit sources are not in this snapshot; the compiled `_ds_bundle.js` carries the Node kit only, the retired Console kit having been removed from it on 2026-07-04.)

---

*Generated by reverse-engineering the Damaros codebases. The compiler builds `_ds_bundle.js` from `components/`; never edit that file by hand.*

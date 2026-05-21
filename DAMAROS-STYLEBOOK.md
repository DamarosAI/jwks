# Damaros voice and copy stylebook

Adapted from Palantir's briefing register for Damaros product, docs, and cockpit UI. Use this for hover cards, autoplay captions, docs sections, and any user-facing string.

## Non-negotiable typography

- **No em dashes (U+2014) and no en dashes used as sentence breaks** in user-facing copy.
- Split claim and mechanism with a **comma**, **period**, or **with / via / under** instead.
- Hyphens only for compound modifiers (e.g. `content-hashed`, `amendment-aware`).

## Register

- **Briefing register**, not marketing: definitional title, one declarative claim, one mechanism sentence, optional consequence.
- **Present tense** for what the system does today.
- **Inheritance over aspiration**: cite versioned logic, deterministic engine, signed replay, not future promises.

## Proper nouns (capitalize as products)

| Name | Role |
|------|------|
| **Damaros** | Provenance substrate for trial operations |
| **Trident** | Trial knowledge that sharpens with releases and site runs; compounds into executable logic |
| **Luna** | Governance harness for AI-assisted, traceable work |
| **Protocol** | Eligibility language locked to Trident releases |
| **Population** | Evidence plane before screening |
| **Screening** | Deterministic PASS / REVIEW / FAIL per criterion |
| **Forms** | Coordinator and sponsor artifacts from lineage |
| **Replay** | Signed reconstruction of version, evidence, context |

## Hover card template (cockpit)

1. **Label**: stage or brand name (uppercase micro-label).
2. **Title**: definitional noun phrase (what this stage *is*).
3. **Body**: Claim, then mechanism in one or two sentences. No scroll on desktop; prune until it fits.

**Example (Trident):**

> Trident is the trial knowledge core.

> Sharpens with each protocol release and site run, compounds into versioned execution logic, one content-hashed basis per site.

**Example (Screening):**

> Each patient × criterion yields PASS, REVIEW, or FAIL with attached evidence, via a deterministic engine with human review preserved.

Not: claim and mechanism joined by an em dash (forbidden).

## Trident vs Luna (word boundaries)

**Trident:** sharpens, compounds, release, site run, compiles, versioned, content-hashed, amendment-aware, execution basis.

**Luna:** governance, harness, traceable, reviewable, PHI gating, scoped tasks, provenance (for assisted work).

Do not use **ontology** or **governed** on Trident (Palantir overlap and Luna blur). Trident improves via **new releases**, not runtime eligibility changes.

## Claim → mechanism → consequence

Same unit as Palantir technical prose, without em dashes:

1. **Claim**: what is true in the enterprise.
2. **Mechanism**: how Trident, Luna, or the engine makes it true (`via`, `under`, `with`, named components).
3. **Consequence** (optional): what the coordinator or sponsor can rely on.

## Vocabulary

**Use:** provenance, versioned, sharpens, compounds, deterministic, evidence plane, lineage, content-hashed, amendment-aware, tenant-isolated, PHI gating, traceable, reviewable, signed bundle, cutover.

**Avoid:** revolutionary, game-changing, seamless, cutting-edge, synergy, bare superlatives without an architectural anchor.

## PHI and AI boundaries (always explicit in copy)

- Screening outcomes are **deterministic**; Luna governs AI-assisted work, not eligibility decisions.
- **PHI never touches an LLM** in product copy and implementation claims.
- Eligibility is **traceable** to protocol version and evidence inputs.

## Docs sections

- Open with a definitional sentence or section label (`04_CLINICAL_DATA_BOUNDARY`).
- Use § cross-refs where helpful; keep paragraphs short.
- Lists are evidentiary, not sales bullets.

## QA before ship

- Search repo for U+2014 em dash and en-dash sentence breaks in HTML text nodes and strings.
- Read each hover card aloud: one breath for title, two for body.
- Trident / Luna use brand-bar chips on all viewports; cards stack under the bar (not inside the canvas).

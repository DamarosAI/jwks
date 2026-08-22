# Damaros design system

Design source for Damaros public and operator surfaces.

## Product truth

Damaros is clinical research execution infrastructure.

    Protocol -> Evidence -> Screening -> Resolve -> Replay

Only these five workflow steps appear as public capability names. Trident is sole AI identity.
Nectar remains internal and must not appear in public copy.

Trident is proprietary site-local model. It perceives, structures, reasons, investigates, verifies,
explains, plans, and proposes across workflow. Authorized local patient context may enter Trident.
No PHI leaves site boundary or enters external inference or telemetry. Trident never publishes
Protocol, casts Screening verdict, chooses Resolve action, signs, or releases site data.

Screening remains deterministic over verified inputs. Resolve remains human-authorized. Replay
remains independently verifiable without model availability. Trident outage blocks new
cognition-dependent work. It does not activate duplicate manual product path.

## Product language

- Category: clinical research execution infrastructure.
- Buyer: clinics and research sites that execute protocols and stand behind final signature.
- Promise: protocol to proof, owned by site.
- Vision: Any clinic. Any trial. Any patient.
- Product nouns: Damaros, Trident, Protocol, Evidence, Screening, Resolve, Replay.
- Internal noun: Nectar. Do not use publicly yet.
- Use site-local, source-grounded, deterministic Screening, human-authorized Resolve, replayable
  proof, evidence-bound, requires review, and governed.
- Do not introduce named assistants, agents, engines, nodes, consoles, copilots, or other product
  primitives.
- Do not claim autonomous eligibility, patient matching, clinical efficacy, regulatory approval,
  compliance certification, production connector maturity, or vendor partnership.
- Public demonstrations use synthetic data and must say so.

## Voice

Short, calm, declarative. Operator language over engineering language. Sentence case for headlines
and body. Uppercase only for compact labels and PASS, REVIEW, FAIL. No emoji. Avoid em dashes.

## Visual system

- Public display: Archivo.
- Public body: Hanken Grotesk.
- Data register: IBM Plex Mono.
- Ground: near-black mineral surfaces.
- Accent: stone blue.
- Semantic state: PASS green, REVIEW amber, FAIL red.
- Motion shows state change, provenance, and continuity. It never decorates authority.
- Every status color pairs with text.
- Product screenshots use structured workspaces, fields, diffs, queues, citations, and actions.
  Never use chatbot chrome.

## Components

Button, Card, Input, Textarea, Select, StatusBadge, TrustPill, ReviewChip, Stepper, and Kbd. Stepper
always follows five-step workflow. Components do not create product nouns.

## Capability claims

Public site owns positioning. Damaros implementation repository owns shipped capability. Describe
unimplemented Trident behavior as direction or synthetic walkthrough until exact code and proof land.
Never turn roadmap into shipped claim.

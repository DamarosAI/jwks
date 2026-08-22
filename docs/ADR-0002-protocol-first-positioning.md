# ADR-0002 - Protocol-first positioning

## Context

Patient matching is crowded and misstates Damaros advantage. Community sites need capacity to run
complex protocols and prove work they already own.

## Decision

Damaros sells clinical research execution infrastructure. Unit is trial-capable clinic. Product
starts from Protocol, binds site Evidence, evaluates Screening deterministically, routes judgment to
human Resolve, and produces Replay proof.

Target product makes Trident prepare source-grounded work across five steps inside site boundary. Authorized local
patient context may enter Trident. PHI never leaves site or enters external inference or telemetry.
Trident never casts Screening verdict or takes human authority.

## Claims boundary

- Public demo uses synthetic data.
- Same pinned Protocol, Evidence, and as-of state reproduce same Screening result.
- Replay proves historical reconstruction, not clinical correctness.
- Connector, compliance, deployment, and performance claims require implementation evidence.
- Unimplemented target behavior stays labeled as target or synthetic walkthrough.
- Damaros is not CTMS replacement, autonomous eligibility system, or patient-matching product.

## Consequences

Lead with execution capacity and site-owned proof. Avoid feature piles, model superlatives, and
unproven operational claims.

# ADR-0002 - Protocol-first positioning

## Context

Patient matching is crowded and misstates Damaros advantage. Community sites need capacity to run
complex protocols and prove work they already own.

EHR vendors are now shipping clinical-trial management inside the chart: study startup, participant
recruitment, visit calendars, budgets, and agentic assistants over that workflow. That category is
study administration. Public language must not borrow it.

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
- Damaros is not a CTMS, a study-startup suite, a visit calendar, a budget tool, a recruitment inbox, an autonomous eligibility system, or a patient-matching product.
- Do not say agentic infrastructure, all-in-one clinical research operations, or a research department deployed like software. Those phrases now name the study-administration category.

## Consequences

Lead with execution capacity and site-owned proof. Avoid feature piles, model superlatives, and
unproven operational claims.

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

Trident prepares source-grounded work across five steps. The site names the provider: Anthropic, OpenAI, or a model it runs itself, with no silent fallback. Authorized patient context may enter Trident only on this machine, or at an endpoint the site attested: a vendor under a business associate agreement the site or Damaros holds, or a model the site operates, with no training, no human review, and retention inside the site's limit. PHI never enters telemetry. Trident never casts a Screening verdict or takes human authority. Publish, screen, sign, export, and verify finish when no model is set.

Nectar compiles a PHI-free profile from signed runs. That profile is the only artifact that may leave the site. The merge can inform the next protocol. Nectar never screens, resolves, signs, or releases.

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

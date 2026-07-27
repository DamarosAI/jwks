# ADR-0002 - Protocol-first positioning: sell trial capability, concede matching

Status: Accepted 2026-07-27.

Supersedes nothing. Extends ADR-0001 ("sites are the buyer; the website is canon"). ADR-0001
still governs: `index.html` / `about.html` / `privacy.html` are the source of truth, and this
ADR records the positioning the shipped site now encodes so the docs, decks, and product copy
conform rather than drift.

## Context

The adjacent competitor (Triomics, deployed at Mays / Texas Oncology-adjacent accounts) sells
**patient-first matching**: "which trials fit this patient?" That is an upstream funnel
question, and their ROI math is throughput math - minutes of chart review multiplied by
hundreds of patients across dozens of open protocols. It requires volume to work.

Damaros answers a different question: "does this subject provably meet this protocol, and can
we defend that decision later?" That is a downstream execution question. The two workflows are
adjacent, not competing for one job.

Two consequences drove this ADR:

1. **A matching bake-off is unwinnable and unnecessary.** Competing on funnel evidence puts
   Damaros in a category where the incumbent has deployments and an accuracy narrative. The
   budget line, the buyer, and the failure mode are all different: research ops, quality, and
   compliance buy defensibility, not innovation or informatics buying lift.
2. **Throughput math collapses at a community clinic.** At a site running three protocols
   there is no chart-review mountain to automate, so the incumbent value prop does not survive
   the shrink. The question that clinic actually has is "can we run trials at all, and prove
   it to a sponsor who otherwise would not select us?" That is **trial capability**, already
   ADR-0001 canon ("Node makes it trial-capable") but previously absent from the site.

## Decision

1. **Protocol-first, not patient-first.** Public copy answers the protocol-first question and
   never the patient-first one. `#capability` on `index.html` states both sides explicitly:
   the question we answer, and the question we don't.

2. **Concede patient-to-trial matching out loud.** The site says, in visible copy, that
   Damaros does not do matching and that if matching is the job, Damaros is not it. This is
   positioning, not modesty: it removes the bake-off and names the layer.

3. **Position as the layer underneath, not the alternative.** The Integrations dek reads
   *"Downstream of whatever narrows your funnel."* Whatever tool surfaces candidates upstream,
   Damaros is the execution and audit layer that runs the protocol and proves the run.

4. **Lead with trial capability, keep academic depth underneath.** The site leads on
   capability and proof, with academic-scale depth (protocol load, monitoring exposure,
   coordinator turnover) still present in the Problem section and the demo. Mays is the live
   pilot conversation and the academic reference is what makes community sales credible later.
   Do not strip it.

5. **Determinism is the moat, and it is architectural.** Not a roadmap item, not a tuning
   result. A competitor can improve a model's accuracy; it cannot retroactively make a
   probabilistic decision reproducible. Site copy carries the line: *a signed record of a
   probabilistic decision is not proof.*

6. **"Explainable" and "transparent" are retired.** Damaros claims **reproducibility** and
   **reconstruction**: same protocol, same evidence, same verdict, and the whole chain
   rebuildable months later. See the quarantine list in the Field readme.

7. **Banned from all copy and outreach:** "AI trial matching", "patient-to-trial matching",
   "find eligible patients", "AI-powered", "explainable AI", "explainable", "transparent",
   any accuracy percentage, and any enrollment-lift claim.

8. **Agent order is capability-then-proof.** Shipped order is **Sentinel, Luna, Trident,
   Eye**: protocols the site did not know it could run, then the record that gets the site
   selected. Luna-first reads well at an academic center with monitoring exposure; it does
   not lead for a community reader.

9. **Deployment names a managed path without claiming one exists.** "Air-gapped or
   institution-hosted" assumed an IT department a ten-person practice does not have. The
   security posture now reads **"Institution-hosted or air-gapped · managed option on
   request."** That invites the conversation and scopes it live; it does not assert a hosting
   product. A "Damaros-managed" chip would claim we hold PHI in an environment we operate, and
   the first security review at any real site asks for the SOC 2 report (our own copy says
   SOC 2-*aligned*, not certified), the BAA, the incident response plan, and the subprocessor
   list. **Gate: no managed-hosting claim ships until those four artifacts exist.** The runtime
   dek stays *"Site-hosted. Site-governed. PHI stays put."* The PHI boundary is identical in
   any mode we eventually offer: PHI never leaves the site and never enters a model.

10. **The hero carries the position, not section four.** A hero that reads *the agentic
    execution platform for clinical trials* leaves trial capability to appear a third of the
    way down the page, which means it does not lead. The hero is now **"The execution system
    that makes sites trial-capable, and provable."** Capability first, proof second, no
    comparison to anything.

11. **"Agentic" is scoped out of the hero, not out of the vocabulary.** ADR-0001 blessed
    "agentic" as canon when the reader was an academic center with an innovation budget. To a
    twelve-provider practice it is the word that closes the tab. It survives where it is
    accurate and low-stakes (the agents section, the operations layer, product copy), and it no
    longer leads the first screen. This narrows ADR-0001 decision 4; the hard guardrails behind
    the word are untouched.

12. **"Underneath" stays scoped to integrations.** *"Downstream of whatever narrows your
    funnel"* reads as compatibility next to Epic and Veeva, which is where it belongs. Do not
    let that framing migrate upward: underneath is a good place to sit in an integration
    diagram and a bad place to sit in a hero.

## What the site says now (shipped)

- **Hero:** *"The execution system that makes sites trial-capable, and provable."* (Was: "The
  agentic execution platform for clinical trials.")
- **Integrations:** "Not a replacement." + dek *"Downstream of whatever narrows your funnel."*
- **Problem, community stat:** the ~80% stat no longer sequences community as phase two
  ("where the same runtime expands after academic centers prove it"). It now reads: *"The
  patients are already there; the execution system a sponsor can verify is not."*
- **Problem, NCI stat:** dropped "leaving most eligible patients unmatched" (matching language,
  and an implicit eligible-patient claim).
- **`#capability` (new section):** *"Most clinics aren't short on patients. They're short on
  proof they can run the protocol."* Dek: *"Trial-capable, then provable to a sponsor."* Two
  cards (the question we answer / the question we don't), the determinism line, and the four
  things Damaros is measured on: protocols surfaced the site can run, a record a sponsor
  accepted, runs reconstructable on demand, deviations caught before findings. The first two
  are selection outcomes for a site that does not run trials yet; adjudication turnaround and
  monitor visit prep were cut from this list because they only mean something to a site that
  already runs trials and gets monitored, which is not the reader this header addresses.
- **The concession card does not list enrollment lift.** Refusing to claim unvalidated numbers
  is integrity, but listing enrollment lift as something we don't do reads to a site director
  as "we don't affect the outcome you care about," which is not what we mean. The fourth item
  is *"accuracy percentages we can't reproduce at your site"* instead. Enrollment-lift claims
  remain banned in outreach; they are simply not advertised as a refusal.
- **Agents:** Sentinel ("surfaces open protocols this site can actually run"), Luna
  ("reconstructs any run from the chain"), Trident, Eye. Dek: *"Surface, prove, draft, flag -
  never decide."*
- **Replay:** *"The artifact a monitor asks for during a visit, and the one a sponsor wants
  before selecting a site."*

## Consequences

- **The honest cost.** Enrollment lift sells itself; audit defensibility does not. This
  position trades an easy ROI slide for a category with no incumbent and a buyer who cannot be
  won by a benchmark. Expect longer education, and expect the proof artifact (Replay) to carry
  the demo.
- **Community economics are unresolved and out of scope for the pilot.** Community clinics have
  almost no budget, no research IT, uneven FHIR maturity, and nobody whose job is evaluating
  software. Deal sizes are small and cycles can be as slow as enterprise. Selling through a
  network or aggregator is the usual answer, but the two largest oncology aggregators in Texas
  are compromised for us (Texas Oncology has money in Triomics). **Do not rebuild GTM around
  clinic-by-clinic community sales until reachable networks are identified.** The site leading
  on capability costs nothing and is correct for both readers; the motion is a separate
  decision.
- **The demo is still implicitly academic** (Site 018, 36 criteria, a portfolio of open
  protocols, Lead CRA and Medical Monitor roles). A second community demo path is worth
  building **after** a pilot ships, not before. Deferred deliberately, not overlooked.
- **Invariants unchanged.** PHI never touches an LLM. Eligibility decisions are deterministic
  and traceable. Screening runs and protocol versions are immutable once written. No candidacy
  claims, no eligible-patient claims, no patient matching, no sponsor authority.
- **Docs conformed in this change:** Field design system readme (positioning line, hero, agent
  order and copy, Words to USE / AVOID, the explainable/transparent note) and the ADR-0001
  hero/agentic canon.

## Held as hypothesis, not finding

These are positions the site now asserts. They are not yet validated, and the next twenty site
conversations are the test. Revise this ADR from what comes back rather than defending it.

1. **That proof is the binding constraint on community trial participation.** The capability
   H2 asserts it. Staff, budget, and sponsor relationships are also constraints and plausibly
   larger ones. If site directors keep answering "we don't have the coordinator hours," the
   headline is wrong and this section changes.
2. **That conceding matching on the homepage is net positive.** Conceding to a director on a
   call is a credibility move with someone who already knows the landscape. On the homepage it
   broadcasts to every visitor, including community clinics who had never heard of AI trial
   matching and now know to go looking for it. The concession stays because the bake-off it
   prevents is worth more than the category it advertises, but that is a bet, not a fact.
3. **That "agentic" is a liability with community readers.** Believed, not measured. It is out
   of the hero on that belief; if community readers never react to it either way, the cost of
   removing it was zero anyway.
4. **That a community motion is reachable at all.** See the economics note above. Nothing on
   the site depends on this being true; the GTM decision does.

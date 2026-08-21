# Parked landing agents

The live home page no longer renders the agents section, hero rail, or named-agent chrome.

This folder keeps the last shipped surface so it can return without a rewrite.

## What is parked

- `landing-agents.jsx` — `AGENTS` catalog, glyphs, Trident / Eye / Luna / Sentinel workbenches, `AgentOperations`, and the MiniRun sidebar rail.

Styles for `.agent-console` and related frames stay in `src/styles.css` and `src/mobile.css`.

## Restore

1. Paste `const AGENTS`, `LUNA_INVESTIGATIONS`, `metricTone`, `SENTINEL_STUDIES`, and `AgentGlyph` back into `src/App.jsx`.
2. Paste `TridentWorkbench`, `EyeWorkbench`, `LunaWorkbench`, `SentinelWorkbench`, and `AgentOperations` above `SiteNodeSection`.
3. Render `<AgentOperations />` in `HomePage` between capacity and site control.
4. Restore `['agents', 'Agents', 'Instruments']` in `HOME_SPINE` after capacity.
5. Restore the MiniRun `AGENTS` rail from the comment in `landing-agents.jsx`.
6. Point the hero secondary CTA at `#agents` if that walkthrough should lead again.
7. Set home spine columns back to `repeat(6, minmax(0, 1fr))` where the live spine currently uses 5.

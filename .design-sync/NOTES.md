# design-sync notes — jwks

## DO NOT run the /design-sync converter in this repo

`jwks` is the **damaros.ai marketing site**, not a design-system source repo.
There is nothing for the converter to build from:

- no `.jsx`/`.tsx` anywhere, no `dist/`, no Storybook, no `*.stories.*`
- `package.json` has one dependency (`resend`) and `build: echo ok`
- the site's styles are inline in `index.html`; there is no `shared/journey.css`
  (the project readme's reference to that file is stale)

`_ds/field-damaros-design-system-4f31ac24-.../` is the **bound copy** of the
Claude Design project — what the design agent receives — not a source tree.

## The remote project is hand-authored

Project `4f31ac24-d8ba-43d3-a92f-3828bab7dce7` ("Field — Damaros Design System")
was built by hand, not produced by this skill. Evidence:

- no `_ds_sync.json` anchor, no `_preview/`, no `_vendor/`, no `_ds_bundle.css`
- per-group cards (`components/core/core.card.html`) instead of the converter's
  per-component `<Name>.html`
- carries `ui_kits/`, `download/`, `uploads/`, `assets/`, `SKILL.md` — none of
  which the converter emits

**Running the converter against it would be destructive.** The atomic path's
reconciliation deletes every remote path under `components/`, `tokens/`,
`guidelines/`, `_vendor/`, `_preview/` that a local build doesn't contain. With
nothing to build, that wipes 9 hand-authored components and 12 guideline cards.

## What this repo DOES sync

The local `_ds/` bind is **canon** (user's call, 2026-08-04). Authored files are
edited here and pushed up file-by-file, writes only, never deletes:

    readme.md  styles.css  tokens/{colors,effects,fonts,spacing,typography}.css

Never push these three — the app compiles them from the project's `components/`,
which live only remotely, so pushing the bind's copies downgrades compiled output:

    _ds_bundle.js  _ds_manifest.json  _adherence.oxlintrc.json

`readme.md` is the actively-edited one (11 commits vs 3 for the rest). As of
2026-08-04 the local copy had diverged ahead of the project's: local retires
Console as a surface and documents the shipped Sentinel/Luna/Trident/Eye order,
while the remote still presented Console as a co-equal surface.

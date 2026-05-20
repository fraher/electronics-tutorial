---
name: vendor-circuitjs-locally
description: Vendor the CircuitJS simulator under public/circuitjs/ for fully offline interactivity.
metadata:
  type: decision
  authority: high
  decided_at: 2026-05-20
  status: active
---

# Decision: vendor CircuitJS locally

## Context

The tutorial promises [[entities/Experiment]] pages with *editable* analog
circuits (per [[theory#purpose]] and [[decisions/static-export-no-deploy]]).
The canonical browser-side analog simulator is CircuitJS
(`https://github.com/pfalstad/circuitjs1`, Paul Falstad et al.). Two ways to
ship it:

1. **iframe falstad.com** — link to the live site. Fails the offline-first
   constraint in [[invariants#offline-first]] (and explicitly the
   "Network-required interactivity" entry under [[theory#what-wrong-looks-like]]).
2. **Vendor locally under `public/circuitjs/`** — copy the compiled bundle
   into the static export so `/circuitjs/circuitjs.html` is served from the
   same origin as the tutorial pages.

We pick #2.

## How we vendor (Sprint 1 implementation)

A naïve "build from source" path needs JDK + Ant + GWT. We don't want that
toolchain — the operator host doesn't have it, and adding it would make the
project harder to clone-and-run.

Discovery during the s1.4 step:

- The upstream repo `pfalstad/circuitjs1` does NOT check in compiled GWT
  output. The `war/` directory has source HTML but no `*.cache.js` /
  `*.nocache.js` permutations.
- The canonical authoritative deployment is `https://www.falstad.com/circuit/`
  — the simulator's homepage. It serves the GWT-compiled bundle, identified
  by the path `circuitjs106/circuitjs1.nocache.js` plus five
  `<HASH>.cache.js` permutations.

So `scripts/vendor-circuitjs.sh` downloads that prebuilt bundle directly
from falstad.com. Requires only `curl`. ~11 MB total.

The one external resource the live page references is
`https://www.dropbox.com/static/api/2/dropins.js` (a Dropbox import
integration we don't need). The vendor script strips that one `<script>`
tag so the page loads with zero network access.

## Copyleft assessment (GPLv2)

CircuitJS is GPLv2. Implications:

- **Distribution**: we never publicly deploy this project (see
  [[decisions/static-export-no-deploy]]). Local-only use does not trigger
  GPLv2's distribution clauses. If that changes, we MUST republish the full
  source of the vendored CircuitJS bundle alongside any redistribution, and
  any modifications we make to the simulator runtime also fall under GPLv2.
- **Modifications**: the vendor script makes exactly one modification — the
  Dropbox `<script>` removal noted above. That is documented in
  `public/circuitjs/NOTICE.txt`, regenerated on every vendor run.
- **License travel**: `LICENSE.txt` (GPLv2 COPYING.txt from upstream) and
  `NOTICE.txt` (provenance + modification log) sit next to the bundle.
  These two are force-added to git even though the rest of
  `public/circuitjs/` is gitignored.
- **No relicensing**: GPLv2 does NOT infect the rest of the tutorial code,
  because we do not link against CircuitJS code — we embed it via `<iframe>`,
  which is the FSF's documented "separate program" boundary.

## What's committed vs not

- Committed: `scripts/vendor-circuitjs.sh`, `public/circuitjs/.gitkeep`,
  `public/circuitjs/LICENSE.txt`, `public/circuitjs/NOTICE.txt`,
  `lib/circuitjs.ts` (URL helper).
- Gitignored: everything else under `public/circuitjs/` (the ~11 MB GWT
  bundle, fonts, manifest). Operator runs the vendor script after clone.

## Consequences

- Static export works offline. iframe `<src="/circuitjs/circuitjs.html?cct=...">`
  resolves to a same-origin file under the exported `out/` tree.
- First clone needs `bash scripts/vendor-circuitjs.sh` before
  `npm run build` produces a usable export. That command is documented in
  `README.md` and `CLAUDE.md`.
- Upgrades: re-run `--force`. If falstad.com bumps from `circuitjs106/` to
  e.g. `circuitjs107/`, the script needs a one-line constant update.

## Open follow-ups

- (none — vendor is operational, lib helper is in place).
- TODO when we start embedding circuits: decide whether to also support the
  `ctz` (lz-string-compressed) URL form for shorter iframe URLs. Currently
  `lib/circuitjs.ts` only exposes the `cct` raw form.

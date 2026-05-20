# electronics-tutorial

Interactive local-only companion to Charles Platt's *Make: Electronics, 3rd Edition*.

Status: **scaffold** (Sprint 1). Routing skeleton only; experiment content lands in Sprint 3.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # produces static ./out/
npx serve out        # serve the static build
```

Other commands:

```bash
npm run lint
npm run typecheck
```

## Stack

- Next.js 14 (App Router) with `output: 'export'` for static-only delivery
- TypeScript (strict)
- Tailwind CSS v3 + shadcn/ui primitives (Button, Card, Slider)
- next-themes for dark-mode toggle (respects `prefers-color-scheme`, persisted)
- KaTeX (locally bundled CSS — no CDN)
- `next/font` Inter (self-hosted at build time — no runtime CDN)

## Routes

- `/` — home, lists chapters
- `/chapter/[chapterId]/` — chapter index (1-5), lists experiments
- `/chapter/[chapterId]/experiment/[experimentId]/` — experiment page (placeholder)

`generateStaticParams` pre-renders all 5 chapters and all 36 experiments.

## Offline-first

No CDN fonts, no CDN scripts. KaTeX CSS is imported from `node_modules`. Inter font is self-hosted via `next/font`. The exported `out/` directory must run from `file://` or `npx serve out` with networking disabled (Wokwi iframes are the documented exception for Chapter 5 only — Sprint 3).

## CircuitJS (vendored)

Interactive analog circuits embed the [CircuitJS](https://github.com/pfalstad/circuitjs1)
simulator (Paul Falstad et al.), vendored locally so the static export runs
fully offline.

```bash
bash scripts/vendor-circuitjs.sh           # populate public/circuitjs/
bash scripts/vendor-circuitjs.sh --force   # wipe and refetch
```

How it works:

- The script downloads the GWT-compiled bundle (~11 MB) directly from
  `https://www.falstad.com/circuit/` — the canonical upstream deployment.
- Pulls `circuitjs.html`, `lz-string.min.js`, the `circuitjs106/` GWT
  permutation directory, the fontello icon font, and `manifest.json`.
- Strips the one external `<script src="https://www.dropbox.com/...">` line
  from `circuitjs.html` so the page loads without network access.
- Regenerates `LICENSE.txt` (GPLv2, pulled fresh from the source repo) and
  `NOTICE.txt` (vendor date + provenance) on every run.
- Requires only `curl` — no JDK / Ant / Maven / GWT build.

`public/circuitjs/` is gitignored on purpose: the binary bundle does not
belong in git. The vendor script, `public/circuitjs/.gitkeep` (instructions),
and force-added `LICENSE.txt` + `NOTICE.txt` give every clone of the repo
everything needed to reproduce the bundle in one command.

Usage from code: `lib/circuitjs.ts` exports `circuitJsUrl(cct)` which builds
`/circuitjs/circuitjs.html?cct=<encoded>` for `<iframe>` embeds.

CircuitJS is GPLv2. We do not modify the simulator runtime; the only patch
applied at vendor time is the Dropbox dropins removal noted above. See
[.project-memory/decisions/vendor-circuitjs-locally.md](.project-memory/decisions/vendor-circuitjs-locally.md)
for the full rationale and copyleft assessment.

## Theory

See [.project-memory/theory.md](.project-memory/theory.md). Top entities: Experiment, Chapter, Formula.

## Constraints

See `CLAUDE.md` for the full project posture (copyright, offline, GPLv2 CircuitJS vendoring, no backend).

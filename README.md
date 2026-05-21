# Make: Electronics 3e — Interactive Companion

A local-only, offline-first study companion to Charles Platt's *Make: Electronics,
3rd Edition* (Maker Media). 36 experiments across 5 chapters, each with:

- A paraphrased summary in your own words (no scans or quoted text from the book)
- Tunable formula sliders that re-solve live (Ohm's law, RC time constants, gain, …)
- An editable circuit — vendored [CircuitJS](https://github.com/pfalstad/circuitjs1)
  for analog experiments, a [Wokwi](https://wokwi.com) iframe for the Arduino chapter
- A short parts list and a takeaways block per experiment
- Client-side fuzzy search across everything (⌘K / Ctrl-K) — no API, no server

This is a personal study aid. It is **not** a copy of the book, and it is **not**
intended for redistribution. See "Copyright posture" below.

## Quick start

```bash
npm install
bash scripts/vendor-circuitjs.sh    # one-time: fetch CircuitJS bundle (~11 MB)
npm run dev                          # http://localhost:3000
```

To produce the offline static export:

```bash
npm run build                        # writes ./out/
npx serve out                        # or open out/index.html via file://
```

Other commands:

```bash
npm test          # vitest — unit + component tests
npm run lint
npm run typecheck
```

## Adding a new experiment

The site is generated from structured YAML briefs at `.factory/briefs/exp-<n>.yaml`.
To add or edit an experiment:

1. Edit the YAML brief (paraphrased summary, parts, formulas with `vars` + `solve_for`,
   schematic description, optional CircuitJS `.cir` payload or Wokwi project id, takeaways).
2. If you added a formula whose id doesn't already have an evaluator in
   `lib/formula-evaluators.ts`, add a `(vars) => result` function under the same id.
   Formulas without an evaluator still render in a read-only "Reference formulas"
   section.
3. Restart `npm run dev`. The brief loader (`lib/briefs.ts`) reads from disk at
   process start, and `generateStaticParams` picks up new experiments automatically.
4. Run `npm test` and `npm run build` to confirm the new route compiles.

The brief schema lives in `lib/briefs.ts` (`Brief`, `BriefFormula`, `BriefVar`).

## Project structure

- `app/` — Next.js App Router routes (`/`, `/chapter/[id]/`,
  `/chapter/[id]/experiment/[n]/`, `/sitemap.xml`)
- `components/` — `ExperimentPage`, `FormulaSlider`, `CircuitEmbed`, `WokwiEmbed`,
  `SearchDialog`, `ChapterMenu`, header / footer, theme primitives
- `lib/` — `briefs.ts` (YAML loader), `chapters.ts` (chapter metadata + blurbs),
  `formula-evaluators.ts` (per-formula closed-form solvers),
  `search-index.ts` (build-time Fuse.js doc list)
- `.factory/briefs/` — the 36 paraphrased YAML briefs (source of truth for content)
- `public/circuitjs/` — vendored CircuitJS bundle (gitignored; rebuilt via the
  vendor script). `LICENSE.txt` + `NOTICE.txt` are force-added.
- `scripts/vendor-circuitjs.sh` — pulls the prebuilt GWT bundle from falstad.com
- `docs/` — operator-owned reference material (never published)

## Stack

- **Framework:** Next.js 14 (App Router) with `output: 'export'` for static-only delivery
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v3 + shadcn/ui primitives (Button, Card, Slider)
- **Theming:** `next-themes` (system / dark / light, persisted)
- **Math:** KaTeX (locally bundled CSS — no CDN at runtime)
- **Fonts:** Inter via `next/font` (self-hosted at build time)
- **Search:** Fuse.js (~12 KB gzipped), client-side index of all experiments + formulas
- **Simulators:** CircuitJS (vendored, GPLv2) + Wokwi (iframe; Arduino chapter only)
- **Tests:** Vitest + @testing-library/react (jsdom)

## Offline-first

No CDN fonts, no CDN scripts, no analytics, no backend. KaTeX CSS is imported from
`node_modules` at build time. Inter is self-hosted via `next/font`. The exported
`out/` directory runs from `file://` or `npx serve out` with networking disabled.

The single documented exception is the Wokwi iframe in Chapter 5 (Arduino
experiments), which loads from `wokwi.com`. Other chapters require zero network.

## Copyright posture

This companion is a personal study aid for Charles Platt's *Make: Electronics,
3rd Edition*. All prose is paraphrased original writing; **no scans, photos,
or original text from the book are reproduced**. Schematics, Arduino sketches,
and circuit topologies are constructed independently. The book itself
(`docs/*.pdf`) is gitignored and never published.

Full statement: [COPYRIGHT.md](./COPYRIGHT.md).

The site assumes you own a copy of the book — buy it from
[Make Community](https://www.makershed.com) or O'Reilly if you don't already.

## CircuitJS (vendored, GPLv2)

The analog simulator is the [CircuitJS](https://github.com/pfalstad/circuitjs1)
project by Paul Falstad and contributors, vendored under GPLv2.

```bash
bash scripts/vendor-circuitjs.sh           # populate public/circuitjs/
bash scripts/vendor-circuitjs.sh --force   # wipe and refetch
```

The vendor script pulls the GWT-compiled bundle (~11 MB) directly from
`https://www.falstad.com/circuit/`, strips one external `<script>` tag so the
page loads with network disabled, and regenerates `LICENSE.txt` + `NOTICE.txt`
on every run. Requires only `curl`. We do not modify the simulator runtime
beyond that one strip; see
[.project-memory/decisions/vendor-circuitjs-locally.md](.project-memory/decisions/vendor-circuitjs-locally.md)
for the full rationale and copyleft assessment.

## Theory

See [.project-memory/theory.md](.project-memory/theory.md). Top entities:
Experiment, Chapter, Formula.

## License

This repository's source code is **all rights reserved** — see
[COPYRIGHT.md](./COPYRIGHT.md). It's published publicly so other learners can
read it and so I can use it as a portfolio reference, but no license is granted
to redistribute or repurpose. If you'd like to use any of it, [open an
issue](https://github.com/fraher/electronics-tutorial/issues) and ask.

Vendored CircuitJS at `public/circuitjs/` is GPLv2 (gitignored — fetched
locally by the vendor script).

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

## Theory

See [.project-memory/theory.md](.project-memory/theory.md). Top entities: Experiment, Chapter, Formula.

## Constraints

See `CLAUDE.md` for the full project posture (copyright, offline, GPLv2 CircuitJS vendoring, no backend).

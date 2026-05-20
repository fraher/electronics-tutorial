# electronics-tutorial

Interactive web companion to Charles Platt's *Make: Electronics, 3rd Edition*. 36 experiments across 5 chapters, each with paraphrased prose, interactive formula sliders, and an editable circuit (CircuitJS for analog, Wokwi for Arduino).

## Stack
- Type: webapp (static export, local-only)
- Language: TypeScript
- Framework: Next.js 14+ App Router with `output: 'export'`
- Package manager: npm
- Styling: Tailwind CSS + shadcn/ui
- Math: KaTeX
- Tests: Vitest (+ Playwright if needed)
- Deploy: **none** — runs via `next dev` locally or `npx serve out` after build

## Commands
- Install: `npm install`
- Dev:     `npm run dev`
- Test:    `npm test`
- Build:   `npm run build` (produces static `./out`)
- Lint:    `npm run lint`
- Typecheck: `npm run typecheck`
- Vendor CircuitJS: `bash scripts/vendor-circuitjs.sh` (needs only `curl`; no JDK/Ant — pulls the prebuilt GWT bundle from falstad.com)

## CLI overrides
- Implementer: codex (default)
- Reviewer: gemini (different family per Principle 5)
- Researcher (PDF extraction, Sprint 3): claude

## Constraints
- **Copyright posture:** all prose is paraphrased; no scans/photos from the book; schematics are redrawn original SVG. This is a personal local-only tutorial — do not deploy/publish without separate copyright review.
- **Offline-first:** static export must load from `file://` or `serve out` with no network. Documented exception: Wokwi iframes (Chapter 5) require internet — must show offline-fallback message.
- **GPLv2:** vendored CircuitJS lives in `public/circuitjs/` with its LICENSE + source link preserved.
- No backend, no analytics, no user accounts.

## Project structure
- `app/` — Next.js App Router routes (`chapter/[n]/experiment/[m]`)
- `components/` — shared widgets (`FormulaSlider`, `CircuitEmbed`, `WokwiEmbed`, `ExperimentPage`)
- `content/experiments/` — per-experiment MDX or TSX page content
- `public/circuitjs/` — vendored CircuitJS GWT build (gitignored after first vendor; commit only the vendor script)
- `.factory/briefs/` — paraphrased structured briefs (`exp-1.yaml` … `exp-36.yaml`) produced in Sprint 3
- `scripts/` — vendor + build helpers
- `docs/Make - Electronics (3e).pdf` — operator-owned source PDF (never edited, never published)

## Theory
See [.project-memory/theory.md](.project-memory/theory.md). Top entities: Experiment, Chapter, Formula.

## Git
```yaml
git:
  default_branch: main
  protected_branches: [main]
  merge_strategy: squash
  conventional_commits: true
```

## Memory update
```yaml
memory_update: auto
```

# Make: Electronics 3e — Interactive Companion

An interactive study companion to Charles Platt's *Make: Electronics, 3rd Edition*. Thirty experiments across five chapters, each on its own page with:

- A short summary of the experiment's idea
- Live formula sliders that re-solve as you drag — Ohm's law, RC time constants, voltage dividers, transistor bias, oscillator frequency, and dozens more
- Animated mini-schematics where wire thickness scales with current, resistors glow as they dissipate power, capacitors fill with charge, and logic gates respond to clicks
- An editable circuit — [CircuitJS](https://github.com/pfalstad/circuitjs1) for the analog chapters, [Wokwi](https://wokwi.com) for the Arduino chapter
- A parts list and a few takeaways
- A ⌘K / Ctrl-K fuzzy search across every experiment and formula

Plus six extra Arduino capstone projects (button input, analog/PWM, light sensing, tones, serial, and a small integrated project) that pick up where the book leaves off.

The site runs entirely from your machine. No accounts, no analytics, no backend.

## Try it locally

```bash
git clone https://github.com/fraher/electronics-tutorial.git
cd electronics-tutorial
npm install
bash scripts/vendor-circuitjs.sh    # one-time: fetch the CircuitJS bundle (~11 MB)
npm run dev                          # http://localhost:3000
```

To build the static export:

```bash
npm run build                        # writes ./out/
npx serve out                        # or open out/index.html via file://
```

## A few good starting points

- [`/`](http://localhost:3000/) — chapter overview + Continue-where-you-left-off
- [`/chapter/1/experiment/1`](http://localhost:3000/chapter/1/experiment/1) — *Taste the Power*, the canonical first experiment
- [`/chapter/4/experiment/19`](http://localhost:3000/chapter/4/experiment/19) — click logic gate inputs to flip HIGH/LOW
- [`/chapter/5/experiment/29`](http://localhost:3000/chapter/5/experiment/29) — *Blink* with the real Arduino sketch + Wokwi simulator
- [`/schematic-gallery`](http://localhost:3000/schematic-gallery) — every animated schematic primitive, with sliders

## Stack

- **Framework:** Next.js 14 (App Router) with `output: 'export'` for static delivery
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Math:** KaTeX
- **Simulators:** CircuitJS (vendored locally) + Wokwi (Arduino chapter only)
- **Tests:** Vitest + Playwright

## Project structure

- `app/` — Next.js routes (`/`, `/chapter/[id]/`, `/chapter/[id]/experiment/[n]/`, `/sitemap.xml`)
- `components/` — `ExperimentPage`, `FormulaSlider`, `CircuitEmbed`, `WokwiPanel`, `SearchDialog`, the schematic primitive library, etc.
- `lib/` — content loaders, formula evaluators, search index, experiment + circuit + wokwi registries
- `content/wokwi-projects/` — per-experiment Arduino sketches + Wokwi diagrams
- `public/wokwi-captures/` — committed screenshots and serial logs from headless Wokwi runs
- `scripts/` — the CircuitJS vendor script and the Wokwi capture script

## Wokwi captures (Arduino chapter)

The Arduino experiments run for real — each one has a sketch + `diagram.json` in `content/wokwi-projects/`, compiled with `arduino-cli` and simulated headlessly through `wokwi-cli`. The captured screenshot and serial log are committed under `public/wokwi-captures/` and shown on the page; the experiment page also exposes copy-to-clipboard buttons so you can paste the sketch and diagram straight into [wokwi.com](https://wokwi.com) and watch it run live.

If you want to regenerate the captures (after editing a sketch or diagram):

```bash
export WOKWI_CLI_TOKEN=...          # free from https://wokwi.com/dashboard/ci
npm run wokwi:capture
```

## Source book

This site is a study companion — it assumes you have your own copy of the book. The summaries on each page are written from scratch in plain language; nothing from the book itself is reproduced here. If you don't have a copy yet, grab one from [Make Community](https://www.makershed.com) or O'Reilly.

## License

Source-available, all rights reserved — see [COPYRIGHT.md](./COPYRIGHT.md). Published openly so other learners can read it, but no license to redistribute. If you want to reuse any of it, [open an issue](https://github.com/fraher/electronics-tutorial/issues) and ask.

Vendored CircuitJS in `public/circuitjs/` is GPLv2; its license travels with the bundle.

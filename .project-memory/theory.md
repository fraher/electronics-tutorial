---
name: project-theory
description: Portal — start here. Links to entity / decision / invariant / failure pages.
metadata:
  type: project
  authority: high
  last_full_review: 2026-05-20
  reviewed_against_commit: HEAD
---

# Theory — electronics-tutorial

## Purpose
An interactive companion to Charles Platt's *Make: Electronics, 3rd Edition* — a locally-run web tutorial that makes each experiment quick to review and intuitive to explore through editable circuits and interactive formula sliders.

## Domain
- [[entities/Experiment]] — one page per experiment (30 book + 6 supplemental Arduino)
- [[entities/Chapter]] — book's 5-chapter structure
- [[entities/Formula]] — equation + slider widget
- [[entities/Brief]] — on-disk YAML descriptor (one per experiment)
- [[entities/ExperimentPage]] — render surface
- [[entities/FormulaSlider]], [[entities/FormulaEvaluator]] — interactive formula widgets
- [[entities/CircuitEmbed]], [[entities/WokwiEmbed]] — simulator iframes

## Why this shape
- [[decisions/static-export-no-deploy]] — local-only static site
- [[decisions/vendor-circuitjs-locally]] — true offline interactivity; GPLv2 ingest accepted for personal use
- [[decisions/paraphrase-not-copy]] — copyright-safe companion
- [[decisions/wokwi-online-exception]] — single documented exception to offline-first
- [[decisions/client-side-search-fuse]] — Fuse.js prebuilt index, no server
- [[decisions/server-client-rehydration]] — functions can't cross RSC; rehydrate by id
- [[decisions/supplemental-arduino-content]] — why we ship 36 not 30
- [[decisions/sprints-collapsed-pragmatic]] — meta: when batching sprints is OK

## Invariants
- [[invariants/offline-first]] — `/out` must work fully from `file://`

## What "wrong" looks like
- [[failures/function-prop-rsc-boundary]]
- [[failures/pdf-extraction-count-mismatch]]
- [[failures/implementer-pivot-on-missing-prereq]]

## Tried & rejected
- *(none yet)*

## Open questions
- Real CircuitJS .cir payloads for analog experiments (all currently TBD — empty simulators render)
- Hand-drawn SVG schematics (currently rendered as prose)
- Proper SR-latch + water-analogy evaluators (current ones are stand-ins, flagged in code)

## Lessons
See [[lessons]] — append-only.

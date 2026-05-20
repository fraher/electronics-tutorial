---
name: project-theory
description: Portal — start here. Links to entity / decision / invariant / failure pages.
metadata:
  type: project
  authority: medium
  last_full_review: 2026-05-20
  reviewed_against_commit: a760e55
---

# Theory — electronics-tutorial

## Purpose
An interactive companion to Charles Platt's *Make: Electronics, 3rd Edition* — a locally-run web tutorial that makes each of the book's 36 experiments quick to review and intuitive to explore through editable circuits and interactive formula sliders.

## Domain
- [[entities/Experiment]] — one page per book experiment (36 total)
- [[entities/Chapter]] — book's 5-chapter structure (Discovery / Switching / Getting Somewhere / Logic / What Next)
- [[entities/Formula]] — interactive parameter widgets; one per formula in the book

## Why this shape
- [[decisions/static-export-no-deploy]] — local-only static site, no backend, no hosting
- [[decisions/vendor-circuitjs-locally]] — true offline interactivity; GPLv2 ingest accepted for personal use
- [[decisions/paraphrase-not-copy]] — copyright-safe companion, not a textbook clone

## What "wrong" looks like
- Verbatim prose from the book (copyright failure)
- Network-required interactivity (breaks the offline promise)
- Pages that just summarize and don't let the learner *manipulate* the circuit or formula

## Tried & rejected
- (none yet)

## Open questions
- (none yet)

## Glossary
- (none yet)

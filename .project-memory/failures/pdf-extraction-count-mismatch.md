---
name: pdf-extraction-count-mismatch
description: Plan assumed 36 experiments; PDF actually has 30.
metadata:
  type: failure
  authority: high
---

# pdf-extraction-count-mismatch

## What happened
The order's refined intent + plan committed to "all 36 experiments" based on operator phrasing. Sprint 3's researcher verified against the PDF and found the book has 30 experiments. Sprint structure (per-chapter batches) was sized for the wrong count.

## Why
Operator's verbal estimate (likely recalled from marketing copy or older editions) wasn't verified against the source artifact during intent refinement or planning. The Refiner could have prompted "the book actually has X experiments — verify against PDF" as a load-bearing ambiguity.

## Resolution
[[../decisions/supplemental-arduino-content]] — keep 36 page count; briefs 31-36 are supplemental Arduino capstones extending Ch5. Honors operator intent without re-scoping mid-order.

## How to recognize
Any order whose scope is a function of an extractable count from a source artifact should include a pre-plan verification step ("open the source, count it, cite the count").

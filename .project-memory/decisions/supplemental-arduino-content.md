---
name: supplemental-arduino-content
description: Briefs 31-36 are supplemental Arduino capstones beyond the book's 30 experiments.
metadata:
  type: decision
  authority: high
---

# supplemental-arduino-content

## Decision
The site ships 36 experiment pages: briefs 1-30 mirror the book's 30 numbered experiments faithfully; briefs 31-36 are supplemental Arduino capstone projects (button input, analog/PWM, light sensing, tones, serial comm, integrated capstone) extending Chapter 5's microcontroller intro.

## Why
Original order assumed 36 book experiments; researcher verified PDF and surfaced 30. Operator intent ("amazing guide", "everything in the book") satisfied by 30 faithful + 6 useful expansion rather than re-scope. See [[../failures/pdf-extraction-count-mismatch]].

## How to apply
When a plan's count doesn't match the source-of-truth count, the researcher should verify and the main session should adapt without silently rescoping. Surface the deviation at the next sprint gate (or in the post-order ritual).

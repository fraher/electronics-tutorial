---
name: wokwi-placeholder-honesty
description: Unverified Wokwi IDs are labeled 'placeholder' not 'exact', so UI confidence is calibrated.
metadata:
  type: decision
  authority: medium
---

# wokwi-placeholder-honesty

## Decision
All entries in `lib/experiment-wokwi.ts` start at `match: 'placeholder'`. The operator flips to `'verified'` only after confirming the numeric project ID resolves to a real public Wokwi project.

## Why
Initial implementation used readable slugs (e.g., `arduino-blink`) labeled `'exact'`. Reviewer caught that Wokwi public projects use opaque numeric IDs (~18 digits) — slugs would 404. Marking unverified entries `'exact'` would have given learners false confidence.

## How to apply
For any external-service ID we cannot verify at build time (Wokwi project IDs, YouTube video IDs, GitHub gist IDs, etc.), default to `'placeholder'` + a clear operator workflow comment. Verification labels are earned, not assumed.

## Related
- [[../entities/ExperimentRegistry]] — three-registry pattern
- [[../decisions/wokwi-online-exception]] — Wokwi as the documented online dep

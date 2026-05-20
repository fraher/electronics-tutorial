---
name: CircuitEmbed
description: Same-origin iframe wrapper around the vendored CircuitJS bundle.
metadata:
  type: entity
  authority: medium
---

# CircuitEmbed

## Means
React client component (`components/CircuitEmbed.tsx`) rendering `<iframe src="/circuitjs/circuitjs.html?cct=...">`, built from a [[Brief]]'s `suggested_falstad_circuit`. Provides the analog-simulator surface of an [[ExperimentPage]] while preserving the offline-first invariant.

## Shape
- Props: `circuit?: string`, `title?: string`, `height?: number`, `caption?: string`
- Empty/TBD payload renders empty simulator (graceful — most briefs currently lack real .cir strings)
- URL composed via `lib/circuitjs.ts`

## Related
- [[../decisions/vendor-circuitjs-locally]]
- [[WokwiEmbed]] — Arduino sibling
- [[Brief]]

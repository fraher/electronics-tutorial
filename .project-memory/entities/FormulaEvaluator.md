---
name: FormulaEvaluator
description: Client-side registry mapping formula id → pure function (vars) ⇒ result.
metadata:
  type: entity
  authority: medium
---

# FormulaEvaluator

## Means
Registry in `lib/formula-evaluators.ts` keyed by formula `id` (the same `id` the [[Brief]] uses). Each entry is a pure JS function from variable bag to numeric (or qualitative) result. Looked up client-side because functions cannot cross the RSC boundary — see [[../failures/function-prop-rsc-boundary]] and [[../decisions/server-client-rehydration]].

## Known stand-ins (debt)
- `sr-latch-set` — boolean stand-in, not a faithful next-state function
- `water-analogy` — qualitative (returns `h` directly)

Both are flagged in code comments. Real evaluators for both are future-order work.

## Related
- [[FormulaSlider]] — consumer
- [[Brief]] — supplies the `id`

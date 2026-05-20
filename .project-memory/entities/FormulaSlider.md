---
name: FormulaSlider
description: Interactive widget — formula + per-variable sliders + live result.
metadata:
  type: entity
  authority: medium
---

# FormulaSlider

## Means
React client component (`components/FormulaSlider.tsx`) that renders a KaTeX formula above one slider per input variable; computes the result via a [[FormulaEvaluator]] looked up by formula `id`. Tested across 5 canonical formulas (Ohm V=IR, RC τ=RC, voltage divider, parallel R, power P=VI).

## API
`{ formula, evaluate, vars[], solveFor, title? }` — see `components/FormulaSlider.tsx` for the TS contract.

## Related
- [[FormulaEvaluator]]
- [[ExperimentPage]] (consumer)
- [[Formula]] (data model)

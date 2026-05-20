---
name: Brief
description: YAML descriptor — one per experiment — driving the ExperimentPage.
metadata:
  type: entity
  authority: high
---

# Brief

## Means
A paraphrased, copyright-safe descriptor of one [[Experiment]], stored as YAML under `.factory/briefs/exp-<n>.yaml` and loaded by `lib/briefs.ts`. Serializable by construction so it can cross the RSC boundary (see [[../failures/function-prop-rsc-boundary]]).

## Shape
- `id, number, chapter, title, slug`
- `learning_objective, paraphrased_summary`
- `parts[], formulas[], schematic_description`
- `suggested_falstad_circuit, suggested_wokwi_project_id`
- `takeaways[], notes_for_implementer`

Each formula entry: `{ id, latex, vars[], solve_for, description }` — referenced client-side by [[FormulaEvaluator]] via `id`.

## Count: 36 ≠ book's 30
Book ships 30 experiments; briefs 31-36 are supplemental Arduino capstones. See [[../decisions/supplemental-arduino-content]] and [[../failures/pdf-extraction-count-mismatch]].

## Related
- [[Experiment]] — Brief is the on-disk shape; ExperimentPage is the render
- [[FormulaEvaluator]] — referenced by formula `id`
- [[../decisions/server-client-rehydration]]

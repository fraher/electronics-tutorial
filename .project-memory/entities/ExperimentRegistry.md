---
name: ExperimentRegistry
description: Three per-experiment lookup tables — schematic, circuit, wokwi.
metadata:
  type: entity
  authority: high
---

# ExperimentRegistry

Three sibling registries in `lib/` keyed by brief number, each filling a slot in the experiment page:

## `lib/experiment-schematics.tsx`
Maps brief number → `(vars: Record<string, number>) => ReactNode`. 36 entries. Composes [[LiveSchematic]] primitives positionally based on current FormulaSlider values. One composite schematic per experiment.

## `lib/experiment-circuits.ts`
Maps brief number → `{ kind: 'inline-cir', cir: string } | { kind: 'builtin', path: string } | null`. 26 custom `.cir` payloads (briefs 1-28, minus 12/13 process-only); briefs 29-36 are null (use Wokwi instead). All `.cir` strings pass `isPlausibleCirString` structural validation.

## `lib/experiment-wokwi.ts`
Maps brief 29-36 → `{ projectId: string, match: 'placeholder' | 'verified', note: string }`. All entries currently `'placeholder'` — slugs not numeric IDs. Operator workflow documented in the file: build public Wokwi projects, paste numeric IDs, flip to 'verified'.

## Why three separate files
Each registry is a different concern (visualization vs preloaded sim vs online-embed) with different lifecycles. Keeping them separate means: schematics can be improved without touching circuits; circuits can be hand-tuned in CircuitJS without affecting schematics; Wokwi IDs get verified independently.

## Related
- [[Brief]] — primary content; registries provide rendering augmentation
- [[ExperimentPage]] — consumer
- [[LiveSchematic]] — schematic registry uses these primitives
- [[CircuitEmbed]] — circuit registry feeds this
- [[WokwiEmbed]] — wokwi registry feeds this
- [[../decisions/wokwi-placeholder-honesty]] — why match: 'placeholder'

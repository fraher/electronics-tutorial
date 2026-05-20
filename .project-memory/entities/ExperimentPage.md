---
name: ExperimentPage
description: React component that renders one Experiment from its Brief.
metadata:
  type: entity
  authority: medium
---

# ExperimentPage

## Means
Generic React component (`components/ExperimentPage.tsx`) that takes a [[Brief]] descriptor and composes: breadcrumb, title, objective, paraphrased summary, schematic prose, [[FormulaSlider]] widgets, [[CircuitEmbed]] or [[WokwiEmbed]], parts list, takeaways, prev/next nav.

Receives serializable data only; the dynamic route is `'use client'` because evaluator functions are rehydrated client-side (see [[../decisions/server-client-rehydration]]).

## Routing
Prerendered route: `/chapter/[chapterId]/experiment/[experimentId]`. Total static export: 47 routes.

## Related
- [[Brief]], [[FormulaSlider]], [[CircuitEmbed]], [[WokwiEmbed]]
- [[../decisions/server-client-rehydration]]

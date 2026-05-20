---
name: server-client-rehydration
description: Pass id strings across the RSC boundary; rehydrate functions client-side via a registry.
metadata:
  type: decision
  authority: high
---

# server-client-rehydration

## Decision
Server components MUST NOT pass JavaScript functions to client components. Instead, pass a string `id` and let the client component look up the function in a client-side registry.

## Concrete implementation
- [[../entities/Brief]] is fully JSON-serializable
- `formula.id` is a string; [[../entities/FormulaEvaluator]] holds `{ id: (vars) => result }` map
- [[../entities/FormulaSlider]] (client) reads `id`, calls `getEvaluator(id)(vars)`

## Why
Discovered as a build-time error in s4-8-pages: passing `evaluate` function from ExperimentPage (server) to FormulaSlider (client) failed Next.js static export. See [[../failures/function-prop-rsc-boundary]].

## How to apply
For any new descriptor schema that drives UI behavior: every field must be JSON-serializable. Code in `lib/` exposes registries keyed by ids the schema mentions.

---
name: lessons
description: Append-only project lessons learned per order.
metadata:
  type: lesson
---

# Lessons

## verify-source-counts-against-source-of-truth
When the plan asserts a count drawn from a source artifact (book, PDF, spec), verify against the artifact before scoping.

**Why:** Order order-20260520-electronics-tutorial-web planned for 36 experiments based on operator memory; PDF actually has 30. Surfaced mid-Sprint-3 — late enough to require scope adaptation. Catching pre-plan would have saved a re-scope.

**How to apply:** In Refiner/Planner prompts for any order whose scope is a function of an extractable count, add a pre-plan verification step. See [[failures/pdf-extraction-count-mismatch]].

## rsc-boundary-needs-serializable-descriptors
If a server component needs to hand a client component behavior, pass a string id and look up the behavior in a client-side registry — never pass the function.

**Why:** Next.js RSC build errored when ExperimentPage tried to forward an evaluator function to FormulaSlider. Fix: `evaluator_id: string` resolved via `lib/formula-evaluators.ts`.

**How to apply:** Any Brief-like schema describing UI behavior must be JSON-serializable. Code in `lib/` exposes registries keyed by ids. See [[decisions/server-client-rehydration]] and [[failures/function-prop-rsc-boundary]].

## implementer-prereq-probe-pivot
Implementer steps that depend on host tooling should probe + pivot, not fail outright.

**Why:** s1.4 (CircuitJS vendor) assumed JDK+Ant; host had neither. Implementer pivoted to prebuilt-bundle fetch (no build needed), preserving full offline + GPLv2 compliance.

**How to apply:** Plan steps mentioning specific build tooling should include a probe-and-pivot fallback. See [[failures/implementer-pivot-on-missing-prereq]].

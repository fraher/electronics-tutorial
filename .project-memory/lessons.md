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

## visualize-not-simulate-split
Visualization components and simulators serve different jobs and should be separate components — don't conflate.

**Why:** When the operator asked for "intuitive elements" alongside the existing CircuitJS embed, the temptation was to make CircuitJS itself prettier. Instead we built [[entities/LiveSchematic]] as a pure visualization layer (inline SVG, tied to slider state, no physics) that lives ABOVE the simulator. Two layers, two jobs, both fully composable. Each can evolve independently.

**How to apply:** When a feature reads as "interactive + intuitive + accurate," default to two separate components: one for visualization (cheap, fast, illustrative, can lie) and one for ground truth (real simulation or computation). They cooperate via shared state but neither pretends to be the other.

## external-id-default-to-placeholder
For external-service IDs we can't verify at build time, default the confidence label to `'placeholder'` not `'exact'`.

**Why:** Sprint B initially marked some Wokwi project slugs `'exact'` based on their plausible-looking names. Reviewer flagged that Wokwi uses opaque numeric IDs — the slugs would 404. Marking unverified IDs `'exact'` would mislead learners about which embeds actually work. See [[decisions/wokwi-placeholder-honesty]].

**How to apply:** For YouTube video IDs, GitHub gists, Wokwi projects, etc. — any external resource we can't verify locally — schema should have a `verified: boolean` or `match: 'placeholder' | 'verified'` field defaulting to placeholder. Operator earns the upgrade through manual confirmation.

## implementer-prereq-probe-pivot
Implementer steps that depend on host tooling should probe + pivot, not fail outright.

**Why:** s1.4 (CircuitJS vendor) assumed JDK+Ant; host had neither. Implementer pivoted to prebuilt-bundle fetch (no build needed), preserving full offline + GPLv2 compliance.

**How to apply:** Plan steps mentioning specific build tooling should include a probe-and-pivot fallback. See [[failures/implementer-pivot-on-missing-prereq]].

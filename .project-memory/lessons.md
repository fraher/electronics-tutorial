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

## dont-ship-known-broken-with-just-a-todo
If a feature has a known broken path with a `TODO` comment, the feature isn't shipped. Either find the real workflow or change the feature scope so the broken path doesn't exist.

**Why:** Order order-20260521-wokwi-ci-arduino-integration shipped an "Open in Wokwi" button that opened a blank new-project page. Wokwi has no URL-import API. I documented this with a `TODO` comment in `lib/wokwi-projects.ts` instead of changing the UX. The operator immediately hit the broken button and called it out. The honest workflow turned out to be 3 buttons (Open Wokwi + Copy diagram + Copy sketch) with explicit paste instructions — that's the design we should have shipped first.

**How to apply:** When you write a `TODO` for a load-bearing UX feature, treat it as a blocker. Either fix it before merge or change the feature to not have the broken path. A TODO comment in source code is invisible to users; the broken button isn't.

## verify-committed-artifacts-not-just-test-output
When an order produces binary artifacts that get committed (captures, screenshots, generated assets), verify the COMMIT contains them — not just that the test logs say they exist.

**Why:** Sprint B's implementer correctly captured screenshot.png + serial.log for all 8 Arduino experiments in the worktree. The screenshots were committed, but the serial.log files weren't (likely missed in `git add` selection). The unit test caught it post-merge (assertion on `serialLog.length > 0` failed for exp-32). Took a regeneration to fix. The reviewer's `npm test` passed in the worktree (where artifacts existed); only the post-merge run in main caught it.

**How to apply:** For orders producing committed artifacts, the verification step should `git diff --stat HEAD~1` and confirm the artifact files appear in the commit list, not just that they exist locally. Add a smoke check that `ls <artifact-dir>` returns the expected file count post-merge.

## keep-the-accessibility-floor-when-adding-richer-input
When adding richer input modalities (drag, gesture, multi-touch), the original a11y-friendly control stays. New surface AUGMENTS, doesn't REPLACE.

**Why:** Sprint 1 of bidirectional interactivity wired pointer-drag on resistors/capacitors as a richer alternative to sliders. Sliders are excellent for keyboard + screen reader; SVG drag is harder. We kept the slider visible, gave the SVG `role="slider"` + ArrowKeys + focus rings, and made the two surfaces share the same state. A learner with motor impairments has the full slider experience; a learner with a mouse gets the visceral drag.

**How to apply:** Any time you add a gesture/pointer/drag interaction, audit: does the user without a pointer have an equivalent path? If not, either add one or don't ship.

## ui-orders-need-real-browser-verification
`npm test` and `npm run build` passing means nothing about whether the page actually works in a browser. Always run Playwright smoke before marking a UI-touching order complete.

**Why:** Two orders shipped the electronics-tutorial with broken CircuitJS embeds (4-7 missing assets per page, 404ing in the iframe) and broken Wokwi embeds (placeholder slugs that don't resolve). Vitest unit tests + `npm run build` were green throughout. The bugs only appeared when the operator opened a browser and asked "why is nothing showing." A single Playwright walk would have caught both on day one. We now have `npm run test:e2e` + a `tests/playtest/smoke.spec.ts` harness that walks every route, asserts zero failed requests, and screenshots each page.

**How to apply:** For any project with a CLAUDE.md declaring a UI surface, the order's plan MUST include a final verification step that invokes a real browser. `/foundry:playtest web` is the canonical foundry path; for projects that already have their own Playwright setup, `npm run test:e2e` is the local hook. Code-level tests verify code; only a browser verifies pages. See [[failures/skipped-browser-verification]].

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

---
name: sprints-collapsed-pragmatic
description: Sprints 4-8 collapsed into one implementer spawn for context efficiency.
metadata:
  type: decision
  authority: medium
---

# sprints-collapsed-pragmatic

## Decision
The plan called for 5 chapter sprints with 8+ separate code-change steps; under auto-mode + context pressure, the main session collapsed sprints 4-8 into one implementer spawn (build all 36 pages) + one reviewer.

## Why
- Per-page work was largely transformation of structured briefs through an existing template
- Reviewer signal density would have been low across granular spawns
- Context budget was the real constraint, not per-spawn quality

## How to apply
When the per-step work is highly structured + the template is fixed, batching is acceptable. When per-step work involves genuine design choices (e.g., Sprint 1 scaffold vs Sprint 2 component design), keep them separate.

## Watch
Collapsing sprints loses sprint-gate checkpoints. For future orders where the operator wants intermediate review, set CLAUDE.md `parallelism.collapse_threshold` lower.

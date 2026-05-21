---
name: author-time-capture-not-build-time
description: Wokwi captures run when the operator edits sketches, not on every `npm run build`.
metadata:
  type: decision
  authority: high
---

# author-time-capture-not-build-time

## Decision
`scripts/wokwi-capture.sh` (`npm run wokwi:capture`) is invoked by the operator AFTER editing any sketch or diagram. Captured artifacts (`screenshot.png`, `serial.log`, `run.log`) are committed to `public/wokwi-captures/`. The static site build never invokes wokwi-cli or arduino-cli.

## Why
- **Offline-first invariant preserved.** `npm run build` succeeds with zero network access. Wokwi only runs at author time.
- **Token isolation.** `WOKWI_CLI_TOKEN` only needed on the author's machine — never required at build time, never required for `npm run dev`.
- **Reproducibility.** Captured artifacts are versioned in git; a learner browsing the site sees exactly what the author saw when they committed.
- **Cost control.** Each `wokwi-cli` run consumes Wokwi CI credits; running on every build (or every PR) burns them fast.
- **Speed.** `npm run build` stays at ~10s; capture is ~3s × 8 experiments + arduino-cli compile time ≈ 30s — appropriate for an explicit operator command, painful for a per-build step.

## How to apply
For any feature that requires an external paid/authenticated service to produce media:
- Default to author-time capture
- Commit the captured artifacts
- Provide a clear regeneration command in CLAUDE.md
- Don't block CI on the regeneration

## Related
- [[../entities/WokwiPipeline]]
- [[../invariants/offline-first]]
- [[wokwi-online-exception]]

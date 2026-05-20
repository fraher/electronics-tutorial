---
name: implementer-pivot-on-missing-prereq
description: When a step's prerequisites aren't on the host, the implementer should propose an alternative path, not fail.
metadata:
  type: failure
  authority: medium
---

# implementer-pivot-on-missing-prereq

## What happened
Sprint 1's CircuitJS-vendor step (s1.4) assumed JDK + Ant/Maven on the host. Probe found neither. Implementer pivoted to fetching the prebuilt falstad.com bundle (no build needed). One upstream `<script>` tag stripped for full offline cleanliness, documented in NOTICE.txt per GPLv2 §2(a).

## Why
Plan was authored before the host probe. The right shape: every step that requires host tooling should have a probe + pivot strategy baked in.

## Resolution
Pivot succeeded cleanly. Lesson: planners should include "prereq probe + pivot" guidance for any step that depends on host tooling beyond bash+coreutils.

## How to recognize
Implementer step's args mention specific tools (JDK, Ant, ffmpeg, etc.). Before failing, probe `which $TOOL`; if missing, propose alternatives + surface to operator.

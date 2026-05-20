---
name: wokwi-online-exception
description: WokwiEmbed is the single documented network dependency in an otherwise offline-first site.
metadata:
  type: decision
  authority: high
---

# wokwi-online-exception

## Decision
Arduino experiments (briefs 29-36) embed Wokwi via iframe to wokwi.com — the one documented exception to the offline-first invariant. The exception is surfaced in the UI (ONLINE badge + offline fallback card).

## Why
- Wokwi simulates the AVR microcontroller; vendoring it locally is infeasible
- CircuitJS does not simulate MCUs well
- Operator chose Wokwi at the intent-confirmation gate, fully informed

## How to apply
Any new "online-required" surface needs its own decision page + visible-in-UI label. Default posture is offline; exceptions are explicit.

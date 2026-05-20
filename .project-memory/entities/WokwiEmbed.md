---
name: WokwiEmbed
description: Embed for Arduino/digital experiments via Wokwi (online-only).
metadata:
  type: entity
  authority: medium
---

# WokwiEmbed

## Means
Client component (`components/WokwiEmbed.tsx`) iframing wokwi.com for Arduino-flavored experiments (briefs 29-36). The single documented exception to the offline-first invariant.

## Offline behavior
Detects `navigator.onLine === false`; renders a fallback card with backup wokwi.com link. Listens for window online/offline events. ONLINE badge in corner so learners know this embed is the one network-dependent surface.

## Related
- [[../decisions/wokwi-online-exception]]
- [[CircuitEmbed]] — fully offline sibling
- [[Brief]] (`suggested_wokwi_project_id`)

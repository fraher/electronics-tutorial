---
name: offline-first
description: The static export must load and function with zero network access.
metadata:
  type: invariant
  authority: high
---

# offline-first

## Invariant
After `npm run build` the contents of `/out` must function fully when loaded from `file://` or any local static server with no network access — except for the [[../decisions/wokwi-online-exception]] (Arduino embeds for briefs 29-36).

## Tests
- No CDN-loaded scripts, fonts, or stylesheets in built HTML
- KaTeX CSS bundled locally
- next/font self-hosts Inter (no fonts.googleapis)
- CircuitJS vendored under `public/circuitjs/` with stripped external script tags
- Wokwi iframes are the ONLY allowed cross-origin loads; UI flags them with an ONLINE badge

## Violation handling
Any new dep that pings a CDN, analytics, or API at runtime must be either: removed, vendored, or escalated to its own decision page (like wokwi-online-exception).

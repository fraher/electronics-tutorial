---
name: WokwiPanel
description: Two-column UI rendering captured Arduino screenshot + serial log + sketch source + Open-in-Wokwi link.
metadata:
  type: entity
  authority: high
---

# WokwiPanel

## Means
Replaces the placeholder card for Arduino experiments (briefs 29-36). Renders the artifacts captured by [[WokwiPipeline]]:
- Compact thumbnail screenshot of the captured Arduino UNO (Wokwi-CI captures one part at a time; the full breadboard view only exists in Wokwi itself)
- First ~12 lines of `serial.log` in a code box
- "Run this in Wokwi" amber card with 4-step instructions + three buttons:
  - `Open Wokwi ↗` — opens wokwi.com new-Arduino-Uno project in a new tab
  - `Copy diagram.json` — clipboard-copies the project's diagram source
  - `Copy sketch.ino` — clipboard-copies the .ino source
- Tabbed source view (`sketch.ino` | `diagram.json`) with regex-based syntax highlighting (zero deps)
- ONLINE badge indicates the link is the one network-dependent surface

The copy-and-paste workflow is necessary because Wokwi exposes no documented URL-import API as of 2026-05; we tried `?text=`, `?diagram=`, `from-gist/` — all return 404.

## Props
```ts
{
  briefNumber: number,
  title: string,
  sketch: string,            // raw .ino content
  diagram: string,           // raw diagram.json content
  screenshotPath: string,    // e.g. "/wokwi-captures/exp-29/screenshot.png"
  serialSnippet: string,
  openInWokwiHref?: string,  // defaults to wokwi.com/projects/new/arduino-uno
}
```

## Data source
`lib/wokwi-projects.ts` reads at server-component build time from `content/wokwi-projects/` + `public/wokwi-captures/`. Returns null when a brief has no captured artifacts (graceful fallback to old WokwiEmbed).

## Related
- [[WokwiPipeline]] — produces the artifacts this consumes
- [[WokwiEmbed]] — old placeholder card, still used when no capture exists
- [[../decisions/wokwi-online-exception]]

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
- Captured screenshot of the running simulation (from `public/wokwi-captures/exp-N/screenshot.png`)
- First ~10 lines of `serial.log` in a code box
- Syntax-highlighted `.ino` sketch source (regex-based highlighter, zero deps)
- "Open in Wokwi" anchor (currently links to wokwi.com's new-Arduino-project page; TODO: switch to import-by-URL when Wokwi documents that flow)
- ONLINE badge indicates the link is the one network-dependent surface

## Props
```ts
{
  briefNumber: number,
  title: string,
  sketch: string,        // raw .ino content
  screenshotPath: string,  // e.g. "/wokwi-captures/exp-29/screenshot.png"
  serialSnippet: string,
  openInWokwiHref?: string,
}
```

## Data source
`lib/wokwi-projects.ts` reads at server-component build time from `content/wokwi-projects/` + `public/wokwi-captures/`. Returns null when a brief has no captured artifacts (graceful fallback to old WokwiEmbed).

## Related
- [[WokwiPipeline]] — produces the artifacts this consumes
- [[WokwiEmbed]] — old placeholder card, still used when no capture exists
- [[../decisions/wokwi-online-exception]]

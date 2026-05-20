---
name: skipped-browser-verification
description: Two orders shipped UI with broken embeds because no order plan ever ran a real browser.
metadata:
  type: failure
  authority: high
---

# skipped-browser-verification

## What happened
Order 1 (initial build) and Order 2 (live schematic + circuits) both shipped the electronics-tutorial without ever opening a browser. Both orders' implementers + reviewers verified `npm test` / `npm run build` / `npm run typecheck` / `npm run lint` — all green. The operator's first browser session revealed:
- Every CircuitJS embed was 404ing 4-7 resources (vendor script missed `style.css`, `gwt/clean/clean.css`, `setuplist.txt`, theme images). The simulator displayed but with broken styling and a missing setup-list.
- Every Wokwi embed showed a blank iframe (placeholder slug IDs don't resolve at wokwi.com).

## Why
The factory plan for both orders ended at `npm run build succeeds`. No step invoked Playwright. The post-order memory ritual produced lessons about the wokwi placeholder issue but didn't catch it via evidence — it was already documented in code comments, just never seen.

Root cause: code-level tests verify code-level correctness; only a browser verifies that the page actually works. The orders' acceptance criteria conflated the two.

## Resolution
- Vendor script repaired to fetch the full GWT runtime asset set + strip the SW registration block + rewrite `/circuit/` → `/circuitjs/` paths.
- WokwiEmbed gained a `placeholder` prop that renders a "BUILD YOUR OWN" setup card instead of a broken iframe when the registry's `match: 'placeholder'`.
- `tests/playtest/smoke.spec.ts` (Playwright) walks every route + asserts zero failed requests + screenshots each page.
- `npm run test:e2e` added to scripts.
- CLAUDE.md now declares the verification protocol explicitly: any UI-touching order MUST run `npm run test:e2e` before marking complete.

## How to recognize
Any plan that builds or modifies UI but lacks a Playwright (or equivalent real-browser) step at the end is missing its verification leg. Static analysis and unit tests are not substitutes.

## Related
- [[../lessons]] — `ui-orders-need-real-browser-verification`
- [[../decisions/wokwi-placeholder-honesty]] — already labeled honestly but not verified visually

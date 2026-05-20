---
name: client-side-search-fuse
description: Fuse.js for offline fuzzy search across experiments and formulas.
metadata:
  type: decision
  authority: medium
---

# client-side-search-fuse

## Decision
Use Fuse.js (~12KB gzip) for client-side fuzzy search; index built from briefs at server-component time, serialized to the SearchDialog client. ⌘K / Ctrl-K opens.

## Why
- Site is static + offline-first; no search server available
- Fuse.js is small, dependency-light, well-tested
- Brief content is small enough (36 entries) that full client-side indexing is cheap

## How to apply
Any future content addition (e.g., reference appendix) should extend `lib/search-index.ts` so the global search remains comprehensive.

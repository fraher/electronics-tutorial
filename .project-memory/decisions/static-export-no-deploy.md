---
name: static-export-no-deploy
description: Next.js output:'export' to /out, runs from file:// or `npx serve out`.
metadata:
  type: decision
  authority: high
---

# static-export-no-deploy

## Decision
Site is built as a Next.js static export (`output: 'export'` + `images.unoptimized: true`). No backend, no analytics, no hosting. Runs from `file://` or `npx serve out`.

## Why
Operator's stated posture is "personal local-only tutorial". Static export keeps copyright posture clean (no public deploy) and ensures full offline operation.

## How to apply
Reject any feature requiring a server (auth, persistence, server actions, dynamic API routes). Persistence happens via localStorage only.

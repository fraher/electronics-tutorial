---
name: function-prop-rsc-boundary
description: Passing function props from a server component to a client component breaks Next.js static export.
metadata:
  type: failure
  authority: high
---

# function-prop-rsc-boundary

## What happened
In Sprint 4-8, the first attempt to render ExperimentPage as a server component passed an `evaluate: (vars) => number` function to the FormulaSlider client component. `next build` failed: function props can't cross the RSC boundary.

## Why
Next.js's RSC protocol serializes server→client props as JSON; functions are unserializable. Static export amplifies this — the server side is the build, so the function literally cannot reach the client.

## Resolution
[[../decisions/server-client-rehydration]] — pass `id: string`, look up evaluator client-side via [[../entities/FormulaEvaluator]] registry.

## How to recognize
Build-time error like "Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with 'use server'". Diagnose by checking which prop is a function and adding a registry lookup pattern instead.

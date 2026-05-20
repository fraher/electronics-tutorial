import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  getExperimentSchematic,
  getAllExperimentSchematics,
} from './experiment-schematics';
import { ExperimentSchematic } from '@/components/schematic';

describe('experiment-schematics registry', () => {
  it('has a render function for every brief number 1..36', () => {
    const all = getAllExperimentSchematics();
    for (let n = 1; n <= 36; n++) {
      const fn = all[n];
      expect(fn, `missing schematic for brief ${n}`).toBeDefined();
      expect(typeof fn).toBe('function');
    }
  });

  it('returns undefined for out-of-range brief numbers', () => {
    expect(getExperimentSchematic(0)).toBeUndefined();
    expect(getExperimentSchematic(37)).toBeUndefined();
    expect(getExperimentSchematic(-1)).toBeUndefined();
  });

  // Spot-check three structurally different schematics: brief 2 (analog
  // V/I/R loop), brief 21 (digital gates), brief 32 (Arduino + peripheral).
  it.each([
    [2, { V_S: 9, V_F: 2.1, R: 1500 }],
    [21, { S: 0, R: 1, Q: 0 }],
    [32, { raw: 512, V_ref: 5, analogWrite: 128 }],
  ])('schematic %i renders without crashing for representative vars', (n, vars) => {
    const fn = getExperimentSchematic(n as number);
    if (!fn) throw new Error(`no schematic for ${n}`);
    const { container } = render(
      <ExperimentSchematic
        ariaLabel={`test schematic ${n}`}
        vars={vars as Record<string, number>}
        render={fn}
      />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    // The schematic body must actually emit some SVG primitives.
    expect(svg!.children.length).toBeGreaterThan(0);
  });

  it('handles empty vars dict gracefully (uses fallbacks)', () => {
    for (const n of [1, 14, 28, 36]) {
      const fn = getExperimentSchematic(n);
      if (!fn) throw new Error(`no schematic for ${n}`);
      const { container } = render(
        <ExperimentSchematic ariaLabel="x" vars={{}} render={fn} />,
      );
      expect(container.querySelector('svg')).not.toBeNull();
    }
  });
});

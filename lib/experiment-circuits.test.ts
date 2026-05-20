import { describe, it, expect } from 'vitest';
import {
  getExperimentCircuit,
  getAllExperimentCircuits,
  isPlausibleCirString,
} from './experiment-circuits';

describe('experiment-circuits registry', () => {
  // Briefs 12, 13 are pure soldering process — no circuit topology.
  // Briefs 29-36 are Arduino — they route through Wokwi, not CircuitJS.
  const ANALOG_NUMBERS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
  ];

  it('has a circuit entry for every analog brief', () => {
    const all = getAllExperimentCircuits();
    for (const n of ANALOG_NUMBERS) {
      const entry = all[n];
      expect(entry, `missing circuit for analog brief ${n}`).not.toBeNull();
    }
  });

  it('returns null for process briefs 12 and 13', () => {
    expect(getExperimentCircuit(12)).toBeNull();
    expect(getExperimentCircuit(13)).toBeNull();
  });

  it('returns null for Arduino briefs 29..36', () => {
    for (let n = 29; n <= 36; n++) {
      expect(getExperimentCircuit(n)).toBeNull();
    }
  });

  it('every analog .cir entry passes the structural plausibility check', () => {
    for (const n of ANALOG_NUMBERS) {
      const entry = getExperimentCircuit(n);
      if (entry?.kind === 'cir') {
        expect(isPlausibleCirString(entry.text), `brief ${n} cir invalid`).toBe(true);
      } else if (entry?.kind === 'builtin') {
        // Built-in entries must be a non-empty relative path.
        expect(entry.path).toMatch(/\.[a-zA-Z0-9]+$/);
        expect(entry.path).not.toMatch(/^\//);
      }
    }
  });
});

describe('isPlausibleCirString', () => {
  it('accepts a minimal valid .cir', () => {
    const ok = '$ 1 0.000005 10 50 5 50\nv 0 100 0 0 0 0 40 9 0 0 0.5\nw 0 100 100 100 0\n';
    expect(isPlausibleCirString(ok)).toBe(true);
  });

  it('rejects strings without a $ header', () => {
    expect(isPlausibleCirString('r 0 0 100 0 0 1000')).toBe(false);
    expect(isPlausibleCirString('')).toBe(false);
    expect(isPlausibleCirString('   ')).toBe(false);
  });

  it('rejects unknown component tags', () => {
    const bad = '$ 1 0.000005 10 50 5 50\nXYZ 0 0 100 0 0 999';
    expect(isPlausibleCirString(bad)).toBe(false);
  });

  it('rejects non-integer coordinates', () => {
    const bad = '$ 1 0.000005 10 50 5 50\nr 0 0 1.5 0 0 1000';
    expect(isPlausibleCirString(bad)).toBe(false);
  });
});

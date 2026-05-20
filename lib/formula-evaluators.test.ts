import { describe, it, expect } from 'vitest';
import { EVALUATORS, getEvaluator } from './formula-evaluators';
import { getAllBriefs } from './briefs';

describe('formula evaluators', () => {
  it('V = I · R (ohms-law)', () => {
    expect(EVALUATORS['ohms-law']({ I: 0.1, R: 100 })).toBeCloseTo(10);
  });

  it('P = V · I (power-vi)', () => {
    expect(EVALUATORS['power-vi']({ V: 5, I: 2 })).toBeCloseTo(10);
  });

  it('τ = R · C (rc-time-constant)', () => {
    expect(EVALUATORS['rc-time-constant']({ R: 10000, C: 0.000001 })).toBeCloseTo(0.01);
  });

  it('LED current = (V_S - V_F) / R', () => {
    expect(EVALUATORS['led-current-estimate']({ V_S: 9, V_F: 2.1, R: 1500 })).toBeCloseTo(
      6.9 / 1500,
    );
  });

  it('555 monostable width = 1.1 · R · C', () => {
    expect(EVALUATORS['555-monostable-width']({ R: 100000, C: 1e-5 })).toBeCloseTo(1.1);
  });

  it('voltage divider', () => {
    // V_in=5, R_fixed=10k, R_LDR=10k -> 2.5
    expect(EVALUATORS['voltage-divider']({ V_in: 5, R_fixed: 10000, R_LDR: 10000 })).toBeCloseTo(
      2.5,
    );
  });

  it('LC resonance (predictable AM broadcast band check)', () => {
    // L=100µH, C=100pF → f ≈ 1.59 MHz
    const f = EVALUATORS['lc-resonance']({ L: 100e-6, C: 100e-12 });
    expect(f).toBeGreaterThan(1.5e6);
    expect(f).toBeLessThan(1.7e6);
  });

  it('MIDI note 69 → 440 Hz', () => {
    expect(EVALUATORS['note-frequency-from-midi']({ n: 69 })).toBeCloseTo(440);
  });

  it('getEvaluator returns undefined for unknown ids', () => {
    expect(getEvaluator('nonexistent-formula-xyz')).toBeUndefined();
  });

  it('every brief formula id has a matching evaluator', () => {
    const missing: string[] = [];
    for (const b of getAllBriefs()) {
      for (const f of b.formulas) {
        if (!getEvaluator(f.id)) missing.push(`exp-${b.number}/${f.id}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

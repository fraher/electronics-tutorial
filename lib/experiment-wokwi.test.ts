import { describe, it, expect } from 'vitest';
import {
  getExperimentWokwi,
  getAllExperimentWokwi,
} from './experiment-wokwi';

describe('experiment-wokwi registry', () => {
  it('every Arduino brief 29..36 has a wokwi entry', () => {
    for (let n = 29; n <= 36; n++) {
      const entry = getExperimentWokwi(n);
      expect(entry, `missing wokwi entry for brief ${n}`).not.toBeNull();
      expect(entry!.projectId).toMatch(/^[a-z0-9-]+$/i);
      expect(entry!.match).toMatch(/^(placeholder|verified)$/);
    }
  });

  it('analog briefs 1..28 have no wokwi entry', () => {
    for (let n = 1; n <= 28; n++) {
      expect(getExperimentWokwi(n)).toBeNull();
    }
  });

  it('out-of-range numbers return null', () => {
    expect(getExperimentWokwi(0)).toBeNull();
    expect(getExperimentWokwi(37)).toBeNull();
  });

  it('full table contains 36 keyed entries', () => {
    const all = getAllExperimentWokwi();
    expect(Object.keys(all).length).toBe(36);
  });
});

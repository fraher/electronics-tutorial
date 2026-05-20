import { describe, it, expect } from 'vitest';
import {
  getAllBriefs,
  getBriefByNumber,
  getBriefsByChapter,
  isRealCirString,
} from './briefs';

describe('briefs loader', () => {
  it('loads exactly 36 briefs', () => {
    expect(getAllBriefs()).toHaveLength(36);
  });

  it('each brief has required fields', () => {
    for (const b of getAllBriefs()) {
      expect(b.id).toMatch(/^exp-\d+$/);
      expect(typeof b.number).toBe('number');
      expect(typeof b.chapter).toBe('number');
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.slug.length).toBeGreaterThan(0);
      expect(b.learning_objective.length).toBeGreaterThan(0);
      expect(b.paraphrased_summary.length).toBeGreaterThan(0);
      expect(Array.isArray(b.parts)).toBe(true);
      expect(Array.isArray(b.formulas)).toBe(true);
      expect(Array.isArray(b.takeaways)).toBe(true);
      expect(b.takeaways.length).toBeGreaterThan(0);
    }
  });

  it('numbers run 1..36 with no gaps', () => {
    const nums = getAllBriefs().map((b) => b.number).sort((a, b) => a - b);
    expect(nums).toEqual(Array.from({ length: 36 }, (_, i) => i + 1));
  });

  it('chapter distribution matches the order: 5/6/3/9/13', () => {
    expect(getBriefsByChapter(1)).toHaveLength(5);
    expect(getBriefsByChapter(2)).toHaveLength(6);
    expect(getBriefsByChapter(3)).toHaveLength(3);
    expect(getBriefsByChapter(4)).toHaveLength(9);
    expect(getBriefsByChapter(5)).toHaveLength(13);
  });

  it('getBriefByNumber retrieves the right brief', () => {
    const b = getBriefByNumber(1);
    expect(b?.title).toBe('Taste the Power');
    expect(getBriefByNumber(999)).toBeUndefined();
  });

  it('Arduino experiments 29-36 have a wokwi project id', () => {
    for (let n = 29; n <= 36; n++) {
      const b = getBriefByNumber(n);
      expect(b?.suggested_wokwi_project_id).toBeTruthy();
    }
  });

  it('isRealCirString rejects TBD/N/A and accepts $-prefixed payloads', () => {
    expect(isRealCirString(null)).toBe(false);
    expect(isRealCirString('')).toBe(false);
    expect(isRealCirString('TBD — implementer to construct...')).toBe(false);
    expect(isRealCirString('N/A — process experiment.')).toBe(false);
    expect(isRealCirString('$ 1 0.000005 10.20 50 5 50\nr 1 2 0 0 100\n')).toBe(true);
  });
});

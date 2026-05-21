import { describe, it, expect } from 'vitest';
import { getWokwiProject, summarizeSerial } from './wokwi-projects';

describe('getWokwiProject', () => {
  it('returns project data for exp-29 (reference)', () => {
    const proj = getWokwiProject(29);
    expect(proj).not.toBeNull();
    expect(proj!.number).toBe(29);
    expect(proj!.slug).toBe('exp-29-blink');
    expect(proj!.sketch).toContain('void setup()');
    expect(proj!.screenshotPath).toBe('/wokwi-captures/exp-29/screenshot.png');
    expect(proj!.meta.title.length).toBeGreaterThan(0);
    expect(proj!.openInWokwiHref).toMatch(/^https:\/\/wokwi\.com\//);
  });

  it('returns project data for one of the Sprint-B briefs (exp-32)', () => {
    const proj = getWokwiProject(32);
    expect(proj).not.toBeNull();
    expect(proj!.sketch).toMatch(/analogRead/);
    expect(proj!.serialLog.length).toBeGreaterThan(0);
  });

  it('returns null for an out-of-range brief number', () => {
    expect(getWokwiProject(99)).toBeNull();
    expect(getWokwiProject(1)).toBeNull(); // analog brief, no Wokwi project
  });
});

describe('summarizeSerial', () => {
  it('returns the first N non-empty lines joined by newlines', () => {
    const log = 'a\nb\n\nc\nd\ne\n';
    expect(summarizeSerial(log, 3)).toBe('a\nb\nc');
  });

  it('returns empty for an empty log', () => {
    expect(summarizeSerial('')).toBe('');
  });
});

/**
 * Shared helpers for the LiveSchematic primitives.
 *
 * These components VISUALIZE formula state — they are not simulators. CircuitJS
 * still owns simulation. See `.project-memory/entities/LiveSchematic.md`.
 */

/** Clamp a value into [min, max]. */
export function clamp(v: number, min: number, max: number): number {
  if (Number.isNaN(v)) return min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

/**
 * Map a magnitude to a stroke width on a log-ish curve.
 *
 *   |x| = 0          → 1px
 *   |x| ≈ max        → ~6-8px
 *
 * We use a log curve so small currents are still visible but big currents
 * don't blow up. The output is clamped into [minPx, maxPx].
 */
export function magnitudeToStrokeWidth(
  value: number,
  scale: number,
  minPx = 1,
  maxPx = 8,
): number {
  const mag = Math.abs(value);
  if (mag <= 0 || !Number.isFinite(mag)) return minPx;
  // log1p so small values map gently above the floor and big values saturate
  const safeScale = Math.max(scale, 1e-12);
  const t = Math.log1p(mag) / Math.log1p(safeScale);
  return clamp(minPx + (maxPx - minPx) * clamp(t, 0, 1), minPx, maxPx);
}

/**
 * Map a magnitude to a glow / drop-shadow intensity in [0, 1].
 * Uses the same log curve so it tracks stroke width.
 */
export function magnitudeToIntensity(value: number, scale: number): number {
  const mag = Math.abs(value);
  if (mag <= 0 || !Number.isFinite(mag)) return 0;
  const safeScale = Math.max(scale, 1e-12);
  const t = Math.log1p(mag) / Math.log1p(safeScale);
  return clamp(t, 0, 1);
}

/**
 * Format an SI-prefixed engineering value: 1500 → "1.5 k", 0.0033 → "3.3 m".
 * The returned string does NOT include a unit suffix — caller appends "Ω", "F", etc.
 */
export function formatSI(value: number, precision = 3): string {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return '0';
  const abs = Math.abs(value);
  const prefixes: [number, string][] = [
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'µ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ];
  for (const [scale, sym] of prefixes) {
    if (abs >= scale) {
      const n = value / scale;
      const p = Math.max(1, Math.min(100, Math.floor(precision)));
      return `${Number(n.toPrecision(p))}${sym ? ' ' + sym : ''}`;
    }
  }
  // very small
  const p = Math.max(1, Math.min(100, Math.floor(precision)));
  return `${Number(value.toPrecision(p))}`;
}

/**
 * Power dissipated in a resistor: P = I²R.
 */
export function resistorPower(current: number, resistance: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(resistance)) return 0;
  return current * current * resistance;
}

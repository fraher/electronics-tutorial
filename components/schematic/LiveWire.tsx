'use client';

import * as React from 'react';
import { magnitudeToStrokeWidth, magnitudeToIntensity } from './utils';

export type LiveWireProps = {
  /** Start point [x,y] in SVG user units. */
  from: [number, number];
  /** End point [x,y] in SVG user units. */
  to: [number, number];
  /** Signed current (Amps). Sign determines dot-flow direction. */
  current: number;
  /** Max-current reference for scaling stroke width. Default 1A. */
  currentMax?: number;
  /** Animate small dots along the wire to show charge flow. Default true. */
  animateDots?: boolean;
  /** Test id for assertions. */
  testId?: string;
};

/**
 * A live wire — a straight SVG line whose stroke width and color shift with
 * |current|, optionally with moving dots showing direction.
 *
 * Renders an <g> group; callers compose it inside a parent <svg>.
 */
export function LiveWire({
  from,
  to,
  current,
  currentMax = 1,
  animateDots = true,
  testId,
}: LiveWireProps) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const width = magnitudeToStrokeWidth(current, currentMax, 1, 8);
  const intensity = magnitudeToIntensity(current, currentMax);

  // Color: neutral at 0 current, warm orange/red as it rises.
  // Use HSL: hue 210 (blue/grey) → 15 (orange) as intensity goes 0 → 1.
  const hue = 210 - 195 * intensity;
  const saturation = 20 + 60 * intensity;
  const lightness = 50;
  const color = `hsl(${hue}deg ${saturation}% ${lightness}%)`;

  // Direction sign for moving dots.
  const direction = current >= 0 ? 1 : -1;
  // Animation duration: faster when current is higher; never 0 (avoid divide).
  const speed = Math.max(0.05, Math.abs(current) / Math.max(currentMax, 1e-12));
  const durSec = clamp01(2.0 / Math.max(speed, 0.05));

  // Path length for dasharray dot pattern.
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);

  return (
    <g data-testid={testId} aria-hidden="true">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        data-current={current}
        data-stroke-width={width}
        style={{ transition: 'stroke 200ms, stroke-width 200ms' }}
      />
      {animateDots && Math.abs(current) > 1e-9 && len > 0 && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth={Math.max(2, width * 0.5)}
          strokeLinecap="round"
          strokeDasharray="2 14"
          opacity={0.85}
          data-testid={testId ? `${testId}-dots` : undefined}
          className="motion-safe:animate-wire-flow motion-reduce:animate-none"
          style={
            {
              // CSS variables consumed by the @keyframes in globals.css.
              ['--wire-flow-duration' as string]: `${durSec}s`,
              ['--wire-flow-direction' as string]: direction === 1 ? 'normal' : 'reverse',
            } as React.CSSProperties
          }
        />
      )}
    </g>
  );
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 1;
  if (v < 0.1) return 0.1;
  if (v > 10) return 10;
  return v;
}

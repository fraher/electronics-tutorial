'use client';

import * as React from 'react';
import { magnitudeToIntensity, resistorPower } from './utils';

export type LiveLampProps = {
  x: number;
  y: number;
  current: number;
  /** Bulb resistance (Ω). Used to compute P = I²R. */
  resistance: number;
  /** Reference power for glow scaling. Default 1W. */
  powerMax?: number;
  label?: string;
  testId?: string;
};

/**
 * Incandescent lamp symbol — circle with internal X. Filament glow scales with
 * dissipated power.
 */
export function LiveLamp({
  x,
  y,
  current,
  resistance,
  powerMax = 1,
  label,
  testId,
}: LiveLampProps) {
  const power = resistorPower(current, resistance);
  const intensity = magnitudeToIntensity(power, powerMax);
  const r = 14;
  const lead = 18;

  return (
    <g data-testid={testId} transform={`translate(${x} ${y})`} aria-hidden="true">
      {/* Glow halo */}
      {intensity > 0.01 && (
        <circle
          data-testid={testId ? `${testId}-glow` : 'live-lamp-glow'}
          cx={0}
          cy={0}
          r={r + 6}
          fill="hsl(50deg 100% 60%)"
          opacity={intensity * 0.6}
          style={{
            filter: `drop-shadow(0 0 ${4 + intensity * 14}px hsl(50deg 100% 60%))`,
            transition: 'opacity 200ms, filter 200ms',
          }}
        />
      )}
      {/* Leads */}
      <line x1={-r - lead} y1={0} x2={-r} y2={0} stroke="currentColor" strokeWidth={1.5} />
      <line x1={r} y1={0} x2={r + lead} y2={0} stroke="currentColor" strokeWidth={1.5} />
      {/* Bulb circle */}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill={intensity > 0 ? `hsl(50deg 100% ${50 + 30 * intensity}%)` : 'none'}
        opacity={0.5 + 0.5 * intensity}
        stroke="currentColor"
        strokeWidth={1.5}
        style={{ transition: 'fill 200ms, opacity 200ms' }}
      />
      {/* Filament X */}
      <line x1={-r * 0.65} y1={-r * 0.65} x2={r * 0.65} y2={r * 0.65} stroke="currentColor" strokeWidth={1.2} />
      <line x1={-r * 0.65} y1={r * 0.65} x2={r * 0.65} y2={-r * 0.65} stroke="currentColor" strokeWidth={1.2} />
      <text x={0} y={r + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="currentColor">
        {label ?? 'Lamp'}
      </text>
    </g>
  );
}

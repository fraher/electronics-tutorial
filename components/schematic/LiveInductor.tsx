'use client';

import * as React from 'react';
import { formatSI, magnitudeToIntensity } from './utils';

export type LiveInductorProps = {
  x: number;
  y: number;
  /** Inductance in Henries (for label). */
  inductance: number;
  /** Current through the coil (A). */
  current: number;
  /** Reference current for field-line density. Default 1A. */
  currentMax?: number;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
};

/**
 * Coil/inductor symbol — 4 humps. Dashed field-lines surround the coil with
 * density proportional to |current|.
 */
export function LiveInductor({
  x,
  y,
  inductance,
  current,
  currentMax = 1,
  label,
  orientation = 'horizontal',
  testId,
}: LiveInductorProps) {
  const intensity = magnitudeToIntensity(current, currentMax);
  const fieldOpacity = intensity * 0.8;
  const displayLabel = label ?? `${formatSI(inductance)}H`;

  // 4 humps of radius 8 over a 64-unit span; leads 18 on each side.
  const humps = 4;
  const r = 8;
  const span = humps * 2 * r;
  const xStart = -span / 2;
  const lead = 18;

  // Build the humps path: each hump is an arc going up.
  let d = `M ${xStart} 0`;
  for (let i = 0; i < humps; i++) {
    const cx = xStart + (i * 2 + 1) * r;
    d += ` A ${r} ${r} 0 0 1 ${cx + r} 0`;
  }

  const rotate = orientation === 'vertical' ? 90 : 0;

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      aria-hidden="true"
    >
      {/* Field lines — dashed ellipses around the coil. Density scales with intensity. */}
      {intensity > 0.05 && (
        <g
          data-testid={testId ? `${testId}-field` : 'live-inductor-field'}
          opacity={fieldOpacity}
          stroke="hsl(220deg 70% 60%)"
          fill="none"
          strokeDasharray="3 3"
          strokeWidth={1}
        >
          <ellipse cx={0} cy={0} rx={span / 2 + 4} ry={r + 4} />
          {intensity > 0.4 && (
            <ellipse cx={0} cy={0} rx={span / 2 + 10} ry={r + 9} opacity={0.7} />
          )}
          {intensity > 0.75 && (
            <ellipse cx={0} cy={0} rx={span / 2 + 16} ry={r + 14} opacity={0.5} />
          )}
        </g>
      )}
      {/* Leads */}
      <line
        x1={xStart - lead}
        y1={0}
        x2={xStart}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line
        x1={xStart + span}
        y1={0}
        x2={xStart + span + lead}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Coil */}
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <text
        x={0}
        y={r + 16}
        textAnchor="middle"
        fontSize={10}
        fontFamily="monospace"
        fill="currentColor"
        transform={orientation === 'vertical' ? `rotate(${-rotate})` : undefined}
      >
        {displayLabel}
      </text>
    </g>
  );
}

'use client';

import * as React from 'react';
import { magnitudeToIntensity } from './utils';

export type LiveDiodeProps = {
  x: number;
  y: number;
  /** Current through the diode (A). Positive = forward bias. */
  current: number;
  /** Forward voltage drop (V), for label. Optional. */
  vF?: number;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  /** Reference forward current for glow intensity. Default 0.05A. */
  currentMax?: number;
  testId?: string;
};

/**
 * Standard diode symbol: triangle pointing toward a cathode bar. Forward-biased
 * (current > 0) shows a green glow + small flow arrow; reverse-biased is dim.
 */
export function LiveDiode({
  x,
  y,
  current,
  vF,
  label,
  orientation = 'horizontal',
  currentMax = 0.05,
  testId,
}: LiveDiodeProps) {
  const forward = current > 1e-9;
  const intensity = forward ? magnitudeToIntensity(current, currentMax) : 0;
  const glowOpacity = intensity * 0.85;

  const w = 14; // triangle width
  const h = 10; // triangle half-height
  const lead = 18;
  const displayLabel = label ?? (vF != null ? `Vf=${vF.toFixed(2)}V` : 'D');

  const rotate = orientation === 'vertical' ? 90 : 0;

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      aria-hidden="true"
      opacity={forward ? 1 : 0.55}
    >
      {/* Glow when forward biased */}
      {forward && intensity > 0.01 && (
        <circle
          data-testid={testId ? `${testId}-glow` : 'live-diode-glow'}
          cx={0}
          cy={0}
          r={14}
          fill="hsl(140deg 70% 50%)"
          opacity={glowOpacity * 0.4}
          style={{
            filter: `drop-shadow(0 0 ${3 + intensity * 8}px hsl(140deg 70% 50%))`,
            transition: 'opacity 200ms, filter 200ms',
          }}
        />
      )}
      {/* Anode lead */}
      <line
        x1={-w - lead}
        y1={0}
        x2={-w}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Triangle */}
      <polygon
        points={`${-w},${-h} ${-w},${h} ${0},0`}
        fill={forward ? 'hsl(140deg 70% 45%)' : 'currentColor'}
        stroke="currentColor"
        strokeWidth={1.2}
      />
      {/* Cathode bar */}
      <line
        x1={0}
        y1={-h}
        x2={0}
        y2={h}
        stroke="currentColor"
        strokeWidth={2}
      />
      {/* Cathode lead */}
      <line
        x1={0}
        y1={0}
        x2={lead}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <text
        x={0}
        y={h + 14}
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

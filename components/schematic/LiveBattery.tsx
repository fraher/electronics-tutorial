'use client';

import * as React from 'react';
import { formatSI } from './utils';

export type LiveBatteryProps = {
  x: number;
  y: number;
  /** Voltage (V). Sign flips polarity arrow direction. */
  voltage: number;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
};

/**
 * Battery / DC voltage source — long plate (+) / short plate (-) symbol with
 * a live voltage label and polarity markers.
 */
export function LiveBattery({
  x,
  y,
  voltage,
  label,
  orientation = 'horizontal',
  testId,
}: LiveBatteryProps) {
  const polarity = voltage >= 0 ? 1 : -1;
  const displayLabel = label ?? `${formatSI(voltage)}V`;
  const rotate = orientation === 'vertical' ? 90 : 0;
  const lead = 18;
  const gap = 4;

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      aria-hidden="true"
    >
      {/* Left lead */}
      <line x1={-gap - 6 - lead} y1={0} x2={-gap - 6} y2={0} stroke="currentColor" strokeWidth={1.5} />
      {/* Right lead */}
      <line x1={gap + 6} y1={0} x2={gap + 6 + lead} y2={0} stroke="currentColor" strokeWidth={1.5} />
      {/* Long plate (+) */}
      <line
        x1={polarity > 0 ? gap : -gap}
        y1={-12}
        x2={polarity > 0 ? gap : -gap}
        y2={12}
        stroke="currentColor"
        strokeWidth={2}
      />
      {/* Short plate (-) */}
      <line
        x1={polarity > 0 ? -gap : gap}
        y1={-6}
        x2={polarity > 0 ? -gap : gap}
        y2={6}
        stroke="currentColor"
        strokeWidth={2}
      />
      {/* Polarity glyphs */}
      <text
        x={polarity > 0 ? gap + 8 : -gap - 8}
        y={-14}
        textAnchor="middle"
        fontSize={9}
        fontFamily="monospace"
        fill="currentColor"
        data-testid={testId ? `${testId}-plus` : undefined}
      >
        +
      </text>
      <text
        x={polarity > 0 ? -gap - 8 : gap + 8}
        y={-14}
        textAnchor="middle"
        fontSize={9}
        fontFamily="monospace"
        fill="currentColor"
        data-testid={testId ? `${testId}-minus` : undefined}
      >
        −
      </text>
      <text
        x={0}
        y={24}
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

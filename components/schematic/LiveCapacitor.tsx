'use client';

import * as React from 'react';
import { clamp, formatSI } from './utils';

export type LiveCapacitorProps = {
  x: number;
  y: number;
  /** Capacitance in Farads. */
  capacitance: number;
  /** Stored charge in Coulombs. If omitted, derived from voltage. */
  charge?: number;
  /** Voltage across plates (V). */
  voltage: number;
  /** Max-charge reference for fill scaling. Default = capacitance × 12V. */
  chargeMax?: number;
  /** Override label. */
  label?: string;
  /** Orientation. */
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
};

/**
 * Two-plate capacitor symbol with a "charge fill" between the plates whose
 * height/opacity scales with Q = CV. Suggests a tank filling up.
 */
export function LiveCapacitor({
  x,
  y,
  capacitance,
  charge,
  voltage,
  chargeMax,
  label,
  orientation = 'horizontal',
  testId,
}: LiveCapacitorProps) {
  const q = charge ?? capacitance * voltage;
  const qMax = chargeMax ?? (Math.abs(capacitance * 12) || 1);
  const fillFraction = clamp(Math.abs(q) / qMax, 0, 1);

  // Plate geometry. Horizontal: two vertical lines (plates) with gap.
  const plateHalfH = 16; // half-height of each plate
  const gap = 8; // gap between plates
  const lead = 18;

  const displayLabel = label ?? `${formatSI(capacitance)}F`;
  const rotate = orientation === 'vertical' ? 90 : 0;

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      aria-hidden="true"
    >
      {/* Left lead */}
      <line
        x1={-gap / 2 - lead}
        y1={0}
        x2={-gap / 2}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Right lead */}
      <line
        x1={gap / 2}
        y1={0}
        x2={gap / 2 + lead}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Charge fill — a rectangle between the plates whose height scales with Q. */}
      {fillFraction > 0 && (
        <rect
          data-testid={testId ? `${testId}-fill` : 'live-capacitor-fill'}
          x={-gap / 2}
          y={-plateHalfH * fillFraction}
          width={gap}
          height={2 * plateHalfH * fillFraction}
          fill={q >= 0 ? 'hsl(190deg 80% 55%)' : 'hsl(20deg 80% 55%)'}
          opacity={0.35 + 0.5 * fillFraction}
          data-fill-fraction={fillFraction.toFixed(3)}
          style={{ transition: 'all 200ms' }}
        />
      )}
      {/* Plates */}
      <line
        x1={-gap / 2}
        y1={-plateHalfH}
        x2={-gap / 2}
        y2={plateHalfH}
        stroke="currentColor"
        strokeWidth={2}
      />
      <line
        x1={gap / 2}
        y1={-plateHalfH}
        x2={gap / 2}
        y2={plateHalfH}
        stroke="currentColor"
        strokeWidth={2}
      />
      <text
        x={0}
        y={plateHalfH + 14}
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

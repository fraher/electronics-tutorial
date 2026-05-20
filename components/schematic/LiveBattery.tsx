'use client';

import * as React from 'react';
import { formatSI } from './utils';
import { useDraggableValue } from './interaction';

export type LiveBatteryProps = {
  x: number;
  y: number;
  /** Voltage (V). Sign flips polarity arrow direction. */
  voltage: number;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
  /** Bidirectional drag-to-change callback (linear scale). */
  onChange?: (voltage: number) => void;
  /** Drag bounds. Default 0 - 30V (linear feels natural for voltage). */
  min?: number;
  max?: number;
  step?: number;
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
  onChange,
  min = 0,
  max = 30,
  step,
}: LiveBatteryProps) {
  const polarity = voltage >= 0 ? 1 : -1;
  const displayLabel = label ?? `${formatSI(voltage)}V`;
  const rotate = orientation === 'vertical' ? 90 : 0;
  const lead = 18;
  const gap = 4;

  const interactive = typeof onChange === 'function';
  const drag = useDraggableValue({
    value: voltage,
    min,
    max,
    step,
    logScale: false,
    axis: orientation === 'vertical' ? 'x' : 'y',
    ariaLabel: `battery ${formatSI(voltage)}V`,
    onChange,
  });

  const interactiveProps = interactive
    ? {
        ...drag.pointerHandlers,
        ...drag.keyboardHandlers,
        ...drag.ariaProps,
        'data-interactive': 'true',
        'data-dragging': drag.isDragging ? 'true' : 'false',
        style: {
          cursor: orientation === 'vertical' ? 'ew-resize' : 'ns-resize',
          touchAction: 'none' as const,
          outline: 'none',
        } as React.CSSProperties,
      }
    : { 'aria-hidden': 'true' as const };

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      {...interactiveProps}
    >
      {interactive && (
        <rect
          x={-gap - 6 - lead}
          y={-16}
          width={2 * (gap + 6 + lead)}
          height={32}
          rx={4}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={drag.isDragging ? 0.6 : 0.3}
          data-testid={testId ? `${testId}-hitbox` : undefined}
        />
      )}
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

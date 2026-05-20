'use client';

import * as React from 'react';
import { formatSI, magnitudeToIntensity, resistorPower } from './utils';
import { useDraggableValue } from './interaction';

export type LiveResistorProps = {
  /** Center x in SVG user units. */
  x: number;
  /** Center y in SVG user units. */
  y: number;
  /** Resistance in Ohms (used for power calc and label). */
  value: number;
  /** Current through the resistor (A). */
  current: number;
  /** Override the auto label. */
  label?: string;
  /** Horizontal (default) or vertical orientation. */
  orientation?: 'horizontal' | 'vertical';
  /** Reference power for glow saturation (W). Default 1W. */
  powerMax?: number;
  /** Test id for assertions. */
  testId?: string;
  /** Bidirectional drag-to-change callback. */
  onChange?: (resistance: number) => void;
  /** Drag bounds (only used when onChange is provided). Default 1Ω - 1MΩ on log scale. */
  min?: number;
  max?: number;
  step?: number;
};

/**
 * Classic IEEE zig-zag resistor symbol. Glows orange/red as power rises (P = I²R).
 *
 * The body spans 60 SVG units; the leads stick out another 20 each side.
 */
export function LiveResistor({
  x,
  y,
  value,
  current,
  label,
  orientation = 'horizontal',
  powerMax = 1,
  testId,
  onChange,
  min = 1,
  max = 1_000_000,
  step,
}: LiveResistorProps) {
  const interactive = typeof onChange === 'function';
  const drag = useDraggableValue({
    value,
    min,
    max,
    step,
    logScale: true,
    axis: orientation === 'vertical' ? 'x' : 'y',
    ariaLabel: `resistor ${formatSI(value)}Ω`,
    onChange,
  });
  const power = resistorPower(current, value);
  const intensity = magnitudeToIntensity(power, powerMax);
  // Glow opacity: 0 at no power, ~0.9 at saturated power.
  const glowOpacity = intensity * 0.9;
  const displayLabel = label ?? `${formatSI(value)}Ω`;

  // Build the zig-zag path centered around (x,y), oriented horizontally first.
  // Half-width 30 on body, leads 20 on each side → total 100 across.
  const half = 30;
  const lead = 20;
  // 6 zig peaks within ±half range
  const zigPoints: [number, number][] = [
    [-half, 0],
    [-half + 10, -8],
    [-half + 20, 8],
    [-half + 30, -8],
    [-half + 40, 8],
    [-half + 50, -8],
    [half, 0],
  ];

  const pathD = zigPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`)
    .join(' ');

  const rotate = orientation === 'vertical' ? 90 : 0;

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
      {/* Interactive hit-box / focus outline */}
      {interactive && (
        <rect
          x={-half - lead}
          y={-16}
          width={2 * (half + lead)}
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
      {/* Halo for glow effect (rendered when there is meaningful power) */}
      {intensity > 0.01 && (
        <ellipse
          data-testid={testId ? `${testId}-glow` : 'live-resistor-glow'}
          cx={0}
          cy={0}
          rx={half + 6}
          ry={14}
          fill="hsl(20deg 90% 55%)"
          opacity={glowOpacity * 0.5}
          style={{
            filter: `drop-shadow(0 0 ${4 + intensity * 10}px hsl(20deg 90% 55%))`,
            transition: 'opacity 200ms, filter 200ms',
          }}
        />
      )}
      {/* Left lead */}
      <line
        x1={-half - lead}
        y1={0}
        x2={-half}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Right lead */}
      <line
        x1={half}
        y1={0}
        x2={half + lead}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Zig-zag body */}
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Label below (counter-rotates if vertical so text stays upright) */}
      <text
        x={0}
        y={26}
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

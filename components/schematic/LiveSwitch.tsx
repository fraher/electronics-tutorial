'use client';

import * as React from 'react';

export type LiveSwitchProps = {
  x: number;
  y: number;
  closed: boolean;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
};

/**
 * SPST switch — two terminal dots with a hinged lever that lies flat (closed)
 * or angles up (open).
 */
export function LiveSwitch({
  x,
  y,
  closed,
  label,
  orientation = 'horizontal',
  testId,
}: LiveSwitchProps) {
  const span = 30;
  const lead = 14;
  const rotate = orientation === 'vertical' ? 90 : 0;

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      data-state={closed ? 'closed' : 'open'}
      aria-hidden="true"
    >
      {/* Leads */}
      <line x1={-span / 2 - lead} y1={0} x2={-span / 2} y2={0} stroke="currentColor" strokeWidth={1.5} />
      <line x1={span / 2} y1={0} x2={span / 2 + lead} y2={0} stroke="currentColor" strokeWidth={1.5} />
      {/* Terminal dots */}
      <circle cx={-span / 2} cy={0} r={2.5} fill="currentColor" />
      <circle cx={span / 2} cy={0} r={2.5} fill="currentColor" />
      {/* Lever */}
      <line
        x1={-span / 2}
        y1={0}
        x2={closed ? span / 2 : span / 2 - 6}
        y2={closed ? 0 : -16}
        stroke={closed ? 'hsl(140deg 70% 45%)' : 'currentColor'}
        strokeWidth={2}
        strokeLinecap="round"
        style={{ transition: 'all 200ms' }}
      />
      <text
        x={0}
        y={18}
        textAnchor="middle"
        fontSize={10}
        fontFamily="monospace"
        fill="currentColor"
        transform={orientation === 'vertical' ? `rotate(${-rotate})` : undefined}
      >
        {label ?? (closed ? 'SW (closed)' : 'SW (open)')}
      </text>
    </g>
  );
}

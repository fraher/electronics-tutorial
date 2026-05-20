'use client';

import * as React from 'react';
import { useToggle } from './interaction';

export type LiveSwitchProps = {
  x: number;
  y: number;
  closed: boolean;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  testId?: string;
  /** Optional bidirectional callback. When provided, clicking the switch toggles it. */
  onChange?: (closed: boolean) => void;
};

/**
 * SPST switch — two terminal dots with a hinged lever that lies flat (closed)
 * or angles up (open).
 *
 * When `onChange` is provided, the switch becomes interactive: click / Space /
 * Enter toggle its state, with full ARIA role="switch" wiring.
 */
export function LiveSwitch({
  x,
  y,
  closed,
  label,
  orientation = 'horizontal',
  testId,
  onChange,
}: LiveSwitchProps) {
  const span = 30;
  const lead = 14;
  const rotate = orientation === 'vertical' ? 90 : 0;

  const interactive = typeof onChange === 'function';
  const toggle = useToggle({
    value: closed,
    ariaLabel: label ?? (closed ? 'switch (closed)' : 'switch (open)'),
    onChange,
  });

  const interactiveAria = interactive
    ? {
        ...toggle.ariaProps,
        'data-interactive': 'true',
      }
    : { 'aria-hidden': 'true' as const };

  const interactiveHandlers = interactive
    ? {
        ...toggle.buttonHandlers,
        style: { cursor: 'pointer', outline: 'none' } as React.CSSProperties,
      }
    : {};

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      data-state={closed ? 'closed' : 'open'}
      {...interactiveAria}
      {...interactiveHandlers}
      className={interactive ? 'focus:outline-none focus-visible:[&_.hitbox]:stroke-blue-400' : undefined}
    >
      {/* Hit-box / focus outline (only when interactive) */}
      {interactive && (
        <rect
          className="hitbox"
          x={-span / 2 - lead}
          y={-20}
          width={span + 2 * lead}
          height={40}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={0.35}
          rx={4}
          data-testid={testId ? `${testId}-hitbox` : undefined}
        />
      )}
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

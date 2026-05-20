'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type OnVarChange = (name: string, value: number | boolean) => void;

export type ExperimentSchematicProps = {
  /**
   * Render-prop that places primitives based on the slider's current variable
   * state. Caller composes <LiveWire />, <LiveResistor />, etc. The optional
   * 2nd arg lets the closure wire bidirectional callbacks back through to the
   * owning FormulaSlider state.
   */
  render: (vars: Record<string, number>, onVarChange?: OnVarChange) => React.ReactNode;
  /** Current variable values from the FormulaSlider (or any caller). */
  vars: Record<string, number>;
  /** Bidirectional state callback. When provided, primitives can call this. */
  onVarChange?: OnVarChange;
  /** Accessible label — what does this schematic depict? */
  ariaLabel: string;
  /** Optional legend lines (one short line per visual). */
  legend?: { glyph: React.ReactNode; text: string }[];
  /** Viewbox override; default "0 0 400 240". */
  viewBox?: string;
  /** Show subtle grid backdrop. Default true. */
  showGrid?: boolean;
  className?: string;
  testId?: string;
};

/**
 * The ExperimentSchematic composer wraps a render-prop in a responsive <svg>
 * with a subtle grid and optional legend. It is a pure presentation surface —
 * caller owns variable state (usually via FormulaSlider).
 *
 * See `.project-memory/entities/LiveSchematic.md` for design intent.
 */
export const ExperimentSchematic = React.memo(function ExperimentSchematic({
  render,
  vars,
  onVarChange,
  ariaLabel,
  legend,
  viewBox = '0 0 400 240',
  showGrid = true,
  className,
  testId,
}: ExperimentSchematicProps) {
  const content = React.useMemo(
    () => render(vars, onVarChange),
    [render, vars, onVarChange],
  );

  return (
    <div className={cn('w-full', className)} data-testid={testId}>
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={ariaLabel}
        className="w-full h-auto max-w-full text-foreground/70"
        preserveAspectRatio="xMidYMid meet"
        data-testid={testId ? `${testId}-svg` : 'experiment-schematic-svg'}
      >
        {showGrid && (
          <>
            <defs>
              <pattern
                id="experiment-schematic-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="10" cy="10" r="0.6" fill="currentColor" opacity="0.18" />
              </pattern>
            </defs>
            <rect
              x={0}
              y={0}
              width="100%"
              height="100%"
              fill="url(#experiment-schematic-grid)"
            />
          </>
        )}
        {content}
      </svg>
      {legend && legend.length > 0 && (
        <ul
          className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"
          aria-label="Schematic legend"
          data-testid={testId ? `${testId}-legend` : undefined}
        >
          {legend.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-flex h-3 w-5 items-center justify-center">
                {item.glyph}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

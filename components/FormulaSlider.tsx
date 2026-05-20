'use client';

import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { KatexInline } from '@/components/katex-inline';
import { cn } from '@/lib/utils';

export type Var = {
  name: string;
  min: number;
  max: number;
  step?: number;
  default?: number;
  unit?: string;
};

export type FormulaSliderProps = {
  formula: string;
  evaluate: (vals: Record<string, number>) => number;
  vars: Var[];
  solveFor: { name: string; unit?: string; precision?: number };
  title?: string;
  className?: string;
};

/** Format a number to `precision` significant digits. */
function formatPrecision(value: number, precision = 3): string {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return '0';
  // toPrecision requires 1..100; treat 0 as "round to integer".
  if (precision <= 0) return String(Math.round(value));
  const p = Math.min(100, Math.max(1, Math.floor(precision)));
  return Number(value.toPrecision(p)).toString();
}

export function FormulaSlider({
  formula,
  evaluate,
  vars,
  solveFor,
  title,
  className,
}: FormulaSliderProps) {
  const [values, setValues] = React.useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const v of vars) {
      init[v.name] = v.default ?? v.min;
    }
    return init;
  });

  const result = React.useMemo(() => evaluate(values), [evaluate, values]);
  const precision = solveFor.precision ?? 3;
  const resultText = `${formatPrecision(result, precision)}${solveFor.unit ? ' ' + solveFor.unit : ''}`;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 text-card-foreground shadow-sm space-y-4',
        className,
      )}
    >
      {title ? <h3 className="text-sm font-semibold tracking-tight">{title}</h3> : null}

      <div className="flex justify-center py-2">
        <KatexInline math={formula} displayMode />
      </div>

      <div className="space-y-4">
        {vars.map((v) => {
          const label = `${v.name}${v.unit ? ' (' + v.unit + ')' : ''}`;
          const step = v.step ?? (v.max - v.min) / 100;
          const current = values[v.name];
          return (
            <div key={v.name} className="space-y-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
                  {formatPrecision(current, 4)}
                  {v.unit ? ' ' + v.unit : ''}
                </span>
              </div>
              <Slider
                aria-label={label}
                min={v.min}
                max={v.max}
                step={step}
                value={[current]}
                onValueChange={(arr) =>
                  setValues((prev) => ({ ...prev, [v.name]: arr[0] }))
                }
              />
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            {solveFor.name}
            {solveFor.unit ? ` (${solveFor.unit})` : ''}
          </span>
          <span
            data-testid="formula-slider-result"
            className="font-mono text-xl font-semibold tabular-nums"
          >
            {resultText}
          </span>
        </div>
      </div>
    </div>
  );
}

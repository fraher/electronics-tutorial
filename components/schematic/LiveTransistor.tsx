'use client';

import * as React from 'react';
import { magnitudeToIntensity, magnitudeToStrokeWidth } from './utils';

export type LiveTransistorProps = {
  x: number;
  y: number;
  /** NPN (default) or PNP. */
  kind: 'npn' | 'pnp';
  /** Base current (A). */
  iB: number;
  /** Collector current (A). */
  iC: number;
  /** Collector-emitter voltage (V) — used to infer region. */
  vCE: number;
  /** Reference collector current for wire-thickness scaling. Default 0.1A. */
  iCMax?: number;
  /** Reference base current for arrow intensity. Default 0.005A. */
  iBMax?: number;
  label?: string;
  testId?: string;
};

/**
 * BJT symbol with three terminals labeled B, C, E. Collector wire thickness
 * scales with iC; base inflow arrow brightness scales with iB. Region:
 *   - cutoff   : iB ≈ 0, iC ≈ 0 → dimmed
 *   - active   : iB > 0, vCE > ~0.3V → highlighted normal
 *   - saturated: iB > 0, vCE < ~0.3V → green "closed switch" overlay
 */
export function LiveTransistor({
  x,
  y,
  kind,
  iB,
  iC,
  vCE,
  iCMax = 0.1,
  iBMax = 0.005,
  label,
  testId,
}: LiveTransistorProps) {
  const baseIntensity = magnitudeToIntensity(iB, iBMax);
  const collectorWidth = magnitudeToStrokeWidth(iC, iCMax, 1, 6);

  const cutoff = Math.abs(iB) < iBMax * 0.02 && Math.abs(iC) < iCMax * 0.02;
  const saturated = !cutoff && vCE < 0.3 && iB > 0;
  const region = cutoff ? 'cutoff' : saturated ? 'saturated' : 'active';

  // Symbol geometry — body circle radius 18; base on the left, C top-right, E bottom-right.
  const r = 18;
  const displayLabel = label ?? kind.toUpperCase();

  return (
    <g
      data-testid={testId}
      transform={`translate(${x} ${y})`}
      data-region={region}
      aria-hidden="true"
      opacity={cutoff ? 0.55 : 1}
    >
      {/* Envelope circle */}
      <circle cx={0} cy={0} r={r} fill="none" stroke="currentColor" strokeWidth={1.3} />
      {/* Base lead */}
      <line x1={-r - 14} y1={0} x2={-r + 6} y2={0} stroke="currentColor" strokeWidth={1.5} />
      {/* Internal base bar */}
      <line x1={-r + 6} y1={-10} x2={-r + 6} y2={10} stroke="currentColor" strokeWidth={2} />
      {/* Collector line (top-right, thickness scales with iC) */}
      <line
        x1={-r + 6}
        y1={-6}
        x2={r - 2}
        y2={-r + 2}
        stroke={saturated ? 'hsl(140deg 70% 45%)' : 'currentColor'}
        strokeWidth={1.5}
      />
      {/* External collector lead (thick = high iC) */}
      <line
        x1={r - 2}
        y1={-r + 2}
        x2={r + 14}
        y2={-r - 4}
        stroke={saturated ? 'hsl(140deg 70% 45%)' : 'currentColor'}
        strokeWidth={collectorWidth}
        strokeLinecap="round"
        data-collector-width={collectorWidth}
      />
      {/* Emitter line + arrow */}
      <line
        x1={-r + 6}
        y1={6}
        x2={r - 2}
        y2={r - 2}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Emitter arrowhead — NPN points away from base, PNP points toward base */}
      {kind === 'npn' ? (
        <polygon
          points={`${r - 6},${r - 6} ${r - 12},${r - 2} ${r - 2},${r - 12}`}
          fill="currentColor"
        />
      ) : (
        <polygon
          points={`${-r + 12},${0} ${-r + 4},${-4} ${-r + 4},${4}`}
          fill="currentColor"
          transform="translate(8 8)"
        />
      )}
      {/* External emitter lead */}
      <line
        x1={r - 2}
        y1={r - 2}
        x2={r + 14}
        y2={r + 4}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Base-current inflow arrow (intensity scales with iB) */}
      {baseIntensity > 0.05 && (
        <polygon
          data-testid={testId ? `${testId}-base-arrow` : 'live-transistor-base-arrow'}
          points={`${-r - 10},${-3} ${-r - 4},${0} ${-r - 10},${3}`}
          fill="hsl(40deg 90% 55%)"
          opacity={0.4 + 0.6 * baseIntensity}
        />
      )}
      {/* Terminal labels */}
      <text x={-r - 18} y={-4} fontSize={8} fontFamily="monospace" fill="currentColor">
        B
      </text>
      <text x={r + 16} y={-r - 4} fontSize={8} fontFamily="monospace" fill="currentColor">
        C
      </text>
      <text x={r + 16} y={r + 12} fontSize={8} fontFamily="monospace" fill="currentColor">
        E
      </text>
      <text x={0} y={r + 18} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="currentColor">
        {displayLabel}
      </text>
    </g>
  );
}

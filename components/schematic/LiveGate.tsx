'use client';

import * as React from 'react';

export type GateKind = 'and' | 'or' | 'not' | 'nand' | 'nor' | 'xor' | 'xnor';

export type LiveGateProps = {
  x: number;
  y: number;
  kind: GateKind;
  /** Input booleans; length must match the gate's arity (1 for NOT, else 2). */
  inputs: boolean[];
  /** Optional override; if omitted the gate computes it from kind+inputs. */
  output?: boolean;
  label?: string;
  testId?: string;
};

/**
 * Compute a digital gate's output given inputs.
 * Exposed for tests and for callers who want to drive output explicitly.
 */
export function computeGate(kind: GateKind, inputs: boolean[]): boolean {
  const a = !!inputs[0];
  const b = !!inputs[1];
  switch (kind) {
    case 'and':
      return a && b;
    case 'or':
      return a || b;
    case 'not':
      return !a;
    case 'nand':
      return !(a && b);
    case 'nor':
      return !(a || b);
    case 'xor':
      return a !== b;
    case 'xnor':
      return a === b;
  }
}

const HIGH_COLOR = 'hsl(140deg 70% 45%)';
const LOW_COLOR = 'hsl(220deg 10% 35%)';

/**
 * Standard digital logic gate symbol (US/IEEE). Inputs colored green/dark per
 * HIGH/LOW; output computed and colored similarly.
 */
export function LiveGate({ x, y, kind, inputs, output, label, testId }: LiveGateProps) {
  const isNot = kind === 'not';
  const expectedArity = isNot ? 1 : 2;
  const safeInputs = inputs.slice(0, expectedArity);
  while (safeInputs.length < expectedArity) safeInputs.push(false);
  const computed = output ?? computeGate(kind, safeInputs);

  const w = 36;
  const h = 28;
  const inverted = kind === 'nand' || kind === 'nor' || kind === 'not' || kind === 'xnor';
  const exclusive = kind === 'xor' || kind === 'xnor';

  // Build body path based on shape.
  // AND-family: D-shape. OR-family: curved back with pointed front. NOT: triangle.
  let bodyPath: string;
  if (kind === 'not') {
    bodyPath = `M ${-w / 2} ${-h / 2} L ${-w / 2} ${h / 2} L ${w / 2} 0 Z`;
  } else if (kind === 'and' || kind === 'nand') {
    // D-shape
    bodyPath = `M ${-w / 2} ${-h / 2} L 0 ${-h / 2} A ${h / 2} ${h / 2} 0 0 1 0 ${h / 2} L ${-w / 2} ${h / 2} Z`;
  } else {
    // OR-shaped (or/nor/xor/xnor): curved back, pointed front
    bodyPath =
      `M ${-w / 2} ${-h / 2}` +
      ` Q ${-w / 4} 0 ${-w / 2} ${h / 2}` +
      ` Q 0 ${h / 2} ${w / 2} 0` +
      ` Q 0 ${-h / 2} ${-w / 2} ${-h / 2} Z`;
  }

  // Input pin coordinates.
  const inputXs = isNot ? [-w / 2 - 10] : [-w / 2 - 10, -w / 2 - 10];
  const inputYs = isNot ? [0] : [-h / 4, h / 4];

  // Where input pins terminate on the body.
  const bodyInputX = isNot ? -w / 2 : -w / 2;

  // Output pin
  const outX = inverted ? w / 2 + 6 + 10 : w / 2 + 10;
  const bubble = inverted ? <circle cx={w / 2 + 3} cy={0} r={3} fill="none" stroke="currentColor" strokeWidth={1.2} /> : null;

  return (
    <g data-testid={testId} transform={`translate(${x} ${y})`} aria-hidden="true">
      {/* XOR/XNOR extra back-curve */}
      {exclusive && (
        <path
          d={`M ${-w / 2 - 6} ${-h / 2} Q ${-w / 4 - 6} 0 ${-w / 2 - 6} ${h / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
        />
      )}
      {/* Body */}
      <path d={bodyPath} fill="none" stroke="currentColor" strokeWidth={1.5} />
      {bubble}
      {/* Inputs */}
      {safeInputs.map((hi, i) => (
        <g key={`in-${i}`}>
          <line
            x1={inputXs[i]}
            y1={inputYs[i]}
            x2={bodyInputX}
            y2={inputYs[i]}
            stroke={hi ? HIGH_COLOR : LOW_COLOR}
            strokeWidth={2.2}
            data-testid={testId ? `${testId}-in${i}` : `live-gate-in${i}`}
            data-state={hi ? 'high' : 'low'}
          />
          <circle
            cx={inputXs[i]}
            cy={inputYs[i]}
            r={2.5}
            fill={hi ? HIGH_COLOR : LOW_COLOR}
          />
        </g>
      ))}
      {/* Output */}
      <line
        x1={inverted ? w / 2 + 6 : w / 2}
        y1={0}
        x2={outX}
        y2={0}
        stroke={computed ? HIGH_COLOR : LOW_COLOR}
        strokeWidth={2.2}
        data-testid={testId ? `${testId}-out` : 'live-gate-out'}
        data-state={computed ? 'high' : 'low'}
      />
      <circle cx={outX} cy={0} r={2.5} fill={computed ? HIGH_COLOR : LOW_COLOR} />
      {/* Pin labels */}
      {!isNot && (
        <>
          <text x={inputXs[0] - 6} y={inputYs[0] + 3} fontSize={8} fontFamily="monospace" fill="currentColor" textAnchor="end">
            A
          </text>
          <text x={inputXs[1] - 6} y={inputYs[1] + 3} fontSize={8} fontFamily="monospace" fill="currentColor" textAnchor="end">
            B
          </text>
        </>
      )}
      {isNot && (
        <text x={inputXs[0] - 6} y={inputYs[0] + 3} fontSize={8} fontFamily="monospace" fill="currentColor" textAnchor="end">
          A
        </text>
      )}
      <text x={outX + 6} y={3} fontSize={8} fontFamily="monospace" fill="currentColor">
        Y
      </text>
      <text x={0} y={h / 2 + 14} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="currentColor">
        {label ?? kind.toUpperCase()}
      </text>
    </g>
  );
}

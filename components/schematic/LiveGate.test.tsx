import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LiveGate, computeGate } from './LiveGate';

function wrap(child: React.ReactNode) {
  return render(<svg>{child}</svg>);
}

describe('LiveGate / computeGate', () => {
  it('AND: [true,true] → true; [true,false] → false', () => {
    expect(computeGate('and', [true, true])).toBe(true);
    expect(computeGate('and', [true, false])).toBe(false);
    expect(computeGate('and', [false, false])).toBe(false);
  });

  it('OR: [false,false] → false; any true → true', () => {
    expect(computeGate('or', [false, false])).toBe(false);
    expect(computeGate('or', [true, false])).toBe(true);
    expect(computeGate('or', [true, true])).toBe(true);
  });

  it('NOT: inverts its single input', () => {
    expect(computeGate('not', [true])).toBe(false);
    expect(computeGate('not', [false])).toBe(true);
  });

  it('XOR: true only when inputs differ', () => {
    expect(computeGate('xor', [true, false])).toBe(true);
    expect(computeGate('xor', [true, true])).toBe(false);
    expect(computeGate('xor', [false, false])).toBe(false);
  });

  it('NAND / NOR / XNOR invert their counterparts', () => {
    expect(computeGate('nand', [true, true])).toBe(false);
    expect(computeGate('nor', [false, false])).toBe(true);
    expect(computeGate('xnor', [true, true])).toBe(true);
  });

  it('renders output pin with data-state="high" when output is HIGH', () => {
    const { container } = wrap(
      <LiveGate x={50} y={50} kind="and" inputs={[true, true]} testId="g" />,
    );
    const out = container.querySelector('[data-testid="g-out"]') as SVGElement;
    expect(out.getAttribute('data-state')).toBe('high');
  });

  it('renders output pin with data-state="low" when output is LOW', () => {
    const { container } = wrap(
      <LiveGate x={50} y={50} kind="and" inputs={[true, false]} testId="g" />,
    );
    const out = container.querySelector('[data-testid="g-out"]') as SVGElement;
    expect(out.getAttribute('data-state')).toBe('low');
  });

  it('allows the operator to override output explicitly', () => {
    const { container } = wrap(
      <LiveGate x={50} y={50} kind="and" inputs={[true, true]} output={false} testId="g" />,
    );
    const out = container.querySelector('[data-testid="g-out"]') as SVGElement;
    expect(out.getAttribute('data-state')).toBe('low');
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LiveCapacitor } from './LiveCapacitor';

function wrap(child: React.ReactNode) {
  return render(<svg>{child}</svg>);
}

describe('LiveCapacitor', () => {
  it('renders no fill when charge (and voltage) are 0', () => {
    const { container } = wrap(
      <LiveCapacitor x={50} y={50} capacitance={1e-6} voltage={0} testId="c" />,
    );
    expect(container.querySelector('[data-testid="c-fill"]')).toBeNull();
  });

  it('renders a full fill when Q reaches chargeMax', () => {
    const { container } = wrap(
      <LiveCapacitor
        x={50}
        y={50}
        capacitance={1e-6}
        voltage={12}
        chargeMax={12 * 1e-6}
        testId="c"
      />,
    );
    const fill = container.querySelector('[data-testid="c-fill"]') as SVGElement;
    expect(fill).toBeInTheDocument();
    expect(Number(fill.getAttribute('data-fill-fraction'))).toBeCloseTo(1, 3);
  });

  it('caps fill fraction at 1 even when Q exceeds chargeMax', () => {
    const { container } = wrap(
      <LiveCapacitor
        x={50}
        y={50}
        capacitance={1e-6}
        voltage={50}
        chargeMax={12 * 1e-6}
        testId="c"
      />,
    );
    const fill = container.querySelector('[data-testid="c-fill"]') as SVGElement;
    expect(Number(fill.getAttribute('data-fill-fraction'))).toBeLessThanOrEqual(1);
  });

  it('renders an SI-formatted label by default (1e-6 F → "1 µF")', () => {
    const { container } = wrap(
      <LiveCapacitor x={0} y={0} capacitance={1e-6} voltage={0} testId="c" />,
    );
    expect(container.textContent).toContain('1 µF');
  });
});

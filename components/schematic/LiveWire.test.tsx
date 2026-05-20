import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LiveWire } from './LiveWire';

function wrap(child: React.ReactNode) {
  return render(<svg>{child}</svg>);
}

describe('LiveWire', () => {
  it('renders at minimum stroke-width when current is 0', () => {
    const { container } = wrap(
      <LiveWire from={[0, 0]} to={[100, 0]} current={0} currentMax={1} testId="w" />,
    );
    const line = container.querySelector('[data-testid="w"] line') as SVGLineElement;
    expect(line).toBeInTheDocument();
    const sw = Number(line.getAttribute('stroke-width'));
    expect(sw).toBeGreaterThanOrEqual(0.9);
    expect(sw).toBeLessThanOrEqual(1.1);
  });

  it('renders at >= 6px stroke-width when current is at max', () => {
    const { container } = wrap(
      <LiveWire from={[0, 0]} to={[100, 0]} current={1} currentMax={1} testId="w" />,
    );
    const line = container.querySelector('[data-testid="w"] line') as SVGLineElement;
    const sw = Number(line.getAttribute('stroke-width'));
    expect(sw).toBeGreaterThanOrEqual(6);
  });

  it('accepts negative current (reverse direction) without error and uses |I| for thickness', () => {
    const { container } = wrap(
      <LiveWire from={[0, 0]} to={[100, 0]} current={-1} currentMax={1} testId="w" />,
    );
    const line = container.querySelector('[data-testid="w"] line') as SVGLineElement;
    const sw = Number(line.getAttribute('stroke-width'));
    expect(sw).toBeGreaterThanOrEqual(6);
    // The dot-flow line should still render and be reversed.
    const dots = container.querySelector('[data-testid="w-dots"]') as SVGLineElement;
    expect(dots).toBeInTheDocument();
    // Inline style includes the reverse direction CSS variable.
    expect(dots.getAttribute('style') || '').toMatch(/reverse/);
  });

  it('omits the dot-flow line when current is exactly 0', () => {
    const { container } = wrap(
      <LiveWire from={[0, 0]} to={[100, 0]} current={0} currentMax={1} testId="w" />,
    );
    expect(container.querySelector('[data-testid="w-dots"]')).toBeNull();
  });

  it('can disable animated dots via animateDots={false}', () => {
    const { container } = wrap(
      <LiveWire
        from={[0, 0]}
        to={[100, 0]}
        current={1}
        currentMax={1}
        animateDots={false}
        testId="w"
      />,
    );
    expect(container.querySelector('[data-testid="w-dots"]')).toBeNull();
  });
});

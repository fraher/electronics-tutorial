import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LiveResistor } from './LiveResistor';

function wrap(child: React.ReactNode) {
  return render(<svg>{child}</svg>);
}

describe('LiveResistor', () => {
  it('does not render a glow when power is 0 (no current)', () => {
    const { container } = wrap(
      <LiveResistor x={50} y={50} value={1000} current={0} testId="r" />,
    );
    expect(container.querySelector('[data-testid="r-glow"]')).toBeNull();
  });

  it('renders a glow ellipse with a drop-shadow filter when power is high', () => {
    const { container } = wrap(
      <LiveResistor x={50} y={50} value={1000} current={0.1} powerMax={10} testId="r" />,
    );
    const glow = container.querySelector('[data-testid="r-glow"]') as SVGElement;
    expect(glow).toBeInTheDocument();
    const style = glow.getAttribute('style') || '';
    expect(style).toMatch(/drop-shadow/);
  });

  it('shows the value label with SI formatting (1000 → "1 kΩ")', () => {
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} testId="r" />,
    );
    expect(container.textContent).toContain('1 kΩ');
  });

  it('accepts a custom label override', () => {
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} label="R₁" testId="r" />,
    );
    expect(container.textContent).toContain('R₁');
  });
});

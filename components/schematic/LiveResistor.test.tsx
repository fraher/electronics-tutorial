import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
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

  it('is non-interactive when onChange omitted', () => {
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} testId="r" />,
    );
    const g = container.querySelector('[data-testid="r"]') as SVGElement;
    expect(g.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('[data-testid="r-hitbox"]')).toBeNull();
  });

  it('exposes role=slider and hit-box when onChange present', () => {
    const onChange = vi.fn();
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} onChange={onChange} min={1} max={1_000_000} testId="r" />,
    );
    const g = container.querySelector('[data-testid="r"]') as SVGElement;
    expect(g.getAttribute('role')).toBe('slider');
    expect(g.getAttribute('aria-valuenow')).toBe('1000');
    expect(container.querySelector('[data-testid="r-hitbox"]')).not.toBeNull();
  });

  it('ArrowUp dispatches onChange via keyboard', () => {
    const onChange = vi.fn();
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} onChange={onChange} min={1} max={1_000_000} step={10} testId="r" />,
    );
    const g = container.querySelector('[data-testid="r"]') as Element;
    fireEvent.keyDown(g, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalled();
    const newVal = onChange.mock.calls[0][0];
    expect(newVal).toBeGreaterThan(1000);
  });

  it('pointer drag invokes onChange', () => {
    const onChange = vi.fn();
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={100} current={0} onChange={onChange} min={1} max={10000} testId="r" />,
    );
    const g = container.querySelector('[data-testid="r"]') as Element;
    fireEvent.pointerDown(g, { clientX: 0, clientY: 200 });
    fireEvent.pointerMove(document, { clientX: 0, clientY: 100 });
    fireEvent.pointerUp(document);
    expect(onChange).toHaveBeenCalled();
  });

  it('accepts a custom label override', () => {
    const { container } = wrap(
      <LiveResistor x={0} y={0} value={1000} current={0} label="R₁" testId="r" />,
    );
    expect(container.textContent).toContain('R₁');
  });
});

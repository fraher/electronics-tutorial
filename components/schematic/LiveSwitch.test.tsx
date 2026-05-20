import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { LiveSwitch } from './LiveSwitch';

function wrap(child: React.ReactNode) {
  return render(<svg>{child}</svg>);
}

describe('LiveSwitch interactivity', () => {
  it('omits interactive hit-box when no onChange (read-only)', () => {
    const { container } = wrap(<LiveSwitch x={0} y={0} closed={true} testId="sw" />);
    expect(container.querySelector('[data-testid="sw-hitbox"]')).toBeNull();
    const g = container.querySelector('[data-testid="sw"]');
    expect(g?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders hit-box and role=switch when onChange present', () => {
    const onChange = vi.fn();
    const { container } = wrap(
      <LiveSwitch x={0} y={0} closed={true} onChange={onChange} testId="sw" />,
    );
    expect(container.querySelector('[data-testid="sw-hitbox"]')).not.toBeNull();
    const g = container.querySelector('[data-testid="sw"]') as SVGElement;
    expect(g.getAttribute('role')).toBe('switch');
    expect(g.getAttribute('aria-checked')).toBe('true');
    expect(g.getAttribute('tabindex')).toBe('0');
  });

  it('click invokes onChange with negated value', () => {
    const onChange = vi.fn();
    const { container } = wrap(
      <LiveSwitch x={0} y={0} closed={false} onChange={onChange} testId="sw" />,
    );
    const g = container.querySelector('[data-testid="sw"]') as Element;
    fireEvent.click(g);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle without onChange', () => {
    const { container } = wrap(<LiveSwitch x={0} y={0} closed={true} testId="sw" />);
    const g = container.querySelector('[data-testid="sw"]') as Element;
    // no handler attached; fireEvent.click should not throw, and there's nothing to assert
    expect(() => fireEvent.click(g)).not.toThrow();
  });

  it('reflects data-state on the root g', () => {
    const { container } = wrap(<LiveSwitch x={0} y={0} closed={false} testId="sw" />);
    expect(container.querySelector('[data-testid="sw"]')?.getAttribute('data-state')).toBe('open');
  });
});

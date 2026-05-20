import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CircuitEmbed } from './CircuitEmbed';

describe('CircuitEmbed', () => {
  it('renders an iframe pointing at the vendored CircuitJS', () => {
    const { container } = render(<CircuitEmbed title="Simple resistor" />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute('src')!).toMatch(/^\/circuitjs\/circuitjs\.html/);
  });

  it('includes ?cct= when a circuit prop is provided', () => {
    const cir = '$ 1 0.00001 10 50 5 50\nr 100 100 200 100 0 1000\n';
    const { container } = render(<CircuitEmbed circuit={cir} title="With circuit" />);
    const iframe = container.querySelector('iframe')!;
    expect(iframe.getAttribute('src')).toContain('cct=');
  });

  it('omits cct= when the circuit prop is absent', () => {
    const { container } = render(<CircuitEmbed title="Empty" />);
    const iframe = container.querySelector('iframe')!;
    expect(iframe.getAttribute('src')).not.toContain('cct=');
  });

  it('renders caption text below the iframe', () => {
    const { getByText } = render(<CircuitEmbed title="x" caption="Click + drag values." />);
    expect(getByText('Click + drag values.')).toBeInTheDocument();
  });

  it('uses sandbox with allow-scripts and allow-same-origin', () => {
    const { container } = render(<CircuitEmbed title="x" />);
    const iframe = container.querySelector('iframe')!;
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).toContain('allow-same-origin');
  });
});

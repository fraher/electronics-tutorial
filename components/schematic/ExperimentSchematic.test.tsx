import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ExperimentSchematic } from './ExperimentSchematic';
import { LiveResistor } from './LiveResistor';

describe('ExperimentSchematic', () => {
  it('renders an <svg> with role="img" and the provided aria-label', () => {
    const { container } = render(
      <ExperimentSchematic
        vars={{ I: 0.1, R: 100 }}
        ariaLabel="Ohm's law schematic"
        render={() => <LiveResistor x={200} y={120} value={100} current={0.1} />}
      />,
    );
    const svg = container.querySelector('svg') as SVGSVGElement;
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe("Ohm's law schematic");
  });

  it('passes the vars dict to the render-prop', () => {
    const renderFn = vi.fn(() => <g />);
    render(
      <ExperimentSchematic
        vars={{ I: 0.25, R: 200 }}
        ariaLabel="x"
        render={renderFn}
      />,
    );
    expect(renderFn).toHaveBeenCalledWith({ I: 0.25, R: 200 }, undefined);
  });

  it('re-renders when vars change', () => {
    const renderFn = vi.fn(() => <g />);
    const { rerender } = render(
      <ExperimentSchematic vars={{ I: 0.1 }} ariaLabel="x" render={renderFn} />,
    );
    expect(renderFn).toHaveBeenLastCalledWith({ I: 0.1 }, undefined);
    rerender(
      <ExperimentSchematic vars={{ I: 0.5 }} ariaLabel="x" render={renderFn} />,
    );
    expect(renderFn).toHaveBeenLastCalledWith({ I: 0.5 }, undefined);
  });

  it('renders a legend list when legend is provided', () => {
    const { container, getByText } = render(
      <ExperimentSchematic
        vars={{}}
        ariaLabel="x"
        render={() => <g />}
        legend={[
          { glyph: <span />, text: 'thicker wire = more current' },
          { glyph: <span />, text: 'orange glow = high power' },
        ]}
        testId="es"
      />,
    );
    expect(getByText(/thicker wire/)).toBeInTheDocument();
    expect(container.querySelector('[data-testid="es-legend"]')).toBeInTheDocument();
  });

  it('omits the legend when none provided', () => {
    const { container } = render(
      <ExperimentSchematic
        vars={{}}
        ariaLabel="x"
        render={() => <g />}
        testId="es"
      />,
    );
    expect(container.querySelector('[data-testid="es-legend"]')).toBeNull();
  });
});

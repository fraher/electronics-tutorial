import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { FormulaSlider } from './FormulaSlider';

describe('FormulaSlider', () => {
  it('renders the formula via KaTeX', () => {
    const { container } = render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    // KaTeX renders elements with the .katex class
    const katex = container.querySelector('.katex');
    expect(katex).toBeInTheDocument();
  });

  it('renders one slider per var with correct attributes', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute('aria-valuemin', '0');
    expect(sliders[0]).toHaveAttribute('aria-valuemax', '1');
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '0.1');
    expect(sliders[1]).toHaveAttribute('aria-valuemin', '1');
    expect(sliders[1]).toHaveAttribute('aria-valuemax', '100');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '10');
  });

  it('shows initial computed value matching evaluate(defaults)', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V', precision: 3 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    expect(out).toHaveTextContent(/1(?:\.0{1,2})?\s*V/);
  });

  it('updates computed display when slider value changes (keyboard)', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.1, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V', precision: 3 }}
      />,
    );
    const sliders = screen.getAllByRole('slider');
    sliders[0].focus();
    fireEvent.keyDown(sliders[0], { key: 'ArrowRight' });
    const out = screen.getByTestId('formula-slider-result');
    // 0.2 * 10 = 2
    expect(out).toHaveTextContent(/2(?:\.0{1,2})?\s*V/);
  });

  it('handles RC time constant (τ = R · C)', () => {
    render(
      <FormulaSlider
        formula="\tau = R \cdot C"
        evaluate={({ R, C }) => R * C}
        vars={[
          { name: 'R', min: 1000, max: 10000, step: 100, default: 1000, unit: 'Ω' },
          { name: 'C', min: 0.000001, max: 0.001, step: 0.000001, default: 0.000001, unit: 'F' },
        ]}
        solveFor={{ name: 'τ', unit: 's', precision: 3 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    // 1000 * 1e-6 = 1e-3
    expect(out).toHaveTextContent(/s/);
  });

  it('handles voltage divider (Vout = Vin·R2/(R1+R2))', () => {
    render(
      <FormulaSlider
        formula="V_{out} = V_{in} \cdot \frac{R_2}{R_1 + R_2}"
        evaluate={({ Vin, R1, R2 }) => (Vin * R2) / (R1 + R2)}
        vars={[
          { name: 'Vin', min: 1, max: 12, step: 0.5, default: 9, unit: 'V' },
          { name: 'R1', min: 100, max: 10000, step: 100, default: 1000, unit: 'Ω' },
          { name: 'R2', min: 100, max: 10000, step: 100, default: 1000, unit: 'Ω' },
        ]}
        solveFor={{ name: 'Vout', unit: 'V', precision: 3 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    // 9 * 1000/(1000+1000) = 4.5
    expect(out).toHaveTextContent(/4\.5/);
  });

  it('handles parallel resistance (1/Rt = 1/R1 + 1/R2)', () => {
    render(
      <FormulaSlider
        formula="\frac{1}{R_t} = \frac{1}{R_1} + \frac{1}{R_2}"
        evaluate={({ R1, R2 }) => 1 / (1 / R1 + 1 / R2)}
        vars={[
          { name: 'R1', min: 1, max: 1000, step: 1, default: 100, unit: 'Ω' },
          { name: 'R2', min: 1, max: 1000, step: 1, default: 100, unit: 'Ω' },
        ]}
        solveFor={{ name: 'Rt', unit: 'Ω', precision: 3 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    // 100 || 100 = 50
    expect(out).toHaveTextContent(/50/);
  });

  it('handles power (P = V · I)', () => {
    render(
      <FormulaSlider
        formula="P = V \cdot I"
        evaluate={({ V, I }) => V * I}
        vars={[
          { name: 'V', min: 0, max: 12, step: 0.1, default: 5, unit: 'V' },
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.2, unit: 'A' },
        ]}
        solveFor={{ name: 'P', unit: 'W', precision: 3 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    // 5 * 0.2 = 1
    expect(out).toHaveTextContent(/1(?:\.0{1,2})?\s*W/);
  });

  it('formats result to precision significant digits with unit suffix', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={() => 1.23456789}
        vars={[{ name: 'I', min: 0, max: 1, default: 0.1, unit: 'A' }]}
        solveFor={{ name: 'V', unit: 'V', precision: 4 }}
      />,
    );
    const out = screen.getByTestId('formula-slider-result');
    expect(out).toHaveTextContent(/1\.235\s*V/);
  });

  it('each slider has accessible label referencing variable name and unit', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    const i = screen.getByRole('slider', { name: /I.*A/ });
    const r = screen.getByRole('slider', { name: /R.*Ω/ });
    expect(i).toBeInTheDocument();
    expect(r).toBeInTheDocument();
  });

  it('renders an optional title', () => {
    render(
      <FormulaSlider
        title="Ohm's Law"
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[{ name: 'I', min: 0, max: 1, default: 0.1, unit: 'A' }]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    expect(screen.getByText(/Ohm's Law/)).toBeInTheDocument();
  });

  it('renders the optional schematic above the formula when provided', () => {
    const { container } = render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V' }}
        schematic={(vars) => (
          <svg viewBox="0 0 100 40" data-current={vars.I} data-testid="inner-schem" />
        )}
      />,
    );
    expect(
      container.querySelector('[data-testid="formula-slider-schematic"]'),
    ).toBeInTheDocument();
    const inner = container.querySelector('[data-testid="inner-schem"]') as SVGElement;
    expect(inner).toBeInTheDocument();
    expect(inner.getAttribute('data-current')).toBe('0.1');
  });

  it('omits the schematic container when no schematic prop is provided', () => {
    const { container } = render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[{ name: 'I', min: 0, max: 1, default: 0.1, unit: 'A' }]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    expect(
      container.querySelector('[data-testid="formula-slider-schematic"]'),
    ).toBeNull();
  });

  it('bidirectional: schematic onVarChange updates slider state', () => {
    let capturedOnVarChange:
      | ((name: string, value: number | boolean) => void)
      | undefined;
    const { container } = render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I, R }) => I * R}
        vars={[
          { name: 'I', min: 0, max: 1, step: 0.01, default: 0.1, unit: 'A' },
          { name: 'R', min: 1, max: 100, step: 1, default: 10, unit: 'Ω' },
        ]}
        solveFor={{ name: 'V', unit: 'V' }}
        schematic={(vars, onVarChange) => {
          capturedOnVarChange = onVarChange;
          return <svg data-r={vars.R} data-testid="schem-inner" />;
        }}
      />,
    );
    expect(capturedOnVarChange).toBeTypeOf('function');
    // Simulate an interactive primitive calling back.
    act(() => {
      capturedOnVarChange!('R', 42);
    });
    const sliders = screen.getAllByRole('slider');
    const rSlider = sliders.find((s) => s.getAttribute('aria-label')?.startsWith('R'));
    expect(rSlider?.getAttribute('aria-valuenow')).toBe('42');
    const inner = container.querySelector('[data-testid="schem-inner"]') as SVGElement;
    expect(inner.getAttribute('data-r')).toBe('42');
  });

  it('bidirectional: boolean values coerce to 0/1', () => {
    let capturedOnVarChange:
      | ((name: string, value: number | boolean) => void)
      | undefined;
    render(
      <FormulaSlider
        formula="x"
        evaluate={({ X }) => X}
        vars={[{ name: 'X', min: 0, max: 1, step: 1, default: 0 }]}
        solveFor={{ name: 'V' }}
        schematic={(_, onVarChange) => {
          capturedOnVarChange = onVarChange;
          return <svg />;
        }}
      />,
    );
    act(() => {
      capturedOnVarChange!('X', true);
    });
    const slider = screen.getByRole('slider');
    expect(slider.getAttribute('aria-valuenow')).toBe('1');
    act(() => {
      capturedOnVarChange!('X', false);
    });
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('slider is focusable via Tab order (tabindex >= 0)', () => {
    render(
      <FormulaSlider
        formula="V = I \cdot R"
        evaluate={({ I }) => I}
        vars={[{ name: 'I', min: 0, max: 1, step: 0.1, default: 0.5, unit: 'A' }]}
        solveFor={{ name: 'V', unit: 'V' }}
      />,
    );
    const slider = screen.getByRole('slider');
    expect(Number(slider.getAttribute('tabindex'))).toBeGreaterThanOrEqual(0);
  });
});

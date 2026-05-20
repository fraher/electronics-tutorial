import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDraggableValue, useToggle } from './interaction';

describe('useDraggableValue', () => {
  it('exposes ARIA slider props matching value/min/max', () => {
    const { result } = renderHook(() =>
      useDraggableValue({ value: 50, min: 0, max: 100, ariaLabel: 'foo' }),
    );
    expect(result.current.ariaProps.role).toBe('slider');
    expect(result.current.ariaProps['aria-valuenow']).toBe(50);
    expect(result.current.ariaProps['aria-valuemin']).toBe(0);
    expect(result.current.ariaProps['aria-valuemax']).toBe(100);
    expect(result.current.ariaProps['aria-label']).toBe('foo');
    expect(result.current.ariaProps.tabIndex).toBe(0);
  });

  it('ArrowUp increments by step, clamped to max', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 99, min: 0, max: 100, step: 5, onChange }),
    );
    const e = makeKeyEvent('ArrowUp');
    act(() => {
      result.current.keyboardHandlers.onKeyDown(e as any);
    });
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('ArrowDown decrements by step, clamped to min', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 2, min: 0, max: 100, step: 5, onChange }),
    );
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('ArrowDown') as any);
    });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('ArrowRight uses 10× step', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 0, min: 0, max: 100, step: 1, onChange }),
    );
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('ArrowRight') as any);
    });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('Home jumps to min, End to max', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 50, min: 0, max: 100, step: 1, onChange }),
    );
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('Home') as any);
    });
    expect(onChange).toHaveBeenLastCalledWith(0);
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('End') as any);
    });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('PageUp / PageDown shift by 10× step', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 50, min: 0, max: 100, step: 1, onChange }),
    );
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('PageUp') as any);
    });
    expect(onChange).toHaveBeenLastCalledWith(60);
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('PageDown') as any);
    });
    // value is still 50 (controlled), so PageDown → 40
    expect(onChange).toHaveBeenLastCalledWith(40);
  });

  it('non-handled keys do not invoke onChange', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({ value: 50, min: 0, max: 100, step: 1, onChange }),
    );
    act(() => {
      result.current.keyboardHandlers.onKeyDown(makeKeyEvent('Tab') as any);
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pointer drag computes value delta from pixel delta (linear)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({
        value: 50,
        min: 0,
        max: 100,
        pixelsPerRange: 100,
        axis: 'y',
        onChange,
      }),
    );
    // simulate pointerdown at clientY=200
    const downEvt = {
      clientX: 0,
      clientY: 200,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as any;
    act(() => result.current.pointerHandlers.onPointerDown(downEvt));
    // drag up by 20px → +20% of range → 70
    act(() => {
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: 180 } as any));
    });
    expect(onChange).toHaveBeenLastCalledWith(70);
    // release
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('log scale maps drag pixels logarithmically', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({
        value: 100,
        min: 1,
        max: 10000,
        logScale: true,
        pixelsPerRange: 100,
        axis: 'y',
        onChange,
      }),
    );
    const downEvt = {
      clientX: 0,
      clientY: 200,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as any;
    act(() => result.current.pointerHandlers.onPointerDown(downEvt));
    // drag up 25px → +25% of log range (which is ln(10000) - ln(1) ≈ 9.21).
    // start log = ln(100) ≈ 4.605; next = 4.605 + 0.25 * 9.21 ≈ 6.908; exp ≈ 1000.
    act(() => {
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: 175 } as any));
    });
    const call = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(call).toBeGreaterThan(900);
    expect(call).toBeLessThan(1100);
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup'));
    });
  });

  it('clamps drag results to min/max bounds', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useDraggableValue({
        value: 50,
        min: 0,
        max: 100,
        pixelsPerRange: 100,
        axis: 'y',
        onChange,
      }),
    );
    const downEvt = {
      clientX: 0,
      clientY: 0,
      preventDefault: () => {},
      stopPropagation: () => {},
    } as any;
    act(() => result.current.pointerHandlers.onPointerDown(downEvt));
    // huge upward drag
    act(() => {
      document.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: -1000 } as any));
    });
    expect(onChange).toHaveBeenLastCalledWith(100);
    act(() => {
      document.dispatchEvent(new PointerEvent('pointerup'));
    });
  });
});

describe('useToggle', () => {
  it('exposes ARIA switch role with checked state', () => {
    const { result } = renderHook(() => useToggle({ value: true, ariaLabel: 'sw' }));
    expect(result.current.ariaProps.role).toBe('switch');
    expect(result.current.ariaProps['aria-checked']).toBe(true);
    expect(result.current.ariaProps.tabIndex).toBe(0);
  });

  it('click handler flips the value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useToggle({ value: false, onChange }));
    act(() => {
      result.current.buttonHandlers.onClick({
        preventDefault: () => {},
        stopPropagation: () => {},
      } as any);
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Space / Enter trigger toggle; other keys do not', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useToggle({ value: true, onChange }));
    act(() => {
      result.current.buttonHandlers.onKeyDown(makeKeyEvent(' ') as any);
    });
    expect(onChange).toHaveBeenLastCalledWith(false);
    act(() => {
      result.current.buttonHandlers.onKeyDown(makeKeyEvent('Enter') as any);
    });
    expect(onChange).toHaveBeenLastCalledWith(false);
    onChange.mockClear();
    act(() => {
      result.current.buttonHandlers.onKeyDown(makeKeyEvent('Tab') as any);
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});

function makeKeyEvent(key: string) {
  return {
    key,
    preventDefault: () => {},
    stopPropagation: () => {},
  };
}

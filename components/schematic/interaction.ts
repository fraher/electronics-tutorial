'use client';

import * as React from 'react';

/**
 * Interaction helpers for LiveSchematic primitives.
 *
 * These hooks make SVG primitives bidirectionally interactive while keeping the
 * per-primitive code minimal. Drag pixels translate to value deltas; keyboard
 * support and ARIA wiring are baked in for accessibility parity with the
 * companion slider.
 *
 * Pointer model: a `pointerdown` on the SVG element captures the start value
 * and pointer position, then tracks `pointermove`/`pointerup` on the *document*
 * (not the element) so the drag continues past the element's bounding box.
 *
 * See `.project-memory/entities/LiveSchematic.md` for the design intent.
 */

const DRAG_PIXELS_FULL_RANGE = 120;

export type DraggableValueOpts = {
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Map drag pixels to value on a log scale (good for resistance, capacitance, inductance). */
  logScale?: boolean;
  /** Which axis is the drag axis? Default 'y' (vertical) — feels natural for ns-resize. */
  axis?: 'x' | 'y';
  /** Pixels of drag distance corresponding to the full min↔max range. */
  pixelsPerRange?: number;
  /** A11y label. */
  ariaLabel?: string;
  onChange?: (next: number) => void;
};

export type DraggableValueResult = {
  pointerHandlers: {
    onPointerDown: (e: React.PointerEvent<SVGElement>) => void;
  };
  keyboardHandlers: {
    onKeyDown: (e: React.KeyboardEvent<SVGElement>) => void;
  };
  ariaProps: {
    role: 'slider';
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    'aria-label'?: string;
    tabIndex: 0;
  };
  isDragging: boolean;
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function snap(v: number, step: number | undefined, min: number): number {
  if (!step || step <= 0) return v;
  const n = Math.round((v - min) / step);
  return min + n * step;
}

/**
 * Drag-to-change-value hook. Hand it the current value (controlled-input
 * style) and an `onChange`; it returns SVG handlers + ARIA props for the
 * element you want users to grab.
 */
export function useDraggableValue(opts: DraggableValueOpts): DraggableValueResult {
  const {
    value,
    min,
    max,
    step,
    logScale = false,
    axis = 'y',
    pixelsPerRange = DRAG_PIXELS_FULL_RANGE,
    ariaLabel,
    onChange,
  } = opts;

  const [isDragging, setIsDragging] = React.useState(false);

  // Snapshot of value at pointerdown — we update RELATIVE to this so the value
  // doesn't oscillate as React re-renders mid-drag.
  const startRef = React.useRef<{ x: number; y: number; startValue: number } | null>(null);

  const mapPixelsToValue = React.useCallback(
    (pixelDelta: number, startValue: number) => {
      if (logScale && min > 0 && max > 0) {
        const logMin = Math.log(min);
        const logMax = Math.log(max);
        const range = logMax - logMin;
        const startLog = Math.log(Math.max(startValue, min));
        const fraction = pixelDelta / pixelsPerRange;
        const nextLog = startLog + fraction * range;
        return clamp(Math.exp(nextLog), min, max);
      }
      const range = max - min;
      const fraction = pixelDelta / pixelsPerRange;
      return clamp(startValue + fraction * range, min, max);
    },
    [logScale, min, max, pixelsPerRange],
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      startRef.current = { x: e.clientX, y: e.clientY, startValue: value };
      setIsDragging(true);

      const move = (ev: PointerEvent) => {
        const s = startRef.current;
        if (!s) return;
        // Convention: dragging UP (negative dy) or RIGHT (positive dx) raises value.
        const pixelDelta = axis === 'y' ? -(ev.clientY - s.y) : ev.clientX - s.x;
        const next = snap(mapPixelsToValue(pixelDelta, s.startValue), step, min);
        if (next !== value) onChange?.(next);
      };
      const up = () => {
        setIsDragging(false);
        startRef.current = null;
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    },
    [axis, mapPixelsToValue, min, onChange, step, value],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<SVGElement>) => {
      const stepSize = step ?? (max - min) / 100;
      let next: number | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          next = clamp(value + (e.key === 'ArrowRight' ? stepSize * 10 : stepSize), min, max);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          next = clamp(value - (e.key === 'ArrowLeft' ? stepSize * 10 : stepSize), min, max);
          break;
        case 'PageUp':
          next = clamp(value + stepSize * 10, min, max);
          break;
        case 'PageDown':
          next = clamp(value - stepSize * 10, min, max);
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        default:
          return;
      }
      if (next !== null && next !== value) {
        e.preventDefault();
        onChange?.(snap(next, step, min));
      }
    },
    [max, min, onChange, step, value],
  );

  return {
    pointerHandlers: { onPointerDown },
    keyboardHandlers: { onKeyDown },
    ariaProps: {
      role: 'slider',
      'aria-valuenow': value,
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-label': ariaLabel,
      tabIndex: 0,
    },
    isDragging,
  };
}

export type ToggleOpts = {
  value: boolean;
  ariaLabel?: string;
  onChange?: (next: boolean) => void;
};

export type ToggleResult = {
  buttonHandlers: {
    onClick: (e: React.MouseEvent<SVGElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<SVGElement>) => void;
  };
  ariaProps: {
    role: 'switch';
    'aria-checked': boolean;
    'aria-label'?: string;
    tabIndex: 0;
  };
};

/** Click / Space / Enter toggles a boolean. */
export function useToggle(opts: ToggleOpts): ToggleResult {
  const { value, ariaLabel, onChange } = opts;
  const onClick = React.useCallback(
    (e: React.MouseEvent<SVGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onChange?.(!value);
    },
    [value, onChange],
  );
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<SVGElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange?.(!value);
      }
    },
    [value, onChange],
  );
  return {
    buttonHandlers: { onClick, onKeyDown },
    ariaProps: {
      role: 'switch',
      'aria-checked': value,
      'aria-label': ariaLabel,
      tabIndex: 0,
    },
  };
}

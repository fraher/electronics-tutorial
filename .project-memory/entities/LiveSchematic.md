# LiveSchematic

Family of inline-SVG primitives that **visualize** the variable state of a
[[FormulaSlider]]. They are not simulators — [[CircuitEmbed]] (CircuitJS) still
owns simulation. The split:

- **FormulaSlider** owns slider state + the algebraic answer.
- **LiveSchematic** primitives mirror that state as a moving picture so the
  learner sees what the formula is doing *physically* as they drag.
- **CircuitEmbed** owns true simulation (analog wave traces, transient
  behaviour, oscilloscopes).

## Primitives

`components/schematic/` ships ten primitives plus a composer. Each primitive
returns an SVG `<g>` so callers compose them in a shared coordinate system.

| Primitive | What it visualizes |
|---|---|
| `LiveWire` | Stroke-width scales with `|I|` (log curve, 1px → 8px); hue shifts blue → red; dashed dots animate along the path at speed ∝ `|I|`, direction = sign(I). |
| `LiveResistor` | IEEE zig-zag body; orange halo + drop-shadow scale with `P = I²R`. |
| `LiveCapacitor` | Two-plate symbol; "charge fill" rectangle between plates with height ∝ `Q/Qmax = CV/Qmax`, capped at 1. |
| `LiveInductor` | Coil of 4 humps; dashed ellipse field-lines around it, density ∝ `|I|`. |
| `LiveDiode` | Triangle + cathode bar; forward-biased → green glow; reverse-biased → dimmed. |
| `LiveTransistor` | BJT (NPN/PNP) with B/C/E labels; collector lead width ∝ `iC`; base-inflow arrow brightness ∝ `iB`; region = `cutoff` / `active` / `saturated` from `vCE` + `iB`. |
| `LiveGate` | US/IEEE digital gate (AND/OR/NOT/NAND/NOR/XOR/XNOR); inputs green=HIGH / dark=LOW; output computed via `computeGate`. |
| `LiveBattery` | Long-plate (+) / short-plate (−) cell; polarity flips with `sign(voltage)`. |
| `LiveLamp` | Filament-X bulb; filament + halo glow scale with `P = I²R`. |
| `LiveSwitch` | SPST lever flat (closed, green) or angled-up (open). |

## Composer: `ExperimentSchematic`

A memoized wrapper that:

- Provides the `<svg viewBox="0 0 400 240" role="img" aria-label="...">` root
  with a subtle dotted-grid backdrop.
- Accepts a `render: (vars) => ReactNode` closure so callers compose primitives
  positionally with the current variable state.
- Optionally renders a small legend below the svg.
- Re-renders only when `vars` or `render` change (React.memo + useMemo).

## Integration with FormulaSlider

`FormulaSlider` accepts an optional `schematic?: (vars) => ReactNode` prop.
When provided, it renders the closure inside a bordered card *above* the
formula, passing it the slider's current values. When omitted, FormulaSlider
behaves exactly as before — strictly additive, no breaking changes.

This composition lets per-experiment pages drop a tailored visualization in
without touching the slider/formula plumbing.

## Visual rules worth recording

- **Log curve, not linear.** `magnitudeToStrokeWidth` uses `log1p` so tiny
  signals are still visible but big ones don't blow out. Same curve drives
  glow intensity → stroke and glow track each other.
- **Color encoding.** Wire current: blue (calm, 0A) → red (hot, max). Resistor
  glow: orange/red. Lamp filament: warm yellow. Diode forward: green. Logic
  HIGH: green-500. LOW: neutral-700. These choices stay close to physical
  intuition (red = hot, green = on).
- **Direction is shown via animated dots**, not by changing wire endpoints —
  this keeps the schematic geometry stable while still conveying flow.
- **Reduced motion.** Wire-flow dots stop animating under
  `prefers-reduced-motion`; static dashed stroke remains so the visual cue
  doesn't disappear, it just stops moving.
- **`currentColor` for skeletons.** All primitives use `currentColor` for the
  static stroke so they pick up dark-mode tokens via the wrapping container.

## Gallery surface

`/schematic-gallery` (an `app/schematic-gallery/page.tsx` route) hosts every
primitive with bound sliders/toggles. Treat it as the visual QA harness for
any change to this library.

## Related

- [[FormulaSlider]] — owns the variable state these primitives mirror.
- [[CircuitEmbed]] — owns true simulation; schematics are visualization-only.
- [[Formula]] — formulas these schematics depict.

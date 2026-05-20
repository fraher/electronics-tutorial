/**
 * Per-experiment preloaded CircuitJS circuit registry.
 *
 * Keyed by brief number (1-36). Each entry is either:
 *   - `{ kind: 'cir', text }`           — inline .cir payload, loaded via ?cct=
 *   - `{ kind: 'builtin', path }`       — relative path under public/circuitjs/,
 *                                         loaded via ?startCircuitLink=
 *   - `null`                            — no analog circuit (process briefs 12,
 *                                         13 — soldering exercises — and the
 *                                         microcontroller briefs 29-36 which
 *                                         route through Wokwi instead).
 *
 * Format: CircuitJS text format. Each line is either the simulation header
 * (starts with `$`) or a component (single letter or numeric tag, then space-
 * separated integer coordinates + flags + per-component parameters). Tags used
 * here:
 *   $   simulation params
 *   w   wire
 *   r   resistor                  flags value
 *   v   voltage source            flags waveform freq vMax bias phase duty
 *   c   capacitor                 flags capacitance initVoltage
 *   l   inductor                  flags inductance currentRA
 *   d   diode                     flags model
 *   162 LED                       flags fwdVoltage maxCurrent ...
 *   t   bipolar transistor        flags pnpFlag vbe vbc beta
 *   s   switch                    flags position momentary
 *   g   ground
 *   M   logic input (toggle)      flags state
 *   x   text label                ...
 *   155 7400 NAND-equivalent      flags
 *   150 AND                       flags
 *   151 OR                        flags
 *   152 NOT                       flags
 *   153 NAND                      flags
 *   154 NOR                       flags
 *   159 7400-series 555 timer     flags
 *
 * Every .cir string below is validated by `isPlausibleCirString` in tests:
 *   - starts with a `$` header line
 *   - every non-header line begins with a recognised component prefix
 *   - all coordinate tokens parse as integers
 *
 * We do not promise functional perfection — the registry's job is to give the
 * learner a non-empty starting point that demonstrates the experiment's idea.
 * Operators are expected to tweak in-simulator as needed.
 */

export type ExperimentCircuit =
  | { kind: 'cir'; text: string }
  | { kind: 'builtin'; path: string }
  | null;

/** Standard simulation header used across most circuits. */
const HDR = '$ 1 0.000005 10.20027730826997 50 5 50';

/** Build a complete .cir text from a header + component lines. */
function cir(...lines: string[]): string {
  return [HDR, ...lines].join('\n') + '\n';
}

/* ---------------------------------------------------------------------------
 * Chapter 1 — Discovery (1-5)
 * -------------------------------------------------------------------------*/

// 1. Taste the Power — 9V battery driving a large resistor (the tongue ≈ 200kΩ)
const cir1 = cir(
  'v 96 240 96 144 0 0 40 9 0 0 0.5',
  'r 96 144 320 144 0 200000',
  'w 320 144 320 240 0',
  'w 96 240 320 240 0',
);

// 2. Go with the Flow — 9V battery, 1.5kΩ series resistor, LED
const cir2 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  'r 96 144 256 144 0 1500',
  '162 256 144 384 144 0 2.1024259 1 0 0 0.01',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 3. Applying Pressure — same series loop, slightly different R
const cir3 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  'r 96 144 256 144 0 1000',
  '162 256 144 384 144 0 2.1024259 1 0 0 0.01',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 4. Heat and Power — 9V battery, single resistor (Ohm's-law sandbox)
const cir4 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  'r 96 144 384 144 0 1000',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 5. Lemon battery — four 0.8V sources in series feeding an LED via small R
const cir5 = cir(
  'v 96 256 96 224 0 0 40 0.8 0 0 0.5',
  'v 96 224 96 192 0 0 40 0.8 0 0 0.5',
  'v 96 192 96 160 0 0 40 0.8 0 0 0.5',
  'v 96 160 96 128 0 0 40 0.8 0 0 0.5',
  'r 96 128 240 128 0 220',
  '162 240 128 384 128 0 1.8 1 0 0 0.01',
  'w 384 128 384 256 0',
  'w 96 256 384 256 0',
);

/* ---------------------------------------------------------------------------
 * Chapter 2 — Working with electricity (6-11)
 * -------------------------------------------------------------------------*/

// 6. Two switches in series → LED
const cir6 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  's 96 144 192 144 0 0 0',
  's 192 144 288 144 0 0 0',
  'r 288 144 384 144 0 470',
  '162 384 144 464 144 0 2.1 1 0 0 0.01',
  'w 464 144 464 256 0',
  'w 96 256 464 256 0',
);

// 7. Relay coil = inductor (100mH) + series R (500Ω); pushbutton drives it
const cir7 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  's 96 144 192 144 0 0 1',
  'r 192 144 288 144 0 500',
  'l 288 144 384 144 0 0.1 0',
  'd 288 96 384 96 0 default',
  'w 288 96 288 144 0',
  'w 384 96 384 144 0',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 8. Relay oscillator — inductor + series R + cap across coil to slow it
const cir8 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  's 96 144 192 144 0 0 0',
  'r 192 144 288 144 0 500',
  'l 288 144 384 144 0 0.1 0',
  'c 288 192 384 192 0 0.0001 0',
  'w 288 144 288 192 0',
  'w 384 144 384 192 0',
  'w 384 192 384 256 0',
  'w 96 256 384 256 0',
);

// 9. RC time constant — 9V → 10kΩ → 1000µF to ground, with switch
const cir9 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  's 96 144 192 144 0 0 0',
  'r 192 144 320 144 0 10000',
  'c 320 144 320 256 0 0.001 0',
  'w 96 256 320 256 0',
);

// 10. Transistor switch — base via 10kΩ + button, collector via 470Ω + LED
const cir10 = cir(
  'v 96 320 96 144 0 0 40 9 0 0 0.5',
  'r 96 144 256 144 0 470',
  '162 256 144 320 144 0 2.1 1 0 0 0.01',
  't 320 192 384 192 0 1 0 0 200',
  'w 320 144 320 192 0',
  'w 384 192 384 320 0',
  'w 96 320 384 320 0',
  's 96 240 192 240 0 0 1',
  'r 192 240 320 240 0 10000',
  'w 320 240 320 208 0',
);

// 11. Light & sound — RC discharge into transistor base, LED on collector
const cir11 = cir(
  'v 96 320 96 144 0 0 40 9 0 0 0.5',
  's 96 240 192 240 0 0 1',
  'r 192 240 256 240 0 1000',
  'c 256 240 256 288 0 0.0001 0',
  'w 256 288 256 320 0',
  'r 256 240 320 240 0 10000',
  'r 320 240 320 288 0 100000',
  'w 320 288 320 320 0',
  't 320 208 384 208 0 1 0 0 200',
  'w 320 240 320 224 0',
  'r 96 144 256 144 0 470',
  '162 256 144 384 144 0 2.1 1 0 0 0.01',
  'w 384 144 384 208 0',
  'w 96 320 384 320 0',
);

/* ---------------------------------------------------------------------------
 * Chapter 3 — Process briefs (12, 13) have no electrical schematic.
 * 14 — astable multivibrator.
 * -------------------------------------------------------------------------*/

const cir12 = null;
const cir13 = null;

// 14. Astable multivibrator — two NPN, two LEDs, cross-coupled caps
const cir14 = cir(
  'v 96 320 96 64 0 0 40 9 0 0 0.5',
  // left half
  'r 192 64 192 144 0 470',
  '162 192 144 192 192 0 2.1 1 0 0 0.01',
  't 192 240 256 240 0 1 0 0 200',
  'w 192 192 192 240 0',
  'w 256 240 256 320 0',
  'r 256 64 256 144 0 47000',
  'w 256 144 256 224 0',
  // right half
  'r 384 64 384 144 0 470',
  '162 384 144 384 192 0 2.1 1 0 0 0.01',
  't 384 240 320 240 0 1 0 0 200',
  'w 384 192 384 240 0',
  'w 320 240 320 320 0',
  'r 320 64 320 144 0 47000',
  'w 320 144 320 224 0',
  // cross-couple caps
  'c 192 192 320 192 0 0.00001 0',
  'c 256 192 384 192 0 0.00001 0',
  // rails
  'w 96 64 192 64 0',
  'w 192 64 256 64 0',
  'w 256 64 320 64 0',
  'w 320 64 384 64 0',
  'w 96 320 384 320 0',
);

/* ---------------------------------------------------------------------------
 * Chapter 4 — Integrated circuits (15-23)
 * -------------------------------------------------------------------------*/

// 15. 555 monostable (using element 159 = NE555)
const cir15 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  '159 256 192 320 256 0 5',
  'r 320 96 320 192 0 100000',
  'w 320 96 256 96 0',
  'w 256 96 256 128 0',
  'c 320 256 320 320 0 0.00001 0',
  's 192 128 256 128 0 0 1',
  'w 192 128 192 96 0',
  'w 96 96 192 96 0',
  'r 320 192 384 192 0 470',
  '162 384 192 384 256 0 2.1 1 0 0 0.01',
  'w 384 256 384 320 0',
  'w 96 320 384 320 0',
);

// 16. 555 astable + speaker (modeled as 8Ω resistor + 100Ω series)
const cir16 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  '159 256 192 320 256 0 5',
  'r 256 96 256 144 0 1000',
  'r 256 144 256 192 0 10000',
  'w 256 96 320 96 0',
  'c 320 256 320 320 0 0.0000001 0',
  'r 384 192 448 192 0 100',
  'r 448 192 448 256 0 8',
  'w 320 192 384 192 0',
  'w 448 256 448 320 0',
  'w 96 320 448 320 0',
  'w 96 96 256 96 0',
);

// 17. Alarm — switch + transistor + relay-as-inductor + 555 + speaker
const cir17 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  's 96 192 192 192 0 0 1',
  'r 192 192 256 192 0 10000',
  't 256 224 320 224 0 1 0 0 200',
  'w 256 192 256 224 0',
  'l 320 96 320 192 0 0.1 0',
  'd 384 96 384 192 0 default',
  'w 320 96 384 96 0',
  'w 320 192 384 192 0',
  'w 320 192 320 208 0',
  'w 320 256 320 320 0',
  '159 416 192 480 256 0 5',
  'r 480 96 480 192 0 47000',
  'c 480 256 480 320 0 0.00001 0',
  'r 544 192 608 192 0 100',
  'w 608 192 608 320 0',
  'w 96 96 480 96 0',
  'w 96 320 608 320 0',
);

// 18. Reflex tester — two 555s + counter; approximate with two 555s feeding LED
const cir18 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  '159 192 192 256 256 0 5',
  'r 256 96 256 192 0 100000',
  'c 256 256 256 320 0 0.00001 0',
  's 128 128 192 128 0 0 1',
  'w 192 128 192 96 0',
  '159 384 192 448 256 0 5',
  'r 448 96 448 144 0 1000',
  'r 448 144 448 192 0 1000',
  'c 448 256 448 320 0 0.0000005 0',
  'w 256 192 384 192 0',
  'r 512 192 576 192 0 220',
  '162 576 192 576 256 0 2.1 1 0 0 0.01',
  'w 576 256 576 320 0',
  'w 96 96 256 96 0',
  'w 256 96 448 96 0',
  'w 96 320 576 320 0',
);

// 19. Logic gates — four 2-input gates each with switches + LED. Use tag 150 AND.
const cir19 = cir(
  'v 96 320 96 96 0 0 40 5 0 0 0.5',
  'M 96 144 144 144 0 0',
  'M 96 192 144 192 0 0',
  '150 192 168 256 168 0',
  'r 256 168 320 168 0 470',
  '162 320 168 384 168 0 2.1 1 0 0 0.01',
  'w 384 168 384 320 0',
  'w 96 320 384 320 0',
);

// 20. Combination lock — AND tree of five 2-input gates (cascade simplified)
const cir20 = cir(
  'v 96 320 96 96 0 0 40 5 0 0 0.5',
  'M 96 112 144 112 0 0',
  'M 96 144 144 144 0 0',
  'M 96 176 144 176 0 0',
  'M 96 208 144 208 0 0',
  'M 96 240 144 240 0 0',
  '150 192 128 256 128 0',
  '150 192 192 256 192 0',
  '150 320 160 384 160 0',
  '150 416 184 480 184 0',
  'w 256 128 320 144 0',
  'w 256 192 320 176 0',
  'w 384 160 416 168 0',
  'w 144 240 416 200 0',
  'r 480 184 544 184 0 470',
  '162 544 184 544 256 0 2.1 1 0 0 0.01',
  'w 544 256 544 320 0',
  'w 96 320 544 320 0',
);

// 21. SR latch via two cross-coupled NAND
const cir21 = cir(
  'v 96 320 96 96 0 0 40 5 0 0 0.5',
  'M 96 144 144 144 0 1',
  'M 96 240 144 240 0 1',
  '153 192 128 256 128 0',
  '153 192 224 256 224 0',
  'w 256 128 320 176 0',
  'w 256 224 320 176 0',
  'w 192 168 256 224 0',
  'w 192 200 256 128 0',
  'r 256 128 320 128 0 470',
  '162 320 128 384 128 0 2.1 1 0 0 0.01',
  'w 384 128 384 320 0',
  'w 96 320 384 320 0',
);

// 22. Debounce — SPDT switch + RC + Schmitt. Approximate with RC low-pass.
const cir22 = cir(
  'v 96 320 96 96 0 0 40 5 0 0 0.5',
  's 96 144 192 144 0 0 1',
  'r 192 144 288 144 0 10000',
  'c 288 144 288 256 0 0.0000001 0',
  'w 288 256 288 320 0',
  '152 320 144 384 144 0',
  'w 288 144 320 144 0',
  'r 384 144 448 144 0 470',
  '162 448 144 448 256 0 2.1 1 0 0 0.01',
  'w 448 256 448 320 0',
  'w 96 320 448 320 0',
);

// 23. Dice — 555 astable into a single LED (decoder simplification)
const cir23 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  '159 256 192 320 256 0 5',
  'r 256 96 256 144 0 1000',
  'r 256 144 256 192 0 1000',
  'c 320 256 320 320 0 0.0000001 0',
  'r 320 192 384 192 0 470',
  '162 384 192 384 256 0 2.1 1 0 0 0.01',
  'w 384 256 384 320 0',
  'w 256 96 320 96 0',
  'w 96 96 256 96 0',
  'w 96 320 384 320 0',
);

/* ---------------------------------------------------------------------------
 * Chapter 5 — Magnetism & RF (24-28); 29-36 are Arduino → Wokwi
 * -------------------------------------------------------------------------*/

// 24. Magnetism — coil = inductor with current-limit R, switch in series
const cir24 = cir(
  'v 96 256 96 144 0 0 40 9 0 0 0.5',
  's 96 144 192 144 0 0 1',
  'r 192 144 256 144 0 10',
  'l 256 144 384 144 0 0.001 0',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 25. Induction — modeled as AC source (induced EMF) feeding LED + R load
const cir25 = cir(
  'v 96 256 96 144 0 1 50 0.5 0 0 0.5',
  'r 96 144 256 144 0 50',
  '162 256 144 384 144 0 1.8 1 0 0 0.01',
  'w 384 144 384 256 0',
  'w 96 256 384 256 0',
);

// 26. Speaker — 555 astable driving an inductor (voice coil) + 8Ω
const cir26 = cir(
  'v 96 320 96 96 0 0 40 9 0 0 0.5',
  '159 256 192 320 256 0 5',
  'r 256 96 256 144 0 1000',
  'r 256 144 256 192 0 10000',
  'c 320 256 320 320 0 0.0000001 0',
  'r 384 192 448 192 0 100',
  'l 448 192 448 256 0 0.001 0',
  'r 448 256 448 320 0 8',
  'w 320 192 384 192 0',
  'w 256 96 320 96 0',
  'w 96 96 256 96 0',
  'w 96 320 448 320 0',
);

// 27. LC tank — AC source through 100Ω to L||C
const cir27 = cir(
  'v 96 256 96 144 0 1 1000 1 0 0 0.5',
  'r 96 144 256 144 0 100',
  'l 256 144 384 144 0 0.01 0',
  'c 256 192 384 192 0 0.0000001 0',
  'w 256 144 256 192 0',
  'w 384 144 384 192 0',
  'w 384 192 384 256 0',
  'w 96 256 384 256 0',
);

// 28. Crystal radio — AC RF source, LC tank, diode envelope detector, load R
const cir28 = cir(
  'v 96 256 96 144 0 1 1000000 0.01 0 0 0.5',
  'l 192 144 320 144 0 0.00025 0',
  'c 192 192 320 192 0 0.0000000002 0',
  'w 192 144 192 192 0',
  'w 96 144 192 144 0',
  'w 96 256 320 256 0',
  'w 320 144 320 192 0',
  'd 320 144 384 144 0 default',
  'r 384 144 384 256 0 10000',
);

/* ---------------------------------------------------------------------------
 * Chapter 5 microcontroller briefs — no analog circuit; routed to Wokwi.
 * -------------------------------------------------------------------------*/

const CIRCUITS: Record<number, ExperimentCircuit> = {
  1: { kind: 'cir', text: cir1 },
  2: { kind: 'cir', text: cir2 },
  3: { kind: 'cir', text: cir3 },
  4: { kind: 'cir', text: cir4 },
  5: { kind: 'cir', text: cir5 },
  6: { kind: 'cir', text: cir6 },
  7: { kind: 'cir', text: cir7 },
  8: { kind: 'cir', text: cir8 },
  9: { kind: 'cir', text: cir9 },
  10: { kind: 'cir', text: cir10 },
  11: { kind: 'cir', text: cir11 },
  12: cir12,
  13: cir13,
  14: { kind: 'cir', text: cir14 },
  15: { kind: 'cir', text: cir15 },
  16: { kind: 'cir', text: cir16 },
  17: { kind: 'cir', text: cir17 },
  18: { kind: 'cir', text: cir18 },
  19: { kind: 'cir', text: cir19 },
  20: { kind: 'cir', text: cir20 },
  21: { kind: 'cir', text: cir21 },
  22: { kind: 'cir', text: cir22 },
  23: { kind: 'cir', text: cir23 },
  24: { kind: 'cir', text: cir24 },
  25: { kind: 'cir', text: cir25 },
  26: { kind: 'cir', text: cir26 },
  27: { kind: 'cir', text: cir27 },
  28: { kind: 'cir', text: cir28 },
  29: null,
  30: null,
  31: null,
  32: null,
  33: null,
  34: null,
  35: null,
  36: null,
};

export function getExperimentCircuit(briefNumber: number): ExperimentCircuit {
  return CIRCUITS[briefNumber] ?? null;
}

export function getAllExperimentCircuits(): Record<number, ExperimentCircuit> {
  return CIRCUITS;
}

/**
 * Structural sanity check used by tests. Verifies a .cir string:
 *   - starts with `$` header
 *   - every non-empty line begins with a recognised component-tag prefix
 *   - every coordinate token (positions 2-5 of each component line) parses
 *     as an integer.
 */
export function isPlausibleCirString(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return false;
  if (!lines[0].startsWith('$')) return false;
  const allowedPrefixes = new Set([
    'w', 'r', 'v', 'c', 'l', 'd', 's', 'g', 't', 'M', 'x', 'O',
    '150', '151', '152', '153', '154', '155', '157', '159', '162',
  ]);
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length < 2) return false;
    if (!allowedPrefixes.has(parts[0])) return false;
    // Coordinate tokens — positions 1..4 — must parse as integers for tags that
    // place a component in 2D. (Header lines are skipped above.)
    for (let j = 1; j <= Math.min(4, parts.length - 1); j++) {
      const tok = parts[j];
      if (!/^-?\d+$/.test(tok)) return false;
    }
  }
  return true;
}

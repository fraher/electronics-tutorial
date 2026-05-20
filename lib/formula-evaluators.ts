// Closed-form JavaScript evaluators keyed by formula `id` as declared in the
// brief YAML. Each function receives the variable map (keyed by `name` exactly
// as declared in `vars:` — including unicode like τ, ε, β, μ_r) and returns
// the value of the `solve_for` quantity.
//
// Briefs whose formula `id` is missing from this map are rendered as a static
// formula (LaTeX only, no slider) and a console.warn is emitted at module load
// in dev. Adding a new evaluator means appending one line below.

export type Evaluator = (v: Record<string, number>) => number;

// Helper: ln, exp, etc. are just Math.*
const E = Math.E;
const PI = Math.PI;

export const EVALUATORS: Record<string, Evaluator> = {
  // ── Chapter 1 ────────────────────────────────────────────────────────────
  'kilohm-conversion': ({ R }) => R / 1000,
  'led-current-estimate': ({ V_S, V_F, R }) => (V_S - V_F) / R,
  'resistor-3band': ({ d_1, d_2, m }) => (10 * d_1 + d_2) * Math.pow(10, m),
  'kvl-loop': ({ V_S, V_LED }) => V_S - V_LED, // V_R = V_S - V_LED
  // water-analogy is qualitative — solve_for V is just V (no real eval).
  'water-analogy': ({ h }) => h, // V ∝ h; report h as a stand-in for V
  'ohms-law': ({ I, R }) => I * R,
  'power-vi': ({ V, I }) => V * I,
  'power-i2r': ({ I, R }) => I * I * R,
  'power-v2r': ({ V, R }) => (V * V) / R,
  'series-voltage': ({ N, V_cell }) => N * V_cell,
  'parallel-current': ({ N, I_cell }) => N * I_cell,
  'switch-combinations': ({ P, T }) => Math.pow(P, T),
  'coil-current': ({ V_coil, R_coil }) => V_coil / R_coil,
  'coil-power': ({ V_coil, R_coil }) => (V_coil * V_coil) / R_coil,
  'relay-osc-freq': ({ t_on, t_off }) => 1 / (t_on + t_off),
  'cap-slowing': ({ R_coil, C }) => R_coil * C,
  'rc-time-constant': ({ R, C }) => R * C,
  'cap-charge-curve': ({ V_S, R, C, t }) => V_S * (1 - Math.exp(-t / (R * C))),
  'cap-discharge-curve': ({ V_0, R, C, t }) => V_0 * Math.exp(-t / (R * C)),
  'transistor-gain': (v) => (v['β'] ?? v.beta ?? 0) * v.I_B,
  'base-resistor': ({ V_in, I_B }) => (V_in - 0.7) / I_B,
  'fade-time': ({ R, C }) => 5 * R * C,
  'piezo-tone': ({ T }) => 1 / T,

  // ── Chapter 2 ────────────────────────────────────────────────────────────
  'joint-resistance': (v) => ((v['ρ'] ?? v.rho ?? 0) * v.L) / v.A,
  'max-junction-temp': ({ T_A, P_D, R_thJA }) => T_A + P_D * R_thJA,
  'astable-period': ({ R_1, R_2, C_1, C_2 }) => 0.693 * (R_1 * C_1 + R_2 * C_2),
  'astable-frequency': ({ T }) => 1 / T,

  // ── Chapter 3 ────────────────────────────────────────────────────────────
  '555-monostable-width': ({ R, C }) => 1.1 * R * C,
  '555-astable-thigh': ({ R_A, R_B, C }) => 0.693 * (R_A + R_B) * C,
  '555-astable-tlow': ({ R_B, C }) => 0.693 * R_B * C,
  '555-astable-freq': ({ R_A, R_B, C }) => 1.44 / ((R_A + 2 * R_B) * C),
  '555-duty-cycle': ({ R_A, R_B }) => (R_A + R_B) / (R_A + 2 * R_B),

  // ── Chapter 4 ────────────────────────────────────────────────────────────
  'alarm-current': ({ V_S, V_CE, R_coil }) => (V_S - V_CE) / R_coil,
  'reaction-time': ({ N, f_clock }) => N / f_clock,
  'gate-clock': ({ R_A, R_B, C }) => 1.44 / ((R_A + 2 * R_B) * C),
  'logic-thresholds': ({ V_CC }) => 0.7 * V_CC,
  'logic-low': ({ V_CC }) => 0.3 * V_CC,
  'combination-count': ({ S }) => Math.pow(2, S),
  'guess-probability': ({ S }) => 1 / Math.pow(2, S),
  // sr-latch-set is boolean logic — return 0/1 from S, R, Q
  'sr-latch-set': ({ S, R, Q }) => {
    const notR = R === 0 ? 1 : 0;
    const and = S && notR && Q ? 1 : 0;
    return and === 1 ? 0 : 1; // NAND
  },
  'debounce-rc': ({ R, C }) => R * C,
  'bounce-duration': ({ f_bounce }) => 1 / f_bounce,
  'dice-clock-freq': ({ R_A, R_B, C }) => 1.44 / ((R_A + 2 * R_B) * C),
  'counter-modulus': ({ f_clock, f_display }) => f_clock / f_display,

  // ── Chapter 5 ────────────────────────────────────────────────────────────
  'ampere-turns': ({ N, I, L }) => (N * I) / L,
  // μ_0 = 4π × 10⁻⁷
  'flux-density': (v) => 4 * PI * 1e-7 * (v['μ_r'] ?? v.mu_r ?? 1) * v.H,
  'faraday-emf': ({ N, dPhi_dt }) => -N * dPhi_dt,
  'induced-current': (v) => (v['ε'] ?? v.epsilon ?? 0) / v.R_coil,
  'speaker-power': ({ V, Z }) => (V * V) / Z,
  'coil-force': ({ B, I, L }) => B * I * L,
  'rl-time-constant': ({ L, R }) => L / R,
  'inductive-reactance': ({ f, L }) => 2 * PI * f * L,
  'lc-resonance': ({ L, C }) => 1 / (2 * PI * Math.sqrt(L * C)),
  'am-resonance': ({ L, C }) => 1 / (2 * PI * Math.sqrt(L * C)),
  'am-wave-power': ({ E, A_eff }) => E * E * A_eff,
  'blink-period': ({ t_on, t_off }) => t_on + t_off,
  'pin-current': ({ V_pin, V_LED, R }) => (V_pin - V_LED) / R,
  'pin-source-current': ({ N, V_pin, R, R_LED }) => (N * V_pin) / (R + R_LED),
  'dice-uniformity': () => 1 / 6,
  'debounce-window': ({ t_bounce }) => t_bounce, // t_ignore ≥ t_bounce → equality at boundary
  'poll-rate': ({ t_loop }) => 1 / t_loop,
  'adc-voltage': ({ raw, V_ref }) => (raw / 1023) * V_ref,
  'pwm-duty': ({ analogWrite }) => analogWrite / 255,
  'arduino-pwm-freq': () => 490, // constant
  'voltage-divider': ({ V_in, R_fixed, R_LDR }) => (V_in * R_fixed) / (R_fixed + R_LDR),
  'light-threshold': ({ T_on, T_off }) => T_off - T_on, // hysteresis gap
  'note-frequency-from-midi': ({ n }) => 440 * Math.pow(2, (n - 69) / 12),
  'note-period': ({ f }) => 1 / f,
  'note-duration': ({ BPM, N_per_beat }) => 60000 / (BPM * N_per_beat),
  'serial-throughput': ({ baud }) => baud / 10,
  'sample-period': ({ f_log }) => 1 / f_log,
  // brightness-mapping is the Arduino `map()`-style transform
  'brightness-mapping': ({ adc }) => 255 - Math.round((adc / 1023) * 255),
  'log-rate': ({ f_log }) => 1 / f_log,
  'program-loop-time': ({ t_button_response }) => t_button_response,
};

// Silence the unused-binding warning on E in some configs:
void E;

export function getEvaluator(id: string): Evaluator | undefined {
  return EVALUATORS[id];
}

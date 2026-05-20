/**
 * Per-experiment inline-SVG schematic registry.
 *
 * Each entry maps a brief number (1-36) to a render function that accepts the
 * FormulaSlider's live `vars` dict and returns the SVG body for an
 * <ExperimentSchematic>. The composer wraps the body in an <svg viewBox> with
 * grid + legend; entries here produce only the inner <g> primitives.
 *
 * Authoring principles (per LiveSchematic theory):
 *   - One central idea, not a transcription of every formula variable.
 *   - 2-5 primitives, laid out in a coherent ~400x240 viewBox.
 *   - Variables map to live props where it teaches; defaults elsewhere.
 *   - For process / abstract briefs (12, 13, 19 truth-table-ish, 28 RF, etc.),
 *     use creative analogies rather than literal circuit copies.
 *   - For Arduino briefs (29-36), the schematic is a small static depiction of
 *     the Arduino pin + peripheral. Variables are scarce, so the schematic
 *     reflects the formula's domain (e.g., PWM duty, blink period).
 *
 * The schematic is decorative on top of the FormulaSlider; the live formula
 * result remains the source-of-truth numeric answer. Schematics never assert
 * pedagogical correctness — they make the formula's *shape* tangible.
 */

import * as React from 'react';
import {
  LiveWire,
  LiveResistor,
  LiveCapacitor,
  LiveInductor,
  LiveDiode,
  LiveTransistor,
  LiveGate,
  LiveBattery,
  LiveLamp,
  LiveSwitch,
} from '@/components/schematic';

export type SchematicVars = Record<string, number>;
export type SchematicRender = (vars: SchematicVars) => React.ReactNode;

/** Convenience accessor: return v[name] if finite, else fallback. */
function pick(v: SchematicVars, name: string, fallback: number): number {
  const x = v[name];
  return Number.isFinite(x) ? x : fallback;
}

/* ---------------------------------------------------------------------------
 * Chapter 1
 * -------------------------------------------------------------------------*/

// 1. Taste the Power — body as a giant resistor between battery terminals.
const sch1: SchematicRender = (v) => {
  const R = pick(v, 'R', 200000);
  // Implied current at 9V; clamp to a sane visible range.
  const I = Math.min(0.001, 9 / Math.max(R, 1));
  return (
    <g>
      <LiveBattery x={80} y={120} voltage={9} />
      <LiveWire from={[110, 120]} to={[180, 120]} current={I} currentMax={0.001} />
      <LiveResistor x={240} y={120} value={R} current={I} label={`Body ${(R / 1000).toFixed(0)}kΩ`} powerMax={0.01} />
      <LiveWire from={[300, 120]} to={[370, 120]} current={I} currentMax={0.001} />
      <LiveWire from={[80, 180]} to={[370, 180]} current={I} currentMax={0.001} />
      <LiveWire from={[370, 120]} to={[370, 180]} current={I} currentMax={0.001} />
      <LiveWire from={[80, 120]} to={[80, 180]} current={I} currentMax={0.001} />
    </g>
  );
};

// 2. Go with the Flow — V_S → R → LED loop. Current from Ohm's-law analog.
const sch2: SchematicRender = (v) => {
  const VS = pick(v, 'V_S', 9);
  const VF = pick(v, 'V_F', 2.1);
  const R = pick(v, 'R', 1500);
  const I = Math.max(0, (VS - VF) / Math.max(R, 1));
  return (
    <g>
      <LiveBattery x={80} y={120} voltage={VS} />
      <LiveWire from={[110, 120]} to={[170, 120]} current={I} currentMax={0.05} />
      <LiveResistor x={220} y={120} value={R} current={I} powerMax={0.25} />
      <LiveWire from={[270, 120]} to={[320, 120]} current={I} currentMax={0.05} />
      <LiveDiode x={340} y={120} current={I} vF={VF} currentMax={0.05} />
      <LiveWire from={[360, 120]} to={[380, 120]} current={I} currentMax={0.05} />
      <LiveWire from={[80, 180]} to={[380, 180]} current={I} currentMax={0.05} />
      <LiveWire from={[80, 120]} to={[80, 180]} current={I} currentMax={0.05} />
      <LiveWire from={[380, 120]} to={[380, 180]} current={I} currentMax={0.05} />
    </g>
  );
};

// 3. Applying Pressure — same loop, three voltmeter callouts (text only).
const sch3: SchematicRender = (v) => {
  const VS = pick(v, 'V_S', 9);
  const VLED = pick(v, 'V_LED', 2.1);
  const VR = Math.max(0, VS - VLED);
  const I = VR / 1000; // representative R = 1kΩ
  return (
    <g>
      <LiveBattery x={80} y={140} voltage={VS} />
      <LiveWire from={[110, 140]} to={[180, 140]} current={I} currentMax={0.02} />
      <LiveResistor x={230} y={140} value={1000} current={I} powerMax={0.25} label={`V_R = ${VR.toFixed(2)}V`} />
      <LiveWire from={[280, 140]} to={[320, 140]} current={I} currentMax={0.02} />
      <LiveDiode x={340} y={140} current={I} vF={VLED} currentMax={0.02} />
      <LiveWire from={[360, 140]} to={[380, 140]} current={I} currentMax={0.02} />
      <LiveWire from={[80, 200]} to={[380, 200]} current={I} currentMax={0.02} />
      <LiveWire from={[80, 140]} to={[80, 200]} current={I} currentMax={0.02} />
      <LiveWire from={[380, 140]} to={[380, 200]} current={I} currentMax={0.02} />
      <text x={200} y={70} fontSize={11} fill="currentColor" opacity={0.7}>
        V_S = {VS.toFixed(2)}V (sum)
      </text>
    </g>
  );
};

// 4. Heat and Power — single R, glows red when P high.
const sch4: SchematicRender = (v) => {
  const I = pick(v, 'I', 0.02);
  const R = pick(v, 'R', 1000);
  const V = pick(v, 'V', I * R);
  return (
    <g>
      <LiveBattery x={80} y={120} voltage={V} />
      <LiveWire from={[110, 120]} to={[180, 120]} current={I} currentMax={0.1} />
      <LiveResistor x={240} y={120} value={R} current={I} powerMax={0.25} />
      <LiveWire from={[300, 120]} to={[370, 120]} current={I} currentMax={0.1} />
      <LiveWire from={[80, 180]} to={[370, 180]} current={I} currentMax={0.1} />
      <LiveWire from={[80, 120]} to={[80, 180]} current={I} currentMax={0.1} />
      <LiveWire from={[370, 120]} to={[370, 180]} current={I} currentMax={0.1} />
    </g>
  );
};

// 5. Lemon battery — N batteries in series → LED.
const sch5: SchematicRender = (v) => {
  const N = Math.min(8, Math.max(1, Math.round(pick(v, 'N', 4))));
  const Vcell = pick(v, 'V_cell', 0.8);
  const Vtotal = N * Vcell;
  const I = Math.max(0, (Vtotal - 1.8) / 220);
  const cells: React.ReactNode[] = [];
  const spacing = Math.min(50, 300 / N);
  for (let i = 0; i < N; i++) {
    cells.push(
      <LiveBattery key={i} x={60 + i * spacing} y={120} voltage={Vcell} label={`${Vcell.toFixed(2)}V`} />,
    );
  }
  const rightX = 60 + (N - 1) * spacing + 30;
  return (
    <g>
      {cells}
      <LiveWire from={[rightX, 120]} to={[rightX + 30, 120]} current={I} currentMax={0.02} />
      <LiveDiode x={rightX + 50} y={120} current={I} vF={1.8} currentMax={0.02} />
      <LiveWire from={[rightX + 70, 120]} to={[rightX + 90, 120]} current={I} currentMax={0.02} />
      <LiveWire from={[30, 180]} to={[rightX + 90, 180]} current={I} currentMax={0.02} />
      <LiveWire from={[30, 120]} to={[30, 180]} current={I} currentMax={0.02} />
      <LiveWire from={[rightX + 90, 120]} to={[rightX + 90, 180]} current={I} currentMax={0.02} />
      <text x={200} y={70} fontSize={11} fill="currentColor" opacity={0.7}>
        V_total = {Vtotal.toFixed(2)}V
      </text>
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Chapter 2
 * -------------------------------------------------------------------------*/

// 6. Two switches in series. Vars P, T are abstract — show two switches.
const sch6: SchematicRender = (v) => {
  const P = Math.round(pick(v, 'P', 2));
  const T = Math.round(pick(v, 'T', 2));
  const combos = Math.pow(P, T);
  // Both switches closed for demo
  return (
    <g>
      <LiveBattery x={70} y={120} voltage={9} />
      <LiveWire from={[100, 120]} to={[150, 120]} current={0.01} currentMax={0.05} />
      <LiveSwitch x={180} y={120} closed={true} label="SW1" />
      <LiveWire from={[210, 120]} to={[250, 120]} current={0.01} currentMax={0.05} />
      <LiveSwitch x={280} y={120} closed={true} label="SW2" />
      <LiveWire from={[310, 120]} to={[340, 120]} current={0.01} currentMax={0.05} />
      <LiveResistor x={370} y={120} value={470} current={0.01} powerMax={0.25} />
      <LiveWire from={[70, 180]} to={[400, 180]} current={0.01} currentMax={0.05} />
      <LiveWire from={[70, 120]} to={[70, 180]} current={0.01} currentMax={0.05} />
      <LiveWire from={[400, 120]} to={[400, 180]} current={0.01} currentMax={0.05} />
      <text x={200} y={210} fontSize={11} fill="currentColor" opacity={0.7}>
        {T} switches × {P} positions = {combos} combinations
      </text>
    </g>
  );
};

// 7. Relay = coil (inductor) + series R + flyback diode
const sch7: SchematicRender = (v) => {
  const Vcoil = pick(v, 'V_coil', 9);
  const Rcoil = pick(v, 'R_coil', 500);
  const I = Vcoil / Math.max(Rcoil, 1);
  return (
    <g>
      <LiveBattery x={70} y={140} voltage={Vcoil} />
      <LiveWire from={[100, 140]} to={[160, 140]} current={I} currentMax={0.05} />
      <LiveSwitch x={190} y={140} closed={true} />
      <LiveWire from={[220, 140]} to={[260, 140]} current={I} currentMax={0.05} />
      <LiveResistor x={300} y={140} value={Rcoil} current={I} powerMax={0.5} />
      <LiveInductor x={360} y={140} inductance={0.1} current={I} currentMax={0.05} />
      <LiveDiode x={360} y={90} current={0} vF={0.7} orientation="horizontal" />
      <LiveWire from={[340, 90]} to={[340, 140]} current={0} currentMax={0.05} />
      <LiveWire from={[380, 90]} to={[380, 140]} current={0} currentMax={0.05} />
      <LiveWire from={[70, 200]} to={[380, 200]} current={I} currentMax={0.05} />
      <LiveWire from={[70, 140]} to={[70, 200]} current={I} currentMax={0.05} />
      <LiveWire from={[380, 140]} to={[380, 200]} current={I} currentMax={0.05} />
    </g>
  );
};

// 8. Relay oscillator — coil + cap across, switch (self-breaking)
const sch8: SchematicRender = (v) => {
  const R = pick(v, 'R_coil', 500);
  const C = pick(v, 'C', 0.0001);
  return (
    <g>
      <LiveBattery x={70} y={140} voltage={9} />
      <LiveWire from={[100, 140]} to={[160, 140]} current={0.018} currentMax={0.05} />
      <LiveSwitch x={190} y={140} closed={false} label="NC" />
      <LiveWire from={[220, 140]} to={[260, 140]} current={0.018} currentMax={0.05} />
      <LiveResistor x={300} y={140} value={R} current={0.018} powerMax={0.5} />
      <LiveInductor x={360} y={140} inductance={0.1} current={0.018} currentMax={0.05} />
      <LiveCapacitor x={310} y={180} capacitance={C} voltage={4.5} orientation="vertical" />
      <LiveWire from={[310, 140]} to={[310, 165]} current={0} currentMax={0.01} />
      <LiveWire from={[310, 195]} to={[310, 220]} current={0} currentMax={0.01} />
      <LiveWire from={[70, 220]} to={[380, 220]} current={0.018} currentMax={0.05} />
      <LiveWire from={[70, 140]} to={[70, 220]} current={0.018} currentMax={0.05} />
      <LiveWire from={[380, 140]} to={[380, 220]} current={0.018} currentMax={0.05} />
    </g>
  );
};

// 9. RC charge — battery → switch → R → C → ground
const sch9: SchematicRender = (v) => {
  const R = pick(v, 'R', 10000);
  const C = pick(v, 'C', 0.001);
  const VS = pick(v, 'V_S', 9);
  const VC = pick(v, 'V_C', VS / 2);
  const I = Math.max(0, (VS - VC) / Math.max(R, 1));
  return (
    <g>
      <LiveBattery x={70} y={120} voltage={VS} />
      <LiveWire from={[100, 120]} to={[150, 120]} current={I} currentMax={0.005} />
      <LiveSwitch x={180} y={120} closed={true} />
      <LiveWire from={[210, 120]} to={[250, 120]} current={I} currentMax={0.005} />
      <LiveResistor x={290} y={120} value={R} current={I} powerMax={0.1} />
      <LiveWire from={[330, 120]} to={[370, 120]} current={I} currentMax={0.005} />
      <LiveCapacitor x={370} y={160} capacitance={C} voltage={VC} orientation="vertical" />
      <LiveWire from={[370, 175]} to={[370, 210]} current={0} currentMax={0.005} />
      <LiveWire from={[70, 210]} to={[370, 210]} current={I} currentMax={0.005} />
      <LiveWire from={[70, 120]} to={[70, 210]} current={I} currentMax={0.005} />
    </g>
  );
};

// 10. Transistor switch — base + collector with LED
const sch10: SchematicRender = (v) => {
  const beta = pick(v, 'β', 200);
  const IB = pick(v, 'I_B', 0.00005);
  const IC = Math.min(0.02, beta * IB); // saturate at LED-current cap
  const vCE = IC >= 0.018 ? 0.2 : 5;
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={9} />
      <LiveWire from={[100, 200]} to={[100, 80]} current={IC} currentMax={0.02} />
      <LiveResistor x={150} y={80} value={470} current={IC} powerMax={0.25} />
      <LiveWire from={[200, 80]} to={[240, 80]} current={IC} currentMax={0.02} />
      <LiveDiode x={260} y={80} current={IC} vF={2.1} currentMax={0.02} />
      <LiveWire from={[280, 80]} to={[320, 80]} current={IC} currentMax={0.02} />
      <LiveWire from={[320, 80]} to={[320, 140]} current={IC} currentMax={0.02} />
      <LiveTransistor x={320} y={170} kind="npn" iB={IB} iC={IC} vCE={vCE} iCMax={0.02} />
      <LiveWire from={[320, 200]} to={[320, 230]} current={IC} currentMax={0.02} />
      <LiveWire from={[70, 230]} to={[320, 230]} current={IC} currentMax={0.02} />
      <LiveResistor x={220} y={170} value={10000} current={IB} powerMax={0.001} label="R_B" />
      <LiveWire from={[180, 170]} to={[180, 230]} current={IB} currentMax={0.001} />
      <LiveWire from={[260, 170]} to={[290, 170]} current={IB} currentMax={0.001} />
    </g>
  );
};

// 11. Light & sound — cap + transistor + LED (fade)
const sch11: SchematicRender = (v) => {
  const R = pick(v, 'R', 100000);
  const C = pick(v, 'C', 0.0001);
  // Display IC modulated by R·C fade (representative).
  const decay = Math.exp(-1); // single-time-constant snapshot
  const IC = 0.018 * decay;
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={9} />
      <LiveWire from={[100, 200]} to={[100, 80]} current={IC} currentMax={0.02} />
      <LiveResistor x={150} y={80} value={470} current={IC} powerMax={0.25} />
      <LiveDiode x={220} y={80} current={IC} vF={2.1} currentMax={0.02} />
      <LiveWire from={[200, 80]} to={[200, 80]} current={IC} currentMax={0.02} />
      <LiveWire from={[240, 80]} to={[300, 80]} current={IC} currentMax={0.02} />
      <LiveWire from={[300, 80]} to={[300, 140]} current={IC} currentMax={0.02} />
      <LiveTransistor x={300} y={170} kind="npn" iB={0.0001} iC={IC} vCE={0.5} iCMax={0.02} />
      <LiveCapacitor x={200} y={170} capacitance={C} voltage={1.5} />
      <LiveResistor x={250} y={170} value={R} current={0.00005} powerMax={0.001} label={`R=${(R / 1000).toFixed(0)}kΩ`} />
      <LiveWire from={[300, 200]} to={[300, 230]} current={IC} currentMax={0.02} />
      <LiveWire from={[70, 230]} to={[300, 230]} current={IC} currentMax={0.02} />
      <LiveWire from={[170, 170]} to={[170, 230]} current={0} currentMax={0.01} />
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Chapter 3 (12, 13 are process-only — light schematic metaphors)
 * -------------------------------------------------------------------------*/

// 12. Joining wires — depict joint as a tiny resistor between two wire halves.
const sch12: SchematicRender = (v) => {
  const L = pick(v, 'L', 0.001);
  const A = pick(v, 'A', 0.000001);
  const rho = pick(v, 'ρ', 1.68e-8);
  const Rj = (rho * L) / Math.max(A, 1e-12);
  return (
    <g>
      <LiveWire from={[60, 120]} to={[180, 120]} current={0.5} currentMax={1} />
      <LiveResistor x={220} y={120} value={Rj} current={0.5} powerMax={0.001} label="joint" />
      <LiveWire from={[260, 120]} to={[380, 120]} current={0.5} currentMax={1} />
      <text x={200} y={170} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        R_joint ≈ {Rj.toExponential(2)} Ω
      </text>
    </g>
  );
};

// 13. Roasting an LED — show LED with thermal label.
const sch13: SchematicRender = (v) => {
  const TA = pick(v, 'T_A', 25);
  const PD = pick(v, 'P_D', 0.05);
  const Rth = pick(v, 'R_thJA', 300);
  const TJ = TA + PD * Rth;
  const tooHot = TJ > 85;
  return (
    <g>
      <LiveWire from={[60, 120]} to={[180, 120]} current={tooHot ? 0.05 : 0.02} currentMax={0.05} />
      <LiveResistor x={220} y={120} value={470} current={0.02} powerMax={0.25} />
      <LiveDiode x={290} y={120} current={tooHot ? 0 : 0.02} vF={2.1} currentMax={0.02} />
      <LiveWire from={[310, 120]} to={[380, 120]} current={tooHot ? 0 : 0.02} currentMax={0.05} />
      <text x={290} y={160} fontSize={11} fill={tooHot ? '#dc2626' : 'currentColor'} opacity={0.85} textAnchor="middle">
        T_J ≈ {TJ.toFixed(0)}°C {tooHot ? '(damaged)' : ''}
      </text>
    </g>
  );
};

// 14. Astable multivibrator
const sch14: SchematicRender = (v) => {
  const R1 = pick(v, 'R_1', 47000);
  const R2 = pick(v, 'R_2', 47000);
  const C1 = pick(v, 'C_1', 0.00001);
  const C2 = pick(v, 'C_2', 0.00001);
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={9} />
      {/* Left half */}
      <LiveResistor x={120} y={70} value={470} current={0.015} powerMax={0.25} />
      <LiveDiode x={120} y={120} current={0.015} vF={2.1} orientation="vertical" currentMax={0.02} />
      <LiveTransistor x={120} y={170} kind="npn" iB={0.0001} iC={0.015} vCE={0.2} iCMax={0.02} />
      <LiveResistor x={170} y={140} value={R1} current={0.0001} powerMax={0.001} label={`R1`} />
      {/* Right half */}
      <LiveResistor x={300} y={70} value={470} current={0} powerMax={0.25} />
      <LiveDiode x={300} y={120} current={0} vF={2.1} orientation="vertical" currentMax={0.02} />
      <LiveTransistor x={300} y={170} kind="npn" iB={0} iC={0} vCE={9} iCMax={0.02} />
      <LiveResistor x={250} y={140} value={R2} current={0} powerMax={0.001} label={`R2`} />
      {/* Coupling caps */}
      <LiveCapacitor x={170} y={100} capacitance={C1} voltage={4.5} />
      <LiveCapacitor x={250} y={100} capacitance={C2} voltage={4.5} />
      <LiveWire from={[70, 50]} to={[330, 50]} current={0.015} currentMax={0.02} />
      <LiveWire from={[120, 50]} to={[120, 60]} current={0.015} currentMax={0.02} />
      <LiveWire from={[300, 50]} to={[300, 60]} current={0} currentMax={0.02} />
      <LiveWire from={[70, 200]} to={[70, 230]} current={0.015} currentMax={0.02} />
      <LiveWire from={[70, 230]} to={[330, 230]} current={0.015} currentMax={0.02} />
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Chapter 4
 * -------------------------------------------------------------------------*/

// 15. 555 monostable — represent as a box with R, C, button. We mock the 555
//     with a labeled rectangle since there is no Live555 primitive.
function Live555Box({ x, y, label = '555' }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x={-32} y={-26} width={64} height={52} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <text x={0} y={4} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.8} fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

const sch15: SchematicRender = (v) => {
  const R = pick(v, 'R', 100000);
  const C = pick(v, 'C', 0.00001);
  const t = 1.1 * R * C;
  const active = t > 0 && t < 10; // visual signal
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={9} />
      <Live555Box x={200} y={140} />
      <LiveResistor x={260} y={70} value={R} current={0.0001} powerMax={0.01} />
      <LiveCapacitor x={260} y={200} capacitance={C} voltage={3} orientation="vertical" />
      <LiveWire from={[232, 140]} to={[260, 140]} current={0.0001} currentMax={0.001} />
      <LiveWire from={[260, 90]} to={[260, 115]} current={0.0001} currentMax={0.001} />
      <LiveWire from={[260, 165]} to={[260, 185]} current={0.0001} currentMax={0.001} />
      <LiveResistor x={330} y={140} value={470} current={active ? 0.015 : 0} powerMax={0.25} />
      <LiveDiode x={380} y={140} current={active ? 0.015 : 0} vF={2.1} currentMax={0.02} />
      <LiveWire from={[200, 167]} to={[200, 230]} current={0} currentMax={0.01} />
      <LiveWire from={[70, 230]} to={[380, 230]} current={0.015} currentMax={0.02} />
      <text x={200} y={50} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        pulse t ≈ {t.toFixed(2)}s
      </text>
    </g>
  );
};

// 16. 555 astable + speaker (lamp as speaker stand-in)
const sch16: SchematicRender = (v) => {
  const RA = pick(v, 'R_A', 1000);
  const RB = pick(v, 'R_B', 10000);
  const C = pick(v, 'C', 0.0000001);
  const f = 1.44 / Math.max((RA + 2 * RB) * C, 1e-9);
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={9} />
      <Live555Box x={200} y={140} />
      <LiveResistor x={260} y={70} value={RA} current={0.001} powerMax={0.01} label="R_A" />
      <LiveResistor x={330} y={70} value={RB} current={0.001} powerMax={0.01} label="R_B" />
      <LiveCapacitor x={260} y={200} capacitance={C} voltage={3} orientation="vertical" />
      <LiveWire from={[260, 90]} to={[260, 115]} current={0.001} currentMax={0.005} />
      <LiveWire from={[230, 140]} to={[260, 140]} current={0.001} currentMax={0.005} />
      <LiveWire from={[330, 90]} to={[330, 140]} current={0.001} currentMax={0.005} />
      <LiveLamp x={380} y={140} current={0.05} resistance={8} powerMax={0.5} label="spk" />
      <LiveWire from={[232, 140]} to={[350, 140]} current={0.05} currentMax={0.1} />
      <LiveWire from={[70, 230]} to={[380, 230]} current={0.05} currentMax={0.1} />
      <LiveWire from={[380, 160]} to={[380, 230]} current={0.05} currentMax={0.1} />
      <text x={200} y={50} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        f ≈ {f.toFixed(0)} Hz
      </text>
    </g>
  );
};

// 17. Alarm — sensor + transistor + relay + 555 piezo
const sch17: SchematicRender = (v) => {
  const Vs = pick(v, 'V_S', 9);
  const Rc = pick(v, 'R_coil', 500);
  const Vce = pick(v, 'V_CE', 0.2);
  const I = (Vs - Vce) / Math.max(Rc, 1);
  return (
    <g>
      <LiveBattery x={70} y={200} voltage={Vs} />
      <LiveSwitch x={130} y={120} closed={false} label="reed" />
      <LiveResistor x={200} y={120} value={10000} current={I * 0.005} powerMax={0.01} />
      <LiveTransistor x={260} y={170} kind="npn" iB={I * 0.005} iC={I} vCE={Vce} iCMax={0.05} />
      <LiveInductor x={260} y={90} inductance={0.1} current={I} currentMax={0.05} label="relay" />
      <Live555Box x={350} y={140} label="555 alarm" />
      <LiveLamp x={420} y={140} current={I * 0.5} resistance={8} powerMax={0.5} label="piezo" />
      <LiveWire from={[160, 120]} to={[170, 120]} current={I * 0.005} currentMax={0.01} />
      <LiveWire from={[230, 120]} to={[260, 120]} current={I * 0.005} currentMax={0.01} />
      <LiveWire from={[260, 60]} to={[260, 80]} current={I} currentMax={0.05} />
      <LiveWire from={[260, 100]} to={[260, 140]} current={I} currentMax={0.05} />
      <LiveWire from={[70, 230]} to={[420, 230]} current={I} currentMax={0.05} />
      <LiveWire from={[260, 200]} to={[260, 230]} current={I} currentMax={0.05} />
      <LiveWire from={[70, 60]} to={[260, 60]} current={I} currentMax={0.05} />
    </g>
  );
};

// 18. Reflex tester — two 555s feeding a counter (mocked as LED chain)
const sch18: SchematicRender = (v) => {
  const fclock = pick(v, 'f_clock', 1000);
  const N = pick(v, 'N', 250);
  const t = N / Math.max(fclock, 1);
  return (
    <g>
      <Live555Box x={120} y={130} label="555-A (gate)" />
      <Live555Box x={250} y={130} label="555-B (clk)" />
      <LiveWire from={[152, 130]} to={[218, 130]} current={0.001} currentMax={0.005} />
      <rect x={310} y={100} width={70} height={60} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <text x={345} y={134} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.85} fontFamily="monospace">
        4026
      </text>
      <LiveWire from={[282, 130]} to={[310, 130]} current={0.001} currentMax={0.005} />
      <text x={250} y={60} fontSize={11} fill="currentColor" opacity={0.8} textAnchor="middle">
        t = {t.toFixed(3)}s at {fclock.toFixed(0)}Hz
      </text>
      <text x={345} y={190} fontSize={11} fill="currentColor" opacity={0.8} textAnchor="middle">
        count: {Math.round(N)}
      </text>
    </g>
  );
};

// 19. Logic gates — four gates side by side. Inputs from V_CC threshold value
const sch19: SchematicRender = (v) => {
  const Vcc = pick(v, 'V_CC', 5);
  const high = Vcc > 2.5;
  return (
    <g>
      <LiveGate x={90} y={70} kind="and" inputs={[true, true]} />
      <LiveGate x={90} y={170} kind="or" inputs={[true, false]} />
      <LiveGate x={280} y={70} kind="nand" inputs={[true, high]} />
      <LiveGate x={280} y={170} kind="nor" inputs={[false, false]} />
      <text x={200} y={20} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        V_CC = {Vcc.toFixed(1)}V — threshold {(Vcc * 0.7).toFixed(2)}V (HIGH)
      </text>
    </g>
  );
};

// 20. AND tree of 5 inputs → 1 LED
const sch20: SchematicRender = (v) => {
  const S = Math.round(pick(v, 'S', 5));
  const allCorrect = true;
  return (
    <g>
      <LiveGate x={80} y={60} kind="and" inputs={[true, true]} />
      <LiveGate x={80} y={160} kind="and" inputs={[true, true]} />
      <LiveGate x={220} y={110} kind="and" inputs={[true, true]} />
      <LiveGate x={340} y={110} kind="and" inputs={[true, true]} />
      <LiveWire from={[108, 60]} to={[195, 95]} current={allCorrect ? 0.001 : 0} currentMax={0.005} />
      <LiveWire from={[108, 160]} to={[195, 125]} current={allCorrect ? 0.001 : 0} currentMax={0.005} />
      <LiveWire from={[248, 110]} to={[315, 95]} current={allCorrect ? 0.001 : 0} currentMax={0.005} />
      <LiveDiode x={400} y={110} current={allCorrect ? 0.015 : 0} vF={2.1} currentMax={0.02} />
      <text x={200} y={20} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        {S} switches → 2^{S} = {Math.pow(2, S)} combinations
      </text>
    </g>
  );
};

// 21. SR latch from 2 NAND gates
const sch21: SchematicRender = (v) => {
  const S = Math.round(pick(v, 'S', 0));
  const R = Math.round(pick(v, 'R', 1));
  return (
    <g>
      <LiveGate x={140} y={90} kind="nand" inputs={[S === 0, true]} />
      <LiveGate x={140} y={170} kind="nand" inputs={[true, R === 0]} />
      <LiveWire from={[168, 90]} to={[200, 90]} current={0.001} currentMax={0.005} />
      <LiveWire from={[200, 90]} to={[200, 170]} current={0.001} currentMax={0.005} />
      <LiveWire from={[200, 170]} to={[110, 170]} current={0.001} currentMax={0.005} />
      <LiveWire from={[168, 170]} to={[240, 170]} current={0.001} currentMax={0.005} />
      <LiveWire from={[240, 170]} to={[240, 90]} current={0.001} currentMax={0.005} />
      <LiveWire from={[240, 90]} to={[110, 90]} current={0.001} currentMax={0.005} />
      <text x={200} y={40} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        S={S}, R={R}
      </text>
    </g>
  );
};

// 22. Debounce — RC filter + Schmitt inverter
const sch22: SchematicRender = (v) => {
  const R = pick(v, 'R', 10000);
  const C = pick(v, 'C', 0.0000001);
  const tau = R * C;
  return (
    <g>
      <LiveSwitch x={80} y={120} closed={false} label="btn" />
      <LiveWire from={[110, 120]} to={[180, 120]} current={0} currentMax={0.001} />
      <LiveResistor x={220} y={120} value={R} current={0} powerMax={0.01} />
      <LiveWire from={[260, 120]} to={[300, 120]} current={0} currentMax={0.001} />
      <LiveCapacitor x={300} y={170} capacitance={C} voltage={2.5} orientation="vertical" />
      <LiveWire from={[300, 185]} to={[300, 220]} current={0} currentMax={0.001} />
      <LiveGate x={350} y={120} kind="not" inputs={[false]} />
      <LiveWire from={[300, 120]} to={[330, 120]} current={0} currentMax={0.001} />
      <LiveWire from={[50, 220]} to={[300, 220]} current={0} currentMax={0.001} />
      <text x={200} y={50} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        τ = R·C = {(tau * 1000).toFixed(2)} ms
      </text>
    </g>
  );
};

// 23. Dice — 555 → counter → LED grid (3 LEDs as proxy)
const sch23: SchematicRender = (v) => {
  const RA = pick(v, 'R_A', 1000);
  const RB = pick(v, 'R_B', 1000);
  const C = pick(v, 'C', 0.0000001);
  const f = 1.44 / Math.max((RA + 2 * RB) * C, 1e-9);
  return (
    <g>
      <Live555Box x={110} y={120} label="555 clk" />
      <rect x={170} y={90} width={70} height={60} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <text x={205} y={124} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.85} fontFamily="monospace">
        4017
      </text>
      <LiveWire from={[142, 120]} to={[170, 120]} current={0.001} currentMax={0.005} />
      <LiveDiode x={290} y={80} current={0.015} vF={2.1} currentMax={0.02} />
      <LiveDiode x={290} y={130} current={0.015} vF={2.1} currentMax={0.02} />
      <LiveDiode x={290} y={180} current={0.015} vF={2.1} currentMax={0.02} />
      <LiveWire from={[240, 100]} to={[270, 80]} current={0.015} currentMax={0.02} />
      <LiveWire from={[240, 120]} to={[270, 130]} current={0.015} currentMax={0.02} />
      <LiveWire from={[240, 140]} to={[270, 180]} current={0.015} currentMax={0.02} />
      <text x={205} y={50} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        f ≈ {f.toFixed(0)} Hz (dice spin)
      </text>
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Chapter 5
 * -------------------------------------------------------------------------*/

// 24. Electromagnet — battery + switch + coil (with iron-core hint)
const sch24: SchematicRender = (v) => {
  const N = pick(v, 'N', 100);
  const I = pick(v, 'I', 0.5);
  return (
    <g>
      <LiveBattery x={80} y={140} voltage={9} />
      <LiveWire from={[110, 140]} to={[170, 140]} current={I} currentMax={2} />
      <LiveSwitch x={200} y={140} closed={true} />
      <LiveWire from={[230, 140]} to={[270, 140]} current={I} currentMax={2} />
      <LiveResistor x={290} y={140} value={10} current={I} powerMax={5} label="10Ω" />
      <LiveInductor x={350} y={140} inductance={0.001} current={I} currentMax={2} label={`${Math.round(N)} turns`} />
      <LiveWire from={[80, 200]} to={[380, 200]} current={I} currentMax={2} />
      <LiveWire from={[80, 140]} to={[80, 200]} current={I} currentMax={2} />
      <LiveWire from={[380, 140]} to={[380, 200]} current={I} currentMax={2} />
    </g>
  );
};

// 25. Faraday induction — coil + AC source (induced EMF) + load
const sch25: SchematicRender = (v) => {
  const N = pick(v, 'N', 1000);
  const dphi = pick(v, 'dPhi_dt', 0.0005);
  const emf = N * dphi;
  const I = emf / 50;
  return (
    <g>
      <LiveInductor x={150} y={140} inductance={0.01} current={I} currentMax={0.05} label={`${Math.round(N)} turns`} />
      <LiveWire from={[195, 140]} to={[260, 140]} current={I} currentMax={0.05} />
      <LiveDiode x={280} y={140} current={I} vF={1.8} currentMax={0.05} />
      <LiveWire from={[300, 140]} to={[340, 140]} current={I} currentMax={0.05} />
      <LiveResistor x={340} y={170} value={50} current={I} powerMax={0.05} orientation="vertical" label="coil R" />
      <LiveWire from={[340, 200]} to={[340, 220]} current={I} currentMax={0.05} />
      <LiveWire from={[105, 140]} to={[105, 220]} current={I} currentMax={0.05} />
      <LiveWire from={[105, 220]} to={[340, 220]} current={I} currentMax={0.05} />
      <text x={220} y={70} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        ε = N·dΦ/dt = {emf.toFixed(3)}V
      </text>
    </g>
  );
};

// 26. Speaker — AC source feeding voice coil (inductor) + Z
const sch26: SchematicRender = (v) => {
  const Z = pick(v, 'Z', 8);
  const V = pick(v, 'V', 2);
  const I = V / Math.max(Z, 0.1);
  return (
    <g>
      <LiveBattery x={70} y={140} voltage={V} label={`${V.toFixed(1)}V RMS`} />
      <LiveWire from={[100, 140]} to={[180, 140]} current={I} currentMax={2} />
      <LiveInductor x={220} y={140} inductance={0.001} current={I} currentMax={2} label="voice coil" />
      <LiveResistor x={290} y={140} value={Z} current={I} powerMax={1} label={`${Z.toFixed(0)}Ω`} />
      <LiveLamp x={360} y={140} current={I} resistance={Z} powerMax={1} label="cone" />
      <LiveWire from={[70, 200]} to={[360, 200]} current={I} currentMax={2} />
      <LiveWire from={[70, 140]} to={[70, 200]} current={I} currentMax={2} />
      <LiveWire from={[360, 160]} to={[360, 200]} current={I} currentMax={2} />
    </g>
  );
};

// 27. RL / LC reactance
const sch27: SchematicRender = (v) => {
  const L = pick(v, 'L', 0.01);
  const f = pick(v, 'f', 1000);
  const XL = 2 * Math.PI * f * L;
  const I = 5 / Math.max(XL + 1, 1);
  const C = 1e-7;
  return (
    <g>
      <LiveBattery x={70} y={140} voltage={5} />
      <LiveWire from={[100, 140]} to={[160, 140]} current={I} currentMax={0.05} />
      <LiveResistor x={200} y={140} value={100} current={I} powerMax={0.5} />
      <LiveInductor x={290} y={140} inductance={L} current={I} currentMax={0.05} />
      <LiveCapacitor x={290} y={190} capacitance={C} voltage={2.5} />
      <LiveWire from={[245, 140]} to={[245, 190]} current={I} currentMax={0.05} />
      <LiveWire from={[335, 140]} to={[335, 190]} current={I} currentMax={0.05} />
      <LiveWire from={[335, 190]} to={[335, 220]} current={I} currentMax={0.05} />
      <LiveWire from={[70, 220]} to={[335, 220]} current={I} currentMax={0.05} />
      <LiveWire from={[70, 140]} to={[70, 220]} current={I} currentMax={0.05} />
      <text x={200} y={70} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        X_L = 2π·f·L = {XL.toFixed(1)} Ω at {f.toFixed(0)} Hz
      </text>
    </g>
  );
};

// 28. Crystal radio — LC tank, diode detector, earphone (lamp stand-in)
const sch28: SchematicRender = (v) => {
  const L = pick(v, 'L', 0.00025);
  const C = pick(v, 'C', 0.0000002);
  const f = 1 / (2 * Math.PI * Math.sqrt(Math.max(L * C, 1e-20)));
  return (
    <g>
      <text x={90} y={70} fontSize={11} fill="currentColor" opacity={0.7}>
        ant
      </text>
      <LiveWire from={[90, 80]} to={[150, 140]} current={0.0001} currentMax={0.001} />
      <LiveInductor x={200} y={140} inductance={L} current={0.0001} currentMax={0.001} orientation="vertical" />
      <LiveCapacitor x={260} y={140} capacitance={C} voltage={0.5} orientation="vertical" />
      <LiveWire from={[200, 175]} to={[260, 175]} current={0} currentMax={0.001} />
      <LiveWire from={[200, 105]} to={[260, 105]} current={0} currentMax={0.001} />
      <LiveDiode x={310} y={105} current={0.0001} vF={0.2} currentMax={0.001} />
      <LiveWire from={[260, 105]} to={[290, 105]} current={0.0001} currentMax={0.001} />
      <LiveWire from={[330, 105]} to={[360, 105]} current={0.0001} currentMax={0.001} />
      <LiveLamp x={360} y={140} current={0.0001} resistance={10000} powerMax={0.001} label="earph" />
      <LiveWire from={[260, 175]} to={[360, 175]} current={0} currentMax={0.001} />
      <text x={90} y={220} fontSize={11} fill="currentColor" opacity={0.7}>
        gnd
      </text>
      <LiveWire from={[90, 200]} to={[90, 175]} current={0.0001} currentMax={0.001} />
      <LiveWire from={[90, 175]} to={[200, 175]} current={0.0001} currentMax={0.001} />
      <text x={250} y={50} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        f = {(f / 1000).toFixed(0)} kHz
      </text>
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Chapter 5 — Arduino (29-36). No primitives for a microcontroller; we depict
 * a labeled "MCU" box with one pin driving the relevant peripheral.
 * -------------------------------------------------------------------------*/

function McuBox({ x, y, label = 'Arduino', pin }: { x: number; y: number; label?: string; pin?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden="true">
      <rect x={-50} y={-40} width={100} height={80} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <text x={0} y={-4} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.85} fontFamily="monospace">
        {label}
      </text>
      {pin ? (
        <text x={0} y={12} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.7} fontFamily="monospace">
          {pin}
        </text>
      ) : null}
    </g>
  );
}

// 29. Blink — MCU pin 13 → R → LED → GND
const sch29: SchematicRender = (v) => {
  const ton = pick(v, 't_on', 1);
  const VP = pick(v, 'V_pin', 5);
  const VF = pick(v, 'V_LED', 2.1);
  const R = pick(v, 'R', 470);
  const I = Math.max(0, (VP - VF) / Math.max(R, 1));
  const lit = ton > 0;
  return (
    <g>
      <McuBox x={120} y={140} label="Arduino" pin="pin 13" />
      <LiveWire from={[170, 140]} to={[220, 140]} current={lit ? I : 0} currentMax={0.02} />
      <LiveResistor x={260} y={140} value={R} current={lit ? I : 0} powerMax={0.1} />
      <LiveWire from={[300, 140]} to={[330, 140]} current={lit ? I : 0} currentMax={0.02} />
      <LiveDiode x={350} y={140} current={lit ? I : 0} vF={VF} currentMax={0.02} />
      <LiveWire from={[370, 140]} to={[400, 140]} current={lit ? I : 0} currentMax={0.02} />
      <LiveWire from={[400, 140]} to={[400, 200]} current={lit ? I : 0} currentMax={0.02} />
      <LiveWire from={[120, 180]} to={[120, 200]} current={lit ? I : 0} currentMax={0.02} />
      <LiveWire from={[120, 200]} to={[400, 200]} current={lit ? I : 0} currentMax={0.02} />
    </g>
  );
};

// 30. Nicer dice — MCU → 4 LEDs
const sch30: SchematicRender = (v) => {
  const N = Math.round(pick(v, 'N', 2));
  return (
    <g>
      <McuBox x={110} y={120} label="Arduino" pin="pins 1-4" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <LiveWire
            from={[160, 100 + i * 14]}
            to={[230, 80 + i * 30]}
            current={i < N ? 0.015 : 0}
            currentMax={0.02}
          />
          <LiveResistor x={260} y={80 + i * 30} value={470} current={i < N ? 0.015 : 0} powerMax={0.1} />
          <LiveDiode x={320} y={80 + i * 30} current={i < N ? 0.015 : 0} vF={2.1} currentMax={0.02} />
          <LiveWire
            from={[340, 80 + i * 30]}
            to={[370, 80 + i * 30]}
            current={i < N ? 0.015 : 0}
            currentMax={0.02}
          />
        </g>
      ))}
      <LiveWire from={[370, 80]} to={[370, 170]} current={0.015} currentMax={0.05} />
      <LiveWire from={[110, 170]} to={[370, 170]} current={0.015} currentMax={0.05} />
    </g>
  );
};

// 31. Button toggles LED
const sch31: SchematicRender = (v) => {
  const t = pick(v, 't_bounce', 0.01);
  const tIgnore = pick(v, 't_ignore', 0.03);
  const debounced = tIgnore >= t;
  return (
    <g>
      <McuBox x={140} y={140} label="Arduino" pin="pin 2 / 13" />
      <LiveSwitch x={70} y={100} closed={debounced} label="btn" />
      <LiveWire from={[100, 100]} to={[100, 130]} current={0} currentMax={0.001} />
      <LiveWire from={[100, 130]} to={[140, 130]} current={0} currentMax={0.001} />
      <LiveWire from={[190, 130]} to={[230, 130]} current={debounced ? 0.015 : 0} currentMax={0.02} />
      <LiveResistor x={270} y={130} value={470} current={debounced ? 0.015 : 0} powerMax={0.1} />
      <LiveDiode x={330} y={130} current={debounced ? 0.015 : 0} vF={2.1} currentMax={0.02} />
      <LiveWire from={[350, 130]} to={[380, 130]} current={debounced ? 0.015 : 0} currentMax={0.02} />
      <LiveWire from={[70, 180]} to={[380, 180]} current={debounced ? 0.015 : 0} currentMax={0.02} />
      <LiveWire from={[70, 130]} to={[70, 180]} current={0} currentMax={0.001} />
      <LiveWire from={[380, 130]} to={[380, 180]} current={debounced ? 0.015 : 0} currentMax={0.02} />
    </g>
  );
};

// 32. Pot → ADC, PWM out → LED
const sch32: SchematicRender = (v) => {
  const raw = pick(v, 'raw', 512);
  const Vref = pick(v, 'V_ref', 5);
  const aw = pick(v, 'analogWrite', 128);
  const I = (aw / 255) * 0.015;
  return (
    <g>
      <McuBox x={200} y={130} label="Arduino" pin="A0 → ~9" />
      <LiveResistor x={70} y={130} value={10000} current={0} powerMax={0.001} label="pot 10k" orientation="vertical" />
      <LiveWire from={[70, 100]} to={[70, 80]} current={0} currentMax={0.001} />
      <LiveWire from={[70, 80]} to={[150, 80]} current={0} currentMax={0.001} />
      <LiveWire from={[70, 160]} to={[70, 200]} current={0} currentMax={0.001} />
      <LiveWire from={[70, 130]} to={[150, 130]} current={0} currentMax={0.001} />
      <LiveWire from={[250, 130]} to={[290, 130]} current={I} currentMax={0.02} />
      <LiveResistor x={320} y={130} value={220} current={I} powerMax={0.1} />
      <LiveDiode x={370} y={130} current={I} vF={2.1} currentMax={0.02} />
      <LiveWire from={[390, 130]} to={[410, 130]} current={I} currentMax={0.02} />
      <LiveWire from={[70, 200]} to={[410, 200]} current={I} currentMax={0.02} />
      <LiveWire from={[410, 130]} to={[410, 200]} current={I} currentMax={0.02} />
      <text x={250} y={50} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        ADC raw {Math.round(raw)} → Vref {Vref.toFixed(1)}V → PWM {Math.round(aw)}
      </text>
    </g>
  );
};

// 33. LDR voltage divider → MCU → LED
const sch33: SchematicRender = (v) => {
  const Rf = pick(v, 'R_fixed', 10000);
  const Rl = pick(v, 'R_LDR', 10000);
  const Vin = pick(v, 'V_in', 5);
  const Vout = (Vin * Rf) / (Rf + Rl);
  const dark = Vout > Vin * 0.5;
  return (
    <g>
      <LiveResistor x={70} y={100} value={Rf} current={Vin / (Rf + Rl)} powerMax={0.01} orientation="vertical" label="10k" />
      <LiveResistor x={70} y={170} value={Rl} current={Vin / (Rf + Rl)} powerMax={0.01} orientation="vertical" label="LDR" />
      <McuBox x={200} y={140} label="Arduino" pin="A0 → 13" />
      <LiveWire from={[70, 130]} to={[150, 130]} current={0} currentMax={0.001} />
      <LiveWire from={[70, 70]} to={[70, 80]} current={0} currentMax={0.001} />
      <LiveWire from={[70, 200]} to={[70, 220]} current={0} currentMax={0.001} />
      <LiveWire from={[250, 140]} to={[290, 140]} current={dark ? 0.015 : 0} currentMax={0.02} />
      <LiveResistor x={320} y={140} value={470} current={dark ? 0.015 : 0} powerMax={0.1} />
      <LiveDiode x={370} y={140} current={dark ? 0.015 : 0} vF={2.1} currentMax={0.02} />
      <LiveWire from={[390, 140]} to={[410, 140]} current={dark ? 0.015 : 0} currentMax={0.02} />
      <LiveWire from={[70, 220]} to={[410, 220]} current={dark ? 0.015 : 0} currentMax={0.02} />
      <LiveWire from={[410, 140]} to={[410, 220]} current={dark ? 0.015 : 0} currentMax={0.02} />
    </g>
  );
};

// 34. Tones — MCU pin 8 → R → speaker
const sch34: SchematicRender = (v) => {
  const f = pick(v, 'f', 440);
  return (
    <g>
      <McuBox x={120} y={140} label="Arduino" pin="pin 8" />
      <LiveWire from={[170, 140]} to={[210, 140]} current={0.01} currentMax={0.05} />
      <LiveResistor x={250} y={140} value={100} current={0.01} powerMax={0.05} />
      <LiveLamp x={330} y={140} current={0.03} resistance={8} powerMax={0.1} label="piezo" />
      <LiveWire from={[290, 140]} to={[300, 140]} current={0.01} currentMax={0.05} />
      <LiveWire from={[120, 180]} to={[120, 200]} current={0.01} currentMax={0.05} />
      <LiveWire from={[120, 200]} to={[330, 200]} current={0.01} currentMax={0.05} />
      <LiveWire from={[330, 160]} to={[330, 200]} current={0.01} currentMax={0.05} />
      <text x={250} y={70} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        tone({f.toFixed(0)} Hz)
      </text>
    </g>
  );
};

// 35. Serial — MCU with arrows to/from host. Use static depiction.
const sch35: SchematicRender = (v) => {
  const baud = pick(v, 'baud', 9600);
  const Bps = baud / 10;
  return (
    <g>
      <McuBox x={150} y={140} label="Arduino" pin="USB" />
      <rect x={300} y={100} width={90} height={80} fill="none" stroke="currentColor" strokeWidth={1.2} />
      <text x={345} y={144} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.85} fontFamily="monospace">
        host PC
      </text>
      <LiveWire from={[200, 130]} to={[300, 130]} current={0.001} currentMax={0.005} />
      <LiveWire from={[300, 160]} to={[200, 160]} current={0.001} currentMax={0.005} />
      <text x={250} y={120} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        TX →
      </text>
      <text x={250} y={180} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        ← RX
      </text>
      <text x={250} y={60} fontSize={11} fill="currentColor" opacity={0.7} textAnchor="middle">
        {baud.toFixed(0)} baud ≈ {Bps.toFixed(0)} B/s
      </text>
    </g>
  );
};

// 36. Capstone — MCU + LDR + LED + piezo + button (compact)
const sch36: SchematicRender = (v) => {
  const adc = pick(v, 'adc', 500);
  const pwm = 255 - Math.round((adc / 1023) * 255);
  const I = (pwm / 255) * 0.015;
  return (
    <g>
      <McuBox x={200} y={130} label="Arduino" pin="A0 ~9 8 2" />
      {/* LDR top */}
      <LiveResistor x={70} y={90} value={10000} current={0} powerMax={0.01} orientation="vertical" label="LDR" />
      <LiveWire from={[70, 120]} to={[150, 120]} current={0} currentMax={0.001} />
      {/* LED right */}
      <LiveResistor x={300} y={90} value={220} current={I} powerMax={0.1} />
      <LiveDiode x={360} y={90} current={I} vF={2.1} currentMax={0.02} />
      <LiveWire from={[250, 110]} to={[280, 90]} current={I} currentMax={0.02} />
      <LiveWire from={[380, 90]} to={[400, 90]} current={I} currentMax={0.02} />
      {/* piezo bottom */}
      <LiveLamp x={360} y={170} current={0.005} resistance={8} powerMax={0.05} label="piezo" />
      <LiveWire from={[250, 150]} to={[330, 170]} current={0.005} currentMax={0.02} />
      {/* button bottom-left */}
      <LiveSwitch x={70} y={180} closed={false} label="btn" />
      <LiveWire from={[100, 180]} to={[150, 150]} current={0} currentMax={0.001} />
      <LiveWire from={[40, 180]} to={[40, 220]} current={0} currentMax={0.001} />
      <LiveWire from={[40, 220]} to={[400, 220]} current={I} currentMax={0.02} />
      <LiveWire from={[400, 90]} to={[400, 220]} current={I} currentMax={0.02} />
      <LiveWire from={[380, 170]} to={[400, 220]} current={0.005} currentMax={0.02} />
      <text x={250} y={50} fontSize={10} fill="currentColor" opacity={0.7} textAnchor="middle">
        ADC {Math.round(adc)} → PWM {pwm}
      </text>
    </g>
  );
};

/* ---------------------------------------------------------------------------
 * Registry
 * -------------------------------------------------------------------------*/

const SCHEMATICS: Record<number, SchematicRender> = {
  1: sch1, 2: sch2, 3: sch3, 4: sch4, 5: sch5,
  6: sch6, 7: sch7, 8: sch8, 9: sch9, 10: sch10, 11: sch11,
  12: sch12, 13: sch13, 14: sch14,
  15: sch15, 16: sch16, 17: sch17, 18: sch18, 19: sch19,
  20: sch20, 21: sch21, 22: sch22, 23: sch23,
  24: sch24, 25: sch25, 26: sch26, 27: sch27, 28: sch28,
  29: sch29, 30: sch30, 31: sch31, 32: sch32, 33: sch33,
  34: sch34, 35: sch35, 36: sch36,
};

export function getExperimentSchematic(briefNumber: number): SchematicRender | undefined {
  return SCHEMATICS[briefNumber];
}

export function getAllExperimentSchematics(): Record<number, SchematicRender> {
  return SCHEMATICS;
}

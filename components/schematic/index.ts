/**
 * LiveSchematic primitive library.
 *
 * Inline-SVG, no runtime dependencies. Each primitive returns an SVG <g> group
 * intended to be composed inside an ExperimentSchematic's <svg>. Values flow
 * from a FormulaSlider's variable state; the schematic VISUALIZES that state,
 * it does not simulate.
 *
 * See `.project-memory/entities/LiveSchematic.md` for design intent.
 */

export { LiveWire } from './LiveWire';
export type { LiveWireProps } from './LiveWire';
export { LiveResistor } from './LiveResistor';
export type { LiveResistorProps } from './LiveResistor';
export { LiveCapacitor } from './LiveCapacitor';
export type { LiveCapacitorProps } from './LiveCapacitor';
export { LiveInductor } from './LiveInductor';
export type { LiveInductorProps } from './LiveInductor';
export { LiveDiode } from './LiveDiode';
export type { LiveDiodeProps } from './LiveDiode';
export { LiveTransistor } from './LiveTransistor';
export type { LiveTransistorProps } from './LiveTransistor';
export { LiveGate, computeGate } from './LiveGate';
export type { LiveGateProps, GateKind } from './LiveGate';
export { LiveBattery } from './LiveBattery';
export type { LiveBatteryProps } from './LiveBattery';
export { LiveLamp } from './LiveLamp';
export type { LiveLampProps } from './LiveLamp';
export { LiveSwitch } from './LiveSwitch';
export type { LiveSwitchProps } from './LiveSwitch';
export { ExperimentSchematic } from './ExperimentSchematic';
export type { ExperimentSchematicProps } from './ExperimentSchematic';

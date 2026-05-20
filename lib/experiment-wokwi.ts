/**
 * Per-experiment Wokwi project-id registry.
 *
 * Wokwi is the on-internet Arduino/embedded simulator (an explicit documented
 * exception to the offline-first rule per CLAUDE.md). Briefs 29-36 each link to
 * a public Wokwi project URL of the shape https://wokwi.com/projects/<id>.
 *
 * Each entry is annotated with a confidence note. "exact" = a curated public
 * project that closely matches the brief; "near" = a generic Wokwi starter
 * that demonstrates the same concept but with cosmetic differences (different
 * pin choice, additional features, etc.) — operator may wish to fork-and-edit
 * before shipping for real.
 *
 * Project IDs below are well-known public Wokwi templates. If a specific ID
 * is unavailable in the operator's account, they can fork the closest
 * official Wokwi starter and swap in the right project id here.
 */

export type WokwiEntry = {
  projectId: string;
  /** "exact" if the linked project matches the brief; "near" otherwise. */
  match: 'exact' | 'near';
  /** Short note on why this project was chosen / what to look out for. */
  note?: string;
};

const WOKWI: Record<number, WokwiEntry | null> = {
  // 1-28 are analog briefs handled by CircuitJS — no Wokwi entry.
  1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null,
  9: null, 10: null, 11: null, 12: null, 13: null, 14: null, 15: null,
  16: null, 17: null, 18: null, 19: null, 20: null, 21: null, 22: null,
  23: null, 24: null, 25: null, 26: null, 27: null, 28: null,

  // 29. Hardware Meets Software — canonical blink sketch.
  29: {
    projectId: 'arduino-blink',
    match: 'exact',
    note: 'Classic on-board LED blink; the universal Arduino starter project.',
  },
  // 30. Nicer Dice — 7 LEDs + button on an Uno. No widely-known canonical;
  //     fall back to a generic 'led-array' starter and note the gap.
  30: {
    projectId: 'arduino-led-array',
    match: 'near',
    note: 'Generic LED-array template; learner adapts to die-face mapping. Operator may fork into a dedicated dice project.',
  },
  // 31. Reading a Button — button-toggles-LED. Canonical Arduino lesson 2.
  31: {
    projectId: 'arduino-button-led',
    match: 'exact',
    note: 'Tactile button toggling an LED via INPUT_PULLUP — exactly the brief.',
  },
  // 32. Analog Input — potentiometer dims an LED via PWM. Canonical lesson 3.
  32: {
    projectId: 'arduino-potentiometer-led',
    match: 'exact',
    note: 'Pot on A0, analogRead→analogWrite to PWM pin. Wokwi starter.',
  },
  // 33. Sensing Light — LDR + threshold + LED.
  33: {
    projectId: 'arduino-photoresistor',
    match: 'near',
    note: 'Photoresistor reading; learner adds the threshold + hysteresis logic.',
  },
  // 34. Tones and Music — piezo + tone() + melody.
  34: {
    projectId: 'arduino-melody',
    match: 'near',
    note: 'Wokwi buzzer melody sketch — exact name may vary; closest public template.',
  },
  // 35. Serial Communication — Serial.print + monitor.
  35: {
    projectId: 'arduino-serial-monitor',
    match: 'near',
    note: 'Generic serial-print example; Wokwi has a built-in monitor pane.',
  },
  // 36. Capstone — multi-peripheral integration. No canonical starter; suggest
  //     building from the photoresistor template.
  36: {
    projectId: 'arduino-photoresistor',
    match: 'near',
    note: 'Capstone integrates LDR + LED + piezo + button; no public exact match. Operator should fork and add the extra peripherals.',
  },
};

export function getExperimentWokwi(briefNumber: number): WokwiEntry | null {
  return WOKWI[briefNumber] ?? null;
}

export function getAllExperimentWokwi(): Record<number, WokwiEntry | null> {
  return WOKWI;
}

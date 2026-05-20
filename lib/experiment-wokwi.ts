/**
 * Per-experiment Wokwi project-id registry.
 *
 * Wokwi is the on-internet Arduino/embedded simulator (an explicit documented
 * exception to the offline-first rule per CLAUDE.md). Briefs 29-36 each link to
 * a public Wokwi project URL of the shape https://wokwi.com/projects/<id>.
 *
 * **OPERATOR-PROVIDED IDS REQUIRED.** The slugs below (e.g., `arduino-blink`) are
 * placeholders chosen for readability — Wokwi's public-project URLs use opaque
 * numeric IDs (~18 digits), so these placeholders will 404 until the operator
 * either: (a) creates a public Wokwi project for each experiment and pastes
 * the numeric ID here, or (b) finds a canonical community project to point at.
 * Until then, WokwiEmbed will show the offline-fallback card with a backup
 * link — the site still functions, just without a live embed for Ch5.
 *
 * All entries are marked `match: 'placeholder'` to make the UI's confidence
 * honest. Operator workflow:
 *   1. Open https://wokwi.com/projects/new, build the project for one brief
 *   2. Click "Share" → "Make Public" → copy the numeric ID from the URL
 *   3. Replace the slug here, change match to 'verified'
 */

export type WokwiEntry = {
  projectId: string;
  /** 'placeholder' = slug not yet verified to resolve; 'verified' = operator confirmed public numeric ID. */
  match: 'placeholder' | 'verified';
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
    match: 'placeholder',
    note: 'Classic on-board LED blink; the universal Arduino starter project.',
  },
  // 30. Nicer Dice — 7 LEDs + button on an Uno. No widely-known canonical;
  //     fall back to a generic 'led-array' starter and note the gap.
  30: {
    projectId: 'arduino-led-array',
    match: 'placeholder',
    note: 'Generic LED-array template; learner adapts to die-face mapping. Operator may fork into a dedicated dice project.',
  },
  // 31. Reading a Button — button-toggles-LED. Canonical Arduino lesson 2.
  31: {
    projectId: 'arduino-button-led',
    match: 'placeholder',
    note: 'Tactile button toggling an LED via INPUT_PULLUP — exactly the brief.',
  },
  // 32. Analog Input — potentiometer dims an LED via PWM. Canonical lesson 3.
  32: {
    projectId: 'arduino-potentiometer-led',
    match: 'placeholder',
    note: 'Pot on A0, analogRead→analogWrite to PWM pin. Wokwi starter.',
  },
  // 33. Sensing Light — LDR + threshold + LED.
  33: {
    projectId: 'arduino-photoresistor',
    match: 'placeholder',
    note: 'Photoresistor reading; learner adds the threshold + hysteresis logic.',
  },
  // 34. Tones and Music — piezo + tone() + melody.
  34: {
    projectId: 'arduino-melody',
    match: 'placeholder',
    note: 'Wokwi buzzer melody sketch — exact name may vary; closest public template.',
  },
  // 35. Serial Communication — Serial.print + monitor.
  35: {
    projectId: 'arduino-serial-monitor',
    match: 'placeholder',
    note: 'Generic serial-print example; Wokwi has a built-in monitor pane.',
  },
  // 36. Capstone — multi-peripheral integration. No canonical starter; suggest
  //     building from the photoresistor template.
  36: {
    projectId: 'arduino-photoresistor',
    match: 'placeholder',
    note: 'Capstone integrates LDR + LED + piezo + button; no public exact match. Operator should fork and add the extra peripherals.',
  },
};

export function getExperimentWokwi(briefNumber: number): WokwiEntry | null {
  return WOKWI[briefNumber] ?? null;
}

export function getAllExperimentWokwi(): Record<number, WokwiEntry | null> {
  return WOKWI;
}

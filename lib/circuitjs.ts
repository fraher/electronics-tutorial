/**
 * Helpers for embedding the vendored CircuitJS simulator.
 *
 * The vendor lives at /circuitjs/circuitjs.html (see scripts/vendor-circuitjs.sh).
 * CircuitJS reads three useful query parameters from `window.location.search`
 * (verified against pfalstad/circuitjs1 CirSim.java QueryParameters):
 *
 *   - cct           — raw circuit-file text (CircuitJS text format).
 *                     The simulator literally calls `cct.replace("%24", "$")`,
 *                     so `$` chars must survive URL-encoding as `%24`.
 *   - ctz           — lz-string-compressed circuit text (base64-ish). Used by
 *                     "Export As Link" in the simulator UI. Shorter URLs.
 *   - startCircuit  — name of a built-in example circuit (looked up in the
 *                     simulator's setupList; only useful if we vendor the
 *                     example circuits too — currently empty).
 *
 * We only implement the `cct` form here; `ctz` would require shipping the
 * lz-string compressor at build time, which we don't need yet.
 */

/** Where the vendored simulator lives, relative to the static-export root. */
export const CIRCUITJS_BASE = '/circuitjs/circuitjs.html';

/**
 * Build a URL that opens CircuitJS preloaded with the given circuit-file text.
 *
 * @param circuitCir Raw CircuitJS-format circuit text (the same content you
 *   would paste into File → Import From Text). Multi-line is fine.
 * @returns Absolute path + query string, e.g. `/circuitjs/circuitjs.html?cct=...`.
 *   Suitable as an <iframe src=...> in a static export.
 *
 * Pass `circuitCir === ''` (or just call `CIRCUITJS_BASE`) to open the
 * simulator empty.
 */
export function circuitJsUrl(circuitCir: string): string {
  if (!circuitCir) return CIRCUITJS_BASE;
  // encodeURIComponent already escapes `$` → `%24`, which CircuitJS expects
  // (see CirSim.java: `startCircuitText = cct.replace("%24", "$")`).
  return `${CIRCUITJS_BASE}?cct=${encodeURIComponent(circuitCir)}`;
}

// TODO: add circuitJsCompressedUrl(circuitCir) using lz-string once we want
// shorter iframe URLs (the `ctz` param). The lz-string compressor would have
// to be bundled at build time — see public/circuitjs/lz-string.min.js for the
// runtime decoder.

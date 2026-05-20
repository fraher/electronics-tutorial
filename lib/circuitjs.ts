/**
 * Helpers for embedding the vendored CircuitJS simulator.
 *
 * The vendor lives at /circuitjs/circuitjs.html (see scripts/vendor-circuitjs.sh).
 * CircuitJS reads three useful query parameters from `window.location.search`
 * (verified against pfalstad/circuitjs1 CirSim.java QueryParameters):
 *
 *   - cct                — raw circuit-file text (CircuitJS text format).
 *                          The simulator literally calls `cct.replace("%24", "$")`,
 *                          so `$` chars must survive URL-encoding as `%24`.
 *   - ctz                — lz-string-compressed circuit text (base64-ish). Used
 *                          by "Export As Link" in the simulator UI. Shorter URLs.
 *                          Caller must produce the compressed payload (we don't
 *                          ship lz-string in the build pipeline yet).
 *   - startCircuitLink   — relative path to a built-in circuit file shipped in
 *                          the vendored `circuits/` tree (e.g.
 *                          `examples/circuits/basics/rc-circuit.txt`).
 *                          Looked up via the simulator's loadFileFromURL path.
 *
 * The trio is mutually exclusive — only one query parameter takes effect per
 * load. If multiple are passed, CircuitJS picks `cct` > `ctz` > `startCircuitLink`.
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

/**
 * Build a URL that opens CircuitJS with a pre-compressed lz-string payload.
 *
 * Callers are responsible for producing `compressed` via lz-string's
 * `compressToEncodedURIComponent`; this helper just stitches the URL. Useful
 * for circuits whose raw text would otherwise blow past iframe URL limits.
 */
export function circuitJsCompressedUrl(compressed: string): string {
  if (!compressed) return CIRCUITJS_BASE;
  return `${CIRCUITJS_BASE}?ctz=${compressed}`;
}

/**
 * Build a URL that opens CircuitJS pointing at a built-in example circuit
 * shipped under `public/circuitjs/` in the vendor tree.
 *
 * @param relativePath Path relative to the vendor root (no leading slash),
 *   e.g. `examples/circuits/basics/rc-circuit.txt`. The simulator fetches it
 *   over XHR — must be same-origin.
 */
export function circuitJsBuiltinUrl(relativePath: string): string {
  if (!relativePath) return CIRCUITJS_BASE;
  const cleaned = relativePath.replace(/^\/+/, '');
  return `${CIRCUITJS_BASE}?startCircuitLink=${encodeURIComponent(cleaned)}`;
}

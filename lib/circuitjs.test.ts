import { describe, it, expect } from 'vitest';
import {
  CIRCUITJS_BASE,
  circuitJsUrl,
  circuitJsCompressedUrl,
  circuitJsBuiltinUrl,
} from './circuitjs';

describe('circuitjs URL builders', () => {
  it('circuitJsUrl returns the bare base when given empty input', () => {
    expect(circuitJsUrl('')).toBe(CIRCUITJS_BASE);
  });

  it('circuitJsUrl encodes $ as %24 so CircuitJS unrolls it correctly', () => {
    const url = circuitJsUrl('$ 1 0.000005\nr 0 0 100 0 0 1000');
    expect(url.startsWith(`${CIRCUITJS_BASE}?cct=`)).toBe(true);
    expect(url).toContain('%24');
  });

  it('circuitJsCompressedUrl emits ?ctz=<payload>', () => {
    expect(circuitJsCompressedUrl('')).toBe(CIRCUITJS_BASE);
    expect(circuitJsCompressedUrl('abc123')).toBe(`${CIRCUITJS_BASE}?ctz=abc123`);
  });

  it('circuitJsBuiltinUrl emits ?startCircuitLink=<encoded path>', () => {
    expect(circuitJsBuiltinUrl('')).toBe(CIRCUITJS_BASE);
    const u = circuitJsBuiltinUrl('examples/circuits/basics/rc-circuit.txt');
    expect(u).toBe(
      `${CIRCUITJS_BASE}?startCircuitLink=${encodeURIComponent(
        'examples/circuits/basics/rc-circuit.txt',
      )}`,
    );
  });

  it('circuitJsBuiltinUrl strips a leading slash', () => {
    const u = circuitJsBuiltinUrl('/examples/foo.txt');
    expect(u).toBe(`${CIRCUITJS_BASE}?startCircuitLink=${encodeURIComponent('examples/foo.txt')}`);
  });
});

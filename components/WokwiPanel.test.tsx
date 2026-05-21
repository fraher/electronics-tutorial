import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WokwiPanel, _tokenizeForTest } from './WokwiPanel';

const SAMPLE_SKETCH = `// blink demo
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
}`;

describe('WokwiPanel', () => {
  it('renders screenshot image with alt text', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet="LED on\nLED off"
      />,
    );
    const img = screen.getByRole('img', { name: /Blink/i });
    expect(img.getAttribute('src')).toBe('/wokwi-captures/exp-29/screenshot.png');
  });

  it('renders the sketch source inside a code block', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet=""
      />,
    );
    const code = screen.getByTestId('wokwi-panel-sketch');
    expect(code.textContent).toContain('void setup()');
    expect(code.textContent).toContain('digitalWrite(LED_BUILTIN, HIGH)');
  });

  it('renders the serial snippet when provided', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet="line A\nline B"
      />,
    );
    const serial = screen.getByTestId('wokwi-panel-serial');
    expect(serial.textContent).toContain('line A');
    expect(serial.textContent).toContain('line B');
  });

  it('omits the serial section when serialSnippet is empty', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet=""
      />,
    );
    expect(screen.queryByTestId('wokwi-panel-serial')).toBeNull();
  });

  it('renders an open-in-wokwi link with target=_blank when href is set', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet=""
        openInWokwiHref="https://wokwi.com/projects/new/arduino-uno"
      />,
    );
    const link = screen.getByTestId('wokwi-panel-open-link') as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://wokwi.com/projects/new/arduino-uno');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(link.getAttribute('aria-label')).toMatch(/Open Blink in Wokwi/i);
  });

  it('omits the open-in-wokwi link when href is unset', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet=""
      />,
    );
    expect(screen.queryByTestId('wokwi-panel-open-link')).toBeNull();
  });

  it('shows the ONLINE badge as a visual cue', () => {
    render(
      <WokwiPanel
        briefNumber={29}
        title="Blink"
        sketch={SAMPLE_SKETCH}
        screenshotPath="/wokwi-captures/exp-29/screenshot.png"
        serialSnippet=""
      />,
    );
    expect(screen.getByTestId('wokwi-panel-online-badge').textContent).toMatch(/online/i);
  });
});

describe('WokwiPanel highlighter', () => {
  it('classifies keywords, types, builtins, and comments', () => {
    const tokens = _tokenizeForTest('// hello\nvoid setup() { Serial.begin(9600); }');
    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toContain('comment');
    expect(kinds).toContain('type');     // void
    expect(kinds).toContain('function'); // setup, begin
    expect(kinds).toContain('builtin');  // Serial
    expect(kinds).toContain('number');   // 9600
  });

  it('handles string literals and preprocessor lines', () => {
    const tokens = _tokenizeForTest('#define X 1\nSerial.println("hi");');
    expect(tokens.find((t) => t.kind === 'preproc')).toBeTruthy();
    expect(tokens.find((t) => t.kind === 'string' && t.text === '"hi"')).toBeTruthy();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const SAMPLE_DIAGRAM = `{
  "version": 1,
  "parts": [
    { "type": "wokwi-arduino-uno", "id": "uno" }
  ],
  "connections": []
}`;

function basicProps(overrides: Partial<React.ComponentProps<typeof WokwiPanel>> = {}) {
  return {
    briefNumber: 29,
    title: 'Blink',
    sketch: SAMPLE_SKETCH,
    diagram: SAMPLE_DIAGRAM,
    screenshotPath: '/wokwi-captures/exp-29/screenshot.png',
    serialSnippet: '',
    ...overrides,
  };
}

describe('WokwiPanel', () => {
  it('renders screenshot image with alt text', () => {
    render(<WokwiPanel {...basicProps()} />);
    const img = screen.getByRole('img', { name: /Blink/i });
    expect(img.getAttribute('src')).toBe('/wokwi-captures/exp-29/screenshot.png');
  });

  it('renders the sketch source by default (sketch tab active)', () => {
    render(<WokwiPanel {...basicProps()} />);
    const code = screen.getByTestId('wokwi-panel-sketch');
    expect(code.textContent).toContain('void setup()');
    expect(code.textContent).toContain('digitalWrite(LED_BUILTIN, HIGH)');
  });

  it('switches to the diagram tab when clicked', () => {
    render(<WokwiPanel {...basicProps()} />);
    fireEvent.click(screen.getByTestId('wokwi-panel-tab-diagram'));
    const code = screen.getByTestId('wokwi-panel-diagram');
    expect(code.textContent).toContain('wokwi-arduino-uno');
  });

  it('renders the serial snippet when provided', () => {
    render(<WokwiPanel {...basicProps({ serialSnippet: 'line A\nline B' })} />);
    const serial = screen.getByTestId('wokwi-panel-serial');
    expect(serial.textContent).toContain('line A');
    expect(serial.textContent).toContain('line B');
  });

  it('omits the serial section when serialSnippet is empty', () => {
    render(<WokwiPanel {...basicProps()} />);
    expect(screen.queryByTestId('wokwi-panel-serial')).toBeNull();
  });

  it('renders Open-Wokwi link with target=_blank — always, even without custom href', () => {
    render(<WokwiPanel {...basicProps()} />);
    const link = screen.getByTestId('wokwi-panel-open-link') as HTMLAnchorElement;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://wokwi.com/projects/new/arduino-uno');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  });

  it('respects a custom openInWokwiHref when provided', () => {
    render(
      <WokwiPanel
        {...basicProps({
          openInWokwiHref: 'https://wokwi.com/projects/123456789',
        })}
      />,
    );
    const link = screen.getByTestId('wokwi-panel-open-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://wokwi.com/projects/123456789');
  });

  it('shows the ONLINE badge as a visual cue', () => {
    render(<WokwiPanel {...basicProps()} />);
    expect(screen.getByTestId('wokwi-panel-online-badge').textContent).toMatch(/online/i);
  });

  it('Copy diagram button writes the diagram source to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<WokwiPanel {...basicProps()} />);
    fireEvent.click(screen.getByTestId('wokwi-panel-copy-diagram'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SAMPLE_DIAGRAM));
  });

  it('Copy sketch button writes the sketch source to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<WokwiPanel {...basicProps()} />);
    fireEvent.click(screen.getByTestId('wokwi-panel-copy-sketch'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SAMPLE_SKETCH));
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

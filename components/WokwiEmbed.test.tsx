import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { WokwiEmbed } from './WokwiEmbed';

function setOnlineStatus(value: boolean) {
  Object.defineProperty(navigator, 'onLine', {
    configurable: true,
    get: () => value,
  });
}

describe('WokwiEmbed', () => {
  beforeEach(() => {
    setOnlineStatus(true);
  });

  afterEach(() => {
    setOnlineStatus(true);
  });

  it('renders iframe with wokwi URL when online', () => {
    const { container } = render(
      <WokwiEmbed projectId="abc-xyz-123" title="Blink demo" />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute('src')).toBe('https://wokwi.com/projects/abc-xyz-123/embed');
  });

  it('uses a custom url when provided', () => {
    const { container } = render(
      <WokwiEmbed url="https://wokwi.com/projects/something-custom/embed" title="x" />,
    );
    const iframe = container.querySelector('iframe')!;
    expect(iframe.getAttribute('src')).toBe('https://wokwi.com/projects/something-custom/embed');
  });

  it('renders the offline fallback when navigator.onLine is false', () => {
    setOnlineStatus(false);
    render(<WokwiEmbed projectId="abc-xyz-123" title="Blink demo" />);
    expect(screen.getByTestId('wokwi-offline-fallback')).toBeInTheDocument();
    expect(screen.getByText(/internet connection/i)).toBeInTheDocument();
    // Fallback includes a link to the project page on wokwi.com
    const link = screen.getByRole('link', { name: /wokwi\.com/i });
    expect(link.getAttribute('href')).toBe('https://wokwi.com/projects/abc-xyz-123');
  });

  it('toggles between iframe and fallback on online/offline events', () => {
    setOnlineStatus(true);
    render(<WokwiEmbed projectId="abc-xyz-123" title="Blink demo" />);
    expect(document.querySelector('iframe')).not.toBeNull();

    act(() => {
      setOnlineStatus(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByTestId('wokwi-offline-fallback')).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();

    act(() => {
      setOnlineStatus(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(document.querySelector('iframe')).not.toBeNull();
  });

  it('shows the ONLINE badge when the iframe is mounted', () => {
    render(<WokwiEmbed projectId="abc-xyz-123" title="x" />);
    expect(screen.getByTestId('wokwi-online-badge')).toBeInTheDocument();
  });

  it('uses sandbox with allow-scripts, allow-same-origin, allow-popups', () => {
    const { container } = render(<WokwiEmbed projectId="abc-xyz-123" title="x" />);
    const iframe = container.querySelector('iframe')!;
    const sandbox = iframe.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).toContain('allow-popups');
  });
});

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type WokwiEmbedProps = {
  /** Wokwi project id, e.g. "abc-xyz-123". Renders the canonical embed URL. */
  projectId?: string;
  /** Full custom URL. Wins over projectId when both are provided. */
  url?: string;
  title: string;
  /** iframe pixel height. Default 480. */
  height?: number;
  caption?: string;
  className?: string;
};

function wokwiEmbedUrl(projectId: string): string {
  return `https://wokwi.com/projects/${projectId}/embed`;
}

function wokwiProjectUrl(projectId: string): string {
  return `https://wokwi.com/projects/${projectId}`;
}

export function WokwiEmbed({
  projectId,
  url,
  title,
  height = 480,
  caption,
  className,
}: WokwiEmbedProps) {
  const [online, setOnline] = React.useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true; // SSR: assume online
    return navigator.onLine !== false;
  });

  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine !== false);
    // Also re-sync once mounted in case SSR snapshot diverged.
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const src = url ?? (projectId ? wokwiEmbedUrl(projectId) : undefined);
  const backupHref = projectId ? wokwiProjectUrl(projectId) : url;

  return (
    <figure className={cn('space-y-2', className)}>
      <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow"
          data-testid="wokwi-online-badge"
        >
          ONLINE
        </span>

        {online && src ? (
          <iframe
            src={src}
            title={title}
            aria-label={title}
            width="100%"
            height={height}
            style={{ height, width: '100%', border: 0, display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-popups"
            loading="lazy"
          />
        ) : (
          <div
            role="status"
            data-testid="wokwi-offline-fallback"
            className="flex flex-col items-start gap-2 p-6 text-sm"
            style={{ minHeight: height }}
          >
            <h3 className="text-base font-semibold">Internet required for this experiment</h3>
            <p className="text-muted-foreground">
              This Arduino experiment requires an internet connection. Wokwi is the one
              documented online dependency in this tutorial. Connect to load the interactive
              simulator.
            </p>
            {backupHref ? (
              <a
                className="text-primary underline underline-offset-4"
                href={backupHref}
                target="_blank"
                rel="noreferrer"
              >
                Open this project on wokwi.com
              </a>
            ) : null}
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

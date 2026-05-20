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
  /** When true, suppress the iframe and show a "set up your own Wokwi project" card instead.
   *  Wokwi public projects use opaque numeric IDs; placeholder slugs won't resolve. */
  placeholder?: boolean;
  /** Optional sketch hint shown in the placeholder card (e.g., "Blink the on-board LED"). */
  sketchHint?: string;
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
  placeholder,
  sketchHint,
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

  // Placeholder mode: registry holds an unverified slug. Surface a clear
  // setup card instead of a 404-ing iframe.
  if (placeholder) {
    return (
      <figure className={cn('space-y-2', className)}>
        <div
          role="status"
          data-testid="wokwi-placeholder-card"
          className="flex flex-col items-start gap-3 rounded-lg border-2 border-dashed bg-card p-6 text-sm"
          style={{ minHeight: height }}
        >
          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            BUILD YOUR OWN
          </span>
          <h3 className="text-base font-semibold">{title}</h3>
          {sketchHint ? (
            <p className="text-muted-foreground">{sketchHint}</p>
          ) : null}
          <p className="text-muted-foreground">
            This Arduino experiment doesn{'’'}t ship a hosted Wokwi project yet. Build it
            yourself in three steps:
          </p>
          <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
            <li>
              Open <a className="text-primary underline" href="https://wokwi.com/projects/new/arduino-uno" target="_blank" rel="noreferrer">a new Wokwi Arduino project</a>
            </li>
            <li>Build the circuit + sketch matching the schematic above</li>
            <li>Hit ▶ Start to see it run</li>
          </ol>
        </div>
      </figure>
    );
  }

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

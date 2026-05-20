'use client';

import * as React from 'react';
import { circuitJsUrl, CIRCUITJS_BASE } from '@/lib/circuitjs';
import { cn } from '@/lib/utils';

export type CircuitEmbedProps = {
  /** Raw CircuitJS-format text. Omit to open the simulator empty. */
  circuit?: string;
  title?: string;
  /** iframe pixel height. Default 480. */
  height?: number;
  caption?: string;
  className?: string;
};

export function CircuitEmbed({
  circuit,
  title,
  height = 480,
  caption,
  className,
}: CircuitEmbedProps) {
  const src = circuit ? circuitJsUrl(circuit) : CIRCUITJS_BASE;
  const label = title ?? 'Editable CircuitJS simulator';
  return (
    <figure className={cn('space-y-2', className)}>
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <iframe
          src={src}
          title={label}
          aria-label={label}
          width="100%"
          height={height}
          style={{ height, width: '100%', border: 0, display: 'block' }}
          // CircuitJS is a GWT app running JS on the same origin; both flags are required.
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      </div>
      {caption ? (
        <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

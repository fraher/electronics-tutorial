'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const STORAGE_KEY = 'me3e:last-visited-experiment';

export type LastVisited = {
  number: number;
  chapter: number;
  title: string;
  href: string;
  at: number;
};

export function recordLastVisited(v: Omit<LastVisited, 'at'>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...v, at: Date.now() } as LastVisited),
    );
  } catch {
    /* private mode / quota — ignore */
  }
}

export function ContinueCard({
  fallbackHref,
  fallbackTitle,
}: {
  fallbackHref: string;
  fallbackTitle: string;
}) {
  const [last, setLast] = React.useState<LastVisited | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastVisited;
      if (parsed && typeof parsed.number === 'number' && typeof parsed.href === 'string') {
        setLast(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  if (!hydrated || !last) {
    return (
      <Link href={fallbackHref} aria-label={`Start at ${fallbackTitle}`}>
        <Card className="group h-full border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wide text-primary">
              Start here
            </CardDescription>
            <CardTitle className="text-lg">{fallbackTitle}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Begin the first experiment</span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={last.href} aria-label={`Continue: ${last.title}`}>
      <Card className="group h-full border-primary/40 bg-primary/10 transition-colors hover:bg-primary/15">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wide text-primary">
            Continue where you left off
          </CardDescription>
          <CardTitle className="text-lg">
            Experiment {last.number}: {last.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Chapter {last.chapter}</span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </Link>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ChapterMenuItem = {
  id: string;
  title: string;
  count: number;
};

export function ChapterMenu({ chapters }: { chapters: ChapterMenuItem[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="gap-1"
      >
        Chapters
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </Button>
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute right-0 z-40 mt-1 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          )}
        >
          {chapters.map((c) => (
            <Link
              key={c.id}
              role="menuitem"
              href={`/chapter/${c.id}/`}
              onClick={() => setOpen(false)}
              className="block rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium">Chapter {c.id}</span>
              <span className="text-muted-foreground"> — {c.title}</span>
              <span className="ml-1 text-xs text-muted-foreground">({c.count})</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchDoc } from '@/lib/search-index';
import { cn } from '@/lib/utils';

export type SearchDialogProps = {
  index: SearchDoc[];
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

export function SearchDialog({ index }: SearchDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const router = useRouter();

  const fuse = React.useMemo(
    () =>
      new Fuse(index, {
        includeScore: false,
        threshold: 0.4,
        ignoreLocation: true,
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'subtitle', weight: 0.2 },
          { name: 'formulaLatex', weight: 0.15 },
          { name: 'parts', weight: 0.1 },
          { name: 'takeaways', weight: 0.1 },
          { name: 'summary', weight: 0.05 },
          { name: 'haystack', weight: 0.2 },
        ],
      }),
    [index],
  );

  const results = React.useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Empty query → show first 20 experiments alphabetically by number.
      return index.filter((d) => d.kind === 'experiment').slice(0, 20);
    }
    return fuse.search(q, { limit: 25 }).map((r) => r.item);
  }, [fuse, query, index]);

  // Global hotkey: cmd-k / ctrl-k
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === '/' && !open && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Focus input when opening.
  React.useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Keep the active item in view.
  React.useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  function handleInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[active];
      if (hit) {
        setOpen(false);
        router.push(hit.href);
      }
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-between gap-2 px-3 text-muted-foreground sm:w-64"
        aria-label="Open search"
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm">Search experiments…</span>
        </span>
        <kbd
          aria-hidden="true"
          className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block"
        >
          {typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K'}
        </kbd>
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search experiments and formulas"
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="mt-20 w-full max-w-2xl rounded-lg border bg-popover text-popover-foreground shadow-lg">
            <div className="flex items-center border-b px-3">
              <SearchIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={handleInputKey}
                placeholder="Search by title, formula, parts, takeaways…"
                className="h-12 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search input"
                aria-controls="search-results"
                aria-activedescendant={results[active] ? `search-result-${active}` : undefined}
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
                Esc
              </kbd>
            </div>
            <ul
              ref={listRef}
              id="search-results"
              role="listbox"
              className="max-h-[60vh] overflow-y-auto p-1"
            >
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matches. Try a part name (e.g. &ldquo;555&rdquo;), a quantity (e.g. &ldquo;Ω&rdquo;), or a topic.
                </li>
              ) : (
                results.map((hit, i) => (
                  <li key={`${hit.kind}-${hit.experimentNumber}-${hit.href}-${i}`} role="none">
                    <Link
                      id={`search-result-${i}`}
                      role="option"
                      aria-selected={i === active}
                      data-idx={i}
                      href={hit.href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        'flex items-start gap-3 rounded-md px-3 py-2 text-sm outline-none',
                        i === active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 inline-flex h-5 shrink-0 items-center rounded px-1.5 font-mono text-[10px] uppercase tracking-wide',
                          hit.kind === 'formula'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
                        )}
                      >
                        {hit.kind === 'formula' ? 'Formula' : `Exp ${hit.experimentNumber}`}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{hit.title}</span>
                        {hit.subtitle ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {hit.subtitle}
                          </span>
                        ) : null}
                        {hit.formulaLatex ? (
                          <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                            {hit.formulaLatex}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
              <span>
                <kbd className="rounded border bg-muted px-1 font-mono">↑</kbd>{' '}
                <kbd className="rounded border bg-muted px-1 font-mono">↓</kbd> navigate
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 font-mono">↵</kbd> open
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 font-mono">Esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

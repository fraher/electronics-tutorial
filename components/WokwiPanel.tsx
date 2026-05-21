'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type WokwiPanelProps = {
  briefNumber: number;
  title: string;
  sketch: string;
  screenshotPath: string;
  /** Pre-trimmed snippet of the captured serial log (~10 lines is plenty). */
  serialSnippet: string;
  /** When set, renders the "Open in Wokwi" button as an external link. */
  openInWokwiHref?: string;
  className?: string;
};

/**
 * Minimal Arduino C++ highlighter. We deliberately avoid a heavyweight
 * dependency (prismjs / shiki) — this is a single-language read-only panel,
 * so a regex-driven pass is plenty.
 *
 * Tokenisation order matters: comments first (so // inside strings still
 * works because we test strings before comment-inside-string), then strings,
 * then numbers, then keywords/types/builtins, then function calls. We split
 * the text on those tokens and re-emit with span wrappers.
 */

type Token = { kind: 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'builtin' | 'preproc' | 'function'; text: string };

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'true', 'false', 'enum', 'struct', 'typedef', 'static', 'const',
  'class', 'public', 'private',
]);

const TYPES = new Set([
  'void', 'int', 'long', 'short', 'char', 'bool', 'byte', 'float', 'double',
  'unsigned', 'signed', 'size_t', 'uint8_t', 'uint16_t', 'uint32_t', 'int8_t',
  'int16_t', 'int32_t', 'String',
]);

const BUILTINS = new Set([
  'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN',
  'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
  'Serial', 'pinMode', 'digitalRead', 'digitalWrite', 'analogRead',
  'analogWrite', 'delay', 'delayMicroseconds', 'millis', 'micros',
  'tone', 'noTone', 'random', 'randomSeed', 'map', 'setup', 'loop',
  'AUTO', 'MANUAL',
]);

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const N = src.length;
  while (i < N) {
    const ch = src[i];
    // Line comment
    if (ch === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < N && src[j] !== '\n') j++;
      tokens.push({ kind: 'comment', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // Block comment
    if (ch === '/' && src[i + 1] === '*') {
      let j = i + 2;
      while (j < N && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(N, j + 2);
      tokens.push({ kind: 'comment', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // Preprocessor (#define, #include, ...)
    if (ch === '#' && (i === 0 || src[i - 1] === '\n')) {
      let j = i;
      while (j < N && src[j] !== '\n') j++;
      tokens.push({ kind: 'preproc', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // String literal
    if (ch === '"') {
      let j = i + 1;
      while (j < N && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < N) j += 2;
        else j++;
      }
      j = Math.min(N, j + 1);
      tokens.push({ kind: 'string', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // Char literal
    if (ch === "'") {
      let j = i + 1;
      while (j < N && src[j] !== "'") {
        if (src[j] === '\\' && j + 1 < N) j += 2;
        else j++;
      }
      j = Math.min(N, j + 1);
      tokens.push({ kind: 'string', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // Number literal
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < N && /[0-9.xXa-fA-FuUlL]/.test(src[j])) j++;
      tokens.push({ kind: 'number', text: src.slice(i, j) });
      i = j;
      continue;
    }
    // Identifier
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < N && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      // Function call sniff: identifier directly followed by '('
      const isCall = src[j] === '(';
      let kind: Token['kind'] = 'plain';
      if (KEYWORDS.has(word)) kind = 'keyword';
      else if (TYPES.has(word)) kind = 'type';
      else if (BUILTINS.has(word)) kind = 'builtin';
      else if (isCall) kind = 'function';
      tokens.push({ kind, text: word });
      i = j;
      continue;
    }
    // Fallback: one char of plain text. We coalesce runs of plain text.
    let j = i + 1;
    while (j < N && !/[\/"'#A-Za-z_0-9]/.test(src[j])) j++;
    tokens.push({ kind: 'plain', text: src.slice(i, j) });
    i = j;
  }
  return tokens;
}

const TOKEN_CLASS: Record<Token['kind'], string> = {
  plain: '',
  comment: 'text-emerald-700 dark:text-emerald-400 italic',
  string: 'text-amber-700 dark:text-amber-300',
  number: 'text-fuchsia-700 dark:text-fuchsia-300',
  keyword: 'text-violet-700 dark:text-violet-300 font-semibold',
  type: 'text-sky-700 dark:text-sky-300 font-semibold',
  builtin: 'text-blue-700 dark:text-blue-300',
  preproc: 'text-rose-700 dark:text-rose-300',
  function: 'text-cyan-700 dark:text-cyan-300',
};

function HighlightedSketch({ source }: { source: string }) {
  const tokens = React.useMemo(() => tokenize(source), [source]);
  return (
    <>
      {tokens.map((t, i) => {
        const cls = TOKEN_CLASS[t.kind];
        if (!cls) return <React.Fragment key={i}>{t.text}</React.Fragment>;
        return (
          <span key={i} className={cls}>
            {t.text}
          </span>
        );
      })}
    </>
  );
}

export function WokwiPanel({
  briefNumber,
  title,
  sketch,
  screenshotPath,
  serialSnippet,
  openInWokwiHref,
  className,
}: WokwiPanelProps) {
  return (
    <figure
      data-testid={`wokwi-panel-exp-${briefNumber}`}
      className={cn('space-y-3', className)}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT: simulator capture + open-in-wokwi + serial */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border bg-card shadow-sm">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-amber-500/90 px-2 py-0.5 text-xs font-semibold text-white shadow"
              data-testid="wokwi-panel-online-badge"
            >
              ONLINE
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- offline-first static export; next/image not needed for a baked screenshot */}
            <img
              src={screenshotPath}
              alt={`Captured Wokwi simulator screenshot for ${title}`}
              className="block w-full"
              loading="lazy"
            />
          </div>

          {openInWokwiHref ? (
            <a
              href={openInWokwiHref}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${title} in Wokwi (external — requires internet)`}
              data-testid="wokwi-panel-open-link"
              className="inline-flex items-center gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-500/20 dark:text-amber-200"
            >
              Open in Wokwi
              <span
                className="rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
                aria-hidden="true"
              >
                Online
              </span>
            </a>
          ) : null}

          {serialSnippet ? (
            <div
              role="region"
              aria-label="Captured serial output"
              className="rounded-md border bg-muted/40"
            >
              <div className="border-b px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Serial output
              </div>
              <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed">
                <code data-testid="wokwi-panel-serial">{serialSnippet}</code>
              </pre>
            </div>
          ) : null}
        </div>

        {/* RIGHT: syntax-highlighted sketch source */}
        <div
          role="region"
          aria-label={`Arduino sketch for ${title}`}
          className="overflow-hidden rounded-md border bg-muted/40"
        >
          <div className="border-b px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sketch source
          </div>
          <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed">
            <code
              className="language-arduino"
              data-testid="wokwi-panel-sketch"
            >
              <HighlightedSketch source={sketch} />
            </code>
          </pre>
        </div>
      </div>

      <figcaption className="text-xs text-muted-foreground">
        Captured headlessly via Wokwi-CI; the screenshot and serial output above are static
        artifacts bundled with the site. The “Open in Wokwi” link is the one online dependency
        of this page — it lets you poke at a live Arduino simulator.
      </figcaption>
    </figure>
  );
}

export { tokenize as _tokenizeForTest };

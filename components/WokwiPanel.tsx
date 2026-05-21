'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type WokwiPanelProps = {
  briefNumber: number;
  title: string;
  /** Sketch source (.ino) — what the learner copies into Wokwi's code editor. */
  sketch: string;
  /** Diagram source (diagram.json) — what the learner copies into Wokwi's diagram editor. */
  diagram: string;
  /** Captured PNG path; rendered as a small "what it looks like running" thumbnail. */
  screenshotPath: string;
  /** Pre-trimmed snippet of the captured serial log (~12 lines is plenty). */
  serialSnippet: string;
  /** When set, the "Open Wokwi" button uses this URL. Always falls back to wokwi.com/projects/new/arduino-uno. */
  openInWokwiHref?: string;
  className?: string;
};

const WOKWI_NEW_PROJECT_URL = 'https://wokwi.com/projects/new/arduino-uno';

type Token = {
  kind: 'plain' | 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'builtin' | 'preproc' | 'function';
  text: string;
};

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

function tokenizeIno(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const N = src.length;
  while (i < N) {
    const ch = src[i];
    if (ch === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < N && src[j] !== '\n') j++;
      tokens.push({ kind: 'comment', text: src.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      let j = i + 2;
      while (j < N && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(N, j + 2);
      tokens.push({ kind: 'comment', text: src.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === '#' && (i === 0 || src[i - 1] === '\n')) {
      let j = i;
      while (j < N && src[j] !== '\n') j++;
      tokens.push({ kind: 'preproc', text: src.slice(i, j) });
      i = j;
      continue;
    }
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
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (j < N && /[0-9.xXa-fA-FuUlL]/.test(src[j])) j++;
      tokens.push({ kind: 'number', text: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < N && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
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
    let j = i + 1;
    while (j < N && !/[\/"'#A-Za-z_0-9]/.test(src[j])) j++;
    tokens.push({ kind: 'plain', text: src.slice(i, j) });
    i = j;
  }
  return tokens;
}

function tokenizeJson(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const N = src.length;
  while (i < N) {
    const ch = src[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < N && src[j] !== '"') {
        if (src[j] === '\\' && j + 1 < N) j += 2;
        else j++;
      }
      j = Math.min(N, j + 1);
      // Distinguish object keys from string values: a key is followed by ':'
      let k = j;
      while (k < N && /\s/.test(src[k])) k++;
      const kind: Token['kind'] = src[k] === ':' ? 'keyword' : 'string';
      tokens.push({ kind, text: src.slice(i, j) });
      i = j;
      continue;
    }
    if (ch >= '0' && ch <= '9' || (ch === '-' && src[i + 1] >= '0' && src[i + 1] <= '9')) {
      let j = i + (ch === '-' ? 1 : 0);
      while (j < N && /[0-9.eE+-]/.test(src[j])) j++;
      tokens.push({ kind: 'number', text: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < N && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      const kind: Token['kind'] =
        word === 'true' || word === 'false' || word === 'null' ? 'builtin' : 'plain';
      tokens.push({ kind, text: word });
      i = j;
      continue;
    }
    let j = i + 1;
    while (j < N && !/["\-0-9A-Za-z_]/.test(src[j])) j++;
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

function Highlighted({ tokens }: { tokens: Token[] }) {
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

/**
 * Copy `text` to clipboard. Returns a promise resolving to true on success.
 * Falls back to the legacy execCommand path when navigator.clipboard is
 * unavailable (e.g. http://localhost without secure-context permission).
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through */
    }
  }
  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-10000px';
  document.body.appendChild(ta);
  ta.select();
  try {
    const ok = document.execCommand('copy');
    return ok;
  } catch {
    return false;
  } finally {
    ta.remove();
  }
}

function CopyButton({
  label,
  payload,
  testId,
}: {
  label: string;
  payload: string;
  testId?: string;
}) {
  const [state, setState] = React.useState<'idle' | 'copied' | 'error'>('idle');
  const handle = React.useCallback(async () => {
    const ok = await copyToClipboard(payload);
    setState(ok ? 'copied' : 'error');
    window.setTimeout(() => setState('idle'), 2000);
  }, [payload]);
  return (
    <button
      type="button"
      onClick={handle}
      data-testid={testId}
      className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-live="polite"
    >
      <span aria-hidden="true">📋</span>
      <span>
        {state === 'copied' ? `${label} copied!` : state === 'error' ? `${label} — copy failed` : label}
      </span>
    </button>
  );
}

export function WokwiPanel({
  briefNumber,
  title,
  sketch,
  diagram,
  screenshotPath,
  serialSnippet,
  openInWokwiHref,
  className,
}: WokwiPanelProps) {
  const [tab, setTab] = React.useState<'sketch' | 'diagram'>('sketch');
  const wokwiHref = openInWokwiHref || WOKWI_NEW_PROJECT_URL;

  const sketchTokens = React.useMemo(() => tokenizeIno(sketch), [sketch]);
  const diagramTokens = React.useMemo(() => tokenizeJson(diagram || '{}'), [diagram]);

  return (
    <figure
      data-testid={`wokwi-panel-exp-${briefNumber}`}
      className={cn('space-y-4', className)}
    >
      {/* Captured evidence + run controls — compact strip */}
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-md border bg-card shadow-sm">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-1.5 top-1.5 z-10 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow"
              data-testid="wokwi-panel-online-badge"
            >
              ONLINE
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- baked static asset */}
            <img
              src={screenshotPath}
              alt={`Captured Wokwi Arduino UNO board for ${title} — shows only the controller part; full circuit visible after pasting into Wokwi`}
              className="block w-full"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Headless capture of the Arduino UNO running this sketch. Wokwi-CI snapshots
            one part at a time — the full breadboard view opens in Wokwi below.
          </p>
        </div>

        {serialSnippet ? (
          <div
            role="region"
            aria-label="Captured serial output"
            className="rounded-md border bg-muted/40"
          >
            <div className="border-b px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Serial output (captured)
            </div>
            <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed">
              <code data-testid="wokwi-panel-serial">{serialSnippet}</code>
            </pre>
          </div>
        ) : null}
      </div>

      {/* Run-in-Wokwi instructions + buttons */}
      <div
        role="region"
        aria-label="Run this in Wokwi"
        className="rounded-md border border-amber-500/40 bg-amber-50/40 p-4 dark:bg-amber-500/5"
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold">Run this in Wokwi</h3>
          <span
            className="rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
            aria-hidden="true"
          >
            Online
          </span>
        </div>
        <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-muted-foreground">
          <li>
            Click <span className="font-medium text-foreground">Open Wokwi ↗</span> below — a new tab opens a fresh Arduino-Uno project.
          </li>
          <li>
            In Wokwi, click <span className="font-medium text-foreground">diagram.json</span>, select all (⌘/Ctrl+A), then click{' '}
            <span className="font-medium text-foreground">Copy diagram</span> here and paste (⌘/Ctrl+V) into Wokwi.
          </li>
          <li>
            Click Wokwi&apos;s <span className="font-medium text-foreground">sketch.ino</span> tab, select all, then click{' '}
            <span className="font-medium text-foreground">Copy sketch</span> here and paste.
          </li>
          <li>
            Hit ▶ to run.
          </li>
        </ol>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={wokwiHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Open a new Arduino-Uno project in Wokwi (external, requires internet)"
            data-testid="wokwi-panel-open-link"
            className="inline-flex items-center gap-2 rounded-md border border-amber-500/60 bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500/90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Open Wokwi ↗
          </a>
          <CopyButton
            label="Copy diagram.json"
            payload={diagram}
            testId="wokwi-panel-copy-diagram"
          />
          <CopyButton
            label="Copy sketch.ino"
            payload={sketch}
            testId="wokwi-panel-copy-sketch"
          />
        </div>
      </div>

      {/* Source tabs */}
      <div
        role="region"
        aria-label={`Source files for ${title}`}
        className="overflow-hidden rounded-md border bg-muted/40"
      >
        <div role="tablist" className="flex gap-1 border-b bg-background/60 px-2 pt-2">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sketch'}
            onClick={() => setTab('sketch')}
            data-testid="wokwi-panel-tab-sketch"
            className={cn(
              'rounded-t-md border-b-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
              tab === 'sketch'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            sketch.ino
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'diagram'}
            onClick={() => setTab('diagram')}
            data-testid="wokwi-panel-tab-diagram"
            className={cn(
              'rounded-t-md border-b-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',
              tab === 'diagram'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            diagram.json
          </button>
        </div>
        <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed">
          {tab === 'sketch' ? (
            <code
              className="language-arduino"
              data-testid="wokwi-panel-sketch"
            >
              <Highlighted tokens={sketchTokens} />
            </code>
          ) : (
            <code
              className="language-json"
              data-testid="wokwi-panel-diagram"
            >
              <Highlighted tokens={diagramTokens} />
            </code>
          )}
        </pre>
      </div>
    </figure>
  );
}

export { tokenizeIno as _tokenizeForTest };

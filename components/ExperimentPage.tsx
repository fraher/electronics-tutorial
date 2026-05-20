import * as React from 'react';
import Link from 'next/link';
import { FormulaSlider, type Var } from '@/components/FormulaSlider';
import { CircuitEmbed } from '@/components/CircuitEmbed';
import { WokwiEmbed } from '@/components/WokwiEmbed';
import { cn } from '@/lib/utils';

export type Formula = {
  id: string;
  latex: string;
  evaluate: (v: Record<string, number>) => number;
  vars: Var[];
  solveFor: { name: string; unit?: string; precision?: number };
  title?: string;
  /**
   * Optional render-prop forwarded to FormulaSlider; draws a live mini-
   * schematic bound to the same variable state. Authored per-experiment in
   * `lib/experiment-schematics.tsx`.
   */
  schematic?: (vars: Record<string, number>) => React.ReactNode;
};

export type ExperimentCircuit =
  | { kind: 'circuitjs'; cir: string }
  | { kind: 'wokwi'; projectId: string; placeholder?: boolean; sketchHint?: string };

export type ExperimentPageProps = {
  chapter: number; // 1-5
  number: number; // 1-36
  title: string;
  objective: string;
  summary: React.ReactNode;
  schematic?: React.ReactNode;
  formulas?: Formula[];
  circuit?: ExperimentCircuit;
  parts?: string[];
  takeaways: string[];
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
  className?: string;
};

function Section({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('space-y-3 scroll-mt-20', className)}>
      <h2 className="text-xl font-semibold tracking-tight">
        <a
          href={`#${id}`}
          className="no-underline hover:underline decoration-muted-foreground/50"
        >
          {title}
        </a>
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function ExperimentPage({
  chapter,
  number,
  title,
  objective,
  summary,
  schematic,
  formulas,
  circuit,
  parts,
  takeaways,
  prev,
  next,
  className,
}: ExperimentPageProps) {
  return (
    <article className={cn('space-y-8', className)}>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/chapter/${chapter}/`} className="hover:underline">
              Chapter {chapter}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Experiment {number}</li>
        </ol>
      </nav>

      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Experiment {number}
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="text-lg text-muted-foreground">{objective}</p>
      </header>

      <Section id="summary" title="Summary">
        <div className="prose prose-sm max-w-none dark:prose-invert">{summary}</div>
      </Section>

      {schematic ? (
        <Section id="schematic" title="Schematic">
          <div className="flex justify-center rounded-lg border bg-card p-4">{schematic}</div>
        </Section>
      ) : null}

      {formulas && formulas.length > 0 ? (
        <Section id="formulas" title="Formulas">
          <div className="grid gap-4 md:grid-cols-2">
            {formulas.map((f) => (
              <FormulaSlider
                key={f.id}
                formula={f.latex}
                evaluate={f.evaluate}
                vars={f.vars}
                solveFor={f.solveFor}
                title={f.title}
                schematic={f.schematic}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {circuit ? (
        <Section id="circuit" title="Circuit">
          {circuit.kind === 'circuitjs' ? (
            <CircuitEmbed
              circuit={circuit.cir}
              title={`${title} — interactive circuit`}
              caption="Drag component values or wires; the simulation updates live."
            />
          ) : (
            <WokwiEmbed
              projectId={circuit.projectId}
              title={`${title} — Arduino simulation`}
              caption="Arduino sketch + breadboard. Requires internet."
              placeholder={circuit.placeholder}
              sketchHint={circuit.sketchHint}
            />
          )}
        </Section>
      ) : null}

      {parts && parts.length > 0 ? (
        <Section id="parts" title="Parts">
          <ul className="list-disc space-y-1 pl-6 text-sm">
            {parts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="takeaways" title="Takeaways">
        <ul className="list-disc space-y-1 pl-6">
          {takeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      {(prev || next) && (
        <nav
          aria-label="Experiment navigation"
          className="flex items-center justify-between border-t pt-6 text-sm"
        >
          <div>
            {prev ? (
              <Link href={prev.href} className="hover:underline">
                ← {prev.label}
              </Link>
            ) : null}
          </div>
          <div>
            {next ? (
              <Link href={next.href} className="hover:underline">
                {next.label} →
              </Link>
            ) : null}
          </div>
        </nav>
      )}
    </article>
  );
}

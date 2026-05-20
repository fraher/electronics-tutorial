'use client';

import * as React from 'react';
import { ExperimentPage, type Formula, type ExperimentCircuit } from '@/components/ExperimentPage';
import { KatexInline } from '@/components/katex-inline';
import { getEvaluator } from '@/lib/formula-evaluators';
import type { BriefVar } from '@/lib/briefs';

type SerializableFormula = {
  id: string;
  latex: string;
  vars: BriefVar[];
  solveFor: { name: string; unit?: string; precision?: number };
  description?: string;
  hasEvaluator: boolean;
};

type CircuitProp =
  | { kind: 'circuitjs'; cir: string }
  | { kind: 'circuitjs-empty'; note?: string }
  | { kind: 'wokwi'; projectId: string }
  | null;

export type ExperimentClientProps = {
  chapter: number;
  number: number;
  title: string;
  objective: string;
  summary: string;
  schematicDescription: string;
  formulas: SerializableFormula[];
  circuit: CircuitProp;
  parts: string[];
  takeaways: string[];
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
};

export default function ExperimentClient(props: ExperimentClientProps) {
  const liveFormulas: Formula[] = [];
  const staticFormulas: SerializableFormula[] = [];
  for (const f of props.formulas) {
    const evaluate = getEvaluator(f.id);
    if (evaluate && f.hasEvaluator) {
      liveFormulas.push({
        id: f.id,
        latex: f.latex,
        evaluate,
        vars: f.vars,
        solveFor: f.solveFor,
        title: f.description,
      });
    } else {
      staticFormulas.push(f);
    }
  }

  const summaryNode = (
    <>
      {props.summary
        .split(/\n\s*\n/)
        .map((para, i) => (
          <p key={i}>{para.replace(/\n/g, ' ').trim()}</p>
        ))}
    </>
  );

  const schematicNode = props.schematicDescription ? (
    <div className="w-full space-y-2 text-sm">
      <p className="text-muted-foreground">
        Schematic (described in prose; SVG illustration is a future enhancement):
      </p>
      <p className="whitespace-pre-line leading-relaxed">{props.schematicDescription.trim()}</p>
    </div>
  ) : null;

  const expCircuit: ExperimentCircuit | undefined =
    props.circuit?.kind === 'circuitjs'
      ? { kind: 'circuitjs', cir: props.circuit.cir }
      : props.circuit?.kind === 'wokwi'
      ? { kind: 'wokwi', projectId: props.circuit.projectId }
      : props.circuit?.kind === 'circuitjs-empty'
      ? { kind: 'circuitjs', cir: '' }
      : undefined;

  return (
    <>
      <ExperimentPage
        chapter={props.chapter}
        number={props.number}
        title={props.title}
        objective={props.objective}
        summary={summaryNode}
        schematic={schematicNode}
        formulas={liveFormulas}
        circuit={expCircuit}
        parts={props.parts}
        takeaways={props.takeaways}
        prev={props.prev}
        next={props.next}
      />

      {staticFormulas.length > 0 ? (
        <section className="mt-6 space-y-3" aria-label="Reference formulas">
          <h2 className="text-lg font-semibold tracking-tight">Reference formulas</h2>
          <p className="text-sm text-muted-foreground">
            These formulas are shown for reference but do not yet have an interactive slider.
          </p>
          <ul className="space-y-3">
            {staticFormulas.map((f) => (
              <li key={f.id} className="rounded-lg border bg-card p-3">
                <div className="py-1">
                  <KatexInline math={f.latex} displayMode />
                </div>
                {f.description ? (
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

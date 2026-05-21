'use client';

import * as React from 'react';
import { ExperimentPage, type Formula, type ExperimentCircuit } from '@/components/ExperimentPage';
import { KatexInline } from '@/components/katex-inline';
import { getEvaluator } from '@/lib/formula-evaluators';
import type { BriefVar } from '@/lib/briefs';
import { recordLastVisited } from '@/components/ContinueCard';
import { getExperimentSchematic } from '@/lib/experiment-schematics';
import { ExperimentSchematic } from '@/components/schematic';

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
  | { kind: 'wokwi'; projectId: string; placeholder?: boolean; sketchHint?: string }
  | {
      kind: 'wokwi-panel';
      briefNumber: number;
      title: string;
      sketch: string;
      screenshotPath: string;
      serialSnippet: string;
      openInWokwiHref?: string;
    }
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
  React.useEffect(() => {
    recordLastVisited({
      number: props.number,
      chapter: props.chapter,
      title: props.title,
      href: `/chapter/${props.chapter}/experiment/${props.number}/`,
    });
  }, [props.number, props.chapter, props.title]);

  const schematicRender = getExperimentSchematic(props.number);

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
        // Bind the same per-experiment composite schematic to every formula
        // slider so the visual updates wherever the learner is interacting.
        schematic: schematicRender,
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

  // Default vars for the composite schematic — pull defaults from the first
  // live formula. The per-FormulaSlider schematic above re-renders with that
  // slider's actual values; this top-of-page one is the static "depiction".
  const compositeVars: Record<string, number> = React.useMemo(() => {
    const out: Record<string, number> = {};
    for (const f of props.formulas) {
      for (const v of f.vars) {
        if (out[v.name] === undefined) {
          out[v.name] = v.default ?? v.min;
        }
      }
    }
    return out;
  }, [props.formulas]);

  const schematicNode = schematicRender ? (
    <div className="w-full space-y-3 text-sm">
      <ExperimentSchematic
        vars={compositeVars}
        ariaLabel={`Live schematic for ${props.title}`}
        render={schematicRender}
        testId={`experiment-${props.number}-schematic`}
      />
      {props.schematicDescription ? (
        <details className="rounded-md border bg-background/40 p-3 text-muted-foreground">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Schematic notes
          </summary>
          <p className="mt-2 whitespace-pre-line leading-relaxed">
            {props.schematicDescription.trim()}
          </p>
        </details>
      ) : null}
    </div>
  ) : props.schematicDescription ? (
    <div className="w-full space-y-2 text-sm">
      <p className="text-muted-foreground">Schematic (described in prose):</p>
      <p className="whitespace-pre-line leading-relaxed">{props.schematicDescription.trim()}</p>
    </div>
  ) : null;

  const expCircuit: ExperimentCircuit | undefined =
    props.circuit?.kind === 'circuitjs'
      ? { kind: 'circuitjs', cir: props.circuit.cir }
      : props.circuit?.kind === 'wokwi-panel'
      ? {
          kind: 'wokwi-panel',
          briefNumber: props.circuit.briefNumber,
          title: props.circuit.title,
          sketch: props.circuit.sketch,
          screenshotPath: props.circuit.screenshotPath,
          serialSnippet: props.circuit.serialSnippet,
          openInWokwiHref: props.circuit.openInWokwiHref,
        }
      : props.circuit?.kind === 'wokwi'
      ? {
          kind: 'wokwi',
          projectId: props.circuit.projectId,
          placeholder: props.circuit.placeholder,
          sketchHint: props.circuit.sketchHint,
        }
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

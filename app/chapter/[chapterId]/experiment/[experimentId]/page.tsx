import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllBriefs, getBriefByNumber, isRealCirString, type Brief } from '@/lib/briefs';
import { getEvaluator } from '@/lib/formula-evaluators';
import ExperimentClient from './experiment-client';

export function generateStaticParams() {
  return getAllBriefs().map((b) => ({
    chapterId: String(b.chapter),
    experimentId: String(b.number),
  }));
}

export function generateMetadata({
  params,
}: {
  params: { chapterId: string; experimentId: string };
}): Metadata {
  const n = Number(params.experimentId);
  const b = getBriefByNumber(n);
  if (!b) return { title: 'Experiment not found' };
  return {
    title: `Experiment ${b.number}: ${b.title}`,
    description: b.learning_objective.replace(/\s+/g, ' ').trim(),
  };
}

type SerializableFormula = {
  id: string;
  latex: string;
  vars: Brief['formulas'][number]['vars'];
  solveFor: Brief['formulas'][number]['solve_for'];
  description?: string;
  hasEvaluator: boolean;
};

type CircuitProp =
  | { kind: 'circuitjs'; cir: string }
  | { kind: 'circuitjs-empty'; note?: string }
  | { kind: 'wokwi'; projectId: string }
  | null;

export default function Page({
  params,
}: {
  params: { chapterId: string; experimentId: string };
}) {
  const n = Number(params.experimentId);
  const chapter = Number(params.chapterId);
  const brief = getBriefByNumber(n);
  if (!brief || brief.chapter !== chapter) notFound();

  // Prepare formula descriptors. We pass the LIST of formula ids to the client;
  // the client looks the evaluator up itself (functions aren't serializable
  // across the RSC boundary).
  const formulas: SerializableFormula[] = brief.formulas.map((f) => ({
    id: f.id,
    latex: f.latex,
    // Filter out the solve_for entry from vars (some briefs list it as a var too).
    vars: f.vars.filter((v) => v.name !== f.solve_for.name),
    solveFor: f.solve_for,
    description: f.description,
    hasEvaluator: Boolean(getEvaluator(f.id)),
  }));

  let circuit: CircuitProp = null;
  const cir: string = brief.suggested_falstad_circuit ?? '';
  if (brief.suggested_wokwi_project_id) {
    circuit = { kind: 'wokwi', projectId: brief.suggested_wokwi_project_id };
  } else if (isRealCirString(cir)) {
    circuit = { kind: 'circuitjs', cir };
  } else if (cir.trim() && !/^N\/A/i.test(cir.trim())) {
    circuit = { kind: 'circuitjs-empty' };
  }

  const prevBrief = getBriefByNumber(brief.number - 1);
  const nextBrief = getBriefByNumber(brief.number + 1);
  const prev = prevBrief
    ? {
        href: `/chapter/${prevBrief.chapter}/experiment/${prevBrief.number}/`,
        label: `Experiment ${prevBrief.number}: ${prevBrief.title}`,
      }
    : undefined;
  const next = nextBrief
    ? {
        href: `/chapter/${nextBrief.chapter}/experiment/${nextBrief.number}/`,
        label: `Experiment ${nextBrief.number}: ${nextBrief.title}`,
      }
    : undefined;

  return (
    <ExperimentClient
      chapter={brief.chapter}
      number={brief.number}
      title={brief.title}
      objective={brief.learning_objective}
      summary={brief.paraphrased_summary}
      schematicDescription={brief.schematic_description}
      formulas={formulas}
      circuit={circuit}
      parts={brief.parts}
      takeaways={brief.takeaways}
      prev={prev}
      next={next}
    />
  );
}

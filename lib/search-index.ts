// Build-time search index over all 36 experiments + their formulas.
// Server-only (uses lib/briefs which reads from disk). The shape exported here
// is plain JSON, safe to serialize across the RSC boundary to client search.

import { getAllBriefs } from '@/lib/briefs';

export type SearchDoc = {
  kind: 'experiment' | 'formula';
  experimentNumber: number;
  chapter: number;
  href: string;
  title: string;
  subtitle?: string;
  haystack: string;
  // Searchable fields broken out so Fuse can weight them.
  formulaLatex?: string;
  parts?: string;
  takeaways?: string;
  summary?: string;
};

export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const b of getAllBriefs()) {
    const expHref = `/chapter/${b.chapter}/experiment/${b.number}/`;
    const parts = (b.parts || []).join(' • ');
    const takeaways = (b.takeaways || []).join(' ');
    const summary = (b.paraphrased_summary || '').replace(/\s+/g, ' ').trim();

    docs.push({
      kind: 'experiment',
      experimentNumber: b.number,
      chapter: b.chapter,
      href: expHref,
      title: `Experiment ${b.number}: ${b.title}`,
      subtitle: b.learning_objective.replace(/\s+/g, ' ').trim(),
      haystack: [
        b.title,
        b.learning_objective,
        summary,
        parts,
        takeaways,
      ].join(' \n '),
      parts,
      takeaways,
      summary,
    });

    for (const f of b.formulas || []) {
      docs.push({
        kind: 'formula',
        experimentNumber: b.number,
        chapter: b.chapter,
        href: `${expHref}#formulas`,
        title: f.description || f.id,
        subtitle: `Formula in Experiment ${b.number}: ${b.title}`,
        haystack: [f.id, f.latex, f.description || '', b.title].join(' \n '),
        formulaLatex: f.latex,
      });
    }
  }
  return docs;
}

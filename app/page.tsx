import Link from 'next/link';
import type { Metadata } from 'next';
import { CHAPTERS } from '@/lib/chapters';
import { getAllBriefs, getBriefsByChapter } from '@/lib/briefs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KatexInline } from '@/components/katex-inline';
import { ContinueCard } from '@/components/ContinueCard';

export const metadata: Metadata = {
  title: 'Make: Electronics 3e — Interactive Companion',
  description:
    'A local-only, offline-first study companion to Make: Electronics, 3rd Edition. 36 experiments, tunable formula sliders, and editable circuits.',
};

export default function HomePage() {
  const briefs = getAllBriefs();
  const formulaCount = briefs.reduce((sum, b) => sum + (b.formulas?.length || 0), 0);
  const arduinoCount = briefs.filter((b) => !!b.suggested_wokwi_project_id).length;
  const first = briefs[0];

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Interactive Companion
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Make: Electronics 3e
            <span className="block text-2xl font-medium text-muted-foreground md:text-3xl">
              learn by tuning the knobs
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Work through Charles Platt&apos;s 36 hands-on experiments with paraphrased prose,
            sliders that re-solve formulas live (try{' '}
            <KatexInline math="V = I \cdot R" />), and editable circuits you can rewire in
            the browser. Everything is local — no servers, no accounts, no tracking.
          </p>
        </div>
        <dl className="flex flex-wrap gap-4 text-sm">
          <div className="rounded-md border bg-card px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Experiments
            </dt>
            <dd className="font-mono text-xl font-semibold tabular-nums">{briefs.length}</dd>
          </div>
          <div className="rounded-md border bg-card px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Formulas</dt>
            <dd className="font-mono text-xl font-semibold tabular-nums">{formulaCount}</dd>
          </div>
          <div className="rounded-md border bg-card px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Chapters</dt>
            <dd className="font-mono text-xl font-semibold tabular-nums">{CHAPTERS.length}</dd>
          </div>
          <div className="rounded-md border bg-card px-3 py-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Arduino</dt>
            <dd className="font-mono text-xl font-semibold tabular-nums">{arduinoCount}</dd>
          </div>
        </dl>
      </section>

      {first ? (
        <section aria-label="Continue">
          <ContinueCard
            fallbackHref={`/chapter/${first.chapter}/experiment/${first.number}/`}
            fallbackTitle={`Experiment ${first.number}: ${first.title}`}
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Chapters</h2>
          <p className="text-sm text-muted-foreground">Press ⌘K to search</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((c) => {
            const cBriefs = getBriefsByChapter(Number(c.id));
            const range =
              cBriefs.length > 0
                ? `Experiments ${cBriefs[0].number}–${cBriefs[cBriefs.length - 1].number}`
                : 'No experiments yet';
            const fCount = cBriefs.reduce((s, b) => s + (b.formulas?.length || 0), 0);
            const hasArduino = cBriefs.some((b) => b.suggested_wokwi_project_id);
            return (
              <Link
                key={c.id}
                href={`/chapter/${c.id}/`}
                className="group focus:outline-none"
                aria-label={`Open Chapter ${c.id}: ${c.title}`}
              >
                <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                  <CardHeader className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 font-mono text-sm font-semibold text-primary">
                        {c.id}
                      </span>
                      <CardTitle className="text-lg leading-tight">{c.title}</CardTitle>
                    </div>
                    <CardDescription>{range}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2 py-0.5">
                      {cBriefs.length} exp
                    </span>
                    <span className="rounded-full bg-secondary px-2 py-0.5">
                      {fCount} formulas
                    </span>
                    {hasArduino ? (
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-300">
                        Arduino
                      </span>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

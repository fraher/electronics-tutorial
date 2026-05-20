import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CHAPTERS, getChapter } from '@/lib/chapters';
import { getBriefsByChapter } from '@/lib/briefs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapterId: c.id }));
}

export function generateMetadata({ params }: { params: { chapterId: string } }): Metadata {
  const chapter = getChapter(params.chapterId);
  if (!chapter) return { title: 'Chapter not found' };
  return {
    title: `Chapter ${chapter.id}: ${chapter.title}`,
    description: chapter.blurb,
  };
}

export default function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = getChapter(params.chapterId);
  if (!chapter) notFound();
  const briefs = getBriefsByChapter(Number(chapter.id));
  const formulaCount = briefs.reduce((s, b) => s + (b.formulas?.length || 0), 0);

  return (
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Chapter {chapter.id}</li>
        </ol>
      </nav>

      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">
          Chapter {chapter.id}
        </p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{chapter.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{chapter.blurb}</p>
        <p className="text-sm text-muted-foreground">
          {briefs.length} experiment{briefs.length === 1 ? '' : 's'} • {formulaCount} formula
          {formulaCount === 1 ? '' : 's'}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {briefs.map((b) => {
          const isArduino = !!b.suggested_wokwi_project_id;
          return (
            <Link
              key={b.number}
              href={`/chapter/${b.chapter}/experiment/${b.number}/`}
              className="group focus:outline-none"
              aria-label={`Experiment ${b.number}: ${b.title}`}
            >
              <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardHeader className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="inline-flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-md bg-primary/10 px-1.5 font-mono text-sm font-semibold text-primary">
                      {b.number}
                    </span>
                    <CardTitle className="text-base leading-tight">{b.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {b.learning_objective.replace(/\s+/g, ' ').trim()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                    {b.formulas.length} formula{b.formulas.length === 1 ? '' : 's'}
                  </span>
                  <span
                    className={
                      isArduino
                        ? 'rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-300'
                        : 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300'
                    }
                  >
                    {isArduino ? 'Arduino' : 'Analog'}
                  </span>
                  {b.parts && b.parts.length > 0 ? (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {b.parts.length} part{b.parts.length === 1 ? '' : 's'}
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

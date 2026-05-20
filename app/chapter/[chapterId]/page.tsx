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
  return { title: `Chapter ${chapter.id}: ${chapter.title}` };
}

export default function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = getChapter(params.chapterId);
  if (!chapter) notFound();
  const briefs = getBriefsByChapter(Number(chapter.id));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Chapter {chapter.id}: {chapter.title}
        </h1>
        <p className="text-muted-foreground">
          {briefs.length} experiment{briefs.length === 1 ? '' : 's'} in this chapter.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {briefs.map((b) => (
          <Link
            key={b.number}
            href={`/chapter/${b.chapter}/experiment/${b.number}/`}
          >
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base">
                  Experiment {b.number}: {b.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {b.learning_objective.replace(/\s+/g, ' ').trim()}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {b.formulas.length} formula{b.formulas.length === 1 ? '' : 's'}
                {b.suggested_wokwi_project_id ? ' · Arduino (Wokwi)' : ''}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CHAPTERS, getChapter } from '@/lib/chapters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ chapterId: c.id }));
}

export default function ChapterPage({ params }: { params: { chapterId: string } }) {
  const chapter = getChapter(params.chapterId);
  if (!chapter) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Chapter {chapter.id}: {chapter.title}
        </h1>
        <p className="text-muted-foreground">Placeholder — content lands in Sprint 3.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {chapter.experimentIds.map((eid) => (
          <Link key={eid} href={`/chapter/${chapter.id}/experiment/${eid}/`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <CardTitle className="text-base">Experiment {eid}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Placeholder</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

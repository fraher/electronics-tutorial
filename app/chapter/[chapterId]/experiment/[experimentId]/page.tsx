import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CHAPTERS, getChapter } from '@/lib/chapters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export function generateStaticParams() {
  const out: { chapterId: string; experimentId: string }[] = [];
  for (const c of CHAPTERS) {
    for (const eid of c.experimentIds) {
      out.push({ chapterId: c.id, experimentId: eid });
    }
  }
  return out;
}

export default function ExperimentPage({
  params,
}: {
  params: { chapterId: string; experimentId: string };
}) {
  const chapter = getChapter(params.chapterId);
  if (!chapter) notFound();
  if (!chapter.experimentIds.includes(params.experimentId)) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/chapter/${chapter.id}/`} className="text-sm text-muted-foreground hover:underline">
          ← Chapter {chapter.id}: {chapter.title}
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Experiment {params.experimentId}
        </h1>
        <p className="text-muted-foreground">
          Placeholder experiment page. Real prose, circuits, and formula sliders land in Sprint 3.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formula slider preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            shadcn/ui Slider primitive (placeholder — wired in s1.5).
          </p>
          <Slider defaultValue={[50]} max={100} step={1} />
          <Button variant="outline" size="sm">Placeholder action</Button>
        </CardContent>
      </Card>
    </div>
  );
}

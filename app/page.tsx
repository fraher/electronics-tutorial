import Link from 'next/link';
import { CHAPTERS } from '@/lib/chapters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KatexInline } from '@/components/katex-inline';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Electronics Tutorial</h1>
        <p className="text-muted-foreground">
          Local-only interactive companion to <em>Make: Electronics</em> (3rd ed.). Paraphrased prose,
          editable circuits, and tunable formulas. Sample formula:{' '}
          <KatexInline math="V = I \cdot R" />.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Chapters</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHAPTERS.map((c) => (
            <Link key={c.id} href={`/chapter/${c.id}/`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Chapter {c.id}: {c.title}
                  </CardTitle>
                  <CardDescription>
                    Experiments {c.experimentIds[0]}-{c.experimentIds[c.experimentIds.length - 1]}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.experimentIds.length} experiments
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

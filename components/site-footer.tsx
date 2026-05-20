import { getAllBriefs } from '@/lib/briefs';

export function SiteFooter() {
  const briefs = getAllBriefs();
  const experimentCount = briefs.length;
  const formulaCount = briefs.reduce((sum, b) => sum + (b.formulas?.length || 0), 0);

  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="container mx-auto max-w-5xl space-y-3 px-4 py-6 text-xs text-muted-foreground">
        <p>
          Local-only build • offline-first • {experimentCount} experiments •{' '}
          {formulaCount} formulas
        </p>
        <p>
          Interactive companion to <em>Make: Electronics</em>, 3rd Edition by Charles Platt
          (Maker Media). All prose here is paraphrased; no scans, photos, or original
          text from the book are reproduced. Schematics are redrawn originals. This
          companion is a personal study aid — not a substitute for the book and not
          intended for public distribution.
        </p>
        <p>
          CircuitJS is vendored under <abbr title="GNU General Public License v2">GPLv2</abbr>;
          see <code className="rounded bg-muted px-1">public/circuitjs/LICENSE</code> and the
          upstream{' '}
          <a
            href="https://www.falstad.com/circuit/"
            className="underline hover:text-foreground"
            rel="noopener noreferrer"
            target="_blank"
          >
            falstad.com/circuit
          </a>{' '}
          source. Wokwi embeds (Arduino chapter) require internet; everything else
          runs from <code className="rounded bg-muted px-1">file://</code>.
        </p>
      </div>
    </footer>
  );
}

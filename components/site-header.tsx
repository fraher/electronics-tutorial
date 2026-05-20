import Link from 'next/link';
import { Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { SearchDialog } from '@/components/SearchDialog';
import { ChapterMenu } from '@/components/ChapterMenu';
import { buildSearchIndex } from '@/lib/search-index';
import { CHAPTERS } from '@/lib/chapters';
import { getBriefsByChapter } from '@/lib/briefs';

export function SiteHeader() {
  const index = buildSearchIndex();
  const chapterItems = CHAPTERS.map((c) => ({
    id: c.id,
    title: c.title,
    count: getBriefsByChapter(Number(c.id)).length,
  }));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 sm:gap-3 sm:py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-base font-semibold tracking-tight sm:text-lg"
        >
          <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="hidden sm:inline">Make: Electronics</span>
          <span className="sm:hidden">M:E</span>
        </Link>
        <div className="flex-1 px-1 sm:px-2">
          <SearchDialog index={index} />
        </div>
        <nav className="flex shrink-0 items-center gap-1" aria-label="Site">
          <ChapterMenu chapters={chapterItems} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

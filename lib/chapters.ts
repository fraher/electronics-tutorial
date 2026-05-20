// Chapter structure mirrors Make: Electronics 3e — see .project-memory/entities/Chapter.md.
// Stub experiment ID arrays: real content lands in Sprint 3.

export type ChapterMeta = {
  id: string;
  title: string;
  experimentIds: string[];
};

export const CHAPTERS: ChapterMeta[] = [
  { id: '1', title: 'Discovery', experimentIds: range(1, 11) },
  { id: '2', title: 'Switching', experimentIds: range(12, 15) },
  { id: '3', title: 'Getting Somewhere', experimentIds: range(16, 24) },
  { id: '4', title: 'Logic', experimentIds: range(25, 31) },
  { id: '5', title: 'What Next', experimentIds: range(32, 36) },
];

function range(start: number, end: number): string[] {
  const out: string[] = [];
  for (let i = start; i <= end; i++) out.push(String(i));
  return out;
}

export function getChapter(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

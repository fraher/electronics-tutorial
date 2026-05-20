// Chapter structure mirrors Make: Electronics 3e — see .project-memory/entities/Chapter.md.
// Authoritative experiment-to-chapter mapping lives in the brief YAML files
// (`chapter:` field of each); this table mirrors those groupings for routing.

export type ChapterMeta = {
  id: string;
  title: string;
  experimentIds: string[];
};

export const CHAPTERS: ChapterMeta[] = [
  { id: '1', title: 'Experience Electricity', experimentIds: range(1, 5) },
  { id: '2', title: 'Switching Basics', experimentIds: range(6, 11) },
  { id: '3', title: 'Getting Somewhere', experimentIds: range(12, 14) },
  { id: '4', title: 'Logic & Timers', experimentIds: range(15, 23) },
  { id: '5', title: 'Going Further (incl. Arduino)', experimentIds: range(24, 36) },
];

function range(start: number, end: number): string[] {
  const out: string[] = [];
  for (let i = start; i <= end; i++) out.push(String(i));
  return out;
}

export function getChapter(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

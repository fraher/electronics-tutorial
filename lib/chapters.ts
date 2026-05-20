// Chapter structure mirrors Make: Electronics 3e — see .project-memory/entities/Chapter.md.
// Authoritative experiment-to-chapter mapping lives in the brief YAML files
// (`chapter:` field of each); this table mirrors those groupings for routing.

export type ChapterMeta = {
  id: string;
  title: string;
  experimentIds: string[];
  blurb: string;
};

export const CHAPTERS: ChapterMeta[] = [
  {
    id: '1',
    title: 'Experience Electricity',
    experimentIds: range(1, 5),
    blurb:
      'First contact with current, voltage, and resistance — felt on the tongue, measured with a meter, watched as a capacitor empties.',
  },
  {
    id: '2',
    title: 'Switching Basics',
    experimentIds: range(6, 11),
    blurb:
      'From relays and transistors to a hand-soldered circuit: how a small signal flips a larger one, and how to build something durable.',
  },
  {
    id: '3',
    title: 'Getting Somewhere',
    experimentIds: range(12, 14),
    blurb:
      'Sound, sensing, and a working alarm — small projects that combine the building blocks into something that does a job.',
  },
  {
    id: '4',
    title: 'Logic & Timers',
    experimentIds: range(15, 23),
    blurb:
      'Logic gates, the 555 timer, flip-flops, counters — the digital primitives that turn analog signals into decisions.',
  },
  {
    id: '5',
    title: 'Going Further (incl. Arduino)',
    experimentIds: range(24, 36),
    blurb:
      'Audio, radio, sensors, and the jump to microcontrollers — Arduino sketches in Wokwi pick up where the breadboard leaves off.',
  },
];

function range(start: number, end: number): string[] {
  const out: string[] = [];
  for (let i = start; i <= end; i++) out.push(String(i));
  return out;
}

export function getChapter(id: string): ChapterMeta | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

// Build-time loader for the 36 paraphrased experiment briefs at .factory/briefs/exp-*.yaml.
// This module is server-only (uses node:fs); never import it from a 'use client' module
// without going through a server component intermediary.

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';

export type BriefVar = {
  name: string;
  min: number;
  max: number;
  step?: number;
  default?: number;
  unit?: string;
};

export type BriefFormula = {
  id: string;
  latex: string;
  vars: BriefVar[];
  solve_for: { name: string; unit?: string; precision?: number };
  description?: string;
};

export type Brief = {
  id: string;
  number: number;
  chapter: number;
  title: string;
  slug: string;
  learning_objective: string;
  paraphrased_summary: string;
  parts: string[];
  formulas: BriefFormula[];
  schematic_description: string;
  suggested_falstad_circuit: string | null;
  suggested_wokwi_project_id: string | null;
  takeaways: string[];
  notes_for_implementer?: string;
};

const BRIEFS_DIR = path.join(process.cwd(), '.factory', 'briefs');

function loadAll(): Brief[] {
  const out: Brief[] = [];
  for (let n = 1; n <= 36; n++) {
    const p = path.join(BRIEFS_DIR, `exp-${n}.yaml`);
    const raw = fs.readFileSync(p, 'utf8');
    const data = parseYaml(raw) as Brief;
    // Defensive normalization
    data.formulas = data.formulas || [];
    data.parts = data.parts || [];
    data.takeaways = data.takeaways || [];
    out.push(data);
  }
  out.sort((a, b) => a.number - b.number);
  return out;
}

// Cached at module init.
const ALL_BRIEFS: Brief[] = loadAll();

export function getAllBriefs(): Brief[] {
  return ALL_BRIEFS;
}

export function getBriefByNumber(n: number): Brief | undefined {
  return ALL_BRIEFS.find((b) => b.number === n);
}

export function getBriefsByChapter(chapter: number): Brief[] {
  return ALL_BRIEFS.filter((b) => b.chapter === chapter);
}

/** True if `s` looks like a real CircuitJS .cir payload, not a "TBD..." note. */
export function isRealCirString(s: string | null | undefined): boolean {
  if (!s) return false;
  const t = s.trim();
  if (!t) return false;
  if (/^TBD/i.test(t) || /^N\/A/i.test(t)) return false;
  // CircuitJS .cir files start with a `$` header line (timestep, sim params).
  return t.startsWith('$');
}

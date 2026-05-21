/**
 * Wokwi project loader — reads the captured artifacts for Chapter 5 Arduino
 * briefs at build time and exposes them as serializable data to server
 * components.
 *
 * Sprint A produced `content/wokwi-projects/exp-N-slug/` with the sketch +
 * diagram + meta + a paired `public/wokwi-captures/exp-N/` containing the
 * headlessly-rendered screenshot + serial log. This module stitches the two
 * together and returns a `WokwiProject` ready to render.
 *
 * Notes on the "Open in Wokwi" link:
 *   Wokwi exposes per-project public URLs of the form
 *     https://wokwi.com/projects/<id>
 *   and a "new project" page
 *     https://wokwi.com/projects/new/arduino-uno
 *   but there is no documented stable "import via URL" / "share by payload"
 *   API as of 2026-05. We tried both shapes:
 *     - `?text=` and `?diagram=`  — not honored on /projects/new/arduino-uno
 *     - direct payload encoding   — no documented format
 *   So we ship the safe fallback: link to the generic Arduino Uno starter
 *   project. The learner can paste the sketch + diagram by hand. The button
 *   is still pedagogically useful (lets them poke at a live simulator) even
 *   if it doesn't preload our exact project.
 *
 *   TODO: replace this with a real import-by-URL link generator if/when
 *   Wokwi documents that flow. See https://docs.wokwi.com/ for status.
 */

import fs from 'node:fs';
import path from 'node:path';

// Next.js server components run with process.cwd() set to the project root
// (where next.config.mjs lives). __dirname is unreliable here because the
// server bundle moves the file into .next/server/.
const REPO_ROOT = process.cwd();
const PROJECTS_DIR = path.join(REPO_ROOT, 'content', 'wokwi-projects');
const CAPTURES_DIR = path.join(REPO_ROOT, 'public', 'wokwi-captures');

export type WokwiProjectMeta = {
  title: string;
  summary: string;
  screenshotPart?: string;
  screenshotTimeMs?: number;
  timeoutMs?: number;
};

export type WokwiProject = {
  number: number;
  slug: string;
  /** Sketch source text (the .ino file). */
  sketch: string;
  /** Path served by Next from /public — starts with /wokwi-captures/exp-N/screenshot.png */
  screenshotPath: string;
  /** Full serial log text. */
  serialLog: string;
  meta: WokwiProjectMeta;
  /** Best-effort URL to a Wokwi simulator. Always set. */
  openInWokwiHref: string;
};

/**
 * Locate the `exp-N-slug` directory for a given brief number, or null.
 * Cached at module load.
 */
let dirIndex: Map<number, string> | null = null;

function indexProjectDirs(): Map<number, string> {
  if (dirIndex) return dirIndex;
  const map = new Map<number, string>();
  if (!fs.existsSync(PROJECTS_DIR)) {
    dirIndex = map;
    return map;
  }
  for (const entry of fs.readdirSync(PROJECTS_DIR)) {
    const m = entry.match(/^exp-(\d+)(?:-.+)?$/);
    if (!m) continue;
    const num = Number(m[1]);
    const full = path.join(PROJECTS_DIR, entry);
    if (fs.statSync(full).isDirectory()) {
      map.set(num, entry);
    }
  }
  dirIndex = map;
  return map;
}

function readIfExists(filepath: string): string | null {
  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch {
    return null;
  }
}

export function getWokwiProject(briefNumber: number): WokwiProject | null {
  const idx = indexProjectDirs();
  const slug = idx.get(briefNumber);
  if (!slug) return null;

  const projDir = path.join(PROJECTS_DIR, slug);
  const sketchPath = path.join(projDir, `${slug}.ino`);
  const sketch = readIfExists(sketchPath);
  if (sketch === null) return null;

  const metaRaw = readIfExists(path.join(projDir, 'meta.json'));
  let meta: WokwiProjectMeta = { title: slug, summary: '' };
  if (metaRaw) {
    try {
      const parsed = JSON.parse(metaRaw);
      meta = {
        title: typeof parsed.title === 'string' ? parsed.title : slug,
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        screenshotPart: parsed.screenshotPart,
        screenshotTimeMs: parsed.screenshotTimeMs,
        timeoutMs: parsed.timeoutMs,
      };
    } catch {
      // ignore malformed meta — keep defaults
    }
  }

  // Graceful fallback: no captures means we should NOT render the panel.
  const captureDir = path.join(CAPTURES_DIR, `exp-${briefNumber}`);
  const screenshotFile = path.join(captureDir, 'screenshot.png');
  if (!fs.existsSync(screenshotFile)) return null;
  const stat = fs.statSync(screenshotFile);
  if (stat.size <= 0) return null;

  const serialLog = readIfExists(path.join(captureDir, 'serial.log')) ?? '';
  const screenshotPath = `/wokwi-captures/exp-${briefNumber}/screenshot.png`;

  // See the file-header note: safe fallback to the Arduino Uno starter page.
  const openInWokwiHref = 'https://wokwi.com/projects/new/arduino-uno';

  return {
    number: briefNumber,
    slug,
    sketch,
    screenshotPath,
    serialLog,
    meta,
    openInWokwiHref,
  };
}

/** Convenience: return the first N lines of the serial log (for the panel preview). */
export function summarizeSerial(serialLog: string, maxLines = 10): string {
  if (!serialLog) return '';
  const lines = serialLog.split(/\r?\n/);
  const kept = lines.filter((l) => l.length > 0).slice(0, maxLines);
  return kept.join('\n');
}

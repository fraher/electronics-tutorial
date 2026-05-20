import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const ROUTES = [
  { path: '/', label: 'home' },
  { path: '/schematic-gallery', label: 'gallery' },
  { path: '/chapter/1', label: 'ch1-index' },
  { path: '/chapter/1/experiment/1', label: 'exp-1-taste-power' },
  { path: '/chapter/1/experiment/3', label: 'exp-3' },
  { path: '/chapter/2/experiment/7', label: 'exp-7-capacitor' },
  { path: '/chapter/3/experiment/14', label: 'exp-14-relay' },
  { path: '/chapter/3/experiment/22', label: 'exp-22-oscillator' },
  { path: '/chapter/4/experiment/25', label: 'exp-25-logic' },
  { path: '/chapter/5/experiment/29', label: 'exp-29-arduino-blink' },
  { path: '/chapter/5/experiment/32', label: 'exp-32-arduino-pot' },
];

const BASE = 'http://localhost:3001';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const findings = [];
page.on('console', msg => {
  if (msg.type() === 'error') findings.push({ kind: 'console-error', text: msg.text() });
});
page.on('pageerror', err => findings.push({ kind: 'page-error', text: err.message }));

const report = [];
for (const r of ROUTES) {
  const url = BASE + r.path;
  const routeFindings = [];
  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', m => { if (m.type() === 'error') routeFindings.push({ kind:'console-error', text: m.text() }); });
  page.on('pageerror', e => routeFindings.push({ kind:'page-error', text: e.message }));
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    const ssPath = `.factory/playtest/screenshots/${r.label}.png`;
    await page.screenshot({ path: ssPath, fullPage: true });
    // probe iframes
    const iframes = await page.locator('iframe').all();
    const iframeInfo = [];
    for (const f of iframes) {
      const src = await f.getAttribute('src');
      const title = await f.getAttribute('title');
      iframeInfo.push({ src, title });
    }
    // probe LiveSchematic SVGs
    const svgCount = await page.locator('svg[role="img"]').count();
    // count formula sliders
    const sliderCount = await page.locator('[role="slider"]').count();
    report.push({ route: r.path, label: r.label, screenshot: ssPath, iframes: iframeInfo, svgCount, sliderCount, errors: routeFindings });
  } catch (e) {
    report.push({ route: r.path, label: r.label, error: e.message });
  }
}

await browser.close();
await fs.writeFile('.factory/playtest/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ routes: report.length, screenshots: report.filter(r=>r.screenshot).length, errors: report.flatMap(r=>r.errors||[]).length }, null, 2));

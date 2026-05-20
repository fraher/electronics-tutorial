import { test, expect } from '@playwright/test';
import { getAllBriefs } from '../../lib/briefs';

const briefs = getAllBriefs();
const allRoutes = [
  '/',
  '/schematic-gallery',
  ...briefs.map((b) => `/chapter/${b.chapter}/experiment/${b.number}`),
];

for (const path of allRoutes) {
  test(`route ${path} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

    const failedRequests: Array<{ url: string; status: number }> = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failedRequests.push({ url: r.url(), status: r.status() });
    });

    await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Settle: let CircuitJS / Wokwi iframes attempt their resource fetches.
    await page.waitForTimeout(2500);

    // Allow benign 404s on optional CircuitJS service-worker only.
    const fatal = failedRequests.filter(
      (r) =>
        !r.url.includes('/circuitjs/service-worker.js') &&
        !r.url.includes('wokwi.com'),
    );

    // Console errors are tolerated for Wokwi placeholder pages (the embed deliberately doesn't load)
    // and CircuitJS pages that show the SW-missing warning. Surface them in the assertion message
    // so regressions are obvious.
    expect.soft(fatal, `failed requests on ${path}`).toEqual([]);

    // Screenshot every route for visual review.
    await page.screenshot({
      path: `tests/playtest/screenshots${path === '/' ? '/home' : path}.png`,
      fullPage: true,
    });
  });
}

import { test, expect } from '@playwright/test';

// Briefs 29..36 are the Chapter-5 Arduino projects that ship with a captured
// Wokwi screenshot + sketch + serial log via /lib/wokwi-projects.
const WOKWI_BRIEFS = [29, 30, 31, 32, 33, 34, 35, 36];

for (const n of WOKWI_BRIEFS) {
  test(`Wokwi panel renders for exp-${n}`, async ({ page }) => {
    await page.goto(`/chapter/5/experiment/${n}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const panel = page.getByTestId(`wokwi-panel-exp-${n}`);
    await expect(panel).toBeVisible();

    // Screenshot image with correct src + alt
    const img = panel.locator('img').first();
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toContain(`/wokwi-captures/exp-${n}/screenshot.png`);
    const alt = await img.getAttribute('alt');
    expect(alt && alt.length > 0).toBeTruthy();

    // Sketch code block has non-trivial content (>= 5 lines) — visible by default
    const sketchCode = panel.getByTestId('wokwi-panel-sketch');
    const sketchText = (await sketchCode.textContent()) ?? '';
    expect(sketchText.split('\n').filter((l) => l.trim().length > 0).length).toBeGreaterThanOrEqual(5);

    // Tab to diagram and assert the diagram source mentions a Wokwi part
    await panel.getByTestId('wokwi-panel-tab-diagram').click();
    const diagCode = panel.getByTestId('wokwi-panel-diagram');
    await expect(diagCode).toBeVisible();
    const diagText = (await diagCode.textContent()) ?? '';
    expect(diagText).toContain('wokwi-arduino-uno');

    // Tab back so the screenshot evidence captures the sketch view
    await panel.getByTestId('wokwi-panel-tab-sketch').click();

    // Open-in-Wokwi link present, external, target=_blank
    const link = panel.getByTestId('wokwi-panel-open-link');
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https:\/\/wokwi\.com\//);
    expect(await link.getAttribute('target')).toBe('_blank');

    // Copy buttons present + clickable
    await expect(panel.getByTestId('wokwi-panel-copy-sketch')).toBeVisible();
    await expect(panel.getByTestId('wokwi-panel-copy-diagram')).toBeVisible();

    // Visual evidence
    await page.screenshot({
      path: `tests/playtest/screenshots/wokwi-exp-${n}.png`,
      fullPage: true,
    });
  });
}

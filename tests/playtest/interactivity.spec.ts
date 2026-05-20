import { test, expect } from '@playwright/test';

test.describe('bidirectional SVG interactivity', () => {
  test('schematic-gallery: LiveSwitch click toggles data-state', async ({ page }) => {
    await page.goto('/schematic-gallery', { waitUntil: 'domcontentloaded' });
    const sw = page.locator('[data-testid="gallery-sw"]');
    await expect(sw).toHaveAttribute('data-state', 'closed');
    await sw.click();
    await expect(sw).toHaveAttribute('data-state', 'open');
    await page.screenshot({
      path: 'tests/playtest/screenshots/interactivity-switch.png',
      fullPage: true,
    });
  });

  test('schematic-gallery: LiveGate input pin click flips state', async ({ page }) => {
    await page.goto('/schematic-gallery', { waitUntil: 'domcontentloaded' });
    const pin = page.locator('[data-testid="gallery-gate-in1-hit"]');
    await expect(pin).toBeVisible();
    const before = await page
      .locator('[data-testid="gallery-gate-in1"]')
      .getAttribute('data-state');
    await pin.click();
    const after = await page
      .locator('[data-testid="gallery-gate-in1"]')
      .getAttribute('data-state');
    expect(after).not.toBe(before);
  });

  test('chapter/4/experiment/19: clicking a gate input pin updates the gate', async ({ page }) => {
    await page.goto('/chapter/4/experiment/19', { waitUntil: 'domcontentloaded' });
    // The page renders the schematic twice: once at top (static composite) and once inside the
    // FormulaSlider (bidirectional). Scope to the slider-bound copy so our click drives state.
    const sliderSchem = page.locator('[data-testid="formula-slider-schematic"]').first();
    await sliderSchem.waitFor({ state: 'attached', timeout: 10_000 });
    const anyHit = sliderSchem.locator('[data-testid^="sch19-"][data-testid$="-in0-hit"]').first();
    const pinSel = sliderSchem.locator('[data-testid^="sch19-"][data-testid$="-in0"]').first();
    const before = await pinSel.getAttribute('data-state');
    // The pin lives near the top edge of the SVG; dispatch click directly to avoid
    // Playwright's "outside viewport" guard on tiny SVG elements.
    await anyHit.dispatchEvent('click');
    // Allow render
    await page.waitForTimeout(150);
    const after = await pinSel.getAttribute('data-state');
    expect(after).not.toBe(before);
    await page.screenshot({
      path: 'tests/playtest/screenshots/interactivity-exp19-gate.png',
      fullPage: true,
    });
  });

  test('chapter/1/experiment/4: drag the interactive resistor changes slider value', async ({
    page,
  }) => {
    await page.goto('/chapter/1/experiment/4', { waitUntil: 'domcontentloaded' });
    // Scope to the slider-bound schematic (the static one above doesn't wire onVarChange).
    const sliderSchem = page.locator('[data-testid="formula-slider-schematic"]').first();
    await sliderSchem.waitFor({ state: 'attached', timeout: 10_000 });
    const r = sliderSchem.locator('[data-testid="sch4-R"]').first();
    await r.scrollIntoViewIfNeeded();

    // Find the R slider's current aria-valuenow before drag
    const rSliderBefore = await page
      .locator('[role="slider"][aria-label^="R"]')
      .first()
      .getAttribute('aria-valuenow');

    // Programmatically dispatch pointer events for a deterministic drag
    const box = await r.boundingBox();
    if (!box) throw new Error('resistor not laid out');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy - 80, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(200);

    const rSliderAfter = await page
      .locator('[role="slider"][aria-label^="R"]')
      .first()
      .getAttribute('aria-valuenow');
    expect(rSliderAfter).not.toBe(rSliderBefore);
    await page.screenshot({
      path: 'tests/playtest/screenshots/interactivity-exp4-resistor.png',
      fullPage: true,
    });
  });
});

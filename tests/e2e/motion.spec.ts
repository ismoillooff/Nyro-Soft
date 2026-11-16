import { expect, test, type Page } from "@playwright/test";

/**
 * Regression tests for the build animation and the scroll reveals. They check
 * observable state (opacity, what is hidden, what can be clicked), not timings
 * or element counts.
 */

/** The lowest effective opacity (own × ancestors) of the elements matched. */
async function minOpacity(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    let min = 1;
    for (const el of Array.from(document.querySelectorAll(sel))) {
      let o = 1;
      for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
      min = Math.min(min, o);
    }
    return Math.round(min * 100) / 100;
  }, selector);
}

/** Main-content elements inside the viewport that are (nearly) invisible. */
async function hiddenInView(page: Page): Promise<number> {
  return page.evaluate(() => {
    let n = 0;
    for (const el of Array.from(document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button, main li"))) {
      if (el.closest("[aria-hidden='true']")) continue; // decorative layers (e.g. the inactive process frames)
      const r = el.getBoundingClientRect();
      if (!r.width || r.bottom <= 0 || r.top >= innerHeight) continue;
      let o = 1;
      for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) o *= Number(getComputedStyle(a).opacity);
      if (o < 0.05) n++;
    }
    return n;
  });
}

test.describe("build animation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("never dims the hero text or the CTA, and never claims reveals below", async ({ page }) => {
    await page.goto("/");
    const samples: number[] = [];
    // Sample through the entrance and the automatic hero build.
    const until = Date.now() + 3200;
    while (Date.now() < until) {
      samples.push(await minOpacity(page, "#hero-title, #hero-title > span, main a[href$='#brif']"));
      await page.waitForTimeout(120);
    }
    expect(Math.min(...samples)).toBe(1);
    // The old hand-off markers are gone, and what is below the fold waits for its own observer.
    await expect(page.locator("[data-build-pending], [data-build-claimed]")).toHaveCount(0);
    await expect(page.locator("#xizmatlar [data-reveal='hidden']").first()).toBeAttached();
  });

  test("the hero CTA works before the build has finished", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1100);
    await page.locator("main").getByRole("link", { name: "Loyihani boshlash" }).click();
    await expect(page).toHaveURL(/#brif$/);
    await expect(page.locator("#brif-title")).toBeInViewport();
  });

  test("Escape stops it, nothing stays hidden, and a reload does not replay it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-build-layer]")).toBeAttached({ timeout: 5000 });
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-build-layer]")).toHaveCount(0);
    expect(await hiddenInView(page)).toBe(0);
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("[data-build-layer]")).toHaveCount(0);
  });

  test("the page is marked built only after the run has played", async ({ page }) => {
    await page.goto("/");
    const key = () => page.evaluate(() => sessionStorage.getItem("nyro-build:/"));
    expect(await key()).toBeNull();
    await expect.poll(key, { timeout: 8000 }).toBe("1");
  });
});

test.describe("scroll reveals", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a section entered through its hash is readable", async ({ page }) => {
    await page.goto("/#demo");
    await expect.poll(() => hiddenInView(page), { timeout: 1500 }).toBe(0);
    await expect(page.locator("#demo-title")).toBeInViewport();
  });

  test("fast scrolling does not pile up a queue", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await expect.poll(() => hiddenInView(page), { timeout: 1200 }).toBe(0);
    await page.evaluate(() => window.scrollTo({ top: Math.round(document.documentElement.scrollHeight / 2), behavior: "instant" }));
    await expect.poll(() => hiddenInView(page), { timeout: 1200 }).toBe(0);
  });

  test("keyboard focus shows a hidden element at once", async ({ page }) => {
    await page.goto("/");
    const question = page.locator("#savollar button[aria-expanded]").first();
    await expect(page.locator("#savollar [data-reveal='hidden']").first()).toBeAttached();
    await question.focus();
    await expect(page.locator("#savollar [data-reveal='hidden']:has(button[aria-expanded])")).toHaveCount(0);
  });

  test("a route change leaves no hidden content behind", async ({ page }) => {
    await page.goto("/");
    await page.locator("#xizmatlar").getByRole("link", { name: "Web platformalar" }).first().click();
    await expect(page).toHaveURL(/xizmatlar\/web-platformalar/);
    await expect.poll(() => hiddenInView(page), { timeout: 1500 }).toBe(0);
    await page.goBack();
    await expect.poll(() => hiddenInView(page), { timeout: 1500 }).toBe(0);
  });

  test("turning on reduced motion while the page is open shows everything", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-reveal='hidden']").first()).toBeAttached();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    await expect(page.locator("[data-build-layer]")).toHaveCount(0);
  });
});

test.describe("menu, FAQ and brief by keyboard", () => {
  test("the mobile menu closes with Escape, returns focus and unlocks the page", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menyuni ochish" });
    await toggle.click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await expect(toggle).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe("hidden");
  });

  test("the brief moves forward and back from the keyboard and keeps the answers", async ({ page }) => {
    await page.goto("/#brif", { waitUntil: "networkidle" });
    const web = page.getByRole("checkbox", { name: "Web platforma" });
    await web.focus();
    await page.keyboard.press("Space");
    await expect(web).toBeChecked();
    await page.getByRole("button", { name: /Davom etish/ }).press("Enter");
    await expect(page.getByRole("heading", { name: "Loyiha haqida" })).toBeFocused();
    await page.getByRole("button", { name: "Orqaga" }).press("Enter");
    await expect(page.getByRole("checkbox", { name: "Web platforma" })).toBeChecked();
  });
});

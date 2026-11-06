import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/",
  "/xizmatlar/web-platformalar",
  "/xizmatlar/mobil-ilovalar",
  "/xizmatlar/ui-ux-dizayn",
  "/xizmatlar/biznesni-avtomatlashtirish",
  "/loyihalar/biznes-boshqaruv-platformasi",
  "/loyihalar/mobil-moliya-ilovasi",
];

/** Console errors other than missing optional resources. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) errors.push(m.text());
  });
  return errors;
}

/** Elements that stick out of the viewport and are not clipped by an ancestor. */
async function overflowing(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const r = el.getBoundingClientRect();
      if (!r.width || r.right <= W + 1) continue;
      let a = el.parentElement;
      let clipped = false;
      while (a && a !== document.body) {
        const s = getComputedStyle(a);
        if ((s.overflowX === "hidden" || s.overflowX === "clip" || s.contain.includes("paint")) && a.getBoundingClientRect().right <= W + 1) {
          clipped = true;
          break;
        }
        a = a.parentElement;
      }
      if (!clipped) out.push(`${el.tagName}.${String(el.className).slice(0, 60)}`);
    }
    return out;
  });
}

test.describe("routes", () => {
  for (const path of ROUTES) {
    test(`${path} renders one h1, meta and no errors`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
      expect(errors).toEqual([]);
    });
  }

  test("prerendered HTML carries the content without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Katta g‘oyalar.");
    await expect(page.locator("#xizmatlar h3").first()).toBeVisible();
    // No content is hidden by inline opacity in the static HTML.
    const hidden = await page.locator('main [style*="opacity: 0"], main [style*="opacity:0"]').count();
    expect(hidden).toBe(0);
    await ctx.close();
  });

  test("unknown URL answers 404 with the static page", async ({ page }) => {
    const res = await page.goto("/bunday-sahifa-yoq");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sahifa topilmadi");
  });
});

test.describe("layout", () => {
  for (const width of [360, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const path of ROUTES) {
        await page.goto(path);
        const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(sw, path).toBe(0);
        expect(await overflowing(page), path).toEqual([]);
      }
    });
  }
});

test.describe("keyboard and widgets", () => {
  test("skip link is the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Asosiy kontentga o‘tish");
  });

  test("mobile menu opens as a dialog, Escape closes and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menyuni ochish" });
    await toggle.click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Xizmatlar" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });

  test("demo tabs follow the WAI-ARIA pattern", async ({ page }) => {
    await page.goto("/#demo");
    const first = page.getByRole("tab", { name: "Wireframe" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Dizayn" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Natija" })).toBeFocused();
    await expect(page.getByText("Ishlaydigan namuna · ma’lumotlar namunaviy")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(first).toHaveAttribute("aria-selected", "true");
  });

  test("project filter announces the count and shows the empty state", async ({ page }) => {
    await page.goto("/#loyihalar");
    const button = page.getByRole("button", { name: /Avtomatlashtirish/ });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: "0 ta loyiha ko‘rsatilmoqda" })).toBeAttached();
    await expect(page.getByText("Bu yo‘nalishda hozircha konsept loyiha yo‘q.")).toBeVisible();
    await expect(button).toBeFocused();
  });

  test("FAQ opens with Enter and exposes a labelled region", async ({ page }) => {
    await page.goto("/#savollar");
    const q = page.getByRole("button", { name: "Loyiha narxi qanday hisoblanadi?" });
    await q.focus();
    await page.keyboard.press("Enter");
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("region", { name: "Loyiha narxi qanday hisoblanadi?" })).toBeVisible();
  });

  test("brief blocks an empty first step and focuses the first field", async ({ page }) => {
    await page.goto("/#brif");
    await page.getByRole("button", { name: /Davom etish/ }).click();
    await expect(page.getByText("Kamida bitta xizmat turini tanlang.")).toBeVisible();
    await expect(page.locator(":focus")).toHaveAttribute("type", "checkbox");
  });

  test("?xizmat preselects the service after mount", async ({ page }) => {
    await page.goto("/?xizmat=biznesni-avtomatlashtirish#brif");
    await expect(page.getByRole("checkbox", { name: "Biznesni avtomatlashtirish" })).toBeChecked();
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("marquee is a static list without copies, process is not sticky", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('.marquee ul[aria-label="Texnologiyalar"]')).toHaveCount(1);
    await expect(page.locator(".marquee-track ul[aria-hidden]")).toHaveCount(0);
    const anim = await page.locator(".marquee-track").evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe("none");
    await page.setViewportSize({ width: 1440, height: 900 });
    const position = await page.locator("#yondashuv > div > div").evaluate((el) => getComputedStyle(el).position);
    expect(position).not.toBe("sticky");
  });
});

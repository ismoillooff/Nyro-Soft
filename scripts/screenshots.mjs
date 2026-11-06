// Usage: node shots.mjs <baseUrl> <outDir> [path=/] [widths=360,1440] [--reduced] [--full]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [base, out, path = "/", widthsArg = "360,1440", ...flags] = process.argv.slice(2);
const widths = widthsArg.split(",").map(Number);
const reduced = flags.includes("--reduced");
const full = !flags.includes("--viewport");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const name = path === "/" ? "home" : path.replace(/[/?#=]+/g, "_").replace(/^_|_$/g, "");
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 800 ? 780 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Scroll through to trigger reveals/lazy figures, then back to top.
  if (full) {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(90); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const file = `${out}/${name}-${w}${reduced ? "-rm" : ""}.png`;
  await page.screenshot({ path: file, fullPage: full });
  console.log(`${file} overflowX=${overflow} errors=${errors.length}`);
  for (const e of errors.slice(0, 8)) console.log("   ", e.slice(0, 300));
  await ctx.close();
}
await browser.close();

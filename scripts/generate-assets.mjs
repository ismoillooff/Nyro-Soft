/**
 * Generates public/favicon.svg, favicon.ico, apple-touch-icon.png and og.png,
 * and prints metric overrides for the Geist fallback fonts.
 * Needs Chrome (Playwright uses the installed channel).
 *
 *   node scripts/generate-assets.mjs
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(".");
const pub = (f) => resolve(root, "public", f);
/** Fonts are inlined as data URLs: pages set with setContent cannot load file:// URLs. */
const font = (pkg, file) =>
  `data:font/woff2;base64,${readFileSync(resolve(root, "node_modules/@fontsource-variable", pkg, "files", file)).toString("base64")}`;

const INK = "#171B24";
const ACCENT = "#2659EF";
const BG = "#FAFAF7";
const N_PATH = "M4 20V4h4.4L16 14.6V4h4v16h-4.4L8 9.4V20z"; // the header logo, 24×24

// ── favicon.svg ────────────────────────────────────────────────────────────
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${ACCENT}"/><path transform="translate(4 4)" fill="#fff" d="${N_PATH}"/></svg>\n`;
writeFileSync(pub("favicon.svg"), faviconSvg);

// The rest pose of the hero N, already exported for the site.
const restModule = readFileSync(resolve(root, "app/components/hairline/nyro-rest.ts"), "utf8");
const pick = (name) => {
  const m = new RegExp(`export const ${name}\\s*=\\s*(\`[\\s\\S]*?\`|"(?:[^"\\\\]|\\\\.)*")`).exec(restModule);
  if (!m) throw new Error(`${name} not found in nyro-rest.ts`);
  return m[1].startsWith("`") ? m[1].slice(1, -1) : JSON.parse(m[1]);
};
const restSvg = pick("NYRO_REST_SVG");
const kernelCss = pick("HAIRLINE_KERNEL_CSS");

const fontFaces = `
@font-face{font-family:"Geist";src:url("${font("geist", "geist-latin-wght-normal.woff2")}") format("woff2");font-weight:100 900}
@font-face{font-family:"Geist";src:url("${font("geist", "geist-latin-ext-wght-normal.woff2")}") format("woff2");font-weight:100 900;unicode-range:U+0100-02BA,U+02BD-02C5}
@font-face{font-family:"Geist Mono";src:url("${font("geist-mono", "geist-mono-latin-wght-normal.woff2")}") format("woff2");font-weight:100 900}`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces}
${kernelCss}
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;background:${BG};color:${INK};font-family:"Geist",sans-serif;-webkit-font-smoothing:antialiased}
.frame{position:absolute;inset:40px;border:1px solid rgba(23,27,36,.18)}
.plus{position:absolute;width:9px;height:9px}
.plus::before,.plus::after{content:"";position:absolute;background:rgba(23,27,36,.18)}
.plus::before{left:4px;top:0;width:1px;height:9px}.plus::after{top:4px;left:0;height:1px;width:9px}
.tl{top:-5px;left:-5px}.tr{top:-5px;right:-5px}.bl{bottom:-5px;left:-5px}.br{bottom:-5px;right:-5px}
.brand{position:absolute;left:72px;top:76px;display:flex;align-items:center;gap:12px;font-weight:600;font-size:24px;letter-spacing:-.02em}
.label{position:absolute;right:72px;top:82px;font-family:"Geist Mono",monospace;font-size:15px;color:#667085;letter-spacing:.02em}
h1{position:absolute;left:72px;top:188px;font-size:76px;line-height:1.02;letter-spacing:-.04em;font-weight:600}
h1 span{display:block}h1 .a{color:${ACCENT}}
.foot{position:absolute;left:72px;bottom:76px;font-size:22px;color:#4B5565}
.fig{position:absolute;right:56px;top:150px;width:420px;aspect-ratio:5/4;--hl-plate:${BG};--hl-hi:${ACCENT};--hl-edge:#3B4352;--hl-mid:#9AA2AF;--hl-lo:#D9DDE3;--hl-sw:1.2}
.fig>svg{position:absolute;inset:0;width:100%;height:100%}
</style></head><body>
<div class="frame"><i class="plus tl"></i><i class="plus tr"></i><i class="plus bl"></i><i class="plus br"></i></div>
<div class="brand"><svg width="30" height="30" viewBox="0 0 24 24"><path fill="${INK}" d="${N_PATH}"/></svg>Nyro Soft</div>
<div class="label">Digital mahsulotlar studiyasi</div>
<h1><span>Katta g‘oyalar.</span><span>Puxta dizayn.</span><span class="a">Kuchli texnologiya.</span></h1>
<p class="foot">Veb platformalar · Mobil ilovalar · UI/UX · Avtomatlashtirish</p>
<div class="fig" data-hairline="nyro"><svg viewBox="0 0 400 320" aria-hidden="true">${restSvg}</svg></div>
</body></html>`;

const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  // ── og.png ────────────────────────────────────────────────────────────────
  await page.setContent(ogHtml, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: pub("og.png"), type: "png" });

  // ── icons: rasterise the favicon SVG ─────────────────────────────────────
  const raster = async (size, padded) => {
    await page.setViewportSize({ width: size, height: size });
    const svg = padded
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${ACCENT}"/><path transform="translate(6 6) scale(.8333)" fill="#fff" d="${N_PATH}"/></svg>`
      : faviconSvg;
    await page.setContent(
      `<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" width="${size}" height="${size}" style="display:block"></body></html>`,
    );
    return page.screenshot({ type: "png", omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  };
  writeFileSync(pub("apple-touch-icon.png"), await raster(180, true));
  const png16 = await raster(16, false);
  const png32 = await raster(32, false);
  const png48 = await raster(48, false);

  // ICO container with PNG payloads (supported by every current browser).
  const images = [
    [16, png16],
    [32, png32],
    [48, png48],
  ];
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(([size, png], i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size, e);
    header.writeUInt8(size, e + 1);
    header.writeUInt8(0, e + 2);
    header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  writeFileSync(pub("favicon.ico"), Buffer.concat([header, ...images.map(([, png]) => png)]));

  // ── fallback metrics: Geist vs Arial, Geist Mono vs Courier New ──────────
  await page.setViewportSize({ width: 800, height: 400 });
  await page.setContent(`<html><head><style>${fontFaces}</style></head><body></body></html>`);
  const metrics = await page.evaluate(async () => {
    await document.fonts.load('400 100px "Geist"');
    await document.fonts.load('600 100px "Geist"');
    await document.fonts.load('400 100px "Geist Mono"');
    const sample = "Katta g‘oyalar. Puxta dizayn. Kuchli texnologiya. Biznesingizni rivojlantiradigan veb platformalar";
    const ctx = document.createElement("canvas").getContext("2d");
    const measure = (f) => {
      ctx.font = f;
      const m = ctx.measureText(sample);
      return { w: m.width, a: m.fontBoundingBoxAscent, d: m.fontBoundingBoxDescent };
    };
    const pair = (web, local) => {
      const g = measure(`400 100px "${web}"`);
      const f = measure(`400 100px ${local}`);
      const size = g.w / f.w;
      return {
        sizeAdjust: `${(size * 100).toFixed(2)}%`,
        ascentOverride: `${((g.a / 100 / size) * 100).toFixed(2)}%`,
        descentOverride: `${((g.d / 100 / size) * 100).toFixed(2)}%`,
      };
    };
    return { sans: pair("Geist", "Arial"), mono: pair("Geist Mono", '"Courier New"') };
  });
  console.log("Fallback metrics (paste into app/styles/app.css):");
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
}
console.log("Wrote public/favicon.svg, favicon.ico, apple-touch-icon.png, og.png");

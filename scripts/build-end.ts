/**
 * Runs after `react-router build` (react-router.config.ts → buildEnd):
 *  - writes sitemap.xml and robots.txt for SITE_URL / ROBOTS_ALLOW,
 *  - turns the prerendered /404 page into a static, script-free 404.html
 *    (served with a real 404 status by the web server, see README),
 *  - prints the release blockers (no brief endpoint and no contact channel).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadEnv, type ResolvedConfig } from "vite";
import { site } from "../app/content/site";

interface Options {
  buildDirectory: string;
  viteConfig: ResolvedConfig;
  paths: readonly string[];
}

const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

export async function finalizeBuild({ buildDirectory, viteConfig, paths }: Options): Promise<void> {
  const env = loadEnv(viteConfig.mode, viteConfig.root, "");
  const client = resolve(buildDirectory, "client");
  const siteUrl = (env.SITE_URL || "").replace(/\/+$/, "");
  const robotsAllow = env.ROBOTS_ALLOW !== "false";
  const origin = siteUrl || "http://localhost:5173";

  // sitemap.xml
  const today = new Date().toISOString().slice(0, 10);
  const urls = paths
    .map((p) => `  <url><loc>${origin}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n");
  await writeFile(
    join(client, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );

  // robots.txt
  const robots = robotsAllow
    ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n";
  await writeFile(join(client, "robots.txt"), robots);

  // 404.html: the prerendered not-found page without scripts, so it works for any URL.
  const prerendered = join(client, "404", "index.html");
  if (existsSync(prerendered)) {
    let html = await readFile(prerendered, "utf8");
    html = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, "")
      .replace("</head>", "<style>[data-js-only]{display:none!important}</style></head>");
    await writeFile(join(client, "404.html"), html);
    await rm(join(client, "404"), { recursive: true, force: true });
  }
  await mkdir(client, { recursive: true });

  // Release checks.
  const warnings: string[] = [];
  if (!siteUrl) warnings.push("SITE_URL is not set: canonical, Open Graph and sitemap URLs point at localhost.");
  if (!robotsAllow) warnings.push("ROBOTS_ALLOW=false: every page is noindex and robots.txt disallows all (staging build).");
  const endpoint = env.VITE_BRIEF_ENDPOINT?.trim();
  if (!endpoint && site.contacts.length === 0) {
    console.warn(
      red(
        "\n  RELEASE BLOCKER: neither VITE_BRIEF_ENDPOINT nor a real contact channel (app/content/site.ts) is configured.\n" +
          "  The brief cannot be sent and the site shows no way to reach the studio.\n",
      ),
    );
  } else if (!endpoint) {
    warnings.push("VITE_BRIEF_ENDPOINT is not set: the brief offers copy/download plus the contacts in site.ts.");
  }
  for (const w of warnings) console.warn(yellow(`  ⚠ ${w}`));
}

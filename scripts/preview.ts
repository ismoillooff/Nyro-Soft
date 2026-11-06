/**
 * Serves build/client the way the production web server should (README →
 * Nginx): a file, else <path>/index.html, else 404.html with a real 404.
 * Usage: npm run preview [-- --port 4173]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("build/client");
const portArg = process.argv.indexOf("--port");
const port = portArg > -1 ? Number(process.argv[portArg + 1]) : Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function file(path: string): string | null {
  return existsSync(path) && statSync(path).isFile() ? path : null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, "");
  const target = join(root, rel);
  if (!target.startsWith(root)) {
    res.writeHead(400).end();
    return;
  }
  const found = file(target) ?? file(join(target, "index.html"));
  const path = found ?? join(root, "404.html");
  const status = found ? 200 : 404;
  const type = TYPES[extname(path)] ?? "application/octet-stream";
  const cache = path.includes(`${join(root, "assets")}`) ? "public, max-age=31536000, immutable" : "no-cache";
  const stream = createReadStream(path);
  stream.on("error", () => {
    if (!res.headersSent) res.writeHead(500);
    res.end();
  });
  stream.once("open", () => {
    res.writeHead(status, { "Content-Type": type, "Cache-Control": cache });
    stream.pipe(res);
  });
}).listen(port, () => {
  console.log(`Preview: http://localhost:${port}`);
});

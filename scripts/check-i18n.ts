/**
 * Translation coverage: every interface string in app/i18n/uz.ts must exist in
 * ru.ts, and every content value { uz } in app/content must carry a non-empty
 * `ru`. Prints the coverage and the first missing keys; exits 1 below 100%.
 * The RU language switch stays off until this passes (app/i18n/index.tsx).
 *
 *   npm run check:i18n
 */
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ru } from "../app/i18n/ru.ts";
import { uz } from "../app/i18n/uz.ts";

type Tree = { [key: string]: unknown };

function leaves(tree: unknown, prefix = ""): string[] {
  if (typeof tree === "string") return [prefix];
  if (!tree || typeof tree !== "object") return [];
  return Object.entries(tree as Tree).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
}

function get(tree: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => (node && typeof node === "object" ? (node as Tree)[key] : undefined), tree);
}

const missing: string[] = [];
let total = 0;

// Interface strings.
for (const key of leaves(uz)) {
  total++;
  const value = get(ru, key);
  if (typeof value !== "string" || value.trim() === "") missing.push(`i18n/ru.ts → ${key}`);
}

// Content values: any object with a string `uz` is a Localized.
function walk(node: unknown, where: string) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${where}[${i}]`));
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Tree;
  if (typeof obj.uz === "string") {
    total++;
    if (typeof obj.ru !== "string" || obj.ru.trim() === "") missing.push(`${where} ("${obj.uz.slice(0, 40)}")`);
    return;
  }
  for (const [k, v] of Object.entries(obj)) walk(v, `${where}.${k}`);
}

const contentDir = resolve("app/content");
for (const file of readdirSync(contentDir).filter((f) => f.endsWith(".ts"))) {
  const mod = (await import(pathToFileURL(join(contentDir, file)).href)) as Tree;
  for (const [name, value] of Object.entries(mod)) {
    if (typeof value !== "function") walk(value, `content/${file} → ${name}`);
  }
}

const done = total - missing.length;
const pct = total === 0 ? 100 : Math.floor((done / total) * 1000) / 10;
console.log(`RU coverage: ${done}/${total} (${pct}%)`);
if (missing.length > 0) {
  for (const m of missing.slice(0, 25)) console.log(`  missing: ${m}`);
  if (missing.length > 25) console.log(`  … and ${missing.length - 25} more`);
  process.exit(1);
}

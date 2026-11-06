export type Locale = "uz" | "ru";

export const LOCALES: readonly Locale[] = ["uz", "ru"];
export const DEFAULT_LOCALE: Locale = "uz";

/**
 * Locales that are published (routes, prerender, sitemap, hreflang, the
 * UZ / RU switch). Russian is added only after `npm run check:i18n` reports
 * 100% — a half-translated language is never shown.
 */
export const ENABLED_LOCALES: readonly Locale[] = ["uz", "ru"];

export function isEnabled(locale: Locale): boolean {
  return ENABLED_LOCALES.includes(locale);
}

/**
 * A piece of copy in every language the site speaks. `uz` is the source of
 * truth; `ru` is filled in during F8 and `npm run check:i18n` reports gaps.
 */
export interface Localized {
  readonly uz: string;
  readonly ru?: string;
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

/* ─── URLs: Uzbek at the root, Russian under /ru ─────────────────────────── */

export function localeFromPath(pathname: string): Locale {
  return pathname === "/ru" || pathname.startsWith("/ru/") || pathname.startsWith("/ru?") || pathname.startsWith("/ru#")
    ? "ru"
    : "uz";
}

/** "/ru/xizmatlar/x" → "/xizmatlar/x"; "/ru" → "/". */
export function stripLocale(pathname: string): string {
  if (localeFromPath(pathname) !== "ru") return pathname;
  const rest = pathname.slice(3);
  return rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}`;
}

/**
 * Prefixes an internal absolute path for the locale: "/#brif" → "/ru#brif",
 * "/xizmatlar/x" → "/ru/xizmatlar/x". Relative links ("#brif") and other
 * schemes are returned unchanged.
 */
export function localize(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/") || path.startsWith("//")) return path;
  if (localeFromPath(path) === locale) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/?") || path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

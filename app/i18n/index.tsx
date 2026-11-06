import { createContext, use, type ReactNode } from "react";
import { ru } from "./ru";
import { DEFAULT_LOCALE, localize, type Locale, type Localized } from "./types";
import { uz, type UiDict } from "./uz";

export type { Locale, Localized } from "./types";
export { ENABLED_LOCALES, isEnabled, localeFromPath, localize, stripLocale } from "./types";

function merge<T extends object>(base: T, over: unknown): T {
  if (!over || typeof over !== "object") return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = typeof v === "string" ? v : b && typeof b === "object" ? merge(b as object, v) : b;
  }
  return out as T;
}

const dictionaries: Record<Locale, UiDict> = {
  uz,
  ru: merge<UiDict>(uz, ru),
};

export interface I18n {
  readonly locale: Locale;
  /** Interface strings. */
  readonly t: UiDict;
  /** Picks the current language from a content value, falling back to Uzbek. */
  readonly l: (value: Localized) => string;
  /** Prefixes an internal path for the current locale. */
  readonly p: (path: string) => string;
}

const cache = new Map<Locale, I18n>();

/** The strings for a locale, outside React too (meta functions). */
export function i18nFor(locale: Locale): I18n {
  let value = cache.get(locale);
  if (!value) {
    value = {
      locale,
      t: dictionaries[locale],
      l: (v) => (locale === "uz" ? v.uz : (v[locale] ?? v.uz)),
      p: (path) => localize(path, locale),
    };
    cache.set(locale, value);
  }
  return value;
}

const I18nContext = createContext<I18n>(i18nFor(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext value={i18nFor(locale)}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  return use(I18nContext);
}

/** "{n} ta loyiha" → "3 ta loyiha". */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}

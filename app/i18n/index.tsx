import { createContext, use, type ReactNode } from "react";
import { ru } from "./ru";
import { DEFAULT_LOCALE, type Locale, type Localized } from "./types";
import { uz, type UiDict } from "./uz";

export type { Locale, Localized } from "./types";

/** Whether every key of a locale is translated; filled by scripts/check-i18n.ts rules at build time. */
export const ENABLED_LOCALES: readonly Locale[] = ["uz"];

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
}

function make(locale: Locale): I18n {
  return {
    locale,
    t: dictionaries[locale],
    l: (value) => (locale === "uz" ? value.uz : (value[locale] ?? value.uz)),
  };
}

const I18nContext = createContext<I18n>(make(DEFAULT_LOCALE));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <I18nContext value={make(locale)}>{children}</I18nContext>;
}

export function useI18n(): I18n {
  return use(I18nContext);
}

/** "{n} ta loyiha" → "3 ta loyiha". */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}

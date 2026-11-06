export type Locale = "uz" | "ru";

export const LOCALES: readonly Locale[] = ["uz", "ru"];
export const DEFAULT_LOCALE: Locale = "uz";

/**
 * A piece of copy in every language the site speaks. `uz` is the source of
 * truth; `ru` is filled in during F8 and `npm run check:i18n` reports gaps.
 */
export interface Localized {
  readonly uz: string;
  readonly ru?: string;
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : DeepPartial<T[K]> };

import type { Localized } from "../i18n/types";

export interface SiteContact {
  readonly kind: "email" | "phone" | "telegram";
  /** What the visitor reads, e.g. "+998 90 123 45 67". */
  readonly value: string;
  readonly href: string;
}

export interface SiteSocial {
  readonly label: string;
  readonly href: string;
}

/**
 * Real contact channels only. Leave the arrays empty until the client confirms
 * them: the footer and the brief's "not configured" state hide empty lists.
 */
export const site = {
  name: "Nyro Soft",
  tagline: { uz: "G‘oyadan — natijagacha." } satisfies Localized,
  description: {
    uz: "Nyro Soft — veb platformalar, mobil ilovalar, UI/UX dizayn va biznesni avtomatlashtirish bo‘yicha digital mahsulotlar studiyasi.",
  } satisfies Localized,
  contacts: [] as readonly SiteContact[],
  social: [] as readonly SiteSocial[],
} as const;

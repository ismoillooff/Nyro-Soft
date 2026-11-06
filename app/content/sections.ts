import type { Localized } from "../i18n/types";

/** A home page section that takes part in the rail and the header's active state. */
export interface SectionMeta {
  readonly id: string;
  /** Mono number shown in the section label and the rail. The hero is 01. */
  readonly number: string;
  readonly label: Localized;
}

/** In page order. Numbering matches the rail labels ("02 — Loyihalar"). */
export const homeSections = {
  projects: { id: "loyihalar", number: "02", label: { uz: "Loyihalar" } },
  services: { id: "xizmatlar", number: "03", label: { uz: "Xizmatlar" } },
  tech: { id: "texnologiyalar", number: "04", label: { uz: "Texnologiyalar" } },
  demo: { id: "demo", number: "05", label: { uz: "Demo" } },
  process: { id: "yondashuv", number: "06", label: { uz: "Yondashuv" } },
  deliverables: { id: "natijalar", number: "07", label: { uz: "Natijalar" } },
  team: { id: "jamoa", number: "08", label: { uz: "Jamoa" } },
  support: { id: "qollab-quvvatlash", number: "09", label: { uz: "Qo‘llab-quvvatlash" } },
  faq: { id: "savollar", number: "10", label: { uz: "Savollar" } },
  brief: { id: "brif", number: "11", label: { uz: "Brif" } },
} as const satisfies Record<string, SectionMeta>;

export const railSections: readonly SectionMeta[] = Object.values(homeSections);

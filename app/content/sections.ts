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
  situations: { id: "vaziyatlar", number: "02", label: { uz: "Vaziyatlar", ru: "Ситуации" } },
  projects: { id: "loyihalar", number: "03", label: { uz: "Loyihalar", ru: "Проекты" } },
  services: { id: "xizmatlar", number: "04", label: { uz: "Xizmatlar", ru: "Услуги" } },
  tech: { id: "texnologiyalar", number: "05", label: { uz: "Texnologiyalar", ru: "Технологии" } },
  demo: { id: "demo", number: "06", label: { uz: "Demo", ru: "Демо" } },
  process: { id: "yondashuv", number: "07", label: { uz: "Jarayon", ru: "Процесс" } },
  results: { id: "natijalar", number: "08", label: { uz: "Natijalar", ru: "Результаты" } },
  quality: { id: "sifat", number: "09", label: { uz: "Sifat", ru: "Качество" } },
  faq: { id: "savollar", number: "10", label: { uz: "Savollar", ru: "Вопросы" } },
  brief: { id: "brif", number: "11", label: { uz: "Brif", ru: "Бриф" } },
} as const satisfies Record<string, SectionMeta>;

export const railSections: readonly SectionMeta[] = Object.values(homeSections);

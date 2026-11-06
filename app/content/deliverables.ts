import type { Localized } from "../i18n/types";

/** Icon names map to lucide-react components in the Deliverables section. */
export type DeliverableIcon = "figma" | "code" | "docs" | "launch";

export interface Deliverable {
  readonly icon: DeliverableIcon;
  readonly title: Localized;
  readonly text: Localized;
}

export const deliverables: readonly Deliverable[] = [
  {
    icon: "figma",
    title: { uz: "Dizayn fayllari" },
    text: { uz: "Kelishilgan ekranlar va komponentlarning manba fayllari." },
  },
  {
    icon: "code",
    title: { uz: "Manba kod" },
    text: { uz: "Loyiha kodi shartnomada belgilangan tartib va shartlar asosida topshiriladi." },
  },
  {
    icon: "docs",
    title: { uz: "Texnik hujjatlar" },
    text: { uz: "O‘rnatish, sozlash va asosiy arxitektura bo‘yicha hujjatlar." },
  },
  {
    icon: "launch",
    title: { uz: "Ishga tushirish va topshirish" },
    text: { uz: "Loyihani ishga tushirish va jamoangizga topshirish. Tarkibi loyiha hajmiga qarab kelishiladi." },
  },
];

export const deliverablesNote: Localized = {
  uz: "Aniq tarkib, format va topshirish tartibi har bir loyiha bo‘yicha shartnomada belgilanadi.",
};

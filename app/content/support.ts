import type { Localized } from "../i18n/types";

export interface SupportItem {
  readonly title: Localized;
  readonly text: Localized;
}

export const supportItems: readonly SupportItem[] = [
  {
    title: { uz: "Monitoring" },
    text: { uz: "Tizim barqaror ishlashini kuzatish va muammolarga o‘z vaqtida munosabat bildirish." },
  },
  {
    title: { uz: "Yangilanishlar" },
    text: { uz: "Xavfsizlik va texnik yangilanishlarni rejali ravishda o‘rnatish." },
  },
  {
    title: { uz: "Yangi funksiyalar" },
    text: { uz: "Mahsulot o‘sishi bilan yangi imkoniyatlarni bosqichma-bosqich qo‘shish." },
  },
];

export const supportNote: Localized = {
  uz: "Qo‘llab-quvvatlash hajmi, muddati va shartlari har bir loyiha bo‘yicha alohida kelishiladi.",
};

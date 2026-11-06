import type { Localized } from "../i18n/types";

export interface SupportItem {
  readonly title: Localized;
  readonly text: Localized;
}

export const supportItems: readonly SupportItem[] = [
  {
    title: { uz: "Monitoring", ru: "Мониторинг" },
    text: { uz: "Tizim barqaror ishlashini kuzatish va muammolarga o‘z vaqtida munosabat bildirish.", ru: "Контроль стабильной работы системы и своевременная реакция на проблемы." },
  },
  {
    title: { uz: "Yangilanishlar", ru: "Обновления" },
    text: { uz: "Xavfsizlik va texnik yangilanishlarni rejali ravishda o‘rnatish.", ru: "Плановая установка обновлений безопасности и технических обновлений." },
  },
  {
    title: { uz: "Yangi funksiyalar", ru: "Новые функции" },
    text: { uz: "Mahsulot o‘sishi bilan yangi imkoniyatlarni bosqichma-bosqich qo‘shish.", ru: "Поэтапное добавление новых возможностей по мере роста продукта." },
  },
];

export const supportNote: Localized = {
  uz: "Qo‘llab-quvvatlash hajmi, muddati va shartlari har bir loyiha bo‘yicha alohida kelishiladi.", ru: "Объём, сроки и условия поддержки согласуются отдельно по каждому проекту.",
};

import type { Localized } from "../i18n/types";

export interface Principle {
  readonly title: Localized;
  readonly text: Localized;
}

export const principles: readonly Principle[] = [
  {
    title: { uz: "Ochiq muloqot", ru: "Открытое общение" },
    text: { uz: "Jarayon, muammolar va qarorlar haqida o‘z vaqtida va aniq xabar beramiz.", ru: "Своевременно и чётко сообщаем о ходе работы, проблемах и решениях." },
  },
  {
    title: { uz: "Hujjatlashtirilgan qarorlar", ru: "Задокументированные решения" },
    text: { uz: "Muhim kelishuvlar yozib boriladi, shunda loyiha bir odamga bog‘lanib qolmaydi.", ru: "Важные договорённости фиксируются, поэтому проект не зависит от одного человека." },
  },
  {
    title: { uz: "Sifat — jarayon qismi", ru: "Качество — часть процесса" },
    text: { uz: "Kodni ko‘rib chiqish va testlash ishning oxirida emas, har bosqichda bajariladi.", ru: "Ревью кода и тестирование выполняются на каждом этапе, а не в конце работы." },
  },
  {
    title: { uz: "Mahsulot sizniki", ru: "Продукт — ваш" },
    text: { uz: "Qurilgan tizimni tushunishingiz va boshqara olishingiz uchun ishlaymiz.", ru: "Работаем так, чтобы вы понимали созданную систему и могли ею управлять." },
  },
];

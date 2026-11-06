import type { Localized } from "../i18n/types";

export interface Principle {
  readonly title: Localized;
  readonly text: Localized;
}

export const principles: readonly Principle[] = [
  {
    title: { uz: "Ochiq muloqot" },
    text: { uz: "Jarayon, muammolar va qarorlar haqida o‘z vaqtida va aniq xabar beramiz." },
  },
  {
    title: { uz: "Hujjatlashtirilgan qarorlar" },
    text: { uz: "Muhim kelishuvlar yozib boriladi, shunda loyiha bir odamga bog‘lanib qolmaydi." },
  },
  {
    title: { uz: "Sifat — jarayon qismi" },
    text: { uz: "Kodni ko‘rib chiqish va testlash ishning oxirida emas, har bosqichda bajariladi." },
  },
  {
    title: { uz: "Mahsulot sizniki" },
    text: { uz: "Qurilgan tizimni tushunishingiz va boshqara olishingiz uchun ishlaymiz." },
  },
];

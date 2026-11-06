import type { Localized } from "../i18n/types";

export interface FaqItem {
  readonly id: string;
  readonly q: Localized;
  readonly a: Localized;
}

export const faq: readonly FaqItem[] = [
  {
    id: "narx",
    q: { uz: "Loyiha narxi qanday hisoblanadi?" },
    a: {
      uz: "Narx loyiha hajmi, funksiyalar, dizayn murakkabligi va integratsiyalarga bog‘liq. Brifingiz asosida talablarni aniqlashtiramiz va shundan keyin taklif tayyorlaymiz.",
    },
  },
  {
    id: "muddat",
    q: { uz: "Ish jarayoni qancha davom etadi?" },
    a: {
      uz: "Muddat loyiha hajmi va murakkabligiga bog‘liq. Tahlil bosqichidan so‘ng bosqichma-bosqich ish rejasini kelishib olamiz.",
    },
  },
  {
    id: "mavjud-loyiha",
    q: { uz: "Mavjud loyihani davom ettira olasizmi?" },
    a: {
      uz: "Ha. Avval mavjud kod, infratuzilma va hujjatlarni ko‘rib chiqamiz, so‘ng davom ettirish yo‘lini taklif qilamiz.",
    },
  },
  {
    id: "manba-kod",
    q: { uz: "Manba kod kimga topshiriladi?" },
    a: { uz: "Manba kodni topshirish tartibi va unga bo‘lgan huquqlar shartnomada aniq belgilanadi." },
  },
  {
    id: "yordam",
    q: { uz: "Loyiha topshirilgach yordam berasizmi?" },
    a: {
      uz: "Ha, qo‘llab-quvvatlash xizmatini taklif qilamiz. Uning hajmi va shartlari loyiha bo‘yicha alohida kelishiladi.",
    },
  },
];

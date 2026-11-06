import type { Localized } from "../i18n/types";

export interface ProcessStep {
  readonly number: string;
  readonly title: Localized;
  readonly text: Localized;
}

export const processSteps: readonly ProcessStep[] = [
  {
    number: "01",
    title: { uz: "Tahlil" },
    text: { uz: "Maqsad, foydalanuvchilar va cheklovlarni aniqlaymiz. Natija — kelishilgan talablar va ish rejasi." },
  },
  {
    number: "02",
    title: { uz: "Dizayn" },
    text: { uz: "Tuzilma va wireframe’lardan yakuniy interfeysgacha. Har bir muhim qaror siz bilan muhokama qilinadi." },
  },
  {
    number: "03",
    title: { uz: "Dasturlash" },
    text: { uz: "Kelishilgan bosqichlar bo‘yicha ishlab chiqamiz va oraliq natijalarni muntazam ko‘rsatib boramiz." },
  },
  {
    number: "04",
    title: { uz: "Ishga tushirish" },
    text: { uz: "Testlash, serverga joylash va topshirish. Keyingi qadamlarni birga belgilaymiz." },
  },
];

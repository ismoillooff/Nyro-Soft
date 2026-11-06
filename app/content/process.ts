import type { Localized } from "../i18n/types";

export interface ProcessStep {
  readonly number: string;
  readonly title: Localized;
  readonly text: Localized;
}

export const processSteps: readonly ProcessStep[] = [
  {
    number: "01",
    title: { uz: "Tahlil", ru: "Анализ" },
    text: { uz: "Maqsad, foydalanuvchilar va cheklovlarni aniqlaymiz. Natija — kelishilgan talablar va ish rejasi.", ru: "Определяем цели, пользователей и ограничения. Результат — согласованные требования и план работ." },
  },
  {
    number: "02",
    title: { uz: "Dizayn", ru: "Дизайн" },
    text: { uz: "Tuzilma va wireframe’lardan yakuniy interfeysgacha. Har bir muhim qaror siz bilan muhokama qilinadi.", ru: "От структуры и wireframe-макетов до финального интерфейса. Каждое важное решение обсуждаем с вами." },
  },
  {
    number: "03",
    title: { uz: "Dasturlash", ru: "Разработка" },
    text: { uz: "Kelishilgan bosqichlar bo‘yicha ishlab chiqamiz va oraliq natijalarni muntazam ko‘rsatib boramiz.", ru: "Разрабатываем по согласованным этапам и регулярно показываем промежуточные результаты." },
  },
  {
    number: "04",
    title: { uz: "Ishga tushirish", ru: "Запуск" },
    text: { uz: "Testlash, serverga joylash va topshirish. Keyingi qadamlarni birga belgilaymiz.", ru: "Тестирование, размещение на сервере и передача. Вместе определяем следующие шаги." },
  },
];

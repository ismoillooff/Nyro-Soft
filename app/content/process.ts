import type { Localized } from "../i18n/types";

export interface ProcessStep {
  readonly number: string;
  readonly title: Localized;
  readonly text: Localized;
  /** What is visible at the end of the step (2–3 artefacts, ≤ 4 words each). */
  readonly artifacts: readonly Localized[];
}

export const processSteps: readonly ProcessStep[] = [
  {
    number: "01",
    title: { uz: "Tahlil", ru: "Анализ" },
    text: { uz: "Maqsad, foydalanuvchilar va cheklovlarni aniqlaymiz. Natija — kelishilgan talablar va ish rejasi.", ru: "Определяем цели, пользователей и ограничения. Результат — согласованные требования и план работ." },
    artifacts: [
      { uz: "Kelishilgan talablar", ru: "Согласованные требования" },
      { uz: "Vazifalar ro‘yxati", ru: "Список задач" },
      { uz: "Foydalanuvchi yo‘li", ru: "Пользовательский путь" },
    ],
  },
  {
    number: "02",
    title: { uz: "Dizayn", ru: "Дизайн" },
    text: { uz: "Tuzilma va wireframe’lardan yakuniy interfeysgacha. Har bir muhim qaror siz bilan muhokama qilinadi.", ru: "От структуры и wireframe-макетов до финального интерфейса. Каждое важное решение обсуждаем с вами." },
    artifacts: [
      { uz: "Wireframe’lar", ru: "Wireframe-макеты" },
      { uz: "Asosiy interfeys", ru: "Основной интерфейс" },
    ],
  },
  {
    number: "03",
    title: { uz: "Dasturlash", ru: "Разработка" },
    text: { uz: "Kelishilgan bosqichlar bo‘yicha ishlab chiqamiz va oraliq natijalarni muntazam ko‘rsatib boramiz.", ru: "Разрабатываем по согласованным этапам и регулярно показываем промежуточные результаты." },
    artifacts: [
      { uz: "Ishlaydigan interfeys", ru: "Работающий интерфейс" },
      { uz: "Ishlaydigan funksiyalar", ru: "Работающие функции" },
      { uz: "Oraliq natijalar", ru: "Промежуточные результаты" },
    ],
  },
  {
    number: "04",
    title: { uz: "Ishga tushirish", ru: "Запуск" },
    text: { uz: "Testlash, serverga joylash va topshirish. Keyingi qadamlarni birga belgilaymiz.", ru: "Тестирование, размещение на сервере и передача. Вместе определяем следующие шаги." },
    artifacts: [
      { uz: "Tayyor mahsulot", ru: "Готовый продукт" },
      { uz: "Topshirish materiallari", ru: "Материалы для передачи" },
    ],
  },
];

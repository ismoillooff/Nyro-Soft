import type { Localized } from "../i18n/types";

/** "How we approach product quality": what we actually do, not guarantees. */
export interface Principle {
  /** 1–2 word mono label. */
  readonly tag: Localized;
  readonly title: Localized;
  readonly text: Localized;
}

export const principles: readonly Principle[] = [
  {
    tag: { uz: "Ssenariy", ru: "Сценарий" },
    title: { uz: "Tushunarli foydalanuvchi yo‘llari", ru: "Понятные пользовательские сценарии" },
    text: {
      uz: "Har bir ekranni foydalanuvchi bajaradigan vazifadan kelib chiqib loyihalaymiz. Asosiy yo‘l qisqa va ortiqcha qadamlarsiz bo‘lishiga harakat qilamiz.", ru: "Каждый экран проектируем от задачи, которую решает пользователь. Стараемся, чтобы основной путь был коротким и без лишних шагов.",
    },
  },
  {
    tag: { uz: "Moslashuv", ru: "Адаптив" },
    title: { uz: "Har qanday ekranga mos interfeys", ru: "Интерфейс под любой экран" },
    text: {
      uz: "Interfeysni telefon, planshet va kompyuter uchun birga loyihalaymiz va har birida tekshiramiz.", ru: "Проектируем интерфейс сразу для телефона, планшета и компьютера и проверяем его на каждом.",
    },
  },
  {
    tag: { uz: "Kod", ru: "Код" },
    title: { uz: "Qo‘llab-quvvatlash oson kod", ru: "Код, который легко поддерживать" },
    text: {
      uz: "Kodni tushunarli tuzilma va bir xil qoidalar asosida yozamiz, shunda uni keyin boshqa dasturchi ham davom ettira oladi.", ru: "Пишем код по понятной структуре и единым правилам, чтобы позже его мог продолжить и другой разработчик.",
    },
  },
  {
    tag: { uz: "Holatlar", ru: "Состояния" },
    title: { uz: "Muhim holatlarni tekshirish", ru: "Проверка важных состояний" },
    text: {
      uz: "Bo‘sh ro‘yxat, xato, yuklanish va chegaraviy holatlar dizaynda oldindan ko‘zda tutiladi. Kodni ko‘rib chiqish va testlashda ularni alohida tekshiramiz.", ru: "Пустой список, ошибка, загрузка и пограничные случаи продумываются ещё в дизайне. При ревью кода и тестировании проверяем их отдельно.",
    },
  },
  {
    tag: { uz: "Topshirish", ru: "Передача" },
    title: { uz: "Kelishilgan topshirish materiallari", ru: "Согласованные материалы передачи" },
    text: {
      uz: "Dizayn fayllari, kod va texnik hujjatlar shartnomada kelishilgan tarkibda topshiriladi.", ru: "Файлы дизайна, код и техническая документация передаются в составе, согласованном в договоре.",
    },
  },
  {
    tag: { uz: "Muloqot", ru: "Общение" },
    title: { uz: "Ochiq muloqot va yozilgan qarorlar", ru: "Открытое общение и зафиксированные решения" },
    text: {
      uz: "Jarayon, muammolar va qarorlar haqida o‘z vaqtida xabar beramiz. Muhim kelishuvlar yozib boriladi, shunda loyiha bir odamga bog‘lanib qolmaydi.", ru: "Своевременно сообщаем о ходе работы, проблемах и решениях. Важные договорённости фиксируются, поэтому проект не зависит от одного человека.",
    },
  },
];

import type { Localized } from "../i18n/types";

export interface BriefOption {
  readonly value: string;
  readonly label: Localized;
}

/** Service choices. Values match `Service.briefValue`, plus "unknown". */
export const briefServices: readonly BriefOption[] = [
  { value: "web", label: { uz: "Web platforma", ru: "Веб-платформа" } },
  { value: "mobil", label: { uz: "Mobil ilova", ru: "Мобильное приложение" } },
  { value: "dizayn", label: { uz: "UI/UX dizayn", ru: "UI/UX-дизайн" } },
  { value: "avtomatlashtirish", label: { uz: "Biznesni avtomatlashtirish", ru: "Автоматизация бизнеса" } },
  { value: "unknown", label: { uz: "Hali bilmayman", ru: "Пока не знаю" } },
];

export const briefStages: readonly BriefOption[] = [
  { value: "idea", label: { uz: "G‘oya", ru: "Идея" } },
  { value: "design", label: { uz: "Dizayn bor", ru: "Есть дизайн" } },
  { value: "existing", label: { uz: "Mavjud loyiha bor", ru: "Есть действующий проект" } },
];

/** Draft ranges — to be confirmed by the client before launch. */
export const briefBudgets: readonly BriefOption[] = [
  { value: "lt-3k", label: { uz: "3 000 $ gacha", ru: "до 3 000 $" } },
  { value: "3k-10k", label: { uz: "3 000 – 10 000 $", ru: "3 000 – 10 000 $" } },
  { value: "10k-25k", label: { uz: "10 000 – 25 000 $", ru: "10 000 – 25 000 $" } },
  { value: "gt-25k", label: { uz: "25 000 $ dan yuqori", ru: "от 25 000 $" } },
  { value: "unknown", label: { uz: "Hali aniq emas", ru: "Пока не определено" } },
];

export const briefTimelines: readonly BriefOption[] = [
  { value: "lt-1m", label: { uz: "1 oy ichida", ru: "В течение месяца" } },
  { value: "1-3m", label: { uz: "1–3 oy", ru: "1–3 месяца" } },
  { value: "gt-3m", label: { uz: "3 oydan ortiq", ru: "Более 3 месяцев" } },
  { value: "unknown", label: { uz: "Hali aniq emas", ru: "Пока не определено" } },
];

export const briefContactMethods: readonly BriefOption[] = [
  { value: "telegram", label: { uz: "Telegram", ru: "Telegram" } },
  { value: "phone", label: { uz: "Telefon", ru: "Телефон" } },
  { value: "email", label: { uz: "Email", ru: "Email" } },
];

/* ─── "What to prepare" before filling in the brief ───────────────────────── */

export interface BriefPrepItem {
  readonly id: string;
  readonly title: Localized;
  readonly hint: Localized;
  /** where it goes in the brief */
  readonly field: "about" | "services" | "stage" | "link" | "budget" | "timeline";
}

export const briefPrep: readonly BriefPrepItem[] = [
  {
    id: "goal",
    title: { uz: "Loyiha maqsadi", ru: "Цель проекта" },
    hint: { uz: "Qaysi muammoni hal qilmoqchisiz yoki nimaga erishmoqchisiz.", ru: "Какую задачу хотите решить или чего хотите достичь." },
    field: "about",
  },
  {
    id: "users",
    title: { uz: "Asosiy foydalanuvchilar", ru: "Основные пользователи" },
    hint: { uz: "Mahsulotdan kim va qanday vaziyatda foydalanadi.", ru: "Кто и в какой ситуации будет пользоваться продуктом." },
    field: "about",
  },
  {
    id: "features",
    title: { uz: "Ustuvor funksiyalar", ru: "Приоритетные функции" },
    hint: { uz: "Birinchi versiyada albatta bo‘lishi kerak bo‘lgan narsalar.", ru: "То, что обязательно должно быть в первой версии." },
    field: "about",
  },
  {
    id: "materials",
    title: { uz: "Mavjud sayt yoki materiallar", ru: "Действующий сайт или материалы" },
    hint: { uz: "Sayt, dizayn yoki hujjat havolasi — agar bo‘lsa.", ru: "Ссылка на сайт, дизайн или документ — если есть." },
    field: "link",
  },
  {
    id: "constraints",
    title: { uz: "Muddat va budjet cheklovlari", ru: "Ограничения по срокам и бюджету" },
    hint: { uz: "Taxminiy budjet va kutilayotgan muddat, oraliq ko‘rinishida bo‘lsa ham.", ru: "Примерный бюджет и ожидаемый срок, пусть даже в виде диапазона." },
    field: "budget",
  },
];

export const briefPrepNote: Localized = {
  uz: "Hammasi aniq bo‘lishi shart emas. Brifda «Hali bilmayman» va «Hali aniq emas» variantlari bor — tafsilotlarni tahlil bosqichida birga aniqlashtiramiz.", ru: "Не всё должно быть ясно заранее. В брифе есть варианты «Пока не знаю» и «Пока не определено» — детали уточним вместе на этапе анализа.",
};

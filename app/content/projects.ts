import type { Localized } from "../i18n/types";
import type { ProjectCategory } from "./services";

export type PreviewKind = "dashboard" | "finance";

export interface Project {
  readonly slug: string;
  readonly category: ProjectCategory;
  readonly categoryLabel: Localized;
  readonly platform: Localized;
  readonly title: Localized;
  readonly description: Localized;
  readonly lead: Localized;
  readonly tags: readonly string[];
  readonly preview: PreviewKind;
  readonly task: Localized;
  readonly solution: Localized;
  readonly features: readonly { readonly title: Localized; readonly text: Localized }[];
  readonly benefits: readonly Localized[];
  /** The service page this concept belongs to. */
  readonly service: string;
}

export const projects: readonly Project[] = [
  {
    slug: "biznes-boshqaruv-platformasi",
    category: "web",
    categoryLabel: { uz: "Web", ru: "Веб" },
    platform: { uz: "Veb platforma · desktop va mobil brauzer", ru: "Веб-платформа · десктопный и мобильный браузер" },
    title: { uz: "Biznes boshqaruv platformasi", ru: "Платформа управления бизнесом" },
    description: {
      uz: "Buyurtmalar, mijozlar, ombor va hisobotlarni bitta tizimda boshqarish uchun veb platforma konsepti.", ru: "Концепт веб-платформы для управления заказами, клиентами, складом и отчётами в одной системе.",
    },
    lead: {
      uz: "Kichik va o‘rta biznes uchun yagona ish joyi: buyurtma qabul qilishdan ombor qoldig‘i va oylik hisobotgacha.", ru: "Единое рабочее место для малого и среднего бизнеса: от приёма заказа до остатков на складе и ежемесячного отчёта.",
    },
    tags: ["React", "TypeScript", "FastAPI", "PostgreSQL"],
    preview: "dashboard",
    task: {
      uz: "Buyurtmalar Telegram, telefon va jadvallar orqali yuritiladigan biznesni tasavvur qilamiz. Ma’lumotlar tarqoq, ombor qoldig‘i kechikib yangilanadi, hisobot tayyorlashga esa har oy bir necha kun ketadi.", ru: "Представим бизнес, в котором заказы ведутся через Telegram, телефон и таблицы. Данные разрознены, остатки на складе обновляются с опозданием, а на подготовку отчёта каждый месяц уходит несколько дней.",
    },
    solution: {
      uz: "Bitta veb platforma: buyurtmalar ro‘yxati holatlar bilan, mijozlar kartotekasi, ombor harakati va real vaqtdagi hisobotlar. Har bir xodim o‘z roliga mos ekranni ko‘radi.", ru: "Единая веб-платформа: список заказов со статусами, картотека клиентов, движение по складу и отчёты в реальном времени. Каждый сотрудник видит экран, соответствующий его роли.",
    },
    features: [
      { title: { uz: "Buyurtmalar", ru: "Заказы" }, text: { uz: "Qidiruv, holat bo‘yicha filtr va holatni bir bosishda o‘zgartirish.", ru: "Поиск, фильтр по статусу и смена статуса в один клик." } },
      { title: { uz: "Mijozlar", ru: "Клиенты" }, text: { uz: "Har bir mijozning buyurtmalar tarixi va izohlari bitta kartada.", ru: "История заказов и комментарии по каждому клиенту — в одной карточке." } },
      { title: { uz: "Ombor", ru: "Склад" }, text: { uz: "Kirim, chiqim va qoldiq; kam qolgan mahsulotlar haqida ogohlantirish.", ru: "Приход, расход и остатки; предупреждения о заканчивающихся товарах." } },
      { title: { uz: "Hisobotlar", ru: "Отчёты" }, text: { uz: "Kunlik, haftalik va oylik ko‘rsatkichlar, eksport imkoniyati bilan.", ru: "Ежедневные, еженедельные и ежемесячные показатели с возможностью экспорта." } },
      { title: { uz: "Rollar", ru: "Роли" }, text: { uz: "Menejer, omborchi va rahbar uchun alohida huquqlar.", ru: "Отдельные права для менеджера, кладовщика и руководителя." } },
    ],
    benefits: [
      { uz: "Ma’lumotlar bitta manbada: jadval va chatlar orasida qidirish kamayadi.", ru: "Данные в одном источнике: меньше поиска по таблицам и чатам." },
      { uz: "Buyurtma holati har bir xodimga bir xil ko‘rinadi.", ru: "Статус заказа одинаково виден каждому сотруднику." },
      { uz: "Hisobot qo‘lda yig‘ilmaydi — tizim o‘zi tayyorlaydi.", ru: "Отчёт не собирается вручную — система готовит его сама." },
    ],
    service: "web-platformalar",
  },
  {
    slug: "mobil-moliya-ilovasi",
    category: "mobil",
    categoryLabel: { uz: "Mobil", ru: "Мобильное" },
    platform: { uz: "Mobil ilova · iOS va Android", ru: "Мобильное приложение · iOS и Android" },
    title: { uz: "Mobil moliya ilovasi", ru: "Мобильное приложение для финансов" },
    description: {
      uz: "Shaxsiy xarajatlar, to‘lovlar va budjetni kuzatish uchun mobil ilova konsepti.", ru: "Концепт мобильного приложения для учёта личных расходов, платежей и бюджета.",
    },
    lead: {
      uz: "Har kungi xarajatlarni bir necha soniyada yozib borish va oy oxirida pul qayerga ketganini aniq ko‘rish uchun.", ru: "Чтобы записывать ежедневные расходы за несколько секунд и в конце месяца точно видеть, куда ушли деньги.",
    },
    tags: ["TypeScript", "React Native", "FastAPI", "PostgreSQL"],
    preview: "finance",
    task: {
      uz: "Ko‘pchilik xarajatlarini yozib borishni boshlaydi, lekin bir haftadan keyin tashlab qo‘yadi: yozish uzoq, natija esa ko‘rinmaydi. Vazifa — buni tez va foydali qilish.", ru: "Многие начинают записывать расходы, но через неделю бросают: записывать долго, а результата не видно. Задача — сделать это быстрым и полезным.",
    },
    solution: {
      uz: "Asosiy ekranda bitta tugma bilan xarajat qo‘shish, toifalar bo‘yicha budjet chegaralari va to‘lov eslatmalari. Oy natijasi sodda grafikda ko‘rinadi.", ru: "Добавление расхода одной кнопкой на главном экране, лимиты бюджета по категориям и напоминания о платежах. Итоги месяца видны на простом графике.",
    },
    features: [
      { title: { uz: "Tez kiritish", ru: "Быстрый ввод" }, text: { uz: "Summa va toifa — ikki qadamda xarajat qo‘shiladi.", ru: "Сумма и категория — расход добавляется в два шага." } },
      { title: { uz: "Budjet", ru: "Бюджет" }, text: { uz: "Har bir toifa uchun oylik chegara va qolgan summa.", ru: "Месячный лимит и остаток по каждой категории." } },
      { title: { uz: "To‘lovlar", ru: "Платежи" }, text: { uz: "Kommunal va obuna to‘lovlari uchun eslatmalar.", ru: "Напоминания о коммунальных платежах и подписках." } },
      { title: { uz: "Tahlil", ru: "Аналитика" }, text: { uz: "Oy bo‘yicha xarajatlar tuzilmasi va o‘tgan oy bilan taqqoslash.", ru: "Структура расходов за месяц и сравнение с прошлым месяцем." } },
    ],
    benefits: [
      { uz: "Xarajatni yozish odatga aylanishi uchun minimal qadamlar.", ru: "Минимум шагов, чтобы запись расходов вошла в привычку." },
      { uz: "Budjetdan oshish oldindan ko‘rinadi.", ru: "Превышение бюджета видно заранее." },
      { uz: "Muhim to‘lovlar unutilmaydi.", ru: "Важные платежи не забываются." },
    ],
    service: "mobil-ilovalar",
  },
];

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const projectFilters: readonly { readonly value: "all" | ProjectCategory; readonly label: Localized }[] = [
  { value: "all", label: { uz: "Barchasi", ru: "Все" } },
  { value: "web", label: { uz: "Web", ru: "Веб" } },
  { value: "mobil", label: { uz: "Mobil", ru: "Мобильные" } },
  { value: "avtomatlashtirish", label: { uz: "Avtomatlashtirish", ru: "Автоматизация" } },
];

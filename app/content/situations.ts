import type { Localized } from "../i18n/types";

/**
 * "In which situation do we help?" — starting points a visitor may recognise.
 * These describe typical situations, not achieved results.
 */
export interface Situation {
  readonly id: string;
  readonly problem: Localized;
  readonly direction: Localized;
  /** service slug from services.ts */
  readonly service: string;
}

export const situations: readonly Situation[] = [
  {
    id: "orders",
    problem: { uz: "Buyurtmalar turli joylarda tarqalib ketgan", ru: "Заказы разбросаны по разным местам" },
    direction: {
      uz: "Buyurtma holati, mijozlar va mahsulotlarni yagona interfeysda boshqarish.", ru: "Управление статусами заказов, клиентами и товарами в едином интерфейсе.",
    },
    service: "web-platformalar",
  },
  {
    id: "reports",
    problem: { uz: "Hisobotlar qo‘lda yig‘iladi", ru: "Отчёты собираются вручную" },
    direction: {
      uz: "Ma’lumotlarni tartibga solish va hisobotlarni kerakli ko‘rinishda taqdim etish.", ru: "Упорядочить данные и получать отчёты в нужном виде.",
    },
    service: "biznesni-avtomatlashtirish",
  },
  {
    id: "ux",
    problem: { uz: "Mavjud interfeysdan foydalanish qiyin", ru: "Текущим интерфейсом неудобно пользоваться" },
    direction: {
      uz: "Foydalanuvchilarning asosiy vazifalariga mos tuzilma va interfeys.", ru: "Структура и интерфейс, выстроенные вокруг основных задач пользователей.",
    },
    service: "ui-ux-dizayn",
  },
  {
    id: "idea",
    problem: { uz: "Yangi raqamli mahsulot g‘oyasi bor", ru: "Есть идея нового цифрового продукта" },
    direction: {
      uz: "Birinchi versiya talablari, prototip va ishlab chiqish hajmini aniqlashtirish.", ru: "Уточнить требования к первой версии, прототип и объём разработки.",
    },
    service: "mobil-ilovalar",
  },
];

export const situationsNote: Localized = {
  uz: "Bular odatiy boshlanish nuqtalari. O‘z vaziyatingizni brifda qisqacha yozing.", ru: "Это типичные отправные точки. Свою ситуацию коротко опишите в брифе.",
};

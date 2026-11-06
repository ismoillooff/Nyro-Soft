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
    categoryLabel: { uz: "Web" },
    platform: { uz: "Veb platforma · desktop va mobil brauzer" },
    title: { uz: "Biznes boshqaruv platformasi" },
    description: {
      uz: "Buyurtmalar, mijozlar, ombor va hisobotlarni bitta tizimda boshqarish uchun veb platforma konsepti.",
    },
    lead: {
      uz: "Kichik va o‘rta biznes uchun yagona ish joyi: buyurtma qabul qilishdan ombor qoldig‘i va oylik hisobotgacha.",
    },
    tags: ["React", "TypeScript", "FastAPI", "PostgreSQL"],
    preview: "dashboard",
    task: {
      uz: "Buyurtmalar Telegram, telefon va jadvallar orqali yuritiladigan biznesni tasavvur qilamiz. Ma’lumotlar tarqoq, ombor qoldig‘i kechikib yangilanadi, hisobot tayyorlashga esa har oy bir necha kun ketadi.",
    },
    solution: {
      uz: "Bitta veb platforma: buyurtmalar ro‘yxati holatlar bilan, mijozlar kartotekasi, ombor harakati va real vaqtdagi hisobotlar. Har bir xodim o‘z roliga mos ekranni ko‘radi.",
    },
    features: [
      { title: { uz: "Buyurtmalar" }, text: { uz: "Qidiruv, holat bo‘yicha filtr va holatni bir bosishda o‘zgartirish." } },
      { title: { uz: "Mijozlar" }, text: { uz: "Har bir mijozning buyurtmalar tarixi va izohlari bitta kartada." } },
      { title: { uz: "Ombor" }, text: { uz: "Kirim, chiqim va qoldiq; kam qolgan mahsulotlar haqida ogohlantirish." } },
      { title: { uz: "Hisobotlar" }, text: { uz: "Kunlik, haftalik va oylik ko‘rsatkichlar, eksport imkoniyati bilan." } },
      { title: { uz: "Rollar" }, text: { uz: "Menejer, omborchi va rahbar uchun alohida huquqlar." } },
    ],
    benefits: [
      { uz: "Ma’lumotlar bitta manbada: jadval va chatlar orasida qidirish kamayadi." },
      { uz: "Buyurtma holati har bir xodimga bir xil ko‘rinadi." },
      { uz: "Hisobot qo‘lda yig‘ilmaydi — tizim o‘zi tayyorlaydi." },
    ],
    service: "web-platformalar",
  },
  {
    slug: "mobil-moliya-ilovasi",
    category: "mobil",
    categoryLabel: { uz: "Mobil" },
    platform: { uz: "Mobil ilova · iOS va Android" },
    title: { uz: "Mobil moliya ilovasi" },
    description: {
      uz: "Shaxsiy xarajatlar, to‘lovlar va budjetni kuzatish uchun mobil ilova konsepti.",
    },
    lead: {
      uz: "Har kungi xarajatlarni bir necha soniyada yozib borish va oy oxirida pul qayerga ketganini aniq ko‘rish uchun.",
    },
    tags: ["TypeScript", "React Native", "FastAPI", "PostgreSQL"],
    preview: "finance",
    task: {
      uz: "Ko‘pchilik xarajatlarini yozib borishni boshlaydi, lekin bir haftadan keyin tashlab qo‘yadi: yozish uzoq, natija esa ko‘rinmaydi. Vazifa — buni tez va foydali qilish.",
    },
    solution: {
      uz: "Asosiy ekranda bitta tugma bilan xarajat qo‘shish, toifalar bo‘yicha budjet chegaralari va to‘lov eslatmalari. Oy natijasi sodda grafikda ko‘rinadi.",
    },
    features: [
      { title: { uz: "Tez kiritish" }, text: { uz: "Summa va toifa — ikki qadamda xarajat qo‘shiladi." } },
      { title: { uz: "Budjet" }, text: { uz: "Har bir toifa uchun oylik chegara va qolgan summa." } },
      { title: { uz: "To‘lovlar" }, text: { uz: "Kommunal va obuna to‘lovlari uchun eslatmalar." } },
      { title: { uz: "Tahlil" }, text: { uz: "Oy bo‘yicha xarajatlar tuzilmasi va o‘tgan oy bilan taqqoslash." } },
    ],
    benefits: [
      { uz: "Xarajatni yozish odatga aylanishi uchun minimal qadamlar." },
      { uz: "Budjetdan oshish oldindan ko‘rinadi." },
      { uz: "Muhim to‘lovlar unutilmaydi." },
    ],
    service: "mobil-ilovalar",
  },
];

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const projectFilters: readonly { readonly value: "all" | ProjectCategory; readonly label: Localized }[] = [
  { value: "all", label: { uz: "Barchasi" } },
  { value: "web", label: { uz: "Web" } },
  { value: "mobil", label: { uz: "Mobil" } },
  { value: "avtomatlashtirish", label: { uz: "Avtomatlashtirish" } },
];

import type { Localized } from "../i18n/types";

/** Icon names map to lucide-react components in the Deliverables section. */
export type DeliverableIcon = "figma" | "code" | "docs" | "launch";

export interface Deliverable {
  readonly icon: DeliverableIcon;
  readonly title: Localized;
  readonly text: Localized;
}

export const deliverables: readonly Deliverable[] = [
  {
    icon: "figma",
    title: { uz: "Dizayn fayllari", ru: "Файлы дизайна" },
    text: { uz: "Kelishilgan ekranlar va komponentlarning manba fayllari.", ru: "Исходные файлы согласованных экранов и компонентов." },
  },
  {
    icon: "code",
    title: { uz: "Manba kod", ru: "Исходный код" },
    text: { uz: "Loyiha kodi shartnomada belgilangan tartib va shartlar asosida topshiriladi.", ru: "Код проекта передаётся в порядке и на условиях, установленных договором." },
  },
  {
    icon: "docs",
    title: { uz: "Texnik hujjatlar", ru: "Техническая документация" },
    text: { uz: "O‘rnatish, sozlash va asosiy arxitektura bo‘yicha hujjatlar.", ru: "Документация по установке, настройке и основной архитектуре." },
  },
  {
    icon: "launch",
    title: { uz: "Ishga tushirish va topshirish", ru: "Запуск и передача" },
    text: { uz: "Loyihani ishga tushirish va jamoangizga topshirish. Tarkibi loyiha hajmiga qarab kelishiladi.", ru: "Запуск проекта и передача вашей команде. Состав согласуется в зависимости от объёма проекта." },
  },
];

export const deliverablesNote: Localized = {
  uz: "Aniq tarkib, format va topshirish tartibi har bir loyiha bo‘yicha shartnomada belgilanadi.", ru: "Точный состав, формат и порядок передачи определяются договором по каждому проекту.",
};

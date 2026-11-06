import type { Localized } from "../i18n/types";

export interface BriefOption {
  readonly value: string;
  readonly label: Localized;
}

/** Service choices. Values match `Service.briefValue`, plus "unknown". */
export const briefServices: readonly BriefOption[] = [
  { value: "web", label: { uz: "Web platforma" } },
  { value: "mobil", label: { uz: "Mobil ilova" } },
  { value: "dizayn", label: { uz: "UI/UX dizayn" } },
  { value: "avtomatlashtirish", label: { uz: "Biznesni avtomatlashtirish" } },
  { value: "unknown", label: { uz: "Hali bilmayman" } },
];

export const briefStages: readonly BriefOption[] = [
  { value: "idea", label: { uz: "G‘oya" } },
  { value: "design", label: { uz: "Dizayn bor" } },
  { value: "existing", label: { uz: "Mavjud loyiha bor" } },
];

/** Draft ranges — to be confirmed by the client before launch. */
export const briefBudgets: readonly BriefOption[] = [
  { value: "lt-3k", label: { uz: "3 000 $ gacha" } },
  { value: "3k-10k", label: { uz: "3 000 – 10 000 $" } },
  { value: "10k-25k", label: { uz: "10 000 – 25 000 $" } },
  { value: "gt-25k", label: { uz: "25 000 $ dan yuqori" } },
  { value: "unknown", label: { uz: "Hali aniq emas" } },
];

export const briefTimelines: readonly BriefOption[] = [
  { value: "lt-1m", label: { uz: "1 oy ichida" } },
  { value: "1-3m", label: { uz: "1–3 oy" } },
  { value: "gt-3m", label: { uz: "3 oydan ortiq" } },
  { value: "unknown", label: { uz: "Hali aniq emas" } },
];

export const briefContactMethods: readonly BriefOption[] = [
  { value: "telegram", label: { uz: "Telegram" } },
  { value: "phone", label: { uz: "Telefon" } },
  { value: "email", label: { uz: "Email" } },
];

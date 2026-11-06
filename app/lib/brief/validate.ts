import {
  SLOT_ORDER,
  STEP_SLOTS,
  type BriefData,
  type BriefErrors,
  type BriefStepIndex,
  type ErrorSlot,
} from "./types";

export const ABOUT_MIN = 20;

const PHONE_JUNK = /[\s\-().]/g;

/**
 * An Uzbek number in any common spelling — "+998 90 123 45 67",
 * "998901234567", "(90) 123-45-67", "901234567" — becomes "+998901234567".
 * Other international numbers ("+" and 10–15 digits) are kept as "+<digits>".
 * Anything else is null.
 */
export function normalizePhone(raw: string): string | null {
  const s = raw.trim().replace(PHONE_JUNK, "");
  if (!s) return null;
  if (/^\+998\d{9}$/.test(s)) return s;
  if (/^998\d{9}$/.test(s)) return `+${s}`;
  if (/^\d{9}$/.test(s)) return `+998${s}`;
  if (/^\+(?!998)\d{10,15}$/.test(s)) return s;
  return null;
}

/** "+998901234567" → "+998 90 123 45 67"; other numbers unchanged. */
export function displayPhone(normalized: string): string {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(normalized);
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : normalized;
}

const TG_NAME = /^[A-Za-z0-9_]{5,32}$/;

/** "@nyro_soft", "nyro_soft" or "https://t.me/nyro_soft" → "@nyro_soft"; otherwise null. */
export function normalizeTelegram(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;
  const link = /^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\/([^/?#]+)\/?$/i.exec(s);
  if (link?.[1]) s = link[1];
  if (s.startsWith("@")) s = s.slice(1);
  return TG_NAME.test(s) ? `@${s}` : null;
}

const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(raw: string): boolean {
  const s = raw.trim();
  return s.length <= 254 && EMAIL.test(s);
}

/**
 * An http(s) URL. A bare domain ("nyro.uz/brief") is accepted and gets
 * https://. Returns the normalized URL, or null when it is not a web address.
 */
export function normalizeLink(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") || url.hostname.startsWith(".") || url.hostname.endsWith(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Whether one slot is in error for this data. */
export function slotInvalid(slot: ErrorSlot, d: BriefData): boolean {
  switch (slot) {
    case "services":
      return d.services.length === 0;
    case "about":
      return d.about.trim().length < ABOUT_MIN;
    case "link":
      return d.link.trim() !== "" && normalizeLink(d.link) === null;
    case "name":
      return d.name.trim() === "";
    case "contact":
      return d.phone.trim() === "" && d.telegram.trim() === "" && d.email.trim() === "";
    case "phone":
      return d.phone.trim() !== "" && normalizePhone(d.phone) === null;
    case "telegram":
      return d.telegram.trim() !== "" && normalizeTelegram(d.telegram) === null;
    case "email":
      return d.email.trim() !== "" && !isValidEmail(d.email);
  }
}

export function validateStep(step: BriefStepIndex, d: BriefData): BriefErrors {
  const errors: BriefErrors = {};
  for (const slot of STEP_SLOTS[step]) if (slotInvalid(slot, d)) errors[slot] = true;
  return errors;
}

/** Every step at once; `step` is the first step that holds an error (or null). */
export function validateAll(d: BriefData): { errors: BriefErrors; step: BriefStepIndex | null } {
  const errors: BriefErrors = {};
  let first: BriefStepIndex | null = null;
  for (const step of [0, 1, 2, 3] as const) {
    const e = validateStep(step, d);
    if (Object.keys(e).length > 0 && first === null) first = step;
    Object.assign(errors, e);
  }
  return { errors, step: first };
}

export function hasErrors(errors: BriefErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstInvalid(errors: BriefErrors): ErrorSlot | undefined {
  return SLOT_ORDER.find((slot) => errors[slot]);
}

/** The slot a field's own blur validates (the "at least one" rule waits for "Davom etish"). */
export function slotForField(field: keyof BriefData): ErrorSlot | null {
  switch (field) {
    case "about":
    case "link":
    case "name":
    case "phone":
    case "telegram":
    case "email":
      return field;
    default:
      return null;
  }
}

import {
  briefBudgets,
  briefContactMethods,
  briefServices,
  briefStages,
  briefTimelines,
  type BriefOption,
} from "~/content/brief";
import { services } from "~/content/services";
import type { Localized } from "~/i18n/types";
import type { BriefData, BriefPayload } from "./types";
import { displayPhone, normalizeLink, normalizePhone, normalizeTelegram } from "./validate";

/** Map a service page slug (`?xizmat=web-platformalar`) to its brief value (`web`). Also accepts the value itself. */
export function serviceValueFromParam(param: string | null): string | null {
  if (!param) return null;
  const bySlug = services.find((s) => s.slug === param);
  if (bySlug) return bySlug.briefValue;
  return briefServices.some((o) => o.value === param) ? param : null;
}

export function optionLabel(options: readonly BriefOption[], value: string, l: (v: Localized) => string): string | null {
  const o = options.find((x) => x.value === value);
  return o ? l(o.label) : null;
}

const orNull = (s: string) => (s.trim() === "" ? null : s.trim());

/** What the HTTP adapter sends: trimmed, normalized, empty values as null. */
export function toPayload(d: BriefData, meta: { locale: string; page: string | null }): BriefPayload {
  return {
    services: [...d.services],
    about: d.about.trim(),
    stage: orNull(d.stage),
    link: d.link.trim() ? (normalizeLink(d.link) ?? d.link.trim()) : null,
    budget: orNull(d.budget),
    timeline: orNull(d.timeline),
    contact: {
      name: d.name.trim(),
      phone: d.phone.trim() ? (normalizePhone(d.phone) ?? d.phone.trim()) : null,
      telegram: d.telegram.trim() ? (normalizeTelegram(d.telegram) ?? d.telegram.trim()) : null,
      email: orNull(d.email),
      preferred: orNull(d.preferred),
    },
    website: d.website,
    locale: meta.locale,
    page: meta.page,
  };
}

export interface BriefTextLabels {
  readonly fileTitle: string;
  readonly stepService: string;
  readonly about: string;
  readonly stage: string;
  readonly link: string;
  readonly budget: string;
  readonly timeline: string;
  readonly name: string;
  readonly phone: string;
  readonly telegram: string;
  readonly email: string;
  readonly preferred: string;
  readonly notProvided: string;
}

export interface BriefSummaryRow {
  readonly label: string;
  readonly value: string;
}

/** Human-readable answers, in form order. Shared by the review, the copy text and the .txt file. */
export function summarize(d: BriefData, t: BriefTextLabels, l: (v: Localized) => string): {
  service: BriefSummaryRow[];
  project: BriefSummaryRow[];
  budget: BriefSummaryRow[];
  contact: BriefSummaryRow[];
} {
  const none = t.notProvided;
  const phone = normalizePhone(d.phone);
  const tg = normalizeTelegram(d.telegram);
  const serviceLabels = d.services.map((v) => optionLabel(briefServices, v, l) ?? v);
  return {
    service: [{ label: t.stepService, value: serviceLabels.length ? serviceLabels.join(", ") : none }],
    project: [
      { label: t.about, value: d.about.trim() || none },
      { label: t.stage, value: optionLabel(briefStages, d.stage, l) ?? none },
      { label: t.link, value: d.link.trim() ? (normalizeLink(d.link) ?? d.link.trim()) : none },
    ],
    budget: [
      { label: t.budget, value: optionLabel(briefBudgets, d.budget, l) ?? none },
      { label: t.timeline, value: optionLabel(briefTimelines, d.timeline, l) ?? none },
    ],
    contact: [
      { label: t.name, value: d.name.trim() || none },
      { label: t.phone, value: d.phone.trim() ? (phone ? displayPhone(phone) : d.phone.trim()) : none },
      { label: t.telegram, value: d.telegram.trim() ? (tg ?? d.telegram.trim()) : none },
      { label: t.email, value: d.email.trim() || none },
      { label: t.preferred, value: optionLabel(briefContactMethods, d.preferred, l) ?? none },
    ],
  };
}

/** Plain text for "Nusxalash" and ".txt yuklab olish". */
export function briefToText(d: BriefData, t: BriefTextLabels, l: (v: Localized) => string): string {
  const s = summarize(d, t, l);
  const rows = [...s.service, ...s.project, ...s.budget, ...s.contact];
  return [t.fileTitle, "", ...rows.map((r) => `${r.label}: ${r.value}`), ""].join("\n");
}

/** The project brief: what the visitor fills in, step by step. */

export type BriefStepIndex = 0 | 1 | 2 | 3;
export const BRIEF_STEP_COUNT = 4;
export const LAST_STEP: BriefStepIndex = 3;

export interface BriefData {
  /** Service values from content/brief.ts (`web`, `mobil`, `dizayn`, `avtomatlashtirish`, `unknown`). */
  readonly services: readonly string[];
  readonly about: string;
  /** `idea` | `design` | `existing` | "" */
  readonly stage: string;
  readonly link: string;
  readonly budget: string;
  readonly timeline: string;
  readonly name: string;
  readonly phone: string;
  readonly telegram: string;
  readonly email: string;
  /** `telegram` | `phone` | `email` | "" */
  readonly preferred: string;
  /** Honeypot: hidden from people, filled by bots. Checked on the server. */
  readonly website: string;
}

export type BriefTextField = Exclude<keyof BriefData, "services">;

/** Where an error can show: one slot per validated field, plus `contact` for "at least one channel". */
export type ErrorSlot = "services" | "about" | "link" | "name" | "contact" | "phone" | "telegram" | "email";

export type BriefErrors = Partial<Record<ErrorSlot, true>>;

/** Slots in the order a person meets them; the first invalid one gets focus. */
export const SLOT_ORDER: readonly ErrorSlot[] = [
  "services",
  "about",
  "link",
  "name",
  "contact",
  "phone",
  "telegram",
  "email",
];

export const STEP_SLOTS: Record<BriefStepIndex, readonly ErrorSlot[]> = {
  0: ["services"],
  1: ["about", "link"],
  2: [],
  3: ["name", "contact", "phone", "telegram", "email"],
};

export const EMPTY_BRIEF: BriefData = {
  services: [],
  about: "",
  stage: "",
  link: "",
  budget: "",
  timeline: "",
  name: "",
  phone: "",
  telegram: "",
  email: "",
  preferred: "",
  website: "",
};

/** The JSON body POSTed to VITE_BRIEF_ENDPOINT (docs/brief-endpoint.md). */
export interface BriefPayload {
  readonly services: readonly string[];
  readonly about: string;
  readonly stage: string | null;
  readonly link: string | null;
  readonly budget: string | null;
  readonly timeline: string | null;
  readonly contact: {
    readonly name: string;
    readonly phone: string | null;
    readonly telegram: string | null;
    readonly email: string | null;
    readonly preferred: string | null;
  };
  /** Honeypot value, sent as-is so the server can drop bot submissions. */
  readonly website: string;
  readonly locale: string;
  readonly page: string | null;
}

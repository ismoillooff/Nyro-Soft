import type { Localized } from "../i18n/types";

export interface TeamMember {
  readonly id: string;
  /** "placeholder" entries are visible only in development and never ship. */
  readonly status: "placeholder" | "ready";
  readonly name: string;
  readonly role: Localized;
  /** Real photo in /public, with its intrinsic size. No generated or stock faces. */
  readonly photo?: { readonly src: string; readonly width: number; readonly height: number };
}

/** Fill in real people only. Production shows `ready` members, or the principles when there are none. */
export const team: readonly TeamMember[] = [
  { id: "member-1", status: "placeholder", name: "Ism Familiya", role: { uz: "Lavozim" } },
  { id: "member-2", status: "placeholder", name: "Ism Familiya", role: { uz: "Lavozim" } },
  { id: "member-3", status: "placeholder", name: "Ism Familiya", role: { uz: "Lavozim" } },
];

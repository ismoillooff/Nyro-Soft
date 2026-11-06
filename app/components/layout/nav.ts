import type { UiDict } from "~/i18n/uz";

export interface NavItem {
  /** Home section id this link points at; also the active-state key. */
  readonly id: string;
  readonly to: string;
  readonly label: string;
}

export function primaryNav(t: UiDict): readonly NavItem[] {
  return [
    { id: "xizmatlar", to: "/#xizmatlar", label: t.nav.services },
    { id: "loyihalar", to: "/#loyihalar", label: t.nav.projects },
    { id: "yondashuv", to: "/#yondashuv", label: t.nav.approach },
  ];
}

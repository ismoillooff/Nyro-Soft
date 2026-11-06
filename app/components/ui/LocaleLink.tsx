import type { Ref } from "react";
import { Link, type LinkProps } from "react-router";
import { useI18n } from "~/i18n";

/**
 * React Router's <Link> with the current locale applied to internal absolute
 * paths ("/xizmatlar/x" → "/ru/xizmatlar/x" on Russian pages). Use it for
 * every internal link; relative hashes ("#brif") pass through unchanged.
 */
export function LocaleLink({ to, ref, ...rest }: LinkProps & { ref?: Ref<HTMLAnchorElement> }) {
  const { p } = useI18n();
  return <Link ref={ref} to={typeof to === "string" ? p(to) : to} {...rest} />;
}

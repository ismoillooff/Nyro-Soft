import { Link, useLocation } from "react-router";
import { ENABLED_LOCALES, localize, stripLocale, useI18n, type Locale } from "~/i18n";
import { cn } from "~/lib/cn";

const NAMES: Record<Locale, string> = { uz: "O‘zbekcha", ru: "Русский" };

/**
 * "UZ / RU" as plain links to the same page in the other language (with
 * hreflang). Rendered only when more than one language is published — a
 * language that is not fully translated never gets a switch.
 */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const { pathname } = useLocation();
  if (ENABLED_LOCALES.length < 2) return null;
  const base = stripLocale(pathname);
  return (
    <ul aria-label={t.a11y.langSwitch} className={cn("t-label flex items-center", className)}>
      {ENABLED_LOCALES.map((loc, i) => (
        <li key={loc} className="flex items-center">
          {i > 0 && (
            <span aria-hidden="true" className="px-0.5 text-ink-3">
              /
            </span>
          )}
          <Link
            to={localize(base, loc)}
            hrefLang={loc}
            lang={loc}
            aria-current={loc === locale ? "true" : undefined}
            className={cn(
              "inline-flex min-h-11 min-w-9 items-center justify-center transition-colors duration-[180ms]",
              loc === locale ? "text-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            <span aria-hidden="true">{loc.toUpperCase()}</span>
            <span className="sr-only">{NAMES[loc]}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

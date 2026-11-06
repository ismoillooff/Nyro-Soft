import { m } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import { stripLocale, useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { spring } from "~/motion/tokens";
import { ButtonLink } from "~/components/ui/Button";
import { useActiveSectionId, usePageProgress } from "~/components/motion/hooks";
import { LanguageSwitch } from "./LanguageSwitch";
import { Wordmark } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { primaryNav } from "./nav";

/** 1px page progress under the header — stands in for the rail below 1360px. */
function ProgressLine() {
  const progress = usePageProgress();
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px rail:hidden">
      <m.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: progress }} />
    </span>
  );
}

/**
 * Sticky header, 64px (56px mobile). Transparent at the top; after 8px a
 * translucent backdrop and the bottom hairline fade in (180ms, opacity only).
 * The state comes from a sentinel observed with IntersectionObserver — no
 * scroll listeners.
 */
export function Header() {
  const { t } = useI18n();
  const { pathname } = useLocation();
  const isHome = stripLocale(pathname) === "/";
  const activeId = useActiveSectionId();
  const current = isHome ? activeId : null;
  const [scrolled, setScrolled] = useState(false);
  const items = primaryNav(t);

  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    if (!sentinel) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!(e?.isIntersecting ?? true)));
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 h-[var(--header-h)]" data-scrolled={scrolled ? "" : undefined}>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 bg-[rgba(250,250,247,0.82)] backdrop-blur-[12px] transition-opacity duration-[180ms] ease-(--ease-out)",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-line transition-opacity duration-[180ms] ease-(--ease-out)",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="container-site relative flex h-full items-center justify-between gap-6">
        <Link to="/" aria-label={t.a11y.home} className="-m-2 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] p-2">
          <Wordmark />
        </Link>

        <nav aria-label={t.a11y.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => {
              const isActive = current === item.id;
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center px-3 text-[0.9375rem] transition-colors duration-[180ms]",
                      isActive ? "text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <m.span
                        layoutId="nav-active"
                        transition={spring.ui}
                        aria-hidden="true"
                        className="absolute inset-x-3 bottom-2 h-px bg-accent"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitch className="hidden lg:flex" />
          <div className="hidden md:block">
            <ButtonLink to="/#brif" size="sm" arrow="up-right">
              {t.nav.contact}
            </ButtonLink>
          </div>
          <MobileMenu items={items} activeId={current} />
        </div>
      </div>
      {isHome && <ProgressLine />}
    </header>
  );
}

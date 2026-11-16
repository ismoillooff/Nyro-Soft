import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { ButtonLink } from "~/components/ui/Button";
import { LanguageSwitch } from "./LanguageSwitch";
import { Wordmark } from "./Logo";
import type { NavItem } from "./nav";

/**
 * Mobile navigation (<1024px) as a native modal <dialog>: focus is trapped
 * and Escape closes it for free. Opening focuses the first link; closing
 * returns focus to the toggle. While open, `html:has(dialog[open])` blocks
 * page scroll (styles/app.css).
 */
export function MobileMenu({ items, activeId }: { items: readonly NavItem[]; activeId: string | null }) {
  const { t } = useI18n();
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback(() => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    d.showModal();
    setOpen(true);
    firstLinkRef.current?.focus();
  }, []);

  /** Navigation closes at once, so the page can scroll to the target without waiting. */
  const closeNow = useCallback(() => dialogRef.current?.close(), []);

  /** Closes with a short exit (items fade, the sheet lifts away); instantly under reduced motion. */
  const hide = useCallback(() => {
    const d = dialogRef.current;
    if (!d?.open || d.hasAttribute("data-closing")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      d.close();
      return;
    }
    d.setAttribute("data-closing", "");
    const finish = () => {
      window.clearTimeout(timer);
      d.removeEventListener("animationend", onEnd);
      d.removeAttribute("data-closing");
      if (d.open) d.close();
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === d) finish();
    };
    // The timeout guarantees the close even if the animation never runs.
    const timer = window.setTimeout(finish, 320);
    d.addEventListener("animationend", onEnd);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      toggleRef.current?.focus({ preventScroll: true });
    };
    d.addEventListener("close", onClose);
    // Escape: play the same exit instead of the instant native close.
    const onCancel = (e: Event) => {
      e.preventDefault();
      hide();
    };
    d.addEventListener("cancel", onCancel);
    // Close if the viewport grows past the breakpoint while open.
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && d.open && d.close();
    mq.addEventListener("change", onMq);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("cancel", onCancel);
      mq.removeEventListener("change", onMq);
    };
  }, [hide]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-ink lg:hidden"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={open ? t.a11y.menuClose : t.a11y.menuOpen}
        onClick={open ? hide : show}
      >
        <Menu aria-hidden="true" strokeWidth={1.5} className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label={t.a11y.mainNav}
        className="menu fixed inset-0 m-0 h-dvh w-full bg-bg p-0 text-ink lg:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="container-site flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line">
            <Link to="/" onClick={closeNow} aria-label={t.a11y.home} className="-m-2 inline-flex min-h-11 items-center p-2">
              <Wordmark />
            </Link>
            <button
              type="button"
              className="-mr-2.5 inline-flex size-11 items-center justify-center rounded-[var(--radius-md)]"
              aria-expanded={open}
              aria-controls={dialogId}
              aria-label={t.a11y.menuClose}
              onClick={hide}
            >
              <X aria-hidden="true" strokeWidth={1.5} className="size-6" />
            </button>
          </div>
          <nav aria-label={t.a11y.mainNav} className="container-site flex-1 overflow-y-auto pt-4">
            <ul>
              {items.map((item, i) => (
                <li key={item.id} className="menu-item border-b border-line" style={{ ["--i" as string]: i }}>
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={item.to}
                    onClick={closeNow}
                    aria-current={activeId === item.id ? "true" : undefined}
                    className={cn(
                      "flex h-14 items-center justify-between text-[1.375rem] font-medium tracking-[-0.02em]",
                      activeId === item.id && "text-accent",
                    )}
                  >
                    {item.label}
                    {activeId === item.id && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
                  </Link>
                </li>
              ))}
            </ul>
            <LanguageSwitch className="menu-item mt-6" />
            <div className="menu-item mt-8" style={{ ["--i" as string]: items.length }}>
              <ButtonLink to="/#brif" onClick={closeNow} arrow="up-right" className="w-full">
                {t.nav.contact}
              </ButtonLink>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}

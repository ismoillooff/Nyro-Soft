import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { ButtonLink } from "~/components/ui/Button";
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

  const hide = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      setOpen(false);
      toggleRef.current?.focus({ preventScroll: true });
    };
    d.addEventListener("close", onClose);
    // Close if the viewport grows past the breakpoint while open.
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && d.open && d.close();
    mq.addEventListener("change", onMq);
    return () => {
      d.removeEventListener("close", onClose);
      mq.removeEventListener("change", onMq);
    };
  }, []);

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
            <Link to="/" onClick={hide} aria-label={t.a11y.home} className="-m-2 inline-flex min-h-11 items-center p-2">
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
                    onClick={hide}
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
            <div className="menu-item mt-8" style={{ ["--i" as string]: items.length }}>
              <ButtonLink to="/#brif" onClick={hide} arrow="up-right" className="w-full">
                {t.nav.contact}
              </ButtonLink>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}

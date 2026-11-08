import { useAnimate, useInView } from "motion/react";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { CLAIMED_ATTR, PENDING_ATTR, REVEAL_FALLBACK_MS, buildPlannedFor } from "~/components/build/mode";
import { cappedDelay, dist, dur, ease, stagger } from "~/motion/tokens";
import { prefersReducedMotion, useIsoLayoutEffect } from "./hooks";

const VIEW = { once: true, amount: 0.25, margin: "0px 0px -10% 0px" } as const;

/** One measurement on mount (not per frame): is the element entirely below the fold? */
function isBelowViewport(el: Element): boolean {
  return el.getBoundingClientRect().top >= window.innerHeight;
}

function hide(el: HTMLElement, handOff: boolean) {
  el.style.opacity = "0";
  el.style.transform = `translate3d(0, ${dist.reveal}px, 0)`;
  if (handOff) el.setAttribute(PENDING_ATTR, "");
}

/** Still waiting for us: hidden and not taken over by the build engine. */
function stillOurs(el: HTMLElement): boolean {
  return !el.hasAttribute(CLAIMED_ATTR) && el.style.opacity === "0";
}

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
}

/**
 * Progressive enhancement. The prerendered HTML is fully visible (no inline
 * opacity). After hydration, an element already on screen stays as it is; one
 * below the fold is hidden at once and fades/rises in a single time when it
 * enters. Reduced motion: nothing happens.
 *
 * On a page that is being "built" (components/build), the reveal is handed to
 * the build engine, which shows the element while the agents draw it; if the
 * engine has not claimed it shortly after it enters, it fades in here as usual.
 */
export function Reveal({ as: Tag = "div", delay = 0, className, children, id }: RevealProps) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inView = useInView(scope, VIEW);
  const armed = useRef(false);
  const handOff = useRef(false);

  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion() || !isBelowViewport(el)) return;
    handOff.current = buildPlannedFor(window.location.pathname);
    hide(el, handOff.current);
    armed.current = true;
  }, []);

  useEffect(() => {
    const el = scope.current;
    if (!inView || !armed.current || !el) return;
    const show = () => {
      armed.current = false;
      el.removeAttribute(PENDING_ATTR);
      animate(el, { opacity: [0, 1], y: [dist.reveal, 0] }, { duration: dur.reveal, ease: ease.out, delay });
    };
    if (!handOff.current) return show();
    const timer = window.setTimeout(() => {
      if (stillOurs(el)) show();
      else armed.current = false;
    }, REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [inView, animate, delay, scope]);

  return (
    <Tag ref={scope} className={className} id={id}>
      {children}
    </Tag>
  );
}

interface RevealGroupProps extends RevealProps {
  /** Seconds between items. Items after the sixth arrive together. */
  step?: number;
  /** Step under 768px, if different (project cards: 70ms desktop, 50ms mobile). */
  stepMobile?: number;
  /** Which descendants are revealed; direct children by default. */
  itemSelector?: string;
}

/** Reveals its items in reading order, `step` apart, capped after six. */
export function RevealGroup({
  as: Tag = "div",
  className,
  children,
  step = stagger.base,
  stepMobile,
  itemSelector = ":scope > *",
  id,
}: RevealGroupProps) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inView = useInView(scope, VIEW);
  const armed = useRef<HTMLElement[]>([]);
  const handOff = useRef(false);

  useIsoLayoutEffect(() => {
    const root = scope.current;
    if (!root || prefersReducedMotion()) return;
    handOff.current = buildPlannedFor(window.location.pathname);
    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(isBelowViewport);
    items.forEach((el) => hide(el, handOff.current));
    armed.current = items;
  }, [itemSelector]);

  useEffect(() => {
    if (!inView || armed.current.length === 0) return;
    const s = stepMobile !== undefined && window.innerWidth < 768 ? stepMobile : step;
    const show = (items: HTMLElement[]) => {
      armed.current = [];
      items.forEach((el, i) => {
        el.removeAttribute(PENDING_ATTR);
        animate(el, { opacity: [0, 1], y: [dist.reveal, 0] }, { duration: dur.reveal, ease: ease.out, delay: cappedDelay(i, s) });
      });
    };
    if (!handOff.current) return show(armed.current);
    const timer = window.setTimeout(() => show(armed.current.filter(stillOurs)), REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [inView, animate, step, stepMobile, scope]);

  return (
    <Tag ref={scope} className={className} id={id}>
      {children}
    </Tag>
  );
}

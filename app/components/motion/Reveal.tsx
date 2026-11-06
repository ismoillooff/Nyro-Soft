import { useAnimate, useInView } from "motion/react";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cappedDelay, dist, dur, ease, stagger } from "~/motion/tokens";
import { prefersReducedMotion, useIsoLayoutEffect } from "./hooks";

const VIEW = { once: true, amount: 0.25, margin: "0px 0px -10% 0px" } as const;

/** One measurement on mount (not per frame): is the element entirely below the fold? */
function isBelowViewport(el: Element): boolean {
  return el.getBoundingClientRect().top >= window.innerHeight;
}

function hide(el: HTMLElement) {
  el.style.opacity = "0";
  el.style.transform = `translate3d(0, ${dist.reveal}px, 0)`;
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
 */
export function Reveal({ as: Tag = "div", delay = 0, className, children, id }: RevealProps) {
  const [scope, animate] = useAnimate<HTMLElement>();
  const inView = useInView(scope, VIEW);
  const armed = useRef(false);

  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion() || !isBelowViewport(el)) return;
    hide(el);
    armed.current = true;
  }, []);

  useEffect(() => {
    if (!inView || !armed.current || !scope.current) return;
    armed.current = false;
    animate(scope.current, { opacity: [0, 1], y: [dist.reveal, 0] }, { duration: dur.reveal, ease: ease.out, delay });
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

  useIsoLayoutEffect(() => {
    const root = scope.current;
    if (!root || prefersReducedMotion()) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(isBelowViewport);
    items.forEach(hide);
    armed.current = items;
  }, [itemSelector]);

  useEffect(() => {
    const items = armed.current;
    if (!inView || items.length === 0) return;
    armed.current = [];
    const s = stepMobile !== undefined && window.innerWidth < 768 ? stepMobile : step;
    items.forEach((el, i) => {
      animate(el, { opacity: [0, 1], y: [dist.reveal, 0] }, { duration: dur.reveal, ease: ease.out, delay: cappedDelay(i, s) });
    });
  }, [inView, animate, step, stepMobile, scope]);

  return (
    <Tag ref={scope} className={className} id={id}>
      {children}
    </Tag>
  );
}

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { stagger } from "~/motion/tokens";
import { registerReveal } from "./reveal-controller";

interface RevealProps {
  as?: ElementType;
  /** Extra delay in seconds. */
  delay?: number;
  className?: string;
  children: ReactNode;
  id?: string;
}

/**
 * One-time fade/rise when the element first scrolls into view. Progressive
 * enhancement: visible in the prerendered HTML and without JavaScript; only
 * elements that start below the fold are hidden after hydration. The rules
 * live in ./reveal.ts (one observer for the page, focus and reduced-motion
 * safe, inline styles cleared on cancel and unmount).
 */
export function Reveal({ as: Tag = "div", delay = 0, className, children, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    return el ? registerReveal(el, { delay }) : undefined;
  }, [delay]);
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

interface RevealGroupProps extends RevealProps {
  /** Seconds between items entering together (the cascade is capped at 250ms). */
  step?: number;
  /** Which descendants are revealed; direct children by default. */
  itemSelector?: string;
  "aria-label"?: string;
}

/** Reveals each matching descendant on its own; items that enter together cascade in reading order. */
export function RevealGroup({ as: Tag = "div", className, children, step = stagger.base, itemSelector = ":scope > *", id, "aria-label": ariaLabel }: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const offs = Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).map((el) => registerReveal(el, { step }));
    return () => offs.forEach((off) => off());
  }, [itemSelector, step]);
  return (
    <Tag ref={ref} className={className} id={id} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}

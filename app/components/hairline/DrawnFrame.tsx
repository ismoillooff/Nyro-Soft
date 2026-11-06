import { useAnimate, useInView } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "~/lib/cn";
import { ease } from "~/motion/tokens";
import { prefersReducedMotion, useIsoLayoutEffect } from "~/components/motion/hooks";
import { CornerMarks } from "./Hairline";

/**
 * A frame whose four 1px edges draw themselves once from the corners when it
 * first enters the viewport (scaleX/scaleY, 650ms). Prerendered fully drawn;
 * only a frame that starts below the fold is collapsed after hydration.
 * Reduced motion: static.
 */
export function DrawnFrame({ children, className, corners = true }: { children: ReactNode; className?: string; corners?: boolean }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount: 0.3 });
  const armed = useRef(false);

  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el || prefersReducedMotion() || el.getBoundingClientRect().top < window.innerHeight) return;
    el.querySelectorAll<HTMLElement>("[data-edge]").forEach((edge) => {
      edge.style.transform = edge.dataset.edge === "x" ? "scaleX(0)" : "scaleY(0)";
    });
    armed.current = true;
  }, []);

  useEffect(() => {
    if (!inView || !armed.current) return;
    armed.current = false;
    const opts = { duration: 0.65, ease: ease.out };
    animate("[data-edge='x']", { scaleX: [0, 1] }, opts);
    animate("[data-edge='y']", { scaleY: [0, 1] }, opts);
  }, [inView, animate]);

  const edge = "pointer-events-none absolute bg-line-strong";
  return (
    <div ref={scope} className={cn("relative bg-surface", className)}>
      <span aria-hidden="true" data-edge="x" className={cn(edge, "inset-x-0 top-0 h-px origin-left")} />
      <span aria-hidden="true" data-edge="y" className={cn(edge, "inset-y-0 right-0 w-px origin-top")} />
      <span aria-hidden="true" data-edge="x" className={cn(edge, "inset-x-0 bottom-0 h-px origin-right")} />
      <span aria-hidden="true" data-edge="y" className={cn(edge, "inset-y-0 left-0 w-px origin-bottom")} />
      {corners && <CornerMarks />}
      <div className="relative p-px">{children}</div>
    </div>
  );
}

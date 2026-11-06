import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { dur, ease } from "~/motion/tokens";

const loadFeatures = () => import("~/motion/features").then((r) => r.default);

/**
 * LazyMotion in strict mode: only `m.*` components are allowed, and the
 * feature bundle (domMax: layout + layoutId) arrives asynchronously.
 *
 * reducedMotion="user" only covers Motion's own transform/layout animations.
 * Scroll-linked values, CSS animations, the marquee, beams and figure play are
 * switched off separately via useReducedMotionPref() and the CSS media query.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: dur.ui, ease: ease.out }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

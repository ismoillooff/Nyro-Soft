import { useScroll, useSpring, useTransform, type MotionValue, type UseScrollOptions } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { spring } from "~/motion/tokens";

/** useLayoutEffect on the client, useEffect on the server (prerender runs in Node). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const noopSubscribe = () => () => {};

/** A media query as state: `serverValue` during prerender and hydration, the real value after. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function useReducedMotionPref(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True after hydration. Use it to render client-only pieces without a hydration mismatch. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Synchronous check, for effects and event handlers only. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Offset = NonNullable<UseScrollOptions["offset"]>;

const followSpring = { stiffness: spring.follow.stiffness, damping: spring.follow.damping, mass: spring.follow.mass };

/**
 * Scroll progress of a target, smoothed with the follow spring (100/18/1).
 * Under reduced motion the raw value is returned (still accurate, no easing).
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  offset: Offset = ["start center", "end center"],
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const smooth = useSpring(scrollYProgress, followSpring);
  const reduce = useReducedMotionPref();
  return reduce ? scrollYProgress : smooth;
}

/** Whole-page progress, smoothed the same way (mobile progress line). */
export function usePageProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, followSpring);
  const reduce = useReducedMotionPref();
  return reduce ? scrollYProgress : smooth;
}

/** Vertical parallax from 0 to −px as the target scrolls through `offset`. Capped at 32px; 0 under reduced motion. */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  px: number,
  offset: Offset = ["start start", "end start"],
): MotionValue<number> {
  const distance = Math.min(Math.abs(px), 32) * Math.sign(px);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const smooth = useSpring(scrollYProgress, followSpring);
  const reduce = useRef(true);
  const reduced = useReducedMotionPref();
  useEffect(() => {
    reduce.current = prefersReducedMotion();
  }, [reduced]);
  return useTransform(smooth, (v) => (reduce.current ? 0 : -distance * v));
}

/* ─── Active section: one IntersectionObserver, one source of truth ─────── */

let active: string | null = null;
const listeners = new Set<() => void>();

function publish(id: string | null) {
  if (id === active) return;
  active = id;
  for (const fn of listeners) fn();
}

function subscribeActive(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Reads the active home section id (or null). Used by the header and the rail. */
export function useActiveSectionId(): string | null {
  return useSyncExternalStore(
    subscribeActive,
    () => active,
    () => null,
  );
}

/**
 * Observes the given section ids and publishes the one crossing the middle
 * band of the viewport (rootMargin -45% / -50%). Mount once per page.
 */
export function useActiveSection(ids: readonly string[]): void {
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const inside = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inside.add(e.target.id);
          else inside.delete(e.target.id);
        }
        publish(els.find((el) => inside.has(el.id))?.id ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const el of els) io.observe(el);
    return () => {
      io.disconnect();
      publish(null);
    };
  }, [key]);
}

/**
 * Motion tokens — the one source for every duration, curve, distance and
 * stagger on the site. styles/app.css mirrors them as CSS custom properties
 * (--dur-*, --ease-*, --dist-*), so Tailwind classes, WAAPI and Motion all use
 * the same values. Components never write their own numbers.
 *
 * Ranges (tuned in the browser):
 *   press 140ms · hover/micro 160ms · UI change 240ms · reveal 450ms ·
 *   figure / main shape 700ms · stagger 50ms (capped at 250ms total) ·
 *   distance 8–16px · parallax ≤ 24px.
 */
export const ease = {
  /** Default: quick start, long soft landing. */
  out: [0.32, 0.72, 0, 1],
  /** Symmetric, for things that travel (beams, the process fill). */
  inOut: [0.65, 0, 0.35, 1],
} as const;

/** Seconds. */
export const dur = {
  press: 0.14,
  micro: 0.16,
  ui: 0.24,
  reveal: 0.45,
  figure: 0.7,
  route: 0.26,
} as const;

/** px */
export const dist = { small: 8, reveal: 12, large: 16 } as const;

/** Seconds between items; the whole cascade never exceeds `max`. */
export const stagger = { base: 0.05, tight: 0.04, max: 0.25 } as const;

/** Upper bounds for scroll-linked drift (px), so nothing floats away from its frame. */
export const parallax = { max: 24, figure: 24, grid: 16 } as const;

export const spring = {
  follow: { type: "spring", stiffness: 100, damping: 18, mass: 1 }, // pointer and scroll smoothing
  ui: { type: "spring", visualDuration: 0.26, bounce: 0 }, // layout, active indicators
} as const;

/** The same curves as CSS strings, for WAAPI and inline styles. */
export const easeCss = {
  out: `cubic-bezier(${ease.out.join(",")})`,
  inOut: `cubic-bezier(${ease.inOut.join(",")})`,
} as const;

/** Delay of the i-th item in a cascade, in seconds: `step` apart, never more than stagger.max. */
export function cappedDelay(index: number, step: number = stagger.base): number {
  return Math.min(index * step, stagger.max);
}

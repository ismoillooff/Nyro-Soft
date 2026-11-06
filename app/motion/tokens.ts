/**
 * Motion tokens. The CSS custom properties in styles/app.css (--ease-out,
 * --dur-*) carry the same values; components never write their own.
 */
export const ease = { out: [0.32, 0.72, 0, 1], inOut: [0.65, 0, 0.35, 1] } as const;
export const dur = { micro: 0.18, ui: 0.24, reveal: 0.56, figure: 0.7, route: 0.26 } as const; // seconds
export const dist = { reveal: 16, small: 8 } as const; // px
export const stagger = { base: 0.06, tight: 0.05, max: 0.36 } as const; // total stagger ≤ 0.36s
export const spring = {
  follow: { type: "spring", stiffness: 100, damping: 18, mass: 1 }, // pointer and scroll smoothing
  ui: { type: "spring", visualDuration: 0.28, bounce: 0 }, // layout, active indicator
} as const;

/** The same curve as a CSS string, for WAAPI and inline styles. */
export const easeCss = {
  out: `cubic-bezier(${ease.out.join(",")})`,
  inOut: `cubic-bezier(${ease.inOut.join(",")})`,
} as const;

/** Stagger that caps after the sixth item: later items arrive together. */
export function cappedDelay(index: number, step: number = stagger.base): number {
  return Math.min(index, 5) * step;
}

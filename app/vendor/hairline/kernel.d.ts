/**
 * Types for the vendored Hairline kernel (kernel.js, MIT). The file itself is
 * a classic script that declares `var HL`; vite.config.ts appends
 * `export default HL;` at build time, which is what this declares.
 *
 * Only what the site calls is typed precisely; the figure itself (nyro.js) is
 * plain JavaScript and reaches the rest.
 */

/** A point in the 400 × 320 viewBox, or null for "leave". */
export type HairlineStop = readonly [number, number] | null;

export interface HairlineTour {
  stop(): void;
}

export interface HairlineKernel {
  /** Adds the kernel's stylesheet to a document or shadow root, once. */
  inject(root: Document | ShadowRoot): void;
  /** The kernel's stylesheet as text; `lightDark` adds the light-dark() palette. */
  css(lightDark: boolean): string;
  /** An unseen pointer that walks the stops and gives way to a real one. */
  tour(stage: HTMLElement, stops: readonly HairlineStop[], onStop?: (index: number) => void): HairlineTour;
  /** True while the reader asked for less motion; springs and tweens land at once. */
  reducedMotion(): boolean;
  readonly LAP: readonly HairlineStop[];
  readonly [name: string]: unknown;
}

declare const HL: HairlineKernel;
export default HL;

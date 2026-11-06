import type { HairlineStop } from "./kernel.js";

/** Where the figure writes its caption: "rest", "01 · tuzilma", "02 · dizayn", "03 · natija". */
export interface NyroRead {
  textContent: string;
}

export interface NyroContext {
  /** The host element: it takes the pointer, and the kernel's loop watches it. */
  stage: HTMLElement;
  /** An svg with viewBox "0 0 400 320"; the figure draws into it and empties it on destroy. */
  svg: SVGSVGElement;
  read: NyroRead;
}

export interface NyroOptions {
  /** Settle from slightly open on mount (default true). False starts at rest. */
  enter?: boolean;
}

export interface NyroHandle {
  /** The widest gap, in the figure's own units (range[0]…range[2]). */
  set(value: number): void;
  destroy(): void;
}

export interface NyroFigure {
  readonly name: "nyro";
  readonly means: string;
  readonly rules: readonly number[];
  /** The gap at intensity 0, 0.5 and 1. */
  readonly range: readonly [number, number, number];
  readonly tour: readonly HairlineStop[];
  mount(ctx: NyroContext, value: number, opts?: NyroOptions): NyroHandle;
}

export declare const nyro: NyroFigure;

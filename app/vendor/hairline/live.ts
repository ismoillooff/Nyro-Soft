/**
 * The live Nyro N, client only. NyroMark imports this module in a layout
 * effect, after the static rest copy is on screen; it never runs during
 * prerender, because the kernel needs a DOM.
 */
import HL from "./kernel.js";
import { nyro, type NyroRead } from "./nyro.js";

export interface NyroLive {
  /** The widest gap, in the figure's own units; see NYRO_RANGE. */
  set(value: number): void;
  /** Starts the tour: an unseen pointer walks the three plates, and gives way to a real one. */
  play(): void;
  stopPlay(): void;
  destroy(): void;
}

export interface MountNyroOptions {
  /** The accessible name, if the host does not already carry one. */
  label?: string;
  /** Settle from slightly open on mount. False when a static copy already played the entrance. */
  enter?: boolean;
}

/** The gap at intensity 0, 0.5 and 1. */
export const NYRO_RANGE = nyro.range;
/** The default: intensity 0.5. */
export const NYRO_DEFAULT = nyro.range[1];

/**
 * Mounts the figure the way the package's own mount does: the kernel's styles,
 * the host's attributes, then the drawing. The svg is emptied first, so a
 * static copy in it is replaced in the same task, before the next paint.
 */
export function mountNyro(
  stage: HTMLElement,
  svg: SVGSVGElement,
  read: NyroRead,
  value: number,
  opts: MountNyroOptions = {},
): NyroLive {
  HL.inject(document);
  stage.setAttribute("data-hairline", nyro.name);
  stage.setAttribute("role", "img");
  if (!stage.hasAttribute("aria-label")) stage.setAttribute("aria-label", opts.label ?? nyro.means);
  svg.replaceChildren();

  const handle = nyro.mount({ stage, svg, read }, value, { enter: opts.enter ?? true });
  let touring: { stop(): void } | null = null;
  const stopPlay = () => {
    touring?.stop();
    touring = null;
  };

  return {
    set: (v) => handle.set(v),
    play: () => {
      if (!touring) touring = HL.tour(stage, nyro.tour);
    },
    stopPlay,
    destroy: () => {
      stopPlay();
      handle.destroy();
    },
  };
}

import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "~/lib/cn";
import { HAIRLINE_KERNEL_CSS, NYRO_ENTER_CSS, NYRO_REST_SVG } from "./nyro-rest";
import type { NyroLive } from "~/vendor/hairline/live";

export interface NyroMarkProps {
  /** The accessible name (Uzbek), e.g. "Qatlamli Nyro N belgisi: tuzilma, dizayn va natija". */
  label: string;
  className?: string;
  /** The read-out, each time it changes: "N" at rest, then "01 · tuzilma", "02 · dizayn", "03 · natija". */
  onRead?: (text: string) => void;
}

/** How long the pointer must stay away from the hero before the figure walks itself (desktop). */
const IDLE_MS = 4000;
/** The static copy is wrapped in this group; NYRO_ENTER_CSS plays the entrance on it. */
const STATIC_MARKUP = `<g class="hl-nyro-enter">${NYRO_REST_SVG}</g>`;
/**
 * The kernel's stylesheet plus the entrance, hoisted into <head> by React and
 * shipped in the prerendered HTML. The static copy is drawn with the very
 * classes the kernel uses (sil, hi, lo, dash…) and sits in a stage that
 * already carries data-hairline, so the kernel's rules style it exactly as
 * they will style the live figure: same box, same strokes, no flash on swap.
 * When the kernel mounts it injects the same rules again; they are identical
 * and carry no specificity, so nothing changes.
 */
const STYLE = HAIRLINE_KERNEL_CSS + NYRO_ENTER_CSS;

/**
 * The hero's layered N (spec §5.4). Prerendered as the rest pose; in the
 * browser the live figure takes over the same svg once the CSS entrance has
 * landed, and answers the pointer: across opens the gap, up and down picks a
 * plate. It walks itself (play) only in view, never under reduced motion, and
 * on hover devices only after the pointer has stayed away from the hero 4 s.
 */
export function NyroMark({ label, className, onRead }: NyroMarkProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  });

  useLayoutEffect(() => {
    const stage = stageRef.current, svg = svgRef.current, readEl = readRef.current;
    if (!stage || !svg || !readEl) return;
    let cancelled = false;
    let live: NyroLive | null = null;
    const undo: Array<() => void> = [];

    let text = "rest";
    const read = {
      get textContent() {
        return text;
      },
      set textContent(value: string) {
        if (value === text) return;
        text = value;
        const shown = value === "rest" ? "N" : value;
        readEl.textContent = shown;
        onReadRef.current?.(shown);
      },
    };

    // Wait for the static entrance to land, so the swap happens on the rest pose it shares with the live figure.
    const landed = Promise.all(
      (typeof svg.getAnimations === "function" ? svg.getAnimations({ subtree: true }) : []).map((a) =>
        a.finished.catch(() => undefined),
      ),
    );

    void Promise.all([import("~/vendor/hairline/live"), landed]).then(([mod]) => {
      if (cancelled) return;
      live = mod.mountNyro(stage, svg, read, mod.NYRO_DEFAULT, { label, enter: false });
      undo.push(autoplay(stage, live));
    });

    return () => {
      cancelled = true;
      undo.forEach((fn) => fn());
      live?.destroy();
      live = null;
    };
    // The figure mounts once; the label reaches the stage through its aria-label prop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("hl-figure relative", className)} data-surface="bg">
      <style href="hairline-nyro" precedence="default">
        {STYLE}
      </style>
      <div ref={stageRef} data-hairline="nyro" data-hairline-theme="light" role="img" aria-label={label}>
        <svg
          ref={svgRef}
          viewBox="0 0 400 320"
          aria-hidden="true"
          focusable="false"
          dangerouslySetInnerHTML={{ __html: STATIC_MARKUP }}
        />
      </div>
      <span
        ref={readRef}
        aria-hidden="true"
        className="t-label pointer-events-none absolute right-0 top-0 select-none text-ink-2"
      >
        N
      </span>
    </div>
  );
}

/**
 * Starts and stops the tour (spec §5.4, play): only while the stage is in the
 * viewport, never under reduced motion, and either on a device without hover
 * or after the pointer has left the hero alone for IDLE_MS. The tour itself
 * gives way to a real pointer on the stage. Returns its tear-down.
 */
function autoplay(stage: HTMLElement, live: NyroLive): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const noHover = window.matchMedia("(hover: none)");
  const hero = stage.closest("section") ?? stage.parentElement ?? stage;
  let inView = false;
  let idle = false;
  let timer = 0;

  const update = () => {
    if (!reduce.matches && inView && (noHover.matches || idle)) live.play();
    else live.stopPlay();
  };
  const arm = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      // a pointer resting inside the hero still counts as present
      if (hero.matches(":hover")) return;
      idle = true;
      update();
    }, IDLE_MS);
  };
  const present = () => {
    window.clearTimeout(timer);
    if (idle) {
      idle = false;
      update();
    }
  };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) inView = e.isIntersecting;
    update();
  });
  io.observe(stage);
  hero.addEventListener("pointermove", present, { passive: true });
  hero.addEventListener("pointerleave", arm);
  reduce.addEventListener("change", update);
  noHover.addEventListener("change", update);
  arm();

  return () => {
    window.clearTimeout(timer);
    io.disconnect();
    hero.removeEventListener("pointermove", present);
    hero.removeEventListener("pointerleave", arm);
    reduce.removeEventListener("change", update);
    noHover.removeEventListener("change", update);
    live.stopPlay();
  };
}

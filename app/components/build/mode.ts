/**
 * Shared state of the "build" animation, kept tiny so it can live in the main
 * chunk: whether a page will be built, and the hand-off of scroll reveals.
 *
 * When a page is going to be built, <Reveal> still hides what is below the
 * fold, but instead of fading it in itself it marks it `data-build-pending`
 * and lets the build engine reveal it while the agents draw it. If the engine
 * never claims it (failed to load, user closed it, section skipped), Reveal
 * falls back to its own fade after a short delay — content is never stranded.
 */

/** Set to false to keep only the replay button (no automatic building). */
export const AUTO_PLAY = true;

const PAGE_KEY = (path: string) => `nyro-build:${path}`;
const OFF_KEY = "nyro-build:off";

export const PENDING_ATTR = "data-build-pending";
export const CLAIMED_ATTR = "data-build-claimed";
/** How long a hidden reveal waits for the engine before fading in on its own. */
export const REVEAL_FALLBACK_MS = 2500;

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when this page will be built on this visit (first visit of the page in the session). */
export function buildPlannedFor(pathname: string): boolean {
  if (!AUTO_PLAY || typeof window === "undefined" || reducedMotion()) return false;
  const s = storage();
  if (s?.getItem(OFF_KEY) === "1") return false;
  return s?.getItem(PAGE_KEY(pathname)) !== "1";
}

export function markPageBuilt(pathname: string): void {
  try {
    storage()?.setItem(PAGE_KEY(pathname), "1");
  } catch {
    /* storage unavailable: the page may build again, which is harmless */
  }
}

/** The visitor closed the animation: no more automatic building this session. */
export function turnBuildOff(): void {
  try {
    storage()?.setItem(OFF_KEY, "1");
  } catch {
    /* ignore */
  }
}

/** Shows a hidden reveal element (optionally with a fade) and clears the hand-off markers. */
export function releaseReveal(el: HTMLElement, fade: boolean): void {
  el.removeAttribute(PENDING_ATTR);
  el.removeAttribute(CLAIMED_ATTR);
  el.style.transform = "";
  el.style.opacity = "";
  if (fade) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "cubic-bezier(.32,.72,0,1)" });
}

/**
 * Shared state of the "build" animation, kept tiny so it lives in the main
 * chunk: whether the current page should play it, and the session flags.
 *
 * The build is decoration only. It draws outlines and size labels on an
 * overlay above the page; it never changes the opacity, transform or
 * visibility of the content, and it never touches scroll reveals. The
 * automatic run is limited to the hero (first visit of a page in the
 * session); the detailed full-view build runs only from the replay button.
 */

/** Set to false to keep only the replay button (no automatic hero build). */
export const AUTO_PLAY = true;

/** Marks the region the automatic build draws (the page hero). */
export const HERO_ATTR = "data-build-hero";

const PAGE_KEY = (path: string) => `nyro-build:${path}`;
const OFF_KEY = "nyro-build:off";

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

/** True when the hero build should play on this visit (first visit of the page in the session). */
export function buildPlannedFor(pathname: string): boolean {
  if (!AUTO_PLAY || typeof window === "undefined" || reducedMotion()) return false;
  const s = storage();
  try {
    if (s?.getItem(OFF_KEY) === "1") return false;
    return s?.getItem(PAGE_KEY(pathname)) !== "1";
  } catch {
    return false;
  }
}

/** Called only once the hero build has actually played (or was dismissed by the visitor). */
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

import { RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { stripLocale, useI18n } from "~/i18n";
import { prefersReducedMotion, useHydrated, useReducedMotionPref } from "~/components/motion/hooks";

const BuildSwarm = lazy(() => import("./BuildSwarm"));

/** Set to false to keep the build animation for the replay button only. */
const AUTO_PLAY = true;
const SEEN_KEY = "nyro-build-played";
const EVENT = "nyro:build";

function seen(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage unavailable: it may play again, which is harmless */
  }
}

/**
 * Plays the build animation once per session on the home page (at the top,
 * without a #hash, tab visible, no reduced motion), and whenever the replay
 * button asks for it. Mounted once in the root layout.
 */
export function BuildController() {
  const { pathname, hash } = useLocation();
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!AUTO_PLAY || seen() || prefersReducedMotion()) return;
    if (stripLocale(pathname) !== "/" || hash || window.scrollY > 40 || document.hidden) return;
    let cancelled = false;
    const start = async () => {
      await document.fonts.ready;
      // Let the hero's own entrance (≤630ms) land first.
      window.setTimeout(() => {
        if (cancelled || window.scrollY > 40) return;
        markSeen();
        setRun((n) => n + 1);
      }, 700);
    };
    void start();
    return () => {
      cancelled = true;
    };
    // Only on the first page of the visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onReplay = () => {
      if (!prefersReducedMotion()) setRun((n) => n + 1);
    };
    window.addEventListener(EVENT, onReplay);
    return () => window.removeEventListener(EVENT, onReplay);
  }, []);

  if (run === 0) return null;
  return (
    <Suspense fallback={null}>
      <BuildSwarm key={run} onDone={() => setRun(0)} />
    </Suspense>
  );
}

/** "↻ Qayta qurish" — replays the animation on the current view. Hidden without JS and under reduced motion. */
export function BuildReplayButton({ className }: { className?: string }) {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const reduce = useReducedMotionPref();
  if (!hydrated || reduce) return null;
  return (
    <button
      type="button"
      data-build-skip=""
      onClick={() => window.dispatchEvent(new Event(EVENT))}
      className={className ?? "group/btn inline-flex min-h-11 items-center gap-1.5 hover:text-ink"}
    >
      <RotateCcw aria-hidden="true" strokeWidth={1.5} className="size-[1.05em] transition-transform duration-[180ms] group-hover/btn:-rotate-45 motion-reduce:transition-none" />
      {t.build.replay}
    </button>
  );
}

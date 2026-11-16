import { RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useI18n } from "~/i18n";
import { prefersReducedMotion, useHydrated, useReducedMotionPref } from "~/components/motion/hooks";
import { buildPlannedFor, HERO_ATTR, markPageBuilt, turnBuildOff } from "./mode";

const BuildLayer = lazy(() => import("./BuildLayer"));

const EVENT = "nyro:build";
/** After fonts: lets the hero's own CSS entrance (label → h1 → CTA → N, ≤ 760ms) land first. */
const START_DELAY = 900;

type Mode = "hero" | "view" | null;

/**
 * Decides when the build animation runs: on the first visit of each page in a
 * session, a short pass over the hero; the replay button builds the current
 * view in detail. Never under reduced motion (also when it is switched on
 * while the page is open). Mounted once in the root layout; resets on every
 * route change.
 */
export function BuildController() {
  const { pathname } = useLocation();
  return <PageBuild key={pathname} pathname={pathname} />;
}

function heroOnScreen(): boolean {
  const hero = document.querySelector<HTMLElement>(`main [${HERO_ATTR}]`);
  if (!hero) return false;
  const r = hero.getBoundingClientRect();
  return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
}

function PageBuild({ pathname }: { pathname: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const [replay, setReplay] = useState(0);
  const reduce = useReducedMotionPref();

  // Automatic hero run. The page is marked "built" only when the run has actually played.
  useEffect(() => {
    if (!buildPlannedFor(pathname)) return;
    let cancelled = false;
    let timer = 0;
    const start = () => {
      timer = 0;
      // Entered via a hash or a restored scroll position: the hero is not what the visitor sees.
      if (cancelled || prefersReducedMotion() || !heroOnScreen()) return;
      setMode((m) => m ?? "hero");
    };
    const schedule = () => {
      if (cancelled || timer) return;
      if (document.visibilityState === "hidden") return; // waits for onVisible
      timer = window.setTimeout(start, START_DELAY);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    document.addEventListener("visibilitychange", onVisible);
    void document.fonts.ready.then(schedule, schedule);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  useEffect(() => {
    const onReplay = () => {
      if (prefersReducedMotion()) return;
      setMode((m) => m ?? "view");
      setReplay((n) => n + 1);
    };
    window.addEventListener(EVENT, onReplay);
    return () => window.removeEventListener(EVENT, onReplay);
  }, []);

  const active = reduce ? null : mode;
  if (!active) return null;
  return (
    <Suspense fallback={null}>
      <BuildLayer
        mode={active}
        replay={replay}
        onHeroDone={() => markPageBuilt(pathname)}
        onClose={() => {
          markPageBuilt(pathname);
          turnBuildOff();
          setMode(null);
          setReplay(0);
        }}
      />
    </Suspense>
  );
}

/** "↻ Qayta qurish" — builds the current view again. Hidden without JS and under reduced motion. */
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
      className={className ?? "group/btn inline-flex min-h-11 items-center gap-1.5 transition-colors duration-(--dur-micro) hover:text-ink"}
    >
      <RotateCcw
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-[1.05em] transition-transform duration-(--dur-ui) ease-(--ease-out) group-hover/btn:-rotate-45 motion-reduce:transition-none"
      />
      {t.build.replay}
    </button>
  );
}

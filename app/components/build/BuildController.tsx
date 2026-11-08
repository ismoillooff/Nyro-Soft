import { RotateCcw } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useI18n } from "~/i18n";
import { prefersReducedMotion, useHydrated, useReducedMotionPref } from "~/components/motion/hooks";
import { buildPlannedFor, markPageBuilt, turnBuildOff } from "./mode";

const BuildLayer = lazy(() => import("./BuildLayer"));

const EVENT = "nyro:build";

type Mode = "page" | "view" | null;

/**
 * Decides when the build animation runs: on the first visit of each page in a
 * session it builds the first view and then every section as it scrolls in;
 * the replay button builds the current view again. Never under reduced motion.
 * Mounted once in the root layout; resets on every route change.
 */
export function BuildController() {
  const { pathname } = useLocation();
  return <PageBuild key={pathname} pathname={pathname} />;
}

function PageBuild({ pathname }: { pathname: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (!buildPlannedFor(pathname)) return;
    markPageBuilt(pathname);
    let cancelled = false;
    void document.fonts.ready.then(() => {
      // Let the hero's own CSS entrance (≤630ms) land first.
      window.setTimeout(() => {
        if (!cancelled && !document.hidden) setMode("page");
      }, 650);
    });
    return () => {
      cancelled = true;
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

  if (!mode) return null;
  return (
    <Suspense fallback={null}>
      <BuildLayer
        mode={mode}
        replay={replay}
        onClose={() => {
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
      className={className ?? "group/btn inline-flex min-h-11 items-center gap-1.5 hover:text-ink"}
    >
      <RotateCcw
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-[1.05em] transition-transform duration-[180ms] group-hover/btn:-rotate-45 motion-reduce:transition-none"
      />
      {t.build.replay}
    </button>
  );
}

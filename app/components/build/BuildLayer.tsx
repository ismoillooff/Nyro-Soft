import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fmt, useI18n } from "~/i18n";
import { createEngine, type BuildEngine, type EngineState } from "./engine";
import { HERO_ATTR } from "./mode";

function headingText(): string {
  return document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 48) ?? "";
}

interface Props {
  /** "hero": the short automatic first-visit run. "view": the detailed replay of the current view. */
  mode: "hero" | "view";
  /** Bumped by the replay button: builds the current view again. */
  replay: number;
  /** The hero run played to the end (or was cut short by the visitor). */
  onHeroDone: () => void;
  /** The visitor closed it (× or Escape). */
  onClose: () => void;
}

/**
 * Owns one build engine for the current page and renders the small control
 * panel while something is being built. The automatic run draws only the
 * hero; scrolling, a key or a click ends it at once so it never competes with
 * what the visitor is doing. The replay button builds the whole current view.
 */
export default function BuildLayer({ mode, replay, onHeroDone, onClose }: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<EngineState | null>(null);
  const engineRef = useRef<BuildEngine | null>(null);
  const mountedReplay = useRef(replay);
  const cb = useRef({ onHeroDone, onClose });
  cb.current = { onHeroDone, onClose };

  useEffect(() => {
    const engine = createEngine(setState);
    engineRef.current = engine;
    let live = true;

    const cleanups: Array<() => void> = [];
    if (mode === "hero") {
      const hero = document.querySelector<HTMLElement>(`main [${HERO_ATTR}]`);
      // The visitor takes over: wheel, touch, keys or a click end the automatic run.
      const interrupt = () => engine.abort();
      const opts = { passive: true, once: true } as const;
      for (const type of ["wheel", "touchstart", "keydown", "pointerdown"] as const) {
        window.addEventListener(type, interrupt, opts);
        cleanups.push(() => window.removeEventListener(type, interrupt));
      }
      void engine.enqueue(hero, headingText(), "hero").then(() => {
        if (live) cb.current.onHeroDone();
      });
    } else {
      void engine.enqueue(null, headingText(), "full");
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current.onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      live = false;
      window.removeEventListener("keydown", onKey);
      cleanups.forEach((fn) => fn());
      engine.destroy();
      engineRef.current = null;
    };
  }, [mode]);

  // Replay: build what is on screen now, again.
  useEffect(() => {
    if (replay !== mountedReplay.current) void engineRef.current?.enqueue(null, headingText(), "full");
  }, [replay]);

  if (!state?.busy) return null;
  const progress = state.total ? state.built / state.total : 0;

  return createPortal(
    <div
      role="group"
      aria-label={t.build.panel}
      data-build-skip=""
      className="build-panel fixed bottom-4 left-1/2 z-[61] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink py-1.5 pr-1.5 pl-3 text-white shadow-[var(--shadow-2)] sm:bottom-5 sm:gap-3"
    >
      <span aria-hidden="true" className="flex shrink-0">
        {Array.from({ length: Math.min(state.agents, 3) }, (_, i) => (
          <span key={i} className="-ml-1 size-3.5 rounded-full border-2 border-ink first:ml-0" style={{ background: `var(--agent-${i + 1})` }} />
        ))}
      </span>
      {state.label && (
        <span className="t-label hidden max-w-[16rem] truncate text-white md:inline" title={state.label}>
          {state.label}
        </span>
      )}
      <span aria-hidden="true" className="hidden h-4 w-px bg-white/20 md:block" />
      <span className="t-label whitespace-nowrap text-white/85">{fmt(t.build.agents, { n: state.agents })}</span>
      <span aria-hidden="true" className="h-4 w-px bg-white/20" />
      <span className="t-label whitespace-nowrap text-white/85 tabular-nums">
        {state.done ? t.build.done : fmt(t.build.layers, { done: state.built, total: state.total })}
      </span>
      <span aria-hidden="true" className="relative hidden h-px w-14 overflow-hidden bg-white/20 sm:block">
        <span className="absolute inset-0 origin-left bg-white transition-transform duration-(--dur-ui)" style={{ transform: `scaleX(${progress})` }} />
      </span>
      {mode === "view" && (
        <button
          type="button"
          onClick={() => engineRef.current?.setSpeed(state.speed === 1 ? 2 : 1)}
          aria-label={t.build.speed}
          className="t-label inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-white/10 px-2.5 text-white hover:bg-white/20"
        >
          {state.speed}×
        </button>
      )}
      <button
        type="button"
        onClick={() => cb.current.onClose()}
        aria-label={t.build.close}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      >
        <X aria-hidden="true" strokeWidth={1.5} className="size-4" />
      </button>
    </div>,
    document.body,
  );
}

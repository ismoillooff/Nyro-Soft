import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fmt, useI18n } from "~/i18n";
import { createEngine, type BuildEngine, type EngineState } from "./engine";

/** Label for the panel: the section's mono label ("03 — Xizmatlar") or its heading. */
function labelOf(section: HTMLElement): string {
  const mono = section.querySelector<HTMLElement>(".t-label");
  const text = mono?.textContent?.includes("—") ? mono.textContent : null;
  const heading = section.querySelector<HTMLElement>("h1, h2")?.textContent ?? "";
  return (text ?? heading).replace(/\s+/g, " ").trim().slice(0, 48);
}

interface Props {
  /** Build the page section by section as it scrolls in (first visit), or only the current view (replay). */
  mode: "page" | "view";
  /** Bumped by the replay button: builds the current view again. */
  replay: number;
  /** The visitor closed it. */
  onClose: () => void;
}

/**
 * Owns one build engine for the current page: the first viewport right away,
 * then every section as it reaches 80% of the viewport height. Renders the
 * small control panel while something is being built.
 */
export default function BuildLayer({ mode, replay, onClose }: Props) {
  const { t } = useI18n();
  const [state, setState] = useState<EngineState | null>(null);
  const engineRef = useRef<BuildEngine | null>(null);
  /** The replay value this layer was mounted with is already built by the first job. */
  const mountedReplay = useRef(replay);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const engine = createEngine(setState);
    engineRef.current = engine;
    const pageLabel = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 48) ?? "";
    engine.enqueue(null, pageLabel);

    let io: IntersectionObserver | null = null;
    if (mode === "page") {
      const vh = window.innerHeight;
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[aria-labelledby]")).filter(
        // Sections already (partly) on screen were part of the first viewport.
        (s) => s.getBoundingClientRect().top > vh * 0.8,
      );
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            io?.unobserve(e.target);
            engine.enqueue(e.target as HTMLElement, labelOf(e.target as HTMLElement));
          }
        },
        { rootMargin: "0px 0px -20% 0px", threshold: 0 },
      );
      for (const s of sections) io.observe(s);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      io?.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, [mode]);

  // Replay: build what is on screen now, again.
  useEffect(() => {
    if (replay !== mountedReplay.current) engineRef.current?.enqueue(null, document.querySelector("h1")?.textContent?.trim().slice(0, 48) ?? "");
  }, [replay]);

  if (!state?.busy) return null;
  const progress = state.total ? state.built / state.total : 0;

  return createPortal(
    <div
      role="group"
      aria-label={t.build.panel}
      data-build-skip=""
      className="fixed bottom-4 left-1/2 z-[61] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink py-1.5 pr-1.5 pl-3 text-white shadow-[var(--shadow-2)] sm:bottom-5 sm:gap-3"
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
        <span className="absolute inset-0 origin-left bg-white transition-transform duration-200" style={{ transform: `scaleX(${progress})` }} />
      </span>
      <button
        type="button"
        onClick={() => engineRef.current?.setSpeed(state.speed === 1 ? 2 : 1)}
        aria-label={t.build.speed}
        className="t-label inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-white/10 px-2.5 text-white hover:bg-white/20"
      >
        {state.speed}×
      </button>
      <button
        type="button"
        onClick={() => onCloseRef.current()}
        aria-label={t.build.close}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      >
        <X aria-hidden="true" strokeWidth={1.5} className="size-4" />
      </button>
    </div>,
    document.body,
  );
}

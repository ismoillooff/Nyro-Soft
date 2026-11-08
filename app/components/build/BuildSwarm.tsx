import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fmt, useI18n } from "~/i18n";
import { easeCss } from "~/motion/tokens";

/**
 * "Build" animation: a swarm of agent cursors flies over the visible part of
 * the page and rebuilds it element by element — each one gets an outline drawn
 * with stroke-dashoffset, a "W × H" size label, and fades back in.
 *
 * - Content is never hidden before JavaScript: the prerendered page is complete
 *   and this only plays on top of it, after hydration.
 * - Measures each element once at the start (no per-frame layout reads);
 *   motion is transform / opacity / stroke-dashoffset via WAAPI.
 * - Esc or × stops it and restores everything at once. Never runs under
 *   prefers-reduced-motion (checked by the controller).
 * - Loaded as its own chunk only when it plays.
 */

const SELECTOR = [
  "header a",
  "header button",
  "main h1 > span",
  "main h2",
  "main h3",
  "main p",
  "main a",
  "main button",
  "main .hl-figure",
  "main img",
  "main li",
].join(",");

const MAX_TARGETS = 36;
const MAX_AGENTS = 12;
const AGENT_COLORS = 6;

interface Target {
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

const TEXT = new Set(["P", "H1", "H2", "H3", "SPAN", "LI"]);

/** Text blocks are outlined around their text, not their full-width box. */
function boxOf(el: HTMLElement): DOMRect {
  if (!TEXT.has(el.tagName)) return el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect();
}

/** Visible, reasonably sized leaf elements in the first viewport, in reading order. */
function collectTargets(): Target[] {
  const vh = window.innerHeight;
  const vw = document.documentElement.clientWidth;
  const found = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => {
    if (el.closest("[data-build-skip], dialog, [aria-hidden='true']")) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 8 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) >= 0.5;
  });
  const leaves = found.filter((el) => !found.some((other) => other !== el && el.contains(other)));
  return leaves
    .map((el) => {
      const r = boxOf(el);
      return { el, x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .slice(0, MAX_TARGETS);
}

const svgNS = "http://www.w3.org/2000/svg";

function cursorElement(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;left:0;top:0;width:20px;height:20px;will-change:transform;";
  el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2.5 17 8.6l-6.2 1.9-2.4 6.4z" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  return el;
}

interface Props {
  /** Called when the animation finished or was closed; the controller unmounts it. */
  onDone: () => void;
}

export default function BuildSwarm({ onDone }: Props) {
  const { t } = useI18n();
  const [total, setTotal] = useState(0);
  const [built, setBuilt] = useState(0);
  const [agents, setAgents] = useState(0);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [finished, setFinished] = useState(false);
  const speedRef = useRef(1);
  /** Every animation this run created — the only ones the speed button touches. */
  const animsRef = useRef(new Set<Animation>());
  const stopRef = useRef<() => void>(() => {});
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const targets = collectTargets();
    if (targets.length === 0) {
      onDoneRef.current();
      return;
    }
    let stopped = false;
    const anims = animsRef.current;
    const timers = new Set<number>();
    const restore: Array<() => void> = [];

    const track = (a: Animation) => {
      a.playbackRate = speedRef.current;
      anims.add(a);
      a.finished.then(() => anims.delete(a)).catch(() => anims.delete(a));
      return a;
    };
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, ms / speedRef.current);
        timers.add(id);
      });

    // Overlay in document coordinates, so it scrolls with the page. Clipped: never adds horizontal overflow.
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.style.cssText = `position:absolute;left:0;top:0;width:100%;height:${document.documentElement.scrollHeight}px;pointer-events:none;overflow:hidden;z-index:60;`;
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.cssText = "position:absolute;inset:0;overflow:visible;";
    layer.append(svg);
    document.body.append(layer);
    restore.push(() => layer.remove());

    // Dim everything that is about to be rebuilt.
    const dims = new Map<HTMLElement, Animation>();
    for (const target of targets) {
      const a = target.el.animate([{ opacity: 1 }, { opacity: 0.14 }], { duration: 220, easing: easeCss.out, fill: "forwards" });
      dims.set(target.el, a);
      restore.push(() => a.cancel());
    }

    // Agents, each with a queue of targets (round-robin keeps neighbours on different agents).
    const count = Math.min(MAX_AGENTS, Math.max(6, Math.ceil(targets.length / 2)));
    setAgents(count);
    setTotal(targets.length);
    const vw = document.documentElement.clientWidth;
    const top = window.scrollY;
    const agentsList = Array.from({ length: count }, (_, i) => {
      const color = `var(--agent-${(i % AGENT_COLORS) + 1})`;
      const cursor = cursorElement(color);
      // Start just off the left or right edge, at a spread of heights.
      const x = i % 2 === 0 ? -24 : vw + 4;
      const y = top + 80 + ((i * 97) % Math.max(200, window.innerHeight - 160));
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      layer.append(cursor);
      return { cursor, color, x, y, queue: [] as Target[] };
    });
    targets.forEach((target, i) => agentsList[i % count]!.queue.push(target));

    const move = async (agent: (typeof agentsList)[number], x: number, y: number, ms: number) => {
      const a = track(
        agent.cursor.animate(
          [{ transform: `translate3d(${agent.x}px,${agent.y}px,0)` }, { transform: `translate3d(${x}px,${y}px,0)` }],
          { duration: ms, easing: easeCss.out, fill: "forwards" },
        ),
      );
      await a.finished;
      agent.x = x;
      agent.y = y;
      agent.cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      a.cancel();
    };

    const build = async (agent: (typeof agentsList)[number], target: Target) => {
      await move(agent, target.x - 2, target.y - 2, 520);
      if (stopped) return;

      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String(Math.round(target.x) + 0.5));
      rect.setAttribute("y", String(Math.round(target.y) + 0.5));
      rect.setAttribute("width", String(Math.max(1, Math.round(target.w) - 1)));
      rect.setAttribute("height", String(Math.max(1, Math.round(target.h) - 1)));
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", agent.color);
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("vector-effect", "non-scaling-stroke");
      rect.setAttribute("pathLength", "1");
      rect.setAttribute("stroke-dasharray", "1");
      rect.setAttribute("stroke-dashoffset", "1");
      svg.append(rect);

      const label = document.createElement("span");
      label.textContent = `${Math.round(target.w)} × ${Math.round(target.h)}`;
      label.style.cssText = `position:absolute;left:${target.x}px;top:${target.y + target.h + 4}px;padding:1px 5px;border-radius:4px;background:${agent.color};color:#fff;font:500 11px/1.4 var(--font-mono);white-space:nowrap;opacity:0;`;
      layer.append(label);

      track(rect.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 420, easing: easeCss.inOut, fill: "forwards" }));
      track(label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: 120, fill: "forwards" }));
      // The cursor drags to the opposite corner while the outline is drawn.
      await move(agent, target.x + target.w - 4, target.y + target.h - 4, 420);
      if (stopped) return;

      // The element itself comes back.
      const dim = dims.get(target.el);
      const reveal = track(target.el.animate([{ opacity: 0.14 }, { opacity: 1 }], { duration: 320, easing: easeCss.out, fill: "forwards" }));
      reveal.finished
        .then(() => {
          dim?.cancel();
          reveal.cancel();
        })
        .catch(() => {});
      setBuilt((n) => n + 1);

      // Outline and label fade out after a beat.
      void wait(380).then(() => {
        if (stopped) return;
        const fade = [{ opacity: 1 }, { opacity: 0 }];
        track(rect.animate(fade, { duration: 260, fill: "forwards" })).finished.then(() => rect.remove(), () => {});
        track(label.animate(fade, { duration: 260, fill: "forwards" })).finished.then(() => label.remove(), () => {});
      });
    };

    const runAgent = async (agent: (typeof agentsList)[number], index: number) => {
      await wait(index * 70);
      for (const target of agent.queue) {
        if (stopped) return;
        await build(agent, target);
      }
      if (stopped) return;
      // Leave the stage.
      const exitX = agent.x < vw / 2 ? -40 : vw + 20;
      track(agent.cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }));
      await move(agent, exitX, agent.y - 60, 500);
    };

    const stop = () => {
      if (stopped) return;
      stopped = true;
      for (const id of timers) window.clearTimeout(id);
      for (const a of anims) a.cancel();
      for (const fn of restore) fn();
    };
    stopRef.current = () => {
      stop();
      onDoneRef.current();
    };

    void Promise.all(agentsList.map(runAgent)).then(async () => {
      if (stopped) return;
      setFinished(true);
      await wait(1100);
      stop();
      onDoneRef.current();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      stop();
    };
  }, []);

  const toggleSpeed = () => {
    const next = speed === 1 ? 2 : 1;
    speedRef.current = next;
    setSpeed(next);
    for (const a of animsRef.current) a.playbackRate = next;
  };

  if (total === 0) return null;
  const progress = total ? built / total : 0;

  return createPortal(
    <div
      role="group"
      aria-label={t.build.panel}
      className="fixed bottom-5 left-1/2 z-[61] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink py-1.5 pr-1.5 pl-3 text-white shadow-[var(--shadow-2)]"
    >
      <span aria-hidden="true" className="flex">
        {Array.from({ length: Math.min(agents, 3) }, (_, i) => (
          <span
            key={i}
            className="-ml-1 size-3.5 rounded-full border-2 border-ink first:ml-0"
            style={{ background: `var(--agent-${i + 1})` }}
          />
        ))}
      </span>
      <span className="t-label whitespace-nowrap text-white/90">{fmt(t.build.agents, { n: agents })}</span>
      <span aria-hidden="true" className="h-4 w-px bg-white/20" />
      <span className="t-label whitespace-nowrap text-white/90 tabular-nums" aria-live="off">
        {finished ? t.build.done : fmt(t.build.layers, { done: built, total })}
      </span>
      <span aria-hidden="true" className="relative hidden h-px w-16 overflow-hidden bg-white/20 sm:block">
        <span className="absolute inset-0 origin-left bg-white transition-transform duration-200" style={{ transform: `scaleX(${progress})` }} />
      </span>
      <button
        type="button"
        onClick={toggleSpeed}
        aria-label={t.build.speed}
        className="t-label inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white/10 px-2.5 text-white hover:bg-white/20"
      >
        {speed}×
      </button>
      <button
        type="button"
        onClick={() => stopRef.current()}
        aria-label={t.build.close}
        className="inline-flex size-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
      >
        <X aria-hidden="true" strokeWidth={1.5} className="size-4" />
      </button>
    </div>,
    document.body,
  );
}

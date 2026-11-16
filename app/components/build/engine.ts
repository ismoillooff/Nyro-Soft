/**
 * The build engine: agents (a cursor and a colour each) fly to the visible
 * elements of a region and trace them — an outline drawn with
 * stroke-dashoffset and a "W × H" label — on an overlay above the page.
 *
 * It is decoration only: the content itself is never dimmed, hidden, moved
 * or handed over. Nothing re-renders React per frame; elements are measured
 * once when a job starts and all motion is WAAPI on transform, opacity and
 * stroke-dashoffset. Every timer and animation is tracked, so `abort()` and
 * `destroy()` stop everything at once and nothing touches the DOM later.
 *
 * Two levels of detail:
 * - "hero": the automatic first-visit run. Only the hero region, at most 7
 *   elements and 3 agents, about 1.5 s.
 * - "full": the replay button. Everything in the current view, more agents.
 */
import { easeCss } from "~/motion/tokens";

const SVG_NS = "http://www.w3.org/2000/svg";
const AGENT_COLORS = 6;

const BASE_SELECTOR = ["h1 > span", "h1", "h2", "h2 > span", "h3", "[role='img']", "p", "a", "button", ".hl-figure", "img", "li", "dt", "dd", "table", "label"];
const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "SPAN", "LI", "DT", "DD", "LABEL"]);

export type BuildDetail = "hero" | "full";

export interface EngineState {
  busy: boolean;
  label: string;
  agents: number;
  built: number;
  total: number;
  speed: 1 | 2;
  done: boolean;
}

interface Target {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Agent {
  cursor: HTMLDivElement;
  color: string;
  x: number;
  y: number;
  queue: Target[];
}

interface Job {
  root: HTMLElement | null;
  label: string;
  detail: BuildDetail;
  resolve: (completed: boolean) => void;
}

const TIMING = {
  hero: { maxTargets: 7, maxAgents: 3, move: 340, draw: 300, hold: 260, stagger: 70 },
  full: { maxTargets: 30, maxAgents: 10, move: 460, draw: 380, hold: 360, stagger: 60 },
} as const;

function textBox(el: HTMLElement): DOMRect {
  if (!TEXT_TAGS.has(el.tagName)) return el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect();
}

/** Inside position:sticky? Its outline would slide off it while the page scrolls. */
function inSticky(el: HTMLElement, stop: Element | null): boolean {
  for (let a = el.parentElement; a && a !== stop && a !== document.body; a = a.parentElement) {
    if (getComputedStyle(a).position === "sticky") return true;
  }
  return false;
}

function cursorElement(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = "position:absolute;left:0;top:0;width:20px;height:20px;";
  el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 2.5 17 8.6l-6.2 1.9-2.4 6.4z" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
  return el;
}

export function createEngine(onState: (s: EngineState) => void) {
  let state: EngineState = { busy: false, label: "", agents: 0, built: 0, total: 0, speed: 1, done: false };
  let destroyed = false;
  const set = (patch: Partial<EngineState>) => {
    if (destroyed) return;
    state = { ...state, ...patch };
    onState(state);
  };

  const queue: Job[] = [];
  const anims = new Set<Animation>();
  const timers = new Set<number>();
  let running = false;
  /** Ends the current job early (region left the viewport, user input, close). */
  let abortCurrent: (() => void) | null = null;
  let idleTimer = 0;

  const isMobile = () => window.innerWidth < 768;

  // One overlay for the page, in document coordinates (scrolls with it), clipped horizontally.
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.buildLayer = "";
  layer.style.cssText = "position:absolute;left:0;top:0;width:100%;height:0;pointer-events:none;overflow:hidden;z-index:60;";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.style.cssText = "position:absolute;inset:0;overflow:visible;";
  layer.append(svg);
  document.body.append(layer);

  const track = (a: Animation) => {
    a.playbackRate = state.speed;
    anims.add(a);
    const forget = () => anims.delete(a);
    a.finished.then(forget, forget);
    return a;
  };
  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        resolve();
      }, ms / state.speed);
      timers.add(id);
    });
  const stopAll = () => {
    for (const a of Array.from(anims)) a.cancel();
    anims.clear();
    for (const id of timers) window.clearTimeout(id);
    timers.clear();
  };

  function collect(root: HTMLElement | null, detail: BuildDetail): Target[] {
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const scope: ParentNode = root ?? document;
    const selector = (root ? BASE_SELECTOR.map((s) => `:scope ${s}`) : [...BASE_SELECTOR.map((s) => `main ${s}`), "header a", "header button"]).join(",");
    const found = Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter((el) => {
      if (el.closest("[data-build-skip], dialog, [aria-hidden='true'], [data-build-layer]")) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 8 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") return false;
      return !inSticky(el, root);
    });
    const leaves = found.filter((el) => !found.some((other) => other !== el && el.contains(other)));
    const max = detail === "hero" ? TIMING.hero.maxTargets : isMobile() ? 18 : TIMING.full.maxTargets;
    return leaves
      .map((el) => {
        const r = textBox(el);
        return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
      })
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .slice(0, max);
  }

  /** Runs one region. Resolves true when it played to the end, false when it was cut short. */
  async function runJob(job: Job): Promise<boolean> {
    const { root, detail } = job;
    const T = TIMING[detail];
    const targets = collect(root, detail);
    if (targets.length === 0) return true;

    layer.style.height = `${document.documentElement.scrollHeight}px`;
    let aborted = false;
    const created: Element[] = [];

    const maxAgents = detail === "hero" ? T.maxAgents : isMobile() ? 6 : T.maxAgents;
    const count = Math.min(maxAgents, Math.max(detail === "hero" ? 2 : 4, Math.ceil(targets.length / 2)));
    set({ busy: true, done: false, label: job.label, agents: count, built: 0, total: targets.length });

    const vw = document.documentElement.clientWidth;
    const top = window.scrollY;
    const vh = window.innerHeight;
    const agents: Agent[] = Array.from({ length: count }, (_, i) => {
      const color = `var(--agent-${(i % AGENT_COLORS) + 1})`;
      const cursor = cursorElement(color);
      const x = i % 2 === 0 ? -24 : vw + 4;
      const y = top + 60 + ((i * 97) % Math.max(160, vh - 140));
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      layer.append(cursor);
      created.push(cursor);
      return { cursor, color, x, y, queue: [] };
    });
    targets.forEach((t, i) => agents[i % count]!.queue.push(t));

    const abortPromise = new Promise<void>((resolve) => {
      abortCurrent = () => {
        aborted = true;
        resolve();
      };
    });
    // A region that scrolls out of view is finished at once.
    let io: IntersectionObserver | null = null;
    if (root) {
      io = new IntersectionObserver(([e]) => {
        if (e && !e.isIntersecting) abortCurrent?.();
      });
      io.observe(root);
    }

    const move = async (agent: Agent, x: number, y: number, ms: number) => {
      if (aborted) return;
      const a = track(
        agent.cursor.animate(
          [{ transform: `translate3d(${agent.x}px,${agent.y}px,0)` }, { transform: `translate3d(${x}px,${y}px,0)` }],
          { duration: ms, easing: easeCss.out, fill: "forwards" },
        ),
      );
      try {
        await a.finished;
      } catch {
        return;
      }
      if (aborted) return;
      agent.x = x;
      agent.y = y;
      agent.cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      a.cancel();
    };

    const trace = async (agent: Agent, t: Target) => {
      await move(agent, t.x - 2, t.y - 2, T.move);
      if (aborted) return;

      const rect = document.createElementNS(SVG_NS, "rect");
      for (const [k, v] of Object.entries({
        x: Math.round(t.x) + 0.5,
        y: Math.round(t.y) + 0.5,
        width: Math.max(1, Math.round(t.w) - 1),
        height: Math.max(1, Math.round(t.h) - 1),
        fill: "none",
        stroke: agent.color,
        "stroke-width": 1,
        "vector-effect": "non-scaling-stroke",
        pathLength: 1,
        "stroke-dasharray": 1,
        "stroke-dashoffset": 1,
      })) {
        rect.setAttribute(k, String(v));
      }
      svg.append(rect);
      created.push(rect);

      const label = document.createElement("span");
      label.textContent = `${Math.round(t.w)} × ${Math.round(t.h)}`;
      label.style.cssText = `position:absolute;left:${t.x}px;top:${t.y + t.h + 4}px;padding:1px 5px;border-radius:4px;background:${agent.color};color:#fff;font:500 11px/1.4 var(--font-mono);white-space:nowrap;opacity:0;`;
      layer.append(label);
      created.push(label);

      track(rect.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: T.draw, easing: easeCss.inOut, fill: "forwards" }));
      track(label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 80, fill: "forwards" }));
      await move(agent, t.x + Math.min(t.w, vw - t.x - 8) - 4, t.y + t.h - 4, T.draw);
      if (aborted) return;
      set({ built: state.built + 1 });

      void wait(T.hold).then(() => {
        if (aborted || destroyed) return;
        const fade = [{ opacity: 1 }, { opacity: 0 }];
        track(rect.animate(fade, { duration: 220, fill: "forwards" })).finished.then(() => rect.remove(), () => {});
        track(label.animate(fade, { duration: 220, fill: "forwards" })).finished.then(() => label.remove(), () => {});
      });
    };

    const runAgent = async (agent: Agent, index: number) => {
      await wait(index * T.stagger);
      for (const t of agent.queue) {
        if (aborted) return;
        await trace(agent, t);
      }
      if (aborted) return;
      const exitX = agent.x < vw / 2 ? -40 : vw + 20;
      track(agent.cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, fill: "forwards" }));
      await move(agent, exitX, agent.y - 50, 400);
      // Let the last outline fade before the overlay is cleared.
      await wait(T.hold + 240);
    };

    try {
      await Promise.race([Promise.all(agents.map(runAgent)), abortPromise]);
    } finally {
      io?.disconnect();
      abortCurrent = null;
      stopAll();
      for (const el of created) el.remove();
    }
    return !aborted;
  }

  async function pump() {
    if (running || destroyed) return;
    running = true;
    window.clearTimeout(idleTimer);
    while (queue.length > 0 && !destroyed) {
      const job = queue.shift()!;
      let completed = false;
      try {
        completed = await runJob(job);
      } catch {
        // A failed animation must never block the page: drop it and carry on.
        stopAll();
      }
      job.resolve(completed);
    }
    running = false;
    if (destroyed) return;
    set({ done: true });
    idleTimer = window.setTimeout(() => set({ busy: false, done: false }), 900);
  }

  return {
    /** Builds a region (null = what is on screen now). Jobs run one at a time, in order. */
    enqueue(root: HTMLElement | null, label: string, detail: BuildDetail): Promise<boolean> {
      if (destroyed) return Promise.resolve(false);
      return new Promise<boolean>((resolve) => {
        queue.push({ root, label, detail, resolve });
        void pump();
      });
    },
    setSpeed(speed: 1 | 2) {
      set({ speed });
      for (const a of anims) a.playbackRate = speed;
    },
    /** Cuts the current job short and drops the queue (the visitor started doing something). */
    abort() {
      for (const job of queue.splice(0)) job.resolve(false);
      abortCurrent?.();
    },
    /** Stops everything and removes the overlay. Safe to call more than once. */
    destroy() {
      if (destroyed) return;
      for (const job of queue.splice(0)) job.resolve(false);
      abortCurrent?.();
      destroyed = true;
      stopAll();
      window.clearTimeout(idleTimer);
      layer.remove();
    },
  };
}

export type BuildEngine = ReturnType<typeof createEngine>;

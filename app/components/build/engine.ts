/**
 * The build engine: agents (cursor + colour) fly to the visible elements of a
 * region and rebuild them — an outline drawn with stroke-dashoffset, a
 * "W × H" label, and the element fading back in. Regions (the first viewport,
 * then each section as it scrolls in) are built one after another.
 *
 * Imperative on purpose: nothing here re-renders React per frame. Elements are
 * measured once when their region starts; all motion is WAAPI on transform,
 * opacity and stroke-dashoffset. A region that leaves the viewport mid-build
 * is finished at once, so nothing is left dim or hidden.
 */
import { easeCss } from "~/motion/tokens";
import { CLAIMED_ATTR, PENDING_ATTR, releaseReveal } from "./mode";

const SVG_NS = "http://www.w3.org/2000/svg";
const AGENT_COLORS = 6;
const DIM = 0.14;

const BASE_SELECTOR = ["h1 > span", "h2", "h2 > span", "h3", "[role='img']", "p", "a", "button", ".hl-figure", "img", "li", "dt", "dd", "table", "label"];
const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "SPAN", "LI", "DT", "DD", "LABEL"]);

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
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  /** The hidden reveal wrapper this element sits in, if any. */
  wrapper: HTMLElement | null;
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
}

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
  const set = (patch: Partial<EngineState>) => {
    state = { ...state, ...patch };
    onState(state);
  };

  const queue: Job[] = [];
  const queued = new Set<HTMLElement | null>();
  const anims = new Set<Animation>();
  const timers = new Set<number>();
  let running = false;
  let destroyed = false;
  /** Ends the current job early (region left the viewport, or close). */
  let abortCurrent: (() => void) | null = null;
  let idleTimer = 0;

  const isMobile = () => window.innerWidth < 768;
  const maxTargets = () => (isMobile() ? 18 : 30);
  const maxAgents = () => (isMobile() ? 6 : 10);

  // One overlay for the whole page, in document coordinates (scrolls with it), clipped horizontally.
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

  function collect(root: HTMLElement | null): Target[] {
    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    // The first viewport is built as seen; a section also takes what lies just below the fold.
    const reach = root ? vh * 1.35 : vh;
    const scope: ParentNode = root ?? document;
    const selector = (root ? BASE_SELECTOR.map((s) => `:scope ${s}`) : [...BASE_SELECTOR.map((s) => `main ${s}`), "header a", "header button"]).join(",");
    const found = Array.from(scope.querySelectorAll<HTMLElement>(selector)).filter((el) => {
      if (el.closest("[data-build-skip], dialog, [aria-hidden='true'], [data-build-layer]")) return false;
      const r = el.getBoundingClientRect();
      if (r.width < 10 || r.height < 8 || r.bottom <= 0 || r.top >= reach || r.right <= 0 || r.left >= vw) return false;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) < 0.5) return false;
      return !inSticky(el, root);
    });
    const leaves = found.filter((el) => !found.some((other) => other !== el && el.contains(other)));
    return leaves
      .map((el) => {
        const r = textBox(el);
        const wrapper = el.closest<HTMLElement>(`[${CLAIMED_ATTR}]`);
        return { el, x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height, wrapper };
      })
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .slice(0, maxTargets());
  }

  async function runJob(job: Job) {
    const { root } = job;
    // Take over the hidden reveals of this region; straighten them so they measure where they will be.
    const scope: ParentNode = root ?? document;
    const claimed = Array.from(scope.querySelectorAll<HTMLElement>(`[${PENDING_ATTR}]`));
    for (const el of claimed) {
      el.removeAttribute(PENDING_ATTR);
      el.setAttribute(CLAIMED_ATTR, "");
      el.style.transform = "";
    }

    const targets = collect(root);
    const releaseAll = (fade: boolean) => {
      for (const el of claimed) if (el.hasAttribute(CLAIMED_ATTR)) releaseReveal(el, fade);
    };
    if (targets.length === 0) {
      releaseAll(true);
      return;
    }

    layer.style.height = `${document.documentElement.scrollHeight}px`;
    let aborted = false;
    const restore: Array<() => void> = [];

    // Visible elements dim; elements inside a still-hidden reveal stay hidden until built.
    const dims = new Map<HTMLElement, Animation>();
    for (const t of targets) {
      if (t.wrapper) continue;
      const a = t.el.animate([{ opacity: 1 }, { opacity: DIM }], { duration: 200, easing: easeCss.out, fill: "forwards" });
      dims.set(t.el, a);
      restore.push(() => a.cancel());
    }
    // A reveal wrapper appears when its last element is built.
    const remaining = new Map<HTMLElement, number>();
    for (const t of targets) if (t.wrapper) remaining.set(t.wrapper, (remaining.get(t.wrapper) ?? 0) + 1);

    const count = Math.min(maxAgents(), Math.max(4, Math.ceil(targets.length / 2)));
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
      cursor.style.willChange = "transform";
      layer.append(cursor);
      restore.push(() => cursor.remove());
      return { cursor, color, x, y, queue: [] };
    });
    targets.forEach((t, i) => agents[i % count]!.queue.push(t));

    // Watch the region: if it scrolls out of view, finish it at once.
    let io: IntersectionObserver | null = null;
    const abortPromise = new Promise<void>((resolve) => {
      abortCurrent = () => {
        aborted = true;
        resolve();
      };
    });
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
      agent.x = x;
      agent.y = y;
      agent.cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      a.cancel();
    };

    const build = async (agent: Agent, t: Target) => {
      await move(agent, t.x - 2, t.y - 2, root ? 420 : 500);
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
      restore.push(() => rect.remove());

      const label = document.createElement("span");
      label.textContent = `${Math.round(t.w)} × ${Math.round(t.h)}`;
      label.style.cssText = `position:absolute;left:${t.x}px;top:${t.y + t.h + 4}px;padding:1px 5px;border-radius:4px;background:${agent.color};color:#fff;font:500 11px/1.4 var(--font-mono);white-space:nowrap;opacity:0;`;
      layer.append(label);
      restore.push(() => label.remove());

      track(rect.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 380, easing: easeCss.inOut, fill: "forwards" }));
      track(label.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 100, fill: "forwards" }));
      await move(agent, t.x + Math.min(t.w, vw - t.x - 8) - 4, t.y + t.h - 4, 380);
      if (aborted) return;

      // The element comes back.
      if (t.wrapper) {
        const left = (remaining.get(t.wrapper) ?? 1) - 1;
        remaining.set(t.wrapper, left);
        if (left === 0) releaseReveal(t.wrapper, true);
      } else {
        const dim = dims.get(t.el);
        const reveal = track(t.el.animate([{ opacity: DIM }, { opacity: 1 }], { duration: 300, easing: easeCss.out, fill: "forwards" }));
        reveal.finished.then(
          () => {
            dim?.cancel();
            reveal.cancel();
          },
          () => {},
        );
      }
      set({ built: state.built + 1 });

      void wait(360).then(() => {
        if (aborted) return;
        const fade = [{ opacity: 1 }, { opacity: 0 }];
        track(rect.animate(fade, { duration: 240, fill: "forwards" })).finished.then(() => rect.remove(), () => {});
        track(label.animate(fade, { duration: 240, fill: "forwards" })).finished.then(() => label.remove(), () => {});
      });
    };

    const runAgent = async (agent: Agent, index: number) => {
      await wait(index * 60);
      for (const t of agent.queue) {
        if (aborted) return;
        await build(agent, t);
      }
      if (aborted) return;
      const exitX = agent.x < vw / 2 ? -40 : vw + 20;
      track(agent.cursor.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 360, fill: "forwards" }));
      await move(agent, exitX, agent.y - 50, 440);
    };

    await Promise.race([Promise.all(agents.map(runAgent)), abortPromise]);
    io?.disconnect();
    abortCurrent = null;
    if (aborted) {
      // Everything back to normal, immediately.
      for (const a of anims) a.cancel();
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
    }
    for (const fn of restore) fn();
    releaseAll(!aborted);
  }

  async function pump() {
    if (running || destroyed) return;
    running = true;
    window.clearTimeout(idleTimer);
    while (queue.length > 0 && !destroyed) {
      const job = queue.shift()!;
      queued.delete(job.root);
      // Skip regions that are no longer on screen; just show their content.
      if (job.root) {
        const r = job.root.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= window.innerHeight) {
          for (const el of Array.from(job.root.querySelectorAll<HTMLElement>(`[${PENDING_ATTR}]`))) releaseReveal(el, false);
          continue;
        }
      }
      await runJob(job);
    }
    running = false;
    if (destroyed) return;
    set({ done: true });
    idleTimer = window.setTimeout(() => set({ busy: false, done: false }), 1100);
  }

  return {
    /** Builds a region (null = what is on screen now). Regions run one at a time, in order. */
    enqueue(root: HTMLElement | null, label: string) {
      if (destroyed || queued.has(root)) return;
      queued.add(root);
      queue.push({ root, label });
      void pump();
    },
    setSpeed(speed: 1 | 2) {
      set({ speed });
      for (const a of anims) a.playbackRate = speed;
    },
    /** Stops everything and shows every element and hidden reveal right away. */
    destroy() {
      if (destroyed) return;
      destroyed = true;
      queue.length = 0;
      abortCurrent?.();
      for (const a of anims) a.cancel();
      for (const id of timers) window.clearTimeout(id);
      window.clearTimeout(idleTimer);
      for (const el of Array.from(document.querySelectorAll<HTMLElement>(`[${PENDING_ATTR}], [${CLAIMED_ATTR}]`))) releaseReveal(el, false);
      layer.remove();
      set({ busy: false, done: false });
    },
  };
}

export type BuildEngine = ReturnType<typeof createEngine>;

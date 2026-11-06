/**
 * One bright place (Hairline rule 03): at most one beam moves at a time across
 * the whole page. Requests from elements that are off screen are dropped; a
 * request made while a beam runs replaces any earlier pending one (latest
 * wins), and starts when the running beam lands. Under reduced motion, and in
 * a background tab, nothing runs.
 */

type Run = () => Promise<unknown>;

interface Request {
  readonly id: string;
  readonly el: Element;
  readonly run: Run;
}

const visible = new WeakSet<Element>();
const counts = new WeakMap<Element, number>();
let io: IntersectionObserver | null = null;
let running: string | null = null;
let pending: Request | null = null;

function observer(): IntersectionObserver {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
      },
      { threshold: 0 },
    );
  }
  return io;
}

/** Starts tracking an element's visibility. Returns the stop function. */
export function trackBeamHost(el: Element): () => void {
  counts.set(el, (counts.get(el) ?? 0) + 1);
  observer().observe(el);
  return () => {
    const n = (counts.get(el) ?? 1) - 1;
    counts.set(el, n);
    if (n <= 0) {
      observer().unobserve(el);
      visible.delete(el);
      if (pending?.el === el) pending = null;
    }
  };
}

export function isBeamHostVisible(el: Element): boolean {
  return visible.has(el);
}

function blocked(): boolean {
  return (
    typeof window === "undefined" ||
    document.hidden ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function start(req: Request) {
  running = req.id;
  void req
    .run()
    .catch(() => undefined)
    .finally(() => {
      running = null;
      const next = pending;
      pending = null;
      if (next && visible.has(next.el) && !blocked()) start(next);
    });
}

/** Asks for a beam. `el` is the element the beam travels along (its visibility decides). */
export function requestBeam(id: string, el: Element, run: Run): void {
  if (blocked() || !visible.has(el)) return;
  if (running === id) return;
  if (running) {
    pending = { id, el, run };
    return;
  }
  start({ id, el, run });
}

export function isBeamRunning(): boolean {
  return running !== null;
}

/**
 * Scroll reveals as progressive enhancement, run by one controller for the
 * whole page: one IntersectionObserver, one rAF pass to arm new items, one
 * focus listener, one reduced-motion listener. Nothing here re-renders React.
 *
 * Rules
 * - The prerendered HTML is fully visible. An item is hidden only after
 *   hydration, only if it lies entirely below the viewport at that moment
 *   (measured in a rAF, after scroll restoration and hash scrolling), and
 *   never under reduced motion.
 * - Hidden = inline opacity 0 + a 12px drop, plus `data-reveal="hidden"`.
 *   Showing removes the inline styles first (the final state is "no inline
 *   style"), then plays a WAAPI fade/rise with fill: backwards. Cancelling or
 *   finishing the animation therefore always leaves the element visible.
 * - Items that enter together cascade 50ms apart, capped at 250ms in total;
 *   items scrolled past (above the viewport) appear at once without motion,
 *   so fast scrolling never builds a queue.
 * - Focus inside a hidden item shows it immediately; turning on reduced
 *   motion shows everything immediately; unmounting clears inline styles.
 * - The reveal owns only its own element's opacity/transform. Parallax and
 *   hover transforms live on inner wrappers.
 */
import { cappedDelay, dist, dur, easeCss, stagger } from "~/motion/tokens";

export const REVEAL_ATTR = "data-reveal";

interface Item {
  el: HTMLElement;
  /** Cascade step in seconds for items entering together. */
  step: number;
  /** Extra delay in seconds. */
  delay: number;
  state: "queued" | "hidden" | "showing";
  anim: Animation | null;
}

const items = new Map<HTMLElement, Item>();
const queue = new Set<Item>();
let io: IntersectionObserver | null = null;
let raf = 0;
let bound = false;

const REDUCE = "(prefers-reduced-motion: reduce)";
const reduced = () => window.matchMedia(REDUCE).matches;

function hide(item: Item) {
  item.state = "hidden";
  item.el.style.opacity = "0";
  item.el.style.transform = `translate3d(0, ${dist.reveal}px, 0)`;
  item.el.setAttribute(REVEAL_ATTR, "hidden");
  observer().observe(item.el);
}

function clearInline(el: HTMLElement) {
  el.style.removeProperty("opacity");
  el.style.removeProperty("transform");
  el.removeAttribute(REVEAL_ATTR);
}

function forget(item: Item) {
  io?.unobserve(item.el);
  queue.delete(item);
  items.delete(item.el);
}

/** Shows a hidden item; `delay` in seconds, or `false` for no motion at all. */
function show(item: Item, delay: number | false) {
  if (item.state !== "hidden") return;
  io?.unobserve(item.el);
  clearInline(item.el);
  if (delay === false) {
    forget(item);
    return;
  }
  item.state = "showing";
  item.el.setAttribute(REVEAL_ATTR, "showing");
  const anim = item.el.animate(
    [
      { opacity: 0, transform: `translate3d(0, ${dist.reveal}px, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ],
    { duration: dur.reveal * 1000, delay: (item.delay + delay) * 1000, easing: easeCss.out, fill: "backwards" },
  );
  item.anim = anim;
  const done = () => {
    if (item.anim !== anim) return;
    item.anim = null;
    item.el.removeAttribute(REVEAL_ATTR);
    forget(item);
  };
  anim.finished.then(done, done);
}

/** Shows everything that is hidden or mid-animation, without motion. */
function showAll() {
  for (const item of Array.from(items.values())) {
    if (item.state === "hidden") show(item, false);
    else if (item.state === "showing") item.anim?.finish();
    else forget(item);
  }
}

function hashTarget(): Element | null {
  const raw = window.location.hash.slice(1);
  if (!raw) return null;
  try {
    return document.getElementById(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

/** One pass for every newly registered item: all reads first, then all writes. */
function arm() {
  raf = 0;
  const batch = Array.from(queue);
  queue.clear();
  if (batch.length === 0) return;
  if (reduced() || document.visibilityState === "hidden") {
    batch.forEach(forget);
    return;
  }
  const vh = window.innerHeight;
  const target = hashTarget();
  const below = batch.filter((item) => {
    if (!item.el.isConnected) return false;
    if (target && (target.contains(item.el) || item.el.contains(target))) return false;
    return item.el.getBoundingClientRect().top >= vh;
  });
  for (const item of batch) if (!below.includes(item)) forget(item);
  below.forEach(hide);
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  const entering: { item: Item; top: number; left: number }[] = [];
  for (const e of entries) {
    const item = items.get(e.target as HTMLElement);
    if (!item || item.state !== "hidden") continue;
    if (e.isIntersecting) entering.push({ item, top: e.boundingClientRect.top, left: e.boundingClientRect.left });
    else if (e.boundingClientRect.bottom <= 0) show(item, false); // scrolled past: no queue
  }
  entering.sort((a, b) => a.top - b.top || a.left - b.left);
  entering.forEach(({ item }, i) => show(item, Math.min(cappedDelay(i, item.step), stagger.max)));
}

/** After a jump (scrollbar drag, End key, hash link), anything left above the viewport appears at once. */
function onScrollEnd() {
  for (const item of Array.from(items.values())) {
    if (item.state === "hidden" && item.el.getBoundingClientRect().bottom <= 0) show(item, false);
  }
}

/** Keyboard focus never waits for a reveal. */
function onFocusIn(e: FocusEvent) {
  for (let a = e.target as Element | null; a; a = a.parentElement) {
    const item = items.get(a as HTMLElement);
    if (!item) continue;
    if (item.state === "hidden") show(item, false);
    else if (item.state === "showing") item.anim?.finish();
  }
}

function onReduceChange(e: MediaQueryListEvent) {
  if (e.matches) showAll();
}

function observer(): IntersectionObserver {
  if (!io) io = new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
  return io;
}

function bind() {
  if (bound) return;
  bound = true;
  document.addEventListener("focusin", onFocusIn, true);
  window.addEventListener("scrollend", onScrollEnd, { passive: true });
  window.matchMedia(REDUCE).addEventListener("change", onReduceChange);
}

export interface RevealOptions {
  /** Seconds between items entering together (default stagger.base). */
  step?: number;
  /** Extra delay in seconds. */
  delay?: number;
}

/**
 * Registers an element for a one-time reveal. Returns the cleanup, which is
 * safe to call more than once and leaves the element visible.
 */
export function registerReveal(el: HTMLElement, opts: RevealOptions = {}): () => void {
  if (typeof window === "undefined" || items.has(el)) return () => {};
  bind();
  const item: Item = { el, step: opts.step ?? stagger.base, delay: opts.delay ?? 0, state: "queued", anim: null };
  items.set(el, item);
  queue.add(item);
  if (!raf) raf = window.requestAnimationFrame(arm);
  return () => {
    if (items.get(el) !== item) return;
    item.anim?.cancel();
    item.anim = null;
    clearInline(el);
    forget(item);
  };
}

/** Test and debug hook: how many items are still hidden. */
export function hiddenRevealCount(): number {
  let n = 0;
  for (const item of items.values()) if (item.state === "hidden") n++;
  return n;
}

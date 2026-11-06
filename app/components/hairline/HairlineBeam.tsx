import { useEffect, useId, useRef } from "react";
import { easeCss } from "~/motion/tokens";
import { cn } from "~/lib/cn";
import { requestBeam, trackBeamHost } from "./beam-scheduler";

export type BeamTrigger = "hover" | "inview" | "interval" | "key";

interface HairlineBeamProps {
  axis?: "x" | "y";
  trigger?: BeamTrigger;
  /** Segment length in px (48–96). */
  length?: number;
  /** ms for one pass. */
  duration?: number;
  direction?: 1 | -1;
  /** For trigger="interval": ms between passes (8–10s). */
  every?: number;
  /** For trigger="key": a new value fires one pass. */
  fireKey?: string | number | null;
  /** Positions the 1px track over the line it travels along. */
  className?: string;
}

/**
 * A lit stroke segment travelling along a hairline: centre --accent, ends
 * transparent, moved with transform only. Hover/focus is read from the closest
 * [data-beam-host] ancestor (or the parent). Every pass goes through the
 * BeamScheduler, so only one beam is ever lit.
 */
export function HairlineBeam({
  axis = "x",
  trigger = "hover",
  length = 64,
  duration = 1400,
  direction = 1,
  every = 9000,
  fireKey = null,
  className,
}: HairlineBeamProps) {
  const id = useId();
  const trackRef = useRef<HTMLSpanElement>(null);
  const segRef = useRef<HTMLSpanElement>(null);
  const runRef = useRef<() => void>(() => {});

  useEffect(() => {
    const track = trackRef.current;
    const seg = segRef.current;
    if (!track || !seg) return;
    const untrack = trackBeamHost(track);

    const run = () =>
      new Promise<void>((resolve) => {
        const size = axis === "x" ? track.clientWidth : track.clientHeight;
        const from = direction === 1 ? -length : size;
        const to = direction === 1 ? size : -length;
        const t = (v: number) => (axis === "x" ? `translate3d(${v}px,0,0)` : `translate3d(0,${v}px,0)`);
        seg.style.willChange = "transform";
        seg.style.opacity = "1";
        const anim = seg.animate([{ transform: t(from) }, { transform: t(to) }], {
          duration,
          easing: easeCss.inOut,
          fill: "forwards",
        });
        const done = () => {
          seg.style.willChange = "";
          seg.style.opacity = "0";
          anim.cancel();
          resolve();
        };
        anim.onfinish = done;
        anim.oncancel = () => {
          seg.style.willChange = "";
          seg.style.opacity = "0";
          resolve();
        };
      });

    runRef.current = () => requestBeam(id, track, run);

    const host = (track.closest("[data-beam-host]") as HTMLElement | null) ?? track.parentElement;
    const cleanups: Array<() => void> = [untrack];

    if (trigger === "hover" && host) {
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
      const onEnter = () => {
        if (fine.matches) runRef.current();
      };
      const onFocus = (e: FocusEvent) => {
        if ((e.target as Element | null)?.matches?.(":focus-visible")) runRef.current();
      };
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("focusin", onFocus);
      cleanups.push(() => {
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("focusin", onFocus);
      });
    }

    if (trigger === "inview") {
      const once = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            once.disconnect();
            // Let the scheduler's own observer record visibility first.
            requestAnimationFrame(() => runRef.current());
          }
        },
        { threshold: 0.6 },
      );
      once.observe(track);
      cleanups.push(() => once.disconnect());
    }

    if (trigger === "interval") {
      let timer = 0;
      const tick = () => {
        runRef.current();
        timer = window.setTimeout(tick, every);
      };
      timer = window.setTimeout(tick, every / 2);
      cleanups.push(() => window.clearTimeout(timer));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [axis, trigger, length, duration, direction, every, id]);

  useEffect(() => {
    if (trigger === "key" && fireKey !== null) runRef.current();
  }, [trigger, fireKey]);

  return (
    <span
      ref={trackRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute overflow-hidden",
        axis === "x" ? "h-px" : "w-px",
        className,
      )}
    >
      <span
        ref={segRef}
        className={cn("absolute top-0 left-0 block opacity-0", axis === "x" ? "h-px" : "w-px")}
        style={
          axis === "x"
            ? { width: length, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }
            : { height: length, background: "linear-gradient(180deg, transparent, var(--accent), transparent)" }
        }
      />
    </span>
  );
}

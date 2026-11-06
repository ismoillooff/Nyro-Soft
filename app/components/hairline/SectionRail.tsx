import { m, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SectionMeta } from "~/content/sections";
import { useI18n } from "~/i18n";
import { spring } from "~/motion/tokens";
import { useActiveSectionId, useReducedMotionPref } from "~/components/motion/hooks";
import { HairlineNode, type NodeState } from "./Hairline";

interface Geometry {
  top: number;
  height: number;
  nodes: number[];
}

/**
 * The page's spine (≥1360px only, and only while the content leaves ≥56px on
 * its left). It lives inside <main>, absolutely positioned from the top of the
 * first rail section to the bottom of the last, so it never crosses the
 * header, the footer or the content.
 *
 * The fill is the rail's own scroll progress (start/end at the viewport
 * centre), so its tip sits where the active-section band is, and the node it
 * reaches is the one that turns active.
 */
export function SectionRail({ sections }: { sections: readonly SectionMeta[] }) {
  const { l } = useI18n();
  const railRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [past, setPast] = useState(false);
  const activeId = useActiveSectionId();
  const reduce = useReducedMotionPref();

  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start center", "end center"] });
  const smooth = useSpring(scrollYProgress, {
    stiffness: spring.follow.stiffness,
    damping: spring.follow.damping,
    mass: spring.follow.mass,
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => setPast(v >= 1));

  const key = sections.map((s) => s.id).join("|");
  useEffect(() => {
    const main = railRef.current?.closest("main");
    if (!main) return;
    const measure = () => {
      const els = key.split("|").map((id) => document.getElementById(id));
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last || els.some((el) => !el)) return;
      const top = first.offsetTop;
      const height = last.offsetTop + last.offsetHeight - top;
      setGeo({ top, height, nodes: els.map((el) => (el as HTMLElement).offsetTop - top) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(main);
    return () => ro.disconnect();
  }, [key]);

  const activeIndex = sections.findIndex((s) => s.id === activeId);
  const stateOf = (i: number): NodeState => {
    if (activeIndex === -1) return past ? "done" : "idle";
    return i === activeIndex ? "active" : i < activeIndex ? "done" : "idle";
  };

  return (
    <div
      ref={railRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-10 hidden w-px rail:block"
      style={{
        // Centre of the left gap, but never further than 56px from the content.
        left: "max(calc((100% - var(--container)) / 4), calc((100% - var(--container)) / 2 - 56px))",
        top: geo?.top ?? 0,
        height: geo?.height ?? 0,
      }}
    >
      <span className="absolute inset-0 bg-line" />
      <m.span
        className="absolute inset-0 origin-top bg-accent"
        style={{ scaleY: reduce ? scrollYProgress : smooth }}
      />
      {geo?.nodes.map((y, i) => {
        const s = sections[i];
        if (!s) return null;
        return (
          <span key={s.id} className="absolute left-0 flex -translate-x-1/2 items-start gap-2" style={{ top: y }}>
            <HairlineNode state={stateOf(i)} className="mt-[-4px]" />
            <span
              className="t-label hidden text-ink-3 [writing-mode:vertical-rl] 2xl:block"
              style={{ marginTop: 10 }}
            >
              {s.number} — {l(s.label)}
            </span>
          </span>
        );
      })}
    </div>
  );
}

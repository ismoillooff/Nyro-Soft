import { m, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { processSteps } from "~/content/process";
import { homeSections } from "~/content/sections";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { spring } from "~/motion/tokens";
import { HairlineNode, type NodeState } from "~/components/hairline/Hairline";
import { HairlineBeam } from "~/components/hairline/HairlineBeam";
import { SectionHeading } from "~/components/layout/Section";
import { useMediaQuery, useReducedMotionPref } from "~/components/motion/hooks";

const follow = { stiffness: spring.follow.stiffness, damping: spring.follow.damping, mass: spring.follow.mass };

function Steps({
  active,
  progressX,
  progressY,
  animated,
}: {
  active: number;
  progressX?: ReturnType<typeof useSpring>;
  progressY?: ReturnType<typeof useSpring>;
  animated: boolean;
}) {
  const { l } = useI18n();
  const state = (i: number): NodeState => (!animated ? "idle" : i === active ? "active" : i < active ? "done" : "idle");
  return (
    <ol className="relative mt-12 grid gap-10 md:mt-16 lg:grid-cols-4 lg:gap-6">
      {/* Mobile: vertical spine through the nodes. */}
      <span aria-hidden="true" className="pointer-events-none absolute top-1 bottom-1 left-[4px] w-px bg-line lg:hidden">
        {progressY && <m.span className="absolute inset-0 origin-top bg-accent" style={{ scaleY: progressY }} />}
      </span>
      {/* Desktop: one rule joining the four nodes. */}
      <span aria-hidden="true" className="pointer-events-none absolute top-[4px] right-0 left-0 hidden h-px bg-line lg:block">
        {progressX && <m.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: progressX }} />}
      </span>
      {processSteps.map((step, i) => (
        <li key={step.number} data-beam-host="" className="relative grid grid-cols-[9px_1fr] gap-x-5 lg:block">
          <HairlineBeam trigger="key" fireKey={animated && i === active ? active : null} className="top-[4px] right-0 left-0 hidden lg:block" />
          <HairlineNode state={state(i)} className="relative mt-[0.4rem] lg:mt-0" />
          <div className="lg:mt-8">
            <p className={cn("t-label transition-colors duration-[180ms]", animated && i === active ? "text-ink" : "text-ink-3")}>{step.number}</p>
            <h3 className="t-h3 mt-2">{l(step.title)}</h3>
            <p className="mt-3 max-w-[34ch] text-ink-2">{l(step.text)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Home: on desktop (and without reduced motion) the section is ~180vh and its
 * inner view is sticky; native scroll fills the rule and moves the active
 * step at 0/25/50/75%. No scroll hijacking — Space, PageDown and the keyboard
 * scroll as usual. Mobile: a vertical timeline filled by scroll. Reduced
 * motion: a static list (all CSS: motion-safe: variants).
 */
export function Process() {
  const { t, l } = useI18n();
  const meta = homeSections.process;
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotionPref();
  const [active, setActive] = useState(0);

  const sticky = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const flow = useScroll({ target: listRef, offset: ["start center", "end center"] });
  const raw = desktop ? sticky.scrollYProgress : flow.scrollYProgress;
  const smoothSticky = useSpring(sticky.scrollYProgress, follow);
  const smoothFlow = useSpring(flow.scrollYProgress, follow);

  useMotionValueEvent(raw, "change", (p) => {
    setActive(Math.min(processSteps.length - 1, Math.max(0, Math.floor(p * processSteps.length))));
  });

  const animated = !reduce;

  return (
    <section id={meta.id} aria-labelledby="yondashuv-title" className="relative">
      <div ref={trackRef} className="lg:motion-safe:h-[180vh]">
        <div className="section-y lg:motion-safe:sticky lg:motion-safe:top-[var(--header-h)] lg:motion-safe:flex lg:motion-safe:h-[calc(100svh-var(--header-h))] lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:py-0">
          <div ref={listRef} className="container-site">
            <SectionHeading titleId="yondashuv-title" number={meta.number} label={l(meta.label)} title={t.process.title} lead={t.process.lead} />
            <Steps
              active={active}
              animated={animated}
              progressX={animated && desktop ? smoothSticky : undefined}
              progressY={animated && !desktop ? smoothFlow : undefined}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/** The compact, static variant for service pages. */
export function ProcessCompact({ titleId, title }: { titleId: string; title: string }) {
  return (
    <div>
      <h2 id={titleId} className="t-h2">
        {title}
      </h2>
      <Steps active={-1} animated={false} />
    </div>
  );
}

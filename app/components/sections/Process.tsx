import { m, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Check } from "lucide-react";
import { useRef, useState } from "react";
import { deliverables } from "~/content/deliverables";
import { processSteps } from "~/content/process";
import { homeSections } from "~/content/sections";
import { fmt, useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { spring } from "~/motion/tokens";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { CornerMarks, HairlineNode, type NodeState } from "~/components/hairline/Hairline";
import { SectionHeading } from "~/components/layout/Section";
import { useMediaQuery } from "~/components/motion/hooks";

const follow = { stiffness: spring.follow.stiffness, damping: spring.follow.damping, mass: spring.follow.mass };
const N = processSteps.length;
/** The last stretch of the pinned track keeps the final step on screen, so it can be read. */
const HOLD = 0.16;
/** A step changes only once the scroll is this far (in steps) past the boundary: no flicker at the edges. */
const HYSTERESIS = 0.08;
/** Same query as the `pin:` CSS variant. */
const PIN_QUERY = "(min-width: 64rem) and (min-height: 760px) and (prefers-reduced-motion: no-preference)";

/** Scroll progress of the pinned track → position in steps (0…N), the hold included. */
const toSteps = (p: number) => Math.min(1, Math.max(0, p) / (1 - HOLD)) * N;

function nextActive(prev: number, exact: number): number {
  const target = Math.min(N - 1, Math.floor(exact));
  if (target === prev) return prev;
  if (target === prev + 1 && exact - target < HYSTERESIS) return prev;
  if (target === prev - 1 && prev - exact < HYSTERESIS) return prev;
  return target;
}

/* ─── The scene: one frame per step, cross-faded by CSS ──────────────────── */

function Bar({ w, tone = "line" }: { w: string; tone?: "line" | "ink" | "accent" }) {
  return (
    <span
      className={cn("block h-[0.55em] rounded-full", tone === "line" ? "bg-line-strong" : tone === "ink" ? "bg-ink/70" : "bg-accent")}
      style={{ width: w }}
    />
  );
}

/** 01 Analysis: requirements on the left, the user flow drawn as a hairline diagram on the right. */
function SceneAnalysis({ flow }: { flow: readonly string[] }) {
  return (
    <div className="grid size-full grid-cols-[1fr_1.2fr] gap-[6%] p-[6%] text-[clamp(10px,1.1vw,13px)]">
      <div className="flex flex-col gap-[1.1em] self-center border border-line bg-surface p-[8%]">
        <Bar w="45%" tone="ink" />
        {["82%", "64%", "74%", "58%", "68%"].map((w, i) => (
          <span key={w} className="flex items-center gap-[0.8em]">
            <span className={cn("grid size-[1.2em] shrink-0 place-items-center rounded-[3px] border", i < 3 ? "border-ink bg-ink text-white" : "border-line-strong")}>
              {i < 3 && <Check strokeWidth={2} className="size-[0.8em]" />}
            </span>
            <Bar w={w} />
          </span>
        ))}
      </div>
      <div className="relative flex flex-col justify-between py-[4%]">
        <span aria-hidden="true" className="absolute top-[8%] bottom-[8%] left-[0.6em] w-px bg-line-strong" />
        {flow.map((label, i) => (
          <span key={label} className="relative flex items-center gap-[0.9em]">
            <HairlineNode state={i === flow.length - 1 ? "active" : "done"} />
            <span className="t-label rounded-[var(--radius-sm)] border border-line bg-surface px-[0.7em] py-[0.35em] text-ink-2">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** 03 Development: the designed interface running, with its code beside it. */
function SceneBuild() {
  const lines = ["62%", "48%", "70%", "40%", "56%", "34%"];
  return (
    <div className="relative size-full">
      <div className="absolute inset-[5%_26%_5%_5%] overflow-hidden border border-line-strong bg-surface">
        <DashboardMock variant="design" />
      </div>
      <div className="absolute top-[14%] right-[5%] bottom-[14%] flex w-[34%] flex-col gap-[0.9em] rounded-[var(--radius-md)] bg-ink p-[4%] text-[clamp(9px,1vw,12px)] shadow-[var(--shadow-2)]">
        <span className="t-label text-white/60">orders.tsx</span>
        {lines.map((w, i) => (
          <span key={i} className="flex gap-[0.6em]" style={{ paddingLeft: `${(i % 3) * 0.9}em` }}>
            <span className="block h-[0.5em] w-[18%] rounded-full bg-[#8fb0ff]" />
            <span className="block h-[0.5em] rounded-full bg-white/35" style={{ width: w }} />
          </span>
        ))}
        <span className="t-label mt-auto flex items-center gap-[0.5em] text-white/80">
          <span className="size-[0.6em] rounded-full bg-[#12a594]" />
          200 · OK
        </span>
      </div>
    </div>
  );
}

/** 04 Launch: the finished product and the handover materials. */
function SceneLaunch({ items }: { items: readonly string[] }) {
  return (
    <div className="grid size-full grid-cols-[1.35fr_1fr] gap-[5%] p-[5%] text-[clamp(10px,1.1vw,13px)]">
      <div className="overflow-hidden border border-line-strong bg-surface">
        <DashboardMock variant="design" />
      </div>
      <ul className="flex flex-col justify-center gap-[0.8em]">
        {items.map((label) => (
          <li key={label} className="flex items-center gap-[0.8em] border border-line bg-surface px-[0.9em] py-[0.7em]">
            <span className="grid size-[1.3em] shrink-0 place-items-center rounded-full bg-ink text-white">
              <Check strokeWidth={2} className="size-[0.8em]" />
            </span>
            <span className="text-ink">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Scene({ active }: { active: number }) {
  const { t, l } = useI18n();
  const frames = [
    <SceneAnalysis key="a" flow={processSteps[0]!.artifacts.map(l)} />,
    <div key="d" className="size-full p-[5%]">
      <div className="size-full overflow-hidden border border-line-strong bg-surface">
        <DashboardMock variant="wire" />
      </div>
    </div>,
    <SceneBuild key="b" />,
    <SceneLaunch key="l" items={deliverables.slice(0, 3).map((d) => l(d.title))} />,
  ];
  const step = processSteps[active] ?? processSteps[0]!;
  return (
    <figure className="relative border border-line-strong bg-bg">
      <CornerMarks />
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <span className="t-label text-ink">
          {step.number} — {l(step.title)}
        </span>
        <span className="t-label text-ink-3">{fmt(t.process.sceneLabel, { step: l(step.title) })}</span>
      </figcaption>
      <div aria-hidden="true" className="relative aspect-[16/10] bg-surface-soft/50">
        {frames.map((frame, i) => (
          <div
            key={i}
            data-active={i === active ? "" : undefined}
            className={cn(
              "absolute inset-0 transition-[opacity,translate] duration-(--dur-figure) ease-(--ease-out)",
              i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
            )}
          >
            {frame}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        <span className="t-label mr-1 self-center text-ink-3">{t.process.artifacts}</span>
        {step.artifacts.map((a) => (
          <span key={l(a)} className="t-label inline-flex h-7 items-center rounded-[var(--radius-sm)] bg-surface px-2.5 text-ink">
            {l(a)}
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ─── Steps ──────────────────────────────────────────────────────────────── */

function Steps({ active, fill, animated }: { active: number; fill?: MotionValue<number>; animated: boolean }) {
  const { t, l } = useI18n();
  const state = (i: number): NodeState => (!animated ? "idle" : i === active ? "active" : i < active ? "done" : "idle");
  return (
    <ol className="relative grid gap-8 pin:gap-6">
      <span aria-hidden="true" className="pointer-events-none absolute top-1 bottom-1 left-[4px] w-px bg-line">
        {fill && <m.span className="absolute inset-0 origin-top bg-ink" style={{ scaleY: fill }} />}
      </span>
      {processSteps.map((step, i) => (
        <li key={step.number} aria-current={animated && i === active ? "step" : undefined} className="relative grid grid-cols-[9px_1fr] gap-x-5">
          <HairlineNode state={state(i)} className="relative mt-[0.4rem]" />
          <div>
            <p className={cn("t-label transition-colors duration-(--dur-micro)", animated && i === active ? "text-accent-strong" : "text-ink-3")}>{step.number}</p>
            <h3 className="t-h3 mt-1">{l(step.title)}</h3>
            <p className="mt-2 max-w-[42ch] text-ink-2">{l(step.text)}</p>
            {/* Unpinned (phones, short screens, reduced motion): the artefacts are listed inline. */}
            <p className="mt-3 flex flex-wrap gap-1.5 pin:hidden">
              <span className="sr-only">{t.process.artifacts}: </span>
              {step.artifacts.map((a) => (
                <span key={l(a)} className="t-label inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-line bg-surface px-2.5 text-ink-2">
                  {l(a)}
                </span>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * The process as a storyboard. Where the screen is wide and tall enough (and
 * motion is allowed) the section pins for 240svh of native scroll: the step
 * list on the left, and a scene on the right that changes visibly per step —
 * requirements and user flow, wireframe, the working interface with its
 * code, the finished product with its handover materials. The fill line and
 * the active step read the same mapped progress; a small hysteresis stops
 * flicker at the boundaries; the last stretch holds the final step.
 * Elsewhere it is a plain vertical timeline with every step and its
 * artefacts readable, filled by scroll (static under reduced motion).
 */
export function Process() {
  const { t, l } = useI18n();
  const meta = homeSections.process;
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pinned = useMediaQuery(PIN_QUERY);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [active, setActive] = useState(0);

  const sticky = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const flow = useScroll({ target: listRef, offset: ["start center", "end center"] });
  const smoothSticky = useSpring(sticky.scrollYProgress, follow);
  const smoothFlow = useSpring(flow.scrollYProgress, follow);
  // The fill reaches node i exactly when step i becomes active.
  const pinnedFill = useTransform(smoothSticky, (p) => Math.min(1, toSteps(p) / (N - 1)));
  const flowFill = useTransform(smoothFlow, (p) => p);

  useMotionValueEvent(sticky.scrollYProgress, "change", (p) => {
    if (pinned) setActive((prev) => nextActive(prev, toSteps(p)));
  });
  useMotionValueEvent(flow.scrollYProgress, "change", (p) => {
    if (!pinned) setActive((prev) => nextActive(prev, Math.min(1, p) * N));
  });

  const animated = !reduce;

  return (
    <section id={meta.id} aria-labelledby="yondashuv-title" className="relative">
      <div ref={trackRef} className="pin:h-[240svh]">
        <div className="section-y pin:sticky pin:top-[var(--header-h)] pin:flex pin:h-[calc(100svh-var(--header-h))] pin:flex-col pin:justify-center pin:py-8">
          <div ref={listRef} className="container-site">
            <SectionHeading titleId="yondashuv-title" number={meta.number} label={l(meta.label)} title={t.process.title} lead={t.process.lead} />
            <div className="mt-10 grid-site items-start md:mt-12 pin:mt-8">
              <div className="col-span-4 md:col-span-8 lg:col-span-5">
                <Steps active={active} animated={animated} fill={animated ? (pinned ? pinnedFill : flowFill) : undefined} />
              </div>
              <div className="hidden pin:col-span-7 pin:block">{pinned && <Scene active={active} />}</div>
            </div>
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
      <div className="mt-10 max-w-[44rem]">
        <Steps active={-1} animated={false} />
      </div>
    </div>
  );
}

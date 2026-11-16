import { lazy, Suspense, useState } from "react";
import { homeSections } from "~/content/sections";
import { fmt, useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { DrawnFrame } from "~/components/hairline/DrawnFrame";
import { Section, SectionHeading } from "~/components/layout/Section";
import { Reveal } from "~/components/motion/Reveal";
import { CompareSlider } from "~/components/ui/CompareSlider";
import { Tag } from "~/components/ui/Tag";
import { useTabs, type TabItem } from "~/components/ui/Tabs";

const OrdersApp = lazy(() => import("~/components/demo/OrdersApp"));

type ModeId = "wireframe" | "design" | "result" | "compare";
const MODES: readonly ModeId[] = ["wireframe", "design", "result", "compare"];

/** The browser chrome above the work area: three dots and an address. Decorative. */
function BrowserBar({ address }: { address: string }) {
  return (
    <div aria-hidden="true" className="flex h-10 items-center gap-3 border-b border-line px-4">
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full border border-line-strong" />
        <span className="size-2.5 rounded-full border border-line-strong" />
        <span className="size-2.5 rounded-full border border-line-strong" />
      </span>
      <span className="t-label mx-auto truncate rounded-full bg-bg px-3 py-0.5 text-[0.75rem] text-ink-3">{address}</span>
      <span className="w-[42px]" />
    </div>
  );
}

/** Fixed work-area ratio (4:5 phones, 16:10 from tablet), so switching modes never changes the height. */
const STAGE = "relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] md:aspect-[16/10]";

/**
 * One product scene in four modes — wireframe, design, working result and a
 * wireframe/design comparison — with a one-line explanation of each. Every
 * panel stays mounted once opened (hidden when inactive), so the working
 * sample keeps its state (search, added orders) across mode switches; the
 * new panel fades in with CSS only. The stage has a fixed ratio: the page
 * never jumps. The comparison works with pointer, touch (vertical page
 * scroll stays free) and the keyboard.
 */
export function Demo() {
  const { t, l } = useI18n();
  const meta = homeSections.demo;
  const [mode, setMode] = useState<ModeId>("wireframe");
  const [opened, setOpened] = useState<ReadonlySet<ModeId>>(() => new Set<ModeId>(["wireframe"]));
  const labels: Record<ModeId, string> = {
    wireframe: t.demo.tabWireframe,
    design: t.demo.tabDesign,
    result: t.demo.tabResult,
    compare: t.demo.tabCompare,
  };
  const notes: Record<ModeId, string> = {
    wireframe: t.demo.modeWireframe,
    design: t.demo.modeDesign,
    result: t.demo.modeResult,
    compare: t.demo.modeCompare,
  };
  const items: readonly TabItem[] = MODES.map((id) => ({ id, label: labels[id] }));
  const choose = (id: string) => {
    const next = id as ModeId;
    setMode(next);
    setOpened((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
  };
  const tabs = useTabs(items, mode, choose, t.demo.tabsLabel);

  const panel = (id: ModeId) => {
    if (id === "wireframe") return <DashboardMock variant="wire" layout="auto" />;
    if (id === "design") return <DashboardMock variant="design" layout="auto" />;
    if (id === "result")
      return (
        <Suspense fallback={<p className="flex size-full items-center justify-center text-ink-3">{t.demo.loading}</p>}>
          <OrdersApp />
        </Suspense>
      );
    return (
      <CompareSlider
        className="size-full"
        label={t.demo.compareLabel}
        valueText={(v) => fmt(t.demo.compareValue, { n: v })}
        initial={60}
        before={<DashboardMock variant="wire" layout="auto" />}
        after={<DashboardMock variant="design" layout="auto" />}
      />
    );
  };

  return (
    <Section id={meta.id} titleId="demo-title">
      <SectionHeading titleId="demo-title" number={meta.number} label={l(meta.label)} title={t.demo.title} lead={t.demo.lead} />

      <Reveal className="mt-12 md:mt-16">
        <DrawnFrame>
          <BrowserBar address="nyro-erp.uz/buyurtmalar" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line sm:pr-4">
            {tabs.list("grid w-full grid-cols-4 sm:flex sm:w-auto")}
            {mode === "result" && (
              <Tag tone="soft" className="my-2 ml-4 md:ml-0">
                {t.demo.resultBadge}
              </Tag>
            )}
          </div>
          {/* The explanation of the current mode; one line on desktop, its height reserved on mobile. */}
          <p className="flex min-h-[4.5rem] items-start gap-3 border-b border-line bg-bg px-4 py-3 text-[0.9375rem] text-ink-2 sm:min-h-0 md:px-5">
            <span className="t-label mt-0.5 shrink-0 text-ink-3">
              {String(MODES.indexOf(mode) + 1).padStart(2, "0")} / 04
            </span>
            <span>{notes[mode]}</span>
          </p>
          <div className={STAGE}>
            {MODES.map((id) => (
              <div
                key={id}
                {...tabs.panelProps(id)}
                className={cn("demo-panel absolute inset-0 outline-offset-[-2px]")}
                aria-label={labels[id]}
              >
                {opened.has(id) && panel(id)}
              </div>
            ))}
          </div>
        </DrawnFrame>
      </Reveal>
    </Section>
  );
}

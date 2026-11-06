import { AnimatePresence, m } from "motion/react";
import { lazy, Suspense, useState } from "react";
import { homeSections } from "~/content/sections";
import { fmt, useI18n } from "~/i18n";
import { dist, dur, ease } from "~/motion/tokens";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { DrawnFrame } from "~/components/hairline/DrawnFrame";
import { Section, SectionHeading } from "~/components/layout/Section";
import { useReducedMotionPref } from "~/components/motion/hooks";
import { Reveal } from "~/components/motion/Reveal";
import { CompareSlider } from "~/components/ui/CompareSlider";
import { Tag } from "~/components/ui/Tag";
import { useTabs, type TabItem } from "~/components/ui/Tabs";

const OrdersApp = lazy(() => import("~/components/demo/OrdersApp"));

type TabId = "wireframe" | "design" | "result";

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

/** Fixed work-area ratio (16:10 desktop, 4:5 mobile), so switching tabs never changes the height. */
const STAGE = "relative aspect-[4/5] overflow-hidden md:aspect-[16/10]";

export function Demo() {
  const { t, l } = useI18n();
  const meta = homeSections.demo;
  const [tab, setTab] = useState<TabId>("wireframe");
  const reduce = useReducedMotionPref();
  const items: readonly TabItem[] = [
    { id: "wireframe", label: t.demo.tabWireframe },
    { id: "design", label: t.demo.tabDesign },
    { id: "result", label: t.demo.tabResult },
  ];
  const tabs = useTabs(items, tab, (id) => setTab(id as TabId), t.demo.tabsLabel);

  const panel = (id: TabId) => {
    if (id === "wireframe") return <DashboardMock variant="wire" layout="auto" />;
    if (id === "design") return <DashboardMock variant="design" layout="auto" />;
    return (
      <Suspense fallback={<p className="flex size-full items-center justify-center text-ink-3">{t.demo.loading}</p>}>
        <OrdersApp />
      </Suspense>
    );
  };

  return (
    <Section id={meta.id} titleId="demo-title">
      <SectionHeading titleId="demo-title" number={meta.number} label={l(meta.label)} title={t.demo.title} lead={t.demo.lead} />

      <Reveal className="mt-12 md:mt-16">
        <DrawnFrame>
          <BrowserBar address="nyro-erp.uz/buyurtmalar" />
          <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-line pr-4">
            {tabs.list("overflow-x-auto")}
            {tab === "result" && <Tag tone="soft" className="my-2 ml-4 md:ml-0">{t.demo.resultBadge}</Tag>}
          </div>
          <div className={STAGE}>
            {items.map((item) => (
              <div key={item.id} {...tabs.panelProps(item.id)} className="absolute inset-0 outline-offset-[-2px]" aria-label={item.label}>
                <AnimatePresence initial={false} mode="popLayout">
                  {tab === item.id && (
                    <m.div
                      key={item.id}
                      className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, y: dist.small }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0 : dur.ui, ease: ease.out }}
                    >
                      {panel(item.id as TabId)}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </DrawnFrame>
      </Reveal>

      <Reveal className="mt-10 md:mt-14">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h3 className="t-h3">{t.demo.compareTitle}</h3>
          <p className="t-label text-ink-3" aria-hidden="true">
            {t.demo.tabDesign} / {t.demo.tabWireframe}
          </p>
        </div>
        <div className="relative border border-line-strong bg-surface">
          <CompareSlider
            className={STAGE}
            label={t.demo.compareLabel}
            valueText={(v) => fmt(t.demo.compareValue, { n: v })}
            initial={60}
            before={<DashboardMock variant="wire" layout="auto" />}
            after={<DashboardMock variant="design" layout="auto" />}
          />
        </div>
      </Reveal>
    </Section>
  );
}

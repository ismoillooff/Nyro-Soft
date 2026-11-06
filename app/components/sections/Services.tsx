import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { homeSections } from "~/content/sections";
import { services } from "~/content/services";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { dur, ease } from "~/motion/tokens";
import { Hairline } from "~/components/hairline/Hairline";
import { HairlineBeam } from "~/components/hairline/HairlineBeam";
import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { Section, SectionHeading } from "~/components/layout/Section";
import { useReducedMotionPref } from "~/components/motion/hooks";
import { RevealGroup } from "~/components/motion/Reveal";
import { Arrow } from "~/components/ui/Button";

/**
 * Services as a hairline list (each row one link) and, on desktop, one
 * sticky figure that follows the row under the pointer or focus.
 */
export function Services() {
  const { t, l } = useI18n();
  const meta = homeSections.services;
  const [active, setActive] = useState(0);
  const reduce = useReducedMotionPref();
  const current = services[active] ?? services[0]!;

  return (
    <Section id={meta.id} titleId="xizmatlar-title">
      <SectionHeading
        titleId="xizmatlar-title"
        number={meta.number}
        label={l(meta.label)}
        title={[t.services.titleLine1, t.services.titleLine2]}
      />
      <div className="grid-site mt-12 md:mt-16">
        <RevealGroup as="ul" className="col-span-4 md:col-span-8 lg:col-span-7" itemSelector=":scope > li">
          {services.map((s, i) => (
            <li key={s.slug} data-beam-host="" className="relative">
              <Hairline />
              <HairlineBeam trigger="hover" className="top-0 right-0 left-0" length={80} />
              <Link
                to={`/xizmatlar/${s.slug}`}
                viewTransition
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group/btn grid grid-cols-[2.75rem_1fr] gap-x-3 py-7 outline-offset-[-2px] md:grid-cols-[4rem_1fr] md:py-8"
              >
                <span
                  className={cn(
                    "t-label pt-[0.35rem] transition-colors duration-[180ms]",
                    active === i ? "text-ink" : "text-ink-3",
                  )}
                >
                  {s.number}
                </span>
                <span className="min-w-0">
                  <h3 className="t-h3">{l(s.title)}</h3>
                  <span className="mt-2 block text-ink-2">{l(s.short)}</span>
                  <span className="mt-4 inline-flex min-h-6 items-center gap-1.5 text-[0.9375rem] font-medium">
                    {t.services.more}
                    <Arrow kind="right" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li aria-hidden="true">
            <Hairline />
          </li>
        </RevealGroup>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--header-h)+48px)]">
            <div className="relative aspect-[5/4]">
              <AnimatePresence initial={false}>
                <m.div
                  key={current.figure}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduce ? 0 : dur.ui, ease: ease.out }}
                >
                  <HairlineFigure name={current.figure} label={l(current.figureLabel)} surface="bg" />
                </m.div>
              </AnimatePresence>
            </div>
            <p className="t-label mt-4 text-ink-3" aria-hidden="true">
              {current.number} — {l(current.title)}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

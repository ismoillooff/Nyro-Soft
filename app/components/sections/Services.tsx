import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
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
 * Services as a hairline list. Every row is fully readable without any
 * interaction: who it suits, the task, what we do and what you receive. On
 * desktop one sticky figure follows the row under the pointer or keyboard
 * focus; the active row's accent rule reaches towards it, so the link
 * between row and figure is visible. Touch devices never depend on hover.
 */
export function Services() {
  const { t, l } = useI18n();
  const meta = homeSections.services;
  const [active, setActive] = useState(0);
  const reduce = useReducedMotionPref();
  const current = services[active] ?? services[0]!;

  return (
    <Section id={meta.id} titleId="xizmatlar-title">
      <SectionHeading titleId="xizmatlar-title" number={meta.number} label={l(meta.label)} title={[t.services.titleLine1, t.services.titleLine2]} />
      <div className="grid-site mt-12 md:mt-16">
        <RevealGroup as="ul" className="col-span-4 md:col-span-8 lg:col-span-7" itemSelector=":scope > li[data-service]">
          {services.map((s, i) => {
            const isActive = active === i;
            return (
              <li
                key={s.slug}
                data-service=""
                data-beam-host=""
                data-active={isActive ? "" : undefined}
                className="group/btn relative"
                onPointerEnter={() => setActive(i)}
              >
                <Hairline />
                <HairlineBeam trigger="hover" className="top-0 right-0 left-0" length={80} />
                {/* Desktop: the active row's rule runs out to the figure column. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute top-[2.65rem] -right-[calc(var(--gap)+1px)] hidden h-px w-[calc(var(--gap)+12px)] origin-left bg-accent transition-transform duration-(--dur-ui) ease-(--ease-out) lg:block",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                />
                <div className="grid grid-cols-[2.75rem_1fr] gap-x-3 py-7 md:grid-cols-[4rem_1fr] md:py-8">
                  <span className={cn("t-label pt-[0.35rem] transition-colors duration-(--dur-micro)", isActive ? "text-accent-strong" : "text-ink-3")}>
                    {s.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="t-h3">
                      <Link
                        to={`/xizmatlar/${s.slug}`}
                        viewTransition
                        onFocus={() => setActive(i)}
                        className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-sm)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-accent"
                      >
                        {l(s.title)}
                      </Link>
                    </h3>
                    <p className="mt-2 text-ink-2">{l(s.short)}</p>
                    <dl className="mt-5 grid gap-x-6 gap-y-3 text-[0.9375rem] md:grid-cols-2">
                      {(
                        [
                          [t.services.forWhom, s.forWhom],
                          [t.services.task, s.task],
                          [t.services.work, s.work],
                          [t.services.outcome, s.outcome],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k}>
                          <dt className="t-label text-ink-3">{k}</dt>
                          <dd className="mt-1 text-ink">{l(v)}</dd>
                        </div>
                      ))}
                    </dl>
                    <span aria-hidden="true" className="mt-5 inline-flex min-h-6 items-center gap-1.5 text-[0.9375rem] font-medium">
                      {t.services.more}
                      <Arrow kind="right" />
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          <li aria-hidden="true">
            <Hairline />
          </li>
        </RevealGroup>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[calc(var(--header-h)+48px)] border border-line-strong bg-bg p-6">
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
            <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4" aria-hidden="true">
              <p className="t-label text-ink-3">{t.services.figureCaption}</p>
              <p className="t-label text-ink">
                {current.number} — {l(current.title)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

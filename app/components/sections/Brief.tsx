import { Lock } from "lucide-react";
import { briefPrep, briefPrepNote, type BriefPrepItem } from "~/content/brief";
import { homeSections } from "~/content/sections";
import { fmt, useI18n } from "~/i18n";
import { HairlineFrame } from "~/components/hairline/Hairline";
import { Section, SectionHeading } from "~/components/layout/Section";
import { BriefForm } from "~/components/brief/BriefForm";

/**
 * #brif — the four-step project brief, with a short "what to prepare" list in
 * the heading column. Each item names the brief field it belongs to, and the
 * note says plainly that the work can start before everything is clear. The
 * heading column stays in view on desktop only where the screen is tall
 * enough to show it whole; on mobile everything is one column.
 */
export function Brief() {
  const { t, l } = useI18n();
  const meta = homeSections.brief;
  const fieldName: Record<BriefPrepItem["field"], string> = {
    about: t.brief.stepProject,
    services: t.brief.stepService,
    stage: t.brief.stage,
    link: t.brief.linkLabel,
    budget: t.brief.stepBudget,
    timeline: t.brief.timeline,
  };
  return (
    <Section id={meta.id} titleId="brif-title">
      <div className="grid-site gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:self-start lg:tall:sticky lg:tall:top-[calc(var(--header-h)+32px)]">
          <SectionHeading titleId="brif-title" number={meta.number} label={l(meta.label)} title={t.brief.title} lead={t.brief.lead} />

          <section aria-labelledby="brif-prep-title" className="mt-8 border-t border-line pt-6">
            <h3 id="brif-prep-title" className="text-[1.0625rem] font-semibold tracking-[-0.01em]">
              {t.brief.prepTitle}
            </h3>
            <ol className="mt-4 grid gap-3">
              {briefPrep.map((item, i) => (
                <li key={item.id} className="grid grid-cols-[1.75rem_1fr] text-[0.9375rem]">
                  <span className="t-label pt-0.5 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="font-medium text-ink">{l(item.title)}</span>
                    <span className="block text-ink-2">{l(item.hint)}</span>
                    <span className="t-label mt-0.5 block text-[0.75rem] text-ink-3">{fmt(t.brief.prepField, { field: fieldName[item.field] })}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-[var(--radius-md)] bg-surface-soft px-4 py-3 text-[0.9375rem] text-ink">{l(briefPrepNote)}</p>
          </section>

          <p className="mt-6 flex max-w-[40ch] items-start gap-2.5 text-[0.875rem] leading-5 text-ink-3">
            <Lock aria-hidden="true" strokeWidth={1.5} className="mt-px size-4 shrink-0" />
            <span>{t.brief.privacy}</span>
          </p>
        </div>
        <div className="col-span-4 min-w-0 md:col-span-8 lg:col-span-7 lg:col-start-6">
          <HairlineFrame corners surface="surface" className="px-5 py-7 md:px-8 md:py-9 lg:px-10 lg:py-10">
            <BriefForm />
          </HairlineFrame>
        </div>
      </div>
    </Section>
  );
}

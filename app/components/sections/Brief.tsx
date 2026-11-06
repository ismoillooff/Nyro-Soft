import { Lock } from "lucide-react";
import { homeSections } from "~/content/sections";
import { useI18n } from "~/i18n";
import { HairlineFrame } from "~/components/hairline/Hairline";
import { Section, SectionHeading } from "~/components/layout/Section";
import { BriefForm } from "~/components/brief/BriefForm";

/**
 * #brif — the four-step project brief. The heading column stays in view on
 * desktop while the form changes steps; on mobile everything is one column.
 */
export function Brief() {
  const { t, l } = useI18n();
  const meta = homeSections.brief;
  return (
    <Section id={meta.id} titleId="brif-title">
      <div className="grid-site gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:col-span-4 lg:self-start">
          <SectionHeading titleId="brif-title" number={meta.number} label={l(meta.label)} title={t.brief.title} lead={t.brief.lead} />
          <p className="mt-8 flex max-w-[40ch] items-start gap-2.5 text-[0.875rem] leading-5 text-ink-3">
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

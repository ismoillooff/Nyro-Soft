import { FileCode2, FileText, PenTool, Rocket, type LucideIcon } from "lucide-react";
import { deliverables, deliverablesNote, type DeliverableIcon } from "~/content/deliverables";
import { homeSections } from "~/content/sections";
import { supportItems, supportNote } from "~/content/support";
import { useI18n } from "~/i18n";
import { HairlineBeam } from "~/components/hairline/HairlineBeam";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";

const ICONS: Record<DeliverableIcon, LucideIcon> = {
  figma: PenTool,
  code: FileCode2,
  docs: FileText,
  launch: Rocket,
};

/** The deliverables as a hairline cell grid (4×1 desktop, 2×2 tablet, 1 column mobile). */
export function DeliverablesGrid({ headingLevel = "h3" }: { headingLevel?: "h3" | "h4" }) {
  const { l } = useI18n();
  const H = headingLevel;
  return (
    <div data-beam-host="" className="relative border border-line-strong">
      <HairlineBeam trigger="inview" className="-top-px right-0 left-0" length={96} duration={1400} />
      <RevealGroup as="ul" className="grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
        {deliverables.map((d) => {
          const Icon = ICONS[d.icon];
          return (
            <li key={d.icon} className="bg-bg p-6 md:p-8">
              <Icon aria-hidden="true" strokeWidth={1.5} className="size-6 text-ink" />
              <H className="t-h3 mt-8 md:mt-10">{l(d.title)}</H>
              <p className="mt-3 text-ink-2">{l(d.text)}</p>
            </li>
          );
        })}
      </RevealGroup>
    </div>
  );
}

/**
 * "What you receive, and what happens next": the handover materials and the
 * support after launch, as one connected block — the grid of deliverables,
 * then the three support directions on the same frame, so support reads as
 * the continuation of the handover rather than a separate promise.
 */
export function Deliverables() {
  const { t, l } = useI18n();
  const meta = homeSections.results;
  return (
    <Section id={meta.id} titleId="natijalar-title">
      <SectionHeading titleId="natijalar-title" number={meta.number} label={l(meta.label)} title={t.results.title} lead={t.results.lead} />
      <div className="mt-12 md:mt-16">
        <p className="t-label mb-3 text-ink-3">{t.results.handover}</p>
        <DeliverablesGrid />
        <p className="mt-4 max-w-[64ch] text-[0.9375rem] text-ink-2">{l(deliverablesNote)}</p>

        <div className="relative mt-10 md:mt-12">
          {/* The hand-off line: from the delivered materials down into the support that follows. */}
          <span aria-hidden="true" className="absolute -top-10 left-6 h-10 w-px bg-line-strong md:-top-12 md:left-8 md:h-12" />
          <p className="t-label mb-3 text-ink-3">{t.results.after}</p>
          <RevealGroup as="ul" className="grid divide-y divide-line border-y border-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {supportItems.map((item, i) => (
              <li key={i} className="py-6 lg:px-8 lg:py-8 lg:first:pl-0 lg:last:pr-0">
                <p className="t-label text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-h3 mt-4">{l(item.title)}</h3>
                <p className="mt-2 max-w-[40ch] text-ink-2">{l(item.text)}</p>
              </li>
            ))}
          </RevealGroup>
          <p className="mt-4 max-w-[64ch] text-[0.9375rem] text-ink-2">{l(supportNote)}</p>
        </div>
      </div>
    </Section>
  );
}

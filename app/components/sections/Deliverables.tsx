import { FileCode2, FileText, PenTool, Rocket, type LucideIcon } from "lucide-react";
import { deliverables, deliverablesNote, type DeliverableIcon } from "~/content/deliverables";
import { homeSections } from "~/content/sections";
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

export function Deliverables() {
  const { t, l } = useI18n();
  const meta = homeSections.deliverables;
  return (
    <Section id={meta.id} titleId="natijalar-title">
      <SectionHeading titleId="natijalar-title" number={meta.number} label={l(meta.label)} title={t.deliverables.title} />
      <div className="mt-12 md:mt-16">
        <DeliverablesGrid />
        <p className="mt-6 max-w-[64ch] text-[0.9375rem] text-ink-2">{l(deliverablesNote)}</p>
      </div>
    </Section>
  );
}

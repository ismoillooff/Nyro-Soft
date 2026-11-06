import { homeSections } from "~/content/sections";
import { supportItems, supportNote } from "~/content/support";
import { useI18n } from "~/i18n";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";

/** Three directions in columns separated by hairlines (rows on mobile). */
export function Support() {
  const { t, l } = useI18n();
  const meta = homeSections.support;
  return (
    <Section id={meta.id} titleId="qollab-title">
      <SectionHeading titleId="qollab-title" number={meta.number} label={l(meta.label)} title={t.support.title} />
      <RevealGroup
        as="ul"
        className="mt-12 grid divide-y divide-line border-y border-line md:mt-16 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
      >
        {supportItems.map((item, i) => (
          <li key={i} className="py-8 lg:px-8 lg:py-10 lg:first:pl-0 lg:last:pr-0">
            <p className="t-label text-ink-3">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="t-h3 mt-6">{l(item.title)}</h3>
            <p className="mt-3 max-w-[40ch] text-ink-2">{l(item.text)}</p>
          </li>
        ))}
      </RevealGroup>
      <p className="mt-6 max-w-[64ch] text-[0.9375rem] text-ink-2">{l(supportNote)}</p>
    </Section>
  );
}

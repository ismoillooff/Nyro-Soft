import { faq } from "~/content/faq";
import { homeSections } from "~/content/sections";
import { useI18n } from "~/i18n";
import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { Section } from "~/components/layout/Section";
import { Reveal } from "~/components/motion/Reveal";
import { Accordion } from "~/components/ui/Accordion";

export function Faq() {
  const { t, l } = useI18n();
  const meta = homeSections.faq;
  return (
    <Section id={meta.id} titleId="savollar-title">
      <div className="grid-site gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)]">
            <Reveal>
              <p className="t-label mb-5 text-ink-3">
                {meta.number} — {l(meta.label)}
              </p>
              <h2 id="savollar-title" className="t-h2">
                {t.faq.title}
              </h2>
            </Reveal>
            <HairlineFigure name="query" label={t.faq.figureLabel} surface="bg" className="mt-10 hidden max-w-[320px] lg:block" />
          </div>
        </div>
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-8">
          <Accordion items={faq.map((f) => ({ id: f.id, question: l(f.q), answer: l(f.a) }))} />
        </Reveal>
      </div>
    </Section>
  );
}

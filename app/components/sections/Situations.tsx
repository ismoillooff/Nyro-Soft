import { homeSections } from "~/content/sections";
import { services } from "~/content/services";
import { situations, situationsNote } from "~/content/situations";
import { useI18n } from "~/i18n";
import { HairlineBeam } from "~/components/hairline/HairlineBeam";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import { Arrow } from "~/components/ui/Button";

/**
 * "In which situation do we help?" — four starting points, each a situation a
 * visitor may recognise and the direction the work would take. These are
 * situations, not results. Each one links to the service that covers it.
 * Compact on purpose: a 2×2 hairline grid, no figure.
 */
export function Situations() {
  const { t, l } = useI18n();
  const meta = homeSections.situations;
  return (
    <Section id={meta.id} titleId="vaziyatlar-title" compact>
      <div className="grid-site gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionHeading titleId="vaziyatlar-title" number={meta.number} label={l(meta.label)} title={t.situations.title} lead={t.situations.lead} />
          <p className="mt-6 max-w-[40ch] text-[0.9375rem] text-ink-3">{l(situationsNote)}</p>
          <Link
            to="#brif"
            className="group/btn mt-5 inline-flex min-h-11 items-center gap-1.5 font-medium underline decoration-line-strong underline-offset-4 transition-[text-decoration-color] duration-(--dur-micro) hover:decoration-ink"
          >
            {t.situations.cta}
            <Arrow kind="right" />
          </Link>
        </div>
        <RevealGroup as="ul" className="col-span-4 grid gap-px border border-line-strong bg-line md:col-span-8 md:grid-cols-2 lg:col-span-8">
          {situations.map((s, i) => {
            const service = services.find((x) => x.slug === s.service);
            return (
              <li key={s.id} data-beam-host="" className="group/btn relative flex flex-col bg-bg p-6 md:p-7">
                <HairlineBeam trigger="hover" className="-top-px right-0 left-0" length={64} duration={1000} />
                <p className="t-label text-ink-3">
                  {String(i + 1).padStart(2, "0")} · {t.situations.situation}
                </p>
                <h3 className="t-h3 mt-3 max-w-[22ch]">{l(s.problem)}</h3>
                <p className="mt-5 flex gap-3 text-ink-2">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-5 shrink-0 bg-accent" />
                  <span>
                    <span className="sr-only">{t.situations.direction}: </span>
                    {l(s.direction)}
                  </span>
                </p>
                {service && (
                  <Link
                    to={`/xizmatlar/${service.slug}`}
                    viewTransition
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-5 text-[0.9375rem] font-medium text-ink"
                  >
                    {l(service.title)}
                    <Arrow kind="right" />
                  </Link>
                )}
              </li>
            );
          })}
        </RevealGroup>
      </div>
    </Section>
  );
}

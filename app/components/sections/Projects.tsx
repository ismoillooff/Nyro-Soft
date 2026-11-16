import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";
import { Arrow } from "~/components/ui/Button";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import { projects } from "~/content/projects";
import { homeSections } from "~/content/sections";
import { useI18n } from "~/i18n";
import { ProjectCard } from "./ProjectCard";

const AUTOMATION_SERVICE = "biznesni-avtomatlashtirish";

/** Shown where a service has no concept yet (service pages); about one card tall. */
export function ProjectsEmpty({ serviceSlug = AUTOMATION_SERVICE }: { serviceSlug?: string }) {
  const { t } = useI18n();
  return (
    <div className="group/btn relative">
      <div className="relative flex aspect-[4/3] items-center justify-center border border-line-strong bg-surface">
        <HairlineFigure name="drawer" label={t.projects.emptyFigure} surface="surface" className="w-[62%] max-w-[360px]" />
      </div>
      <p className="t-h3 mt-5 max-w-[30ch]">{t.projects.emptyTitle}</p>
      <Link
        to={`/?xizmat=${serviceSlug}#brif`}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        {t.projects.emptyLink}
        <Arrow kind="right" />
      </Link>
    </div>
  );
}

/**
 * The two concept projects side by side. No filters (a filter with zero
 * results only shows emptiness): each card carries its category instead, and
 * tells its story as task → user flow → decision → opportunity.
 */
export function Projects() {
  const { t, l } = useI18n();
  const meta = homeSections.projects;
  return (
    <Section id={meta.id} titleId="loyihalar-title">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading titleId="loyihalar-title" number={meta.number} label={l(meta.label)} title={t.projects.title} lead={t.projects.lead} />
        <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-3 lg:pb-2">
          <span>{t.projects.concept}</span>
          {projects.map((p) => (
            <span key={p.slug} className="inline-flex items-center gap-3">
              <span aria-hidden="true">·</span>
              {l(p.categoryLabel)}
            </span>
          ))}
        </p>
      </div>

      <RevealGroup as="ul" aria-label={t.projects.listLabel} className="mt-12 grid gap-x-[var(--gap)] gap-y-16 md:mt-16 md:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug}>
            <ProjectCard project={p} />
          </li>
        ))}
      </RevealGroup>
    </Section>
  );
}

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { projectFilters, projects, type Project } from "~/content/projects";
import { homeSections } from "~/content/sections";
import type { ProjectCategory } from "~/content/services";
import { fmt, useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { spring } from "~/motion/tokens";
import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";
import { Arrow } from "~/components/ui/Button";
import { ProjectCard } from "./ProjectCard";

type Filter = "all" | ProjectCategory;

const AUTOMATION_SERVICE = "biznesni-avtomatlashtirish";

/** Shown in place of the cards when a category has no concept yet; about one card tall. */
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

export function Projects() {
  const { t, l } = useI18n();
  const meta = homeSections.projects;
  const [filter, setFilter] = useState<Filter>("all");
  const [announce, setAnnounce] = useState("");

  const counts = Object.fromEntries(
    projectFilters.map((f) => [f.value, f.value === "all" ? projects.length : projects.filter((p) => p.category === f.value).length]),
  ) as Record<Filter, number>;
  const visible: readonly Project[] = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  const choose = (value: Filter) => {
    setFilter(value);
    setAnnounce(fmt(t.projects.countLive, { n: counts[value] }));
  };

  return (
    <Section id={meta.id} titleId="loyihalar-title">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading titleId="loyihalar-title" number={meta.number} label={l(meta.label)} title={t.projects.title} lead={t.projects.lead} />
        <div role="group" aria-label={t.projects.filterGroup} className="-mx-1 flex flex-wrap gap-1.5">
          {projectFilters.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => choose(f.value)}
                className={cn(
                  "relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] transition-colors duration-[180ms]",
                  active ? "text-accent-strong" : "text-ink-2 hover:text-ink",
                )}
              >
                {active && (
                  <m.span
                    layoutId="project-filter"
                    transition={spring.ui}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-line-accent bg-surface-soft"
                  />
                )}
                {!active && <span aria-hidden="true" className="absolute inset-0 rounded-full border border-line" />}
                <span className="relative">{l(f.label)}</span>
                <span className="t-label relative text-[0.8125rem] text-ink-3">{counts[f.value]}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p role="status" className="sr-only">
        {announce}
      </p>

      <m.div layout transition={spring.ui} className="mt-12 md:mt-16">
        <RevealGroup
          className="grid gap-x-[var(--gap)] gap-y-14 md:grid-cols-2"
          step={0.07}
          stepMobile={0.05}
          itemSelector=":scope > * > *"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.length > 0 ? (
              visible.map((p) => (
                <m.div
                  key={p.slug}
                  layout
                  transition={spring.ui}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProjectCard project={p} />
                </m.div>
              ))
            ) : (
              <m.div key="empty" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={spring.ui}>
                <ProjectsEmpty />
              </m.div>
            )}
          </AnimatePresence>
        </RevealGroup>
      </m.div>
    </Section>
  );
}

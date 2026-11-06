import { m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link, useViewTransitionState } from "react-router";
import type { Project } from "~/content/projects";
import { useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { FinanceMock } from "~/components/demo/FinanceMock";
import { HairlineBeam } from "~/components/hairline/HairlineBeam";
import { Arrow } from "~/components/ui/Button";
import { Tag } from "~/components/ui/Tag";
import { useMediaQuery, useReducedMotionPref } from "~/components/motion/hooks";

export function ProjectPreview({ project }: { project: Project }) {
  return project.preview === "dashboard" ? <DashboardMock /> : <FinanceMock />;
}

/** The view-transition-name shared by the clicked card and the case study hero. */
export const PREVIEW_VT = "project-preview";

/**
 * One concept. The whole card is a single link (stretched over the card from
 * the h3); nothing inside is separately interactive.
 */
export function ProjectCard({ project, headingLevel = "h3" }: { project: Project; headingLevel?: "h2" | "h3" }) {
  const { t, l } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const href = `/loyihalar/${project.slug}`;
  const transitioning = useViewTransitionState(href);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotionPref();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const Heading = headingLevel;
  const title = l(project.title);

  return (
    <article
      ref={ref}
      data-beam-host=""
      className="group group/btn relative rounded-[var(--radius-sm)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-8 has-[a:focus-visible]:outline-accent"
    >
      <div
        className="relative overflow-hidden border border-line-strong bg-surface transition-colors duration-500 ease-(--ease-out) group-hover:border-line-accent group-has-[a:focus-visible]:border-line-accent motion-reduce:duration-200"
        style={{ viewTransitionName: transitioning ? PREVIEW_VT : undefined }}
      >
        <HairlineBeam trigger="hover" className="-top-px right-0 left-0 z-10" length={72} duration={1200} />
        <div className="relative aspect-[4/3] overflow-hidden" role="img" aria-label={t.projects.previewAlt.replace("{title}", title)}>
          <m.div className="absolute inset-x-0 -top-[3%] h-[106%]" style={desktop && !reduce ? { y } : undefined}>
            <div className="size-full transition-transform duration-200 ease-(--ease-out) group-hover:scale-[1.025] group-has-[a:focus-visible]:scale-[1.025] motion-reduce:transform-none">
              <ProjectPreview project={project} />
            </div>
          </m.div>
        </div>
      </div>

      <p className="t-label mt-5 flex flex-wrap items-center gap-x-2 text-ink-3">
        <span>{t.projects.concept}</span>
        <span aria-hidden="true">·</span>
        <span>{l(project.categoryLabel)}</span>
      </p>
      <Heading className="t-h3 mt-2">
        <Link to={href} viewTransition className="outline-none after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </Heading>
      <p className="mt-2 max-w-[52ch] text-ink-2">{l(project.description)}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label={t.project.stack}>
        {project.tags.map((tag) => (
          <li key={tag}>
            <Tag>{tag}</Tag>
          </li>
        ))}
      </ul>
      <span aria-hidden="true" className="mt-5 inline-flex min-h-6 items-center gap-1.5 font-medium text-ink">
        {t.projects.more}
        <Arrow kind="right" className={cn("group-has-[a:focus-visible]/btn:translate-x-[3px]")} />
      </span>
    </article>
  );
}

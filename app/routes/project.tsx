import { m } from "motion/react";
import { Info } from "lucide-react";
import { useRef } from "react";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import type { Route } from "./+types/project";
import { getProject, projects, type Project } from "~/content/projects";
import { i18nFor, localeFromPath, useI18n } from "~/i18n";
import { absoluteUrl, breadcrumbLd, pageTitle, seo } from "~/lib/seo";
import { cn } from "~/lib/cn";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { FinanceMock, FinanceScreen, PhoneFrame } from "~/components/demo/FinanceMock";
import { CornerMarks } from "~/components/hairline/Hairline";
import { Breadcrumb } from "~/components/layout/Breadcrumb";
import { useActiveSection, useActiveSectionId, useParallax, useSectionProgress } from "~/components/motion/hooks";
import { Reveal, RevealGroup } from "~/components/motion/Reveal";
import { PREVIEW_VT } from "~/components/sections/ProjectCard";
import { Arrow } from "~/components/ui/Button";
import { Tag } from "~/components/ui/Tag";
import { NotFoundContent } from "./not-found";
import { CtaBand } from "./service";

export const meta: Route.MetaFunction = ({ params, location }) => {
  const { t, l, locale, p: lp } = i18nFor(localeFromPath(location.pathname));
  const pr = getProject(params.slug);
  if (!pr) return seo({ title: pageTitle(t.meta.notFoundTitle), description: t.notFound.text, path: "/404", noindex: true, locale });
  const path = `/loyihalar/${pr.slug}`;
  return seo({
    title: pageTitle(`${l(pr.title)} — ${t.projects.concept.toLowerCase()}`),
    description: l(pr.description),
    path,
    locale,
    type: "article",
    jsonLd: [
      breadcrumbLd(
        [
          { name: t.service.breadcrumbHome, path: "/" },
          { name: t.project.breadcrumbProjects, path: "/#loyihalar" },
          { name: l(pr.title), path },
        ],
        locale,
      ),
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: l(pr.title),
        description: l(pr.description),
        url: absoluteUrl(lp(path)),
        inLanguage: locale,
        keywords: pr.tags.join(", "),
        creator: { "@type": "Organization", name: "Nyro Soft" },
      },
    ],
  });
};

const SECTION_IDS = ["vazifa", "yechim", "funksiyalar", "korinishlar", "texnologiyalar", "foyda"] as const;

function Preview({ project }: { project: Project }) {
  return project.preview === "dashboard" ? <DashboardMock /> : <FinanceMock />;
}

/** Desktop and phone frames drawn with hairlines; the phone drifts 24px faster than the desktop. */
function Screens({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const phoneY = useParallax(ref, 24, ["start end", "end start"]);
  return (
    <div ref={ref} className="relative pb-10 md:pr-[12%] md:pb-0">
      <div className="relative border border-line-strong bg-surface">
        <div aria-hidden="true" className="flex h-8 items-center gap-1.5 border-b border-line px-3">
          <span className="size-2 rounded-full border border-line-strong" />
          <span className="size-2 rounded-full border border-line-strong" />
          <span className="size-2 rounded-full border border-line-strong" />
        </div>
        <div className="aspect-[16/10]">
          {project.preview === "dashboard" ? <DashboardMock /> : <FinanceMock />}
        </div>
      </div>
      <m.div
        className="absolute right-[4%] -bottom-2 w-[30%] max-w-[180px] min-w-[120px] md:right-0 md:bottom-[-6%] md:w-[22%]"
        style={{ y: phoneY }}
      >
        <div className="@container" style={{ fontSize: "clamp(5px, 5.2cqw, 10px)" }}>
          <PhoneFrame>
            {project.preview === "dashboard" ? <DashboardMock layout="auto" /> : <FinanceScreen screen="budget" />}
          </PhoneFrame>
        </div>
      </m.div>
    </div>
  );
}

function SectionIndex({ items, contentRef }: { items: readonly { id: string; label: string }[]; contentRef: React.RefObject<HTMLElement | null> }) {
  const { t } = useI18n();
  const active = useActiveSectionId();
  const progress = useSectionProgress(contentRef, ["start center", "end center"]);
  return (
    <nav aria-label={t.project.index} className="sticky top-[calc(var(--header-h)+40px)]">
      <p className="t-label mb-4 text-ink-3">{t.project.index}</p>
      <div className="relative pl-5">
        <span aria-hidden="true" className="absolute top-1 bottom-1 left-0 w-px bg-line">
          <m.span className="absolute inset-0 origin-top bg-accent" style={{ scaleY: progress }} />
        </span>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "flex min-h-10 items-center text-[0.9375rem] transition-colors duration-[180ms]",
                  active === item.id ? "text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Block({ id, title, note, children }: { id: string; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-12 md:py-16">
      <h2 id={`${id}-title`} className="t-h2">
        {title}
      </h2>
      {note && <p className="t-label mt-3 text-ink-3">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default function ProjectPage({ params }: Route.ComponentProps) {
  const { t, l } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);
  useActiveSection(SECTION_IDS);
  const project = getProject(params.slug);
  if (!project) return <NotFoundContent />;

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const labels: Record<(typeof SECTION_IDS)[number], string> = {
    vazifa: t.project.task,
    yechim: t.project.solution,
    funksiyalar: t.project.features,
    korinishlar: t.project.screens,
    texnologiyalar: t.project.stack,
    foyda: t.project.benefits,
  };

  return (
    <article>
      <div className="container-site">
        <div className="pt-8 md:pt-12">
          <Breadcrumb
            items={[
              { label: t.service.breadcrumbHome, to: "/" },
              { label: t.project.breadcrumbProjects, to: "/#loyihalar" },
              { label: l(project.title) },
            ]}
          />
        </div>

        <p className="mt-8 flex items-start gap-3 rounded-[var(--radius-md)] bg-surface-soft px-4 py-3.5 text-[0.9375rem] text-ink md:items-center md:px-5">
          <Info aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-accent-strong md:mt-0" />
          {t.project.notice}
        </p>

        <header className="pt-10 md:pt-14">
          <p className="hero-in t-label text-ink-3">
            {t.projects.concept} · {l(project.categoryLabel)}
          </p>
          <h1 className="hero-in-solid t-display mt-5 max-w-[16ch]" style={{ ["--d" as string]: "60ms" }}>
            {l(project.title)}
          </h1>
          <p className="hero-in t-lead mt-6 max-w-[48ch] text-ink-2" style={{ ["--d" as string]: "120ms" }}>
            {l(project.lead)}
          </p>
          <dl className="mt-10 grid border-y border-line md:grid-cols-3">
            {[
              [t.project.category, l(project.categoryLabel)],
              [t.project.platform, l(project.platform)],
              [t.project.stack, project.tags.join(" · ")],
            ].map(([k, v], i) => (
              <div key={k} className={cn("py-4 md:px-6 md:py-5", i > 0 && "border-t border-line md:border-t-0 md:border-l", i === 0 && "md:pl-0")}>
                <dt className="t-label text-ink-3">{k}</dt>
                <dd className="mt-1.5">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="relative mt-12 border border-line-strong bg-surface md:mt-16" style={{ viewTransitionName: PREVIEW_VT }}>
          <CornerMarks />
          <div className="aspect-[4/3] md:aspect-[16/10]" role="img" aria-label={t.projects.previewAlt.replace("{title}", l(project.title))}>
            <Preview project={project} />
          </div>
        </div>

        <div className="grid-site mt-16 md:mt-24">
          <aside className="hidden lg:col-span-3 lg:block">
            <SectionIndex items={SECTION_IDS.map((id) => ({ id, label: labels[id] }))} contentRef={contentRef} />
          </aside>
          <div ref={contentRef} className="col-span-4 md:col-span-8 lg:col-span-9">
            <Block id="vazifa" title={t.project.task}>
              <Reveal>
                <p className="t-lead max-w-[60ch] text-ink-2">{l(project.task)}</p>
              </Reveal>
            </Block>
            <Block id="yechim" title={t.project.solution}>
              <Reveal>
                <p className="t-lead max-w-[60ch] text-ink-2">{l(project.solution)}</p>
              </Reveal>
            </Block>
            <Block id="funksiyalar" title={t.project.features}>
              <RevealGroup as="ul" className="border-t border-line">
                {project.features.map((f, i) => (
                  <li key={i} className="grid gap-1 border-b border-line py-5 md:grid-cols-[14rem_1fr] md:gap-6">
                    <h3 className="font-semibold">{l(f.title)}</h3>
                    <p className="text-ink-2">{l(f.text)}</p>
                  </li>
                ))}
              </RevealGroup>
            </Block>
            <Block id="korinishlar" title={t.project.screens}>
              <Screens project={project} />
            </Block>
            <Block id="texnologiyalar" title={t.project.stack}>
              <ul className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Tag className="h-9 px-3 text-[0.875rem]">{tag}</Tag>
                  </li>
                ))}
              </ul>
            </Block>
            <Block id="foyda" title={t.project.benefits} note={t.project.benefitsNote}>
              <RevealGroup as="ul" className="grid gap-x-[var(--gap)] md:grid-cols-3">
                {project.benefits.map((b, i) => (
                  <li key={i} className="border-t border-line pt-5 pb-6">
                    <p className="t-label text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                    <p className="mt-3">{l(b)}</p>
                  </li>
                ))}
              </RevealGroup>
            </Block>
          </div>
        </div>

        {prev && next && prev.slug !== project.slug && (
          <nav aria-label={t.project.breadcrumbProjects} className="mt-8 grid border-y border-line md:grid-cols-2">
            {[
              { p: prev, label: t.project.prev, align: "md:pr-6" },
              { p: next, label: t.project.next, align: "md:border-l md:border-line md:pl-6 md:text-right" },
            ].map(({ p, label, align }, i) => (
              <Link
                key={`${label}-${p.slug}`}
                to={`/loyihalar/${p.slug}`}
                viewTransition
                className={cn("group/btn block py-6", i > 0 && "border-t border-line md:border-t-0", align)}
              >
                <span className="t-label text-ink-3">{label}</span>
                <span className={cn("t-h3 mt-2 flex items-center gap-2", i > 0 && "md:justify-end")}>
                  {l(p.title)}
                  <Arrow kind="right" />
                </span>
              </Link>
            ))}
          </nav>
        )}

        <CtaBand title={t.project.ctaTitle} text={t.project.ctaText} to="/#brif" label={t.project.ctaButton} />
      </div>
    </article>
  );
}

import { m } from "motion/react";
import { Info } from "lucide-react";
import { useRef } from "react";
import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import type { Route } from "./+types/project";
import { getProject, projects, type Project } from "~/content/projects";
import { fmt, i18nFor, localeFromPath, useI18n } from "~/i18n";
import { absoluteUrl, breadcrumbLd, pageTitle, seo } from "~/lib/seo";
import { cn } from "~/lib/cn";
import { DashboardMock } from "~/components/demo/DashboardMock";
import { FinanceMock, FinanceScreen, PhoneFrame } from "~/components/demo/FinanceMock";
import { CornerMarks, HairlineNode } from "~/components/hairline/Hairline";
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

const SECTION_IDS = ["vazifa", "foydalanuvchilar", "oqim", "qarorlar", "funksiyalar", "korinishlar", "yondashuv", "chegaralar", "keyingi-qadam"] as const;

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
                  "flex min-h-10 items-center text-[0.9375rem] transition-colors duration-(--dur-micro)",
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

/**
 * A concept case study: the product image right under the title, then the
 * story in order — task, users, main flow, design decisions, the functions
 * shown, screens, technical approach, the limits of the concept and what a
 * real project would do next. Expected benefits are labelled as goals, not
 * measured results; the concept notice sits right under the product image.
 */
export default function ProjectPage({ params }: Route.ComponentProps) {
  const { t, l } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);
  useActiveSection(SECTION_IDS);
  const project = getProject(params.slug);
  if (!project) return <NotFoundContent />;

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const cs = t.caseStudy;
  const labels: Record<(typeof SECTION_IDS)[number], string> = {
    vazifa: t.project.task,
    foydalanuvchilar: cs.users,
    oqim: cs.flow,
    qarorlar: cs.decisions,
    funksiyalar: cs.shown,
    korinishlar: t.project.screens,
    yondashuv: cs.approach,
    chegaralar: cs.limits,
    "keyingi-qadam": cs.nextStep,
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

        <header className="pt-8 md:pt-12" data-build-hero="">
          <p className="hero-in flex flex-wrap items-center gap-2">
            <Tag tone="soft">{l(project.categoryLabel)}</Tag>
            <span className="t-label text-ink-3">{t.projects.concept}</span>
          </p>
          <h1 className="hero-in-solid t-display mt-5 max-w-[16ch]" style={{ ["--d" as string]: "60ms" }}>
            {l(project.title)}
          </h1>
          <p className="hero-in-solid t-lead mt-6 max-w-[52ch] text-ink-2" style={{ ["--d" as string]: "120ms" }}>
            {l(project.lead)}
          </p>
        </header>

        {/* The product, early: right under the title. */}
        <div className="relative mt-10 border border-line-strong bg-surface md:mt-12" style={{ viewTransitionName: PREVIEW_VT }}>
          <CornerMarks />
          <div className="aspect-[4/3] md:aspect-[16/10]" role="img" aria-label={t.projects.previewAlt.replace("{title}", l(project.title))}>
            <Preview project={project} />
          </div>
        </div>

        <p className="mt-6 flex items-start gap-3 rounded-[var(--radius-md)] bg-surface-soft px-4 py-3.5 text-[0.9375rem] text-ink md:items-center md:px-5">
          <Info aria-hidden="true" strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-accent-strong md:mt-0" />
          {t.project.notice}
        </p>

        <dl className="mt-8 grid border-y border-line md:grid-cols-3">
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

        <div className="grid-site mt-14 md:mt-20">
          <aside className="hidden lg:col-span-3 lg:block">
            <SectionIndex items={SECTION_IDS.map((id) => ({ id, label: labels[id] }))} contentRef={contentRef} />
          </aside>
          <div ref={contentRef} className="col-span-4 md:col-span-8 lg:col-span-9">
            <Block id="vazifa" title={t.project.task}>
              <Reveal>
                <p className="t-lead max-w-[60ch] text-ink-2">{l(project.task)}</p>
                <p className="mt-6 max-w-[60ch]">{l(project.solution)}</p>
              </Reveal>
            </Block>

            <Block id="foydalanuvchilar" title={cs.users}>
              <RevealGroup as="ul" className="grid gap-px border border-line bg-line md:grid-cols-3">
                {project.users.map((u, i) => (
                  <li key={i} className="bg-bg p-5">
                    <p className="t-label text-ink-3">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-4 font-semibold">{l(u.role)}</h3>
                    <p className="mt-2 text-ink-2">{l(u.need)}</p>
                  </li>
                ))}
              </RevealGroup>
            </Block>

            <Block id="oqim" title={cs.flow}>
              <RevealGroup as="ol" className="grid gap-5">
                {project.flow.map((step, i) => (
                  <li key={i} className="relative grid grid-cols-[9px_1fr] gap-x-5">
                    {i < project.flow.length - 1 && (
                      <span aria-hidden="true" className="absolute top-[1.15rem] -bottom-[1.4rem] left-[4px] w-px bg-line-strong" />
                    )}
                    <HairlineNode state={i === project.flow.length - 1 ? "active" : "done"} className="relative mt-[0.45rem]" />
                    <p>
                      <span className="t-label mr-2 text-ink-3">{fmt(cs.flowStep, { n: i + 1 })}</span>
                      {l(step)}
                    </p>
                  </li>
                ))}
              </RevealGroup>
            </Block>

            <Block id="qarorlar" title={cs.decisions}>
              <RevealGroup as="ul" className="border-t border-line">
                {project.decisions.map((d, i) => (
                  <li key={i} className="grid gap-1 border-b border-line py-5 md:grid-cols-[14rem_1fr] md:gap-6">
                    <h3 className="font-semibold">{l(d.title)}</h3>
                    <p className="text-ink-2">{l(d.text)}</p>
                  </li>
                ))}
              </RevealGroup>
            </Block>

            <Block id="funksiyalar" title={cs.shown}>
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

            <Block id="yondashuv" title={cs.approach}>
              <Reveal>
                <p className="max-w-[60ch] text-ink-2">{l(project.approach)}</p>
                <ul className="mt-6 flex flex-wrap gap-2" aria-label={t.project.stack}>
                  {project.tags.map((tag) => (
                    <li key={tag}>
                      <Tag className="h-9 px-3 text-[0.875rem]">{tag}</Tag>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Block>

            <Block id="chegaralar" title={cs.limits} note={t.project.benefitsNote}>
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <h3 className="t-label mb-3 text-ink-3">{t.project.benefits}</h3>
                  <ul className="border-t border-line">
                    {project.benefits.map((b, i) => (
                      <li key={i} className="border-b border-line py-3.5">
                        {l(b)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="t-label mb-3 text-ink-3">{cs.limits}</h3>
                  <ul className="border-t border-line">
                    {project.limits.map((b, i) => (
                      <li key={i} className="border-b border-line py-3.5 text-ink-2">
                        {l(b)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Block>

            <Block id="keyingi-qadam" title={cs.nextStep}>
              <Reveal>
                <p className="t-lead max-w-[60ch] text-ink-2">{l(project.nextStep)}</p>
              </Reveal>
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

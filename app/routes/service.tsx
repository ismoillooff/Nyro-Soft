import { Check } from "lucide-react";
import type { Route } from "./+types/service";
import { projects } from "~/content/projects";
import { getService } from "~/content/services";
import { useI18n } from "~/i18n";
import { uz } from "~/i18n/uz";
import { breadcrumbLd, faqLd, pageTitle, seo, serviceLd } from "~/lib/seo";
import { Hairline, MarkedRule } from "~/components/hairline/Hairline";
import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { Breadcrumb, PageSection } from "~/components/layout/Breadcrumb";
import { Reveal, RevealGroup } from "~/components/motion/Reveal";
import { DeliverablesGrid } from "~/components/sections/Deliverables";
import { ProcessCompact } from "~/components/sections/Process";
import { ProjectCard } from "~/components/sections/ProjectCard";
import { ProjectsEmpty } from "~/components/sections/Projects";
import { Accordion } from "~/components/ui/Accordion";
import { ButtonLink } from "~/components/ui/Button";
import { NotFoundContent } from "./not-found";

export const meta: Route.MetaFunction = ({ params }) => {
  const s = getService(params.slug);
  if (!s) return seo({ title: pageTitle(uz.meta.notFoundTitle), description: uz.notFound.text, path: "/404", noindex: true });
  const path = `/xizmatlar/${s.slug}`;
  return seo({
    title: pageTitle(s.title.uz),
    description: s.description.uz,
    path,
    jsonLd: [
      serviceLd(s.title.uz, s.description.uz, path),
      breadcrumbLd([
        { name: uz.service.breadcrumbHome, path: "/" },
        { name: uz.service.breadcrumbServices, path: "/#xizmatlar" },
        { name: s.title.uz, path },
      ]),
      faqLd(s.faq.map((f) => ({ q: f.q.uz, a: f.a.uz }))),
    ],
  });
};

export default function ServicePage({ params }: Route.ComponentProps) {
  const { t, l } = useI18n();
  const s = getService(params.slug);
  if (!s) return <NotFoundContent />;

  const related = projects.filter((p) => s.related.includes(p.category));
  const briefHref = `/?xizmat=${s.slug}#brif`;

  return (
    <article>
      {/* Hero */}
      <header className="container-site">
        <div className="pt-8 md:pt-12">
          <Breadcrumb
            items={[
              { label: t.service.breadcrumbHome, to: "/" },
              { label: t.service.breadcrumbServices, to: "/#xizmatlar" },
              { label: l(s.title) },
            ]}
          />
        </div>
        <div className="grid-site items-center gap-y-10 pt-10 pb-[clamp(48px,7vw,96px)] md:pt-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <p className="hero-in t-label text-ink-3">
              {t.nav.services} · {s.number}
            </p>
            <h1 className="hero-in-solid t-display mt-5" style={{ ["--d" as string]: "60ms" }}>
              {l(s.title)}
            </h1>
            <p className="hero-in t-lead mt-6 max-w-[44ch] text-ink-2" style={{ ["--d" as string]: "120ms" }}>
              {l(s.description)}
            </p>
            <div className="hero-in mt-9" style={{ ["--d" as string]: "180ms" }}>
              <ButtonLink to={briefHref} arrow="up-right">
                {t.service.cta}
              </ButtonLink>
            </div>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <HairlineFigure name={s.figure} label={l(s.figureLabel)} className="mx-auto w-full max-w-[320px] lg:max-w-none" />
          </div>
        </div>
        <MarkedRule />
      </header>

      <div className="container-site">
        <div className="grid-site">
          <div className="col-span-4 md:col-span-8 lg:col-span-10">
            {/* Kimga mos */}
            <PageSection id="kimga-mos" title={t.service.audience}>
              <RevealGroup as="ul" className="border-t border-line">
                {s.audience.map((a, i) => (
                  <li key={i} className="grid grid-cols-[3rem_1fr] border-b border-line py-5 md:grid-cols-[4rem_1fr]">
                    <span className="t-label pt-1 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[1.0625rem]">{l(a)}</span>
                  </li>
                ))}
              </RevealGroup>
            </PageSection>

            {/* Muammo → yechim */}
            <PageSection id="muammolar" title={t.service.problems}>
              <Reveal>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-y border-line-strong">
                      <th scope="col" className="t-label w-1/2 py-3 pr-6 font-medium text-ink-3">
                        {t.service.problem}
                      </th>
                      <th scope="col" className="t-label w-1/2 py-3 font-medium text-ink-3">
                        {t.service.solution}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.problems.map((p, i) => (
                      <tr key={i} className="border-b border-line align-top">
                        <td className="py-5 pr-6 text-ink-2">{l(p.problem)}</td>
                        <td className="py-5">{l(p.solution)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            </PageSection>

            {/* Ish hajmi */}
            <PageSection id="ish-hajmi" title={t.service.scope}>
              <RevealGroup as="ul" className="grid gap-x-[var(--gap)] md:grid-cols-2">
                {s.scope.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-line py-4">
                    <Check aria-hidden="true" strokeWidth={1.5} className="mt-1 size-4 shrink-0 text-ink" />
                    <span>{l(item)}</span>
                  </li>
                ))}
              </RevealGroup>
              <p className="mt-6 text-[0.9375rem] text-ink-2">{t.service.scopeNote}</p>
            </PageSection>
          </div>
        </div>

        <section aria-labelledby="jarayon-title" className="py-[clamp(56px,7vw,96px)]">
          <ProcessCompact titleId="jarayon-title" title={t.service.process} />
        </section>

        <PageSection id="materiallar" title={t.service.deliverables}>
          <DeliverablesGrid />
        </PageSection>

        <PageSection id="loyihalar" title={t.service.related}>
          <div className="grid gap-x-[var(--gap)] gap-y-14 md:grid-cols-2">
            {related.length > 0 ? related.map((p) => <ProjectCard key={p.slug} project={p} />) : <ProjectsEmpty serviceSlug={s.slug} />}
          </div>
        </PageSection>

        <div className="grid-site">
          <div className="col-span-4 md:col-span-8 lg:col-span-10">
            <PageSection id="savollar" title={t.service.faq}>
              <Accordion items={s.faq.map((f, i) => ({ id: String(i), question: l(f.q), answer: l(f.a) }))} />
            </PageSection>
          </div>
        </div>

        <CtaBand title={t.service.ctaBandTitle} text={t.service.ctaBandText} to={briefHref} label={t.service.cta} />
      </div>
    </article>
  );
}

/** The closing call to action of inner pages: a framed band with one button. */
export function CtaBand({ title, text, to, label }: { title: string; text: string; to: string; label: string }) {
  return (
    <section aria-labelledby="cta-title" className="pt-[clamp(56px,7vw,96px)] pb-[clamp(88px,11vw,160px)]">
      <Reveal>
        <div className="relative border border-line-strong bg-surface">
          <Hairline tone="accent" length={64} className="absolute -top-px left-0" />
          <div className="flex flex-col gap-8 p-6 md:flex-row md:items-end md:justify-between md:p-10">
            <div>
              <h2 id="cta-title" className="t-h2 max-w-[18ch]">
                {title}
              </h2>
              <p className="t-lead mt-4 max-w-[46ch] text-ink-2">{text}</p>
            </div>
            <ButtonLink to={to} arrow="up-right" className="shrink-0 self-start md:self-auto">
              {label}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

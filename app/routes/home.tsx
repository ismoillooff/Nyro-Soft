import { lazy, Suspense } from "react";
import type { Route } from "./+types/home";
import { faq } from "~/content/faq";
import { railSections } from "~/content/sections";
import { site } from "~/content/site";
import { uz } from "~/i18n/uz";
import { faqLd, organizationLd, seo, websiteLd } from "~/lib/seo";
import { SectionRail } from "~/components/hairline/SectionRail";
import { useActiveSection } from "~/components/motion/hooks";
import { Deliverables } from "~/components/sections/Deliverables";
import { Demo } from "~/components/sections/Demo";
import { Faq } from "~/components/sections/Faq";
import { Hero } from "~/components/sections/Hero";
import { Process } from "~/components/sections/Process";
import { Projects } from "~/components/sections/Projects";
import { Services } from "~/components/sections/Services";
import { Support } from "~/components/sections/Support";
import { Team } from "~/components/sections/Team";
import { TechMarquee } from "~/components/sections/TechMarquee";

export const meta: Route.MetaFunction = () =>
  seo({
    title: uz.meta.homeTitle,
    description: uz.meta.homeDescription,
    path: "/",
    jsonLd: [
      organizationLd(site.description.uz),
      websiteLd(),
      faqLd(faq.map((f) => ({ q: f.q.uz, a: f.a.uz }))),
    ],
  });

const RAIL_IDS = railSections.map((s) => s.id);

/**
 * The brief is its own chunk. Prerendering resolves it, so the static HTML
 * holds the full section; in the browser the chunk loads while that HTML is
 * already on screen (no layout shift, nothing hidden).
 */
const Brief = lazy(() => import("~/components/sections/Brief").then((m) => ({ default: m.Brief })));

export default function Home() {
  useActiveSection(RAIL_IDS);

  return (
    <>
      <SectionRail sections={railSections} />
      <Hero />
      <Projects />
      <Services />
      <TechMarquee />
      <Demo />
      <Process />
      <Deliverables />
      <Team />
      <Support />
      <Faq />
      <Suspense fallback={<section id="brif" aria-label="Brif" className="section-y min-h-[880px]" />}>
        <Brief />
      </Suspense>
    </>
  );
}

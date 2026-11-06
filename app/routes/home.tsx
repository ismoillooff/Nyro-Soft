import type { Route } from "./+types/home";
import { faq } from "~/content/faq";
import { railSections } from "~/content/sections";
import { site } from "~/content/site";
import { uz } from "~/i18n/uz";
import { faqLd, organizationLd, seo, websiteLd } from "~/lib/seo";
import { SectionRail } from "~/components/hairline/SectionRail";
import { useActiveSection } from "~/components/motion/hooks";
import { Brief } from "~/components/sections/Brief";
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
      <Brief />
    </>
  );
}

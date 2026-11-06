import type { Route } from "./+types/not-found";
import { i18nFor, localeFromPath, useI18n } from "~/i18n";
import { pageTitle, seo } from "~/lib/seo";
import { HairlineFigure } from "~/components/hairline/HairlineFigure";
import { ButtonLink } from "~/components/ui/Button";

export const meta: Route.MetaFunction = ({ location }) => {
  const { t, locale } = i18nFor(localeFromPath(location.pathname));
  return seo({ title: pageTitle(t.meta.notFoundTitle), description: t.notFound.text, path: "/404", noindex: true, locale });
};

/** Shared by the catch-all route and by unknown service/project slugs. */
export function NotFoundContent() {
  const { t } = useI18n();
  return (
    <div className="container-site">
      <div className="grid-site items-center gap-y-10 py-[clamp(64px,10vw,140px)]">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <p className="t-label text-ink-3">404</p>
          <h1 className="t-display mt-5">{t.notFound.title}</h1>
          <p className="t-lead mt-6 max-w-[40ch] text-ink-2">{t.notFound.text}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink to="/" arrow="right">
              {t.notFound.home}
            </ButtonLink>
            <ButtonLink to="/#xizmatlar" variant="secondary">
              {t.nav.services}
            </ButtonLink>
            <ButtonLink to="/#loyihalar" variant="secondary">
              {t.nav.projects}
            </ButtonLink>
          </div>
        </div>
        {/* data-js-only: hidden in the static 404.html, which ships without scripts. */}
        <div data-js-only="" className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
          <HairlineFigure name="plug" label={t.notFound.figureLabel} className="mx-auto w-full max-w-[320px] lg:max-w-[440px]" />
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}

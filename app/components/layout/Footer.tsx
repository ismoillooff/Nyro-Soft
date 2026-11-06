import { LocaleLink as Link } from "~/components/ui/LocaleLink";
import { services } from "~/content/services";
import { site } from "~/content/site";
import { useI18n } from "~/i18n";
import { Arrow } from "~/components/ui/Button";
import { Hairline } from "~/components/hairline/Hairline";
import { Wordmark } from "./Logo";

const linkClass =
  "inline-flex min-h-11 items-center text-ink-2 transition-colors duration-[180ms] hover:text-ink md:min-h-9";

export function Footer() {
  const { t, l } = useI18n();
  const pageLinks = [
    { to: "/#xizmatlar", label: t.nav.services },
    { to: "/#loyihalar", label: t.nav.projects },
    { to: "/#yondashuv", label: t.nav.approach },
    { to: "/#savollar", label: t.nav.faq },
    { to: "/#brif", label: t.nav.brief },
  ];
  const hasContacts = site.contacts.length > 0 || site.social.length > 0;

  return (
    <footer className="relative mt-auto">
      <div className="container-site">
        <Hairline tone="strong" />
        <div className="grid-site gap-y-10 pt-14 pb-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Wordmark />
            <p className="mt-4 text-ink-2">{l(site.tagline)}</p>
          </div>
          <nav aria-label={t.a11y.footerNav} className="col-span-4 grid grid-cols-2 gap-6 md:col-span-8 lg:col-span-8 lg:grid-cols-3">
            <div>
              <h2 className="t-label mb-3 text-ink-3">{t.footer.page}</h2>
              <ul>
                {pageLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="t-label mb-3 text-ink-3">{t.footer.services}</h2>
              <ul>
                {services.map((s) => (
                  <li key={s.slug}>
                    <Link to={`/xizmatlar/${s.slug}`} viewTransition className={linkClass}>
                      {l(s.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {hasContacts && (
              <div className="col-span-2 lg:col-span-1">
                <h2 className="t-label mb-3 text-ink-3">{t.footer.contacts}</h2>
                <ul>
                  {site.contacts.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} className={linkClass}>
                        {c.value}
                      </a>
                    </li>
                  ))}
                  {site.social.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} className={linkClass} rel="noopener noreferrer" target="_blank">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
        </div>
        <Hairline />
        <div className="flex items-center justify-between py-5 text-[0.875rem] text-ink-3">
          <p className="tabular">© {__BUILD_YEAR__} Nyro Soft</p>
          <a href="#top" className="group/btn inline-flex min-h-11 items-center gap-1.5 hover:text-ink">
            {t.footer.toTop}
            <Arrow kind="up" />
          </a>
        </div>
      </div>
    </footer>
  );
}

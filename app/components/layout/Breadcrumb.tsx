import { Link } from "react-router";
import { useI18n } from "~/i18n";

export interface Crumb {
  readonly label: string;
  /** Omit for the current page. */
  readonly to?: string;
}

/** "Bosh sahifa / Xizmatlar / Web platformalar". The JSON-LD twin lives in the route's meta. */
export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t.a11y.breadcrumb}>
      <ol className="t-label flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-3">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="inline-flex min-h-11 items-center hover:text-ink md:min-h-8">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-2">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A section of an inner page: tighter rhythm than the home page, labelled by its h2. */
export function PageSection({
  id,
  title,
  children,
  className,
  note,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  note?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={className ?? "py-[clamp(56px,7vw,96px)]"}>
      <h2 id={`${id}-title`} className="t-h2 max-w-[22ch]">
        {title}
      </h2>
      {note && <p className="t-label mt-4 text-ink-3">{note}</p>}
      <div className="mt-10 md:mt-12">{children}</div>
    </section>
  );
}

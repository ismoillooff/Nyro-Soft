import { principles } from "~/content/principles";
import { homeSections } from "~/content/sections";
import { team } from "~/content/team";
import { useI18n } from "~/i18n";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";

/**
 * Real people only. In development, placeholder entries are shown with a
 * clear label; production ships `ready` members, or — when there are none —
 * the studio's working principles. No generated faces.
 */
export function Team() {
  const { t, l } = useI18n();
  const meta = homeSections.team;
  const ready = team.filter((m) => m.status === "ready");
  const members = import.meta.env.DEV ? team : ready;
  const showPrinciples = members.length === 0;

  return (
    <Section id={meta.id} titleId="jamoa-title">
      <SectionHeading
        titleId="jamoa-title"
        number={meta.number}
        label={l(meta.label)}
        title={t.team.title}
        lead={showPrinciples ? t.team.principlesLead : undefined}
      />

      {members.length > 0 && (
        <RevealGroup as="ul" className="mt-12 grid gap-x-[var(--gap)] gap-y-10 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <div className="relative aspect-[4/5] border border-line-strong bg-surface">
                {member.photo ? (
                  <img
                    src={member.photo.src}
                    width={member.photo.width}
                    height={member.photo.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center border border-dashed border-line-strong m-4 t-label text-center text-ink-3 px-4">
                    {t.team.placeholder}
                  </span>
                )}
              </div>
              <p className="t-h3 mt-4">{member.name}</p>
              <p className="mt-1 text-ink-2">{l(member.role)}</p>
              {member.status === "placeholder" && <p className="t-label mt-2 text-accent-strong">{t.team.placeholder}</p>}
            </li>
          ))}
        </RevealGroup>
      )}

      {showPrinciples && (
        <RevealGroup as="dl" className="mt-12 grid border-t border-line md:mt-16 md:grid-cols-2 md:gap-x-[var(--gap)]">
          {principles.map((p, i) => (
            <div key={i} className="border-b border-line py-7 md:py-9">
              <dt className="t-h3">{l(p.title)}</dt>
              <dd className="mt-3 max-w-[48ch] text-ink-2">{l(p.text)}</dd>
            </div>
          ))}
        </RevealGroup>
      )}
    </Section>
  );
}

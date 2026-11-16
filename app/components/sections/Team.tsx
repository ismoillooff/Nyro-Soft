import { principles } from "~/content/principles";
import { homeSections } from "~/content/sections";
import { team } from "~/content/team";
import { useI18n } from "~/i18n";
import { Section, SectionHeading } from "~/components/layout/Section";
import { RevealGroup } from "~/components/motion/Reveal";

/**
 * "How we approach product quality": the working principles, each with what
 * we actually do — no badges, no guarantees. Real team members (status
 * "ready", real photos) are listed after the principles once they exist;
 * placeholders are shown only in development, clearly labelled.
 */
export function Team() {
  const { t, l } = useI18n();
  const meta = homeSections.quality;
  const members = import.meta.env.DEV ? team : team.filter((m) => m.status === "ready");

  return (
    <Section id={meta.id} titleId="sifat-title">
      <SectionHeading titleId="sifat-title" number={meta.number} label={l(meta.label)} title={t.quality.title} lead={t.quality.lead} />

      <RevealGroup as="ul" className="mt-12 grid gap-px border border-line-strong bg-line md:mt-16 md:grid-cols-2 lg:grid-cols-3">
        {principles.map((p, i) => (
          <li key={i} className="flex flex-col bg-bg p-6 md:p-7">
            <p className="t-label flex items-center justify-between gap-3 text-ink-3">
              <span>{l(p.tag)}</span>
              <span>{String(i + 1).padStart(2, "0")}</span>
            </p>
            <h3 className="t-h3 mt-8">{l(p.title)}</h3>
            <p className="mt-3 max-w-[44ch] text-ink-2">{l(p.text)}</p>
          </li>
        ))}
      </RevealGroup>

      {members.length > 0 && (
        <div className="mt-16">
          <h3 className="t-h3">{t.team.title}</h3>
          <RevealGroup as="ul" className="mt-8 grid gap-x-[var(--gap)] gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
                    <span className="t-label absolute inset-0 m-4 flex items-center justify-center border border-dashed border-line-strong px-4 text-center text-ink-3">
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
        </div>
      )}
    </Section>
  );
}

import type { ReactNode } from "react";
import { Reveal, RevealGroup } from "~/components/motion/Reveal";
import { cn } from "~/lib/cn";

/** A page section: labelled by its h2, anchored below the sticky header. */
export function Section({
  id,
  titleId,
  className,
  children,
  container = true,
}: {
  id: string;
  titleId: string;
  className?: string;
  children: ReactNode;
  container?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={titleId} className={cn("section-y relative", className)}>
      {container ? <div className="container-site">{children}</div> : children}
    </section>
  );
}

/**
 * Mono label ("02 — Xizmatlar"), h2 (lines reveal one by one, 60ms) and an
 * optional lead. Titles given as an array render one block line each.
 */
export function SectionHeading({
  titleId,
  number,
  label,
  title,
  lead,
  className,
  as: Heading = "h2",
}: {
  titleId: string;
  number?: string;
  label?: string;
  title: string | readonly string[];
  lead?: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  const lines = typeof title === "string" ? [title] : title;
  return (
    <RevealGroup className={cn("max-w-[52rem]", className)} itemSelector="[data-reveal-line]">
      {label && (
        <p data-reveal-line="" className="t-label mb-5 text-ink-3">
          {number ? `${number} — ${label}` : label}
        </p>
      )}
      <Heading id={titleId} className={Heading === "h1" ? "t-display" : "t-h2"}>
        {lines.map((line) => (
          <span key={line} data-reveal-line="" className="block">
            {line}
          </span>
        ))}
      </Heading>
      {lead && (
        <p data-reveal-line="" className="t-lead mt-5 max-w-[46ch] text-ink-2">
          {lead}
        </p>
      )}
    </RevealGroup>
  );
}

export { Reveal };

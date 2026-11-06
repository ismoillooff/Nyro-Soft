import { fmt, useI18n } from "~/i18n";
import { cn } from "~/lib/cn";
import { BRIEF_STEP_COUNT, type BriefStepIndex } from "~/lib/brief/types";

/** Four hairline segments: done = ink, active = accent, ahead = line. The text carries the meaning. */
export function BriefProgress({ step, title }: { step: BriefStepIndex; title: string }) {
  const { t } = useI18n();
  return (
    <div className="mb-8">
      <p className="t-label flex flex-wrap items-baseline gap-x-2 text-ink-3">
        <span className="tabular">{fmt(t.brief.progress, { n: step + 1, total: BRIEF_STEP_COUNT })}</span>
        <span aria-hidden="true">·</span>
        <span className="text-ink-2">{title}</span>
      </p>
      <div aria-hidden="true" className="mt-3 grid grid-cols-4 gap-1.5">
        {Array.from({ length: BRIEF_STEP_COUNT }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-px transition-colors duration-[240ms] ease-(--ease-out)",
              i === step ? "bg-accent" : i < step ? "bg-ink" : "bg-line-strong",
            )}
          />
        ))}
      </div>
    </div>
  );
}

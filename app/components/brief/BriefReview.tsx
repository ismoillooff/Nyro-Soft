import { fmt, useI18n } from "~/i18n";
import type { UiDict } from "~/i18n/uz";
import { summarize, type BriefSummaryRow, type BriefTextLabels } from "~/lib/brief/format";
import type { BriefData, BriefStepIndex } from "~/lib/brief/types";

export function briefLabels(tb: UiDict["brief"]): BriefTextLabels {
  return {
    fileTitle: tb.fileTitle,
    stepService: tb.stepService,
    about: tb.about,
    stage: tb.stage,
    link: tb.link,
    budget: tb.budget,
    timeline: tb.timeline,
    name: tb.name,
    phone: tb.phone,
    telegram: tb.telegram,
    email: tb.email,
    preferred: tb.preferred,
    notProvided: tb.notProvided,
  };
}

function Block({
  title,
  rows,
  step,
  onEdit,
}: {
  title: string;
  rows: readonly BriefSummaryRow[];
  step: BriefStepIndex;
  onEdit: (step: BriefStepIndex) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="border-t border-line py-4">
      <div className="flex items-center justify-between gap-4">
        <h5 className="t-label text-ink-3">{title}</h5>
        <button
          type="button"
          onClick={() => onEdit(step)}
          aria-label={fmt(t.brief.editStep, { step: title })}
          className="-mr-2 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-2 text-[0.875rem] text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-[180ms] hover:decoration-ink"
        >
          {t.brief.edit}
        </button>
      </div>
      <dl className="mt-1 grid gap-2">
        {rows.map((r) => (
          <div key={r.label} className="grid gap-0.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-4">
            <dt className="text-[0.875rem] text-ink-3">{r.label}</dt>
            <dd className="min-w-0 text-[0.9375rem] break-words whitespace-pre-line text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** All answers so far, each block with "Tahrirlash" back to its step. */
export function BriefReview({ data, onEdit }: { data: BriefData; onEdit: (step: BriefStepIndex) => void }) {
  const { t, l } = useI18n();
  const tb = t.brief;
  const s = summarize(data, briefLabels(tb), l);
  return (
    <section aria-labelledby="brief-review-title" className="mt-2">
      <h4 id="brief-review-title" className="mb-2 text-[0.9375rem] font-medium text-ink">
        {tb.review}
      </h4>
      <Block title={tb.stepService} rows={s.service} step={0} onEdit={onEdit} />
      <Block title={tb.stepProject} rows={s.project} step={1} onEdit={onEdit} />
      <Block title={tb.stepBudget} rows={s.budget} step={2} onEdit={onEdit} />
    </section>
  );
}

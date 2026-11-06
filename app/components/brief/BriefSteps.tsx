import type { Dispatch, Ref } from "react";
import { briefBudgets, briefContactMethods, briefServices, briefStages, briefTimelines, type BriefOption } from "~/content/brief";
import { fmt, useI18n } from "~/i18n";
import type { BriefAction, BriefState } from "~/lib/brief/reducer";
import type { BriefStepIndex, BriefTextField, ErrorSlot } from "~/lib/brief/types";
import { ABOUT_MIN } from "~/lib/brief/validate";
import { Chip } from "~/components/ui/Chip";
import { FieldError, TextAreaField, TextField } from "~/components/ui/Field";
import { BriefReview } from "./BriefReview";

/** The element that receives focus for each error slot. */
export function slotDomId(slot: ErrorSlot): string {
  switch (slot) {
    case "services":
      return `brief-service-${briefServices[0]?.value ?? "web"}`;
    case "contact":
      return "brief-phone";
    default:
      return `brief-${slot}`;
  }
}

export interface StepProps {
  state: BriefState;
  dispatch: Dispatch<BriefAction>;
  headingRef: Ref<HTMLHeadingElement>;
}

export function StepHeading({ step, title, headingRef }: { step: BriefStepIndex; title: string; headingRef: Ref<HTMLHeadingElement> }) {
  return (
    <h3 id={`brief-step-${step}`} ref={headingRef} tabIndex={-1} className="t-h3 rounded-[var(--radius-sm)]">
      {title}
    </h3>
  );
}

function useFieldProps(state: BriefState, dispatch: Dispatch<BriefAction>) {
  return (field: BriefTextField) => ({
    value: state.data[field],
    onChange: (e: { currentTarget: { value: string } }) => dispatch({ type: "change", field, value: e.currentTarget.value }),
    onBlur: () => dispatch({ type: "blur", field }),
  });
}

function ChoiceGroup({
  legend,
  marker,
  name,
  type,
  options,
  isChecked,
  onChange,
  errorId,
  error,
  columns = 2,
}: {
  legend: string;
  marker?: string;
  name: string;
  type: "checkbox" | "radio";
  options: readonly BriefOption[];
  isChecked: (value: string) => boolean;
  onChange: (value: string) => void;
  errorId?: string;
  error?: string | null;
  columns?: 1 | 2;
}) {
  const { l } = useI18n();
  return (
    <fieldset aria-describedby={error && errorId ? errorId : undefined} className="min-w-0">
      <legend className="mb-3 flex w-full items-baseline justify-between gap-3 text-[0.9375rem] font-medium text-ink">
        <span>{legend}</span>
        {marker && <span className="t-label font-normal text-ink-3">{marker}</span>}
      </legend>
      <div className={columns === 2 ? "grid gap-2.5 md:grid-cols-2" : "grid gap-2.5"}>
        {options.map((o) => (
          <Chip
            key={o.value}
            type={type}
            id={`brief-${name}-${o.value}`}
            name={name}
            value={o.value}
            checked={isChecked(o.value)}
            onChange={onChange}
            invalid={Boolean(error)}
            describedBy={error && errorId ? errorId : undefined}
          >
            {l(o.label)}
          </Chip>
        ))}
      </div>
      {error && errorId && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

export function StepService({ state, dispatch, headingRef }: StepProps) {
  const { t } = useI18n();
  const tb = t.brief;
  return (
    <div className="grid gap-8">
      <StepHeading step={0} title={tb.stepService} headingRef={headingRef} />
      <ChoiceGroup
        legend={tb.serviceLegend}
        marker={tb.required}
        name="service"
        type="checkbox"
        options={briefServices}
        isChecked={(v) => state.data.services.includes(v)}
        onChange={(value) => dispatch({ type: "toggleService", value })}
        errorId="brief-services-error"
        error={state.errors.services ? tb.errors.services : null}
      />
    </div>
  );
}

export function StepProject({ state, dispatch, headingRef }: StepProps) {
  const { t } = useI18n();
  const tb = t.brief;
  const field = useFieldProps(state, dispatch);
  const count = state.data.about.trim().length;
  return (
    <div className="grid gap-8">
      <StepHeading step={1} title={tb.stepProject} headingRef={headingRef} />
      <div>
        <TextAreaField
          id="brief-about"
          name="about"
          label={tb.about}
          marker={tb.required}
          hint={tb.aboutHint}
          error={state.errors.about ? tb.errors.about : null}
          placeholder={tb.aboutPlaceholder}
          rows={5}
          aria-required="true"
          {...field("about")}
        />
        <p aria-hidden="true" className="t-label mt-1 text-right text-ink-3">
          {fmt(tb.charCount, { n: count, min: ABOUT_MIN })}
        </p>
      </div>
      <ChoiceGroup
        legend={tb.stage}
        marker={tb.optional}
        name="stage"
        type="radio"
        options={briefStages}
        isChecked={(v) => state.data.stage === v}
        onChange={(value) => dispatch({ type: "change", field: "stage", value })}
        columns={1}
      />
      <TextField
        id="brief-link"
        name="link"
        type="url"
        inputMode="url"
        autoComplete="url"
        spellCheck={false}
        autoCapitalize="none"
        label={tb.linkLabel}
        marker={tb.optional}
        hint={tb.linkHint}
        placeholder={tb.linkPlaceholder}
        error={state.errors.link ? tb.errors.link : null}
        {...field("link")}
      />
    </div>
  );
}

export function StepBudget({ state, dispatch, headingRef }: StepProps) {
  const { t } = useI18n();
  const tb = t.brief;
  return (
    <div className="grid gap-8">
      <StepHeading step={2} title={tb.stepBudget} headingRef={headingRef} />
      <div>
        <ChoiceGroup
          legend={tb.budget}
          marker={tb.optional}
          name="budget"
          type="radio"
          options={briefBudgets}
          isChecked={(v) => state.data.budget === v}
          onChange={(value) => dispatch({ type: "change", field: "budget", value })}
        />
      </div>
      <ChoiceGroup
        legend={tb.timeline}
        marker={tb.optional}
        name="timeline"
        type="radio"
        options={briefTimelines}
        isChecked={(v) => state.data.timeline === v}
        onChange={(value) => dispatch({ type: "change", field: "timeline", value })}
      />
    </div>
  );
}

export function StepContact({ state, dispatch, headingRef, onEdit }: StepProps & { onEdit: (step: BriefStepIndex) => void }) {
  const { t } = useI18n();
  const tb = t.brief;
  const field = useFieldProps(state, dispatch);
  const contactError = state.errors.contact ? "brief-contact-error" : undefined;
  return (
    <div className="grid gap-8">
      <StepHeading step={3} title={tb.stepContact} headingRef={headingRef} />
      <TextField
        id="brief-name"
        name="name"
        autoComplete="name"
        label={tb.name}
        marker={tb.required}
        placeholder={tb.namePlaceholder}
        error={state.errors.name ? tb.errors.name : null}
        aria-required="true"
        {...field("name")}
      />

      <fieldset aria-describedby={contactError} className="min-w-0">
        <legend className="mb-3 text-[0.9375rem] font-medium text-ink">{tb.contactLegend}</legend>
        {contactError && (
          <div className="-mt-1 mb-4">
            <FieldError id={contactError}>{tb.errors.contact}</FieldError>
          </div>
        )}
        <div className="grid gap-5">
          <TextField
            id="brief-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            label={tb.phone}
            placeholder={tb.phonePlaceholder}
            describedByExtra={contactError}
            error={state.errors.phone ? tb.errors.phone : null}
            {...field("phone")}
          />
          <TextField
            id="brief-telegram"
            name="telegram"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            label={tb.telegram}
            placeholder={tb.telegramPlaceholder}
            describedByExtra={contactError}
            error={state.errors.telegram ? tb.errors.telegram : null}
            {...field("telegram")}
          />
          <TextField
            id="brief-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            label={tb.email}
            placeholder={tb.emailPlaceholder}
            describedByExtra={contactError}
            error={state.errors.email ? tb.errors.email : null}
            {...field("email")}
          />
        </div>
      </fieldset>

      <ChoiceGroup
        legend={tb.preferred}
        marker={tb.optional}
        name="preferred"
        type="radio"
        options={briefContactMethods}
        isChecked={(v) => state.data.preferred === v}
        onChange={(value) => dispatch({ type: "change", field: "preferred", value })}
        columns={1}
      />

      {/* Honeypot: invisible to people and assistive tech, tempting to bots. Checked server-side. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="brief-website">{tb.honeypot}</label>
        <input
          id="brief-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={state.data.website}
          onChange={(e) => dispatch({ type: "change", field: "website", value: e.currentTarget.value })}
        />
      </div>

      <BriefReview data={state.data} onEdit={onEdit} />
    </div>
  );
}

import { AnimatePresence, m } from "motion/react";
import { useCallback, useEffect, useMemo, useReducer, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useLocation } from "react-router";
import { useI18n } from "~/i18n";
import { dist, dur, ease } from "~/motion/tokens";
import { serviceValueFromParam } from "~/lib/brief/format";
import { briefReducer, initialBriefState } from "~/lib/brief/reducer";
import { createSubmitter, submitBrief } from "~/lib/brief/submitter";
import { LAST_STEP, type BriefStepIndex } from "~/lib/brief/types";
import { firstInvalid } from "~/lib/brief/validate";
import { useReducedMotionPref } from "~/components/motion/hooks";
import { Button } from "~/components/ui/Button";
import { BriefProgress } from "./BriefProgress";
import { ErrorNotice, SuccessPanel, UnconfiguredPanel, useBriefExport } from "./BriefResult";
import { slotDomId, StepBudget, StepContact, StepProject, StepService } from "./BriefSteps";

/** Step change: ±16px in the direction of travel plus opacity; opacity only under reduced motion. */
const variants = {
  enter: ({ d, reduce }: { d: 1 | -1; reduce: boolean }) => ({ opacity: 0, x: reduce ? 0 : dist.reveal * d }),
  center: { opacity: 1, x: 0 },
  exit: ({ d, reduce }: { d: 1 | -1; reduce: boolean }) => ({ opacity: 0, x: reduce ? 0 : -dist.reveal * d }),
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="size-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
    />
  );
}

export function BriefForm() {
  const { t } = useI18n();
  const tb = t.brief;
  const submitter = useMemo(() => createSubmitter(), []);
  const [state, dispatch] = useReducer(briefReducer, undefined, initialBriefState);
  const reduce = useReducedMotionPref();
  const { search } = useLocation();
  const exportTools = useBriefExport(state.data);

  const stepTitles = [tb.stepService, tb.stepProject, tb.stepBudget, tb.stepContact] as const;

  /* ?xizmat=<slug> preselects a service — after mount and on every later
     client navigation to a new query; never during render or hydration. */
  useEffect(() => {
    const value = serviceValueFromParam(new URLSearchParams(search).get("xizmat"));
    if (value) dispatch({ type: "preselect", service: value });
  }, [search]);

  /* After a failed "Davom etish" / submit, focus the first invalid field. */
  const errorsRef = useRef(state.errors);
  errorsRef.current = state.errors;
  useEffect(() => {
    if (state.attempt === 0) return;
    const slot = firstInvalid(errorsRef.current);
    if (slot) document.getElementById(slotDomId(slot))?.focus();
  }, [state.attempt, state.step]);

  /* The step heading takes focus once the previous step has finished leaving
     (mode="wait" mounts the new step only after the exit completes). */
  const focusHeading = useRef(false);
  const stepRef = useRef(state.step);
  stepRef.current = state.step;
  const headingRef = useCallback((el: HTMLHeadingElement | null) => {
    if (el && focusHeading.current) {
      focusHeading.current = false;
      el.focus();
    }
  }, []);
  const onExitComplete = useCallback(() => {
    if (!focusHeading.current) return;
    const el = document.getElementById(`brief-step-${stepRef.current}`);
    if (el) {
      focusHeading.current = false;
      el.focus();
    }
  }, []);

  /* One request per "submitting" state. Data is read from a ref: it is locked while sending. */
  const dataRef = useRef(state.data);
  dataRef.current = state.data;
  useEffect(() => {
    if (state.status !== "submitting" || !state.idempotencyKey) return;
    const controller = new AbortController();
    let live = true;
    void submitBrief(submitter, dataRef.current, { idempotencyKey: state.idempotencyKey, signal: controller.signal }).then(
      (result) => {
        if (live) dispatch({ type: "submitResult", result });
      },
    );
    return () => {
      live = false;
      controller.abort();
    };
  }, [state.status, state.idempotencyKey, submitter]);

  /* Unconfigured: move focus to the panel (its text is read on focus, so it is not repeated in the live region). */
  const unconfiguredRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "unconfigured") unconfiguredRef.current?.focus();
  }, [state.status]);

  const goNext = () => {
    focusHeading.current = true;
    dispatch({ type: "next" });
  };
  const goBack = () => {
    if (state.status === "submitting") return;
    focusHeading.current = true;
    dispatch({ type: "back" });
  };
  const goto = (step: BriefStepIndex) => {
    focusHeading.current = true;
    dispatch({ type: "goto", step });
  };
  const submit = () => {
    focusHeading.current = false;
    dispatch({ type: "submit", key: crypto.randomUUID(), configured: submitter.configured });
  };

  // A failed "next" keeps the step: the heading must not steal focus from the invalid field.
  useEffect(() => {
    focusHeading.current = false;
  }, [state.attempt]);

  /* Enter on steps 1–3 = "Davom etish" (implicit submission). On the last
     step only an explicit activation of the send button sends. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.step < LAST_STEP) goNext();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter" || state.step !== LAST_STEP) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT") e.preventDefault();
  };

  const submitting = state.status === "submitting";
  const live =
    state.status === "submitting"
      ? tb.submitting
      : exportTools.notice === "copied"
          ? tb.copied
          : exportTools.notice === "copyFailed"
            ? tb.copyFailed
            : exportTools.notice === "downloaded"
              ? tb.downloaded
              : "";

  if (state.status === "success") {
    return (
      <>
        <div role="status" aria-live="polite" className="sr-only">
          {tb.success}
        </div>
        <SuccessPanel reference={state.reference} onRestart={() => dispatch({ type: "reset" })} />
      </>
    );
  }

  const StepComponent = [StepService, StepProject, StepBudget][state.step] ?? StepService;
  const primaryLabel =
    state.step < LAST_STEP ? tb.next : !submitter.configured ? tb.finish : state.status === "error" ? tb.retry : tb.submit;

  return (
    <form noValidate aria-label={tb.formLabel} onSubmit={onSubmit} onKeyDown={onKeyDown} className="min-w-0">
      <BriefProgress step={state.step} title={stepTitles[state.step]} />

      <AnimatePresence mode="wait" initial={false} custom={{ d: state.direction, reduce }} onExitComplete={onExitComplete}>
        <m.div
          key={state.step}
          custom={{ d: state.direction, reduce }}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: dur.ui, ease: ease.out }}
        >
          {state.step === LAST_STEP ? (
            <StepContact state={state} dispatch={dispatch} headingRef={headingRef} onEdit={goto} />
          ) : (
            <StepComponent state={state} dispatch={dispatch} headingRef={headingRef} />
          )}
        </m.div>
      </AnimatePresence>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        {state.step > 0 && (
          <Button variant="secondary" onClick={goBack} aria-disabled={submitting || undefined} className="flex-1 sm:flex-none">
            {tb.back}
          </Button>
        )}
        {state.step < LAST_STEP ? (
          <Button type="submit" arrow="right" className="flex-1 sm:ml-auto sm:flex-none">
            {primaryLabel}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => !submitting && submit()}
            aria-disabled={submitting || undefined}
            aria-busy={submitting || undefined}
            className="flex-1 sm:ml-auto sm:flex-none"
            arrow={submitting ? undefined : "up-right"}
          >
            {submitting && <Spinner />}
            {submitting ? tb.submitting : primaryLabel}
          </Button>
        )}
      </div>

      {state.status === "error" && (
        <ErrorNotice
          onCopy={exportTools.copy}
          onDownload={exportTools.download}
          copied={exportTools.notice === "copied"}
        />
      )}
      {state.status === "unconfigured" && (
        <UnconfiguredPanel
          panelRef={unconfiguredRef}
          onCopy={exportTools.copy}
          onDownload={exportTools.download}
          copied={exportTools.notice === "copied"}
        />
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {live}
      </div>
    </form>
  );
}

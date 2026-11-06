import type { SubmitFailure, SubmitResult } from "./submitter";
import {
  EMPTY_BRIEF,
  LAST_STEP,
  type BriefData,
  type BriefErrors,
  type BriefStepIndex,
  type BriefTextField,
} from "./types";
import { hasErrors, slotForField, slotInvalid, validateAll, validateStep } from "./validate";

export type BriefStatus = "idle" | "submitting" | "success" | "error" | "unconfigured";

/**
 * The brief's whole state. Values live only in memory: nothing is written to
 * localStorage or sessionStorage, so contact data never outlives the tab.
 */
export interface BriefState {
  readonly step: BriefStepIndex;
  /** 1 forward, -1 back: drives the step transition. */
  readonly direction: 1 | -1;
  readonly data: BriefData;
  readonly errors: BriefErrors;
  /** Increments on every failed "Davom etish" / submit, so the UI can move focus to the first invalid field. */
  readonly attempt: number;
  readonly status: BriefStatus;
  /** One key per brief; reused on every retry of the same answers. */
  readonly idempotencyKey: string | null;
  readonly reference: string | null;
  readonly failure: SubmitFailure | null;
}

export type BriefAction =
  | { type: "change"; field: BriefTextField; value: string }
  | { type: "toggleService"; value: string }
  | { type: "blur"; field: BriefTextField }
  | { type: "next" }
  | { type: "back" }
  | { type: "goto"; step: BriefStepIndex }
  | { type: "preselect"; service: string }
  | { type: "submit"; key: string; configured: boolean }
  | { type: "submitResult"; result: SubmitResult }
  | { type: "reset" };

export function initialBriefState(): BriefState {
  return {
    step: 0,
    direction: 1,
    data: EMPTY_BRIEF,
    errors: {},
    attempt: 0,
    status: "idle",
    idempotencyKey: null,
    reference: null,
    failure: null,
  };
}

/** Re-checks the errors already on screen, so a fixed field clears as the visitor types. */
function recheck(errors: BriefErrors, data: BriefData): BriefErrors {
  const next: BriefErrors = {};
  for (const slot of Object.keys(errors) as (keyof BriefErrors)[]) if (slotInvalid(slot, data)) next[slot] = true;
  return next;
}

/** Answers changed after a failed send: it is a new brief now, not a retry. */
function afterEdit(state: BriefState, data: BriefData): BriefState {
  const locked = state.status === "submitting" || state.status === "success";
  if (locked) return state;
  return {
    ...state,
    data,
    errors: recheck(state.errors, data),
    status: state.status === "error" || state.status === "unconfigured" ? "idle" : state.status,
    idempotencyKey: state.status === "error" ? null : state.idempotencyKey,
    failure: null,
  };
}

const clampStep = (n: number): BriefStepIndex => Math.max(0, Math.min(LAST_STEP, n)) as BriefStepIndex;

export function briefReducer(state: BriefState, action: BriefAction): BriefState {
  switch (action.type) {
    case "change": {
      if (state.data[action.field] === action.value) return state;
      return afterEdit(state, { ...state.data, [action.field]: action.value });
    }

    case "toggleService": {
      const has = state.data.services.includes(action.value);
      const services = has ? state.data.services.filter((v) => v !== action.value) : [...state.data.services, action.value];
      return afterEdit(state, { ...state.data, services });
    }

    case "blur": {
      const slot = slotForField(action.field);
      if (!slot) return state;
      // An empty optional field is not an error; `name` and `about` are required.
      const invalid = slotInvalid(slot, state.data);
      if (invalid === Boolean(state.errors[slot])) return state;
      const errors = { ...state.errors };
      if (invalid) errors[slot] = true;
      else delete errors[slot];
      return { ...state, errors };
    }

    case "next": {
      if (state.status === "submitting" || state.status === "success") return state;
      const errors = validateStep(state.step, state.data);
      if (hasErrors(errors)) return { ...state, errors: { ...state.errors, ...errors }, attempt: state.attempt + 1 };
      if (state.step === LAST_STEP) return state;
      return { ...state, step: clampStep(state.step + 1), direction: 1, errors: {} };
    }

    case "back": {
      if (state.step === 0 || state.status === "submitting" || state.status === "success") return state;
      return { ...state, step: clampStep(state.step - 1), direction: -1 };
    }

    case "goto": {
      if (action.step === state.step || state.status === "submitting" || state.status === "success") return state;
      return { ...state, step: action.step, direction: action.step > state.step ? 1 : -1 };
    }

    case "preselect": {
      if (state.data.services.includes(action.service) || state.status === "submitting" || state.status === "success") {
        return state;
      }
      // "Hali bilmayman" gives way to a concrete choice that came from a link.
      const services = [...state.data.services.filter((v) => v !== "unknown"), action.service];
      return afterEdit(state, { ...state.data, services });
    }

    case "submit": {
      // Double-submit guard: one request at a time, and nothing after success.
      if (state.status === "submitting" || state.status === "success") return state;
      const { errors, step } = validateAll(state.data);
      if (step !== null) {
        return {
          ...state,
          errors,
          attempt: state.attempt + 1,
          step,
          direction: step < state.step ? -1 : state.direction,
        };
      }
      if (!action.configured) return { ...state, errors: {}, status: "unconfigured", failure: null };
      return {
        ...state,
        errors: {},
        status: "submitting",
        failure: null,
        idempotencyKey: state.idempotencyKey ?? action.key,
      };
    }

    case "submitResult": {
      if (state.status !== "submitting") return state;
      return action.result.ok
        ? { ...state, status: "success", reference: action.result.reference ?? null, failure: null }
        : { ...state, status: "error", failure: action.result.reason };
    }

    case "reset":
      return initialBriefState();
  }
}

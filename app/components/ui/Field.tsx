import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

/** ids for the hint and the error, and the aria-describedby that joins them. */
export function fieldDescribedBy(id: string, opts: { hint?: boolean; error?: boolean; extra?: string | undefined }): string | undefined {
  const ids = [opts.hint ? `${id}-hint` : null, opts.error ? `${id}-error` : null, opts.extra ?? null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

/**
 * 48px controls, 16px text (no iOS zoom on focus). Invalid fields switch to
 * an ink border and carry an icon + text message — never colour alone.
 */
export function controlClass(invalid: boolean, extra?: string): string {
  return cn(
    "block w-full min-h-12 rounded-[var(--radius-md)] border bg-surface px-4 text-[1rem] leading-6 text-ink",
    "placeholder:text-ink-3 transition-colors duration-[180ms] ease-(--ease-out)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    invalid ? "border-ink" : "border-line-strong hover:border-[color-mix(in_oklab,var(--ink)_40%,transparent)]",
    extra,
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-[0.875rem] leading-5 text-ink">
      <AlertCircle aria-hidden="true" strokeWidth={1.5} className="mt-px size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function FieldHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[0.875rem] leading-5 text-ink-3">
      {children}
    </p>
  );
}

interface LabelProps {
  htmlFor: string;
  label: ReactNode;
  /** Shown after the label in mono, e.g. "majburiy" / "ixtiyoriy". */
  marker?: string;
}

export function FieldLabel({ htmlFor, label, marker }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-3 text-[0.9375rem] font-medium text-ink">
      <span>{label}</span>
      {marker && <span className="t-label font-normal text-ink-3">{marker}</span>}
    </label>
  );
}

interface CommonFieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  marker?: string;
  /** Another element's id to add to aria-describedby (e.g. a group error). */
  describedByExtra?: string;
  className?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  marker,
  describedByExtra,
  className,
  inputRef,
  ...input
}: CommonFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & { inputRef?: Ref<HTMLInputElement> }) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} marker={marker} />
      <input
        ref={inputRef}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, { hint: Boolean(hint), error: Boolean(error), extra: describedByExtra })}
        className={controlClass(Boolean(error))}
        {...input}
      />
      {hint && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  error,
  marker,
  describedByExtra,
  className,
  ...area
}: CommonFieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className">) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} label={label} marker={marker} />
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, { hint: Boolean(hint), error: Boolean(error), extra: describedByExtra })}
        className={controlClass(Boolean(error), "min-h-36 resize-y py-3")}
        {...area}
      />
      {hint && <FieldHint id={`${id}-hint`}>{hint}</FieldHint>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

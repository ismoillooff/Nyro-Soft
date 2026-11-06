import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

interface ChipProps {
  type: "checkbox" | "radio";
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
}

/**
 * A large (≥48px) choice built on a real <input type="checkbox|radio">: the
 * native control keeps keyboard, form and screen-reader behaviour (Space
 * toggles, arrows walk a radio group); the chip only draws it. The focus
 * ring sits on the whole chip. The selected indicator is the one accent.
 */
export function Chip({ type, id, name, value, checked, onChange, children, invalid, describedBy, className }: ChipProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex min-h-12 cursor-pointer select-none items-center gap-3 rounded-[var(--radius-md)] border bg-surface px-4 py-3",
        "text-[0.9375rem] leading-5 text-ink transition-colors duration-[180ms] ease-(--ease-out)",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-accent",
        checked ? "border-ink" : "border-line-strong hover:border-[color-mix(in_oklab,var(--ink)_40%,transparent)]",
        className,
      )}
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[18px] shrink-0 place-items-center border transition-colors duration-[180ms]",
          type === "radio" ? "rounded-full" : "rounded-[5px]",
          checked ? "border-accent bg-accent" : "border-line-strong bg-bg",
        )}
      >
        {checked &&
          (type === "checkbox" ? (
            <Check strokeWidth={2.25} className="size-3 text-white" />
          ) : (
            <span className="size-1.5 rounded-full bg-white" />
          ))}
      </span>
      <span className="min-w-0">{children}</span>
    </label>
  );
}

import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "~/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "link";
export type ArrowKind = "up-right" | "down" | "up" | "right";

const ARROWS: Record<ArrowKind, { Icon: LucideIcon; shift: string }> = {
  "up-right": {
    Icon: ArrowUpRight,
    shift: "group-hover/btn:translate-x-[2px] group-hover/btn:-translate-y-[2px] group-focus-visible/btn:translate-x-[2px] group-focus-visible/btn:-translate-y-[2px]",
  },
  down: { Icon: ArrowDown, shift: "group-hover/btn:translate-y-[3px] group-focus-visible/btn:translate-y-[3px]" },
  up: { Icon: ArrowUp, shift: "group-hover/btn:-translate-y-[3px] group-focus-visible/btn:-translate-y-[3px]" },
  right: { Icon: ArrowRight, shift: "group-hover/btn:translate-x-[3px] group-focus-visible/btn:translate-x-[3px]" },
};

const BASE =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-medium " +
  "transition-[background-color,border-color,color,text-decoration-color] duration-[180ms] ease-(--ease-out) " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "h-12 rounded-[var(--radius-md)] bg-ink px-5 text-[0.9375rem] text-white md:h-11 hover:bg-[color-mix(in_oklab,var(--ink)_86%,white)] active:bg-ink",
  secondary:
    "h-12 rounded-[var(--radius-md)] border border-line-strong bg-surface px-5 text-[0.9375rem] text-ink md:h-11 hover:border-[color-mix(in_oklab,var(--ink)_40%,transparent)]",
  link:
    "min-h-11 px-0 text-[0.9375rem] text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string): string {
  return cn(BASE, VARIANTS[variant], className);
}

/** The arrow glyph: decorative, shifts 2–3px on hover and focus (180ms). */
export function Arrow({ kind, className }: { kind: ArrowKind; className?: string }) {
  const { Icon, shift } = ARROWS[kind];
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn(
        "size-[1.05em] shrink-0 transition-transform duration-[180ms] ease-(--ease-out) motion-reduce:transition-none motion-reduce:transform-none",
        shift,
        className,
      )}
    />
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  arrow?: ArrowKind;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", arrow, className, children, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={buttonClass(variant, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow kind={arrow} />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...rest}>
      {children}
      {arrow && <Arrow kind={arrow} />}
    </button>
  );
}

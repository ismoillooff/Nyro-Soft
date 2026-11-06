import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LinkProps } from "react-router";
import { LocaleLink as Link } from "./LocaleLink";
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

export type ButtonSize = "md" | "sm";

const SIZES: Record<ButtonSize, string> = {
  md: "h-12 px-5 md:h-11",
  sm: "h-11 px-4 md:h-10",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "rounded-[var(--radius-md)] bg-ink text-[0.9375rem] text-white hover:bg-[color-mix(in_oklab,var(--ink)_86%,white)] active:bg-ink",
  secondary:
    "rounded-[var(--radius-md)] border border-line-strong bg-surface text-[0.9375rem] text-ink hover:border-[color-mix(in_oklab,var(--ink)_40%,transparent)]",
  link:
    "min-h-11 px-0 text-[0.9375rem] text-ink underline decoration-line-strong decoration-1 underline-offset-4 hover:decoration-ink",
};

export function buttonClass(variant: ButtonVariant = "primary", className?: string, size: ButtonSize = "md"): string {
  return cn(BASE, VARIANTS[variant], variant === "link" ? undefined : SIZES[size], className);
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
  size?: ButtonSize;
  arrow?: ArrowKind;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", arrow, className, children, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={buttonClass(variant, className, size)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow kind={arrow} />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button type={type} className={buttonClass(variant, className, size)} {...rest}>
      {children}
      {arrow && <Arrow kind={arrow} />}
    </button>
  );
}

import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

/** A small mono tag (tech stack, "Konsept loyiha"). Not interactive. */
export function Tag({ children, className, tone = "default" }: { children: ReactNode; className?: string; tone?: "default" | "soft" }) {
  return (
    <span
      className={cn(
        "t-label inline-flex h-7 items-center rounded-[var(--radius-sm)] border px-2.5 text-ink-2",
        tone === "default" ? "border-line bg-surface" : "border-transparent bg-surface-soft text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function VisuallyHidden({ children, as: Tag = "span" }: { children: ReactNode; as?: "span" | "div" | "p" | "h2" }) {
  return <Tag className="sr-only">{children}</Tag>;
}

import type { CSSProperties, ReactNode } from "react";
import { cn } from "~/lib/cn";
import { HairlineBeam, type BeamTrigger } from "./HairlineBeam";

const TONE: Record<"default" | "strong" | "accent", string> = {
  default: "var(--line)",
  strong: "var(--line-strong)",
  accent: "var(--accent)",
};

/** A 1 CSS px rule. Decorative: hidden from assistive tech, never takes pointer or focus. */
export function Hairline({
  axis = "x",
  tone = "default",
  length,
  className,
  style,
}: {
  axis?: "x" | "y";
  tone?: keyof typeof TONE;
  /** Fixed length (px or CSS length); otherwise the line fills its parent. */
  length?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  const size =
    length === undefined
      ? axis === "x"
        ? "h-px w-full"
        : "h-full w-px"
      : axis === "x"
        ? "h-px"
        : "w-px";
  const dim = length === undefined ? undefined : axis === "x" ? { width: length } : { height: length };
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none block shrink-0", size, className)}
      style={{ background: TONE[tone], ...dim, ...style }}
    />
  );
}

/** One 9×9 "+" marker, its centre on the corner it marks. */
function Plus({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="9"
      height="9"
      viewBox="0 0 9 9"
      className={cn("pointer-events-none absolute block", className)}
    >
      <path
        d="M4.5 0V9M0 4.5H9"
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        shapeRendering="crispEdges"
      />
    </svg>
  );
}

/** A horizontal rule with "+" markers centred on both ends (hero → next section bridge). */
export function MarkedRule({ tone = "strong", className }: { tone?: keyof typeof TONE; className?: string }) {
  return (
    <div className={cn("relative h-px", className)}>
      <Hairline tone={tone} />
      <Plus className="-top-1 -left-1" />
      <Plus className="-top-1 -right-1" />
    </div>
  );
}

/**
 * "+" markers on the four corners of the nearest positioned ancestor. Each
 * reaches 4px outside the frame; containers keep ≥16px side padding, so they
 * never cause horizontal overflow.
 */
export function CornerMarks({ only }: { only?: "top" | "bottom" }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -inset-px">
      {only !== "bottom" && (
        <>
          <Plus className="-top-1 -left-1" />
          <Plus className="-top-1 -right-1" />
        </>
      )}
      {only !== "top" && (
        <>
          <Plus className="-bottom-1 -left-1" />
          <Plus className="-right-1 -bottom-1" />
        </>
      )}
    </span>
  );
}

/**
 * A 1px frame (--line-strong) whose inside is an opaque surface, so lines
 * behind it never show through (rule 09). Optional corner "+" marks and a beam
 * along the top edge.
 */
export function HairlineFrame({
  corners = false,
  beam = "none",
  surface = "surface",
  className,
  children,
  as: Tag = "div",
}: {
  corners?: boolean;
  beam?: "none" | Extract<BeamTrigger, "hover" | "inview">;
  surface?: "surface" | "bg" | "soft" | "none";
  className?: string;
  children?: ReactNode;
  as?: "div" | "figure" | "section";
}) {
  const bg =
    surface === "surface" ? "bg-surface" : surface === "bg" ? "bg-bg" : surface === "soft" ? "bg-surface-soft" : "";
  return (
    <Tag data-beam-host="" className={cn("relative border border-line-strong", bg, className)}>
      {corners && <CornerMarks />}
      {beam !== "none" && <HairlineBeam axis="x" trigger={beam} className="-top-px right-0 left-0" />}
      {children}
    </Tag>
  );
}

export type NodeState = "idle" | "active" | "done";

/** A small node on a hairline: idle (ring), active (accent), done (ink). */
export function HairlineNode({ state = "idle", className }: { state?: NodeState; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={cn(
        "pointer-events-none relative inline-block size-[9px] shrink-0 rounded-full border transition-colors duration-[180ms] ease-(--ease-out)",
        state === "idle" && "border-line-strong bg-bg",
        state === "active" && "border-accent bg-bg",
        state === "done" && "border-ink bg-ink",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-[2px] rounded-full transition-opacity duration-[180ms]",
          state === "active" ? "bg-accent opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}

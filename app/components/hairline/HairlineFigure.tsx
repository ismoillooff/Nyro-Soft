import { lazy, Suspense, type ComponentType } from "react";
import type { FigureName } from "~/content/services";
import { useHydrated } from "~/components/motion/hooks";
import { cn } from "~/lib/cn";

type FigureProps = {
  intensity?: number;
  theme?: "auto" | "light" | "dark";
  label?: string;
  className?: string;
};

/** Each figure is its own lazy import; Vite shares the package chunk between them. */
const FIGURES: Record<Exclude<FigureName, never>, ComponentType<FigureProps>> = {
  laptop: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Laptop }))),
  phone: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Phone }))),
  exploded: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Exploded }))),
  settle: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Settle }))),
  drawer: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Drawer }))),
  query: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Query }))),
  plug: lazy(() => import("@lucasmarkes/hairline/react").then((m) => ({ default: m.Plug }))),
};

export type FigureSurface = "bg" | "surface" | "soft";

/**
 * A pointer-answering Hairline figure in a 5:4 box. The box is in the
 * prerendered HTML (CLS 0); the drawing loads as a separate chunk after
 * hydration. Never with `play` — only the hero N plays (spec §5.3).
 */
export function HairlineFigure({
  name,
  label,
  surface = "bg",
  intensity = 0.5,
  className,
}: {
  name: FigureName;
  label: string;
  surface?: FigureSurface;
  intensity?: number;
  className?: string;
}) {
  const hydrated = useHydrated();
  const Figure = FIGURES[name];
  const box = <div className="aspect-[5/4] w-full" />;
  return (
    <div className={cn("hl-figure", className)} data-surface={surface}>
      {hydrated ? (
        <Suspense fallback={box}>
          <Figure theme="light" intensity={intensity} label={label} />
        </Suspense>
      ) : (
        box
      )}
    </div>
  );
}

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "~/lib/cn";

/**
 * Before/after comparison. Both layers share one box; the "after" layer is cut
 * with clip-path so it shows on the left up to --pos (value = its share). The control is a native range input
 * (label + aria-valuetext); the visible handle follows it. Dragging uses
 * pointer capture and touch-action: pan-y, so vertical page scroll still works
 * on phones. Keys: arrows ±1%, Shift ±10%, Home/End.
 */
export function CompareSlider({
  before,
  after,
  label,
  valueText,
  initial = 50,
  className,
}: {
  before: ReactNode;
  after: ReactNode;
  label: string;
  /** e.g. (v) => `Dizayn qismi: ${v}%` */
  valueText: (value: number) => string;
  initial?: number;
  className?: string;
}) {
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const dragging = useRef(false);
  const [focused, setFocused] = useState(false);

  const fromClientX = (x: number) => {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    setPos(Math.round(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100))));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    fromClientX(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromClientX(e.clientX);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = pos + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos - step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    setPos(Math.min(100, Math.max(0, next)));
  };

  // The "after" layer shows on the left [0, pos]: the value is its visible share.
  const designShare = pos;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={boxRef}
        className="relative size-full cursor-ew-resize touch-pan-y overflow-hidden select-none"
        style={{ "--pos": `${pos}%` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="absolute inset-0">{before}</div>
        <div className="absolute inset-0" style={{ clipPath: "inset(0 calc(100% - var(--pos)) 0 0)" }}>
          {after}
        </div>
        {/* Handle: a hairline with a round grip. Decorative; the input below is the control. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-ink" style={{ left: "var(--pos)" }}>
          <span
            className={cn(
              "absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-surface shadow-[var(--shadow-1)]",
              focused && "outline-2 outline-offset-2 outline-accent outline-solid",
            )}
          >
            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 6 3 10l4 4M13 6l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        aria-valuetext={valueText(designShare)}
        onChange={(e) => setPos(Number(e.target.value))}
        onKeyDown={onKeyDown}
        onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
        onBlur={() => setFocused(false)}
        className="compare-input absolute inset-x-0 bottom-0 h-11 w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

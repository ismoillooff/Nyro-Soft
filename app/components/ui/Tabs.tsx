import { m } from "motion/react";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "~/lib/cn";
import { spring } from "~/motion/tokens";

export interface TabItem {
  readonly id: string;
  readonly label: string;
}

/**
 * WAI-ARIA tabs with automatic activation: ←/→ move and select, Home/End jump.
 * The 1px accent indicator travels between tabs (layoutId). Panels are
 * rendered by the caller with `panelProps(id)`.
 */
export function useTabs(items: readonly TabItem[], value: string, onChange: (id: string) => void, label: string) {
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;

  const select = (index: number) => {
    const item = items[(index + items.length) % items.length];
    if (!item) return;
    onChange(item.id);
    refs.current[item.id]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = items.findIndex((it) => it.id === value);
    if (e.key === "ArrowRight") select(i + 1);
    else if (e.key === "ArrowLeft") select(i - 1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(items.length - 1);
    else return;
    e.preventDefault();
  };

  const list = (className?: string, indicatorId = `${base}-indicator`): ReactNode => (
    <div role="tablist" aria-label={label} className={cn("relative flex", className)}>
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[item.id] = el;
            }}
            id={tabId(item.id)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={panelId(item.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={onKeyDown}
            className={cn(
              "relative inline-flex h-12 items-center px-4 text-[0.9375rem] transition-colors duration-[180ms] outline-offset-[-2px] md:px-5",
              selected ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {item.label}
            {selected && (
              <m.span
                layoutId={indicatorId}
                transition={spring.ui}
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-px bg-accent"
              />
            )}
          </button>
        );
      })}
    </div>
  );

  const panelProps = (id: string) => ({
    id: panelId(id),
    role: "tabpanel" as const,
    "aria-labelledby": tabId(id),
    hidden: id !== value,
    tabIndex: 0,
  });

  return { list, panelProps };
}

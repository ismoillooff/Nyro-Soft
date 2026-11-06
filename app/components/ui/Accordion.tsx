import { AnimatePresence, m } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "~/lib/cn";
import { ease } from "~/motion/tokens";

export interface AccordionItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/**
 * Disclosure list: each question is <h3><button aria-expanded aria-controls>,
 * each answer a region labelled by its button. Closed panels are unmounted, so
 * screen readers never read them. Several can be open. height:auto + opacity
 * over 260ms is the one allowed layout animation (spec §6.7).
 */
export function Accordion({ items, headingLevel = "h3" }: { items: readonly AccordionItem[]; headingLevel?: "h2" | "h3" }) {
  const base = useId();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const H = headingLevel;
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="border-t border-line">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const buttonId = `${base}-${item.id}-q`;
        const panelId = `${base}-${item.id}-a`;
        return (
          <div key={item.id} className="border-b border-line">
            <H className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="group flex min-h-14 w-full items-center justify-between gap-6 py-5 text-left text-[1.0625rem] font-medium tracking-[-0.01em] outline-offset-[-2px] md:text-[1.1875rem]"
              >
                <span>{item.question}</span>
                <Plus
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={cn(
                    "size-5 shrink-0 text-ink-2 transition-transform duration-[260ms] ease-(--ease-out) motion-reduce:transition-none",
                    isOpen && "rotate-45 text-ink",
                  )}
                />
              </button>
            </H>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: ease.out }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[60ch] pr-10 pb-6 text-ink-2">{item.answer}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

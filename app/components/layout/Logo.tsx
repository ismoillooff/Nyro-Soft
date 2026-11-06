import { cn } from "~/lib/cn";

/** The geometric N: two stems and a diagonal, 24px. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24" className={cn("shrink-0", className)}>
      <path fill="currentColor" d="M4 20V4h4.4L16 14.6V4h4v16h-4.4L8 9.4V20z" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-[-0.02em]", className)}>
      <LogoMark />
      <span className="text-[1.0625rem] leading-none">Nyro Soft</span>
    </span>
  );
}

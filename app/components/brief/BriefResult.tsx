import { Copy, Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type Ref } from "react";
import { site } from "~/content/site";
import { fmt, useI18n } from "~/i18n";
import { briefToText } from "~/lib/brief/format";
import type { BriefData } from "~/lib/brief/types";
import { Button } from "~/components/ui/Button";
import { briefLabels } from "./BriefReview";

/** Clipboard API first; a hidden textarea + execCommand where it is missing (http, older WebViews). */
async function copyText(text: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  const previous = document.activeElement as HTMLElement | null;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.inset = "0 auto auto 0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  } finally {
    previous?.focus({ preventScroll: true });
  }
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ExportNotice = "copied" | "copyFailed" | "downloaded" | null;

/** Copy / .txt download of the answers, with a short-lived notice for the live region. */
export function useBriefExport(data: BriefData) {
  const { t, l } = useI18n();
  const [notice, setNotice] = useState<ExportNotice>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = useCallback((n: ExportNotice) => {
    setNotice(n);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 2500);
  }, []);

  const text = () => briefToText(data, briefLabels(t.brief), l);
  return {
    notice,
    copy: async () => flash((await copyText(text())) ? "copied" : "copyFailed"),
    download: () => {
      downloadText(text(), t.brief.fileName);
      flash("downloaded");
    },
  };
}

function ExportButtons({ onCopy, onDownload, copied }: { onCopy: () => void; onDownload: () => void; copied: boolean }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap gap-2.5">
      <Button variant="secondary" onClick={onCopy} className="flex-1 sm:flex-none">
        <Copy aria-hidden="true" strokeWidth={1.5} className="size-4" />
        {copied ? t.brief.copied : t.brief.copy}
      </Button>
      <Button variant="secondary" onClick={onDownload} className="flex-1 sm:flex-none">
        <Download aria-hidden="true" strokeWidth={1.5} className="size-4" />
        {t.brief.download}
      </Button>
    </div>
  );
}

function Contacts() {
  const { t } = useI18n();
  if (site.contacts.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="t-label mb-2 text-ink-3">{t.brief.contactsTitle}</p>
      <ul className="grid gap-1">
        {site.contacts.map((c) => (
          <li key={c.href}>
            <a href={c.href} className="inline-flex min-h-11 items-center text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {c.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** No endpoint configured: say so plainly and hand the answers over. Never "sent". */
export function UnconfiguredPanel({
  panelRef,
  onCopy,
  onDownload,
  copied,
}: {
  panelRef: Ref<HTMLDivElement>;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}) {
  const { t } = useI18n();
  return (
    <div ref={panelRef} tabIndex={-1} className="mt-8 rounded-[var(--radius-sm)] border-t border-line-strong pt-6">
      <p className="mb-5 max-w-[52ch] text-ink">{t.brief.unconfigured}</p>
      <ExportButtons onCopy={onCopy} onDownload={onDownload} copied={copied} />
      <Contacts />
    </div>
  );
}

/** A failed send: the answers stay, retry keeps the same idempotency key. */
export function ErrorNotice({ onCopy, onDownload, copied }: { onCopy: () => void; onDownload: () => void; copied: boolean }) {
  const { t } = useI18n();
  return (
    <div className="mt-8 border-t border-line-strong pt-6">
      <p role="alert" className="mb-5 max-w-[52ch] text-ink">
        {t.brief.error}
      </p>
      <ExportButtons onCopy={onCopy} onDownload={onDownload} copied={copied} />
      <Contacts />
    </div>
  );
}

export function SuccessPanel({ reference, onRestart }: { reference: string | null; onRestart: () => void }) {
  const { t } = useI18n();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="py-4">
      <p className="t-label text-ink-3">{t.brief.formLabel}</p>
      <h3 ref={headingRef} tabIndex={-1} className="t-h3 mt-3 rounded-[var(--radius-sm)]">
        {t.brief.successTitle}
      </h3>
      <p className="mt-3 max-w-[48ch] text-ink-2">{t.brief.success}</p>
      {reference && <p className="t-label mt-4 text-ink">{fmt(t.brief.reference, { ref: reference })}</p>}
      <Button variant="secondary" onClick={onRestart} className="mt-8">
        {t.brief.restart}
      </Button>
    </div>
  );
}

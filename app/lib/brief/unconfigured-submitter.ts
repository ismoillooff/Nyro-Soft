import type { BriefSubmitter, SubmitResult } from "./submitter";

/**
 * Used when VITE_BRIEF_ENDPOINT is not set. It never sends anything and never
 * reports success: the UI checks `configured` and offers copy / .txt download
 * (plus real contacts from content/site.ts, if any) instead.
 */
export class UnconfiguredBriefSubmitter implements BriefSubmitter {
  readonly configured = false;

  submit(): Promise<SubmitResult> {
    return Promise.resolve({ ok: false, reason: "rejected" });
  }
}

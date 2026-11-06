import { HttpBriefSubmitter } from "./http-submitter";
import type { BriefData } from "./types";
import { UnconfiguredBriefSubmitter } from "./unconfigured-submitter";

export type SubmitFailure = "network" | "timeout" | "server" | "rejected";

export type SubmitResult = { ok: true; reference?: string } | { ok: false; reason: SubmitFailure };

export interface BriefSubmitter {
  readonly configured: boolean;
  submit(data: BriefData, opts: { signal: AbortSignal; idempotencyKey: string }): Promise<SubmitResult>;
}

export const SUBMIT_TIMEOUT_MS = 15_000;

/**
 * Picks the adapter from VITE_BRIEF_ENDPOINT (a public URL of your own backend).
 * No endpoint → the unconfigured adapter, which never reports success.
 */
export function createSubmitter(endpoint: string | undefined = import.meta.env.VITE_BRIEF_ENDPOINT): BriefSubmitter {
  const url = endpoint?.trim();
  return url ? new HttpBriefSubmitter(url) : new UnconfiguredBriefSubmitter();
}

/**
 * Runs one attempt with a hard timeout (AbortController, 15s by default).
 * Whatever the adapter does, the promise settles by the deadline, so the UI
 * never stays in "submitting". An outside `signal` (unmount) aborts too.
 */
export function submitBrief(
  submitter: BriefSubmitter,
  data: BriefData,
  opts: { idempotencyKey: string; signal?: AbortSignal; timeoutMs?: number },
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? SUBMIT_TIMEOUT_MS;
  const onOuterAbort = () => controller.abort();
  opts.signal?.addEventListener("abort", onOuterAbort);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<SubmitResult>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ ok: false, reason: "timeout" });
    }, timeoutMs);
  });

  const attempt = submitter
    .submit(data, { signal: controller.signal, idempotencyKey: opts.idempotencyKey })
    .catch((): SubmitResult => ({ ok: false, reason: "network" }));

  return Promise.race([attempt, deadline]).finally(() => {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onOuterAbort);
  });
}

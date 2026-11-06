import { toPayload } from "./format";
import type { BriefSubmitter, SubmitResult } from "./submitter";
import type { BriefData } from "./types";

type FetchLike = (input: string, init: RequestInit) => Promise<Response>;

/**
 * POSTs the brief as JSON to your own endpoint, with an Idempotency-Key
 * header (the same key on every retry of one brief). Success only on a real
 * 2xx. 408 → timeout, other 4xx → rejected, 5xx → server, thrown → network,
 * aborted → timeout. Secrets never live here: the endpoint forwards to
 * Telegram/email on the server (docs/brief-endpoint.md).
 */
export class HttpBriefSubmitter implements BriefSubmitter {
  readonly configured = true;
  readonly endpoint: string;
  readonly fetchImpl: FetchLike;

  constructor(endpoint: string, fetchImpl?: FetchLike) {
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl ?? ((input, init) => fetch(input, init));
  }

  async submit(data: BriefData, opts: { signal: AbortSignal; idempotencyKey: string }): Promise<SubmitResult> {
    const page = typeof window === "undefined" ? null : window.location.href;
    const locale = typeof document === "undefined" ? "uz" : document.documentElement.lang || "uz";
    let res: Response;
    try {
      res = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Idempotency-Key": opts.idempotencyKey,
        },
        body: JSON.stringify(toPayload(data, { locale, page })),
        signal: opts.signal,
        credentials: "omit",
        mode: "cors",
      });
    } catch {
      return { ok: false, reason: opts.signal.aborted ? "timeout" : "network" };
    }

    if (res.status >= 200 && res.status < 300) {
      let reference: string | undefined;
      try {
        const body: unknown = await res.json();
        if (body && typeof body === "object" && "reference" in body && typeof body.reference === "string") {
          reference = body.reference;
        }
      } catch {
        // An empty or non-JSON 2xx body is still a success.
      }
      return reference ? { ok: true, reference } : { ok: true };
    }
    if (res.status === 408) return { ok: false, reason: "timeout" };
    if (res.status >= 400 && res.status < 500) return { ok: false, reason: "rejected" };
    return { ok: false, reason: "server" };
  }
}

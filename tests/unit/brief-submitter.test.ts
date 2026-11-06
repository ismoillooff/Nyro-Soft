import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpBriefSubmitter } from "~/lib/brief/http-submitter";
import { createSubmitter, submitBrief, type BriefSubmitter } from "~/lib/brief/submitter";
import { EMPTY_BRIEF, type BriefData } from "~/lib/brief/types";
import { UnconfiguredBriefSubmitter } from "~/lib/brief/unconfigured-submitter";

const DATA: BriefData = {
  ...EMPTY_BRIEF,
  services: ["web"],
  about: "Buyurtmalarni bitta tizimda yuritmoqchimiz",
  name: "Aziz",
  phone: "+998 90 123 45 67",
};

const opts = () => ({ signal: new AbortController().signal, idempotencyKey: "key-123" });

afterEach(() => {
  vi.useRealTimers();
});

describe("HttpBriefSubmitter", () => {
  it("POSTs JSON with the Idempotency-Key header", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ reference: "NS-1" }), { status: 201 }));
    const result = await new HttpBriefSubmitter("https://api.example.uz/brief", fetchImpl).submit(DATA, opts());
    expect(result).toEqual({ ok: true, reference: "NS-1" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.example.uz/brief");
    expect(init.method).toBe("POST");
    const headers = init.headers as Record<string, string>;
    expect(headers["Idempotency-Key"]).toBe("key-123");
    expect(headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(String(init.body));
    expect(body.services).toEqual(["web"]);
    expect(body.contact.phone).toBe("+998901234567");
    expect(body.website).toBe("");
  });

  it("treats an empty 2xx body as success", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 204 }));
    expect(await new HttpBriefSubmitter("/brief", fetchImpl).submit(DATA, opts())).toEqual({ ok: true });
  });

  it.each([
    [400, "rejected"],
    [422, "rejected"],
    [429, "rejected"],
    [408, "timeout"],
    [500, "server"],
    [503, "server"],
    [302, "server"],
  ])("maps HTTP %i to %s", async (status, reason) => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status }));
    expect(await new HttpBriefSubmitter("/brief", fetchImpl).submit(DATA, opts())).toEqual({ ok: false, reason });
  });

  it("maps a thrown fetch to network", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    expect(await new HttpBriefSubmitter("/brief", fetchImpl).submit(DATA, opts())).toEqual({ ok: false, reason: "network" });
  });
});

describe("submitBrief", () => {
  it("times out after 15s and aborts the request", async () => {
    vi.useFakeTimers();
    let seen: AbortSignal | undefined;
    const fetchImpl = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          seen = init.signal ?? undefined;
          init.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    const pending = submitBrief(new HttpBriefSubmitter("/brief", fetchImpl), DATA, { idempotencyKey: "k" });
    await vi.advanceTimersByTimeAsync(14_999);
    expect(seen?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual({ ok: false, reason: "timeout" });
    expect(seen?.aborted).toBe(true);
  });

  it("settles even when an adapter ignores the abort signal", async () => {
    vi.useFakeTimers();
    const stuck: BriefSubmitter = { configured: true, submit: () => new Promise(() => {}) };
    const pending = submitBrief(stuck, DATA, { idempotencyKey: "k", timeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toEqual({ ok: false, reason: "timeout" });
  });

  it("turns a throwing adapter into a network failure", async () => {
    const broken: BriefSubmitter = { configured: true, submit: () => Promise.reject(new Error("boom")) };
    expect(await submitBrief(broken, DATA, { idempotencyKey: "k" })).toEqual({ ok: false, reason: "network" });
  });

  it("passes the same key through on every attempt", async () => {
    const keys: string[] = [];
    const s: BriefSubmitter = {
      configured: true,
      submit: async (_d, o) => {
        keys.push(o.idempotencyKey);
        return { ok: false, reason: "server" };
      },
    };
    await submitBrief(s, DATA, { idempotencyKey: "same" });
    await submitBrief(s, DATA, { idempotencyKey: "same" });
    expect(keys).toEqual(["same", "same"]);
  });
});

describe("createSubmitter", () => {
  it("is unconfigured without an endpoint and never succeeds", async () => {
    const s = createSubmitter("");
    expect(s).toBeInstanceOf(UnconfiguredBriefSubmitter);
    expect(s.configured).toBe(false);
    expect((await s.submit(DATA, opts())).ok).toBe(false);
  });

  it("uses HTTP when an endpoint is set", () => {
    const s = createSubmitter(" https://api.example.uz/brief ");
    expect(s).toBeInstanceOf(HttpBriefSubmitter);
    expect((s as HttpBriefSubmitter).endpoint).toBe("https://api.example.uz/brief");
  });
});

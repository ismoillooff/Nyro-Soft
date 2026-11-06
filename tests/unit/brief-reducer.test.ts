import { describe, expect, it } from "vitest";
import { briefReducer, initialBriefState, type BriefAction, type BriefState } from "~/lib/brief/reducer";

const run = (actions: BriefAction[], from: BriefState = initialBriefState()) => actions.reduce(briefReducer, from);

const ABOUT = "Buyurtmalarni bitta tizimda yuritmoqchimiz";

/** A brief filled to the last step. */
function filled(): BriefState {
  return run([
    { type: "toggleService", value: "web" },
    { type: "next" },
    { type: "change", field: "about", value: ABOUT },
    { type: "next" },
    { type: "change", field: "budget", value: "unknown" },
    { type: "next" },
    { type: "change", field: "name", value: "Aziz" },
    { type: "change", field: "telegram", value: "@nyro_soft" },
  ]);
}

describe("briefReducer — steps", () => {
  it("blocks Davom etish with errors and counts the attempt", () => {
    const s = run([{ type: "next" }]);
    expect(s.step).toBe(0);
    expect(s.errors).toEqual({ services: true });
    expect(s.attempt).toBe(1);
  });

  it("moves forward and back, keeping every value", () => {
    const s = filled();
    expect(s.step).toBe(3);
    const back = run([{ type: "back" }, { type: "back" }], s);
    expect(back.step).toBe(1);
    expect(back.direction).toBe(-1);
    expect(back.data.about).toBe(ABOUT);
    expect(back.data.telegram).toBe("@nyro_soft");
    const forward = run([{ type: "next" }, { type: "next" }], back);
    expect(forward.step).toBe(3);
    expect(forward.direction).toBe(1);
    expect(forward.data.services).toEqual(["web"]);
  });

  it("jumps to a step from the review", () => {
    const s = run([{ type: "goto", step: 1 }], filled());
    expect(s.step).toBe(1);
    expect(s.direction).toBe(-1);
  });

  it("shows a field error on blur and clears it once fixed", () => {
    let s = run([{ type: "change", field: "phone", value: "123" }, { type: "blur", field: "phone" }]);
    expect(s.errors.phone).toBe(true);
    s = run([{ type: "change", field: "phone", value: "+998 90 123 45 67" }], s);
    expect(s.errors.phone).toBeUndefined();
  });

  it("does not flag an empty optional field on blur", () => {
    const s = run([{ type: "blur", field: "link" }]);
    expect(s.errors).toEqual({});
  });

  it("preselects a service from the URL without wiping answers", () => {
    let s = run([{ type: "toggleService", value: "unknown" }, { type: "change", field: "about", value: ABOUT }]);
    s = run([{ type: "preselect", service: "avtomatlashtirish" }], s);
    expect(s.data.services).toEqual(["avtomatlashtirish"]);
    expect(s.data.about).toBe(ABOUT);
    s = run([{ type: "toggleService", value: "web" }, { type: "preselect", service: "avtomatlashtirish" }], s);
    expect(s.data.services).toEqual(["avtomatlashtirish", "web"]);
  });
});

describe("briefReducer — sending", () => {
  it("sends only valid answers", () => {
    const s = run([{ type: "submit", key: "k1", configured: true }]);
    expect(s.status).toBe("idle");
    expect(s.step).toBe(0);
    expect(s.attempt).toBe(1);
  });

  it("blocks a second submit while sending", () => {
    const sending = run([{ type: "submit", key: "k1", configured: true }], filled());
    expect(sending.status).toBe("submitting");
    expect(sending.idempotencyKey).toBe("k1");
    const again = run([{ type: "submit", key: "k2", configured: true }], sending);
    expect(again).toBe(sending);
  });

  it("succeeds only on an ok result", () => {
    const sending = run([{ type: "submit", key: "k1", configured: true }], filled());
    const done = run([{ type: "submitResult", result: { ok: true, reference: "NS-42" } }], sending);
    expect(done.status).toBe("success");
    expect(done.reference).toBe("NS-42");
    // Nothing more after success.
    expect(run([{ type: "submit", key: "k9", configured: true }], done)).toBe(done);
  });

  it("keeps the answers and the idempotency key for a retry", () => {
    const failed = run(
      [
        { type: "submit", key: "k1", configured: true },
        { type: "submitResult", result: { ok: false, reason: "timeout" } },
      ],
      filled(),
    );
    expect(failed.status).toBe("error");
    expect(failed.failure).toBe("timeout");
    expect(failed.data.name).toBe("Aziz");
    const retry = run([{ type: "submit", key: "k2", configured: true }], failed);
    expect(retry.status).toBe("submitting");
    expect(retry.idempotencyKey).toBe("k1");
  });

  it("treats edited answers after an error as a new brief (new key)", () => {
    const failed = run(
      [
        { type: "submit", key: "k1", configured: true },
        { type: "submitResult", result: { ok: false, reason: "server" } },
        { type: "change", field: "name", value: "Aziz R." },
      ],
      filled(),
    );
    expect(failed.status).toBe("idle");
    expect(failed.idempotencyKey).toBeNull();
    expect(run([{ type: "submit", key: "k2", configured: true }], failed).idempotencyKey).toBe("k2");
  });

  it("never reports success without an endpoint", () => {
    const s = run([{ type: "submit", key: "k1", configured: false }], filled());
    expect(s.status).toBe("unconfigured");
    expect(s.idempotencyKey).toBeNull();
  });

  it("ignores a late result that is not for a pending send", () => {
    const s = run([{ type: "submitResult", result: { ok: true } }], filled());
    expect(s.status).toBe("idle");
  });

  it("starts over on reset", () => {
    const s = run([{ type: "reset" }], filled());
    expect(s).toEqual(initialBriefState());
  });
});

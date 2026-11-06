import { describe, expect, it } from "vitest";
import { EMPTY_BRIEF, type BriefData } from "~/lib/brief/types";
import {
  displayPhone,
  firstInvalid,
  isValidEmail,
  normalizeLink,
  normalizePhone,
  normalizeTelegram,
  validateAll,
  validateStep,
} from "~/lib/brief/validate";
import { briefToText, serviceValueFromParam, toPayload } from "~/lib/brief/format";

const brief = (over: Partial<BriefData>): BriefData => ({ ...EMPTY_BRIEF, ...over });

describe("normalizePhone", () => {
  it.each([
    ["+998 90 123 45 67", "+998901234567"],
    ["998901234567", "+998901234567"],
    ["+998 (90) 123-45-67", "+998901234567"],
    ["90 123 45 67", "+998901234567"],
    ["(90) 123-45-67", "+998901234567"],
    ["+7 912 345 67 89", "+79123456789"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it.each(["", "123", "+998 90 123 45", "+998 90 123 45 678", "nine-nine", "+998901234567x"])("rejects %j", (raw) => {
    expect(normalizePhone(raw)).toBeNull();
  });

  it("formats Uzbek numbers for display", () => {
    expect(displayPhone("+998901234567")).toBe("+998 90 123 45 67");
    expect(displayPhone("+79123456789")).toBe("+79123456789");
  });
});

describe("normalizeTelegram", () => {
  it.each([
    ["@nyro_soft", "@nyro_soft"],
    ["nyrosoft", "@nyrosoft"],
    ["https://t.me/nyro_soft", "@nyro_soft"],
    ["t.me/Nyro123", "@Nyro123"],
    ["  @abcde  ", "@abcde"],
  ])("accepts %s", (raw, expected) => {
    expect(normalizeTelegram(raw)).toBe(expected);
  });

  it.each(["abcd", "@abc", "a".repeat(33), "nyro-soft", "nyro soft", "ниро_софт"])("rejects %j", (raw) => {
    expect(normalizeTelegram(raw)).toBeNull();
  });

  it("accepts exactly 32 characters", () => {
    expect(normalizeTelegram("a".repeat(32))).toBe(`@${"a".repeat(32)}`);
  });
});

describe("isValidEmail", () => {
  it.each(["siz@kompaniya.uz", "a.b+c@mail.example.com"])("accepts %s", (raw) => expect(isValidEmail(raw)).toBe(true));
  it.each(["siz@", "siz@kompaniya", "@kompaniya.uz", "siz kompaniya@uz.uz", "siz@kompaniya.u"])("rejects %s", (raw) =>
    expect(isValidEmail(raw)).toBe(false),
  );
});

describe("normalizeLink", () => {
  it("adds https:// to a bare domain", () => {
    expect(normalizeLink("nyro.uz/brief")).toBe("https://nyro.uz/brief");
  });
  it("keeps http(s) URLs", () => {
    expect(normalizeLink("http://example.uz")).toBe("http://example.uz/");
  });
  it.each(["javascript:alert(1)", "ftp://example.uz", "localhost", "not a url", "mailto:a@b.uz"])("rejects %s", (raw) => {
    expect(normalizeLink(raw)).toBeNull();
  });
});

describe("validateStep", () => {
  it("step 1 needs at least one service", () => {
    expect(validateStep(0, brief({}))).toEqual({ services: true });
    expect(validateStep(0, brief({ services: ["unknown"] }))).toEqual({});
  });

  it("step 2 needs 20 characters and a valid optional link", () => {
    expect(validateStep(1, brief({ about: "qisqa" }))).toEqual({ about: true });
    const about = "Buyurtmalarni bitta tizimda yuritmoqchimiz";
    expect(validateStep(1, brief({ about }))).toEqual({});
    expect(validateStep(1, brief({ about, link: "javascript:alert(1)" }))).toEqual({ link: true });
  });

  it("step 3 has no required fields", () => {
    expect(validateStep(2, brief({}))).toEqual({});
  });

  it("step 4 needs a name and at least one valid channel", () => {
    expect(validateStep(3, brief({}))).toEqual({ name: true, contact: true });
    expect(validateStep(3, brief({ name: "Aziz", telegram: "@nyro_soft" }))).toEqual({});
    expect(validateStep(3, brief({ name: "Aziz", phone: "123", email: "x@" }))).toEqual({ phone: true, email: true });
  });

  it("validateAll reports the first broken step and focus order", () => {
    const result = validateAll(brief({ services: ["web"], about: "short", name: "" }));
    expect(result.step).toBe(1);
    expect(firstInvalid(result.errors)).toBe("about");
  });
});

describe("format", () => {
  it("maps a service page slug to its brief value", () => {
    expect(serviceValueFromParam("biznesni-avtomatlashtirish")).toBe("avtomatlashtirish");
    expect(serviceValueFromParam("web")).toBe("web");
    expect(serviceValueFromParam("nope")).toBeNull();
    expect(serviceValueFromParam(null)).toBeNull();
  });

  it("builds a normalized payload", () => {
    const p = toPayload(
      brief({
        services: ["web"],
        about: "  Buyurtmalarni bitta tizimda yuritmoqchimiz  ",
        link: "nyro.uz",
        name: " Aziz ",
        phone: "90 123 45 67",
        telegram: "t.me/nyro_soft",
      }),
      { locale: "uz", page: null },
    );
    expect(p.about).toBe("Buyurtmalarni bitta tizimda yuritmoqchimiz");
    expect(p.link).toBe("https://nyro.uz/");
    expect(p.contact).toEqual({ name: "Aziz", phone: "+998901234567", telegram: "@nyro_soft", email: null, preferred: null });
    expect(p.stage).toBeNull();
    expect(p.website).toBe("");
  });

  it("renders a plain-text copy with labels", () => {
    const text = briefToText(
      brief({ services: ["web", "unknown"], budget: "unknown", name: "Aziz" }),
      {
        fileTitle: "Brif",
        stepService: "Xizmat turi",
        about: "Loyiha",
        stage: "Holat",
        link: "Havola",
        budget: "Budjet",
        timeline: "Muddat",
        name: "Ism",
        phone: "Telefon",
        telegram: "Telegram",
        email: "Email",
        preferred: "Afzal",
        notProvided: "—",
      },
      (v) => v.uz,
    );
    expect(text).toContain("Xizmat turi: Web platforma, Hali bilmayman");
    expect(text).toContain("Budjet: Hali aniq emas");
    expect(text).toContain("Ism: Aziz");
    expect(text).toContain("Telefon: —");
  });
});

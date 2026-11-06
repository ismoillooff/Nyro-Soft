import { cn } from "~/lib/cn";

/**
 * The "Mobil moliya ilovasi" concept as static screens, sized in em from the
 * container width like DashboardMock. Sample data only.
 */

const BUDGET = [
  { name: "Oziq-ovqat", spent: 1_840_000, limit: 2_500_000 },
  { name: "Transport", spent: 420_000, limit: 600_000 },
  { name: "Kommunal", spent: 610_000, limit: 650_000 },
  { name: "Ko‘ngilochar", spent: 150_000, limit: 500_000 },
] as const;

const TX = [
  { name: "Korzinka", cat: "Oziq-ovqat", sum: "−186 400" },
  { name: "Yandex Go", cat: "Transport", sum: "−24 000" },
  { name: "Ish haqi", cat: "Daromad", sum: "+7 500 000" },
  { name: "Elektr energiya", cat: "Kommunal", sum: "−142 000" },
] as const;

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

function HomeScreen() {
  return (
    <div className="flex size-full flex-col gap-[1em] p-[1.2em] pt-[2.4em]">
      <div>
        <p className="text-[0.8em] text-ink-3">Noyabr balansi</p>
        <p className="mt-[0.15em] text-[1.9em] font-semibold tracking-[-0.03em] tabular-nums">4 250 000</p>
        <p className="text-[0.8em] text-ink-3">so‘m · budjetning 59% sarflandi</p>
      </div>
      <div className="h-[0.45em] overflow-hidden rounded-full bg-[#EEF0F3]">
        <div className="h-full w-[59%] rounded-full bg-ink" />
      </div>
      <div className="flex flex-col">
        <p className="mb-[0.4em] text-[0.8em] text-ink-3">So‘nggi harakatlar</p>
        {TX.map((t) => (
          <div key={t.name} className="flex items-center justify-between border-b border-line py-[0.55em] last:border-b-0">
            <div>
              <p className="text-[0.9em]">{t.name}</p>
              <p className="text-[0.72em] text-ink-3">{t.cat}</p>
            </div>
            <p className={cn("text-[0.88em] tabular-nums", t.sum.startsWith("+") ? "text-accent-strong" : "text-ink")}>{t.sum}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-center">
        <span className="flex size-[3em] items-center justify-center rounded-full bg-ink text-[1.3em] leading-none text-white">+</span>
      </div>
    </div>
  );
}

function BudgetScreen() {
  return (
    <div className="flex size-full flex-col gap-[0.9em] p-[1.2em] pt-[2.4em]">
      <p className="text-[1.25em] font-semibold tracking-[-0.02em]">Budjet</p>
      {BUDGET.map((b) => {
        const pct = Math.round((b.spent / b.limit) * 100);
        return (
          <div key={b.name} className="rounded-[0.8em] border border-line p-[0.8em]">
            <div className="flex items-baseline justify-between">
              <p className="text-[0.9em]">{b.name}</p>
              <p className={cn("text-[0.78em] tabular-nums", pct >= 90 ? "text-accent-strong" : "text-ink-3")}>{pct}%</p>
            </div>
            <div className="mt-[0.5em] h-[0.4em] overflow-hidden rounded-full bg-[#EEF0F3]">
              <div className={cn("h-full rounded-full", pct >= 90 ? "bg-accent" : "bg-ink")} style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-[0.4em] text-[0.72em] text-ink-3 tabular-nums">
              {fmt(b.spent)} / {fmt(b.limit)} so‘m
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** A phone drawn with hairlines: rounded body, notch, opaque screen. */
export function PhoneFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative aspect-[9/19] rounded-[2.4em] border border-line-strong bg-surface p-[0.45em]", className)}>
      <div className="relative size-full overflow-hidden rounded-[2em] border border-line bg-surface">
        <span className="absolute top-[0.7em] left-1/2 z-10 h-[1.1em] w-[28%] -translate-x-1/2 rounded-full border border-line bg-bg" />
        {children}
      </div>
    </div>
  );
}

export function FinanceScreen({ screen }: { screen: "home" | "budget" }) {
  return screen === "home" ? <HomeScreen /> : <BudgetScreen />;
}

export function FinanceMock({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("@container size-full overflow-hidden bg-surface-soft text-ink select-none", className)}>
      <div className="flex size-full items-center justify-center gap-[3em]" style={{ fontSize: "clamp(3px, 1.3cqw, 13px)" }}>
        <PhoneFrame className="h-[86%] translate-y-[4%]">
          <HomeScreen />
        </PhoneFrame>
        <PhoneFrame className="h-[86%] -translate-y-[4%]">
          <BudgetScreen />
        </PhoneFrame>
      </div>
    </div>
  );
}

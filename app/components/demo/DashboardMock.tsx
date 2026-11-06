import { cn } from "~/lib/cn";
import { LogoMark } from "~/components/layout/Logo";

/**
 * The "Biznes boshqaruv platformasi" concept as a static picture. Every size
 * is in em and the root font-size follows the container width (cqw), so the
 * same markup works as a card thumbnail and as the full demo screen. The
 * "wire" variant draws the identical geometry as grey blocks, so the
 * wireframe and the design line up exactly under the compare slider.
 *
 * Sample data only.
 */

export const ORDERS = [
  { id: "1048", client: "Aziz Karimov", item: "Ofis kreslosi ×2", sum: "3 400 000", status: "new" },
  { id: "1047", client: "Dilnoza Rahimova", item: "Printer kartriji", sum: "420 000", status: "progress" },
  { id: "1046", client: "Jasur Toshmatov", item: "Monitor 27″", sum: "2 950 000", status: "done" },
  { id: "1045", client: "Madina Yusupova", item: "Qog‘oz A4 ×10", sum: "650 000", status: "progress" },
  { id: "1044", client: "Sardor Aliyev", item: "Klaviatura", sum: "380 000", status: "done" },
  { id: "1043", client: "Nodira Qodirova", item: "Stol lampasi", sum: "210 000", status: "cancelled" },
  { id: "1042", client: "Bekzod Ergashev", item: "Wi-Fi router", sum: "690 000", status: "done" },
  { id: "1041", client: "Gulnora Saidova", item: "Ofis stoli", sum: "1 850 000", status: "progress" },
] as const;

const WEEK = [
  { d: "Du", v: 48 },
  { d: "Se", v: 62 },
  { d: "Ch", v: 40 },
  { d: "Pa", v: 74 },
  { d: "Ju", v: 88 },
  { d: "Sh", v: 56 },
  { d: "Ya", v: 30 },
] as const;

export type OrderStatus = "new" | "progress" | "done" | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Yangi",
  progress: "Jarayonda",
  done: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

const KPIS = [
  { label: "Bugungi buyurtmalar", value: "48" },
  { label: "Jarayonda", value: "17" },
  { label: "Yetkazildi", value: "26" },
  { label: "Tushum, so‘m", value: "12,4 mln" },
] as const;

const NAV = ["Bosh sahifa", "Buyurtmalar", "Mijozlar", "Ombor", "Hisobotlar", "Sozlamalar"] as const;

/** A grey placeholder bar for the wireframe. */
function Bar({ w, className }: { w: string; className?: string }) {
  return <span className={cn("block h-[0.7em] rounded-[0.2em] bg-[#E4E7EC]", className)} style={{ width: w }} />;
}

/** A numbered annotation pin for the wireframe. */
function Pin({ n, label, className }: { n: number; label: string; className?: string }) {
  return (
    <span className={cn("absolute z-10 inline-flex items-center gap-[0.4em] font-mono text-[0.8em] text-ink-2", className)}>
      <span className="inline-flex size-[1.6em] items-center justify-center rounded-full border border-dashed border-ink-3 bg-surface text-[0.85em]">
        {n}
      </span>
      <span className="rounded-[0.3em] bg-surface px-[0.4em] py-[0.1em]">{label}</span>
    </span>
  );
}

export function StatusChip({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.4em] rounded-full border px-[0.6em] py-[0.15em] text-[0.8em] whitespace-nowrap",
        status === "new" && "border-[rgba(38,89,239,0.35)] bg-surface-soft text-accent-strong",
        status === "progress" && "border-line-strong bg-surface text-ink",
        status === "done" && "border-line bg-[#F2F4F7] text-ink-2",
        status === "cancelled" && "border-line bg-surface text-ink-3 line-through",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-[0.45em] rounded-full",
          status === "new" && "bg-accent",
          status === "progress" && "bg-ink",
          status === "done" && "bg-ink-3",
          status === "cancelled" && "bg-line-strong",
        )}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

function Wide({ wire }: { wire: boolean }) {
  return (
    <div className="flex size-full">
      {/* Sidebar */}
      <div className="relative flex w-[19%] shrink-0 flex-col gap-[0.35em] border-r border-line bg-[#FBFBF9] p-[1em]">
        {wire && <Pin n={1} label="Navigatsiya" className="top-[0.6em] left-[105%] whitespace-nowrap" />}
        <div className="mb-[1.2em] flex items-center gap-[0.5em]">
          {wire ? <span className="size-[1.6em] rounded-[0.3em] bg-[#E4E7EC]" /> : <LogoMark className="size-[1.6em]" />}
          {wire ? <Bar w="55%" /> : <span className="text-[0.95em] font-semibold">Nyro ERP</span>}
        </div>
        {NAV.map((item, i) => (
          <div
            key={item}
            className={cn(
              "flex items-center gap-[0.55em] rounded-[0.4em] px-[0.6em] py-[0.5em] text-[0.88em]",
              i === 1 && !wire && "bg-surface text-ink shadow-[0_0_0_1px_var(--line)]",
              i !== 1 && "text-ink-2",
            )}
          >
            <span className={cn("size-[0.9em] shrink-0 rounded-[0.2em]", wire ? "bg-[#E4E7EC]" : i === 1 ? "bg-accent" : "border border-ink-3")} />
            {wire ? <Bar w={`${50 + ((i * 13) % 30)}%`} /> : item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col gap-[1em] p-[1.4em]">
        <div className="flex items-center justify-between gap-[1em]">
          <div>
            {wire ? <Bar w="7em" className="h-[1.1em]" /> : <p className="text-[1.45em] font-semibold tracking-[-0.02em]">Buyurtmalar</p>}
            {wire ? <Bar w="11em" className="mt-[0.5em]" /> : <p className="mt-[0.2em] text-[0.85em] text-ink-3">Bugun, 14:30 holatiga</p>}
          </div>
          <div className="flex items-center gap-[0.6em]">
            <span className="flex h-[2.3em] w-[12em] items-center rounded-[0.45em] border border-line px-[0.7em] text-[0.85em] text-ink-3">
              {wire ? <Bar w="60%" /> : "Qidirish…"}
            </span>
            <span
              className={cn(
                "flex h-[2.3em] items-center rounded-[0.45em] px-[0.9em] text-[0.85em] whitespace-nowrap",
                wire ? "border border-dashed border-ink-3 text-ink-3" : "bg-ink text-white",
              )}
            >
              + Yangi buyurtma
            </span>
          </div>
        </div>

        <div className="relative grid grid-cols-4 gap-[0.8em]">
          {wire && <Pin n={2} label="Ko‘rsatkichlar" className="-top-[0.9em] left-[0.6em]" />}
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-[0.6em] border border-line bg-surface p-[0.9em]">
              {wire ? <Bar w="70%" /> : <p className="text-[0.8em] text-ink-3">{k.label}</p>}
              {wire ? (
                <Bar w="40%" className="mt-[0.7em] h-[1.3em]" />
              ) : (
                <p className="mt-[0.3em] text-[1.6em] font-semibold tracking-[-0.02em] tabular-nums">{k.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid h-[11em] shrink-0 grid-cols-[1.7fr_1fr] gap-[0.8em]">
          <div className="flex flex-col rounded-[0.6em] border border-line bg-surface p-[0.9em]">
            {wire ? <Bar w="30%" /> : <p className="text-[0.8em] text-ink-3">Haftalik tushum</p>}
            <div className="mt-[0.8em] flex min-h-0 flex-1 items-end gap-[0.9em]">
              {WEEK.map((w, i) => (
                <div key={w.d} className="flex h-full flex-1 flex-col items-center justify-end gap-[0.35em]">
                  <span
                    className={cn("block w-full rounded-[0.25em]", wire ? "bg-[#E4E7EC]" : i === 4 ? "bg-ink" : "bg-[#D5D9E0]")}
                    style={{ height: `${w.v}%` }}
                  />
                  {wire ? <Bar w="1.2em" className="h-[0.5em]" /> : <span className="text-[0.7em] text-ink-3">{w.d}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-[0.55em] rounded-[0.6em] border border-line bg-surface p-[0.9em]">
            {wire ? <Bar w="40%" /> : <p className="text-[0.8em] text-ink-3">Holatlar bo‘yicha</p>}
            {(
              [
                ["Yangi", 22, "bg-accent"],
                ["Jarayonda", 35, "bg-ink"],
                ["Yetkazildi", 54, "bg-ink-3"],
                ["Bekor qilindi", 6, "bg-line-strong"],
              ] as const
            ).map(([label, pct, color]) => (
              <div key={label} className="grid grid-cols-[6.5em_1fr_2.2em] items-center gap-[0.6em] text-[0.78em]">
                {wire ? <Bar w="80%" /> : <span className="text-ink-2">{label}</span>}
                <span className="block h-[0.45em] overflow-hidden rounded-full bg-[#EEF0F3]">
                  <span className={cn("block h-full rounded-full", wire ? "bg-[#D5D9E0]" : color)} style={{ width: `${pct}%` }} />
                </span>
                {wire ? <Bar w="100%" /> : <span className="text-right text-ink-3 tabular-nums">{pct}%</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[0.6em] border border-line bg-surface">
          {wire && <Pin n={3} label="Buyurtmalar ro‘yxati" className="top-[0.5em] right-[0.8em]" />}
          <div className="grid grid-cols-[4em_1.4fr_1.4fr_1fr_1.1fr] gap-[0.8em] border-b border-line px-[1em] py-[0.7em] text-[0.78em] text-ink-3">
            {["№", "Mijoz", "Mahsulot", "Summa", "Holat"].map((h) => (wire ? <Bar key={h} w="60%" /> : <span key={h}>{h}</span>))}
          </div>
          {ORDERS.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[4em_1.4fr_1.4fr_1fr_1.1fr] items-center gap-[0.8em] border-b border-line px-[1em] py-[0.62em] text-[0.86em] last:border-b-0"
            >
              {wire ? (
                <>
                  <Bar w="70%" />
                  <Bar w="80%" />
                  <Bar w="75%" />
                  <Bar w="60%" />
                  <Bar w="70%" className="h-[1.2em] rounded-full" />
                </>
              ) : (
                <>
                  <span className="font-mono text-ink-3 tabular-nums">#{o.id}</span>
                  <span className="truncate">{o.client}</span>
                  <span className="truncate text-ink-2">{o.item}</span>
                  <span className="tabular-nums">{o.sum}</span>
                  <span>
                    <StatusChip status={o.status} />
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Narrow({ wire }: { wire: boolean }) {
  return (
    <div className="flex size-full flex-col bg-surface">
      <div className="relative flex items-center justify-between border-b border-line px-[1.2em] py-[1em]">
        {wire && <Pin n={1} label="Navigatsiya" className="top-[2.6em] left-[1em]" />}
        <div className="flex items-center gap-[0.5em]">
          {wire ? <span className="size-[1.6em] rounded-[0.3em] bg-[#E4E7EC]" /> : <LogoMark className="size-[1.6em]" />}
          {wire ? <Bar w="5em" /> : <span className="text-[1em] font-semibold">Buyurtmalar</span>}
        </div>
        <span className={cn("rounded-[0.45em] px-[0.8em] py-[0.45em] text-[0.85em]", wire ? "border border-dashed border-ink-3 text-ink-3" : "bg-ink text-white")}>
          + Yangi
        </span>
      </div>
      <div className="relative grid grid-cols-2 gap-[0.7em] p-[1.2em]">
        {wire && <Pin n={2} label="Ko‘rsatkichlar" className="top-[0.2em] right-[1em]" />}
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-[0.6em] border border-line p-[0.8em]">
            {wire ? <Bar w="70%" /> : <p className="text-[0.8em] text-ink-3">{k.label}</p>}
            {wire ? <Bar w="45%" className="mt-[0.6em] h-[1.2em]" /> : <p className="mt-[0.2em] text-[1.4em] font-semibold tabular-nums">{k.value}</p>}
          </div>
        ))}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col gap-[0.6em] overflow-hidden px-[1.2em] pb-[1.2em]">
        {wire && <Pin n={3} label="Ro‘yxat" className="top-[0.4em] right-[1.4em]" />}
        {ORDERS.slice(0, 4).map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-[0.8em] rounded-[0.6em] border border-line p-[0.8em]">
            <div className="min-w-0">
              {wire ? <Bar w="7em" /> : <p className="truncate text-[0.95em]">{o.client}</p>}
              {wire ? (
                <Bar w="5em" className="mt-[0.5em]" />
              ) : (
                <p className="text-[0.8em] text-ink-3 tabular-nums">
                  #{o.id} · {o.sum} so‘m
                </p>
              )}
            </div>
            {wire ? <Bar w="4.5em" className="h-[1.3em] rounded-full" /> : <StatusChip status={o.status} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardMock({
  variant = "design",
  layout = "wide",
  className,
}: {
  variant?: "design" | "wire";
  /** "auto" switches to the phone layout when the container is narrower than 34rem. */
  layout?: "wide" | "auto";
  className?: string;
}) {
  const wire = variant === "wire";
  return (
    <div aria-hidden="true" className={cn("@container size-full overflow-hidden bg-surface text-ink select-none", className)}>
      {layout === "wide" ? (
        <div className="size-full" style={{ fontSize: "clamp(3px, 1.32cqw, 14px)" }}>
          <Wide wire={wire} />
        </div>
      ) : (
        <>
          <div className="size-full @max-[34rem]:hidden" style={{ fontSize: "clamp(3px, 1.32cqw, 14px)" }}>
            <Wide wire={wire} />
          </div>
          <div className="size-full @min-[34rem]:hidden" style={{ fontSize: "clamp(8px, 3.9cqw, 16px)" }}>
            <Narrow wire={wire} />
          </div>
        </>
      )}
    </div>
  );
}

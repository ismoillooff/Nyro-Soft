import { Plus, RotateCcw, Search } from "lucide-react";
import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { cn } from "~/lib/cn";
import { LogoMark } from "~/components/layout/Logo";
import { ORDERS, STATUS_LABEL, StatusChip, type OrderStatus } from "./DashboardMock";

/**
 * "Natija": a small working sample of the order list — search, filter by
 * status, change a status, add an order, reset. All state is local and the
 * data is sample data. Loaded as its own chunk when the tab opens.
 */

interface Order {
  id: string;
  client: string;
  item: string;
  sum: string;
  status: OrderStatus;
}

const INITIAL: Order[] = ORDERS.map((o) => ({ ...o }));
const STATUSES = Object.keys(STATUS_LABEL) as OrderStatus[];

const input =
  "h-11 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 text-[1rem] text-ink placeholder:text-ink-3 md:text-[0.9375rem]";

function formatSum(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function OrdersApp() {
  const uid = useId();
  const [orders, setOrders] = useState<Order[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ client: "", item: "", sum: "" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const clientRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!q || o.client.toLowerCase().includes(q) || o.item.toLowerCase().includes(q) || o.id.includes(q)),
    );
  }, [orders, query, filter]);

  const setStatus = (id: string, status: OrderStatus) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    setNotice(`#${id}: ${STATUS_LABEL[status]}`);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.client.trim() || !draft.item.trim() || !draft.sum.trim()) {
      setError("Mijoz, mahsulot va summani kiriting.");
      clientRef.current?.focus();
      return;
    }
    const next = String(Math.max(...orders.map((o) => Number(o.id)), 1000) + 1);
    setOrders((list) => [{ id: next, client: draft.client.trim(), item: draft.item.trim(), sum: draft.sum, status: "new" }, ...list]);
    setDraft({ client: "", item: "", sum: "" });
    setError(null);
    setAdding(false);
    setFilter("all");
    setQuery("");
    setNotice(`#${next} buyurtma qo‘shildi`);
    addButtonRef.current?.focus();
  };

  const reset = () => {
    setOrders(INITIAL);
    setQuery("");
    setFilter("all");
    setAdding(false);
    setError(null);
    setNotice("Namuna asl holatiga qaytarildi");
  };

  return (
    <div className="@container flex size-full flex-col bg-surface text-[0.9375rem] text-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 @[40rem]:px-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-5" />
          <h3 className="font-semibold tracking-[-0.01em]">Buyurtmalar</h3>
          <span className="t-label text-ink-3 tabular-nums">{orders.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-ink-2 hover:text-ink"
          >
            <RotateCcw aria-hidden="true" strokeWidth={1.5} className="size-4" />
            <span className="hidden @[30rem]:inline">Asl holatga qaytarish</span>
            <span className="sr-only @[30rem]:hidden">Asl holatga qaytarish</span>
          </button>
          <button
            ref={addButtonRef}
            type="button"
            aria-expanded={adding}
            aria-controls={`${uid}-form`}
            onClick={() => {
              setAdding((a) => !a);
              setError(null);
              requestAnimationFrame(() => clientRef.current?.focus());
            }}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-ink px-3.5 text-white"
          >
            <Plus aria-hidden="true" strokeWidth={1.5} className="size-4" />
            Yangi buyurtma
          </button>
        </div>
      </div>

      {adding && (
        <form
          id={`${uid}-form`}
          onSubmit={add}
          noValidate
          className="grid gap-3 border-b border-line bg-[#FBFBF9] px-4 py-4 @[40rem]:grid-cols-[1.2fr_1.2fr_0.8fr_auto] @[40rem]:items-end @[40rem]:px-6"
        >
          <label className="grid gap-1.5">
            <span className="text-[0.875rem] text-ink-2">Mijoz</span>
            <input
              ref={clientRef}
              className={input}
              value={draft.client}
              onChange={(e) => setDraft({ ...draft, client: e.target.value })}
              aria-invalid={error && !draft.client.trim() ? true : undefined}
              aria-describedby={error ? `${uid}-err` : undefined}
              autoComplete="off"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[0.875rem] text-ink-2">Mahsulot</span>
            <input
              className={input}
              value={draft.item}
              onChange={(e) => setDraft({ ...draft, item: e.target.value })}
              aria-invalid={error && !draft.item.trim() ? true : undefined}
              aria-describedby={error ? `${uid}-err` : undefined}
              autoComplete="off"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[0.875rem] text-ink-2">Summa, so‘m</span>
            <input
              className={cn(input, "tabular-nums")}
              inputMode="numeric"
              value={draft.sum}
              onChange={(e) => setDraft({ ...draft, sum: formatSum(e.target.value) })}
              aria-invalid={error && !draft.sum.trim() ? true : undefined}
              aria-describedby={error ? `${uid}-err` : undefined}
              autoComplete="off"
            />
          </label>
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] border border-ink px-4 font-medium">
            Qo‘shish
          </button>
          {error && (
            <p id={`${uid}-err`} className="text-[0.875rem] text-[#B42318] @[40rem]:col-span-4">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3 px-4 py-3 @[40rem]:px-6">
        <label className="relative min-w-0 flex-1 basis-48">
          <span className="sr-only">Buyurtmalarni qidirish</span>
          <Search aria-hidden="true" strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            className={cn(input, "pl-9")}
            placeholder="Mijoz, mahsulot yoki №"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-[0.875rem] text-ink-2">Holat</span>
          <select className={cn(input, "w-auto pr-8")} value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}>
            <option value="all">Barchasi</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 @[40rem]:px-6">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-ink-2">Mos buyurtma topilmadi.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((o) => (
              <li key={o.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 @[40rem]:grid-cols-[4.5rem_1.3fr_1.3fr_1fr_10.5rem]">
                <span className="hidden font-mono text-[0.875rem] text-ink-3 tabular-nums @[40rem]:block">#{o.id}</span>
                <span className="min-w-0">
                  <span className="block truncate">{o.client}</span>
                  <span className="block truncate text-[0.875rem] text-ink-3 @[40rem]:hidden">
                    #{o.id} · {o.item} · {o.sum}
                  </span>
                </span>
                <span className="hidden truncate text-ink-2 @[40rem]:block">{o.item}</span>
                <span className="hidden tabular-nums @[40rem]:block">{o.sum}</span>
                <label className="relative justify-self-end rounded-full has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-accent">
                  <span className="sr-only">#{o.id} holati</span>
                  <select
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none inline-flex min-h-11 items-center text-[0.875rem]">
                    <StatusChip status={o.status} className="text-[0.875rem]" />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p role="status" className="sr-only">
        {notice}
      </p>
    </div>
  );
}

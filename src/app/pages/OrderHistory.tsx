import { useEffect, useState } from "react";
import { Link } from "react-router";
import { PackageSearch } from "lucide-react";
import { callCommerce, getOrderAccessToken } from "../lib/commerce";

interface HistoryOrder {
  order: { id: string; number: string; status: string; paymentStatus: string; totalPaise: number; createdAt: string };
  shipment: { status: string; awb_code: string | null; courier_name: string | null } | null;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const stored: { id: string; token: string }[] = [];
      try {
        for (let index = 0; index < window.localStorage.length; index += 1) {
          const key = window.localStorage.key(index);
          if (!key?.startsWith("khushhal-order:")) continue;
          const id = key.slice("khushhal-order:".length);
          const token = getOrderAccessToken(id);
          if (token) stored.push({ id, token });
        }
      } catch {
        throw new Error("Order history is unavailable in this browser.");
      }
      const loaded = await Promise.all(stored.map(async ({ id, token }) => {
        try {
          return { order: await callCommerce<HistoryOrder>("order-lookup", { order_id: id, access_token: token }) };
        } catch {
          return { order: null };
        }
      }));
      const validOrders = loaded.flatMap((entry) => entry.order ? [entry.order] : []);
      if (active) {
        setOrders(validOrders
        .sort((left, right) => new Date(right.order.createdAt).getTime() - new Date(left.order.createdAt).getTime()));
        if (loaded.length > validOrders.length) {
          setNotice("Some saved order links could not be verified and were not shown. Check your connection or contact support.");
        }
      }
    };
    load().catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load order history."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-[70vh] bg-[var(--cream-50)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-[var(--choco-900)]">Order history</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">Orders placed on this browser are shown using their private tracking links.</p>
        {loading && <p className="mt-8 text-sm text-[var(--muted-foreground)]">Loading order history…</p>}
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{notice}</p>}
        {!loading && !error && orders.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
            <PackageSearch size={42} className="mx-auto text-[var(--gold-600)]" />
            <p className="mt-4 font-semibold text-[var(--choco-900)]">No saved orders in this browser</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Place an order here and its private tracking link will be saved locally.</p>
            <Link to="/shop" className="mt-5 inline-block rounded-full bg-[var(--choco-800)] px-6 py-3 text-sm font-semibold text-white">Shop chocolates</Link>
          </div>
        )}
        <div className="mt-6 space-y-3">
          {orders.map(({ order, shipment }) => (
            <Link key={order.id} to={`/tracking/${order.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--gold-400)]">
              <div>
                <p className="font-semibold text-[var(--choco-900)]">{order.number}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                <p className="mt-1 text-xs capitalize text-[var(--muted-foreground)]">{shipment?.status || order.status.replaceAll("_", " ")}{shipment?.awb_code ? ` · AWB ${shipment.awb_code}` : ""}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[var(--choco-900)]">₹{(order.totalPaise / 100).toLocaleString("en-IN")}</p>
                <p className="mt-1 text-xs capitalize text-[var(--muted-foreground)]">{order.paymentStatus}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

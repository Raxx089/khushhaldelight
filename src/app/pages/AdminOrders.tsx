import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { BarChart3, ExternalLink, LogIn, LogOut, Package, RefreshCw, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { callCommerce } from "../lib/commerce";
import { getSupabaseClient } from "../lib/supabase";

type OrderStatus = "pending_payment" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "action_required";
interface AdminOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  subtotal_paise: number;
  discount_paise: number;
  shipping_paise: number;
  total_paise: number;
  created_at: string;
  customers: { first_name: string; last_name: string; email: string; phone: string } | null;
  addresses: { line1: string; line2: string; city: string; state: string; pincode: string } | null;
  order_items: { product_name: string; quantity: number; unit_price_paise: number; customizations: unknown }[];
  payments: { provider: string; razorpay_order_id: string | null; razorpay_payment_id: string | null; amount_paise: number; status: string; failure_code: string | null }[];
  shipments: { status: string; awb_code: string | null; courier_name: string | null; tracking_url: string | null; label_url: string | null; shiprocket_order_id: string | null; shipment_id: string | null }[];
}
interface AdminProduct {
  id: string;
  name: string;
  category: string;
  unit_price_paise: number;
  weight_grams: number;
  is_active: boolean;
  inventory: { available: number; reserved: number } | null;
  available: number;
}

const orderStatuses = ["all", "pending_payment", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded", "action_required"] as const;

function money(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function AdminOrders() {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [status, setStatus] = useState<(typeof orderStatuses)[number]>("all");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [productRows, setProductRows] = useState<AdminProduct[]>([]);
  const [analytics, setAnalytics] = useState({ revenuePaise: 0, paidOrders: 0, pendingOrders: 0, ordersLast30Days: 0, activeProducts: 0 });
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderResult, productResult, metrics] = await Promise.all([
        callCommerce<{ orders: AdminOrder[] }>("admin-ops", { action: "orders", status }),
        callCommerce<{ products: Omit<AdminProduct, "available">[] }>("admin-ops", { action: "products" }),
        callCommerce<typeof analytics>("admin-ops", { action: "analytics" }),
      ]);
      setOrders(orderResult.orders);
      setProductRows(productResult.products.map((product) => ({
        ...product,
        available: product.inventory?.available ?? 0,
      })));
      setAnalytics(metrics);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    Promise.resolve().then(() => getSupabaseClient().auth.getSession())
      .then(({ data, error }) => {
        if (error) throw error;
        setSignedIn(Boolean(data.session));
      })
      .catch((error) => setAuthError(error instanceof Error ? error.message : "Could not check the administrator session."))
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    if (signedIn) void loadData();
  }, [signedIn, loadData]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSignedIn(true);
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in.");
    }
  };

  const runOrderAction = async (action: string, order: AdminOrder) => {
    if (action === "cancel-shipment" && !window.confirm(`Cancel the Shiprocket shipment for ${order.order_number}?`)) return;
    try {
      const result = await callCommerce<Record<string, unknown>>("admin-ops", { action, order_id: order.id });
      if (action === "generate-label" && typeof result.labelUrl === "string") {
        window.open(result.labelUrl, "_blank", "noopener,noreferrer");
      } else if (action === "track-shipment" && result.tracking) {
        toast.success("Tracking details refreshed.");
      } else {
        toast.success("Order operation completed.");
      }
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order operation failed.");
    }
  };

  const updateOrderStatus = async (order: AdminOrder, nextStatus: string) => {
    if (!["processing", "action_required"].includes(nextStatus)) {
      toast.error("Only processing or action-required status can be set here.");
      return;
    }
    try {
      await callCommerce("admin-ops", { action: "update-order-status", order_id: order.id, status: nextStatus });
      toast.success("Order status updated.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update order status.");
    }
  };

  const saveProduct = async (event: FormEvent, product: AdminProduct) => {
    event.preventDefault();
    try {
      await callCommerce("admin-ops", {
        action: "update-product",
        product_id: product.id,
        name: product.name,
        category: product.category,
        unit_price_paise: product.unit_price_paise,
        weight_grams: product.weight_grams,
        available: product.available,
        is_active: product.is_active,
      });
      toast.success(`${product.name} saved.`);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update product.");
    }
  };

  const updateProduct = (id: string, patch: Partial<AdminProduct>) => {
    setProductRows((current) => current.map((product) => product.id === id ? { ...product, ...patch } : product));
  };

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) toast.error(error.message);
    else setSignedIn(false);
  };

  if (!checked) return <div className="p-12 text-center text-sm text-[var(--muted-foreground)]">Checking administrator access…</div>;
  if (!signedIn) {
    return (
      <main className="min-h-[70vh] bg-[var(--cream-50)] px-4 py-16">
        <form onSubmit={signIn} className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-7 shadow-lg">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-100)] text-[var(--choco-800)]"><Package size={23} /></div>
          <h1 className="text-2xl font-bold text-[var(--choco-900)]">Store admin</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Sign in with a Supabase administrator account.</p>
          <label className="mt-6 block text-xs font-semibold text-[var(--choco-800)]">Email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm" />
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--choco-800)]">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm" />
          </label>
          {authError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{authError}</p>}
          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--choco-800)] px-4 py-3 text-sm font-semibold text-white"><LogIn size={16} /> Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream-50)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-700)]">Khushhal Delight</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--choco-900)]">Orders & products</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/chat" className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--choco-800)]">Chat inbox</Link>
            <button type="button" onClick={() => void loadData()} disabled={loading} aria-label="Refresh admin data" className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--choco-800)] disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
            <button type="button" onClick={() => void signOut()} className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--choco-800)]"><LogOut size={14} /> Sign out</button>
          </div>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Paid revenue (30 days)", money(analytics.revenuePaise)],
            ["Paid orders", analytics.paidOrders],
            ["Pending orders", analytics.pendingOrders],
            ["Orders (30 days)", analytics.ordersLast30Days],
            ["Active products", analytics.activeProducts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-[var(--choco-900)]"><BarChart3 size={15} className="text-[var(--gold-700)]" />{value}</p>
            </div>
          ))}
        </div>

        <section className="mb-10 rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
            <h2 className="text-lg font-semibold text-[var(--choco-900)]">Orders</h2>
            <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs capitalize">
              {orderStatuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {orders.map((order) => {
              const shipment = order.shipments?.[0];
              return (
                <article key={order.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--choco-900)]">{order.order_number} <span className="ml-1 rounded-full bg-[var(--cream-100)] px-2 py-1 text-[10px] font-medium capitalize">{order.status.replaceAll("_", " ")}</span></p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{order.customers?.first_name} {order.customers?.last_name} · {order.customers?.email} · {order.customers?.phone}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{order.addresses?.line1}, {order.addresses?.city}, {order.addresses?.state} {order.addresses?.pincode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-[var(--choco-900)]">{money(order.total_paise)}</p>
                      <p className="text-[10px] capitalize text-[var(--muted-foreground)]">{order.payment_method} · {order.payment_status}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[var(--muted-foreground)]">
                    {order.order_items?.map((item, index) => <span key={`${item.product_name}-${index}`} className="rounded-full bg-[var(--cream-100)] px-2.5 py-1">{item.quantity} × {item.product_name}</span>)}
                  </div>
                  {!!order.payments?.length && (
                    <p className="mt-3 break-all text-[10px] text-[var(--muted-foreground)]">
                      Payment: {order.payments[0].status} · Razorpay order {order.payments[0].razorpay_order_id || "—"} · payment {order.payments[0].razorpay_payment_id || "—"}
                      {order.payments[0].failure_code ? ` · ${order.payments[0].failure_code}` : ""}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select aria-label={`Update status for ${order.order_number}`} value="" onChange={(event) => { if (event.target.value) void updateOrderStatus(order, event.target.value); }} className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-[10px]">
                      <option value="">Set processing status…</option>
                      <option value="processing">Processing</option>
                      <option value="action_required">Action required</option>
                    </select>
                    {order.payment_status === "captured" && !shipment && <button type="button" onClick={() => void runOrderAction("create-shipment", order)} className="rounded-lg bg-[var(--choco-800)] px-3 py-2 text-[10px] font-semibold text-white"><Truck size={12} className="mr-1 inline" /> Create shipment</button>}
                    {shipment?.shipment_id && !shipment.label_url && <button type="button" onClick={() => void runOrderAction("generate-label", order)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--choco-800)]">Generate label</button>}
                    {shipment?.label_url && <a href={shipment.label_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--choco-800)]">Shipping label <ExternalLink size={11} className="ml-1 inline" /></a>}
                    {shipment?.awb_code && <button type="button" onClick={() => void runOrderAction("track-shipment", order)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--choco-800)]">Track AWB {shipment.awb_code}</button>}
                    {shipment?.shiprocket_order_id && !["shipped", "delivered", "cancelled"].includes(shipment.status) && <button type="button" onClick={() => void runOrderAction("cancel-shipment", order)} className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-700">Cancel shipment</button>}
                  </div>
                  {shipment && <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">Shipping: {shipment.status} · {shipment.courier_name || "Courier pending"}{shipment.awb_code ? ` · AWB ${shipment.awb_code}` : ""}{shipment.tracking_url ? <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--gold-700)] underline">Track</a> : ""}</p>}
                </article>
              );
            })}
            {orders.length === 0 && <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">No orders found.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="border-b border-[var(--border)] p-4">
            <h2 className="text-lg font-semibold text-[var(--choco-900)]">Product catalog & live stock</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Inventory begins at zero until verified stock is entered here. Saved prices and quantities are used by checkout and the shopping assistant.</p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {productRows.map((product) => (
              <form key={product.id} onSubmit={(event) => void saveProduct(event, product)} className="rounded-xl border border-[var(--border)] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-semibold text-[var(--choco-900)]">
                    <input type="checkbox" checked={product.is_active} onChange={(event) => updateProduct(product.id, { is_active: event.target.checked })} className="accent-[var(--gold-500)]" />
                    <span className="truncate">{product.name}</span>
                  </label>
                  <span className="text-[10px] text-[var(--muted-foreground)]">{product.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[10px] text-[var(--muted-foreground)]">Price (₹)<input type="number" min="0" step="0.01" value={(product.unit_price_paise / 100).toFixed(2)} onChange={(event) => updateProduct(product.id, { unit_price_paise: Math.round(Number(event.target.value) * 100) })} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2 text-xs text-[var(--choco-900)]" /></label>
                  <label className="text-[10px] text-[var(--muted-foreground)]">Weight (g)<input type="number" min="1" value={product.weight_grams} onChange={(event) => updateProduct(product.id, { weight_grams: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2 text-xs text-[var(--choco-900)]" /></label>
                  <label className="text-[10px] text-[var(--muted-foreground)]">Available<input type="number" min="0" value={product.available} onChange={(event) => updateProduct(product.id, { available: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[var(--border)] px-2 py-2 text-xs text-[var(--choco-900)]" /></label>
                </div>
                <button type="submit" className="mt-3 flex items-center gap-1 rounded-lg bg-[var(--choco-800)] px-3 py-2 text-[10px] font-semibold text-white"><Save size={12} /> Save product</button>
              </form>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

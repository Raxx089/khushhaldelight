import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, CheckCircle2, ExternalLink, PackageCheck, Printer, RefreshCw, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { products, type Product } from "../data/products";
import { callCommerce, getOrderAccessToken } from "../lib/commerce";

interface TrackingOrder {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  createdAt: string;
}
interface OrderItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_paise: number;
  customizations: Record<string, unknown> | string[] | null;
}
interface OrderLookup {
  order: TrackingOrder;
  customer: { first_name: string; last_name: string; email: string; phone: string };
  address: { line1: string; line2: string; city: string; state: string; pincode: string; country: string };
  items: OrderItem[];
  shipment: { status: string; awb_code: string | null; courier_name: string | null; tracking_url: string | null; updated_at: string } | null;
}

function money(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function Tracking() {
  const { orderId = "" } = useParams();
  const { dispatch } = useCart();
  const [result, setResult] = useState<OrderLookup | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getOrderAccessToken(orderId);
    if (!token) {
      setError("This private tracking link is not available in this browser. Open the order confirmation on the device used to place the order, or contact support with your order number.");
      setLoading(false);
      return () => { active = false; };
    }
    callCommerce<OrderLookup>("order-lookup", { order_id: orderId, access_token: token })
      .then((data) => { if (active) setResult(data); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Could not load this order."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId]);

  const reorder = () => {
    if (!result) return;
    let added = 0;
    for (const item of result.items) {
      const product = products.find((candidate) => candidate.id === item.product_id);
      if (!product) continue;
      const currentPrice = item.unit_price_paise / 100;
      const cartProduct: Product = { ...product, price: currentPrice };
      dispatch({ type: "ADD_ITEM", product: cartProduct, quantity: item.quantity });
      added += 1;
    }
    if (added) toast.success(`${added} item${added === 1 ? "" : "s"} added. Current price and stock will be checked at checkout.`);
    else toast.error("This order contains custom items that need to be configured again before they can be reordered.");
  };

  if (loading) return <div className="min-h-[60vh] p-12 text-center text-sm text-[var(--muted-foreground)]">Loading secure order details…</div>;
  if (error || !result) {
    return (
      <main className="min-h-[60vh] px-4 py-16 text-center">
        <PackageCheck size={42} className="mx-auto text-[var(--gold-600)]" />
        <h1 className="mt-4 text-2xl font-bold text-[var(--choco-900)]">Order tracking</h1>
        <p role="alert" className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted-foreground)]">{error || "Order information is unavailable."}</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--choco-800)] px-6 py-3 text-sm font-semibold text-white"><ArrowLeft size={15} /> Continue shopping</Link>
      </main>
    );
  }

  const { order, customer, address, items, shipment } = result;
  return (
    <main className="min-h-screen bg-[var(--cream-50)] px-4 py-10 sm:px-6 lg:px-8">
      <style>{`@media print { body * { visibility: hidden !important; } #order-invoice, #order-invoice * { visibility: visible !important; } #order-invoice { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 24px; } .no-print { display: none !important; } }`}</style>
      <div className="mx-auto max-w-4xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--choco-800)]"><ArrowLeft size={15} /> Order history</Link>
          <div className="flex gap-2">
            <button type="button" onClick={reorder} className="rounded-full border border-[var(--choco-700)] px-4 py-2 text-xs font-semibold text-[var(--choco-800)]">Reorder items</button>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-[var(--choco-800)] px-4 py-2 text-xs font-semibold text-white"><Printer size={14} /> Print / Save invoice</button>
          </div>
        </div>

        <article id="order-invoice" className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <header className="rounded-t-2xl bg-[var(--choco-800)] p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-300)]">Khushhal Delight</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">Order {order.number}</h1>
                <p className="mt-1 text-xs text-[var(--cream-300)]">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold capitalize">{order.status.replaceAll("_", " ")}</span>
            </div>
          </header>

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--choco-800)]">Delivery to</h2>
              <p className="mt-2 text-sm font-semibold text-[var(--choco-900)]">{customer.first_name} {customer.last_name}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.pincode}<br />{address.country}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{customer.email} · {customer.phone}</p>
            </section>
            <section className="rounded-xl bg-[var(--cream-50)] p-4">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--choco-800)]"><Truck size={14} /> Shipment</h2>
              {shipment ? (
                <>
                  <p className="mt-2 text-sm font-semibold capitalize text-[var(--choco-900)]">{shipment.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">{shipment.courier_name || "Courier details pending"}{shipment.awb_code ? ` · AWB ${shipment.awb_code}` : ""}</p>
                  {shipment.tracking_url && <a className="no-print mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--gold-700)] underline" href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">Carrier tracking <ExternalLink size={12} /></a>}
                  <p className="mt-2 text-[10px] text-[var(--muted-foreground)]">Updated {new Date(shipment.updated_at).toLocaleString("en-IN")}</p>
                </>
              ) : <p className="mt-2 text-xs text-[var(--muted-foreground)]">Courier details will appear here after shipment creation.</p>}
            </section>
          </div>

          <section className="px-6 pb-6 sm:px-8">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--choco-800)]">Order items</h2>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {items.map((item, index) => (
                <div key={`${item.product_name}-${index}`} className="flex items-start justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--choco-900)]">{item.product_name}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">Qty {item.quantity} · {money(item.unit_price_paise)} each</p>
                    {item.customizations && !Array.isArray(item.customizations) && (
                      <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{Object.entries(item.customizations).map(([key, value]) => `${key.replaceAll("_", " ")}: ${String(value)}`).join(" · ")}</p>
                    )}
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-[var(--choco-900)]">{money(item.unit_price_paise * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="ml-auto mt-4 max-w-xs space-y-2 text-xs">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotalPaise)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>−{money(order.discountPaise)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{money(order.shippingPaise)}</span></div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 text-sm font-bold text-[var(--choco-900)]"><span>Total</span><span>{money(order.totalPaise)}</span></div>
              <div className="flex justify-between text-[var(--muted-foreground)]"><span>Payment</span><span className="capitalize">{order.paymentMethod} · {order.paymentStatus}</span></div>
            </div>
          </section>
          <footer className="no-print flex items-center gap-2 border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted-foreground)] sm:px-8">
            {order.status === "delivered" ? <CheckCircle2 size={15} className="text-emerald-600" /> : <RefreshCw size={14} />}
            This page uses a private order token stored in this browser. Keep it private.
          </footer>
        </article>
      </div>
    </main>
  );
}

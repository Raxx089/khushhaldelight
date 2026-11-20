import { useRef, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Banknote, Check, ChevronRight, CreditCard, Lock, MapPin, Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { callCommerce, type ShippingQuote } from "../lib/commerce";
import { saveOrderAccessToken } from "../lib/commerce";

type Step = "address" | "payment" | "success";
type PaymentMethod = "razorpay" | "cod";

const paymentMethods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string }[] = [
  { id: "razorpay", label: "Pay Online", icon: CreditCard, desc: "UPI, credit/debit cards, net banking & available wallets" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay the courier when your order arrives" },
];

interface CheckoutOrder {
  id: string;
  number: string;
  totalPaise: number;
  status: string;
  paymentStatus?: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayPayment) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", handler: (response: { error?: { description?: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function Checkout() {
  const { state, dispatch, subtotal, discountAmount, shipping } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [checkingShipping, setCheckingShipping] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<CheckoutOrder | null>(null);
  const [shipmentMessage, setShipmentMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState<{
    orderId: string;
    accessToken: string;
    payment: RazorpayPayment;
  } | null>(null);
  const checkoutAttempt = useRef<{ fingerprint: string; key: string } | null>(null);
  const [address, setAddress] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
    saveAddress: false, whatsappOptIn: false, marketingOptIn: false,
  });

  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId);
  const shippingAmount = selectedQuote
    ? (selectedQuote.freightPaise + (paymentMethod === "cod" ? selectedQuote.codChargePaise : 0)) / 100
    : shipping;
  const estimatedTotal = subtotal - discountAmount + shippingAmount;

  const checkoutItems = state.items.map((item) => {
    if (!item.product.customizations) {
      return {
        product_id: item.product.id,
        quantity: item.quantity,
        customizations: { gift_wrap: item.giftWrap, gift_message: item.message ?? "" },
      };
    }
    const values = new Map(item.product.customizations.map(({ label, value }) => [label, value]));
    const value = (label: string) => values.get(label) ?? "";
    const inclusions = value("Inclusions");
    const inclusionIds = inclusions === "Plain / Smooth"
      ? []
      : inclusions.split(", ").map((label) => {
        if (label === "Roasted California Almonds") return "almonds";
        if (label === "Roasted Hazelnuts") return "hazelnuts";
        if (label === "Roasted Pistachio & Sea Salt") return "pistachio";
        return "";
      }).filter(Boolean);
    const flavor = value("Chocolate");
    const finish = value("Finish");
    const box = value("Gift box");
    return {
      product_id: "custom-name-bar",
      quantity: item.quantity,
      customizations: {
        bar_type: value("Bar type") === "Single Name Bar"
          ? "single" : value("Bar type") === "Message Slab" ? "message" : "blocks",
        text: value("Text"),
        flavor: flavor === "Rich Dark" ? "dark55" : flavor === "Intense Dark" ? "dark70" : flavor === "Creamy Milk" ? "milk" : "white",
        inclusions: inclusionIds,
        finish: finish === "Edible Gold Dust Finish" ? "gold" : finish === "Edible Silver Shimmer" ? "silver" : "natural",
        gift_box: box.startsWith("Festive Red") ? "festive" : box.startsWith("Rustic Wooden") ? "wooden" : "classic",
        gift_note: value("Gift note"),
        delivery_date: value("Delivery date"),
        gift_wrap: item.giftWrap,
      },
    };
  });

  const checkShipping = async () => {
    if (!/^[1-9][0-9]{5}$/.test(address.pincode)) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }
    if (!checkoutItems.length) {
      toast.error("Your cart is empty.");
      return;
    }
    setCheckingShipping(true);
    setCheckoutError("");
    setQuotes([]);
    setSelectedQuoteId("");
    try {
      const result = await callCommerce<{ quotes: ShippingQuote[] }>("shipping-serviceability", {
        pincode: address.pincode,
        items: checkoutItems,
      });
      setQuotes(result.quotes);
      if (result.quotes.length === 0) throw new Error("No courier service is available for this PIN code.");
      toast.success(`${result.quotes.length} courier option${result.quotes.length === 1 ? "" : "s"} available.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not check delivery serviceability.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setCheckingShipping(false);
    }
  };

  const handleAddressSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedQuote) {
      toast.error("Check courier availability and choose a delivery option first.");
      return;
    }
    setStep("payment");
  };

  const completeOrder = (order: CheckoutOrder, accessToken: string, message: string) => {
    saveOrderAccessToken(order.id, accessToken);
    setConfirmedOrder(order);
    setShipmentMessage(message);
    setPendingVerification(null);
    setCheckoutError("");
    dispatch({ type: "CLEAR_CART" });
    dispatch({ type: "CLOSE_CART" });
    setStep("success");
  };

  const verifyRazorpayPayment = async (verification = pendingVerification) => {
    if (!verification) return;
    setVerificationBusy(true);
    setCheckoutError("");
    try {
      const result = await callCommerce<{
        order: CheckoutOrder;
        shipmentError?: string | null;
      }>("verify-payment", {
        order_id: verification.orderId,
        access_token: verification.accessToken,
        razorpay_order_id: verification.payment.razorpay_order_id,
        razorpay_payment_id: verification.payment.razorpay_payment_id,
        razorpay_signature: verification.payment.razorpay_signature,
      });
      if (result.order.paymentStatus !== "captured") {
        const failed = result.order.paymentStatus === "failed";
        setPendingVerification(failed ? null : verification);
        setCheckoutError(failed
          ? "Razorpay reports this payment failed. Your order is not confirmed; you can safely retry payment."
          : `Razorpay reports payment status “${result.order.paymentStatus || "pending"}”. Your order is not confirmed until payment is captured. Check again shortly.`);
        if (failed) toast.error("Payment failed. You can try again.");
        return;
      }
      completeOrder(result.order, verification.accessToken, result.shipmentError
        ? "Payment confirmed. Courier setup needs attention; tracking will update when the shipment is arranged."
        : "Payment confirmed. We’ll share courier tracking as soon as the shipment is ready.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment verification could not be completed.";
      setCheckoutError(`${message} Your payment will not be treated as confirmed until verification completes.`);
      toast.error("Payment confirmation is pending. Retry server verification before paying again.");
    } finally {
      setVerificationBusy(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedQuote) {
      setCheckoutError("Choose a courier before placing your order.");
      return;
    }
    if (paymentMethod === "cod" && !selectedQuote.codAvailable) {
      setCheckoutError("Cash on delivery is not available with the selected courier. Choose another option or pay online.");
      return;
    }
    setPlacingOrder(true);
    setCheckoutError("");
    try {
      const fingerprint = JSON.stringify({
        customer: {
          first_name: address.firstName,
          last_name: address.lastName,
          email: address.email,
          phone: address.phone,
          whatsapp_opt_in: address.whatsappOptIn,
          marketing_opt_in: address.marketingOptIn,
        },
        address: {
          line1: address.line1, line2: address.line2, city: address.city,
          state: address.state, pincode: address.pincode,
        },
        items: checkoutItems,
        coupon: state.coupon,
        quote: selectedQuote.id,
        paymentMethod,
      });
      if (!checkoutAttempt.current || checkoutAttempt.current.fingerprint !== fingerprint) {
        checkoutAttempt.current = { fingerprint, key: crypto.randomUUID() };
      }
      const result = await callCommerce<{
        order: CheckoutOrder;
        accessToken: string;
        payment?: { keyId: string; orderId: string; amountPaise: number; currency: string };
        shipmentError?: string | null;
      }>("create-order", {
        idempotency_key: checkoutAttempt.current.key,
        customer: {
          first_name: address.firstName,
          last_name: address.lastName,
          email: address.email,
          phone: address.phone,
          whatsapp_opt_in: address.whatsappOptIn,
          marketing_opt_in: address.marketingOptIn,
        },
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        items: checkoutItems,
        coupon_code: state.coupon,
        shipping_quote_id: selectedQuote.id,
        payment_method: paymentMethod,
      });

      if (paymentMethod === "cod") {
        completeOrder(result.order, result.accessToken, result.shipmentError
          ? "Your COD order is recorded. Courier setup needs attention; our team will arrange it."
          : "Your order is confirmed for cash on delivery.");
        return;
      }
      if (!result.payment) throw new Error("Payment checkout details were not returned. Your cart is unchanged.");
      if (!result.accessToken) throw new Error("The secure order link was not returned. Contact support before retrying.");
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) throw new Error("Razorpay Checkout could not be loaded. Your cart is unchanged; please retry.");
      saveOrderAccessToken(result.order.id, result.accessToken);
      const checkout = new window.Razorpay({
        key: result.payment.keyId,
        order_id: result.payment.orderId,
        amount: result.payment.amountPaise,
        currency: result.payment.currency,
        name: "Khushhal Delight",
        description: `Order ${result.order.number}`,
        prefill: {
          name: `${address.firstName} ${address.lastName}`.trim(),
          email: address.email,
          contact: address.phone,
        },
        theme: { color: "#C9A227" },
        handler: (payment) => {
          const verification = { orderId: result.order.id, accessToken: result.accessToken, payment };
          setPendingVerification(verification);
          void verifyRazorpayPayment(verification);
        },
        modal: {
          ondismiss: () => {
            setCheckoutError("Payment window closed. The order is not confirmed; you can retry checkout.");
          },
        },
      });
      checkout.on("payment.failed", (response) => {
        const message = response.error?.description || "Payment was not completed.";
        setCheckoutError(`${message} Your order is not confirmed yet; you can retry payment.`);
        toast.error("Payment failed. You can try again.");
      });
      checkout.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not place your order.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (step === "success" && confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
        >
          <Check size={48} className="text-[var(--choco-950)]" strokeWidth={3} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center">
          <h1 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2.5rem", fontWeight: 700 }}>
            Order Confirmed
          </h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            {confirmedOrder.paymentStatus === "captured" ? "Payment verified. Your chocolates are being prepared with care." : "Your order is recorded. Payment is due to the courier."}
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--cream-100)] p-6">
            <p className="mb-1 text-xs uppercase tracking-widest text-[var(--muted-foreground)]">Order Number</p>
            <p className="font-bold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.3rem" }}>
              {confirmedOrder.number}
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{shipmentMessage}</p>
            <p className="mt-3 text-xs text-[var(--choco-700)]">Total: ₹{(confirmedOrder.totalPaise / 100).toLocaleString("en-IN")}</p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`/tracking/${confirmedOrder.id}`} className="rounded-full border-2 border-[var(--choco-700)] px-8 py-3.5 font-semibold text-[var(--choco-800)]">
              Track Order
            </Link>
            <Link to="/shop" className="rounded-full px-8 py-3.5 font-semibold text-[var(--choco-950)]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <div className="px-4 py-10 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-sm text-[var(--cream-300)] transition-colors hover:text-white">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>Checkout</h1>
          <div className="flex items-center gap-3">
            {["address", "payment"].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    step === item ? "text-[var(--choco-950)]" : item === "address" && step === "payment" ? "bg-emerald-500 text-white" : "bg-white/20 text-white"
                  }`}
                  style={step === item ? { background: "linear-gradient(135deg, #C9A227, #E8D5A3)" } : {}}
                >
                  {item === "address" && step === "payment" ? <Check size={14} /> : index + 1}
                </div>
                <span className="hidden text-xs capitalize text-white/80 sm:block">{item === "address" ? "Delivery" : "Payment"}</span>
                {index < 1 && <ChevronRight size={14} className="text-white/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === "address" && (
                <motion.form
                  key="address"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleAddressSubmit}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
                      Contact Information
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="First Name" value={address.firstName} onChange={(v) => setAddress({ ...address, firstName: v })} required />
                      <FormField label="Last Name" value={address.lastName} onChange={(v) => setAddress({ ...address, lastName: v })} required />
                      <FormField label="Email Address" type="email" value={address.email} onChange={(v) => setAddress({ ...address, email: v })} required className="sm:col-span-2" />
                      <FormField label="Phone Number" type="tel" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} required className="sm:col-span-2" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
                        Delivery Address
                      </h2>
                      <span className="flex items-center gap-1 text-xs font-medium text-[var(--gold-600)]"><MapPin size={13} /> India</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label="Address Line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} required className="sm:col-span-2" />
                      <FormField label="Address Line 2 (Optional)" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} className="sm:col-span-2" />
                      <FormField label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} required />
                      <FormField label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} required />
                      <FormField label="PIN Code" type="text" value={address.pincode} onChange={(v) => {
                        setAddress({ ...address, pincode: v.replace(/\D/g, "").slice(0, 6) });
                        setQuotes([]);
                        setSelectedQuoteId("");
                      }} required className="sm:col-span-2" />
                    </div>
                    <button
                      type="button"
                      onClick={checkShipping}
                      disabled={checkingShipping}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--choco-800)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      <Truck size={15} /> {checkingShipping ? "Checking couriers..." : "Check courier availability"}
                    </button>
                    {quotes.length > 0 && (
                      <fieldset className="mt-5 space-y-2">
                        <legend className="mb-2 text-sm font-semibold text-[var(--choco-800)]">Choose a delivery option</legend>
                        {quotes.map((quote) => (
                          <label key={quote.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${selectedQuoteId === quote.id ? "border-[var(--gold-500)] bg-[var(--gold-100)]" : "border-[var(--border)]"}`}>
                            <input type="radio" name="shipping-quote" checked={selectedQuoteId === quote.id} onChange={() => setSelectedQuoteId(quote.id)} className="mt-1 accent-[var(--gold-500)]" />
                            <span className="flex-1">
                              <span className="block text-sm font-semibold text-[var(--choco-800)]">{quote.courierName}</span>
                              <span className="block text-xs text-[var(--muted-foreground)]">
                                {quote.estimatedDays ? `Estimated ${quote.estimatedDays} day${quote.estimatedDays === 1 ? "" : "s"}` : "Delivery estimate confirmed after dispatch"}
                                {quote.codAvailable ? " · COD available" : ""}
                              </span>
                            </span>
                            <span className="text-sm font-bold text-[var(--choco-800)]">
                              ₹{((quote.freightPaise + (paymentMethod === "cod" ? quote.codChargePaise : 0)) / 100).toLocaleString("en-IN")}
                            </span>
                          </label>
                        ))}
                      </fieldset>
                    )}
                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-[var(--choco-800)]">
                      <input type="checkbox" checked={address.saveAddress} onChange={(event) => setAddress({ ...address, saveAddress: event.target.checked })} className="h-4 w-4 accent-[var(--gold-500)]" />
                      Save this address for future orders
                    </label>
                    <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[var(--choco-800)]">
                      <input type="checkbox" checked={address.whatsappOptIn} onChange={(event) => setAddress({ ...address, whatsappOptIn: event.target.checked })} className="mt-0.5 h-4 w-4 accent-[var(--gold-500)]" />
                      <span>Send me order and delivery updates on WhatsApp. This is optional and can be changed by contacting support.</span>
                    </label>
                    <label className="mt-2 flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
                      <input type="checkbox" checked={address.marketingOptIn} onChange={(event) => setAddress({ ...address, marketingOptIn: event.target.checked })} className="mt-0.5 h-4 w-4 accent-[var(--gold-500)]" />
                      <span>Also send me occasional chocolate news and offers on WhatsApp. Optional; promotional messages require separate consent.</span>
                    </label>
                  </div>

                  {checkoutError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{checkoutError}</p>}
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold text-[var(--choco-950)] transition-transform hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                    Continue to Payment <ChevronRight size={18} />
                  </button>
                </motion.form>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                        <label key={id} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${paymentMethod === id ? "border-[var(--gold-500)] bg-[var(--gold-100)]" : "border-[var(--border)] hover:border-[var(--gold-300)]"}`}>
                          <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="accent-[var(--gold-500)]" />
                          <Icon size={20} className="text-[var(--choco-700)]" />
                          <span>
                            <span className="block text-sm font-semibold text-[var(--choco-800)]">{label}</span>
                            <span className="block text-xs text-[var(--muted-foreground)]">{desc}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedQuote && paymentMethod === "cod" && !selectedQuote.codAvailable && (
                      <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">COD isn’t available with this courier. Go back and choose a courier that supports COD, or select online payment.</p>
                    )}
                    <p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <Lock size={14} /> Card and UPI details are collected securely by Razorpay, not by this website.
                    </p>
                  </div>

                  {checkoutError && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <p>{checkoutError}</p>
                      {pendingVerification && (
                        <button type="button" onClick={() => void verifyRazorpayPayment()} disabled={verificationBusy} className="mt-3 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
                          {verificationBusy ? "Verifying..." : "Retry payment verification"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setCheckoutError(""); setStep("address"); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--choco-700)] py-4 font-semibold text-[var(--choco-800)]">
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePlaceOrder()}
                      disabled={placingOrder || verificationBusy || Boolean(pendingVerification)}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-xl py-4 font-semibold text-[var(--choco-950)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                    >
                      <Lock size={16} /> {placingOrder ? "Preparing secure checkout..." : paymentMethod === "cod" ? `Confirm COD · ₹${estimatedTotal.toLocaleString("en-IN")}` : `Pay securely · ₹${estimatedTotal.toLocaleString("en-IN")}`}
                    </button>
                  </div>
                  <p className="text-center text-xs text-[var(--muted-foreground)]">Final price is verified by our secure checkout server.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>
                Order Summary
              </h2>
              <div className="max-h-60 space-y-3 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img src={item.product.image} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--choco-800)]">{item.product.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[var(--choco-800)]">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
                {state.items.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">Your cart is empty. <Link to="/shop" className="underline">Browse chocolates</Link></p>}
              </div>
              <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
                <div className="flex justify-between text-[var(--muted-foreground)]"><span>Subtotal (estimated)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Coupon (estimated)</span><span>−₹{discountAmount.toLocaleString("en-IN")}</span></div>}
                <div className="flex justify-between text-[var(--muted-foreground)]"><span>Shipping{selectedQuote ? ` · ${selectedQuote.courierName}` : ""}</span><span>₹{shippingAmount.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between border-t border-[var(--border)] pt-2">
                  <span className="font-bold text-[var(--choco-900)]">Estimated Total</span>
                  <span className="text-lg font-bold text-[var(--choco-900)]">₹{estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)]">Final amount, discounts and shipping are calculated and validated by the checkout server.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

function FormField({ label, value, onChange, type = "text", placeholder, required, className }: FormFieldProps) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--choco-800)]">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--cream-50)] px-4 py-3 text-sm text-[var(--choco-900)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
      />
    </label>
  );
}

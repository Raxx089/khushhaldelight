import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Check, CreditCard, Smartphone, Building, Banknote, Truck, Lock, ArrowLeft, MapPin } from "lucide-react";
import { useCart } from "../context/CartContext";

type Step = "address" | "payment" | "success";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Smartphone, desc: "Google Pay, PhonePe, Paytm" },
  { id: "card", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, Amex" },
  { id: "netbanking", label: "Net Banking", icon: Building, desc: "All major banks supported" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, desc: "Pay when delivered" },
];

export function Checkout() {
  const { state, dispatch, subtotal, discountAmount, total, shipping } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [address, setAddress] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", pincode: "",
    saveAddress: false,
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handlePlaceOrder = () => {
    setTimeout(() => {
      dispatch({ type: "CLEAR_CART" });
      setStep("success");
    }, 1500);
  };

  const orderNumber = `MC${Date.now().toString().slice(-8)}`;

  if (step === "success") {
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
          <h1 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "2.5rem", fontWeight: 700 }}>
            Order Placed! 🎉
          </h1>
          <p className="text-[var(--muted-foreground)] mt-3 text-lg">
            Thank you for your order. Your chocolates are being prepared with love.
          </p>
          <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--cream-100)] max-w-sm mx-auto">
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest mb-1">Order Number</p>
            <p className="font-bold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.3rem" }}>
              #{orderNumber}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-3">
              You'll receive a confirmation email with tracking details within 15 minutes.
            </p>
            <div className="mt-4 flex items-center gap-2 justify-center text-sm text-[var(--gold-600)]">
              <Truck size={16} />
              <span>Estimated delivery: 1–3 business days</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/account"
              className="px-8 py-3.5 rounded-full border-2 border-[var(--choco-700)] text-[var(--choco-800)] font-semibold"
            >
              Track Order
            </Link>
            <Link
              to="/shop"
              className="px-8 py-3.5 rounded-full font-semibold text-[var(--choco-950)]"
              style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <div className="py-10 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/cart" className="text-[var(--cream-300)] flex items-center gap-2 text-sm hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>Checkout</h1>
          <div className="flex items-center gap-3">
            {["address", "payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step === s ? "text-[var(--choco-950)]" : s === "address" && step === "payment" ? "bg-emerald-500 text-white" : "bg-white/20 text-white"
                  }`}
                  style={step === s ? { background: "linear-gradient(135deg, #C9A227, #E8D5A3)" } : {}}
                >
                  {s === "address" && step === "payment" ? <Check size={14} /> : i + 1}
                </div>
                <span className="text-xs text-white/80 capitalize hidden sm:block">{s === "address" ? "Delivery" : "Payment"}</span>
                {i < 1 && <ChevronRight size={14} className="text-white/40" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
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
                  <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                    <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                      Contact Information
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="First Name" value={address.firstName} onChange={(v) => setAddress({ ...address, firstName: v })} required />
                      <FormField label="Last Name" value={address.lastName} onChange={(v) => setAddress({ ...address, lastName: v })} required />
                      <FormField label="Email Address" type="email" value={address.email} onChange={(v) => setAddress({ ...address, email: v })} required className="sm:col-span-2" />
                      <FormField label="Phone Number" type="tel" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} required className="sm:col-span-2" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.2rem", fontWeight: 600 }}>
                        Delivery Address
                      </h2>
                      <button type="button" className="text-xs text-[var(--gold-600)] font-medium flex items-center gap-1">
                        <MapPin size={13} /> Use my location
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Address Line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} required className="sm:col-span-2" />
                      <FormField label="Address Line 2 (Optional)" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} className="sm:col-span-2" />
                      <FormField label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} required />
                      <FormField label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} required />
                      <FormField label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} required />
                    </div>
                    <label className="flex items-center gap-2 mt-4 text-sm text-[var(--choco-800)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={address.saveAddress}
                        onChange={(e) => setAddress({ ...address, saveAddress: e.target.checked })}
                        className="w-4 h-4 accent-[var(--gold-500)]"
                      />
                      Save this address for future orders
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-[1.01]"
                    style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                  >
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
                  <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                    <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                      Payment Method
                    </h2>
                    <div className="space-y-3">
                      {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                        <label
                          key={id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            paymentMethod === id
                              ? "border-[var(--gold-500)] bg-[var(--gold-100)]"
                              : "border-[var(--border)] hover:border-[var(--gold-300)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={id}
                            checked={paymentMethod === id}
                            onChange={() => setPaymentMethod(id)}
                            className="accent-[var(--gold-500)]"
                          />
                          <Icon size={20} className="text-[var(--choco-700)]" />
                          <div>
                            <p className="text-sm font-semibold text-[var(--choco-800)]">{label}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-3"
                      >
                        <FormField label="Card Number" placeholder="1234 5678 9012 3456" value="" onChange={() => {}} />
                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="Expiry (MM/YY)" placeholder="12/28" value="" onChange={() => {}} />
                          <FormField label="CVV" placeholder="•••" value="" onChange={() => {}} />
                        </div>
                        <FormField label="Cardholder Name" placeholder="Name as on card" value="" onChange={() => {}} />
                      </motion.div>
                    )}

                    {paymentMethod === "upi" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4"
                      >
                        <FormField label="UPI ID" placeholder="yourname@upi" value="" onChange={() => {}} />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("address")}
                      className="flex-1 py-4 rounded-xl border-2 border-[var(--choco-700)] text-[var(--choco-800)] font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft size={16} /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-[2] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-[1.01]"
                      style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                    >
                      <Lock size={16} /> Place Order · ₹{total.toLocaleString("en-IN")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm sticky top-24">
              <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>
                Order Summary
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img src={item.product.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--choco-800)] truncate">{item.product.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--choco-800)] shrink-0">₹{(item.product.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2 text-sm">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span><span>−₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--border)]">
                  <span className="font-bold text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>Total</span>
                  <span className="font-bold text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.1rem" }}>₹{total.toLocaleString("en-IN")}</span>
                </div>
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
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

function FormField({ label, value, onChange, type = "text", placeholder, required, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--cream-50)] text-[var(--choco-900)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] text-sm transition-shadow"
      />
    </div>
  );
}

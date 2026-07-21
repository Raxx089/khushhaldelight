import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Gift, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import { ProductCard } from "../components/ProductCard";

export function CartPage() {
  const { state, dispatch, subtotal, discountAmount, total, shipping } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApplyCoupon = () => {
    if (!couponInput) return;
    dispatch({ type: "APPLY_COUPON", code: couponInput });
    if (["WELCOME10", "SWEET20", "LUXURY15"].includes(couponInput.toUpperCase())) {
      setCouponMsg({ type: "success", text: "Coupon applied successfully!" });
    } else {
      setCouponMsg({ type: "error", text: "Invalid coupon code. Try WELCOME10, SWEET20, or LUXURY15." });
    }
  };

  const suggestions = products.filter((p) => !state.items.find((i) => i.product.id === p.id)).slice(0, 4);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
        <ShoppingBag size={72} strokeWidth={1} className="text-[var(--muted-foreground)] mb-6" />
        <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "2rem", fontWeight: 700 }}>
          Your Cart is Empty
        </h2>
        <p className="text-[var(--muted-foreground)] mt-3 mb-8 text-center max-w-md">
          Looks like you haven't added any chocolates yet. Explore our collection and treat yourself!
        </p>
        <Link
          to="/shop"
          className="px-8 py-4 rounded-full font-semibold flex items-center gap-2 text-[var(--choco-950)]"
          style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
        <div className="mt-16 w-full max-w-5xl">
          <h3 className="text-center mb-8" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.5rem", fontWeight: 600 }}>
            You Might Love These
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <div className="py-12 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2.5rem", fontWeight: 700 }}>Your Cart</h1>
          <p className="text-[var(--cream-300)] mt-1">{state.items.length} item{state.items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress bar */}
            {shipping > 0 && (
              <div className="p-4 rounded-xl bg-[var(--gold-100)] border border-[var(--gold-300)]">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--choco-800)] font-medium flex items-center gap-1">
                    <Truck size={15} /> Free shipping
                  </span>
                  <span className="text-[var(--choco-700)]">Add ₹{(999 - subtotal).toLocaleString("en-IN")} more</span>
                </div>
                <div className="w-full bg-[var(--cream-300)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%`, background: "linear-gradient(90deg, #C9A227, #E8D5A3)" }}
                  />
                </div>
              </div>
            )}

            {state.items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm"
              >
                <div className="flex gap-5">
                  <Link to={`/product/${item.product.id}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 rounded-xl object-cover shrink-0 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link to={`/product/${item.product.id}`}>
                          <h3 className="text-[var(--choco-800)] hover:text-[var(--choco-600)] transition-colors" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontWeight: 600 }}>
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{item.product.subtitle}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{item.product.weight} · {item.product.flavor}</p>
                      </div>
                      <span className="font-bold text-[var(--choco-800)] shrink-0" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.1rem" }}>
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--cream-100)] transition-colors"
                            onClick={() => dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity - 1 })}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center hover:bg-[var(--cream-100)] transition-colors"
                            onClick={() => dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity + 1 })}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch({ type: "TOGGLE_GIFT_WRAP", productId: item.product.id })}
                          className={`flex items-center gap-1 text-xs transition-colors ${item.giftWrap ? "text-[var(--gold-600)] font-medium" : "text-[var(--muted-foreground)]"}`}
                        >
                          <Gift size={13} />
                          {item.giftWrap ? "Gift wrapped" : "Gift wrap?"}
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch({ type: "REMOVE_ITEM", productId: item.product.id })}
                        className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {item.message && (
                      <p className="mt-2 text-xs text-[var(--muted-foreground)] italic border-l-2 border-[var(--gold-400)] pl-2">
                        "{item.message}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Suggestions */}
            <div className="mt-10">
              <h3 className="mb-5" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.3rem", fontWeight: 600 }}>
                Frequently Bought Together
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestions.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm sticky top-24">
              <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                Order Summary
              </h2>

              {/* Coupon */}
              {state.coupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--gold-100)] border border-[var(--gold-300)] mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--choco-800)]">🎉 {state.coupon}</p>
                    <p className="text-xs text-emerald-600">−₹{discountAmount.toLocaleString("en-IN")} saved</p>
                  </div>
                  <button onClick={() => { dispatch({ type: "REMOVE_COUPON" }); setCouponMsg(null); }} className="text-xs text-red-500">Remove</button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 rounded-xl bg-[var(--choco-800)] text-white text-sm font-medium"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-xs mt-1.5 ${couponMsg.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
                      {couponMsg.text}
                    </p>
                  )}
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1">Try: WELCOME10, SWEET20, LUXURY15</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Subtotal ({state.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>−₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : `₹${shipping}`}</span>
                </div>
                {state.items.some((i) => i.giftWrap) && (
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Gift Wrap</span>
                    <span>₹{state.items.filter((i) => i.giftWrap).length * 49}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                  <span className="font-bold text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.05rem" }}>Total</span>
                  <span className="font-bold text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem" }}>
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full mt-5 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <p className="text-xs text-center text-[var(--muted-foreground)] mt-4 flex items-center justify-center gap-1">
                🔒 Secured with SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

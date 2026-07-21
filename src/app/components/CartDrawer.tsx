import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Trash2, Plus, Minus, Gift, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";

function CouponForm() {
  const { dispatch } = useCart();
  const [code, setCode] = useState("");

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
        />
      </div>
      <button
        onClick={() => dispatch({ type: "APPLY_COUPON", code })}
        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--choco-800)] text-white whitespace-nowrap"
      >
        Apply
      </button>
    </div>
  );
}

export function CartDrawer() {
  const { state, dispatch, totalItems, subtotal, discountAmount, total, shipping } = useCart();

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => dispatch({ type: "CLOSE_CART" })}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl"
            style={{ background: "var(--cream-50)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]" style={{ background: "var(--choco-800)" }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[var(--gold-300)]" />
                <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "white", fontSize: "1.1rem" }}>
                  Your Cart ({totalItems})
                </h2>
              </div>
              <button
                onClick={() => dispatch({ type: "CLOSE_CART" })}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <ShoppingBag size={56} className="text-[var(--muted-foreground)] mb-4" strokeWidth={1} />
                  <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.2rem" }}>
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2 mb-6">
                    Discover our handcrafted chocolate collection
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-[var(--choco-950)]"
                    style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <>
                  {state.items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 p-4 rounded-xl bg-white border border-[var(--border)] shadow-sm"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-[var(--choco-800)] leading-tight" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
                              {item.product.name}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.product.weight}</p>
                          </div>
                          <button
                            onClick={() => dispatch({ type: "REMOVE_ITEM", productId: item.product.id })}
                            className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <button
                          onClick={() => dispatch({ type: "TOGGLE_GIFT_WRAP", productId: item.product.id })}
                          className={`flex items-center gap-1 mt-1 text-xs transition-colors ${item.giftWrap ? "text-[var(--gold-600)] font-medium" : "text-[var(--muted-foreground)]"}`}
                        >
                          <Gift size={12} />
                          {item.giftWrap ? "Gift wrap added (+₹49)" : "Add gift wrap (+₹49)"}
                        </button>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 border border-[var(--border)] rounded-lg overflow-hidden">
                            <button
                              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--cream-100)] transition-colors"
                              onClick={() => dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity - 1 })}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--cream-100)] transition-colors"
                              onClick={() => dispatch({ type: "UPDATE_QUANTITY", productId: item.product.id, quantity: item.quantity + 1 })}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
                            ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="p-4 rounded-xl bg-[var(--gold-100)] border border-[var(--gold-300)]">
                    {state.coupon ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--choco-800)]">🎉 {state.coupon} applied</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Saving ₹{discountAmount.toLocaleString("en-IN")}</p>
                        </div>
                        <button onClick={() => dispatch({ type: "REMOVE_COUPON" })} className="text-xs text-red-500 font-medium">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <CouponForm />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t border-[var(--border)] px-6 py-6 bg-white space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>−₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[var(--muted-foreground)]">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-600">Free</span> : `₹${shipping}`}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                  <span className="font-semibold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>Total</span>
                  <span className="font-bold" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.1rem", color: "var(--choco-800)" }}>
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => dispatch({ type: "CLOSE_CART" })}
                  className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)]"
                  style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </Link>
                <Link
                  to="/cart"
                  onClick={() => dispatch({ type: "CLOSE_CART" })}
                  className="w-full py-3 rounded-xl border border-[var(--choco-700)] text-[var(--choco-800)] font-medium text-sm text-center block"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

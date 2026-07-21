import { useState } from "react";
import { useParams, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Heart, Share2, Star, ChevronLeft, ChevronRight,
  Truck, Shield, RefreshCw, Gift, Plus, Minus, ChevronDown,
  Leaf, Award, Package
} from "lucide-react";
import { getProductById, products } from "../data/products";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const { dispatch } = useCart();

  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [message, setMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "ingredients" | "reviews">("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.5rem" }}>Product not found</h2>
          <Link to="/shop" className="mt-4 block text-[var(--gold-600)] hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    dispatch({ type: "ADD_ITEM", product, quantity });
    if (giftWrap) dispatch({ type: "TOGGLE_GIFT_WRAP", productId: product.id });
    if (message) dispatch({ type: "SET_MESSAGE", productId: product.id, message });
    toast.success(`${product.name} added to cart`, { description: `Quantity: ${quantity}` });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const faqs = [
    { q: "How long does delivery take?", a: "We dispatch orders placed before 2 PM on the same day. Delivery takes 1–3 business days depending on your location." },
    { q: "How should I store the chocolate?", a: "Store in a cool, dry place (15–18°C) away from direct sunlight and strong odors. Do not refrigerate — it can cause blooming." },
    { q: "Can I add a personalized message?", a: "Absolutely! Use the 'Personal Message' field on this page. We handwrite your message on our premium card." },
    { q: "What is your return policy?", a: "We offer a 100% satisfaction guarantee. If you're not happy with your order, contact us within 48 hours of delivery." },
  ];

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Link to="/" className="hover:text-[var(--choco-800)] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[var(--choco-800)] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[var(--choco-800)] font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl aspect-square bg-[var(--cream-100)]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={product.images[imgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              </AnimatePresence>

              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-[var(--choco-950)]"
                    style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                  >
                    {product.badge}
                  </span>
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx((p) => Math.max(0, p - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImgIdx((p) => Math.min(product.images.length - 1, p + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === imgIdx ? "border-[var(--gold-500)]" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-2">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="text-xs uppercase tracking-widest text-[var(--gold-600)] font-medium">{product.category}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-red-400 transition-colors"
                >
                  <Heart size={16} className={isWishlisted ? "text-red-500" : "text-[var(--muted-foreground)]"} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                <button className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:border-[var(--gold-400)] transition-colors">
                  <Share2 size={16} className="text-[var(--muted-foreground)]" />
                </button>
              </div>
            </div>

            <h1 className="text-[var(--choco-900)] mb-2" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <p className="text-[var(--muted-foreground)] mb-4">{product.subtitle}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className={i < Math.floor(product.rating) ? "text-[var(--gold-500)]" : "text-gray-300"} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--choco-800)]">{product.rating}</span>
              <span className="text-sm text-[var(--muted-foreground)]">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2rem", fontWeight: 700 }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[var(--muted-foreground)] line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs border border-[var(--border)] text-[var(--muted-foreground)]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[var(--choco-800)] mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
                  <button
                    className="w-10 h-10 flex items-center justify-center hover:bg-[var(--cream-200)] transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    className="w-10 h-10 flex items-center justify-center hover:bg-[var(--cream-200)] transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {product.stockCount <= 15 && (
                  <span className="text-xs text-red-500 font-medium">Only {product.stockCount} left in stock</span>
                )}
              </div>
            </div>

            {/* Gift Options */}
            <div className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--gold-100)] space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 accent-[var(--gold-500)]"
                />
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-[var(--gold-600)]" />
                  <span className="text-sm font-medium text-[var(--choco-800)]">Add Premium Gift Wrap (+₹49)</span>
                </div>
              </label>
              <div>
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message (handwritten on our card)..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                  maxLength={150}
                />
                <p className="text-xs text-right text-[var(--muted-foreground)] mt-1">{message.length}/150</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                className="flex-1 py-4 rounded-xl font-semibold border-2 border-[var(--choco-700)] text-[var(--choco-800)] hover:bg-[var(--choco-800)] hover:text-white transition-all"
              >
                Buy Now
              </button>
            </div>

            {/* Pincode Checker */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2 flex items-center gap-1">
                <Truck size={13} /> Check delivery availability
              </label>
              <div className="flex gap-2">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                />
                <button className="px-4 py-2.5 rounded-lg bg-[var(--choco-800)] text-white text-sm font-medium">
                  Check
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
              {[
                { icon: Truck, label: "Free Delivery", sub: "Above ₹999" },
                { icon: Shield, label: "100% Authentic", sub: "Quality Guaranteed" },
                { icon: RefreshCw, label: "Easy Returns", sub: "Within 48 hours" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="mx-auto mb-1 text-[var(--gold-600)]" />
                  <p className="text-xs font-semibold text-[var(--choco-800)]">{label}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-[var(--border)]">
            {(["description", "ingredients", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-[var(--gold-500)] text-[var(--choco-800)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--choco-800)]"
                }`}
              >
                {tab === "reviews" ? `Reviews (${product.reviewCount})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="max-w-2xl">
                <p className="text-[var(--choco-800)] leading-relaxed" style={{ fontSize: "1.05rem" }}>{product.description}</p>
                <div className="mt-6 grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Leaf, label: "Natural", desc: "No artificial additives" },
                    { icon: Award, label: "Award-Winning", desc: "Internationally recognized" },
                    { icon: Package, label: product.weight, desc: "Net weight" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="p-4 rounded-xl bg-[var(--cream-100)] flex gap-3">
                      <Icon size={18} className="text-[var(--gold-600)] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--choco-800)]">{label}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ingredients" && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--choco-800)] mb-2">Ingredients</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{product.ingredients}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--choco-800)] mb-2">Allergen Information</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{product.allergens}</p>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] italic">
                  Manufactured in a facility that also processes milk, nuts, gluten, and soy.
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 max-w-2xl">
                {[
                  { name: "Shreya R.", rating: 5, date: "Jun 2026", text: "Absolutely divine. The texture is silky smooth and the flavor is perfectly balanced. Will definitely order again." },
                  { name: "Anand M.", rating: 5, date: "May 2026", text: "Best chocolate I've had in India. Period. The packaging is stunning too — made it a perfect gift." },
                  { name: "Nisha P.", rating: 4, date: "May 2026", text: "Really impressive quality. Complex flavors that unfold as it melts. Just wish there was a bigger size option!" },
                ].map((r, i) => (
                  <div key={i} className="p-5 rounded-xl bg-white border border-[var(--border)]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm text-[var(--choco-800)]">{r.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{r.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={13} className={j < r.rating ? "text-[var(--gold-500)]" : "text-gray-200"} fill={j < r.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)]">{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-2xl">
          <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-semibold text-[var(--choco-800)]">{faq.q}</span>
                  <ChevronDown size={16} className={`text-[var(--muted-foreground)] transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-[var(--muted-foreground)] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="mb-8" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700 }}>
              You May Also Love
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

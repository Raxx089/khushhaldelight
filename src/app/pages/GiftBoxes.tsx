import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Check, ArrowRight, Gift, Sparkles, Heart } from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { toast } from "sonner";

const giftBoxSizes = [
  { id: "small", label: "Sweet Start", pieces: 9, price: 799, desc: "Perfect for a thoughtful gesture" },
  { id: "medium", label: "Classic Collection", pieces: 16, price: 1299, desc: "Our most popular size" },
  { id: "large", label: "Grand Celebration", pieces: 24, price: 1899, desc: "For truly special occasions" },
  { id: "premium", label: "Royal Experience", pieces: 32, price: 2799, desc: "The ultimate luxury gift" },
];

const chocolateOptions = [
  { id: "c1", name: "Noir 85%", flavor: "Dark", img: "https://images.unsplash.com/photo-1592290321458-49b80f943a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c2", name: "Hazelnut Praline", flavor: "Milk", img: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c3", name: "Salted Caramel", flavor: "Dark", img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c4", name: "Rose & Raspberry", flavor: "White", img: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c5", name: "Mint Dark", flavor: "Dark", img: "https://images.unsplash.com/photo-1623000850293-0cbbc517c719?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c6", name: "White Truffle", flavor: "White", img: "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c7", name: "Passion Fruit", flavor: "Dark", img: "https://images.unsplash.com/photo-1542843137-8791a6904d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
  { id: "c8", name: "Almond & Sea Salt", flavor: "Dark", img: "https://images.unsplash.com/photo-1720029106261-0d0396bb270d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100" },
];

const giftBoxProducts = products.filter((p) => p.category === "Gift Boxes");

const occasions = [
  { label: "Birthday", emoji: "🎂" },
  { label: "Anniversary", emoji: "💕" },
  { label: "Wedding", emoji: "💍" },
  { label: "Diwali", emoji: "✨" },
  { label: "Christmas", emoji: "🎄" },
  { label: "Valentine's Day", emoji: "❤️" },
  { label: "Corporate", emoji: "💼" },
  { label: "Just Because", emoji: "🎁" },
];

export function GiftBoxes() {
  const [selectedSize, setSelectedSize] = useState("medium");
  const [selectedChocolates, setSelectedChocolates] = useState<string[]>([]);
  const [giftMessage, setGiftMessage] = useState("");
  const [giftWrap, setGiftWrap] = useState(true);
  const { dispatch } = useCart();

  const selectedSizeData = giftBoxSizes.find((s) => s.id === selectedSize)!;

  const toggleChocolate = (id: string) => {
    if (selectedChocolates.includes(id)) {
      setSelectedChocolates(selectedChocolates.filter((c) => c !== id));
    } else if (selectedChocolates.length < selectedSizeData.pieces) {
      setSelectedChocolates([...selectedChocolates, id]);
    }
  };

  const handleAddCustomBox = () => {
    const mockProduct = {
      id: `custom-${Date.now()}`,
      name: `Custom ${selectedSizeData.label}`,
      subtitle: `${selectedChocolates.length} chocolates, handpicked by you`,
      price: selectedSizeData.price,
      image: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      images: [],
      category: "Gift Boxes",
      flavor: "Assorted",
      weight: `${selectedSizeData.pieces * 15}g`,
      rating: 5,
      reviewCount: 0,
      description: "",
      ingredients: "",
      allergens: "",
      inStock: true,
      stockCount: 99,
      tags: ["custom", "gift"],
    };
    dispatch({ type: "ADD_ITEM", product: mockProduct });
    toast.success("Custom gift box added to cart!", { description: `${selectedSizeData.pieces} pieces · ₹${selectedSizeData.price.toLocaleString("en-IN")}` });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden text-center">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }} />
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">For Every Occasion</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 700 }}>
              The Art of Gifting
            </h1>
            <p className="text-[var(--cream-300)] text-lg leading-relaxed">
              Handpick your chocolates, personalize your message, and create a gift that will never be forgotten.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Ready-made Gift Boxes */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Ready to Give</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700 }}>
            Curated Gift Collections
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {giftBoxProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* Build Your Box */}
      <section id="builder" className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "var(--cream-100)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Personalized</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700 }}>
              Build Your Own Box
            </h2>
            <p className="text-[var(--muted-foreground)] mt-3">Choose your box size, select your chocolates, and add a personal touch.</p>
          </div>

          {/* Step 1: Size */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[var(--choco-800)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--choco-800)] text-white text-xs flex items-center justify-center">1</span>
              Choose Box Size
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {giftBoxSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => { setSelectedSize(size.id); setSelectedChocolates([]); }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    selectedSize === size.id ? "border-[var(--gold-500)] shadow-md" : "border-[var(--border)] hover:border-[var(--gold-300)]"
                  }`}
                  style={selectedSize === size.id ? { background: "var(--gold-100)" } : { background: "white" }}
                >
                  <p className="font-bold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>{size.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{size.pieces} pieces</p>
                  <p className="text-sm font-bold mt-2" style={{ color: "var(--choco-800)" }}>₹{size.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{size.desc}</p>
                  {selectedSize === size.id && <Check size={16} className="mt-2 text-[var(--gold-600)]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Chocolates */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[var(--choco-800)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--choco-800)] text-white text-xs flex items-center justify-center">2</span>
              Pick Your Chocolates ({selectedChocolates.length}/{selectedSizeData.pieces})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {chocolateOptions.map((c) => {
                const isSelected = selectedChocolates.includes(c.id);
                const count = selectedChocolates.filter((id) => id === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleChocolate(c.id)}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                      isSelected ? "border-[var(--gold-500)]" : "border-[var(--border)] hover:border-[var(--gold-300)]"
                    }`}
                    style={isSelected ? { background: "var(--gold-100)" } : { background: "white" }}
                  >
                    <img src={c.img} alt={c.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                    <p className="text-xs font-semibold text-[var(--choco-800)]">{c.name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{c.flavor}</p>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--choco-950)]" style={{ background: "var(--gold-400)" }}>
                        <Check size={10} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedChocolates.length < selectedSizeData.pieces && (
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Select {selectedSizeData.pieces - selectedChocolates.length} more chocolate{selectedSizeData.pieces - selectedChocolates.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Step 3: Message */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[var(--choco-800)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--choco-800)] text-white text-xs flex items-center justify-center">3</span>
              Personal Touch
            </h3>
            <div className="bg-white rounded-2xl p-6 border border-[var(--border)] space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-2">Gift Message (handwritten on a premium card)</label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Write your heartfelt message here..."
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] resize-none"
                />
                <p className="text-xs text-right text-[var(--muted-foreground)] mt-1">{giftMessage.length}/200</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 accent-[var(--gold-500)]"
                />
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-[var(--gold-600)]" />
                  <span className="text-sm font-medium text-[var(--choco-800)]">Premium Gift Wrapping (+₹49)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Occasions */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[var(--choco-800)] uppercase tracking-wider mb-4">Shop by Occasion</h3>
            <div className="flex flex-wrap gap-3">
              {occasions.map((o) => (
                <button
                  key={o.label}
                  className="px-4 py-2.5 rounded-full border border-[var(--border)] bg-white text-sm hover:border-[var(--gold-400)] transition-colors flex items-center gap-2"
                >
                  <span>{o.emoji}</span>
                  <span className="text-[var(--choco-800)]">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddCustomBox}
            disabled={selectedChocolates.length === 0}
            className="w-full py-5 rounded-2xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
          >
            <Sparkles size={20} />
            Add Custom Box to Cart — ₹{selectedSizeData.price.toLocaleString("en-IN")}
          </button>
        </div>
      </section>

      {/* Festive */}
      <section id="festive" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Seasonal</p>
        <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: "1rem" }}>
          Festive Collection
        </h2>
        <p className="text-[var(--muted-foreground)] max-w-lg mx-auto mb-12">
          Limited edition chocolates crafted specially for India's most cherished celebrations.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Diwali Collection", desc: "A luminous box of gold-dusted chocolates inspired by the festival of lights.", img: "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", price: "₹1,999" },
            { title: "Wedding Favors", desc: "Custom-branded boxes for your perfect day. Minimum 50 boxes.", img: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", price: "From ₹299/box" },
            { title: "Holiday Box", desc: "Christmas and New Year edition with seasonal flavors and festive packaging.", img: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", price: "₹2,499" },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl overflow-hidden border border-[var(--border)] group">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 text-left">
                  <h3 className="text-white font-bold" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem" }}>{f.title}</h3>
                  <p className="text-[var(--gold-300)] text-sm font-semibold">{f.price}</p>
                </div>
              </div>
              <div className="p-5 text-left bg-white">
                <p className="text-sm text-[var(--muted-foreground)]">{f.desc}</p>
                <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--gold-600)] hover:gap-2 transition-all">
                  Shop Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

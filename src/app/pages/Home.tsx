import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ArrowRight, Star, ChevronLeft, ChevronRight, Sparkles, Package, Truck, Award, Leaf, ShieldCheck } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { getBestSellers, getNewArrivals } from "../data/products";

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=1920",
    video: "/src/imports/main.mp4"",
    title: "The Art of Chocolate",
    subtitle: "Handcrafted from the world's finest single-origin cacao",
    cta: "Explore Collection",
    ctaHref: "/shop",
  },
  {
    url: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=1920",
    video: "/src/imports/main.mp4",
    title: "Gift Extraordinaire",
    subtitle: "Curated luxury gift boxes for every occasion",
    cta: "Shop Gift Boxes",
    ctaHref: "/gift-boxes",
  },
  {
    url: "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=1920",
    video: "/src/imports/main.mp4",
    title: "Corporate Elegance",
    subtitle: "Bespoke gifting solutions for discerning businesses",
    cta: "Corporate Gifting",
    ctaHref: "/corporate",
  },
];

const reviews = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Khushhal Delight is unlike anything I've tasted. The 85% Noir Intense is hauntingly good — complex, smooth, and absolutely addictive. I've been ordering every month.",
    avatar: "PS",
  },
  {
    name: "Rahul Verma",
    location: "Delhi",
    rating: 5,
    text: "We ordered the Signature Collection for our board meeting. The presentation was stunning, and our clients were genuinely impressed. Worth every rupee.",
    avatar: "RV",
  },
  {
    name: "Aisha Khan",
    location: "Bangalore",
    rating: 5,
    text: "The Salted Caramel Truffles are pure poetry. My husband loves them. The gift packaging alone is frame-worthy — we kept the box for months.",
    avatar: "AK",
  },
  {
    name: "Vikram Nair",
    location: "Chennai",
    rating: 5,
    text: "I've gifted Khushhal Delight at two weddings now. Both couples were blown away. Their festive box is the only gift anyone talks about.",
    avatar: "VN",
  },
  {
    name: "Meera Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "The Madagascar 72% changed how I think about chocolate. I actually took notes while eating it — notes! That's how complex it is.",
    avatar: "MP",
  },
];

const whyChooseUs = [
  { icon: Leaf, title: "100% Natural", desc: "No artificial flavors, colors, or preservatives. Pure cacao, pure joy." },
  { icon: Award, title: "Award-Winning", desc: "Winner of 12 international chocolate awards, including the Academy of Chocolate." },
  { icon: Package, title: "Luxury Packaging", desc: "Each box is a gift in itself — sustainably sourced, endlessly beautiful." },
  { icon: Truck, title: "Same-Day Dispatch", desc: "Order before 2 PM for same-day dispatch across 500+ cities in India." },
  { icon: ShieldCheck, title: "Quality Guaranteed", desc: "100% satisfaction or a full refund. No questions asked, ever." },
  { icon: Sparkles, title: "Handcrafted Daily", desc: "Made fresh every morning in small batches by our master chocolatiers." },
];

const instagramImages = [
  "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  "https://images.unsplash.com/photo-1542843137-8791a6904d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  "https://images.unsplash.com/photo-1549007994-cb92caebd54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  "https://images.unsplash.com/photo-1481391319762-47dff72954d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
  "https://images.unsplash.com/photo-1592290321458-49b80f943a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
];

export function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [reviewIdx, setReviewIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const bestSellers = getBestSellers();
  const newArrivals = getNewArrivals();

  const visibleReviews = 3;
  const maxReviewIdx = Math.max(0, reviews.length - visibleReviews);

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <AnimatePresence mode="wait">
            <motion.video
              key={heroIdx}
              src={heroImages[heroIdx].video}
              poster={heroImages[heroIdx].url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,13,6,0.85) 0%, rgba(26,13,6,0.3) 60%, transparent 100%)" }} />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full"
          style={{ opacity: heroOpacity }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <motion.p
                className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                ✦ Khushhal Delight · Est. 2018
              </motion.p>
              <h1
                className="text-white mb-6 font-sans-brand"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 700, lineHeight: 1.1 }}
              >
                {heroImages[heroIdx].title}
              </h1>
              <p className="text-white/80 text-lg mb-8 leading-relaxed">
                {heroImages[heroIdx].subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroImages[heroIdx].ctaHref}
                  className="px-8 py-4 rounded-full font-semibold flex items-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                >
                  {heroImages[heroIdx].cta}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 rounded-full font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Hero Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`transition-all duration-300 rounded-full ${i === heroIdx ? "w-8 h-2 bg-[var(--gold-400)]" : "w-2 h-2 bg-white/40"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setHeroIdx((p) => (p - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => setHeroIdx((p) => (p + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {/* ── Trust Strip ── */}
      <section className="bg-[var(--choco-800)] py-4 overflow-hidden">
        <div className="flex gap-12 animate-marquee whitespace-nowrap" style={{ animation: "marquee 20s linear infinite" }}>
          {[...Array(3)].flatMap(() => [
            "✦ Handcrafted Daily",
            "✦ Free Shipping Above ₹999",
            "✦ 100% Natural Ingredients",
            "✦ Premium Belgian Techniques",
            "✦ Gift Packaging Included",
            "✦ 50,000+ Happy Customers",
          ]).map((text, i) => (
            <span key={i} className="text-[var(--gold-300)] text-sm tracking-wider mx-6">
              {text}
            </span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Our Finest</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--choco-900)", fontWeight: 700 }}>
            Best Sellers
          </h2>
          <p className="text-[var(--muted-foreground)] mt-3 max-w-md mx-auto">
            The chocolates our customers come back for, again and again.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[var(--choco-700)] text-[var(--choco-800)] font-semibold hover:bg-[var(--choco-800)] hover:text-white transition-all duration-200"
          >
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Collections Banner ── */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/gift-boxes" className="group relative overflow-hidden rounded-3xl aspect-[4/3] block">
            <img
              src="https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Gift Boxes"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,13,6,0.85) 0%, rgba(26,13,6,0.2) 60%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="text-[var(--gold-300)] text-xs tracking-widest uppercase mb-2">Gift Boxes</p>
              <h3 className="text-white mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>
                The Perfect Gift
              </h3>
              <span className="inline-flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                Shop Gift Boxes <ArrowRight size={16} />
              </span>
            </div>
          </Link>
          <Link to="/corporate" className="group relative overflow-hidden rounded-3xl aspect-[4/3] block">
            <img
              src="https://images.unsplash.com/photo-1573013792262-761a3e17fb39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Corporate"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,13,6,0.85) 0%, rgba(26,13,6,0.2) 60%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 p-8">
              <p className="text-[var(--gold-300)] text-xs tracking-widest uppercase mb-2">Corporate</p>
              <h3 className="text-white mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>
                Corporate Gifting
              </h3>
              <span className="inline-flex items-center gap-2 text-white/90 text-sm font-medium group-hover:gap-3 transition-all">
                Explore Solutions <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Just Arrived</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--choco-900)", fontWeight: 700 }}>
              New Arrivals
            </h2>
          </div>
          <Link to="/shop?filter=new" className="text-[var(--choco-700)] text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {newArrivals.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* ── Build Your Box ── */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">Personalized</p>
            <h2 className="text-white mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>
              Build Your Own Box
            </h2>
            <p className="text-[var(--cream-300)] text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Choose from over 40 chocolate varieties, select your box size, add a personalized message, and create the ultimate bespoke gift.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              {["Choose Chocolates", "Select Box Size", "Add Your Message", "Gift Wrap"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[var(--choco-950)]"
                    style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-[var(--cream-200)] text-sm">{step}</span>
                  {i < 3 && <ChevronRight size={14} className="text-[var(--gold-500)]" />}
                </div>
              ))}
            </div>
            <Link
              to="/gift-boxes#builder"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-semibold text-[var(--choco-950)] transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
            >
              Start Building <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">The Khushhal Promise</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--choco-900)", fontWeight: 700 }}>
            Why Choose Us
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {whyChooseUs.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 lg:p-8 rounded-2xl border border-[var(--border)] hover:border-[var(--gold-400)] hover:shadow-lg transition-all duration-300"
              style={{ background: "var(--cream-50)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, var(--gold-100), var(--gold-300))" }}
              >
                <Icon size={22} style={{ color: "var(--choco-700)" }} />
              </div>
              <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.1rem", fontWeight: 600 }}>
                {title}
              </h3>
              <p className="text-[var(--muted-foreground)] text-sm mt-2 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Reviews ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: "var(--cream-100)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">What They Say</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--choco-900)", fontWeight: 700 }}>
              Loved by Thousands
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={18} className="text-[var(--gold-500)]" fill="currentColor" />
              ))}
              <span className="text-[var(--choco-700)] font-semibold ml-2">4.9/5</span>
              <span className="text-[var(--muted-foreground)] text-sm">from 2,400+ reviews</span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6"
                animate={{ x: `-${reviewIdx * (100 / visibleReviews)}%` }}
                transition={{ type: "spring", damping: 30 }}
              >
                {reviews.map((review, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] p-8 rounded-2xl bg-white shadow-sm border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-1 mb-4">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={14} className="text-[var(--gold-500)]" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-[var(--choco-800)] leading-relaxed mb-6 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>
                      "{review.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "var(--choco-700)" }}
                      >
                        {review.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--choco-800)] text-sm">{review.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{review.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
                disabled={reviewIdx === 0}
                className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center disabled:opacity-40 hover:bg-[var(--cream-200)] transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setReviewIdx(Math.min(maxReviewIdx, reviewIdx + 1))}
                disabled={reviewIdx >= maxReviewIdx}
                className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center disabled:opacity-40 hover:bg-[var(--cream-200)] transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Instagram Feed ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">@khushhaldelight</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--choco-900)", fontWeight: 700 }}>
            Life in Chocolate
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {instagramImages.map((src, i) => (
            <motion.a
              key={i}
              href="#"
              className="group relative overflow-hidden rounded-xl aspect-square block"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[var(--choco-950)]/0 group-hover:bg-[var(--choco-950)]/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">View</span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4" style={{ background: "var(--choco-950)" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "50K+", label: "Happy Customers" },
            { number: "40+", label: "Chocolate Varieties" },
            { number: "12", label: "Awards Won" },
            { number: "500+", label: "Cities Delivered" },
          ].map(({ number, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "var(--gold-400)" }}>
                {number}
              </p>
              <p className="text-[var(--cream-300)] text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Corporate Banner ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden relative"
          style={{ minHeight: 300 }}
        >
          <img
            src="https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
            alt="Corporate Gifting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,13,6,0.9) 0%, rgba(26,13,6,0.4) 100%)" }} />
          <div className="relative z-10 p-10 md:p-16 max-w-lg">
            <p className="text-[var(--gold-300)] uppercase tracking-widest text-xs mb-4">For Businesses</p>
            <h2 className="text-white mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700 }}>
              Corporate Gifting Made Exceptional
            </h2>
            <p className="text-[var(--cream-300)] mb-8 leading-relaxed">
              Minimum 10 boxes with custom branding, personalized notes, and dedicated account management. Make your clients feel truly valued.
            </p>
            <Link
              to="/corporate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-[var(--choco-950)] transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
            >
              Get a Quote <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}


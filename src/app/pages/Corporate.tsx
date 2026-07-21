import { motion } from "motion/react";
import { useState } from "react";
import { CheckCircle, Building, Users, Package, Award, ArrowRight, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

const benefits = [
  { icon: Package, title: "Custom Branding", desc: "Your company logo elegantly embossed on the box lid and ribbon." },
  { icon: Users, title: "Bulk Orders", desc: "From 10 to 10,000 boxes — we scale with your needs." },
  { icon: Award, title: "Premium Quality", desc: "The same handcrafted quality that wins international awards." },
  { icon: Building, title: "Dedicated Manager", desc: "A dedicated account manager for seamless coordination." },
];

const packages = [
  {
    name: "Starter",
    pieces: 9,
    price: 649,
    minQty: 10,
    features: ["Custom message card", "Premium box", "Standard delivery"],
    popular: false,
  },
  {
    name: "Business",
    pieces: 16,
    price: 999,
    minQty: 25,
    features: ["Custom branding on box", "Personalized message cards", "Priority dispatch", "GST invoice"],
    popular: true,
  },
  {
    name: "Enterprise",
    pieces: 32,
    price: 2499,
    minQty: 50,
    features: ["Full custom branding", "Individual personalization", "Dedicated account manager", "GST invoice", "Bulk discount 15%"],
    popular: false,
  },
];

const clients = [
  "TATA Group", "Infosys", "HUL", "Reliance", "HDFC Bank", "Google India",
  "Deloitte", "McKinsey", "Wipro", "Amazon India",
];

export function Corporate() {
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", phone: "",
    quantity: "", occasion: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Inquiry submitted!", { description: "Our corporate team will contact you within 4 business hours." });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative py-28 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573013792262-761a3e17fb39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Corporate Gifting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,13,6,0.92) 0%, rgba(26,13,6,0.5) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">For Businesses</p>
            <h1 className="text-white mb-5" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.15 }}>
              Corporate Gifting<br />That Truly Impresses
            </h1>
            <p className="text-[var(--cream-300)] text-lg leading-relaxed mb-8">
              From Diwali hampers to employee appreciation gifts, we create memorable chocolate experiences for your brand.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#inquiry" className="px-8 py-4 rounded-full font-semibold text-[var(--choco-950)]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                Get a Quote
              </a>
              <a href="tel:+919876543210" className="px-8 py-4 rounded-full font-semibold text-white border border-white/40 flex items-center gap-2 hover:bg-white/10 transition-colors">
                <Phone size={16} /> Call Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clients */}
      <div className="bg-[var(--cream-100)] py-8 overflow-hidden border-y border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3 px-6">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest whitespace-nowrap">Trusted by</p>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-2 px-6 scrollbar-hide">
          {clients.map((c) => (
            <span key={c} className="text-sm font-semibold text-[var(--choco-700)] whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">{c}</span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Why Khushhal Delight</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            The Corporate Advantage
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-[var(--border)] text-center"
              style={{ background: "var(--cream-50)" }}
            >
              <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--gold-100), var(--gold-300))" }}>
                <Icon size={22} style={{ color: "var(--choco-700)" }} />
              </div>
              <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.05rem", fontWeight: 600 }}>{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 px-4" style={{ background: "var(--cream-100)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Pricing</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
              Corporate Packages
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative rounded-3xl p-8 border-2 ${pkg.popular ? "border-[var(--gold-500)] shadow-xl" : "border-[var(--border)]"}`}
                style={{ background: pkg.popular ? "linear-gradient(135deg, var(--choco-950), var(--choco-800))" : "white" }}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-bold text-[var(--choco-950)]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: pkg.popular ? "white" : "var(--choco-800)", fontSize: "1.3rem", fontWeight: 700 }}>
                  {pkg.name}
                </h3>
                <p className={`text-sm mt-1 ${pkg.popular ? "text-[var(--cream-300)]" : "text-[var(--muted-foreground)]"}`}>
                  {pkg.pieces} pieces per box
                </p>
                <div className="my-5">
                  <span style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2rem", fontWeight: 700, color: pkg.popular ? "var(--gold-400)" : "var(--choco-800)" }}>
                    ₹{pkg.price.toLocaleString("en-IN")}
                  </span>
                  <span className={`text-sm ml-1 ${pkg.popular ? "text-[var(--cream-300)]" : "text-[var(--muted-foreground)]"}`}>/box</span>
                </div>
                <p className={`text-xs font-medium mb-5 ${pkg.popular ? "text-[var(--gold-300)]" : "text-[var(--muted-foreground)]"}`}>
                  Min. {pkg.minQty} boxes
                </p>
                <ul className="space-y-2.5 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle size={15} className={pkg.popular ? "text-[var(--gold-400)]" : "text-emerald-500"} />
                      <span className={`text-sm ${pkg.popular ? "text-[var(--cream-200)]" : "text-[var(--choco-700)]"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#inquiry"
                  className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all ${
                    pkg.popular
                      ? "text-[var(--choco-950)]"
                      : "bg-[var(--choco-800)] text-white hover:bg-[var(--choco-700)]"
                  }`}
                  style={pkg.popular ? { background: "linear-gradient(135deg, #C9A227, #E8D5A3)" } : {}}
                >
                  Get Started <ArrowRight size={14} className="inline ml-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Get Started</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700 }}>
            Submit Your Inquiry
          </h2>
          <p className="text-[var(--muted-foreground)] mt-3">We'll get back to you within 4 business hours with a custom quote.</p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-10 rounded-3xl border border-[var(--border)] bg-[var(--gold-100)]"
          >
            <CheckCircle size={56} className="mx-auto mb-4 text-emerald-500" />
            <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.5rem", fontWeight: 700 }}>
              Inquiry Received!
            </h3>
            <p className="text-[var(--muted-foreground)] mt-3">Our corporate team will contact you at {form.email} within 4 business hours.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-[var(--border)] shadow-sm space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Company Name *</label>
                <input required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Contact Name *</label>
                <input required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Work Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Phone *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Estimated Quantity *</label>
                <input required placeholder="e.g. 100 boxes" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Occasion</label>
                <select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]">
                  <option value="">Select occasion</option>
                  <option>Diwali</option><option>Christmas</option><option>Employee Appreciation</option>
                  <option>Client Gifting</option><option>Conference</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Additional Requirements</label>
              <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about branding requirements, delivery timeline, special requests..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] resize-none" />
            </div>
            <button type="submit" className="w-full py-4 rounded-xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
              Submit Inquiry <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4 text-center sm:text-left">
          <a href="tel:+919876543210" className="flex items-center justify-center gap-2 text-sm text-[var(--choco-800)] font-medium hover:text-[var(--gold-600)] transition-colors">
            <Phone size={16} className="text-[var(--gold-500)]" /> +91 98765 43210
          </a>
          <a href="mailto:corporate@khushhaldelight.in" className="flex items-center justify-center gap-2 text-sm text-[var(--choco-800)] font-medium hover:text-[var(--gold-600)] transition-colors">
            <Mail size={16} className="text-[var(--gold-500)]" /> corporate@khushhaldelight.in
          </a>
        </div>
      </section>
    </div>
  );
}

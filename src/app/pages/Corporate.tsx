import { motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Building2, CheckCircle, Download, Leaf, Mail, MapPin, Phone, Truck } from "lucide-react";

const packages = [
  {
    name: "Executive Token",
    ideal: "Employee onboarding, event delegates, festive tokens",
    price: "₹399 – ₹549",
    minimum: "Min. 25 units",
    contents: [
      "1 custom embossed brand-logo chocolate bar (100g)",
      "4 artisanal roasted almond Rochers",
      "Branded sleeve packaging with company logo",
    ],
  },
  {
    name: "Signature Celebration",
    ideal: "Client appreciation, Diwali and New Year gifting",
    price: "₹899 – ₹1,299",
    minimum: "Min. 15 units",
    contents: [
      "1 custom name or message chocolate bar",
      "8 assorted Belgian-style bonbons and truffles",
      "Jar of slow-roasted spiced almonds (100g)",
      "Rigid keepsake box with metallic foil logo print",
    ],
    popular: true,
  },
  {
    name: "Royale Keepsake Hamper",
    ideal: "CXO gifting, milestones and VIP partners",
    price: "₹1,899 – ₹2,999",
    minimum: "Min. 10 units",
    contents: [
      "2 artisanal single-origin slabs (55% and 70%)",
      "12 gourmet truffles and pralines",
      "Premium hazelnut and cashew jars (200g total)",
      "Hand-poured soy wax aromatherapy candle",
      "Magnetic wooden chest with laser-engraved metal plaque",
    ],
  },
];

const benefits = [
  {
    icon: Building2,
    title: "Custom Brand Integration",
    description: "Company logos embossed on chocolates or stamped on elegant gold and silver foil gift bands.",
  },
  {
    icon: Leaf,
    title: "Pure & Thoughtful Quality",
    description: "100% vegetarian recipes, made without preservatives or artificial hydrogenated oils.",
  },
  {
    icon: Truck,
    title: "Climate-Safe Pan-India Transit",
    description: "Insulated packaging and reusable food-grade ice packs help protect chocolates in transit.",
  },
  {
    icon: MapPin,
    title: "Multi-Address Delivery",
    description: "Coordinate one corporate order with individual door-to-door deliveries for teams and clients.",
  },
];

const phoneNumber = "+91 87967 29435";
const whatsappNumber = "918796729435";
const brochurePath = "/Khushhal_Delight_Corporate_Gifting_Catalog.pdf";

export function Corporate() {
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    quantity: "",
    occasion: "",
    message: "",
  });

  const inquiryDetails = [
    `Company: ${form.companyName}`,
    `Contact: ${form.contactName}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone}`,
    `Estimated quantity: ${form.quantity}`,
    `Occasion: ${form.occasion || "Not specified"}`,
    `Requirements: ${form.message || "Not specified"}`,
  ].join("\n");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = `mailto:corporate@khushhaldelight.in?subject=${encodeURIComponent("Corporate gifting inquiry")}&body=${encodeURIComponent(inquiryDetails)}`;
  };

  const sendWhatsAppInquiry = () => {
    const message = `Hello Khushhal Delight, I'm interested in corporate gifting.\n\n${inquiryDetails}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      <section className="relative overflow-hidden bg-[var(--choco-950)] py-20 sm:py-28">
        <img
          src="https://images.unsplash.com/photo-1573013792262-761a3e17fb39?auto=format&fit=crop&w=2000&q=85"
          alt="Thoughtfully presented chocolate gifts"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0d06]/95 via-[#1a0d06]/80 to-[#1a0d06]/30" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[var(--gold-300)]">KHUSHHAL DELIGHT · GURUGRAM, NCR</p>
            <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.3rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.12 }}>
              Artisanal Handmade Chocolates &amp; Bespoke Corporate Hampers
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--cream-200)] sm:text-lg">
              Elevate corporate gifting beyond standard sweets. Handcrafted with couverture-grade ingredients and tailored to your brand identity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inquiry" className="rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8d5a3] px-7 py-3.5 text-sm font-semibold text-[var(--choco-950)]">
                Plan a Corporate Gift <ArrowRight size={16} className="ml-1 inline" />
              </a>
              <a href={brochurePath} download className="flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                <Download size={16} /> Download the Catalog
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--cream-200)]">
              <span className="flex items-center gap-2"><Mail size={15} className="text-[var(--gold-300)]" />corporate@khushhaldelight.in</span>
              <a href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-white"><Phone size={15} className="text-[var(--gold-300)]" />{phoneNumber}</a>
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[var(--gold-300)]" />Gurugram, NCR</span>
            </div>
            <p className="mt-4 text-xs text-[var(--cream-300)]">FSSAI registration details can be shared with your corporate inquiry.</p>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--cream-100)] px-5 py-5 text-center">
        <p className="mx-auto max-w-4xl text-sm italic leading-relaxed text-[var(--choco-800)] sm:text-base">
          “Elevate corporate gifting beyond standard sweets. Handcrafted with pure couverture-grade ingredients, zero compound wax, and tailored to your brand identity.”
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto mb-11 max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--gold-600)]">Made for meaningful moments</p>
          <h2 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.7rem)", fontWeight: 700 }}>
            Corporate Hamper Packages
          </h2>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">Indicative per-unit pricing. Final quote depends on customization, quantity and delivery locations.</p>
        </div>
        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {packages.map((pkg) => (
            <article key={pkg.name} className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 ${pkg.popular ? "border-[var(--gold-500)] bg-[var(--choco-950)] text-white shadow-xl" : "border-[var(--border)] bg-white"}`}>
              {pkg.popular && <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-[#c9a227] to-[#e8d5a3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--choco-950)]">Popular choice</span>}
              <h3 className={`text-xl font-bold ${pkg.popular ? "text-white" : "text-[var(--choco-800)]"}`} style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>{pkg.name}</h3>
              <p className={`mt-2 min-h-10 text-sm ${pkg.popular ? "text-[var(--cream-300)]" : "text-[var(--muted-foreground)]"}`}>{pkg.ideal}</p>
              <p className={`mt-5 text-2xl font-bold ${pkg.popular ? "text-[var(--gold-300)]" : "text-[var(--choco-800)]"}`}>{pkg.price}</p>
              <p className={`mt-1 text-xs font-medium ${pkg.popular ? "text-[var(--cream-300)]" : "text-[var(--muted-foreground)]"}`}>{pkg.minimum} · indicative per unit</p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-current/10 pt-5">
                {pkg.contents.map((item) => (
                  <li key={item} className={`flex gap-2.5 text-sm leading-relaxed ${pkg.popular ? "text-[var(--cream-200)]" : "text-[var(--choco-700)]"}`}>
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-[var(--gold-500)]" />{item}
                  </li>
                ))}
              </ul>
              <a href="#inquiry" className={`mt-7 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${pkg.popular ? "bg-gradient-to-r from-[#c9a227] to-[#e8d5a3] text-[var(--choco-950)]" : "bg-[var(--cream-100)] text-[var(--choco-800)] hover:bg-[var(--cream-200)]"}`}>
                Enquire about this hamper <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--gold-600)]">The Khushhal difference</p>
            <h2 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              Why corporates choose Khushhal Delight
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--cream-50)] p-5">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[var(--gold-100)] text-[var(--gold-600)]"><Icon size={21} /></div>
                <h3 className="text-base font-semibold text-[var(--choco-800)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="inquiry" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--gold-600)]">Start a conversation</p>
          <h2 className="text-[var(--choco-900)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700 }}>
            Let’s make your next gift memorable.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">Share a few details and your email app will open with a ready-to-send inquiry. Our team can help with samples, branding and multi-address delivery.</p>
          <a href={brochurePath} download className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--gold-500)] bg-white px-4 py-3 text-sm font-semibold text-[var(--choco-800)] hover:bg-[var(--gold-100)]">
            <Download size={17} /> Download the one-page catalog
          </a>
          <div className="mt-6 space-y-3 text-sm text-[var(--choco-700)]">
            <a href="mailto:corporate@khushhaldelight.in" className="flex items-center gap-2 hover:text-[var(--gold-600)]"><Mail size={16} />corporate@khushhaldelight.in</a>
            <a href={`tel:${phoneNumber.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-[var(--gold-600)]"><Phone size={16} />{phoneNumber}</a>
            <button type="button" onClick={sendWhatsAppInquiry} className="flex items-center gap-2 hover:text-[var(--gold-600)]"><Phone size={16} />WhatsApp our gifting team</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput label="Company name" required value={form.companyName} onChange={(value) => setForm({ ...form, companyName: value })} />
            <FormInput label="Contact name" required value={form.contactName} onChange={(value) => setForm({ ...form, contactName: value })} />
            <FormInput label="Work email" required type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <FormInput label="Phone" required type="tel" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <FormInput label="Estimated quantity" required placeholder="e.g. 100 units" value={form.quantity} onChange={(value) => setForm({ ...form, quantity: value })} />
            <label className="block text-xs font-semibold text-[var(--choco-800)]">
              Occasion
              <select value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]">
                <option value="">Select an occasion</option>
                <option>Diwali / festive gifting</option>
                <option>Employee onboarding</option>
                <option>Client appreciation</option>
                <option>Conference or event</option>
                <option>Milestone celebration</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-[var(--choco-800)]">
            Branding, timing or delivery requirements
            <textarea rows={4} maxLength={1000} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Share your branding needs, delivery timeline or multi-address requirements..." className="mt-1.5 w-full resize-y rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
          </label>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8d5a3] px-5 py-4 text-sm font-semibold text-[var(--choco-950)]">
            Prepare Email Inquiry <ArrowRight size={17} />
          </button>
          <p className="text-center text-[11px] text-[var(--muted-foreground)]">Your details are added to an email draft on your device; this form does not submit data to a server.</p>
        </form>
      </section>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-[var(--choco-800)]">
      {label}{required && <span aria-hidden="true"> *</span>}
      <input required={required} type={type} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
    </label>
  );
}

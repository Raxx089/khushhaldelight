import { useState } from "react";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Clock, ChevronDown, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const faqs = [
  { q: "What are your delivery timelines?", a: "We dispatch orders placed before 2 PM on the same day via express courier. Standard delivery takes 1–3 business days depending on your location. Metro cities like Mumbai, Delhi, Bangalore receive next-day delivery." },
  { q: "Can I customize a gift box?", a: "Absolutely! Visit our Gift Boxes page to build your own custom box — choose your chocolates, box size, and add a personalized message. For corporate orders, we offer full branding customization." },
  { q: "Do you ship internationally?", a: "Currently we ship within India only. We're working on international shipping — sign up for our newsletter to be notified when it launches." },
  { q: "What if my chocolates arrive damaged?", a: "We guarantee perfect delivery. If your chocolates arrive damaged or melted due to packaging failure, contact us within 24 hours with photos and we'll send a fresh replacement at no charge." },
  { q: "How should I store my chocolates?", a: "Store in a cool, dry place between 15–18°C, away from direct sunlight and strong odors. Avoid refrigeration as it can cause sugar bloom. Our chocolates have a shelf life of 30–45 days." },
  { q: "Do you offer bulk/wholesale pricing?", a: "Yes! For orders above 50 boxes, we offer special wholesale pricing. Contact our corporate team at corporate@khushhaldelight.in for a custom quote." },
  { q: "Are your chocolates vegan?", a: "Several of our products are vegan — they're clearly labeled on the product page. Our dark chocolate bars (70%+) and many truffles are made without any animal products." },
  { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards (Visa, Mastercard, Amex), net banking, digital wallets (Google Pay, PhonePe, Paytm), and Cash on Delivery." },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent!", { description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-20 text-center" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">Get In Touch</p>
          <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700 }}>
            Contact Us
          </h1>
          <p className="text-[var(--cream-300)] mt-3 max-w-md mx-auto">
            We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-4">Reach Us</p>
              <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700 }}>
                We're Here to Help
              </h2>
            </div>

            {[
              {
                icon: Phone,
                title: "Phone",
                lines: ["+91 98765 43210", "Mon–Sat, 9 AM–7 PM IST"],
              },
              {
                icon: Mail,
                title: "Email",
                lines: ["hello@khushhaldelight.in", "Replies within 24 hours"],
              },
              {
                icon: MapPin,
                title: "Visit Us",
                lines: ["42 Cocoa Lane, Bandra West", "Mumbai, Maharashtra 400050"],
              },
              {
                icon: Clock,
                title: "Hours",
                lines: ["Monday – Saturday: 9 AM – 7 PM", "Sunday: 10 AM – 5 PM"],
              },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-[var(--border)] bg-white shadow-sm">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, var(--gold-100), var(--gold-300))" }}>
                  <Icon size={20} style={{ color: "var(--choco-700)" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>{title}</p>
                  {lines.map((l, i) => (
                    <p key={i} className="text-sm text-[var(--muted-foreground)] mt-0.5">{l}</p>
                  ))}
                </div>
              </div>
            ))}

            {/* Live Chat */}
            <button className="w-full p-5 rounded-2xl border-2 border-dashed border-[var(--gold-400)] flex items-center gap-3 text-left hover:bg-[var(--gold-100)] transition-colors" style={{ background: "var(--gold-100)" }}>
              <MessageCircle size={20} className="text-[var(--gold-600)] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[var(--choco-800)]">Live Chat Support</p>
                <p className="text-xs text-[var(--muted-foreground)]">Usually replies in under 5 minutes</p>
              </div>
            </button>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-white border border-[var(--border)]"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                  <Send size={36} className="text-[var(--choco-950)]" />
                </div>
                <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "2rem", fontWeight: 700 }}>
                  Message Sent!
                </h2>
                <p className="text-[var(--muted-foreground)] mt-3 max-w-xs">
                  Thank you for reaching out. We'll get back to you at {form.email} within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-[var(--border)] shadow-sm space-y-5">
                <div>
                  <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-2">Send a Message</p>
                  <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    How can we help?
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Full Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Email Address *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Subject *</label>
                  <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]">
                    <option value="">Select a subject...</option>
                    <option>Order Inquiry</option>
                    <option>Delivery Issue</option>
                    <option>Product Information</option>
                    <option>Corporate Gifting</option>
                    <option>Returns & Refunds</option>
                    <option>Partnership Inquiry</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Your Message *</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] resize-none" />
                </div>

                <button type="submit" className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)] transition-transform hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQs */}
        <section id="faqs" className="mt-20">
          <div className="text-center mb-12">
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Quick Answers</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[var(--border)] rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--cream-50)] transition-colors"
                >
                  <span className="font-semibold text-sm text-[var(--choco-800)] pr-4">{faq.q}</span>
                  <ChevronDown size={18} className={`text-[var(--muted-foreground)] shrink-0 transition-transform ${expandedFaq === i ? "rotate-180" : ""}`} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: expandedFaq === i ? "auto" : 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm text-[var(--muted-foreground)] leading-relaxed">{faq.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

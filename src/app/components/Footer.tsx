import { Link } from "react-router";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, Heart } from "lucide-react";
import logoImg from "../../imports/ChatGPT_Image_Jul_19__2026__07_47_05_PM.png";

const footerLinks = {
  Shop: [
    { label: "All Chocolates", href: "/shop" },
    { label: "Dark Chocolate", href: "/shop?category=Dark+Chocolate" },
    { label: "Gift Boxes", href: "/gift-boxes" },
    { label: "Truffles", href: "/shop?category=Truffles" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Best Sellers", href: "/shop?filter=bestseller" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Ingredients", href: "/about#ingredients" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/about#careers" },
    { label: "Press", href: "/about#press" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/account#orders" },
    { label: "FAQs", href: "/contact#faqs" },
    { label: "Shipping Policy", href: "/contact#shipping" },
    { label: "Refund Policy", href: "/contact#refunds" },
    { label: "Privacy Policy", href: "/contact#privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--choco-950)] text-[var(--cream-200)]">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.5rem" }}>
                Sweeten Your Inbox
              </h3>
              <p className="text-[var(--cream-300)] text-sm mt-1">
                Join 50,000+ chocolate lovers for exclusive offers, new arrivals & stories.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] text-sm"
              />
              <button
                className="px-6 py-3 rounded-lg text-[var(--choco-950)] text-sm font-semibold whitespace-nowrap"
                style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex mb-6">
              <img
                src={logoImg}
                alt="Khushhal Delight"
                className="h-20 w-auto object-contain rounded-full"
                style={{ filter: "drop-shadow(0 2px 12px rgba(201,162,39,0.4))" }}
              />
            </Link>
            <p className="text-sm text-[var(--cream-300)] leading-relaxed max-w-xs">
              Handcrafted luxury chocolates crafted with love, made to delight. Every piece tells a story of passion, craft, and uncompromising quality.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { Icon: Instagram, href: "#" },
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Youtube, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[var(--gold-500)] hover:text-[var(--choco-950)] transition-all duration-200 text-[var(--cream-300)]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm text-[var(--cream-300)]">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[var(--gold-400)] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[var(--gold-400)] shrink-0" />
                <span>hello@khushhaldelight.in</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[var(--gold-400)] shrink-0 mt-0.5" />
                <span>42 Cocoa Lane, Bandra West, Mumbai 400050</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4
                className="text-white mb-4"
                style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1rem", fontWeight: 600 }}
              >
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[var(--cream-300)] hover:text-[var(--gold-400)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--cream-300)]">
            © 2026 Khushhal Delight. All rights reserved. Made with{" "}
            <Heart size={10} className="inline text-[var(--gold-500)]" fill="currentColor" /> in India.
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--cream-300)]">
            <Link to="/contact#privacy" className="hover:text-[var(--gold-400)] transition-colors">Privacy</Link>
            <Link to="/contact#terms" className="hover:text-[var(--gold-400)] transition-colors">Terms</Link>
            <Link to="/contact#refunds" className="hover:text-[var(--gold-400)] transition-colors">Refunds</Link>
          </div>
          {/* Payment Icons */}
          <div className="flex items-center gap-2">
            {["Visa", "Mastercard", "UPI", "GPay", "PayTM"].map((p) => (
              <span
                key={p}
                className="px-2 py-1 rounded bg-white/10 text-[10px] text-[var(--cream-300)]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

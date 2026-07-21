import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Phone
} from "lucide-react";
import { useCart } from "../context/CartContext";
import logoImg from "../../imports/ChatGPT_Image_Jul_19__2026__07_47_05_PM.png";

const navLinks = [
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "All Chocolates", href: "/shop" },
      { label: "Dark Chocolate", href: "/shop?category=Dark+Chocolate" },
      { label: "Milk Chocolate", href: "/shop?category=Milk+Chocolate" },
      { label: "Truffles & Bonbons", href: "/shop?category=Truffles" },
      { label: "New Arrivals", href: "/shop?filter=new" },
      { label: "Best Sellers", href: "/shop?filter=bestseller" },
    ],
  },
  {
    label: "Gift Boxes",
    href: "/gift-boxes",
    children: [
      { label: "All Gift Boxes", href: "/gift-boxes" },
      { label: "Corporate Gifting", href: "/corporate" },
      { label: "Build Your Box", href: "/gift-boxes#builder" },
      { label: "Festive Collection", href: "/gift-boxes#festive" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, dispatch } = useCart();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const navBg = isScrolled || !isHomePage
    ? "bg-white/95 backdrop-blur-lg shadow-sm border-b border-[var(--border)]"
    : "bg-transparent";

  const textColor = isScrolled || !isHomePage ? "text-[var(--choco-900)]" : "text-white";

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[var(--choco-900)] text-[var(--gold-300)] text-xs py-2 px-4 text-center hidden md:flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Phone size={11} />
          +91 98765 43210
        </span>
        <span>Free shipping on orders above ₹999 · Same-day dispatch before 2 PM</span>
        <span>✦ Use code <strong>WELCOME10</strong> for 10% off your first order · Crafted with Love, Made to Delight</span>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logoImg}
                alt="Khushhal Delight"
                className="h-12 md:h-14 w-auto object-contain rounded-full"
                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 text-sm tracking-wide transition-colors hover:opacity-70 ${textColor}`}
                    style={{ fontWeight: 500, letterSpacing: "0.05em" }}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={14} />}
                  </Link>

                  {link.children && (
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-2 w-52 rounded-xl shadow-xl overflow-hidden"
                          style={{
                            background: "rgba(255,251,245,0.97)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(201,162,39,0.2)",
                          }}
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-5 py-3 text-sm text-[var(--choco-800)] hover:bg-[var(--cream-200)] transition-colors"
                              style={{ fontWeight: 400 }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors hover:opacity-70 ${textColor}`}
              >
                <Search size={20} />
              </button>
              <Link
                to="/account"
                className={`p-2 rounded-full transition-colors hover:opacity-70 hidden sm:flex ${textColor}`}
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => dispatch({ type: "OPEN_CART" })}
                className={`relative p-2 rounded-full transition-colors hover:opacity-70 ${textColor}`}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "var(--gold-500)" }}
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
              <button
                className={`lg:hidden p-2 rounded-full transition-colors hover:opacity-70 ${textColor}`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for chocolates, gift boxes, flavors..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--cream-100)] border border-[var(--border)] text-[var(--choco-900)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-white border-t border-[var(--border)]"
            >
              <div className="px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      to={link.href}
                      className="block py-3 text-[var(--choco-800)] border-b border-[var(--border)] last:border-0"
                      style={{ fontWeight: 500 }}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 space-y-1 py-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--choco-800)] transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-4 pb-2 flex justify-center">
                  <img src={logoImg} alt="Khushhal Delight" className="h-16 w-auto object-contain rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg bg-[var(--choco-800)] text-white text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/account" className="flex-1 text-center py-2.5 rounded-lg border border-[var(--choco-800)] text-[var(--choco-800)] text-sm font-medium">
                    My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

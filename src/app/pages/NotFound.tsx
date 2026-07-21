import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingBag, Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20" style={{ background: "var(--cream-50)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-lg"
      >
        <div className="relative mb-8">
          <p
            className="font-bold text-[var(--cream-200)] select-none"
            style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(8rem, 20vw, 14rem)", lineHeight: 1 }}
          >
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl">🍫</span>
            </div>
          </div>
        </div>

        <h1 className="mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "2rem", fontWeight: 700 }}>
          Lost in the Chocolate Factory?
        </h1>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-8">
          This page seems to have melted away. But don't worry — there's plenty more chocolate where you came from.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-[var(--choco-950)]"
            style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
          >
            <Home size={18} /> Back to Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold border-2 border-[var(--choco-700)] text-[var(--choco-800)] hover:bg-[var(--choco-800)] hover:text-white transition-all"
          >
            <ShoppingBag size={18} /> Shop Chocolates
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

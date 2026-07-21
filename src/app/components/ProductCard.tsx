import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { useCart } from "../context/CartContext";
import type { Product } from "../data/products";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({ type: "ADD_ITEM", product });
    toast.success(`${product.name} added to cart`, {
      description: "Your cart has been updated.",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-2xl bg-[var(--cream-100)] aspect-square">
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.05 : 1 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />

          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-[var(--choco-950)]/30"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.badge && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "linear-gradient(135deg, #C9A227, #E8D5A3)",
                  color: "var(--choco-950)",
                }}
              >
                {product.badge}
              </span>
            )}
            {product.isNew && !product.badge && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                New
              </span>
            )}
            {product.stockCount <= 15 && product.inStock && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
                Only {product.stockCount} left
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                size={16}
                className={isWishlisted ? "text-red-500" : "text-[var(--choco-700)]"}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </motion.button>
            <motion.div
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              <Link
                to={`/product/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Eye size={16} className="text-[var(--choco-700)]" />
              </Link>
            </motion.div>
          </div>

          {/* Quick Add Button */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3"
            animate={{ y: isHovered ? 0 : 60, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-[var(--choco-950)]"
              style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
            >
              <ShoppingBag size={15} />
              Add to Cart
            </button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="mt-4 px-1">
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3
            className="text-[var(--choco-900)] group-hover:text-[var(--choco-700)] transition-colors"
            style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1rem", fontWeight: 600 }}
          >
            {product.name}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{product.subtitle}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(product.rating) ? "text-[var(--gold-500)]" : "text-gray-300"}
                  fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[var(--choco-800)]"
              style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.1rem", fontWeight: 700 }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-[var(--muted-foreground)] line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {discount}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

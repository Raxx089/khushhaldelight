import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from "lucide-react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { products, categories, flavors } from "../data/products";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Best Rated", value: "rating" },
  { label: "Newest", value: "new" },
];

const occasions = ["All", "Birthday", "Anniversary", "Wedding", "Corporate", "Diwali", "Valentine's Day", "Christmas"];
const weights = ["All", "Under 100g", "100g–200g", "200g–500g", "500g+"];

export function Shop() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedFlavor, setSelectedFlavor] = useState("All");
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filterFlag = searchParams.get("filter");

  const filtered = useMemo(() => {
    let result = [...products];

    if (filterFlag === "new") result = result.filter((p) => p.isNew);
    if (filterFlag === "bestseller") result = result.filter((p) => p.isBestSeller);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.flavor.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    if (selectedCategory !== "All") result = result.filter((p) => p.category === selectedCategory);
    if (selectedFlavor !== "All") result = result.filter((p) => p.flavor === selectedFlavor);

    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [search, selectedCategory, selectedFlavor, priceRange, sortBy, filterFlag]);

  const activeFilters = [
    selectedCategory !== "All" && selectedCategory,
    selectedFlavor !== "All" && selectedFlavor,
    selectedOccasion !== "All" && selectedOccasion,
    filterFlag && `${filterFlag === "new" ? "New Arrivals" : "Best Sellers"}`,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="py-16 text-center" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-3">Explore</p>
        <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700 }}>
          {filterFlag === "new" ? "New Arrivals" : filterFlag === "bestseller" ? "Best Sellers" : "The Chocolate Shop"}
        </h1>
        <p className="text-[var(--cream-300)] mt-3">
          {filtered.length} products found
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chocolates..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium hover:border-[var(--gold-400)] transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full text-[11px] font-bold text-[var(--choco-950)] flex items-center justify-center" style={{ background: "var(--gold-400)" }}>
                  {activeFilters.length}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-9 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)] cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]" />
            </div>

            <div className="flex border border-[var(--border)] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-3 transition-colors ${viewMode === "grid" ? "bg-[var(--choco-800)] text-white" : "hover:bg-[var(--cream-100)]"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-3 transition-colors ${viewMode === "list" ? "bg-[var(--choco-800)] text-white" : "hover:bg-[var(--cream-100)]"}`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ background: "var(--gold-100)", borderColor: "var(--gold-300)", color: "var(--choco-800)" }}
              >
                {f}
                <button
                  onClick={() => {
                    if (f === selectedCategory) setSelectedCategory("All");
                    if (f === selectedFlavor) setSelectedFlavor("All");
                    if (f === selectedOccasion) setSelectedOccasion("All");
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setSelectedCategory("All"); setSelectedFlavor("All"); setSelectedOccasion("All"); }}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--choco-800)] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-64 shrink-0 hidden md:block"
            >
              <div className="sticky top-24 space-y-6">
                {/* Category */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--choco-800)] mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
                    Category
                  </h3>
                  <div className="space-y-2">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCategory(c)}
                        className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === c
                            ? "bg-[var(--choco-800)] text-white font-medium"
                            : "text-[var(--muted-foreground)] hover:bg-[var(--cream-200)] hover:text-[var(--choco-800)]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--choco-800)] mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
                    Flavor
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {flavors.map((f) => (
                      <button
                        key={f}
                        onClick={() => setSelectedFlavor(f)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          selectedFlavor === f
                            ? "border-[var(--gold-500)] text-[var(--choco-800)] font-medium"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold-400)]"
                        }`}
                        style={selectedFlavor === f ? { background: "var(--gold-100)" } : {}}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-sm font-semibold text-[var(--choco-800)] mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
                    Price Range
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-2">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-[var(--gold-500)]"
                  />
                </div>
              </div>
            </motion.aside>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[var(--muted-foreground)] text-lg">No chocolates found matching your criteria.</p>
                <button
                  onClick={() => { setSearch(""); setSelectedCategory("All"); setSelectedFlavor("All"); }}
                  className="mt-4 text-[var(--gold-600)] font-medium hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                showFilters
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}>
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

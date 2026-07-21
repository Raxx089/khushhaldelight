import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight, Clock, User, Tag } from "lucide-react";

const posts = [
  {
    id: "1",
    title: "The Science Behind Chocolate Tempering: Why It Matters",
    excerpt: "Discover why the precise temperature control during chocolate making results in that satisfying snap and glossy finish you love.",
    category: "Craft",
    author: "Arjun Mehta",
    readTime: "7 min",
    date: "Jul 18, 2026",
    img: "https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    featured: true,
  },
  {
    id: "2",
    title: "Single-Origin vs Blended Chocolate: What's the Difference?",
    excerpt: "From terroir to taste — we explore why the origin of your cacao beans matters more than you think.",
    category: "Education",
    author: "Priya Nair",
    readTime: "5 min",
    date: "Jul 10, 2026",
    img: "https://images.unsplash.com/photo-1592290321458-49b80f943a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: "3",
    title: "How to Pair Chocolate with Wine: A Sommelier's Guide",
    excerpt: "Learn to create extraordinary taste experiences by matching the right chocolate with the perfect glass of wine.",
    category: "Pairing",
    author: "Rohit Das",
    readTime: "6 min",
    date: "Jul 3, 2026",
    img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: "4",
    title: "The Story of Madagascar Cacao: From Forest to Bar",
    excerpt: "A journey to the remote forests of Madagascar, where our finest cacao is hand-harvested by third-generation farmers.",
    category: "Origin",
    author: "Rohit Das",
    readTime: "9 min",
    date: "Jun 25, 2026",
    img: "https://images.unsplash.com/photo-1573710661345-610f790e1218?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: "5",
    title: "5 Health Benefits of Dark Chocolate Backed by Science",
    excerpt: "Beyond the pleasure, dark chocolate packs surprising health benefits — from antioxidants to heart health.",
    category: "Health",
    author: "Priya Nair",
    readTime: "4 min",
    date: "Jun 18, 2026",
    img: "https://images.unsplash.com/photo-1542843137-8791a6904d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
  {
    id: "6",
    title: "Corporate Gifting with Chocolate: A Guide for HR Teams",
    excerpt: "How premium chocolate gifts drive employee satisfaction, client retention, and brand perception.",
    category: "Corporate",
    author: "Arjun Mehta",
    readTime: "5 min",
    date: "Jun 12, 2026",
    img: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
  },
];

const categories = ["All", "Craft", "Education", "Pairing", "Origin", "Health", "Corporate", "Recipes"];

export function Blog() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="py-20 text-center" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">The Chocolate Journal</p>
          <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700 }}>
            Stories & Craft
          </h1>
          <p className="text-[var(--cream-300)] mt-3 max-w-md mx-auto">
            Explore the world of artisan chocolate — from bean to bar, from craft to culture.
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((c) => (
            <button
              key={c}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                c === "All"
                  ? "text-[var(--choco-950)] border-[var(--gold-400)]"
                  : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--gold-400)]"
              }`}
              style={c === "All" ? { background: "linear-gradient(135deg, #C9A227, #E8D5A3)" } : {}}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8 mb-12 rounded-3xl overflow-hidden border border-[var(--border)] bg-white shadow-sm"
        >
          <div className="relative overflow-hidden aspect-video md:aspect-auto">
            <img src={posts[0].img} alt={posts[0].title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-bold text-[var(--choco-950)]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                Featured
              </span>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--cream-100)] text-[var(--choco-700)]">
                {posts[0].category}
              </span>
              <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <Clock size={12} /> {posts[0].readTime} read
              </span>
            </div>
            <h2 className="mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.3 }}>
              {posts[0].title}
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">{posts[0].excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <User size={14} />
                <span>{posts[0].author}</span>
                <span>·</span>
                <span>{posts[0].date}</span>
              </div>
              <Link to={`/blog/${posts[0].id}`} className="flex items-center gap-1 text-sm font-semibold text-[var(--gold-600)] hover:gap-2 transition-all">
                Read More <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group bg-white rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 text-[var(--choco-700)]">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-3">
                  <span className="flex items-center gap-1"><Clock size={11} /> {post.readTime}</span>
                  <span>{post.date}</span>
                </div>
                <h3 className="mb-3 group-hover:text-[var(--choco-600)] transition-colors" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.4 }}>
                  {post.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                    <User size={11} /> {post.author}
                  </span>
                  <Link to={`/blog/${post.id}`} className="text-xs font-semibold text-[var(--gold-600)] flex items-center gap-1 hover:gap-2 transition-all">
                    Read <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 p-10 rounded-3xl text-center" style={{ background: "linear-gradient(135deg, var(--choco-950), var(--choco-800))" }}>
          <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-3">Never Miss a Story</p>
          <h2 className="text-white mb-3" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2rem", fontWeight: 700 }}>
            Subscribe to the Journal
          </h2>
          <p className="text-[var(--cream-300)] mb-6">Weekly stories about craft, origin, and the art of extraordinary chocolate.</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
            <button className="px-6 py-3 rounded-xl font-semibold text-[var(--choco-950)] text-sm" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

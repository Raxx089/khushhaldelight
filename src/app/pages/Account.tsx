import { useState } from "react";
import { motion } from "motion/react";
import { Package, Heart, Star, Gift, Bell, Settings, LogOut, ChevronRight, MapPin, CreditCard, Truck } from "lucide-react";

const orders = [
  { id: "MC20241201", date: "Dec 1, 2026", status: "Delivered", items: 3, total: 2750, statusColor: "text-emerald-600 bg-emerald-50" },
  { id: "MC20241118", date: "Nov 18, 2026", status: "Shipped", items: 1, total: 890, statusColor: "text-blue-600 bg-blue-50" },
  { id: "MC20241105", date: "Nov 5, 2026", status: "Delivered", items: 2, total: 1650, statusColor: "text-emerald-600 bg-emerald-50" },
  { id: "MC20241022", date: "Oct 22, 2026", status: "Delivered", items: 4, total: 3200, statusColor: "text-emerald-600 bg-emerald-50" },
];

const tabs = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "rewards", label: "Rewards", icon: Star },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Account() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="min-h-screen bg-[var(--cream-50)]">
      {/* Header */}
      <div className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0" style={{ background: "var(--choco-600)", fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>
            PS
          </div>
          <div>
            <h1 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.8rem", fontWeight: 700 }}>
              Priya Sharma
            </h1>
            <p className="text-[var(--cream-300)] text-sm">priya.sharma@example.com · Member since 2023</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs text-[var(--gold-300)]">
                <Star size={12} fill="currentColor" /> Gold Member
              </span>
              <span className="text-xs text-[var(--cream-300)]">1,240 reward points</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside>
            <nav className="space-y-1 sticky top-24">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? "text-[var(--choco-950)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--cream-200)]"
                  }`}
                  style={activeTab === id ? { background: "linear-gradient(135deg, #C9A227, #E8D5A3)" } : {}}
                >
                  <Icon size={17} />
                  {label}
                  <ChevronRight size={14} className="ml-auto" />
                </button>
              ))}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2">
                <LogOut size={17} />
                Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              {activeTab === "orders" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    My Orders
                  </h2>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-semibold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>#{order.id}</p>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.statusColor}`}>{order.status}</span>
                            </div>
                            <p className="text-sm text-[var(--muted-foreground)]">{order.date} · {order.items} items</p>
                          </div>
                          <div className="text-right sm:text-left">
                            <p className="font-bold text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem" }}>
                              ₹{order.total.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                          <button className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--cream-100)] text-[var(--choco-800)] flex items-center gap-1.5">
                            <Truck size={13} /> Track Order
                          </button>
                          <button className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--cream-100)] text-[var(--choco-800)] flex items-center gap-1.5">
                            <CreditCard size={13} /> View Invoice
                          </button>
                          <button className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--cream-100)] text-[var(--choco-800)] flex items-center gap-1.5">
                            <Package size={13} /> Reorder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "rewards" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    Reward Points
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5 mb-8">
                    <div className="p-6 rounded-2xl text-white" style={{ background: "linear-gradient(135deg, var(--choco-800), var(--choco-700))" }}>
                      <p className="text-[var(--cream-300)] text-sm mb-1">Total Points</p>
                      <p style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2.5rem", fontWeight: 700, color: "var(--gold-400)" }}>1,240</p>
                      <p className="text-[var(--cream-300)] text-xs mt-1">= ₹124 discount value</p>
                    </div>
                    <div className="p-6 rounded-2xl border border-[var(--border)] bg-white">
                      <p className="text-[var(--muted-foreground)] text-sm mb-1">Gold Member Status</p>
                      <p style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-600)" }}>
                        🌟 Gold
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1">
                          <span>1,240 pts</span><span>2,000 pts (Platinum)</span>
                        </div>
                        <div className="w-full bg-[var(--cream-200)] rounded-full h-2">
                          <div className="h-2 rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, #C9A227, #E8D5A3)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
                    <h3 className="font-semibold mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)" }}>How to Earn Points</h3>
                    <div className="space-y-3">
                      {[
                        { action: "Purchase", pts: "1 pt per ₹10 spent" },
                        { action: "Write a Review", pts: "50 pts per review" },
                        { action: "Refer a Friend", pts: "200 pts per referral" },
                        { action: "Birthday Bonus", pts: "100 pts on your birthday" },
                      ].map((item) => (
                        <div key={item.action} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                          <span className="text-sm text-[var(--choco-800)]">{item.action}</span>
                          <span className="text-sm font-semibold text-[var(--gold-600)]">{item.pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "wishlist" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    My Wishlist
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { name: "Signature Collection", price: 2200, img: "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
                      { name: "White Truffle Pearls", price: 1100, img: "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200" },
                    ].map((item) => (
                      <div key={item.name} className="flex gap-4 p-4 bg-white rounded-xl border border-[var(--border)]">
                        <img src={item.img} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[var(--choco-800)]" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>{item.name}</p>
                          <p className="text-[var(--gold-600)] font-bold mt-1" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>₹{item.price.toLocaleString("en-IN")}</p>
                          <button className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg text-[var(--choco-950)]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "addresses" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    Saved Addresses
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Home", address: "42, Linking Road, Bandra West, Mumbai 400050", default: true },
                      { label: "Office", address: "Level 12, BKC Tower, Bandra Kurla Complex, Mumbai 400051", default: false },
                    ].map((a) => (
                      <div key={a.label} className="p-5 rounded-xl border-2 bg-white" style={{ borderColor: a.default ? "var(--gold-400)" : "var(--border)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-[var(--choco-800)]">{a.label}</span>
                          {a.default && <span className="text-xs font-medium text-[var(--gold-600)] bg-[var(--gold-100)] px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{a.address}</p>
                        <div className="flex gap-3 mt-3">
                          <button className="text-xs font-medium text-[var(--choco-700)] hover:underline">Edit</button>
                          {!a.default && <button className="text-xs font-medium text-red-500 hover:underline">Delete</button>}
                        </div>
                      </div>
                    ))}
                    <button className="p-5 rounded-xl border-2 border-dashed border-[var(--border)] flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] hover:border-[var(--gold-400)] hover:text-[var(--choco-800)] transition-colors">
                      + Add New Address
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.5rem", fontWeight: 700 }}>
                    Account Settings
                  </h2>
                  <div className="bg-white rounded-2xl p-6 border border-[var(--border)] space-y-5">
                    {[
                      { label: "Full Name", value: "Priya Sharma" },
                      { label: "Email", value: "priya.sharma@example.com" },
                      { label: "Phone", value: "+91 98765 43210" },
                      { label: "Birthday", value: "March 15" },
                    ].map((field) => (
                      <div key={field.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                        <div>
                          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{field.label}</p>
                          <p className="text-sm text-[var(--choco-800)] mt-0.5">{field.value}</p>
                        </div>
                        <button className="text-xs font-medium text-[var(--gold-600)] hover:underline">Edit</button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-white rounded-2xl p-6 border border-[var(--border)]">
                    <h3 className="font-semibold mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)" }}>Notifications</h3>
                    {[
                      { label: "Order Updates", enabled: true },
                      { label: "New Arrivals", enabled: true },
                      { label: "Exclusive Offers", enabled: false },
                      { label: "Review Reminders", enabled: true },
                    ].map((n) => (
                      <div key={n.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                        <span className="text-sm text-[var(--choco-800)]">{n.label}</span>
                        <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${n.enabled ? "" : "bg-gray-200"}`} style={n.enabled ? { background: "var(--gold-500)" } : {}}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${n.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

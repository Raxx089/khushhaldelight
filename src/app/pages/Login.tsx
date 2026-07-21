import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Phone, ArrowRight, Chrome } from "lucide-react";
import logoImg from "../../imports/ChatGPT_Image_Jul_19__2026__07_47_05_PM.png";

type Mode = "login" | "register" | "otp";

export function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);

  const handleOtpChange = (idx: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden" style={{ background: "linear-gradient(135deg, var(--choco-950) 0%, var(--choco-800) 100%)" }}>
        <img
          src="https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="relative z-10">
          <Link to="/">
            <img src={logoImg} alt="Khushhal Delight" className="h-20 w-auto object-contain rounded-full" style={{ filter: "drop-shadow(0 2px 12px rgba(201,162,39,0.5))" }} />
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-white mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 }}>
            Welcome to<br />the World of<br />Luxury Chocolate
          </h2>
          <p className="text-[var(--cream-300)] leading-relaxed">
            Join 50,000+ chocolate lovers who receive exclusive offers, early access to new collections, and rewards with every order.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {["10% off your first order", "Free birthday chocolate", "Loyalty points on every purchase"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-[var(--cream-200)]">
                <span className="text-[var(--gold-400)]">✦</span> {b}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 p-6 rounded-2xl" style={{ background: "rgba(255,251,245,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,162,39,0.2)" }}>
          <p className="text-white/90 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem" }}>
            "Khushhal Delight has completely changed how I think about chocolate. Each piece is a work of art."
          </p>
          <p className="text-[var(--gold-300)] text-sm mt-2">— Priya S., Mumbai</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8 bg-[var(--cream-50)]">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <Link to="/" className="flex mb-8 lg:hidden">
            <img src={logoImg} alt="Khushhal Delight" className="h-16 w-auto object-contain rounded-full" />
          </Link>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)] mb-8">
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  mode === m ? "border-[var(--gold-500)] text-[var(--choco-800)]" : "border-transparent text-[var(--muted-foreground)]"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === "login" && (
                <form className="space-y-5">
                  <div>
                    <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700 }}>
                      Welcome Back
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Sign in to your Khushhal Delight account</p>
                  </div>

                  {/* Google */}
                  <button type="button" className="w-full py-3.5 rounded-xl border border-[var(--border)] bg-white flex items-center justify-center gap-3 text-sm font-medium text-[var(--choco-800)] hover:bg-[var(--cream-100)] transition-colors shadow-sm">
                    <Chrome size={18} className="text-blue-500" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">or sign in with email</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--choco-800)] uppercase tracking-wide">Password</label>
                      <button type="button" className="text-xs text-[var(--gold-600)] font-medium hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-4 rounded-xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                    Sign In <ArrowRight size={18} />
                  </button>

                  <button type="button" onClick={() => setMode("otp")} className="w-full py-3.5 rounded-xl border border-[var(--border)] bg-white text-sm font-medium text-[var(--choco-800)] flex items-center justify-center gap-2 hover:bg-[var(--cream-100)] transition-colors">
                    <Phone size={16} /> Sign in with OTP
                  </button>
                </form>
              )}

              {mode === "register" && (
                <form className="space-y-5">
                  <div>
                    <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700 }}>
                      Create Account
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Join Khushhal Delight and get 10% off your first order</p>
                  </div>

                  <button type="button" className="w-full py-3.5 rounded-xl border border-[var(--border)] bg-white flex items-center justify-center gap-3 text-sm font-medium hover:bg-[var(--cream-100)] transition-colors shadow-sm">
                    <Chrome size={18} className="text-blue-500" />
                    Sign up with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">or create with email</span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>

                  {[
                    { label: "Full Name", type: "text", key: "name", icon: null, placeholder: "Priya Sharma" },
                    { label: "Email Address", type: "email", key: "email", icon: Mail, placeholder: "you@example.com" },
                    { label: "Phone Number", type: "tel", key: "phone", icon: Phone, placeholder: "+91 98765 43210" },
                  ].map(({ label, type, key, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">{label}</label>
                      <div className="relative">
                        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />}
                        <input
                          type={type}
                          placeholder={placeholder}
                          className={`w-full ${Icon ? "pl-11" : "pl-4"} pr-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]`}
                        />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                        className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-[var(--gold-500)]" />
                    <span>I agree to the <Link to="/contact#terms" className="text-[var(--gold-600)]">Terms & Conditions</Link> and <Link to="/contact#privacy" className="text-[var(--gold-600)]">Privacy Policy</Link></span>
                  </label>

                  <button type="submit" className="w-full py-4 rounded-xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                    Create Account <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {mode === "otp" && (
                <div className="space-y-5">
                  <div>
                    <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "1.8rem", fontWeight: 700 }}>
                      {otpSent ? "Enter OTP" : "Sign in with OTP"}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                      {otpSent ? "Enter the 6-digit code sent to your mobile" : "We'll send a one-time password to your mobile"}
                    </p>
                  </div>

                  {!otpSent ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--choco-800)] mb-1.5 uppercase tracking-wide">Mobile Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                          <input type="tel" placeholder="+91 98765 43210"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                        </div>
                      </div>
                      <button
                        onClick={() => setOtpSent(true)}
                        className="w-full py-4 rounded-xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                        Send OTP <ArrowRight size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex gap-2 justify-center">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            className="w-11 h-12 text-center text-lg font-bold rounded-xl border-2 border-[var(--border)] focus:border-[var(--gold-500)] focus:outline-none"
                          />
                        ))}
                      </div>
                      <button className="w-full py-4 rounded-xl font-semibold text-[var(--choco-950)] flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                        Verify & Sign In <ArrowRight size={18} />
                      </button>
                      <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-[var(--muted-foreground)] text-center">
                        Change number? <span className="text-[var(--gold-600)] font-medium">Go back</span>
                      </button>
                    </>
                  )}

                  <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-[var(--muted-foreground)] text-center">
                    ← Back to email sign in
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

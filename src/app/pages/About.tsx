import { motion } from "motion/react";
import { Leaf, Award, Heart, Globe, Users, Star } from "lucide-react";

const milestones = [
  { year: "2018", title: "The Beginning", desc: "Khushhal Delight was born in a small Mumbai kitchen with a simple dream: to make India's finest chocolate." },
  { year: "2019", title: "First Award", desc: "Won the Academy of Chocolate Gold Award for our Madagascar 72% — our first international recognition." },
  { year: "2020", title: "Growing Family", desc: "Expanded to our artisan chocolate laboratory in Bandra, bringing on 12 master chocolatiers." },
  { year: "2021", title: "Going Direct", desc: "Launched our direct-to-consumer platform, delivering luxury to doorsteps across India." },
  { year: "2022", title: "10K Milestone", desc: "Crossed 10,000 happy customers and launched our signature corporate gifting program." },
  { year: "2026", title: "Today", desc: "50,000+ customers, 40+ chocolate varieties, 500+ cities, and a growing family of passionate chocolatiers." },
];

const team = [
  { name: "Arjun Mehta", role: "Founder & Master Chocolatier", img: "AM", desc: "Trained in Paris and Brussels. 15 years of chocolate mastery." },
  { name: "Priya Nair", role: "Head of Flavor Design", img: "PN", desc: "Spice sommelier turned chocolatier. Creator of our signature collections." },
  { name: "Rohit Das", role: "Sourcing Director", img: "RD", desc: "Travels the world to find the finest cacao. Madagascar to Ecuador." },
];

export function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493925410384-84f842e616fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Cacao beans"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,13,6,0.9) 0%, rgba(26,13,6,0.4) 100%)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-4">Our Story</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, lineHeight: 1.1 }}>
              Crafted with<br />
              <em>Passion & Precision</em>
            </h1>
            <p className="text-[var(--cream-300)] max-w-lg text-lg leading-relaxed">
              We believe chocolate is more than a confection — it's a story of terroir, craft, and connection.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-4">Our Philosophy</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.2 }}>
              From Bean to Bar,<br />Nothing is Compromised
            </h2>
            <p className="text-[var(--muted-foreground)] mt-5 leading-relaxed">
              Every chocolate we make begins with a single question: <em>"Is this the best it can possibly be?"</em> We source our cacao from the world's finest single-origin farms — places where the soil, climate, and the hands that harvest make all the difference.
            </p>
            <p className="text-[var(--muted-foreground)] mt-4 leading-relaxed">
              Our chocolatiers train for years to perfect the art of tempering, ganache-making, and hand-rolling. No shortcuts. No automation. Just craft.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: Leaf, label: "100% Natural" },
                { icon: Award, label: "Award-Winning" },
                { icon: Heart, label: "Handcrafted" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-[var(--cream-100)]">
                  <Icon size={22} className="mx-auto mb-2 text-[var(--gold-600)]" />
                  <p className="text-xs font-semibold text-[var(--choco-800)]">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <img
              src="https://images.unsplash.com/photo-1573710661345-610f790e1218?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Cacao fruits"
              className="rounded-3xl w-full object-cover aspect-square"
            />
            <div
              className="absolute -bottom-5 -right-5 p-5 rounded-2xl shadow-xl"
              style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}
            >
              <p className="text-[var(--choco-950)] font-bold text-2xl" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}>12</p>
              <p className="text-[var(--choco-700)] text-xs font-medium">International Awards</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4" style={{ background: "var(--cream-100)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Our Journey</p>
            <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
              8 Years of Chocolate Excellence
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-[var(--border)] hidden md:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col md:flex-row gap-6 items-center ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : ""}`}>
                    <div className="inline-block p-5 rounded-2xl bg-white border border-[var(--border)] shadow-sm max-w-sm">
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--gold-600)" }}>{m.year}</p>
                      <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.1rem", fontWeight: 600 }}>{m.title}</h3>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{m.desc}</p>
                    </div>
                  </div>
                  <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-[var(--choco-950)] font-bold text-sm shrink-0" style={{ background: "linear-gradient(135deg, #C9A227, #E8D5A3)" }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sourcing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Our Cacao</p>
          <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
            Where Our Cacao Comes From
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { region: "Ecuador", type: "Nacional Arriba", notes: "Floral, fruity, exceptionally smooth" },
            { region: "Madagascar", type: "Criollo", notes: "Red fruit, citrus, long complex finish" },
            { region: "Vietnam", type: "Trinitario", notes: "Earthy, woody, deep cocoa intensity" },
            { region: "Peru", type: "Fine Flavour", notes: "Nutty, caramel, remarkably balanced" },
            { region: "Ghana", type: "Forastero", notes: "Classic cocoa, robust, full-bodied" },
            { region: "Kerala, India", type: "Indian Heritage", notes: "Spice notes, tropical fruit, unique" },
          ].map((c) => (
            <motion.div
              key={c.region}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--gold-400)] transition-colors"
              style={{ background: "var(--cream-50)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-[var(--gold-600)]" />
                <span className="text-xs uppercase tracking-widest text-[var(--gold-600)] font-medium">{c.region}</span>
              </div>
              <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1.1rem", fontWeight: 600 }}>{c.type}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 italic">{c.notes}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4" style={{ background: "var(--choco-950)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--gold-300)] uppercase tracking-[0.4em] text-xs mb-3">The Artisans</p>
            <h2 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>
              Meet Our Chocolatiers
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: "linear-gradient(135deg, var(--choco-700), var(--choco-600))", fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif" }}
                >
                  {member.img}
                </div>
                <h3 className="text-white" style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", fontSize: "1.2rem", fontWeight: 600 }}>{member.name}</h3>
                <p className="text-[var(--gold-400)] text-sm mt-1">{member.role}</p>
                <p className="text-[var(--cream-300)] text-sm mt-3 leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <p className="text-[var(--gold-600)] uppercase tracking-[0.4em] text-xs mb-3">Our Values</p>
        <h2 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-900)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "1rem" }}>
          What We Stand For
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {[
            { icon: Leaf, title: "Sustainability", desc: "Ethically sourced cacao, eco-friendly packaging, zero waste production." },
            { icon: Users, title: "Fair Trade", desc: "We pay our farmers 40% above market rates and invest in their communities." },
            { icon: Heart, title: "Passion", desc: "Every chocolate is made with genuine love for the craft and the customer." },
            { icon: Star, title: "Excellence", desc: "We refuse to compromise. If it's not perfect, we start over." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: "var(--cream-50)" }}>
              <Icon size={24} className="mx-auto mb-4 text-[var(--gold-600)]" />
              <h3 style={{ fontFamily: "'Montserrat', 'DM Sans', system-ui, sans-serif", color: "var(--choco-800)", fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

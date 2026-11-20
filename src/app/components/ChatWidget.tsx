import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Bot, Check, ChevronDown, MessageCircle, Send, ShoppingBag, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import type { Product } from "../data/products";
import { callCommerce } from "../lib/commerce";

interface ChatProduct {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  flavor: string;
  weight: string;
  image: string;
  ingredients: string;
  allergens: string;
  pricePaise: number;
  available: number;
}

interface ChatMessage {
  role: "customer" | "assistant" | "agent";
  content: string;
  products?: ChatProduct[];
}

interface ChatSession {
  session_id: string;
  access_token: string;
}

const sessionStorageKey = "khushhal-delight-chat-session";
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "918796729435").replace(/\D/g, "");

function getChatSession(): ChatSession {
  try {
    const saved = window.localStorage.getItem(sessionStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as ChatSession;
      if (parsed.session_id && parsed.access_token) return parsed;
    }
  } catch {
    // Start a new session if browser storage is unavailable or invalid.
  }
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const session = {
    session_id: crypto.randomUUID(),
    access_token: Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(""),
  };
  try {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
  } catch {
    toast.error("Chat history will only stay available in this tab.");
  }
  return session;
}

function catalogProduct(product: ChatProduct): Product {
  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    price: product.pricePaise / 100,
    image: product.image,
    images: [product.image],
    category: product.category,
    flavor: product.flavor,
    weight: product.weight,
    rating: 0,
    reviewCount: 0,
    description: product.description,
    ingredients: product.ingredients,
    allergens: product.allergens,
    inStock: product.available > 0,
    stockCount: product.available,
    tags: [],
  };
}

function ChatProductCard({ product, onAdd }: { product: ChatProduct; onAdd: (product: ChatProduct) => void }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <img src={product.image} alt={product.name} className="h-28 w-full object-cover" loading="lazy" />
      <div className="p-3">
        <p className="line-clamp-1 text-xs font-semibold text-[var(--choco-900)]">{product.name}</p>
        <p className="mt-1 text-xs font-semibold text-[var(--gold-700)]">₹{(product.pricePaise / 100).toLocaleString("en-IN")}</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={product.available < 1}
            onClick={() => onAdd(product)}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[var(--choco-800)] px-2 py-2 text-[10px] font-semibold text-white disabled:opacity-50"
          >
            <ShoppingBag size={12} /> Add
          </button>
          <Link to={`/product/${product.id}`} className="rounded-lg border border-[var(--border)] px-2 py-2 text-[10px] font-medium text-[var(--choco-800)]">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ChatWidget() {
  const { dispatch } = useCart();
  const [open, setOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"open" | "handoff">("open");
  const [assistantAvailable, setAssistantAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowWelcome(false), 9000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;
    const session = getChatSession();
    callCommerce<{
      status?: "open" | "handoff";
      assistantAvailable?: boolean;
      messages?: { role: ChatMessage["role"]; content: string }[];
    }>("assistant-chat", { action: "history", ...session })
      .then((result) => {
        setStatus(result.status === "handoff" ? "handoff" : "open");
        setAssistantAvailable(result.assistantAvailable !== false);
        setMessages((result.messages ?? []).map((message) => ({ role: message.role, content: message.content })));
      })
      .catch((error) => {
        setAssistantAvailable(false);
        toast.error(error instanceof Error ? error.message : "Could not load chat history.");
      })
      .finally(() => setLoaded(true));
  }, [open, loaded]);

  useEffect(() => {
    if (!open || !loaded || status !== "handoff") return;
    const refresh = () => {
      callCommerce<{ status?: string; messages?: { role: ChatMessage["role"]; content: string }[] }>(
        "assistant-chat", { action: "history", ...getChatSession() },
      ).then((result) => {
        setStatus(result.status === "handoff" ? "handoff" : "open");
        setMessages((current) => {
          const updated = (result.messages ?? []).map((message) => ({ role: message.role, content: message.content }));
          return JSON.stringify(current.map(({ role, content }) => ({ role, content })))
            === JSON.stringify(updated) ? current : updated;
        });
      }).catch((error) => console.error("Could not refresh support chat", error));
    };
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [open, loaded, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const session = getChatSession();
    setInput("");
    setMessages((current) => [...current, { role: "customer", content: text }]);
    setLoading(true);
    try {
      const result = await callCommerce<{
        status: "open" | "handoff";
        assistantAvailable?: boolean;
        reply: string;
        products: ChatProduct[];
      }>("assistant-chat", { ...session, message: text });
      setStatus(result.status);
      setAssistantAvailable(result.assistantAvailable !== false && result.status === "open");
      setMessages((current) => [...current, { role: "assistant", content: result.reply, products: result.products }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Chat is temporarily unavailable.";
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: ChatProduct) => {
    dispatch({ type: "ADD_ITEM", product: catalogProduct(product) });
    toast.success(`${product.name} added to your cart.`);
    void callCommerce("assistant-chat", {
      action: "conversion",
      ...getChatSession(),
      product_id: product.id,
    }).catch((error) => toast.error(error instanceof Error ? `Added to cart, but chat analytics could not be saved: ${error.message}` : "Added to cart, but chat analytics could not be saved."));
  };

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi Khushhal Delight, I need help choosing chocolates.")}`;

  return (
    <>
      {showWelcome && !open && (
        <div className="fixed bottom-[5.75rem] right-5 z-40 max-w-[250px] rounded-2xl border border-[var(--gold-300)] bg-white px-4 py-3 text-xs text-[var(--choco-800)] shadow-xl">
          <button type="button" aria-label="Dismiss welcome" onClick={() => setShowWelcome(false)} className="absolute right-2 top-2 text-[var(--muted-foreground)]">
            <X size={13} />
          </button>
          <p className="pr-3 font-semibold">Need a chocolate gift recommendation?</p>
          <p className="mt-1 text-[var(--muted-foreground)]">Chat with our shopping assistant in English or Hindi.</p>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Khushhal Delight on WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={23} fill="currentColor" />
        </a>
        <button
          type="button"
          onClick={() => { setOpen((value) => !value); setShowWelcome(false); }}
          aria-label={open ? "Close chocolate assistant" : "Open chocolate assistant"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--choco-800)] text-[var(--gold-300)] shadow-lg transition-transform hover:scale-105"
        >
          {open ? <ChevronDown size={22} /> : <Sparkles size={22} />}
        </button>
      </div>

      {open && (
        <section className="fixed bottom-[5.25rem] right-4 z-40 flex h-[min(620px,calc(100dvh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--cream-50)] shadow-2xl sm:right-5">
          <header className="flex items-center justify-between bg-[var(--choco-800)] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[var(--gold-300)]"><Bot size={20} /></span>
              <div>
                <p className="text-sm font-semibold">Chocolate Concierge</p>
                <p className="flex items-center gap-1 text-[10px] text-[var(--cream-300)]">
                  <span className={`h-1.5 w-1.5 rounded-full ${assistantAvailable ? "bg-emerald-400" : "bg-amber-400"}`} />
                  {assistantAvailable ? "AI assistant available" : "AI setup needed"} · English & Hindi
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 hover:bg-white/10"><X size={17} /></button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="rounded-xl bg-white p-3 text-xs leading-relaxed text-[var(--choco-800)] shadow-sm">
                Welcome to Khushhal Delight! Tell me the occasion, who you’re gifting and your budget. I can recommend from our current catalog.
              </div>
            )}
            {messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`max-w-[95%] ${message.role === "customer" ? "ml-auto" : ""}`}>
                <div className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                  message.role === "customer" ? "bg-[var(--choco-800)] text-white" : "bg-white text-[var(--choco-900)] shadow-sm"
                }`}>
                  {message.content}
                  {message.role === "agent" && <span className="ml-1 inline-flex items-center gap-1 text-[10px] text-emerald-700"><Check size={11} /> Team</span>}
                </div>
                {!!message.products?.length && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {message.products.map((product) => (
                      <ChatProductCard key={product.id} product={product} onAdd={addProduct} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="w-fit rounded-xl bg-white px-3 py-2.5 text-xs text-[var(--muted-foreground)]">Finding a sweet match…</div>}
          </div>

          <div className="space-y-2 border-t border-[var(--border)] bg-white p-3">
            {status === "handoff" ? (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white">
                <MessageCircle size={15} /> Continue with our team on WhatsApp
              </a>
            ) : (
              <button type="button" onClick={() => { setInput("Please connect me with a human support agent."); }} className="text-[10px] font-medium text-[var(--gold-700)] hover:underline">
                Prefer a person? Request human support
              </button>
            )}
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1500}
                placeholder="Ask about chocolates or gifts…"
                aria-label="Message the chocolate assistant"
                className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--cream-50)] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[var(--gold-500)]"
              />
              <button type="submit" disabled={!input.trim() || loading} aria-label="Send message" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--choco-800)] text-white disabled:opacity-50">
                <Send size={15} />
              </button>
            </form>
            <p className="text-center text-[9px] text-[var(--muted-foreground)]">Product info is based on the live catalog. For allergy concerns, confirm with our team.</p>
          </div>
        </section>
      )}
    </>
  );
}

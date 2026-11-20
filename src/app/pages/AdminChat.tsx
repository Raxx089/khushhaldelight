import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Bot, Check, ChevronRight, CircleHelp, LogIn, LogOut, MessageSquare, RefreshCw, Send, Settings2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { callCommerce } from "../lib/commerce";
import { getSupabaseClient } from "../lib/supabase";

type ConversationStatus = "open" | "handoff" | "resolved";
interface Conversation {
  id: string;
  channel: "website" | "whatsapp";
  session_id: string | null;
  whatsapp_number: string | null;
  customer_name: string | null;
  status: ConversationStatus;
  assigned_admin: string | null;
  last_message_at: string;
  latest_message: { role: string; content: string; created_at: string } | null;
}
interface ChatMessage {
  id: string;
  role: "customer" | "assistant" | "agent" | "system";
  content: string;
  created_at: string;
}
interface FAQ {
  id: string;
  question: string;
  answer: string;
  active: boolean;
}

type AdminTab = "inbox" | "knowledge";

function formatTime(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminChat() {
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<AdminTab>("inbox");
  const [filter, setFilter] = useState<"all" | ConversationStatus>("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [analytics, setAnalytics] = useState({ total: 0, unresolved: 0, handoffs: 0, cartAdds: 0 });
  const [systemPrompt, setSystemPrompt] = useState("");
  const [assistantEnabled, setAssistantEnabled] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [editingFaq, setEditingFaq] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refreshInbox = useCallback(async () => {
    const [inbox, metrics] = await Promise.all([
      callCommerce<{ conversations: Conversation[] }>("admin-ops", { action: "chat-list", status: filter }),
      callCommerce<typeof analytics>("admin-ops", { action: "chat-analytics" }),
    ]);
    setConversations(inbox.conversations);
    setAnalytics(metrics);
    if (selectedId) {
      const history = await callCommerce<{ messages: ChatMessage[] }>("admin-ops", {
        action: "chat-messages", conversation_id: selectedId,
      });
      setMessages(history.messages);
    }
  }, [filter, selectedId]);

  const refreshSettings = useCallback(async () => {
    const result = await callCommerce<{
      settings: { system_prompt: string; enabled: boolean };
      faqs: FAQ[];
    }>("admin-ops", { action: "chat-settings" });
    setSystemPrompt(result.settings.system_prompt);
    setAssistantEnabled(result.settings.enabled);
    setFaqs(result.faqs);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshInbox(), refreshSettings()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refresh the admin dashboard.");
    } finally {
      setRefreshing(false);
    }
  }, [refreshInbox, refreshSettings]);

  useEffect(() => {
    Promise.resolve().then(() => getSupabaseClient().auth.getSession())
      .then(({ data, error }) => {
        if (error) throw error;
        setSignedIn(Boolean(data.session));
      })
      .catch((error) => setAuthError(error instanceof Error ? error.message : "Could not check the administrator session."))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (signedIn) void refresh();
  }, [signedIn, refresh]);

  useEffect(() => {
    if (!signedIn) return;
    const timer = window.setInterval(() => {
      void refreshInbox().catch((error) => console.error("Could not refresh the chat inbox", error));
    }, 10000);
    return () => window.clearInterval(timer);
  }, [signedIn, refreshInbox]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSignedIn(true);
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign in.");
    }
  };

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) toast.error(error.message);
    else {
      setSignedIn(false);
      setConversations([]);
      setMessages([]);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setSelectedId(conversation.id);
    try {
      const result = await callCommerce<{ messages: ChatMessage[] }>("admin-ops", {
        action: "chat-messages", conversation_id: conversation.id,
      });
      setMessages(result.messages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load chat history.");
    }
  };

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    const text = reply.trim();
    if (!selectedId || !text || sending) return;
    setSending(true);
    try {
      await callCommerce("admin-ops", { action: "chat-reply", conversation_id: selectedId, message: text });
      setReply("");
      await refreshInbox();
      toast.success("Reply sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reply.");
    } finally {
      setSending(false);
    }
  };

  const updateConversationStatus = async (status: ConversationStatus) => {
    if (!selectedId) return;
    try {
      await callCommerce("admin-ops", { action: "chat-status", conversation_id: selectedId, status });
      await refreshInbox();
      toast.success(`Conversation marked ${status}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update conversation.");
    }
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await callCommerce("admin-ops", {
        action: "chat-settings", update: true, system_prompt: systemPrompt, enabled: assistantEnabled,
      });
      toast.success("Assistant settings saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save assistant settings.");
    }
  };

  const saveFaq = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await callCommerce("admin-ops", {
        action: "chat-faq-save",
        ...(editingFaq ? { id: editingFaq } : {}),
        question: faqQuestion,
        answer: faqAnswer,
      });
      setFaqQuestion("");
      setFaqAnswer("");
      setEditingFaq("");
      await refreshSettings();
      toast.success("FAQ saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save FAQ.");
    }
  };

  const deleteFaq = async (id: string) => {
    try {
      await callCommerce("admin-ops", { action: "chat-faq-delete", id });
      await refreshSettings();
      toast.success("FAQ removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove FAQ.");
    }
  };

  if (!authChecked) return <div className="p-12 text-center text-sm text-[var(--muted-foreground)]">Checking administrator access…</div>;
  if (!signedIn) {
    return (
      <main className="min-h-[70vh] bg-[var(--cream-50)] px-4 py-16">
        <form onSubmit={signIn} className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-7 shadow-lg">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-100)] text-[var(--choco-800)]"><Bot size={23} /></div>
          <h1 className="text-2xl font-bold text-[var(--choco-900)]">Chat assistant admin</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Sign in with an administrator account enabled in Supabase.</p>
          <label className="mt-6 block text-xs font-semibold text-[var(--choco-800)]">Email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm" />
          </label>
          <label className="mt-4 block text-xs font-semibold text-[var(--choco-800)]">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm" />
          </label>
          {authError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{authError}</p>}
          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--choco-800)] px-4 py-3 text-sm font-semibold text-white"><LogIn size={16} /> Sign in</button>
          <Link to="/" className="mt-4 block text-center text-xs text-[var(--gold-700)] hover:underline">Return to storefront</Link>
        </form>
      </main>
    );
  }

  const selected = conversations.find((conversation) => conversation.id === selectedId);

  return (
    <main className="min-h-screen bg-[var(--cream-50)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold-700)]">Khushhal Delight</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--choco-900)]">Chat assistant dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/orders" className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--choco-800)]">Orders & products</Link>
            <button type="button" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh dashboard" className="rounded-lg border border-[var(--border)] bg-white p-2 text-[var(--choco-800)] disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /></button>
            <button type="button" onClick={() => void signOut()} className="flex items-center gap-1 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-[var(--choco-800)]"><LogOut size={14} /> Sign out</button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Conversations", analytics.total],
            ["Unresolved", analytics.unresolved],
            ["Human handoffs", analytics.handoffs],
            ["Conversations with cart adds", analytics.cartAdds],
          ].map(([label, count]) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm">
              <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[var(--choco-900)]">{count}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          <button type="button" onClick={() => setTab("inbox")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "inbox" ? "bg-[var(--choco-800)] text-white" : "border border-[var(--border)] bg-white text-[var(--choco-800)]"}`}><MessageSquare size={15} /> Inbox</button>
          <button type="button" onClick={() => setTab("knowledge")} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "knowledge" ? "bg-[var(--choco-800)] text-white" : "border border-[var(--border)] bg-white text-[var(--choco-800)]"}`}><Settings2 size={15} /> Assistant & FAQs</button>
        </div>

        {tab === "inbox" ? (
          <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm lg:grid-cols-[320px_1fr]">
            <aside className="border-b border-[var(--border)] lg:border-b-0 lg:border-r">
              <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] p-3">
                {(["all", "handoff", "open", "resolved"] as const).map((value) => (
                  <button type="button" key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold capitalize ${filter === value ? "bg-[var(--gold-100)] text-[var(--choco-900)]" : "text-[var(--muted-foreground)] hover:bg-[var(--cream-100)]"}`}>{value}</button>
                ))}
              </div>
              <div className="max-h-[690px] overflow-y-auto">
                {conversations.map((conversation) => (
                  <button key={conversation.id} type="button" onClick={() => void selectConversation(conversation)} className={`w-full border-b border-[var(--border)] p-4 text-left hover:bg-[var(--cream-50)] ${selectedId === conversation.id ? "bg-[var(--gold-100)]/60" : ""}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--choco-900)]">
                        {conversation.channel === "whatsapp" ? <span className="text-[#25D366]">WA</span> : <Bot size={14} />}
                        <span className="truncate">{conversation.customer_name || conversation.whatsapp_number || "Website guest"}</span>
                      </span>
                      <ChevronRight size={14} className="shrink-0 text-[var(--muted-foreground)]" />
                    </span>
                    <span className="mt-1 block truncate text-xs text-[var(--muted-foreground)]">{conversation.latest_message?.content || "No messages yet"}</span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[var(--muted-foreground)]">
                      <span>{formatTime(conversation.last_message_at)}</span>
                      <span className={`rounded-full px-2 py-0.5 capitalize ${conversation.status === "handoff" ? "bg-amber-100 text-amber-800" : conversation.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{conversation.status}</span>
                    </span>
                  </button>
                ))}
                {conversations.length === 0 && <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">No conversations in this view.</p>}
              </div>
            </aside>

            <section className="flex min-h-[560px] flex-col">
              {selected ? (
                <>
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-[var(--choco-900)]">{selected.customer_name || selected.whatsapp_number || "Website guest"}</h2>
                      <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">{selected.channel === "whatsapp" ? `WhatsApp · ${selected.whatsapp_number}` : "Website chat"} · {selected.assigned_admin ? "Assigned to you" : "Unassigned"}</p>
                    </div>
                    <div className="flex gap-2">
                      {selected.channel === "whatsapp" && selected.whatsapp_number && <a href={`https://wa.me/${selected.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--choco-800)]">Open WhatsApp</a>}
                      {selected.status !== "resolved" ? <button type="button" onClick={() => void updateConversationStatus("resolved")} className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-800"><Check size={12} className="mr-1 inline" /> Resolve</button> : <button type="button" onClick={() => void updateConversationStatus("open")} className="rounded-lg border border-[var(--border)] px-3 py-2 text-[10px] font-semibold text-[var(--choco-800)]">Reopen</button>}
                    </div>
                  </header>
                  <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--cream-50)] p-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`max-w-[85%] ${message.role === "customer" ? "" : "ml-auto"}`}>
                        <p className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ${message.role === "customer" ? "bg-white text-[var(--choco-900)] shadow-sm" : message.role === "agent" ? "bg-emerald-700 text-white" : "bg-[var(--choco-800)] text-white"}`}>{message.content}</p>
                        <p className="mt-1 text-[9px] text-[var(--muted-foreground)]">{message.role === "customer" ? "Customer" : message.role === "agent" ? "Agent" : "Assistant"} · {formatTime(message.created_at)}</p>
                      </div>
                    ))}
                    {messages.length === 0 && <p className="text-center text-xs text-[var(--muted-foreground)]">Select a conversation to view its history.</p>}
                  </div>
                  <form onSubmit={sendReply} className="border-t border-[var(--border)] bg-white p-3">
                    {selected.channel === "whatsapp" && <p className="mb-2 text-[10px] text-[var(--muted-foreground)]">WhatsApp free-form messages are subject to Meta’s customer-service window and messaging policies.</p>}
                    <div className="flex gap-2">
                      <input value={reply} onChange={(event) => setReply(event.target.value)} maxLength={3000} placeholder="Write a human support reply…" className="min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
                      <button type="submit" disabled={!reply.trim() || sending} className="flex items-center gap-1 rounded-lg bg-[var(--choco-800)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Send size={13} /> Send</button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[var(--muted-foreground)]">
                  <UserRound size={36} strokeWidth={1.5} />
                  <p className="mt-3 text-sm font-medium">Choose a customer conversation</p>
                  <p className="mt-1 text-xs">Chat history and support replies will appear here.</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={saveSettings} className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--choco-900)]"><Bot size={18} /> Assistant behavior</h2>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--choco-800)]">
                  <input type="checkbox" checked={assistantEnabled} onChange={(event) => setAssistantEnabled(event.target.checked)} className="accent-[var(--gold-500)]" /> Enabled
                </label>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted-foreground)]">Catalog facts and prices remain server-controlled. The prompt guides tone and recommendations.</p>
              <textarea required minLength={20} maxLength={3000} value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} rows={10} className="mt-4 w-full rounded-xl border border-[var(--border)] p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-[var(--gold-500)]" />
              <button type="submit" className="mt-3 rounded-lg bg-[var(--choco-800)] px-4 py-2.5 text-xs font-semibold text-white">Save assistant settings</button>
              <p className="mt-3 flex items-start gap-2 text-[10px] text-[var(--muted-foreground)]"><CircleHelp size={13} className="shrink-0" /> Avoid putting credentials, private customer data or unverified product claims in the prompt.</p>
            </form>

            <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--choco-900)]"><CircleHelp size={18} /> Verified FAQ knowledge</h2>
              <form onSubmit={saveFaq} className="mt-4 space-y-3 rounded-xl bg-[var(--cream-50)] p-3">
                <input required maxLength={500} value={faqQuestion} onChange={(event) => setFaqQuestion(event.target.value)} placeholder="Customer question" className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-xs" />
                <textarea required maxLength={2000} value={faqAnswer} onChange={(event) => setFaqAnswer(event.target.value)} placeholder="Verified answer" rows={3} className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-xs" />
                <div className="flex gap-2">
                  <button type="submit" className="rounded-lg bg-[var(--choco-800)] px-4 py-2 text-xs font-semibold text-white">{editingFaq ? "Update FAQ" : "Add FAQ"}</button>
                  {editingFaq && <button type="button" onClick={() => { setEditingFaq(""); setFaqQuestion(""); setFaqAnswer(""); }} className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs">Cancel</button>}
                </div>
              </form>
              <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto">
                {faqs.map((faq) => (
                  <article key={faq.id} className="rounded-xl border border-[var(--border)] p-3">
                    <p className="text-xs font-semibold text-[var(--choco-900)]">{faq.question}</p>
                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-[var(--muted-foreground)]">{faq.answer}</p>
                    <div className="mt-2 flex gap-3 text-[10px] font-semibold">
                      <button type="button" onClick={() => { setEditingFaq(faq.id); setFaqQuestion(faq.question); setFaqAnswer(faq.answer); }} className="text-[var(--gold-700)] hover:underline">Edit</button>
                      <button type="button" onClick={() => void deleteFaq(faq.id)} className="text-red-600 hover:underline">Delete</button>
                    </div>
                  </article>
                ))}
                {faqs.length === 0 && <p className="py-4 text-center text-xs text-[var(--muted-foreground)]">No FAQs added yet.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

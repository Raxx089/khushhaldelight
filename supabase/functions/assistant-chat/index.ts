import {
  adminClient, assertOrigin, json, normalizeError, preflight, readJson, sha256,
} from "../_shared/http.ts";
import { generateAssistantReply } from "../_shared/assistant.ts";

const sessionPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);
  try {
    assertOrigin(request);
    const body = await readJson(request);
    const sessionId = String(body.session_id ?? "");
    const accessToken = String(body.access_token ?? "");
    const text = String(body.message ?? "").trim();
    if (!sessionPattern.test(sessionId) || !/^[a-f0-9]{64}$/i.test(accessToken)) {
      return json(request, { error: "Chat session is invalid. Refresh the page to start a new conversation." }, 400);
    }
    if (text.length > 1500) return json(request, { error: "Message must be under 1,500 characters." }, 400);
    if (!["history", "conversion"].includes(String(body.action)) && !text) {
      return json(request, { error: "Enter a message to continue." }, 400);
    }
    const supabase = adminClient();
    const ipAddress = request.headers.get("cf-connecting-ip")
      ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? "unknown";
    const { data: allowed, error: rateError } = await supabase.rpc("consume_chat_rate_limit", {
      p_key_hash: await sha256(`${ipAddress}:${sessionId}`),
      p_limit: 20,
      p_window_seconds: 60,
    });
    if (rateError) throw new Error("Chat rate limit could not be checked. Please retry shortly.");
    if (!allowed) return json(request, { error: "You’ve sent several messages quickly. Please wait a moment and retry." }, 429);

    const tokenHash = await sha256(accessToken);
    const { data: conversation, error: conversationError } = await supabase.from("chat_conversations")
      .select("id,channel,status,access_token_hash")
      .eq("session_id", sessionId).maybeSingle();
    let conversationId: string;
    if (conversationError) throw new Error("Could not load this chat session.");
    if (conversation) {
      if (conversation.channel !== "website" || conversation.access_token_hash !== tokenHash) {
        return json(request, { error: "Chat session is not authorized." }, 403);
      }
      conversationId = conversation.id;
    } else {
      const { data: created, error } = await supabase.from("chat_conversations")
        .insert({ channel: "website", session_id: sessionId, access_token_hash: tokenHash })
        .select("id,channel,status,access_token_hash").single();
      if (error || !created) throw new Error("Could not start a chat session.");
      conversationId = created.id;
    }

    if (body.action === "history") {
      const { data: history, error } = await supabase.from("chat_messages")
        .select("role,content,product_ids,created_at").eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }).limit(50);
      if (error) throw new Error("Could not load chat messages.");
      const { data: settings, error: settingsError } = await supabase.from("chatbot_settings")
        .select("enabled").eq("id", true).maybeSingle();
      if (settingsError) throw new Error("Could not check assistant availability.");
      return json(request, {
        conversationId,
        status: conversation?.status ?? "open",
        assistantAvailable: settings?.enabled !== false && Boolean(Deno.env.get("GEMINI_API_KEY")),
        messages: history ?? [],
      });
    }

    if (body.action === "conversion") {
      const productId = String(body.product_id ?? "");
      const { data: product, error: productError } = await supabase.from("products")
        .select("id").eq("id", productId).eq("is_active", true).maybeSingle();
      if (productError) throw new Error("Could not verify the catalog item.");
      if (!product) return json(request, { error: "Catalog item is not available." }, 404);
      const { error } = await supabase.from("chat_conversations").update({
        converted_at: new Date().toISOString(), last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
      if (error) throw new Error("Could not record this chat cart action.");
      return json(request, { recorded: true });
    }

    const { error: messageError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId, role: "customer", content: text,
    });
    if (messageError) throw new Error("Could not save your chat message.");
    await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (conversation?.status === "handoff") {
      const reply = "Your conversation is with our support team now. A human agent will reply here; for immediate help, use the WhatsApp contact button.";
      const { error: saveError } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId, role: "assistant", content: reply,
      });
      if (saveError) throw new Error("Could not save the support handoff message.");
      return json(request, {
        conversationId,
        status: "handoff",
        reply,
        products: [],
        handoff: true,
      });
    }

    if (/\b(human|person|agent|representative|support staff|talk to someone)\b|मानव|इंसान|व्यक्ति/i.test(text)) {
      const { error } = await supabase.from("chat_conversations").update({
        status: "handoff", last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
      if (error) throw new Error("Could not hand this conversation to a support agent.");
      const reply = "I’ve handed this conversation to our support team. A human agent will respond here. For immediate help, tap WhatsApp to message us directly.";
      await supabase.from("chat_messages").insert({ conversation_id: conversationId, role: "assistant", content: reply });
      return json(request, { conversationId, status: "handoff", reply, products: [], handoff: true });
    }

    const { data: history, error: historyError } = await supabase.from("chat_messages")
      .select("role,content").eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }).limit(10);
    if (historyError) throw new Error("Could not load recent chat context.");
    const result = await generateAssistantReply(
      supabase,
      text,
      (history ?? []).map((message) => ({
        role: message.role === "customer" ? "user" : "assistant",
        content: message.content,
      })).slice(0, -1),
    );
    if (result.handoff) {
      const { error } = await supabase.from("chat_conversations").update({
        status: "handoff", last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
      if (error) throw new Error("Could not pause automated chat for support.");
    }
    const { error: saveReplyError } = await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: result.reply,
      product_ids: result.products.map((product) => product.id),
    });
    if (saveReplyError) throw new Error("The assistant replied, but the conversation could not be saved.");
    return json(request, {
      conversationId,
      status: result.handoff ? "handoff" : "open",
      assistantAvailable: !result.handoff && Boolean(Deno.env.get("GEMINI_API_KEY")),
      ...result,
    });
  } catch (error) {
    const message = normalizeError(error);
    console.error("assistant chat failed", message);
    const status = message.includes("GEMINI_API_KEY") ? 503 : 500;
    return json(request, { error: status === 503
      ? "AI chat is not configured for this store yet. Please use WhatsApp to reach our team."
      : message }, status);
  }
});

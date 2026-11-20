import {
  adminClient, constantTimeEqual, fetchJson, hmacSha256, json, normalizeError, requiredEnv, sha256,
} from "../_shared/http.ts";
import { generateAssistantReply } from "../_shared/assistant.ts";

const graphVersion = Deno.env.get("WHATSAPP_API_VERSION") || "v22.0";

interface MetaInboundMessage {
  id?: unknown;
  from?: unknown;
  type?: unknown;
  text?: { body?: unknown };
}

interface MetaContact {
  wa_id?: string;
  profile?: { name?: string };
}

interface MetaWebhookPayload {
  object?: string;
  entry?: {
    changes?: {
      value?: { messages?: MetaInboundMessage[]; contacts?: MetaContact[] };
    }[];
  }[];
}

async function sendWhatsAppMessage(recipient: string, text: string) {
  const phoneNumberId = requiredEnv("WHATSAPP_PHONE_NUMBER_ID");
  return await fetchJson(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("WHATSAPP_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: { body: text.slice(0, 4000) },
    }),
  });
}

async function lookupWhatsAppOrder(supabase: ReturnType<typeof adminClient>, orderNumber: string, sender: string) {
  const { data: order, error } = await supabase.from("orders")
    .select("order_number,status,payment_status,customers!inner(phone),shipments(awb_code,tracking_url,status)")
    .eq("order_number", orderNumber.toUpperCase()).maybeSingle();
  if (error) throw new Error("Could not check the order status.");
  const customer = Array.isArray(order?.customers) ? order.customers[0] : order?.customers;
  const savedPhone = String(customer?.phone ?? "").replace(/\D/g, "");
  if (!order || !savedPhone || savedPhone.slice(-10) !== sender.slice(-10)) {
    return "I couldn't verify that order from this WhatsApp number. Please check the order number and contact our support team if you need help.";
  }
  const shipment = Array.isArray(order.shipments) ? order.shipments[0] : order.shipments;
  const lines = [
    `Order ${order.order_number}: ${String(order.status).replaceAll("_", " ")}.`,
    `Payment: ${String(order.payment_status).replaceAll("_", " ")}.`,
  ];
  if (shipment?.awb_code) lines.push(`AWB: ${shipment.awb_code}.`);
  if (shipment?.tracking_url) lines.push(`Track shipment: ${shipment.tracking_url}`);
  return lines.join("\n");
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  if (request.method === "GET") {
    const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    const challenge = url.searchParams.get("hub.challenge");
    if (url.searchParams.get("hub.mode") === "subscribe"
      && verifyToken
      && constantTimeEqual(url.searchParams.get("hub.verify_token") ?? "", verifyToken)
      && challenge) {
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return new Response("Webhook verification failed.", { status: 403 });
  }
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  const rawBody = await request.text();
  let activeEventId = "";
  try {
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const expected = `sha256=${await hmacSha256(requiredEnv("WHATSAPP_APP_SECRET"), rawBody)}`;
    if (!constantTimeEqual(signature, expected)) return json(request, { error: "Invalid webhook signature." }, 401);

    const payload = JSON.parse(rawBody) as MetaWebhookPayload;
    if (payload.object !== "whatsapp_business_account") return json(request, { received: true });
    const supabase = adminClient();
    const messages = (payload.entry ?? []).flatMap((entry) =>
      (entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
    );

    for (const inbound of messages) {
      const messageId = typeof inbound.id === "string" ? inbound.id : "";
      activeEventId = messageId;
      const sender = typeof inbound.from === "string" ? inbound.from : "";
      const text = inbound.type === "text" && typeof inbound.text?.body === "string" ? inbound.text.body.trim() : "";
      if (!messageId || !/^\d{8,20}$/.test(sender)) continue;
      const { data: claimed, error: claimError } = await supabase.rpc("claim_webhook_event", {
        p_provider: "whatsapp",
        p_event_id: messageId,
        p_event_type: "messages",
        p_payload: inbound,
      });
      if (claimError) throw new Error("Could not claim WhatsApp message for idempotent processing.");
      if (!claimed) continue;

      const contactName = (payload.entry ?? []).flatMap((entry) =>
        (entry.changes ?? []).flatMap((change) => change.value?.contacts ?? []),
      ).find((contact) => contact.wa_id === sender)?.profile?.name;
      const { data: duplicate, error: duplicateError } = await supabase.from("chat_messages")
        .select("id").eq("provider_message_id", messageId).maybeSingle();
      if (duplicateError) throw new Error("Could not verify WhatsApp message idempotency.");
      if (duplicate) {
        const { data: priorReply, error: priorReplyError } = await supabase.from("chat_messages")
          .select("id").eq("reply_to_message_id", messageId).maybeSingle();
        if (priorReplyError) throw new Error("Could not check the saved WhatsApp response.");
        if (priorReply) {
          await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
            .eq("provider", "whatsapp").eq("provider_event_id", messageId);
          activeEventId = "";
          continue;
        }
      }

      let { data: conversation, error: conversationError } = await supabase.from("chat_conversations")
        .select("id,status").eq("channel", "whatsapp").eq("whatsapp_number", sender).maybeSingle();
      if (conversationError) throw new Error("Could not load the WhatsApp conversation.");
      if (!conversation) {
        const { data: created, error } = await supabase.from("chat_conversations")
          .insert({ channel: "whatsapp", whatsapp_number: sender, customer_name: contactName ?? null })
          .select("id,status").single();
        if (error || !created) throw new Error("Could not create the WhatsApp conversation.");
        conversation = created;
      }

      const incomingText = text || "I sent an attachment or unsupported WhatsApp message.";
      if (!duplicate) {
        const { error: messageError } = await supabase.from("chat_messages").insert({
          conversation_id: conversation.id,
          provider_message_id: messageId,
          role: "customer",
          content: incomingText,
        });
        if (messageError) {
          if (messageError.code === "23505") continue;
          throw new Error("Could not save the incoming WhatsApp message.");
        }
      }
      await supabase.from("chat_conversations").update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);

      const { data: allowed, error: rateError } = await supabase.rpc("consume_chat_rate_limit", {
        p_key_hash: await sha256(`whatsapp:${sender}`),
        p_limit: 20,
        p_window_seconds: 60,
      });
      if (rateError) throw new Error("Could not check the WhatsApp rate limit.");
      if (!allowed) {
        console.warn("WhatsApp sender rate limited", sender);
        await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
          .eq("provider", "whatsapp").eq("provider_event_id", messageId);
        activeEventId = "";
        continue;
      }
      if (conversation.status === "handoff") {
        await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
          .eq("provider", "whatsapp").eq("provider_event_id", messageId);
        activeEventId = "";
        continue;
      }
      if (/\b(human|person|agent|representative|support staff|talk to someone)\b|मानव|इंसान|व्यक्ति/i.test(incomingText)) {
        const reply = "I’ve sent your request to our support team. A human agent will respond here as soon as possible.";
        const response = await sendWhatsAppMessage(sender, reply);
        const { error: handoffError } = await supabase.from("chat_conversations").update({
          status: "handoff", last_message_at: new Date().toISOString(),
        }).eq("id", conversation.id);
        if (handoffError) throw new Error("Could not hand this WhatsApp chat to support.");
        await supabase.from("chat_messages").insert({
          conversation_id: conversation.id,
          provider_message_id: response.messages?.[0]?.id ?? null,
          reply_to_message_id: messageId,
          role: "assistant",
          content: reply,
        });
        await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
          .eq("provider", "whatsapp").eq("provider_event_id", messageId);
        activeEventId = "";
        continue;
      }
      const orderNumber = incomingText.match(/\bKD-[A-F0-9]{10}\b/i)?.[0];
      if (orderNumber || /\b(track|tracking|order status|delivery status)\b|ऑर्डर.*(स्थिति|ट्रैक)/i.test(incomingText)) {
        const reply = orderNumber
          ? await lookupWhatsAppOrder(supabase, orderNumber, sender)
          : "To check an order, send its order number (for example, KD-1234AB5678) from the WhatsApp number used at checkout.";
        const response = await sendWhatsAppMessage(sender, reply);
        const { error: saveError } = await supabase.from("chat_messages").insert({
          conversation_id: conversation.id,
          provider_message_id: response.messages?.[0]?.id ?? null,
          reply_to_message_id: messageId,
          role: "assistant",
          content: reply,
        });
        if (saveError) throw new Error("Order status reply was sent but could not be saved to chat history.");
        const { error: processedError } = await supabase.from("webhook_events").update({
          processed_at: new Date().toISOString(), error: null,
        }).eq("provider", "whatsapp").eq("provider_event_id", messageId);
        if (processedError) throw new Error("Order status reply was sent but webhook completion could not be recorded.");
        activeEventId = "";
        continue;
      }
      const { data: history, error: historyError } = await supabase.from("chat_messages")
        .select("role,content").eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true }).limit(10);
      if (historyError) throw new Error("Could not load WhatsApp conversation context.");
      const result = await generateAssistantReply(
        supabase,
        incomingText,
        (history ?? []).slice(0, -1).map((message) => ({
          role: message.role === "customer" ? "user" : "assistant",
          content: message.content,
        })),
      );
      if (result.handoff) {
        const reply = result.reply;
        const response = await sendWhatsAppMessage(sender, reply);
        const { error: handoffError } = await supabase.from("chat_conversations").update({
          status: "handoff", last_message_at: new Date().toISOString(),
        }).eq("id", conversation.id);
        if (handoffError) throw new Error("Could not hand this WhatsApp chat to support.");
        await supabase.from("chat_messages").insert({
          conversation_id: conversation.id,
          provider_message_id: response.messages?.[0]?.id ?? null,
          reply_to_message_id: messageId,
          role: "assistant",
          content: reply,
        });
        await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
          .eq("provider", "whatsapp").eq("provider_event_id", messageId);
        activeEventId = "";
        continue;
      }
      const siteUrl = Deno.env.get("PUBLIC_SITE_URL")?.replace(/\/$/, "");
      const productLines = result.products.map((product) =>
        `• ${product.name} — ₹${(product.pricePaise / 100).toLocaleString("en-IN")} (${product.available} available)`
        + (siteUrl ? `\n  ${siteUrl}/product/${encodeURIComponent(product.id)}` : ""),
      );
      const responseText = [result.reply, ...productLines].join("\n\n").slice(0, 4000);
      const response = await sendWhatsAppMessage(sender, responseText);
      const providerMessageId = response.messages?.[0]?.id;
      const { error: replyError } = await supabase.from("chat_messages").insert({
        conversation_id: conversation.id,
        provider_message_id: typeof providerMessageId === "string" ? providerMessageId : null,
        reply_to_message_id: messageId,
        role: "assistant",
        content: responseText,
        product_ids: result.products.map((product) => product.id),
      });
      if (replyError) throw new Error("WhatsApp reply was sent but could not be saved to chat history.");
      const { error: processedError } = await supabase.from("webhook_events").update({
        processed_at: new Date().toISOString(), error: null,
      }).eq("provider", "whatsapp").eq("provider_event_id", messageId);
      if (processedError) throw new Error("WhatsApp reply was sent but webhook completion could not be recorded.");
      activeEventId = "";
    }
    return json(request, { received: true });
  } catch (error) {
    const message = normalizeError(error);
    console.error("WhatsApp webhook failed", message);
    if (activeEventId) {
      try {
        const supabase = adminClient();
        await supabase.from("webhook_events").update({ error: message })
          .eq("provider", "whatsapp").eq("provider_event_id", activeEventId);
      } catch (logError) {
        console.error("could not record WhatsApp webhook failure", normalizeError(logError));
      }
    }
    return json(request, { error: message }, 500);
  }
});

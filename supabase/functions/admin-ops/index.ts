import {
  adminClient, assertOrigin, fetchJson, json, logAudit, normalizeError, preflight, readJson, requiredEnv,
} from "../_shared/http.ts";
import { createShipmentForOrder, shiprocketFetch } from "../_shared/shiprocket.ts";

async function requireAdmin(request: Request) {
  const bearer = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!bearer) throw new Error("Sign in with an administrator account.");
  const supabase = adminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(bearer);
  if (userError || !userData.user) throw new Error("Administrator session is invalid or expired.");
  const { data: admin, error: adminError } = await supabase.from("admin_users")
    .select("user_id").eq("user_id", userData.user.id).maybeSingle();
  if (adminError || !admin) throw new Error("This account is not authorized to access the admin dashboard.");
  return { supabase, userId: userData.user.id };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);
  try {
    assertOrigin(request);
    const body = await readJson(request);
    const { supabase, userId } = await requireAdmin(request);
    const action = String(body.action ?? "");
    if (action === "chat-list") {
      const filter = String(body.status ?? "all");
      let query = supabase.from("chat_conversations")
        .select("id,channel,session_id,whatsapp_number,customer_name,status,assigned_admin,last_message_at,created_at")
        .order("last_message_at", { ascending: false }).limit(100);
      if (["open", "handoff", "resolved"].includes(filter)) query = query.eq("status", filter);
      const { data: conversations, error } = await query;
      if (error) throw new Error("Could not load chat conversations.");
      const ids = (conversations ?? []).map((conversation) => conversation.id);
      const { data: messages, error: messagesError } = ids.length
        ? await supabase.from("chat_messages").select("conversation_id,role,content,created_at")
          .in("conversation_id", ids).order("created_at", { ascending: false }).limit(500)
        : { data: [], error: null };
      if (messagesError) throw new Error("Could not load recent conversation messages.");
      const latest = new Map<string, { role: string; content: string; created_at: string }>();
      for (const message of messages ?? []) {
        if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
      }
      return json(request, {
        conversations: (conversations ?? []).map((conversation) => ({
          ...conversation, latest_message: latest.get(conversation.id) ?? null,
        })),
      });
    }
    if (action === "chat-messages") {
      const conversationId = String(body.conversation_id ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return json(request, { error: "Select a valid conversation." }, 400);
      const { data, error } = await supabase.from("chat_messages")
        .select("id,role,content,product_ids,created_at").eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }).limit(200);
      if (error) throw new Error("Could not load chat history.");
      return json(request, { messages: data ?? [] });
    }
    if (action === "chat-reply") {
      const conversationId = String(body.conversation_id ?? "");
      const text = String(body.message ?? "").trim();
      if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !text || text.length > 3000) {
        return json(request, { error: "Enter a reply of no more than 3,000 characters." }, 400);
      }
      const { data: conversation, error: conversationError } = await supabase.from("chat_conversations")
        .select("id,channel,whatsapp_number").eq("id", conversationId).single();
      if (conversationError || !conversation) return json(request, { error: "Conversation not found." }, 404);
      let providerMessageId: string | null = null;
      if (conversation.channel === "whatsapp") {
        const apiVersion = Deno.env.get("WHATSAPP_API_VERSION") || "v22.0";
        const result = await fetchJson(`https://graph.facebook.com/${apiVersion}/${requiredEnv("WHATSAPP_PHONE_NUMBER_ID")}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${requiredEnv("WHATSAPP_ACCESS_TOKEN")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: conversation.whatsapp_number,
            type: "text",
            text: { body: text },
          }),
        });
        providerMessageId = typeof result.messages?.[0]?.id === "string" ? result.messages[0].id : null;
      }
      const { error: replyError } = await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        provider_message_id: providerMessageId,
        role: "agent",
        content: text,
      });
      if (replyError) throw new Error("Reply was sent but could not be saved to the conversation.");
      const { error: updateError } = await supabase.from("chat_conversations").update({
        status: "handoff", assigned_admin: userId, last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
      if (updateError) throw new Error("Reply was sent but chat assignment could not be updated.");
      await logAudit(supabase, userId, "chat_agent_reply", "chat_conversation", conversationId, { channel: conversation.channel });
      return json(request, { sent: true });
    }
    if (action === "chat-status") {
      const conversationId = String(body.conversation_id ?? "");
      const status = String(body.status ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(conversationId) || !["open", "handoff", "resolved"].includes(status)) {
        return json(request, { error: "Conversation status is invalid." }, 400);
      }
      const { error } = await supabase.from("chat_conversations").update({
        status, assigned_admin: status === "handoff" ? userId : null, last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);
      if (error) throw new Error("Could not update conversation status.");
      await logAudit(supabase, userId, "chat_status_updated", "chat_conversation", conversationId, { status });
      return json(request, { updated: true });
    }
    if (action === "chat-settings") {
      if (body.update === true) {
        const systemPrompt = String(body.system_prompt ?? "").trim();
        if (systemPrompt.length < 20 || systemPrompt.length > 3000 || typeof body.enabled !== "boolean") {
          return json(request, { error: "Provide an assistant prompt between 20 and 3,000 characters." }, 400);
        }
        const { error } = await supabase.from("chatbot_settings").update({
          system_prompt: systemPrompt, enabled: body.enabled, updated_by: userId, updated_at: new Date().toISOString(),
        }).eq("id", true);
        if (error) throw new Error("Could not update assistant configuration.");
        await logAudit(supabase, userId, "chat_settings_updated", "chatbot_settings", null, { enabled: body.enabled });
        return json(request, { saved: true });
      }
      const [{ data: settings, error }, { data: faqs, error: faqError }] = await Promise.all([
        supabase.from("chatbot_settings").select("system_prompt,enabled").eq("id", true).single(),
        supabase.from("chat_faqs").select("id,question,answer,active,updated_at").order("updated_at", { ascending: false }),
      ]);
      if (error || faqError) throw new Error("Could not load assistant settings and FAQs.");
      return json(request, { settings, faqs });
    }
    if (action === "chat-faq-save") {
      const id = typeof body.id === "string" ? body.id : undefined;
      const question = String(body.question ?? "").trim();
      const answer = String(body.answer ?? "").trim();
      if (!question || question.length > 500 || !answer || answer.length > 2000) {
        return json(request, { error: "FAQ question and answer are required and must be within the character limits." }, 400);
      }
      const { error } = await supabase.from("chat_faqs").upsert({
        ...(id ? { id } : {}),
        question, answer, active: body.active !== false, updated_at: new Date().toISOString(),
      });
      if (error) throw new Error("Could not save FAQ.");
      await logAudit(supabase, userId, "chat_faq_saved", "chat_faq", id ?? null, {});
      return json(request, { saved: true });
    }
    if (action === "chat-faq-delete") {
      const id = String(body.id ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(request, { error: "FAQ ID is invalid." }, 400);
      const { error } = await supabase.from("chat_faqs").delete().eq("id", id);
      if (error) throw new Error("Could not delete FAQ.");
      await logAudit(supabase, userId, "chat_faq_deleted", "chat_faq", id, {});
      return json(request, { deleted: true });
    }
    if (action === "chat-analytics") {
      const [{ count: total, error: totalError }, { count: unresolved, error: unresolvedError }, { count: handoffs, error: handoffsError }, { count: cartAdds, error: cartAddsError }] = await Promise.all([
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).neq("status", "resolved"),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).eq("status", "handoff"),
        supabase.from("chat_conversations").select("id", { count: "exact", head: true }).not("converted_at", "is", null),
      ]);
      if (totalError || unresolvedError || handoffsError || cartAddsError) throw new Error("Could not load chatbot analytics.");
      return json(request, { total: total ?? 0, unresolved: unresolved ?? 0, handoffs: handoffs ?? 0, cartAdds: cartAdds ?? 0 });
    }
    if (action === "orders") {
      const status = String(body.status ?? "");
      let query = supabase.from("orders").select(
        "id,order_number,status,payment_status,payment_method,subtotal_paise,discount_paise,shipping_paise,total_paise,created_at,customers(first_name,last_name,email,phone),addresses(line1,line2,city,state,pincode),order_items(product_name,quantity,unit_price_paise,customizations),payments(provider,razorpay_order_id,razorpay_payment_id,amount_paise,status,failure_code),shipments(status,awb_code,courier_name,tracking_url,label_url,shiprocket_order_id,shipment_id)",
      ).order("created_at", { ascending: false }).limit(200);
      if (status && status !== "all") query = query.eq("status", status);
      const { data, error } = await query;
      if (error) throw new Error("Could not load orders.");
      return json(request, { orders: data });
    }
    if (action === "analytics") {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [{ data: orders, error }, { count: productsCount, error: productsError }] = await Promise.all([
        supabase.from("orders").select("total_paise,status,payment_status,created_at")
          .gte("created_at", since),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      if (error || productsError) throw new Error("Could not load sales analytics.");
      const paid = orders?.filter((order) => order.payment_status === "captured") ?? [];
      return json(request, {
        revenuePaise: paid.reduce((sum, order) => sum + order.total_paise, 0),
        paidOrders: paid.length,
        pendingOrders: orders?.filter((order) => order.status === "pending_payment").length ?? 0,
        ordersLast30Days: orders?.length ?? 0,
        activeProducts: productsCount ?? 0,
      });
    }
    if (action === "products") {
      const { data, error } = await supabase.from("products")
        .select("id,name,category,unit_price_paise,weight_grams,is_active,inventory(available,reserved)")
        .order("name");
      if (error) throw new Error("Could not load products and inventory.");
      return json(request, { products: data });
    }
    if (action === "update-product") {
      const productId = String(body.product_id ?? "").trim();
      const name = String(body.name ?? "").trim();
      const pricePaise = Number(body.unit_price_paise);
      const weightGrams = Number(body.weight_grams);
      const available = Number(body.available);
      if (!/^[a-zA-Z0-9_-]{1,80}$/.test(productId) || !name || name.length > 200
        || !Number.isInteger(pricePaise) || pricePaise < 0
        || !Number.isInteger(weightGrams) || weightGrams < 1
        || !Number.isInteger(available) || available < 0) {
        return json(request, { error: "Product name, price, shipping weight and stock are invalid." }, 400);
      }
      const { data: existingProduct, error: existingProductError } = await supabase.from("products")
        .select("id").eq("id", productId).maybeSingle();
      if (existingProductError) throw new Error("Could not verify the product to update.");
      if (!existingProduct) return json(request, { error: "Product not found." }, 404);
      const { error: productError } = await supabase.from("products").update({
        name,
        category: String(body.category ?? "Chocolate").slice(0, 100),
        unit_price_paise: pricePaise,
        weight_grams: weightGrams,
        is_active: body.is_active !== false,
        updated_at: new Date().toISOString(),
      }).eq("id", productId);
      if (productError) throw new Error("Could not save product.");
      const { error: inventoryError } = await supabase.from("inventory").upsert({
        product_id: productId,
        available,
        updated_at: new Date().toISOString(),
      });
      if (inventoryError) throw new Error("Product details saved, but inventory could not be saved.");
      await logAudit(supabase, userId, "product_updated", "product", productId, { price_paise: pricePaise, available });
      return json(request, { saved: true });
    }
    if (action === "update-order-status") {
      const orderId = String(body.order_id ?? "");
      const nextStatus = String(body.status ?? "");
      if (!["processing", "action_required"].includes(nextStatus)) {
        return json(request, { error: "Use the cancellation action to cancel an order." }, 400);
      }
      const { data: order, error } = await supabase.from("orders")
        .select("id,status,payment_status").eq("id", orderId).single();
      if (error || !order) return json(request, { error: "Order not found." }, 404);
      if (order.payment_status !== "captured" && order.payment_status !== "pending") {
        return json(request, { error: "Order cannot be moved to this status." }, 409);
      }
      const { error: updateError } = await supabase.from("orders").update({
        status: nextStatus, updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      if (updateError) throw new Error("Could not update order status.");
      await logAudit(supabase, userId, "order_status_updated", "order", orderId, { from: order.status, to: nextStatus });
      return json(request, { updated: true });
    }
    if (action === "create-shipment") {
      const orderId = String(body.order_id ?? "");
      return json(request, { shipment: await createShipmentForOrder(orderId, userId) });
    }
    if (action === "generate-label") {
      const orderId = String(body.order_id ?? "");
      const { data: shipment, error } = await supabase.from("shipments")
        .select("shipment_id").eq("order_id", orderId).single();
      if (error || !shipment?.shipment_id) return json(request, { error: "Create a shipment before generating its label." }, 409);
      const label = await shiprocketFetch("/courier/generate/label", {
        method: "POST", body: JSON.stringify({ shipment_id: [shipment.shipment_id] }),
      });
      const labelUrl = label.label_url ?? label.response?.label_url;
      if (typeof labelUrl !== "string") throw new Error("Shiprocket did not return a shipping label URL.");
      const { error: saveError } = await supabase.from("shipments").update({
        label_url: labelUrl, updated_at: new Date().toISOString(),
      }).eq("order_id", orderId);
      if (saveError) throw new Error("Label generated but could not be saved.");
      await logAudit(supabase, userId, "shipping_label_generated", "order", orderId, {});
      return json(request, { labelUrl });
    }
    if (action === "track-shipment") {
      const orderId = String(body.order_id ?? "");
      const { data: shipment, error } = await supabase.from("shipments")
        .select("awb_code").eq("order_id", orderId).single();
      if (error || !shipment?.awb_code) return json(request, { error: "Shipment AWB is not available yet." }, 409);
      const tracking = await shiprocketFetch(`/courier/track/awb/${encodeURIComponent(shipment.awb_code)}`);
      const { error: updateError } = await supabase.from("shipments").update({
        raw_response: tracking, updated_at: new Date().toISOString(),
      }).eq("order_id", orderId);
      if (updateError) throw new Error("Tracking retrieved but could not be saved.");
      return json(request, { tracking });
    }
    if (action === "cancel-shipment") {
      const orderId = String(body.order_id ?? "");
      const { data: shipment, error } = await supabase.from("shipments")
        .select("id,shiprocket_order_id,status").eq("order_id", orderId).single();
      if (error || !shipment?.shiprocket_order_id) return json(request, { error: "No Shiprocket shipment is available to cancel." }, 409);
      if (["shipped", "delivered", "cancelled"].includes(shipment.status)) {
        return json(request, { error: "This shipment can no longer be cancelled." }, 409);
      }
      await shiprocketFetch("/orders/cancel", {
        method: "POST", body: JSON.stringify({ ids: [shipment.shiprocket_order_id] }),
      });
      const { error: updateError } = await supabase.from("shipments").update({
        status: "cancelled", updated_at: new Date().toISOString(),
      }).eq("id", shipment.id);
      if (updateError) throw new Error("Carrier cancelled shipment but the local record could not be updated.");
      await logAudit(supabase, userId, "shipment_cancelled", "order", orderId, {});
      return json(request, { cancelled: true });
    }
    return json(request, { error: "Unknown admin action." }, 400);
  } catch (error) {
    const message = normalizeError(error);
    console.error("admin operation failed", message);
    return json(request, { error: message }, message.includes("authorized") || message.includes("Sign in") ? 403 : 500);
  }
});

import {
  adminClient, constantTimeEqual, hmacSha256, json, logAudit, normalizeError, requiredEnv,
} from "../_shared/http.ts";
import { createShipmentForOrder } from "../_shared/shiprocket.ts";
import { notifyCustomer } from "../_shared/notifications.ts";

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const eventId = request.headers.get("x-razorpay-event-id") ?? "";
  if (!eventId || !/^[a-f0-9]{64}$/i.test(signature)) return new Response("Invalid webhook headers", { status: 400 });

  try {
    const expected = await hmacSha256(requiredEnv("RAZORPAY_WEBHOOK_SECRET"), rawBody);
    if (!constantTimeEqual(expected, signature.toLowerCase())) return new Response("Invalid webhook signature", { status: 401 });
    const payload = JSON.parse(rawBody);
    const eventType = String(payload.event ?? "");
    const entity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = String(entity?.order_id ?? orderEntity?.id ?? "");
    const paymentId = String(entity?.id ?? payload.payload?.order?.entity?.payment_id ?? "");
    if (!["payment.authorized", "payment.captured", "payment.failed", "order.paid"].includes(eventType)) {
      return new Response("Ignored event", { status: 200 });
    }
    if (!orderId || !paymentId) return new Response("Payment identifiers missing", { status: 400 });

    const supabase = adminClient();
    const { data: claimed, error: claimError } = await supabase.rpc("claim_webhook_event", {
      p_provider: "razorpay",
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: payload,
    });
    if (claimError) throw new Error("Could not claim webhook event for idempotent processing.");
    if (!claimed) return new Response("Already processed or processing", { status: 200 });

    const [{ data: payment, error: paymentError }, { data: order, error: orderError }] = await Promise.all([
      supabase.from("payments").select("order_id,amount_paise").eq("razorpay_order_id", orderId).single(),
      supabase.from("orders").select("id,total_paise").eq("razorpay_order_id", orderId).single(),
    ]);
    const providerAmount = Number(entity?.amount ?? orderEntity?.amount_paid);
    const providerCurrency = entity?.currency ?? orderEntity?.currency;
    if (paymentError || orderError || !payment || !order
      || payment.order_id !== order.id
      || payment.amount_paise !== order.total_paise
      || providerAmount !== order.total_paise
      || providerCurrency !== "INR") {
      throw new Error("Razorpay webhook payment amount or currency does not match the saved order.");
    }

    const status = eventType === "payment.captured" || eventType === "order.paid"
      ? "captured"
      : eventType === "payment.authorized" ? "authorized" : "failed";
    const { data: applied, error: applyError } = await supabase.rpc("apply_payment_event", {
      p_razorpay_order_id: orderId,
      p_razorpay_payment_id: paymentId,
      p_status: status,
      p_failure_code: entity?.error_code ?? null,
      p_failure_description: entity?.error_description ?? null,
    });
    if (applyError) throw new Error("Payment webhook could not be applied to the order.");

    if (status === "captured" && applied?.order_id) {
      await createShipmentForOrder(applied.order_id, "razorpay_webhook");
      try {
        await notifyCustomer(applied.order_id, "payment-confirmed");
      } catch (error) {
        await logAudit(supabase, "notifications", "payment_notification_failed", "order", applied.order_id, {
          error: normalizeError(error),
        });
      }
    }
    const { error: processedError } = await supabase.from("webhook_events")
      .update({ processed_at: new Date().toISOString(), error: null })
      .eq("provider", "razorpay").eq("provider_event_id", eventId);
    if (processedError) throw new Error("Webhook effects applied, but event completion could not be recorded.");
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook processing failed", normalizeError(error));
    try {
      const supabase = adminClient();
      await supabase.from("webhook_events").update({ error: normalizeError(error) })
        .eq("provider", "razorpay").eq("provider_event_id", eventId);
    } catch (logError) {
      console.error("could not record webhook failure", normalizeError(logError));
    }
    return new Response("Webhook processing failed", { status: 500 });
  }
});

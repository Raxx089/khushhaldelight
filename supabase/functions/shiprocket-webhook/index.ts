import { adminClient, constantTimeEqual, json, logAudit, normalizeError, requiredEnv, sha256 } from "../_shared/http.ts";
import { notifyCustomer } from "../_shared/notifications.ts";

function mapStatus(value: string) {
  const status = value.toLowerCase();
  if (status.includes("deliver")) return { shipment: "delivered", order: "delivered" };
  if (status.includes("cancel")) return { shipment: "cancelled", order: "cancelled" };
  if (status.includes("transit") || status.includes("out for delivery") || status.includes("pickup")) {
    return { shipment: "shipped", order: "shipped" };
  }
  return null;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const expectedToken = requiredEnv("SHIPROCKET_WEBHOOK_TOKEN");
    const suppliedToken = request.headers.get("x-shiprocket-token") ?? "";
    if (!constantTimeEqual(expectedToken, suppliedToken)) return new Response("Unauthorized", { status: 401 });
    const raw = await request.text();
    if (raw.length > 200_000) return new Response("Webhook payload too large", { status: 413 });
    const payload = JSON.parse(raw);
    const awb = String(payload.awb ?? payload.awb_code ?? "");
    const shipmentId = String(payload.shipment_id ?? "");
    const eventId = String(payload.id ?? payload.event_id ?? await sha256(raw));
    const providerStatus = String(payload.current_status ?? payload.status ?? payload.status_code ?? "");
    const mapped = mapStatus(providerStatus);
    if (!mapped || (!awb && !shipmentId)) return new Response("Webhook event ignored", { status: 200 });

    const supabase = adminClient();
    const { data: claimed, error: claimError } = await supabase.rpc("claim_webhook_event", {
      p_provider: "shiprocket",
      p_event_id: eventId,
      p_event_type: providerStatus,
      p_payload: payload,
    });
    if (claimError) throw new Error("Could not claim Shiprocket webhook for idempotent processing.");
    if (!claimed) return new Response("Already processed or processing", { status: 200 });

    let shipmentQuery = supabase.from("shipments").select("id,order_id")
      .limit(1);
    if (awb) shipmentQuery = shipmentQuery.eq("awb_code", awb);
    else shipmentQuery = shipmentQuery.eq("shipment_id", shipmentId);
    const { data: shipment, error: shipmentError } = await shipmentQuery.maybeSingle();
    if (shipmentError || !shipment) throw new Error("Shiprocket webhook did not match a saved shipment.");
    const { error: updateShipmentError } = await supabase.from("shipments").update({
      status: mapped.shipment,
      raw_response: payload,
      updated_at: new Date().toISOString(),
    }).eq("id", shipment.id);
    if (updateShipmentError) throw new Error("Could not save Shiprocket delivery status.");
    const { error: updateOrderError } = await supabase.from("orders").update({
      status: mapped.order,
      updated_at: new Date().toISOString(),
    }).eq("id", shipment.order_id);
    if (updateOrderError) throw new Error("Could not update order delivery status.");
    await logAudit(supabase, "shiprocket", "shipment_status_updated", "order", shipment.order_id, {
      awb, provider_status: providerStatus,
    });
    const notificationEvent = /out for delivery/i.test(providerStatus)
      ? "out-for-delivery"
      : mapped.shipment === "delivered" ? "delivered"
      : mapped.shipment === "shipped" ? "in-transit"
      : null;
    if (notificationEvent) {
      try {
        await notifyCustomer(shipment.order_id, notificationEvent);
      } catch (error) {
        await logAudit(supabase, "notifications", "shipment_notification_failed", "order", shipment.order_id, {
          error: normalizeError(error), event: notificationEvent,
        });
      }
    }
    await supabase.from("webhook_events").update({ processed_at: new Date().toISOString(), error: null })
      .eq("provider", "shiprocket").eq("provider_event_id", eventId);
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Shiprocket webhook processing failed", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});

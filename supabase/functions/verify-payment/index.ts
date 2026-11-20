import {
  adminClient, assertOrigin, basicAuthorization, constantTimeEqual, fetchJson, hmacSha256, json, logAudit, normalizeError,
  preflight, readJson, requiredEnv, sha256,
} from "../_shared/http.ts";
import { createShipmentForOrder } from "../_shared/shiprocket.ts";
import { notifyCustomer } from "../_shared/notifications.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    assertOrigin(request);
    const body = await readJson(request);
    const orderId = String(body.order_id ?? "");
    const razorpayOrderId = String(body.razorpay_order_id ?? "");
    const paymentId = String(body.razorpay_payment_id ?? "");
    const signature = String(body.razorpay_signature ?? "");
    const accessToken = String(body.access_token ?? "");
    if (!orderId || !razorpayOrderId || !paymentId || !/^[a-f0-9]{64}$/i.test(signature)) {
      return json(request, { error: "Payment verification details are incomplete." }, 400);
    }

    const expected = await hmacSha256(requiredEnv("RAZORPAY_KEY_SECRET"), `${razorpayOrderId}|${paymentId}`);
    if (!constantTimeEqual(expected, signature.toLowerCase())) {
      return json(request, { error: "Razorpay payment signature could not be verified." }, 400);
    }

    const supabase = adminClient();
    const [{ data: order, error: orderError }, { data: payment, error: paymentError }] = await Promise.all([
      supabase.from("orders").select("id,order_number,total_paise,status,payment_status,guest_access_hash")
        .eq("id", orderId).eq("razorpay_order_id", razorpayOrderId).single(),
      supabase.from("payments").select("id,amount_paise,status")
        .eq("order_id", orderId).eq("razorpay_order_id", razorpayOrderId).single(),
    ]);
    if (orderError || paymentError || !order || !payment) {
      return json(request, { error: "Order or payment attempt was not found." }, 404);
    }
    if (order.total_paise !== payment.amount_paise) {
      await logAudit(supabase, "razorpay", "payment_amount_mismatch", "order", orderId, {
        order_total_paise: order.total_paise, payment_amount_paise: payment.amount_paise,
      });
      return json(request, { error: "Payment amount does not match the order. Contact support." }, 409);
    }
    if (!constantTimeEqual(order.guest_access_hash, await sha256(accessToken))) {
      return json(request, { error: "Order access token is invalid." }, 403);
    }

    const keyId = requiredEnv("RAZORPAY_KEY_ID");
    const keySecret = requiredEnv("RAZORPAY_KEY_SECRET");
    const providerPayment = await fetchJson(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: basicAuthorization(keyId, keySecret) } },
    );
    if (providerPayment.id !== paymentId
      || providerPayment.order_id !== razorpayOrderId
      || providerPayment.amount !== order.total_paise
      || providerPayment.currency !== "INR"
      || !["captured", "authorized", "failed", "created"].includes(providerPayment.status)) {
      await logAudit(supabase, "razorpay", "payment_details_mismatch", "order", orderId, {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        provider_status: providerPayment.status ?? null,
      });
      return json(request, { error: "Razorpay payment details do not match this order." }, 409);
    }

    const paymentStatus = providerPayment.status === "created" ? "pending" : providerPayment.status;
    const { error: applyError } = await supabase.rpc("apply_payment_event", {
      p_razorpay_order_id: razorpayOrderId,
      p_razorpay_payment_id: paymentId,
      p_status: paymentStatus,
      p_failure_code: providerPayment.error_code ?? null,
      p_failure_description: providerPayment.error_description ?? null,
    });
    if (applyError) throw new Error("Payment was verified, but could not be recorded. Please contact support.");

    if (paymentStatus !== "captured") {
      await logAudit(supabase, "razorpay", "payment_not_captured", "order", orderId, {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: paymentId,
        payment_status: paymentStatus,
      });
      return json(request, {
        order: {
          id: order.id,
          number: order.order_number,
          status: paymentStatus === "failed" ? "action_required" : "pending_payment",
          paymentStatus,
        },
      });
    }

    let shipment: unknown = null;
    let shipmentError: string | null = null;
    try {
      shipment = await createShipmentForOrder(orderId, "razorpay_verify");
    } catch (error) {
      shipmentError = normalizeError(error);
      await logAudit(supabase, "razorpay_verify", "shipment_creation_failed", "order", orderId, { error: shipmentError });
    }
    try {
      await notifyCustomer(orderId, "payment-confirmed");
    } catch (error) {
      await logAudit(supabase, "notifications", "payment_notification_failed", "order", orderId, {
        error: normalizeError(error),
      });
    }
    await logAudit(supabase, "razorpay", "payment_signature_verified", "order", orderId, {
      razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId,
    });
    return json(request, {
      order: { id: order.id, number: order.order_number, status: "confirmed", paymentStatus: "captured" },
      shipment,
      shipmentError,
    });
  } catch (error) {
    console.error("Razorpay verification failed", normalizeError(error));
    return json(request, { error: normalizeError(error) }, 500);
  }
});

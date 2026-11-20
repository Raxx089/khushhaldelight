import {
  adminClient, assertOrigin, basicAuthorization, fetchJson, json, logAudit, normalizeError,
  hmacSha256, preflight, readJson, requiredEnv, sha256,
} from "../_shared/http.ts";
import { createShipmentForOrder } from "../_shared/shiprocket.ts";
import { notifyCustomer } from "../_shared/notifications.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    assertOrigin(request);
    const body = await readJson(request);
    const idempotencyKey = String(body.idempotency_key ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      return json(request, { error: "A valid checkout idempotency key is required." }, 400);
    }
    if (!body.customer || typeof body.customer !== "object" || !body.address || typeof body.address !== "object") {
      return json(request, { error: "Customer and delivery address are required." }, 400);
    }
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
      return json(request, { error: "Cart contents are invalid." }, 400);
    }
    const paymentMethod = body.payment_method === "cod" ? "cod" : body.payment_method === "razorpay" ? "razorpay" : "";
    if (!paymentMethod) return json(request, { error: "Select a valid payment method." }, 400);
    const token = await hmacSha256(requiredEnv("ORDER_ACCESS_SECRET"), idempotencyKey);
    const supabase = adminClient();
    const { data, error } = await supabase.rpc("create_checkout_order", {
      p_idempotency_key: idempotencyKey,
      p_guest_access_hash: await sha256(token),
      p_customer: body.customer,
      p_address: body.address,
      p_items: body.items,
      p_coupon_code: typeof body.coupon_code === "string" ? body.coupon_code : null,
      p_shipping_quote_id: body.shipping_quote_id,
      p_payment_method: paymentMethod,
    });
    if (error) {
      if (error.code === "23505") {
        const { data: existing } = await supabase.from("orders")
          .select("id,order_number,total_paise,payment_method,payment_status,razorpay_order_id,guest_access_hash")
          .eq("idempotency_key", idempotencyKey).maybeSingle();
        if (existing) return await responseForExisting(request, supabase, existing, token);
      }
      return json(request, { error: error.message }, error.code === "22023" ? 400 : 500);
    }
    if (!data?.order_id) throw new Error("Order creation did not return an order ID.");

    if (paymentMethod === "cod") {
      let shipment: unknown = null;
      let shipmentError: string | null = null;
      try {
        shipment = await createShipmentForOrder(data.order_id, "cod_checkout");
      } catch (error) {
        shipmentError = normalizeError(error);
        const { error: updateError } = await supabase.from("shipments").upsert({
          order_id: data.order_id, status: "creation_failed", last_error: shipmentError,
          updated_at: new Date().toISOString(),
        }, { onConflict: "order_id" });
        if (updateError) console.error("could not save COD shipment failure", updateError.message);
        await logAudit(supabase, "cod_checkout", "shipment_creation_failed", "order", data.order_id, { error: shipmentError });
      }
      try {
        await notifyCustomer(data.order_id, "order-confirmed");
      } catch (error) {
        await logAudit(supabase, "notifications", "order_notification_failed", "order", data.order_id, {
          error: normalizeError(error),
        });
      }
      return json(request, {
        order: { id: data.order_id, number: data.order_number, totalPaise: data.total_paise, status: data.status, paymentStatus: "pending" },
        accessToken: token,
        shipment,
        shipmentError,
      });
    }

    if (data.razorpay_order_id) {
      const { data: payment } = await supabase.from("payments")
        .select("razorpay_order_id,amount_paise").eq("razorpay_order_id", data.razorpay_order_id).single();
      if (payment) {
        return json(request, {
          order: { id: data.order_id, number: data.order_number, totalPaise: data.total_paise, status: data.status },
          accessToken: token,
          payment: { keyId: requiredEnv("RAZORPAY_KEY_ID"), orderId: payment.razorpay_order_id, amountPaise: payment.amount_paise, currency: "INR" },
        });
      }
    }
    if (data.existing) {
      return json(request, { error: "This checkout is already being prepared. Please wait a moment, then retry with a new checkout." }, 409);
    }

    const keyId = requiredEnv("RAZORPAY_KEY_ID");
    const secret = requiredEnv("RAZORPAY_KEY_SECRET");
    const razorpayOrder = await fetchJson("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: basicAuthorization(keyId, secret), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: data.total_paise,
        currency: "INR",
        receipt: data.order_number,
        notes: { khushhal_order_id: data.order_id },
      }),
    });
    if (typeof razorpayOrder.id !== "string" || razorpayOrder.amount !== data.total_paise || razorpayOrder.currency !== "INR") {
      throw new Error("Razorpay returned an order that did not match the verified checkout total.");
    }
    const { error: saveError } = await supabase.rpc("set_razorpay_order", {
      p_order_id: data.order_id,
      p_razorpay_order_id: razorpayOrder.id,
      p_idempotency_key: idempotencyKey,
    });
    if (saveError) {
      await logAudit(supabase, "razorpay", "payment_order_persist_failed", "order", data.order_id, { razorpay_order_id: razorpayOrder.id });
      throw new Error("Razorpay order was created but could not be safely linked to your order. Please contact support before retrying.");
    }
    await logAudit(supabase, "razorpay", "payment_order_created", "order", data.order_id, { razorpay_order_id: razorpayOrder.id });
    return json(request, {
      order: { id: data.order_id, number: data.order_number, totalPaise: data.total_paise, status: data.status },
      accessToken: token,
      payment: { keyId, orderId: razorpayOrder.id, amountPaise: data.total_paise, currency: "INR" },
    });
  } catch (error) {
    console.error("checkout order creation failed", normalizeError(error));
    return json(request, { error: normalizeError(error) }, 502);
  }
});

async function responseForExisting(
  request: Request,
  supabase: ReturnType<typeof adminClient>,
  existing: { id: string; order_number: string; total_paise: number; payment_method: string; payment_status: string; razorpay_order_id: string | null; guest_access_hash: string },
  token: string,
) {
  if (existing.payment_method === "cod") {
    return json(request, {
      order: { id: existing.id, number: existing.order_number, totalPaise: existing.total_paise, status: "confirmed", paymentStatus: existing.payment_status },
      accessToken: token,
    });
  }
  if (existing.razorpay_order_id) {
    const { data: payment } = await supabase.from("payments").select("amount_paise")
      .eq("razorpay_order_id", existing.razorpay_order_id).maybeSingle();
    if (payment) return json(request, {
      order: { id: existing.id, number: existing.order_number, totalPaise: existing.total_paise, status: "pending_payment" },
      accessToken: token,
      payment: { keyId: requiredEnv("RAZORPAY_KEY_ID"), orderId: existing.razorpay_order_id, amountPaise: payment.amount_paise, currency: "INR" },
    });
  }
  return json(request, { error: "This checkout is already being prepared. Refresh your order and try again." }, 409);
}

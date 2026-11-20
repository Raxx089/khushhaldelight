import { adminClient, fetchJson, logAudit, requiredEnv } from "./http.ts";

let cachedToken: { value: string; expiresAt: number } | null = null;
const apiBase = "https://apiv2.shiprocket.in/v1/external";

export async function shiprocketToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const result = await fetchJson(`${apiBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: requiredEnv("SHIPROCKET_EMAIL"),
      password: requiredEnv("SHIPROCKET_PASSWORD"),
    }),
  });
  if (typeof result.token !== "string") throw new Error("Shiprocket authentication did not return an access token.");
  cachedToken = { value: result.token, expiresAt: Date.now() + 22 * 60 * 60 * 1000 };
  return result.token as string;
}

export async function shiprocketFetch(path: string, init: RequestInit = {}) {
  const token = await shiprocketToken();
  const headers = new Headers(init.headers);
  const authorization = "Bearer ".concat(token);
  headers.set("Authorization", authorization);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return await fetchJson(`${apiBase}${path}`, { ...init, headers });
}

export async function createShipmentForOrder(orderId: string, actor = "payment") {
  const supabase = adminClient();
  const { data: order, error: orderError } = await supabase.from("orders")
    .select("id,order_number,status,payment_status,payment_method,subtotal_paise,discount_paise,shipping_paise,total_paise,customer_id,address_id,shipping_quote_id")
    .eq("id", orderId).single();
  if (orderError || !order) throw new Error("Order not found for shipment creation.");
  if (order.payment_method === "razorpay" && order.payment_status !== "captured") {
    throw new Error("Shipment can only be created after payment is captured.");
  }

  const { data: prior } = await supabase.from("shipments")
    .select("id,status,awb_code,shipment_id,shiprocket_order_id,created_at")
    .eq("order_id", orderId).maybeSingle();
  if (prior?.awb_code) return prior;
  if (prior?.shipment_id && prior.status === "pending"
    && Date.now() - new Date(prior.created_at).getTime() < 10 * 60 * 1000) {
    return { order_id: orderId, status: "pending" };
  }
  if (!prior) {
    const { error: claimError } = await supabase.from("shipments")
      .insert({ order_id: orderId, status: "pending" });
    if (claimError?.code === "23505") return { order_id: orderId, status: "pending" };
    if (claimError) throw new Error("Could not claim this shipment for creation.");
  } else if (!prior.shipment_id) {
    if (prior.status === "pending" && Date.now() - new Date(prior.created_at).getTime() < 10 * 60 * 1000) {
      return { order_id: orderId, status: "pending" };
    }
    const { data: claimed, error: claimError } = await supabase.from("shipments")
      .update({ status: "pending", last_error: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", prior.id).in("status", ["creation_failed", "pending"]).select("id").maybeSingle();
    if (claimError || !claimed) return { order_id: orderId, status: "pending" };
  }

  const { data: address, error: addressError } = await supabase.from("addresses")
    .select("line1,line2,city,state,pincode").eq("id", order.address_id).single();
  const { data: customer, error: customerError } = await supabase.from("customers")
    .select("first_name,last_name,email,phone").eq("id", order.customer_id).single();
  const { data: items, error: itemsError } = await supabase.from("order_items")
    .select("product_id,product_name,quantity,unit_price_paise,customizations")
    .eq("order_id", orderId);
  if (addressError || customerError || itemsError || !address || !customer || !items?.length) {
    throw new Error("Order address or line items could not be loaded for shipment.");
  }
  const productIds = items.map((item) => item.product_id).filter((id): id is string => Boolean(id));
  const { data: products, error: productsError } = productIds.length
    ? await supabase.from("products").select("id,weight_grams").in("id", productIds)
    : { data: [], error: null };
  if (productsError) throw new Error("Product shipping weights could not be loaded.");
  const weights = new Map((products ?? []).map((product) => [product.id, product.weight_grams]));
  const { data: selectedQuote, error: quoteError } = await supabase.from("shipping_quotes")
    .select("courier_id,courier_name").eq("id", order.shipping_quote_id).single();
  if (quoteError || !selectedQuote) throw new Error("Selected shipping courier is no longer available.");
  const shipmentWeightKg = Math.max(0.1, items.reduce(
    (sum, item) => sum + item.quantity * (weights.get(item.product_id ?? "") ?? 100) / 1000,
    0,
  ));

  const orderPayload = {
    order_id: order.order_number,
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_location: requiredEnv("SHIPROCKET_PICKUP_LOCATION"),
    channel_id: "",
    comment: "Khushhal Delight order",
    billing_customer_name: customer.first_name,
    billing_last_name: customer.last_name,
    billing_address: address.line1,
    billing_address_2: address.line2,
    billing_city: address.city,
    billing_pincode: address.pincode,
    billing_state: address.state,
    billing_country: "India",
    billing_email: customer.email,
    billing_phone: customer.phone,
    shipping_is_billing: true,
    order_items: items.map((item, index) => ({
      name: item.product_name,
      sku: item.product_id ?? `CUSTOM-${order.order_number}-${index + 1}`,
      units: item.quantity,
      selling_price: (item.unit_price_paise / 100).toFixed(2),
      discount: "0",
      tax: "0",
      hsn: "",
    })),
    payment_method: order.payment_method === "cod" ? "COD" : "Prepaid",
    shipping_charges: (order.shipping_paise / 100).toFixed(2),
    total_discount: (order.discount_paise / 100).toFixed(2),
    sub_total: (order.subtotal_paise / 100).toFixed(2),
    length: 20,
    breadth: 15,
    height: 6,
    weight: shipmentWeightKg,
  };

  let created: Record<string, unknown> = prior?.shiprocket_order_id
    ? { order_id: prior.shiprocket_order_id, shipment_id: prior.shipment_id }
    : {};
  let shiprocketOrderId = String(created.order_id ?? "");
  let shipmentId = String(created.shipment_id ?? "");
  try {
    if (!shipmentId) {
      created = await shiprocketFetch("/orders/create/adhoc", {
        method: "POST", body: JSON.stringify(orderPayload),
      });
      shiprocketOrderId = String(created.order_id ?? "");
      shipmentId = String(created.shipment_id ?? "");
      if (!shiprocketOrderId || !shipmentId) throw new Error("Shiprocket did not return order and shipment IDs.");
      const { error: saveShipmentError } = await supabase.from("shipments").upsert({
        order_id: orderId,
        shiprocket_order_id: shiprocketOrderId,
        shipment_id: shipmentId,
        status: "created",
        raw_response: created,
        updated_at: new Date().toISOString(),
      }, { onConflict: "order_id" });
      if (saveShipmentError) throw new Error("Shiprocket created a shipment but its IDs could not be saved.");
    }

  if (selectedQuote?.courier_id) {
    const awb = await shiprocketFetch("/courier/assign/awb", {
      method: "POST", body: JSON.stringify({ shipment_id: shipmentId, courier_id: selectedQuote.courier_id }),
    });
    const assignment = awb.response ?? awb.data ?? awb;
    const awbCode = String(assignment.awb_code ?? assignment.awb ?? "");
    if (awbCode) {
      const { error: awbError } = await supabase.from("shipments").update({
        awb_code: awbCode,
        courier_id: String(assignment.courier_company_id ?? selectedQuote.courier_id),
        courier_name: String(assignment.courier_name ?? selectedQuote.courier_name),
        tracking_url: assignment.tracking_url ?? null,
        status: "created",
        raw_response: { create_order: created, awb },
        updated_at: new Date().toISOString(),
      }).eq("order_id", orderId);
      if (awbError) throw new Error("AWB was generated but could not be saved.");
    }

    try {
      const label = await shiprocketFetch("/courier/generate/label", {
        method: "POST", body: JSON.stringify({ shipment_id: [shipmentId] }),
      });
      const labelUrl = label.label_url ?? label.response?.label_url ?? null;
      if (labelUrl) await supabase.from("shipments").update({ label_url: labelUrl, updated_at: new Date().toISOString() }).eq("order_id", orderId);
    } catch (error) {
      await logAudit(supabase, actor, "shipping_label_failed", "order", orderId, { error: String(error) });
    }

    try {
      const pickup = await shiprocketFetch("/courier/generate/pickup", {
        method: "POST", body: JSON.stringify({ shipment_id: [shipmentId] }),
      });
      await supabase.from("shipments").update({
        pickup_requested_at: new Date().toISOString(), status: "pickup_scheduled",
        raw_response: { create_order: created, awb, pickup }, updated_at: new Date().toISOString(),
      }).eq("order_id", orderId);
    } catch (error) {
      await logAudit(supabase, actor, "pickup_request_failed", "order", orderId, { error: String(error) });
    }
  } else {
    await logAudit(supabase, actor, "courier_assignment_required", "order", orderId, { shipment_id: shipmentId });
  }

  await logAudit(supabase, actor, "shipment_created", "order", orderId, { shiprocket_order_id: shiprocketOrderId, shipment_id: shipmentId });
  return { order_id: orderId, shiprocket_order_id: shiprocketOrderId, shipment_id: shipmentId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shiprocket shipment creation failed.";
    const { error: saveError } = await supabase.from("shipments").update({
      status: "creation_failed", last_error: message, updated_at: new Date().toISOString(),
    }).eq("order_id", orderId);
    if (saveError) console.error("could not save shipment error", saveError.message);
    await logAudit(supabase, actor, "shipment_creation_failed", "order", orderId, { error: message });
    throw error;
  }
}

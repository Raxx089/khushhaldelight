import { adminClient, assertOrigin, constantTimeEqual, json, preflight, readJson, sha256 } from "../_shared/http.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);
  try {
    assertOrigin(request);
    const body = await readJson(request);
    const orderId = String(body.order_id ?? "");
    const accessToken = String(body.access_token ?? "");
    if (!orderId || !accessToken) return json(request, { error: "Order and private access token are required." }, 400);
    const supabase = adminClient();
    const { data: order, error } = await supabase.from("orders")
      .select("id,order_number,status,payment_status,payment_method,subtotal_paise,discount_paise,shipping_paise,total_paise,created_at,guest_access_hash,customer_id,address_id")
      .eq("id", orderId).single();
    if (error || !order || !constantTimeEqual(order.guest_access_hash, await sha256(accessToken))) {
      return json(request, { error: "Order not found or private tracking link is invalid." }, 404);
    }
    const [{ data: items, error: itemsError }, { data: shipment, error: shipmentError }] = await Promise.all([
      supabase.from("order_items").select("product_id,product_name,quantity,unit_price_paise,customizations")
        .eq("order_id", orderId),
      supabase.from("shipments").select("status,awb_code,courier_name,tracking_url,label_url,updated_at")
        .eq("order_id", orderId).maybeSingle(),
    ]);
    if (itemsError || shipmentError) throw new Error("Order details could not be loaded.");
    const [{ data: customer, error: customerError }, { data: address, error: addressError }] = await Promise.all([
      supabase.from("customers").select("first_name,last_name,email,phone").eq("id", order.customer_id).single(),
      supabase.from("addresses").select("line1,line2,city,state,pincode,country").eq("id", order.address_id).single(),
    ]);
    if (customerError || addressError) throw new Error("Order invoice details could not be loaded.");
    return json(request, {
      order: {
        id: order.id,
        number: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        subtotalPaise: order.subtotal_paise,
        discountPaise: order.discount_paise,
        shippingPaise: order.shipping_paise,
        totalPaise: order.total_paise,
        createdAt: order.created_at,
      },
      customer,
      address,
      items: items ?? [],
      shipment: shipment ?? null,
    });
  } catch (error) {
    console.error("order lookup failed", error);
    return json(request, { error: error instanceof Error ? error.message : "Could not load this order." }, 500);
  }
});

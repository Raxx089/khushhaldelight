import { adminClient, assertOrigin, json, normalizeError, preflight, readJson, requiredEnv } from "../_shared/http.ts";
import { shiprocketFetch } from "../_shared/shiprocket.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    assertOrigin(request);
    const body = await readJson(request);
    const pincode = String(body.pincode ?? "");
    const items = body.items;
    if (!/^[1-9][0-9]{5}$/.test(pincode)) return json(request, { error: "Enter a valid 6-digit delivery PIN code." }, 400);
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) return json(request, { error: "Cart contents are invalid." }, 400);

    const productIds = items.filter((item) => item?.product_id !== "custom-name-bar").map((item) => String(item?.product_id ?? ""));
    const supabase = adminClient();
    const { data: products, error: productError } = productIds.length
      ? await supabase.from("products").select("id,weight_grams,is_active").in("id", productIds)
      : { data: [], error: null };
    if (productError) throw new Error("Could not check product shipping weights.");
    const productMap = new Map((products ?? []).map((product) => [product.id, product]));
    let weightKg = 0;
    for (const item of items) {
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return json(request, { error: "Cart quantity is invalid." }, 400);
      if (item?.product_id === "custom-name-bar") {
        weightKg += quantity * 0.1;
      } else {
        const product = productMap.get(String(item?.product_id ?? ""));
        if (!product || !product.is_active) return json(request, { error: "A cart product is no longer available." }, 400);
        weightKg += quantity * product.weight_grams / 1000;
      }
    }

    const baseQuery = {
      pickup_postcode: requiredEnv("SHIPROCKET_PICKUP_PIN"),
      delivery_postcode: pincode,
      weight: Math.max(0.1, weightKg).toFixed(2),
    };
    const [prepaidResponse, codResponse] = await Promise.all([
      shiprocketFetch(`/courier/serviceability/?${new URLSearchParams({ ...baseQuery, cod: "0" })}`),
      shiprocketFetch(`/courier/serviceability/?${new URLSearchParams({ ...baseQuery, cod: "1" })}`),
    ]);
    const couriers = prepaidResponse.data?.available_courier_companies;
    const codCouriers = codResponse.data?.available_courier_companies;
    if (!Array.isArray(couriers) || couriers.length === 0) {
      return json(request, { error: "No courier service is currently available for this PIN code.", quotes: [] }, 422);
    }
    if (!Array.isArray(codCouriers)) {
      throw new Error("Shiprocket did not return COD serviceability results.");
    }
    const codCourierMap = new Map(codCouriers.map((courier) => [
      String(courier.courier_company_id ?? ""),
      courier,
    ]));

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const quotes = [];
    for (const courier of couriers) {
      const freight = Number(courier.rate);
      const courierId = String(courier.courier_company_id ?? "");
      if (!courierId || !Number.isFinite(freight) || freight < 0) continue;
      const codCourier = codCourierMap.get(courierId);
      const codAvailable = Boolean(codCourier) && Number(codCourier.cod ?? 1) === 1;
      const codRate = Number(codCourier?.rate);
      const explicitCodCharge = Number(codCourier?.cod_charges ?? codCourier?.cod_charge);
      const codCharge = Number.isFinite(explicitCodCharge)
        ? explicitCodCharge
        : Number.isFinite(codRate) ? Math.max(0, codRate - freight) : 0;
      const { data, error } = await supabase.from("shipping_quotes").insert({
        pincode,
        courier_id: courierId,
        courier_name: String(courier.courier_name ?? "Courier"),
        freight_paise: Math.round(freight * 100),
        estimated_days: Number(courier.estimated_delivery_days) || null,
        cod_available: codAvailable,
        cod_charge_paise: Number.isFinite(codCharge) ? Math.round(Math.max(0, codCharge) * 100) : 0,
        raw_response: courier,
        expires_at: expiresAt,
      }).select("id,courier_id,courier_name,freight_paise,estimated_days,cod_available,cod_charge_paise").single();
      if (error || !data) throw new Error("Shipping rates were returned but could not be saved. Please check serviceability again.");
      quotes.push({
        id: data.id,
        courierId: data.courier_id,
        courierName: data.courier_name,
        freightPaise: data.freight_paise,
        estimatedDays: data.estimated_days,
        codAvailable: data.cod_available,
        codChargePaise: data.cod_charge_paise,
      });
    }
    if (quotes.length === 0) return json(request, { error: "No valid courier rates were returned.", quotes: [] }, 422);
    return json(request, { quotes, expiresAt });
  } catch (error) {
    console.error("shipping serviceability failed", normalizeError(error));
    return json(request, { error: normalizeError(error) }, 502);
  }
});

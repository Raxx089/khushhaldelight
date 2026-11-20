import { adminClient, assertOrigin, json, normalizeError, preflight, readJson, sha256 } from "../_shared/http.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return preflight(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    assertOrigin(request);
    const body = await readJson(request);
    const code = String(body.code ?? "").trim().toUpperCase();
    const subtotalPaise = Number(body.subtotal_paise);
    if (!/^[A-Z0-9_-]{2,40}$/.test(code)
      || !Number.isSafeInteger(subtotalPaise)
      || subtotalPaise < 0
      || subtotalPaise > 50_000_000) {
      return json(request, { error: "Coupon code or cart subtotal is invalid." }, 400);
    }

    const supabase = adminClient();
    const ipAddress = request.headers.get("cf-connecting-ip")
      ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? "unknown";
    const { data: allowed, error: rateError } = await supabase.rpc("consume_chat_rate_limit", {
      p_key_hash: await sha256(`coupon:${ipAddress}`),
      p_limit: 20,
      p_window_seconds: 60,
    });
    if (rateError) throw new Error("Coupon validation could not be rate-checked.");
    if (!allowed) return json(request, { error: "Too many coupon checks. Please wait a moment and retry." }, 429);

    const { data: coupon, error } = await supabase.from("coupons")
      .select("code,discount_percent,discount_paise,minimum_subtotal_paise,max_redemptions,redemption_count,reserved_redemptions,active,valid_from,valid_until")
      .eq("code", code).maybeSingle();
    if (error) throw new Error("Could not check this coupon.");
    const now = Date.now();
    if (!coupon || !coupon.active
      || new Date(coupon.valid_from).getTime() > now
      || (coupon.valid_until && new Date(coupon.valid_until).getTime() <= now)
      || (coupon.max_redemptions !== null
        && coupon.redemption_count + coupon.reserved_redemptions >= coupon.max_redemptions)) {
      return json(request, { error: "This coupon is invalid, expired, or no longer available." }, 404);
    }
    if (subtotalPaise < coupon.minimum_subtotal_paise) {
      return json(request, {
        error: `Add ₹${((coupon.minimum_subtotal_paise - subtotalPaise) / 100).toLocaleString("en-IN")} more to use this coupon.`,
      }, 400);
    }

    const discountPaise = Math.min(subtotalPaise, coupon.discount_paise
      + Math.round(subtotalPaise * Number(coupon.discount_percent) / 100));
    return json(request, { code: coupon.code, discountPaise });
  } catch (error) {
    console.error("coupon validation failed", normalizeError(error));
    return json(request, { error: normalizeError(error) }, 500);
  }
});

import { adminClient, basicAuthorization, fetchJson, logAudit } from "./http.ts";

type NotificationEvent = "order-confirmed" | "payment-confirmed" | "in-transit" | "out-for-delivery" | "delivered";
type NotificationChannel = "email" | "sms" | "whatsapp";

async function claimNotification(
  supabase: ReturnType<typeof adminClient>,
  orderId: string,
  channel: NotificationChannel,
  recipient: string,
  event: NotificationEvent,
) {
  const { data, error } = await supabase.from("notification_logs").insert({
    order_id: orderId,
    channel,
    recipient,
    status: "pending",
    event_key: `${orderId}:${channel}:${event}`,
  }).select("id").maybeSingle();
  if (error?.code === "23505") return null;
  if (error || !data) throw new Error(`Could not record ${channel} notification attempt.`);
  return data.id as string;
}

async function finishNotification(
  supabase: ReturnType<typeof adminClient>,
  logId: string,
  status: "sent" | "failed" | "not_configured" | "skipped",
  providerReference?: string,
  error?: string,
) {
  const { error: updateError } = await supabase.from("notification_logs").update({
    status,
    provider_reference: providerReference ?? null,
    error: error ?? null,
  }).eq("id", logId);
  if (updateError) console.error("could not update notification status", updateError.message);
}

function whatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

function eventText(event: NotificationEvent, orderNumber: string, amount: string, awb: string, trackingUrl: string) {
  switch (event) {
    case "order-confirmed": return `Your Khushhal Delight order ${orderNumber} is confirmed. Total: ${amount}.`;
    case "payment-confirmed": return `Payment for Khushhal Delight order ${orderNumber} is confirmed. Total: ${amount}.`;
    case "in-transit": return `Order ${orderNumber} has been dispatched. AWB: ${awb}. Track: ${trackingUrl}`;
    case "out-for-delivery": return `Order ${orderNumber} is out for delivery. AWB: ${awb}. Track: ${trackingUrl}`;
    case "delivered": return `Order ${orderNumber} has been delivered. Thank you for choosing Khushhal Delight!`;
  }
}

export async function notifyCustomer(orderId: string, event: NotificationEvent = "order-confirmed") {
  const supabase = adminClient();
  const { data: order, error: orderError } = await supabase.from("orders")
    .select("id,order_number,total_paise,payment_method,customer_id").eq("id", orderId).single();
  if (orderError || !order) throw new Error("Order notification details could not be loaded.");
  const [{ data: customer, error: customerError }, { data: shipment }] = await Promise.all([
    supabase.from("customers").select("email,phone,first_name,whatsapp_opt_in,marketing_opt_in")
      .eq("id", order.customer_id).single(),
    supabase.from("shipments").select("awb_code,tracking_url").eq("order_id", orderId).maybeSingle(),
  ]);
  if (customerError || !customer) throw new Error("Order notification recipient could not be loaded.");
  const amount = `₹${(order.total_paise / 100).toLocaleString("en-IN")}`;
  const message = eventText(event, order.order_number, amount, shipment?.awb_code ?? "pending", shipment?.tracking_url ?? "");
  const configuredEmail = Deno.env.get("RESEND_API_KEY") && Deno.env.get("RESEND_FROM_EMAIL");
  const configuredSms = Deno.env.get("TWILIO_ACCOUNT_SID") && Deno.env.get("TWILIO_AUTH_TOKEN")
    && Deno.env.get("TWILIO_FROM_NUMBER");

  const emailLog = await claimNotification(supabase, orderId, "email", customer.email, event);
  if (emailLog) {
    if (!configuredEmail) {
      await finishNotification(supabase, emailLog, "not_configured");
    } else {
      try {
        const result = await fetchJson("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: Deno.env.get("RESEND_FROM_EMAIL"),
            to: [customer.email],
            subject: `Khushhal Delight order ${order.order_number} update`,
            text: `Hello ${customer.first_name},\n\n${message}\n\nThank you for choosing Khushhal Delight.`,
          }),
        });
        await finishNotification(supabase, emailLog, "sent", String(result.id ?? ""));
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Email provider request failed.";
        await finishNotification(supabase, emailLog, "failed", undefined, detail);
        await logAudit(supabase, "notifications", "email_failed", "order", orderId, { error: detail });
      }
    }
  }

  const smsLog = await claimNotification(supabase, orderId, "sms", customer.phone, event);
  if (smsLog) {
    if (!configuredSms) {
      await finishNotification(supabase, smsLog, "not_configured");
    } else {
      try {
        const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
        const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
        const form = new URLSearchParams({
          To: customer.phone,
          From: Deno.env.get("TWILIO_FROM_NUMBER")!,
          Body: `Khushhal Delight: ${message}`,
        });
        const result = await fetchJson(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: "POST",
          headers: { Authorization: basicAuthorization(accountSid, authToken), "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        await finishNotification(supabase, smsLog, "sent", String(result.sid ?? ""));
      } catch (error) {
        const detail = error instanceof Error ? error.message : "SMS provider request failed.";
        await finishNotification(supabase, smsLog, "failed", undefined, detail);
        await logAudit(supabase, "notifications", "sms_failed", "order", orderId, { error: detail });
      }
    }
  }

  const phone = whatsappPhone(customer.phone);
  const whatsAppLog = await claimNotification(supabase, orderId, "whatsapp", phone ?? customer.phone, event);
  if (!whatsAppLog) return;
  if (!customer.whatsapp_opt_in) {
    await finishNotification(supabase, whatsAppLog, "skipped", undefined, "Customer has not opted in to WhatsApp order updates.");
    return;
  }
  if (!phone) {
    await finishNotification(supabase, whatsAppLog, "failed", undefined, "Customer phone must include a valid Indian mobile number.");
    return;
  }
  const templateName = Deno.env.get(`WHATSAPP_TEMPLATE_${event.toUpperCase().replaceAll("-", "_")}`);
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  if (!templateName || !phoneNumberId || !accessToken) {
    await finishNotification(supabase, whatsAppLog, "not_configured");
    return;
  }
  try {
    const components = event === "order-confirmed" || event === "payment-confirmed"
      ? [{ type: "body", parameters: [
        { type: "text", text: order.order_number },
        { type: "text", text: amount },
        { type: "text", text: customer.first_name },
      ] }]
      : [{ type: "body", parameters: [
        { type: "text", text: order.order_number },
        { type: "text", text: shipment?.awb_code ?? "pending" },
        { type: "text", text: shipment?.tracking_url ?? "" },
      ] }];
    const apiVersion = Deno.env.get("WHATSAPP_API_VERSION") || "v22.0";
    const result = await fetchJson(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: Deno.env.get("WHATSAPP_TEMPLATE_LANGUAGE") || "en" },
          components,
        },
      }),
    });
    await finishNotification(supabase, whatsAppLog, "sent", String(result.messages?.[0]?.id ?? ""));
  } catch (error) {
    const detail = error instanceof Error ? error.message : "WhatsApp template request failed.";
    await finishNotification(supabase, whatsAppLog, "failed", undefined, detail);
    await logAudit(supabase, "notifications", "whatsapp_failed", "order", orderId, { event, error: detail });
  }
}

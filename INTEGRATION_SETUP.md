# Khushhal Delight integration setup

The storefront now has server-backed checkout/chat code, but provider accounts and credentials must be configured before any live payment, courier booking, WhatsApp messaging, or AI response can work. There are no mock successful payments or generated shipment confirmations.

## 1. Browser configuration

Copy `.env.example` to `.env.local` and set only:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WHATSAPP_NUMBER` (international digits, no `+`)

Only the Supabase anon key and public WhatsApp contact number belong in browser variables. The checkout receives the Razorpay key ID from the backend when an order is created. Do not put a service-role key, Razorpay secret, Shiprocket password, Gemini API key, Meta access token, or messaging-provider credential in a `VITE_*` variable.

## 2. Supabase database and functions

1. Create a Supabase project and set the browser variables above.
2. Link this repository to that project with the Supabase CLI.
3. Apply migrations with `supabase db push`. This creates the commerce, catalog, chat, rate-limit, order, and webhook tables and their RLS policies.
4. Create an administrator through Supabase Auth. Add that user's UUID to `public.admin_users` using the SQL editor:

   ```sql
   insert into public.admin_users (user_id)
   values ('AUTH_USER_UUID');
   ```

5. Add Supabase Edge Function secrets in the dashboard or with `supabase secrets set`. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions; never expose the service-role key to the browser.
6. Deploy `create-order`, `shipping-serviceability`, `validate-coupon`, `verify-payment`, `razorpay-webhook`, `shiprocket-webhook`, `order-lookup`, `admin-ops`, `assistant-chat`, and `whatsapp-webhook`. The webhook functions are configured with `verify_jwt = false` in `supabase/config.toml`; they verify provider signatures/tokens themselves. Customer-facing and admin requests otherwise use Supabase's normal JWT gateway validation.
7. Set `ALLOWED_ORIGINS` to the exact production site origin(s), comma-separated. Include the local Vite origin only in a development project.
8. Use `/admin/orders` to enter verified product prices, shipping weights, active flags, and actual stock. Initial inventory is deliberately zero so the website does not claim seeded/example stock is real. The migration's sample catalog descriptions, ingredients, allergens, prices, and seeded coupon offers must also be verified or replaced before launch.

The custom name-bar builder sends its selections to the server, where price and delivery-date rules are recalculated. Standard cart gift wrapping is priced at ₹49 per item on both the server and storefront. The separate build-your-own gift-box flow remains unavailable until its package contents and prices can be backed by verified catalog configuration; it does not add a simulated item to the cart. Coupon validation in the cart is a preview only; checkout recalculates eligibility and discount from database prices.

Required Edge Function secrets:

| Integration | Secrets |
|---|---|
| Core checkout | `ORDER_ACCESS_SECRET`, `ALLOWED_ORIGINS` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| Shiprocket | `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_PIN`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_WEBHOOK_TOKEN` |
| AI chat | `GEMINI_API_KEY`; optional `GEMINI_MODEL` (defaults to `gemini-3.5-flash-lite`) |
| WhatsApp Cloud API | `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `PUBLIC_SITE_URL` |
| WhatsApp templates | `WHATSAPP_TEMPLATE_LANGUAGE`, `WHATSAPP_TEMPLATE_ORDER_CONFIRMED`, `WHATSAPP_TEMPLATE_PAYMENT_CONFIRMED`, `WHATSAPP_TEMPLATE_IN_TRANSIT`, `WHATSAPP_TEMPLATE_OUT_FOR_DELIVERY`, `WHATSAPP_TEMPLATE_DELIVERED` |
| Optional email | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` |
| Optional SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |

`WHATSAPP_API_VERSION` is optional and defaults to `v22.0`. WhatsApp templates must be approved by Meta and match the variables expected by the code: order/payment confirmation takes order number, amount, and customer first name; shipment events take order number, AWB (or `pending`), and tracking URL. Transactional WhatsApp updates are sent only to customers who explicitly opt in at checkout. Marketing consent is separate and no promotional messages are sent by this integration.

## 3. Razorpay

1. Activate a Razorpay merchant account and start in Test Mode.
2. Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as Edge Function secrets. Set the webhook secret separately as `RAZORPAY_WEBHOOK_SECRET`.
3. Register `https://YOUR_PROJECT_REF.supabase.co/functions/v1/razorpay-webhook` in Razorpay and subscribe to `payment.authorized`, `payment.captured`, `payment.failed`, and `order.paid`.
4. Copy the webhook secret to Supabase. Do not use the API key secret as the webhook secret.
5. Test using Razorpay test credentials and provider-supported test payment methods. Do not switch to live keys until the verified callback and capture path have been reviewed.

The backend calculates totals from the database, creates the Razorpay order, verifies checkout signatures, and processes signed webhooks idempotently. A browser callback alone cannot mark an order paid.

## 4. Shiprocket

1. Activate Shiprocket, verify the pickup address, and create the pickup location name expected by the account.
2. Set the account email/password, pickup PIN, and exact pickup location name as Edge Function secrets.
3. Register `https://YOUR_PROJECT_REF.supabase.co/functions/v1/shiprocket-webhook` with Shiprocket. Configure it to send the same secret value in the `x-shiprocket-token` header.
4. Confirm serviceability, rates, COD eligibility, pickup booking, AWB, labels, and tracking against the activated account before accepting orders.

Shipment creation runs after verified payment (or for COD orders). Shiprocket API response formats and account-specific pickup configuration still require live test validation.

## 5. WhatsApp and AI

1. Set up a Meta WhatsApp Business Platform app, phone number, permanent/rotating access token process, and webhook subscription.
2. Configure callback URL `https://YOUR_PROJECT_REF.supabase.co/functions/v1/whatsapp-webhook`, the `WHATSAPP_VERIFY_TOKEN`, and subscribed `messages` events. Add Meta's app secret to `WHATSAPP_APP_SECRET` for `X-Hub-Signature-256` verification.
3. Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `PUBLIC_SITE_URL`, and the approved template names as Supabase Edge Function secrets.
4. Create a free Gemini API key in [Google AI Studio](https://aistudio.google.com/apikey) and set it as the Edge Function secret `GEMINI_API_KEY` (`supabase secrets set GEMINI_API_KEY=...`). Optionally set `GEMINI_MODEL` (defaults to `gemini-3.5-flash-lite`). AI requests run only in the Edge Function; product cards, price and inventory availability are selected from Supabase. The assistant uses the live catalog plus Admin FAQs as its knowledge base. The website AI chat can also add a catalog item to the existing cart.
5. Use `/admin/chat` to manage FAQs and assistant instructions, view conversations, assign/handoff, and reply. Add the administrator UUID to `public.admin_users` first. Starter FAQs ship with the migrations; edit or add more verified answers there.
6. Use the independent WhatsApp and marketing opt-ins appropriately. The code only sends transactional WhatsApp templates to customers with transactional WhatsApp opt-in; it does not send marketing messages.
7. Customers can request tracking by sending their `KD-...` order number from the same phone number used at checkout. WhatsApp can provide catalog recommendations and links, but does not yet create WhatsApp-originated carts/orders or Razorpay payment links; customers must complete payment through website checkout.

The WhatsApp Cloud API, approved templates, Meta webhook registration, and Gemini credentials are account prerequisites; they cannot be activated or verified from this repository alone.

## 6. Local checks and test plan

Run `npm install` after dependency changes and `npm run build` for the storefront. Deploy migrations/functions to a non-production Supabase project first. Configure provider test accounts and verify the following manually with real provider test responses:

| Area | Scenarios |
|---|---|
| Razorpay | successful payment; failed payment; retry; duplicate callback; invalid signature; pending/authorized event |
| Checkout | modified client price rejected; expired quote; invalid PIN; no courier; COD not supported; duplicate idempotency key |
| Shiprocket | prepaid and COD shipment; carrier failure/retry; AWB/label/pickup; tracking webhook; cancel eligible shipment |
| WhatsApp | webhook GET verification; invalid signature rejected; duplicate message ignored; English/Hindi request; product/price/stock grounded in catalog; human handoff; opted-in template delivery |
| Admin | non-admin denied; admin order filter; stock/price edit; shipment label/cancel; chat reply; FAQ and prompt edit |

This environment has no configured provider credentials and no Supabase, Razorpay, Shiprocket, Meta or Gemini account connection, so those live scenarios have not been run. It also lacks the Supabase CLI, Deno and PostgreSQL client; migrations and Edge Function code still need CLI/database type validation in the target Supabase project before production deployment.

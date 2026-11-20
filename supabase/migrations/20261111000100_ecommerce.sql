create extension if not exists pgcrypto;

create type public.order_status as enum (
  'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered',
  'cancelled', 'refunded', 'action_required'
);
create type public.payment_status as enum (
  'pending', 'authorized', 'captured', 'failed', 'refunded'
);
create type public.shipment_status as enum (
  'pending', 'created', 'pickup_scheduled', 'shipped', 'delivered',
  'cancelled', 'creation_failed'
);

create table public.products (
  id text primary key,
  name text not null,
  subtitle text not null default '',
  description text not null default '',
  category text not null default 'Chocolate',
  flavor text not null default '',
  weight text not null default '',
  image_url text not null default '',
  ingredients text not null default '',
  allergens text not null default '',
  unit_price_paise integer not null check (unit_price_paise >= 0),
  weight_grams integer not null default 100 check (weight_grams > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  name text not null,
  price_delta_paise integer not null default 0,
  active boolean not null default true,
  options jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.inventory (
  product_id text primary key references public.products(id) on delete cascade,
  available integer not null default 0 check (available >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  first_name text not null,
  last_name text not null,
  whatsapp_opt_in boolean not null default false,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  unique (email, phone)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  line1 text not null,
  line2 text not null default '',
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  country text not null default 'India' check (country = 'India'),
  created_at timestamptz not null default now()
);

create table public.coupons (
  code text primary key check (code = upper(code)),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  minimum_subtotal_paise integer not null default 0 check (minimum_subtotal_paise >= 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  reserved_redemptions integer not null default 0 check (reserved_redemptions >= 0),
  active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  check (valid_until is null or valid_until > valid_from)
);

create table public.shipping_quotes (
  id uuid primary key default gen_random_uuid(),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  courier_id text not null,
  courier_name text not null,
  freight_paise integer not null check (freight_paise >= 0),
  estimated_days integer check (estimated_days is null or estimated_days > 0),
  cod_available boolean not null default false,
  cod_charge_paise integer not null default 0 check (cod_charge_paise >= 0),
  raw_response jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('KD-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 10))),
  customer_id uuid not null references public.customers(id),
  address_id uuid not null references public.addresses(id),
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  payment_method text not null check (payment_method in ('razorpay', 'cod')),
  currency text not null default 'INR' check (currency = 'INR'),
  subtotal_paise integer not null check (subtotal_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  shipping_paise integer not null check (shipping_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  coupon_code text references public.coupons(code),
  shipping_quote_id uuid not null references public.shipping_quotes(id),
  idempotency_key uuid not null unique,
  guest_access_hash text not null,
  razorpay_order_id text unique,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_paise = subtotal_paise - discount_paise + shipping_paise)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity between 1 and 100),
  unit_price_paise integer not null check (unit_price_paise >= 0),
  customizations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'razorpay',
  attempt integer not null check (attempt > 0),
  idempotency_key uuid not null,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  amount_paise integer not null check (amount_paise >= 0),
  status public.payment_status not null default 'pending',
  failure_code text,
  failure_description text,
  signature_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, attempt),
  unique (order_id, idempotency_key)
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  shiprocket_order_id text unique,
  shipment_id text unique,
  courier_id text,
  courier_name text,
  awb_code text unique,
  label_url text,
  tracking_url text,
  status public.shipment_status not null default 'pending',
  raw_response jsonb not null default '{}'::jsonb,
  last_error text,
  pickup_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  channel text not null check (channel in ('email', 'sms')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'not_configured')),
  provider_reference text,
  error text,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('website', 'whatsapp')),
  session_id uuid unique,
  access_token_hash text,
  whatsapp_number text,
  customer_name text,
  status text not null default 'open' check (status in ('open', 'handoff', 'resolved')),
  assigned_admin uuid references public.admin_users(user_id) on delete set null,
  preferences jsonb not null default '{}'::jsonb,
  last_message_at timestamptz not null default now(),
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  check ((channel = 'website' and session_id is not null and access_token_hash is not null)
    or (channel = 'whatsapp' and whatsapp_number is not null))
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  provider_message_id text unique,
  role text not null check (role in ('customer', 'assistant', 'agent', 'system')),
  content text not null check (length(content) <= 4000),
  product_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.chat_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chatbot_settings (
  id boolean primary key default true check (id),
  system_prompt text not null default 'You are Khushhal Delight''s warm, concise chocolate shopping assistant. Use only verified catalog records. Do not invent product facts. Recommend only product IDs supplied with the catalog.',
  enabled boolean not null default true,
  updated_by uuid references public.admin_users(user_id),
  updated_at timestamptz not null default now()
);
insert into public.chatbot_settings (id) values (true) on conflict (id) do nothing;

create table public.chat_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  hits integer not null default 0 check (hits >= 0)
);

create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index orders_payment_status_idx on public.orders(payment_status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index payments_order_created_idx on public.payments(order_id, created_at desc);
create index shipments_status_idx on public.shipments(status, updated_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index shipping_quotes_expiry_idx on public.shipping_quotes(expires_at);
create index chat_conversations_status_idx on public.chat_conversations(status, last_message_at desc);
create index chat_messages_conversation_idx on public.chat_messages(conversation_id, created_at);
create index chat_faqs_active_idx on public.chat_faqs(active, created_at);
create index product_variants_product_idx on public.product_variants(product_id) where active;

insert into public.products (id, name, subtitle, category, flavor, weight, image_url, description, ingredients, allergens, unit_price_paise, weight_grams) values
  ('p1', 'Noir Intense 85%', 'Single Origin Dark Chocolate', 'Dark Chocolate', 'Dark', '100g', 'https://images.unsplash.com/photo-1592290321458-49b80f943a26?auto=format&fit=crop&w=800&q=80', 'Our flagship 85% cacao dark chocolate, bold, complex and smooth.', 'Cacao beans (85%), cane sugar, cocoa butter, vanilla extract', 'May contain traces of milk, nuts', 45000, 100),
  ('p2', 'Hazelnut Praline Collection', 'Artisan Gift Box · 16 Pieces', 'Gift Boxes', 'Mixed', '280g', 'https://images.unsplash.com/photo-1548741487-18d363dc4469?auto=format&fit=crop&w=800&q=80', '16 hand-crafted hazelnut pralines with roasted hazelnuts and Belgian-style milk chocolate.', 'Milk chocolate (45%), hazelnuts (30%), sugar, cocoa butter, whole milk powder, soy lecithin, vanilla extract', 'Contains milk, hazelnuts, soy. May contain other tree nuts.', 120000, 280),
  ('p3', 'Salted Caramel Truffles', 'Hand-Rolled · Box of 12', 'Truffles', 'Caramel', '180g', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80', 'Velvety caramel ganache hand-rolled in dark chocolate with Himalayan pink salt.', 'Dark chocolate (60%), heavy cream, salted butter, cane sugar, Himalayan pink salt, vanilla extract', 'Contains milk, soy. May contain nuts.', 89000, 180),
  ('p4', 'Rose & Raspberry Bonbons', 'Floral Collection · Box of 9', 'Bonbons', 'Fruit', '135g', 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=800&q=80', 'Dark chocolate shells with rose-infused white chocolate ganache and raspberry coulis.', 'Dark chocolate (58%), white chocolate, raspberry purée, heavy cream, rose water, sugar', 'Contains milk, soy.', 75000, 135),
  ('p5', 'Signature Collection', 'Premium Gift Box · 24 Pieces', 'Gift Boxes', 'Assorted', '480g', 'https://images.unsplash.com/photo-1526081715791-7c538f86060e?auto=format&fit=crop&w=800&q=80', 'A curated collection of 24 dark, milk and white chocolate pieces.', 'Assorted chocolate varieties — see individual flavors inside', 'Contains milk, soy, nuts. May contain gluten.', 220000, 480),
  ('p6', 'Madagascar 72%', 'Single Origin · Intense & Fruity', 'Dark Chocolate', 'Dark', '100g', 'https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?auto=format&fit=crop&w=800&q=80', 'Single-origin cacao with red fruit notes, citrus brightness and a complex finish.', 'Cacao beans (72%), cane sugar, cocoa butter', 'May contain traces of milk, nuts. Vegan.', 52000, 100),
  ('p7', 'White Truffle Pearls', 'Champagne & Vanilla · Box of 12', 'Truffles', 'White', '200g', 'https://images.unsplash.com/photo-1542843137-8791a6904d14?auto=format&fit=crop&w=800&q=80', 'White chocolate spheres with vanilla bean and Champagne ganache, dusted in edible gold.', 'White chocolate (35%), heavy cream, Champagne reduction, vanilla bean, edible gold dust', 'Contains milk, soy. May contain nuts, gluten.', 110000, 200),
  ('p8', 'Almond & Sea Salt', 'Dark Chocolate Almond Bites', 'Chocolate Bites', 'Dark', '150g', 'https://images.unsplash.com/photo-1613669146965-507d0e72a688?auto=format&fit=crop&w=800&q=80', 'Roasted California almonds enrobed in 70% dark chocolate and finished with fleur de sel.', 'Dark chocolate (70%), almonds (25%), sugar, cocoa butter, sea salt', 'Contains almonds. May contain other tree nuts, milk.', 68000, 150),
  ('p9', 'Festive Grand Box', 'Celebration Gift · 32 Pieces', 'Gift Boxes', 'Assorted', '640g', 'https://images.unsplash.com/photo-1573013792262-761a3e17fb39?auto=format&fit=crop&w=800&q=80', '32 individually wrapped chocolates in a silk-lined gift box with personalized message card.', 'Assorted premium chocolates — dark, milk, and white varieties', 'Contains milk, soy, nuts. May contain gluten.', 350000, 640),
  ('p10', 'Mint Dark Elegance', 'Dark Chocolate with Fresh Mint', 'Dark Chocolate', 'Mint', '100g', 'https://images.unsplash.com/photo-1623000850293-0cbbc517c719?auto=format&fit=crop&w=800&q=80', '70% dark chocolate with refreshing peppermint oil.', 'Cacao beans (70%), cane sugar, cocoa butter, peppermint oil', 'May contain traces of milk, nuts. Vegan.', 38000, 100),
  ('p11', 'Passion Fruit Noir', 'Dark Truffles with Tropical Twist · 6 Pieces', 'Truffles', 'Tropical', '90g', 'https://images.unsplash.com/photo-1542843137-8791a6904d14?auto=format&fit=crop&w=800&q=80', 'Dark chocolate truffles with a vibrant passion fruit ganache.', 'Dark chocolate (65%), passion fruit purée, heavy cream, sugar, cocoa butter', 'Contains milk, soy.', 65000, 90),
  ('p12', 'Corporate Elite Box', 'Premium Corporate Gift · 32 Pieces', 'Corporate', 'Assorted', '640g', 'https://images.unsplash.com/photo-1573013792262-761a3e17fb39?auto=format&fit=crop&w=800&q=80', 'Bespoke corporate gift box with 32 premium chocolates and a personalized message card.', 'Assorted premium chocolates — see insert card for full ingredient details', 'Contains milk, soy, nuts. May contain gluten.', 380000, 640)
on conflict (id) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  category = excluded.category,
  flavor = excluded.flavor,
  weight = excluded.weight,
  image_url = excluded.image_url,
  description = excluded.description,
  ingredients = excluded.ingredients,
  allergens = excluded.allergens,
  unit_price_paise = excluded.unit_price_paise,
  weight_grams = excluded.weight_grams,
  updated_at = now();

insert into public.inventory (product_id, available) values
  ('p1', 0), ('p2', 0), ('p3', 0), ('p4', 0),
  ('p5', 0), ('p6', 0), ('p7', 0), ('p8', 0),
  ('p9', 0), ('p10', 0), ('p11', 0), ('p12', 0)
on conflict (product_id) do nothing;

insert into public.coupons (code, discount_percent, active) values
  ('WELCOME10', 10, true),
  ('SWEET20', 20, true),
  ('LUXURY15', 15, true)
on conflict (code) do nothing;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_quotes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notification_logs enable row level security;
alter table public.admin_users enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_faqs enable row level security;
alter table public.chatbot_settings enable row level security;
alter table public.chat_rate_limits enable row level security;

create policy "Public may read active products" on public.products
  for select using (is_active);
create policy "Admins may manage products" on public.products
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Public may read active variants" on public.product_variants
  for select using (active);
create policy "Admins may manage variants" on public.product_variants
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Public may read inventory availability" on public.inventory
  for select using (true);
create policy "Admins may manage inventory" on public.inventory
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read customers" on public.customers
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may manage addresses" on public.addresses
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may manage coupons" on public.coupons
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read orders" on public.orders
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read order items" on public.order_items
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read payments" on public.payments
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may manage shipments" on public.shipments
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read webhook events" on public.webhook_events
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read audit logs" on public.audit_logs
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read notification logs" on public.notification_logs
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Users may read own admin access" on public.admin_users
  for select using (user_id = auth.uid());
create policy "Admins may manage chat conversations" on public.chat_conversations
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may manage chat messages" on public.chat_messages
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Public may read active FAQs" on public.chat_faqs
  for select using (active);
create policy "Admins may manage FAQs" on public.chat_faqs
  for all using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may read chatbot settings" on public.chatbot_settings
  for select using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admins may update chatbot settings" on public.chatbot_settings
  for update using (exists (select 1 from public.admin_users where user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create or replace function public.create_checkout_order(
  p_idempotency_key uuid,
  p_guest_access_hash text,
  p_customer jsonb,
  p_address jsonb,
  p_items jsonb,
  p_coupon_code text,
  p_shipping_quote_id uuid,
  p_payment_method text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.orders%rowtype;
  v_payment_id uuid;
  v_customer_id uuid;
  v_address_id uuid;
  v_order_id uuid;
  v_item jsonb;
  v_retry_item record;
  v_custom jsonb;
  v_product public.products%rowtype;
  v_inventory public.inventory%rowtype;
  v_quantity integer;
  v_unit_price integer;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_shipping integer;
  v_total integer;
  v_coupon public.coupons%rowtype;
  v_quote public.shipping_quotes%rowtype;
  v_custom_price integer;
  v_custom_text text;
  v_custom_type text;
  v_custom_flavor text;
  v_custom_finish text;
  v_custom_box text;
  v_custom_inclusions text;
  v_custom_date date;
  v_gift_wrap boolean;
  v_gift_message text;
  v_line jsonb;
  v_order_items jsonb := '[]'::jsonb;
  v_order_number text;
begin
  select * into v_existing from public.orders where idempotency_key = p_idempotency_key for update;
  if found then
    if v_existing.payment_method = 'razorpay'
       and v_existing.payment_status = 'failed'
       and v_existing.status = 'action_required' then
      for v_retry_item in
        select product_id, quantity from public.order_items
        where order_id = v_existing.id and product_id is not null
      loop
        select * into v_inventory from public.inventory where product_id = v_retry_item.product_id for update;
        if not found or v_inventory.available - v_inventory.reserved < v_retry_item.quantity then
          raise exception 'Product stock is no longer available for payment retry' using errcode = '22023';
        end if;
        update public.inventory set reserved = reserved + v_retry_item.quantity, updated_at = now()
        where product_id = v_retry_item.product_id;
      end loop;
      update public.payments set status = 'pending', failure_code = null, failure_description = null,
        updated_at = now()
      where order_id = v_existing.id and provider = 'razorpay';
      update public.orders set status = 'pending_payment', payment_status = 'pending', updated_at = now()
      where id = v_existing.id returning * into v_existing;
    end if;
    return jsonb_build_object('order_id', v_existing.id, 'order_number', v_existing.order_number,
      'total_paise', v_existing.total_paise, 'payment_method', v_existing.payment_method,
      'razorpay_order_id', v_existing.razorpay_order_id, 'status', v_existing.status,
      'payment_status', v_existing.payment_status, 'existing', true);
  end if;

  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Cart must contain between 1 and 50 items' using errcode = '22023';
  end if;
  if p_payment_method is null or p_payment_method not in ('razorpay', 'cod') then
    raise exception 'Unsupported payment method' using errcode = '22023';
  end if;
  if coalesce(p_customer->>'email', '') !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
     or coalesce(p_customer->>'phone', '') !~ '^[0-9+() -]{8,20}$'
     or length(coalesce(p_customer->>'first_name', '')) not between 1 and 100
     or length(coalesce(p_customer->>'last_name', '')) not between 1 and 100 then
    raise exception 'Customer details are invalid' using errcode = '22023';
  end if;
  if jsonb_typeof(p_address) is distinct from 'object'
     or length(coalesce(p_address->>'line1', '')) not between 1 and 250
     or length(coalesce(p_address->>'city', '')) not between 1 and 100
     or length(coalesce(p_address->>'state', '')) not between 1 and 100
     or coalesce(p_address->>'pincode', '') !~ '^[1-9][0-9]{5}$' then
    raise exception 'Delivery address is invalid' using errcode = '22023';
  end if;
  if length(coalesce(p_guest_access_hash, '')) <> 64 then
    raise exception 'Guest order access token is invalid' using errcode = '22023';
  end if;

  select * into v_quote from public.shipping_quotes
  where id = p_shipping_quote_id and expires_at > now()
    and pincode = p_address->>'pincode';
  if not found then
    raise exception 'Shipping quote expired or does not match the delivery PIN code; check rates again' using errcode = '22023';
  end if;
  if p_payment_method = 'cod' and not v_quote.cod_available then
    raise exception 'Cash on delivery is not available for this courier' using errcode = '22023';
  end if;
  v_shipping := v_quote.freight_paise + case when p_payment_method = 'cod' then v_quote.cod_charge_paise else 0 end;

  insert into public.customers (email, phone, first_name, last_name, whatsapp_opt_in, marketing_opt_in)
  values (lower(trim(p_customer->>'email')), trim(p_customer->>'phone'),
    trim(p_customer->>'first_name'), trim(p_customer->>'last_name'),
    coalesce((p_customer->>'whatsapp_opt_in')::boolean, false),
    coalesce((p_customer->>'marketing_opt_in')::boolean, false))
  on conflict (email, phone) do update set
    first_name = excluded.first_name, last_name = excluded.last_name,
    whatsapp_opt_in = excluded.whatsapp_opt_in,
    marketing_opt_in = excluded.marketing_opt_in
  returning id into v_customer_id;

  insert into public.addresses (customer_id, line1, line2, city, state, pincode)
  values (v_customer_id, trim(p_address->>'line1'), coalesce(trim(p_address->>'line2'), ''),
    trim(p_address->>'city'), trim(p_address->>'state'), p_address->>'pincode')
  returning id into v_address_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 100 then
      raise exception 'Item quantity must be between 1 and 100' using errcode = '22023';
    end if;

    if v_item->>'product_id' = 'custom-name-bar' then
      v_custom := v_item->'customizations';
      v_custom_type := v_custom->>'bar_type';
      v_custom_text := v_custom->>'text';
      v_custom_flavor := v_custom->>'flavor';
      v_custom_finish := v_custom->>'finish';
      v_custom_box := v_custom->>'gift_box';
      v_custom_inclusions := v_custom->>'inclusions';
      begin v_custom_date := (v_custom->>'delivery_date')::date;
      exception when others then raise exception 'Custom bar delivery date is invalid' using errcode = '22023'; end;

      if v_custom_type = 'single' then
        if length(v_custom_text) not between 1 and 8 or position(E'\n' in v_custom_text) > 0 then
          raise exception 'Name bars allow up to 8 characters' using errcode = '22023';
        end if;
        v_custom_price := 39900;
      elsif v_custom_type = 'message' then
        if length(v_custom_text) not between 1 and 20 or array_length(string_to_array(v_custom_text, E'\n'), 1) > 2 then
          raise exception 'Message slabs allow 20 characters over at most 2 lines' using errcode = '22023';
        end if;
        v_custom_price := 59900;
      elsif v_custom_type = 'blocks' then
        if length(v_custom_text) not between 4 and 12 or v_custom_text !~ '^[[:alpha:]&♥]+$' then
          raise exception 'Letter blocks require 4 to 12 letters' using errcode = '22023';
        end if;
        v_custom_price := 79900 + greatest(0, length(v_custom_text) - 4) * 5000;
      else
        raise exception 'Custom bar type is invalid' using errcode = '22023';
      end if;
      if v_custom_flavor is null or v_custom_flavor not in ('dark55', 'dark70', 'milk', 'white')
         or v_custom_finish is null or v_custom_finish not in ('gold', 'silver', 'natural')
         or v_custom_box is null or v_custom_box not in ('classic', 'festive', 'wooden')
         or v_custom_date is null or v_custom_date < current_date + 2 then
        raise exception 'Custom bar options or delivery date are invalid' using errcode = '22023';
      end if;
      if v_custom_box = 'festive' then v_custom_price := v_custom_price + 9900;
      elsif v_custom_box = 'wooden' then v_custom_price := v_custom_price + 14900; end if;

      if jsonb_typeof(v_custom->'inclusions') is distinct from 'array' then
        raise exception 'Custom bar inclusions are invalid' using errcode = '22023';
      end if;
      if jsonb_array_length(v_custom->'inclusions') > 3 then
        raise exception 'Too many custom bar inclusions' using errcode = '22023';
      end if;
      if length(coalesce(v_custom->>'gift_note', '')) > 150 then
        raise exception 'Custom bar gift note is invalid' using errcode = '22023';
      end if;
      for v_custom_text in select jsonb_array_elements_text(v_custom->'inclusions')
      loop
        if v_custom_text = 'almonds' then v_custom_price := v_custom_price + 4000;
        elsif v_custom_text in ('hazelnuts', 'pistachio') then v_custom_price := v_custom_price + 6000;
        else raise exception 'Custom bar inclusion is invalid' using errcode = '22023'; end if;
      end loop;
      v_gift_wrap := coalesce((v_custom->>'gift_wrap')::boolean, false);
      if v_gift_wrap then v_custom_price := v_custom_price + 4900; end if;
      v_unit_price := v_custom_price;
      v_subtotal := v_subtotal + v_unit_price * v_quantity;
      v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
        'product_id', null,
        'product_name', case v_custom_type when 'single' then 'Custom Name Bar' when 'message' then 'Custom Message Slab' else 'Alphabet Letter Blocks' end,
        'quantity', v_quantity, 'unit_price_paise', v_unit_price, 'customizations', v_custom
      ));
    else
      select * into v_product from public.products where id = v_item->>'product_id' and is_active for update;
      if not found then raise exception 'A product in your cart is no longer available' using errcode = '22023'; end if;
      select * into v_inventory from public.inventory where product_id = v_product.id for update;
      if not found or v_inventory.available - v_inventory.reserved < v_quantity then
        raise exception 'A product in your cart is out of stock' using errcode = '22023';
      end if;
      v_gift_wrap := coalesce((v_item->'customizations'->>'gift_wrap')::boolean, false);
      v_gift_message := coalesce(v_item->'customizations'->>'gift_message', '');
      if length(v_gift_message) > 150 then
        raise exception 'Gift message must be 150 characters or fewer' using errcode = '22023';
      end if;
      v_unit_price := v_product.unit_price_paise + case when v_gift_wrap then 4900 else 0 end;
      v_subtotal := v_subtotal + v_unit_price * v_quantity;
      update public.inventory set reserved = reserved + v_quantity, updated_at = now() where product_id = v_product.id;
      v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
        'product_id', v_product.id, 'product_name', v_product.name,
        'quantity', v_quantity, 'unit_price_paise', v_unit_price,
        'customizations', jsonb_build_object(
          'gift_wrap', v_gift_wrap,
          'gift_message', v_gift_message
        )
      ));
    end if;
  end loop;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
    where code = upper(trim(p_coupon_code)) and active and valid_from <= now()
      and (valid_until is null or valid_until > now())
      and (max_redemptions is null or redemption_count + reserved_redemptions < max_redemptions)
    for update;
    if not found then raise exception 'Coupon is invalid or expired' using errcode = '22023'; end if;
    if v_subtotal < v_coupon.minimum_subtotal_paise then
      raise exception 'Cart subtotal does not meet the coupon minimum' using errcode = '22023';
    end if;
    v_discount := least(v_subtotal, v_coupon.discount_paise +
      round(v_subtotal * v_coupon.discount_percent / 100)::integer);
    update public.coupons set reserved_redemptions = reserved_redemptions + 1 where code = v_coupon.code;
  end if;

  if p_payment_method = 'cod' and v_subtotal - v_discount + v_shipping > 5000000 then
    raise exception 'Cash on delivery is unavailable above the order limit' using errcode = '22023';
  end if;
  v_total := v_subtotal - v_discount + v_shipping;
  insert into public.orders (
    customer_id, address_id, payment_method, subtotal_paise, discount_paise, shipping_paise,
    total_paise, coupon_code, shipping_quote_id, idempotency_key, guest_access_hash, status
  ) values (
    v_customer_id, v_address_id, p_payment_method, v_subtotal, v_discount, v_shipping,
    v_total, case when p_coupon_code is null or length(trim(p_coupon_code)) = 0 then null else upper(trim(p_coupon_code)) end,
    p_shipping_quote_id, p_idempotency_key, p_guest_access_hash,
    case when p_payment_method = 'cod' then 'confirmed'::public.order_status else 'pending_payment'::public.order_status end
  ) returning id, order_number into v_order_id, v_order_number;

  for v_line in select value from jsonb_array_elements(v_order_items)
  loop
    insert into public.order_items (order_id, product_id, product_name, quantity, unit_price_paise, customizations)
    values (v_order_id, nullif(v_line->>'product_id', ''), v_line->>'product_name',
      (v_line->>'quantity')::integer, (v_line->>'unit_price_paise')::integer,
      coalesce(v_line->'customizations', '[]'::jsonb));
  end loop;

  if p_payment_method = 'cod' then
    update public.inventory i set available = greatest(0, i.available - oi.quantity),
      reserved = greatest(0, i.reserved - oi.quantity), updated_at = now()
    from public.order_items oi
    where oi.order_id = v_order_id and oi.product_id = i.product_id;
    if v_coupon.code is not null then
      update public.coupons set reserved_redemptions = greatest(0, reserved_redemptions - 1),
        redemption_count = redemption_count + 1 where code = v_coupon.code;
    end if;
  end if;

  insert into public.audit_logs (actor, action, entity_type, entity_id, details)
  values ('checkout', 'order_created', 'order', v_order_id::text,
    jsonb_build_object('payment_method', p_payment_method, 'total_paise', v_total));

  if p_payment_method = 'cod' then
    insert into public.payments (order_id, provider, attempt, idempotency_key, amount_paise, status)
    values (v_order_id, 'cod', 1, p_idempotency_key, v_total, 'pending');
  end if;

  return jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number,
    'total_paise', v_total, 'subtotal_paise', v_subtotal, 'discount_paise', v_discount,
    'shipping_paise', v_shipping, 'payment_method', p_payment_method,
    'status', case when p_payment_method = 'cod' then 'confirmed' else 'pending_payment' end,
    'payment_status', 'pending', 'existing', false);
end;
$$;

create or replace function public.set_razorpay_order(
  p_order_id uuid,
  p_razorpay_order_id text,
  p_idempotency_key uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders set razorpay_order_id = p_razorpay_order_id, updated_at = now()
  where id = p_order_id and payment_method = 'razorpay' and payment_status = 'pending'
    and idempotency_key = p_idempotency_key;
  if not found then raise exception 'Order could not be updated with Razorpay order' using errcode = '22023'; end if;

  insert into public.payments (order_id, provider, attempt, idempotency_key, razorpay_order_id, amount_paise)
  select p_order_id, 'razorpay', coalesce(max(attempt), 0) + 1, p_idempotency_key,
    p_razorpay_order_id, o.total_paise
  from public.orders o left join public.payments p on p.order_id = o.id
  where o.id = p_order_id
  group by o.total_paise
  on conflict (order_id, idempotency_key) do nothing;
end;
$$;

create or replace function public.apply_payment_event(
  p_razorpay_order_id text,
  p_razorpay_payment_id text,
  p_status public.payment_status,
  p_failure_code text default null,
  p_failure_description text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_payment_id uuid;
  v_release_reservation boolean;
begin
  select * into v_payment from public.payments where razorpay_order_id = p_razorpay_order_id;
  if not found then raise exception 'Payment attempt not found' using errcode = 'P0002'; end if;
  v_payment_id := v_payment.id;
  select * into v_order from public.orders where id = v_payment.order_id for update;
  select * into v_payment from public.payments where id = v_payment_id for update;
  v_release_reservation := p_status = 'failed' and v_payment.status <> 'failed';
  if v_order.payment_status = 'captured' then
    return jsonb_build_object('order_id', v_order.id, 'status', v_order.status, 'already_processed', true);
  end if;
  if p_status = 'captured' and p_razorpay_payment_id is null then
    raise exception 'Captured payment requires a payment ID' using errcode = '22023';
  end if;
  update public.payments set status = p_status, razorpay_payment_id = coalesce(p_razorpay_payment_id, razorpay_payment_id),
    failure_code = p_failure_code, failure_description = p_failure_description,
    signature_verified_at = case when p_status = 'captured' then now() else signature_verified_at end,
    updated_at = now()
  where id = v_payment.id;
  update public.orders set
    payment_status = p_status,
    status = case when p_status = 'captured' then 'confirmed'::public.order_status
      when p_status = 'failed' and status = 'pending_payment' then 'action_required'::public.order_status
      else status end,
    confirmed_at = case when p_status = 'captured' then coalesce(confirmed_at, now()) else confirmed_at end,
    updated_at = now()
  where id = v_order.id;

  if p_status = 'captured' then
    update public.inventory i set available = greatest(0, i.available - oi.quantity),
      reserved = greatest(0, i.reserved - oi.quantity), updated_at = now()
    from public.order_items oi
    where oi.order_id = v_order.id and oi.product_id = i.product_id;
    if v_order.coupon_code is not null then
      update public.coupons set reserved_redemptions = greatest(0, reserved_redemptions - 1),
        redemption_count = redemption_count + 1 where code = v_order.coupon_code;
    end if;
  elsif v_release_reservation then
    update public.inventory i set reserved = greatest(0, i.reserved - oi.quantity), updated_at = now()
    from public.order_items oi
    where oi.order_id = v_order.id and oi.product_id = i.product_id;
    if v_order.coupon_code is not null then
      update public.coupons set reserved_redemptions = greatest(0, reserved_redemptions - 1)
      where code = v_order.coupon_code;
    end if;
  end if;

  insert into public.audit_logs (actor, action, entity_type, entity_id, details)
  values ('razorpay', 'payment_' || p_status::text, 'order', v_order.id::text,
    jsonb_build_object('payment_id', p_razorpay_payment_id, 'failure_code', p_failure_code));
  return jsonb_build_object('order_id', v_order.id, 'status', p_status, 'already_processed', false);
end;
$$;

create or replace function public.claim_webhook_event(
  p_provider text,
  p_event_id text,
  p_event_type text,
  p_payload jsonb
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.webhook_events (provider, provider_event_id, event_type, payload)
  values (p_provider, p_event_id, p_event_type, p_payload)
  on conflict (provider, provider_event_id) do update
    set payload = excluded.payload
    where public.webhook_events.processed_at is null
      and (
        public.webhook_events.error is not null
        or public.webhook_events.created_at < now() - interval '5 minutes'
      );
  return found;
end;
$$;

create or replace function public.expire_pending_orders(p_age interval default interval '2 hours')
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_count integer := 0;
begin
  for v_order in
    update public.orders set status = 'cancelled', updated_at = now()
    where status in ('pending_payment', 'action_required') and payment_status in ('pending', 'failed')
      and created_at < now() - p_age
    returning id, coupon_code
  loop
    update public.inventory i set reserved = greatest(0, i.reserved - oi.quantity), updated_at = now()
    from public.order_items oi
    where oi.order_id = v_order.id and oi.product_id = i.product_id;
    if v_order.coupon_code is not null then
     update public.coupons set reserved_redemptions = greatest(0, reserved_redemptions - 1)
     where code = v_order.coupon_code;
    end if;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.consume_chat_rate_limit(p_key_hash text, p_limit integer default 20, p_window_seconds integer default 60)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := now();
  v_allowed boolean;
begin
  insert into public.chat_rate_limits (key_hash, window_started_at, hits)
  values (p_key_hash, v_window, 1)
  on conflict (key_hash) do update set
    window_started_at = case
      when public.chat_rate_limits.window_started_at < v_window - make_interval(secs => p_window_seconds) then v_window
      else public.chat_rate_limits.window_started_at
    end,
    hits = case
      when public.chat_rate_limits.window_started_at < v_window - make_interval(secs => p_window_seconds) then 1
      else public.chat_rate_limits.hits + 1
    end;
  select hits <= p_limit into v_allowed from public.chat_rate_limits where key_hash = p_key_hash;
  return v_allowed;
end;
$$;

revoke all on function public.create_checkout_order(uuid,text,jsonb,jsonb,jsonb,text,uuid,text) from public, anon, authenticated;
revoke all on function public.set_razorpay_order(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.apply_payment_event(text,text,public.payment_status,text,text) from public, anon, authenticated;
revoke all on function public.claim_webhook_event(text,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.expire_pending_orders(interval) from public, anon, authenticated;
revoke all on function public.consume_chat_rate_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.create_checkout_order(uuid,text,jsonb,jsonb,jsonb,text,uuid,text) to service_role;
grant execute on function public.set_razorpay_order(uuid,text,uuid) to service_role;
grant execute on function public.apply_payment_event(text,text,public.payment_status,text,text) to service_role;
grant execute on function public.claim_webhook_event(text,text,text,jsonb) to service_role;
grant execute on function public.expire_pending_orders(interval) to service_role;
grant execute on function public.consume_chat_rate_limit(text,integer,integer) to service_role;

import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { fetchJson, requiredEnv } from "./http.ts";

export interface CatalogProduct {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  flavor: string;
  weight: string;
  image_url: string;
  ingredients: string;
  allergens: string;
  unit_price_paise: number;
  available: number;
  variants: { id: string; name: string; price_delta_paise: number; options: unknown }[];
}

export async function fetchChatCatalog(supabase: SupabaseClient) {
  const { data: products, error } = await supabase.from("products")
    .select("id,name,subtitle,description,category,flavor,weight,image_url,ingredients,allergens,unit_price_paise,inventory(available,reserved),product_variants(id,name,price_delta_paise,options)")
    .eq("is_active", true).order("name");
  if (error) throw new Error("The live chocolate catalog is temporarily unavailable.");
  return (products ?? []).map((product) => ({
    ...product,
    available: Math.max(0, (product.inventory?.available ?? 0) - (product.inventory?.reserved ?? 0)),
    variants: product.product_variants ?? [],
  })) as CatalogProduct[];
}

export async function generateAssistantReply(
  supabase: SupabaseClient,
  userMessage: string,
  history: { role: string; content: string }[],
) {
  const catalog = await fetchChatCatalog(supabase);
  const query = userMessage.toLocaleLowerCase();
  const matched = catalog.filter((product) =>
    [product.name, product.category, product.flavor, product.subtitle].some((value) =>
      value.toLocaleLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 2)
        .some((part) => query.includes(part)),
    ),
  ).slice(0, 4);
  const asksIngredients = /\b(ingredient|allergen|allergy|contains|nut|dairy|milk|vegan|gluten)\b/i.test(userMessage);
  const asksPrice = /\b(price|cost|how much|budget|under|below|within|₹|rupee)\b/i.test(userMessage);
  const asksStock = /\b(stock|available|availability|in stock)\b/i.test(userMessage);
  const budgetMatch = userMessage.match(/(?:under|below|within|budget(?:\s+is)?|₹|rs\.?\s*)(\d{2,6})/i);
  let selected = matched;
  let deterministicReply: string | null = null;

  if (budgetMatch) {
    const budgetPaise = Number(budgetMatch[1]) * 100;
    selected = catalog.filter((product) => product.unit_price_paise <= budgetPaise && product.available > 0)
      .sort((left, right) => left.unit_price_paise - right.unit_price_paise).slice(0, 4);
    deterministicReply = selected.length
      ? `Here are available chocolates currently listed within ₹${Number(budgetMatch[1]).toLocaleString("en-IN")}.`
      : `I couldn't find an in-stock catalog item within ₹${Number(budgetMatch[1]).toLocaleString("en-IN")}. I can help adjust your budget or ask our team.`;
  } else if (matched.length && asksIngredients) {
    const product = matched[0];
    deterministicReply = `${product.name}: ingredients listed are ${product.ingredients || "not currently listed in the product catalog"}. Allergen information: ${product.allergens || "please contact our team to confirm"}. If you have a severe allergy, please confirm directly with our team before ordering.`;
    selected = matched.slice(0, 1);
  } else if (matched.length && asksPrice) {
    const product = matched[0];
    deterministicReply = `${product.name} is listed at ₹${(product.unit_price_paise / 100).toLocaleString("en-IN")}. The catalog currently shows ${product.available} available.`;
    selected = matched.slice(0, 1);
  } else if (matched.length && asksStock) {
    const product = matched[0];
    deterministicReply = product.available > 0
      ? `${product.name} currently has ${product.available} available in the catalog.`
      : `${product.name} is currently marked out of stock in the live catalog.`;
    selected = matched.slice(0, 1);
  } else if (matched.length && /\b(search|find|show|browse|category|chocolate|gift|recommend)\b/i.test(userMessage)) {
    selected = matched.filter((product) => product.available > 0).slice(0, 4);
  }

  let reply = deterministicReply;
  if (!reply) {
    const [{ data: settings }, { data: faqs }] = await Promise.all([
      supabase.from("chatbot_settings").select("system_prompt,enabled").eq("id", true).maybeSingle(),
      supabase.from("chat_faqs").select("question,answer").eq("active", true).limit(30),
    ]);
    if (settings?.enabled === false) {
      return { reply: "Our automated assistant is taking a break. Please message our WhatsApp team for help.", products: [], handoff: true };
    }
    const prompt = [
      settings?.system_prompt ?? "You are Khushhal Delight's chocolate shopping assistant.",
      "Be warm, concise and support English and Hindi.",
      "Use only the supplied FAQ and catalog.",
      "Do not state prices, stock counts, ingredients, allergens, delivery promises, payment results, or shipment status in generated text. The application displays verified catalog facts separately.",
      "Do not claim to add to cart, apply a coupon, place an order, create a payment, or book a shipment. Ask the customer to use the website controls or human WhatsApp support.",
      "Ask about recipient, occasion, budget, flavor and personalization when helping choose a gift.",
      "Recommend product IDs only from this catalog. Never invent product names or IDs.",
      `Catalog: ${JSON.stringify(catalog.map(({ id, name, subtitle, category, flavor, description }) => ({
        id, name, subtitle, category, flavor, description,
      })))}`,
      `FAQ: ${JSON.stringify(faqs ?? [])}`,
    ].join("\n");
    const messages = [
      { role: "system", content: prompt },
      ...history.slice(-8).filter((message) => ["user", "assistant"].includes(message.role)).map((message) => ({
        role: message.role, content: message.content.slice(0, 1000),
      })),
      { role: "user", content: userMessage },
    ];
    const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
    const result = await fetchJson("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "khushhal_assistant_reply",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reply: { type: "string" },
                product_ids: { type: "array", items: { type: "string" } },
              },
              required: ["reply", "product_ids"],
              additionalProperties: false,
            },
          },
        },
        max_tokens: 350,
        temperature: 0.3,
      }),
    });
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("AI assistant did not return a response.");
    const parsed = JSON.parse(content);
    reply = String(parsed.reply ?? "").slice(0, 1500);
    if (/(?:₹|INR\s*\d|Rs\.?\s*\d|\b(?:cost|price|priced|available|availability|in stock)\s+(?:is|are|at)\s+\d)/i.test(reply)) {
      reply = "Here are a few options from our catalog. You can see their current prices and availability on the product cards below.";
    }
    const validIds = new Set(catalog.map((product) => product.id));
    const requestedIds = Array.isArray(parsed.product_ids) ? parsed.product_ids : [];
    selected = requestedIds
      .filter((id: unknown): id is string => typeof id === "string" && validIds.has(id))
      .map((id: string) => catalog.find((product) => product.id === id)!)
      .filter((product: CatalogProduct) => product.available > 0)
      .slice(0, 4);
  }

  return {
    reply: reply || "Tell me about the person, occasion and budget, and I’ll look for a suitable chocolate gift.",
    products: selected.map((product) => ({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      description: product.description,
      category: product.category,
      flavor: product.flavor,
      weight: product.weight,
      image: product.image_url,
      ingredients: product.ingredients,
      allergens: product.allergens,
      pricePaise: product.unit_price_paise,
      available: product.available,
      variants: product.variants,
    })),
    handoff: false,
  };
}

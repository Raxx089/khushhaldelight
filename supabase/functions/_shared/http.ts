import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const timeoutMs = 15000;

export function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Server configuration is missing ${name}.`);
  return value;
}

export function adminClient(): SupabaseClient {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",").map((value) => value.trim()).filter(Boolean);
  const allowed = origin === "" || configuredOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? (origin || "*") : "null",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-razorpay-signature, x-shiprocket-token",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function preflight(request: Request) {
  const headers = corsHeaders(request);
  if (headers["Access-Control-Allow-Origin"] === "null") {
    return new Response("Origin not allowed", { status: 403, headers });
  }
  return new Response("ok", { headers });
}

export function assertOrigin(request: Request) {
  if (request.headers.get("origin") && corsHeaders(request)["Access-Control-Allow-Origin"] === "null") {
    throw new Error("Request origin is not allowed.");
  }
}

export async function readJson(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 100_000) throw new Error("Request is too large.");
  const value = await request.json().catch(() => null);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Request body must be a JSON object.");
  }
  return value as Record<string, unknown>;
}

export async function fetchJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : `Provider request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload;
}

export function basicAuthorization(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`;
}

export async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return mismatch === 0;
}

export function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

export async function logAudit(
  supabase: SupabaseClient,
  actor: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  const { error } = await supabase.from("audit_logs").insert({
    actor, action, entity_type: entityType, entity_id: entityId, details,
  });
  if (error) console.error("audit log insert failed", error.message);
}

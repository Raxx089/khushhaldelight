import { getSupabaseClient } from "./supabase";

export interface ShippingQuote {
  id: string;
  courierId: string;
  courierName: string;
  freightPaise: number;
  codAvailable: boolean;
  codChargePaise: number;
  estimatedDays: number | null;
}

interface ApiError {
  error?: string;
  code?: string;
}

export async function callCommerce<T>(functionName: string, payload: unknown): Promise<T> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Store services are not configured yet. Please contact us for assistance.");
  }
  const { data: sessionData } = await getSupabaseClient().auth.getSession();
  const accessToken = sessionData.session?.access_token || anonKey;

  let response: Response;
  try {
    response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error("The checkout service took too long to respond. Please retry.");
    }
    throw new Error("Could not reach checkout. Check your connection and retry.");
  }

  const result = await response.json().catch(() => ({} as ApiError));
  if (!response.ok) {
    const apiError = result as ApiError;
    throw new Error(apiError.error || `Checkout request failed (${response.status}).`);
  }
  return result as T;
}

export function getOrderAccessToken(orderId: string): string | null {
  try {
    return window.localStorage.getItem(`khushhal-order:${orderId}`);
  } catch {
    return null;
  }
}

export function saveOrderAccessToken(orderId: string, token: string) {
  try {
    window.localStorage.setItem(`khushhal-order:${orderId}`, token);
  } catch {
    throw new Error("Order confirmed, but this browser could not save its private tracking link. Save the order number and contact support for tracking.");
  }
}

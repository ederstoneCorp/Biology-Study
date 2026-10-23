const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export type SubscriptionStatus = "free" | "pending" | "active" | "expired";
export type SubscriptionSnapshot = {
  status: SubscriptionStatus;
  expiresAt: string | null;
  requestStatus: "none" | "pending" | "issued" | "fulfilled";
};

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  if (!API_URL) throw new Error("The subscription service is not configured. Please contact the administrator.");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const authToken = token ?? localStorage.getItem("biology-study:auth-token");
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export function getSubscriptionStatus() {
  return request<SubscriptionSnapshot>("/api/subscriptions/status");
}

export function submitSubscriptionRequest() {
  return request<SubscriptionSnapshot>("/api/subscriptions/request", { method: "POST", body: JSON.stringify({}) });
}

export function redeemSubscriptionKey(key: string) {
  return request<SubscriptionSnapshot & { message: string }>("/api/subscriptions/redeem", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export function adminSignIn(adminKey: string) {
  return request<{ token: string }>("/api/subscriptions/admin/login", {
    method: "POST",
    body: JSON.stringify({ adminKey }),
  }, "");
}

export function generateSubscriptionKey(token: string, durationDays: 30 | 60 | 90) {
  return request<{ key: string; durationDays: number; createdAt: string }>("/api/subscriptions/admin/keys", {
    method: "POST",
    body: JSON.stringify({ durationDays }),
  }, token);
}

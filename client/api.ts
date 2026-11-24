export type Kind = "direct" | "affiliate" | "rep";
export type Config = {
  environment: "live" | "test";
  square: { applicationId: string; locationId: string; sdk: string } | null;
  turnstile?: string | null;
  prices: Record<Kind, { setupCents: number; monthlyCents: number }>;
  funnels: { affiliate: boolean; rep: boolean };
  pixels?: { meta: string | null; tiktok: string | null } | null;
};
export type DomainCheck = { domain: string; available: boolean | null; unverified: boolean; reason: string | null; alternatives: { domain: string; available: boolean | null }[] };

async function call<T>(path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(path, body === undefined ? undefined : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}

export const getConfig = () => call<Config>("/api/config").then((r) => r.data);
export const getLink = (kind: "affiliate" | "rep", handle: string) =>
  call<{ firstName: string | null }>(`/api/link/${kind}/${encodeURIComponent(handle)}`).then((r) => (r.status === 200 ? r.data : null));
export const checkDomain = (query: string) => call<DomainCheck & { message?: string }>("/api/domain-check", { query });
export const checkout = (body: unknown) => call<{ ok: boolean; message?: string; firstChargeOn?: string | null }>("/api/checkout", body);
export const saveDetails = (body: unknown) => call<{ ok: boolean; message?: string; domain?: string; setupUrl?: string | null }>("/api/details", body);

export const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
export const uuid = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6]! & 0x0f) | 0x40; b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

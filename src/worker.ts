// WebX DJ funnels: one Worker serves all three ways to buy a WebX DJ website.
//   /            automated: the buyer checks out on their own        → offer dj-direct
//   /a/<name>    an affiliate's link (from social media)              → offer dj-affiliate
//   /r/<name|#>  a WebX rep's link (they guide the buyer)             → offer dj-rep
// The funnel holds no secrets: prices, payments, domains and the buyer's DJ Hub account all go
// through WebX Core over a private service binding (CORE). Square's card form runs in the browser
// and only ever hands us a one-time card token.

export interface Env {
  ASSETS: Fetcher;
  CORE: Fetcher;                       // service binding → webx-core / webx-core-test
  CORE_URL: string;                    // the URL Core expects (routing only; carried by the binding)
  META_PIXEL_ID?: string;              // public Meta (Facebook/Instagram) pixel id; live only
  TIKTOK_PIXEL_ID?: string;            // public TikTok pixel id; live only
  ENVIRONMENT: "live" | "test";
  SQUARE_APPLICATION_ID?: string;      // public (it's in every buyer's browser)
  SQUARE_LOCATION_ID: string;          // public
  AFFILIATE_FUNNEL: "on" | "off";      // /a/ links; off until Kris approves on live
  REP_FUNNEL: "on" | "off";            // /r/ links; off until Kris approves on live
}

type Kind = "direct" | "affiliate" | "rep";
const OFFER: Record<Kind, string> = { direct: "dj-direct", affiliate: "dj-affiliate", rep: "dj-rep" };
// What the funnel shows. Core is the source of truth: if its terms ever differ, we stop before charging.
const PRICE: Record<Kind, { setupCents: number; monthlyCents: number }> = {
  direct: { setupCents: 9900, monthlyCents: 4900 },
  affiliate: { setupCents: 14900, monthlyCents: 4900 },
  rep: { setupCents: 14900, monthlyCents: 4900 },
};
const HANDLE = /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SECURITY: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(self \"https://web.squarecdn.com\" \"https://sandbox.web.squarecdn.com\")",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
  "content-security-policy": [
    "default-src 'self'",
    "script-src 'self' https://connect.facebook.net https://analytics.tiktok.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://js.squareup.com https://js.squareupsandbox.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://web.squarecdn.com https://sandbox.web.squarecdn.com",
    "font-src 'self' https://fonts.gstatic.com https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "connect-src 'self' https://www.facebook.com https://connect.facebook.net https://analytics.tiktok.com https://analytics-ipv6.tiktokw.us https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://o160250.ingest.sentry.io",
    "frame-src https://web.squarecdn.com https://sandbox.web.squarecdn.com https://geoissuer.cardinalcommerce.com https://api.squareup.com https://api.squareupsandbox.com https://connect.squareup.com https://connect.squareupsandbox.com",
    "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'",
  ].join("; "),
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...SECURITY } });

function withSecurity(res: Response): Response {
  const r = new Response(res.body, res);
  for (const [k, v] of Object.entries(SECURITY)) r.headers.set(k, v);
  return r;
}

async function core(env: Env, method: "GET" | "POST", path: string, body?: unknown, headers: Record<string, string> = {}) {
  const res = await env.CORE.fetch(`${env.CORE_URL.replace(/\/$/, "")}${path}`, {
    method, headers: { accept: "application/json", ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: res.status, data: data ?? {} };
}

/** One-way visitor id for click counts: who (IP + browser) and today's date, hashed. Not reversible to a person. */
async function visitorHash(req: Request): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${req.headers.get("cf-connecting-ip") ?? ""}|${req.headers.get("user-agent") ?? ""}|${day}|webx-link-visit`;
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function enabled(env: Env, kind: Kind) {
  return kind === "direct" || (kind === "affiliate" ? env.AFFILIATE_FUNNEL === "on" : env.REP_FUNNEL === "on");
}

async function readBody<T>(req: Request, max = 16_000): Promise<T | null> {
  const t = await req.text(); if (t.length > max) return null;
  try { return JSON.parse(t) as T; } catch { return null; }
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url); const p = url.pathname;
    try {
      if (p === "/health") return json({ ok: true, service: "webx-dj-funnels", environment: env.ENVIRONMENT });

      if (p === "/api/config" && req.method === "GET") {
        const sandbox = env.ENVIRONMENT !== "live";
        return json({
          environment: env.ENVIRONMENT,
          square: env.SQUARE_APPLICATION_ID ? {
            applicationId: env.SQUARE_APPLICATION_ID, locationId: env.SQUARE_LOCATION_ID,
            sdk: sandbox ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js",
          } : null,
          prices: PRICE, funnels: { affiliate: env.AFFILIATE_FUNNEL === "on", rep: env.REP_FUNNEL === "on" },
          // Ad pixels: public IDs, set per environment in wrangler.jsonc (live only, so test runs don't count as ads results).
          pixels: env.META_PIXEL_ID || env.TIKTOK_PIXEL_ID ? { meta: env.META_PIXEL_ID || null, tiktok: env.TIKTOK_PIXEL_ID || null } : null,
        });
      }

      // Who sent this buyer: /api/link/affiliate/kayla → { firstName } (404 if the link isn't real/active).
      const lk = p.match(/^\/api\/link\/(affiliate|rep)\/([^/]+)$/);
      if (lk && req.method === "GET") {
        const kind = lk[1] as Kind; const handle = decodeURIComponent(lk[2]!).toLowerCase();
        if (!enabled(env, kind)) return json({ error: "off" }, 404);
        if (!HANDLE.test(handle)) return json({ error: "not_found" }, 404);
        const r = await core(env, "GET", `/v1/checkout/links/${kind}/${handle}`);
        if (r.status !== 200) return json({ error: "not_found" }, 404);
        // Count the click for the affiliate's/rep's dashboard: a one-way hash of who + today, never the IP itself.
        ctx.waitUntil(visitorHash(req).then((visitor) => core(env, "POST", `/v1/checkout/links/${kind}/${handle}/visit`, { visitor },
          { "x-webx-buyer-ip": req.headers.get("cf-connecting-ip") ?? "" })).catch(() => {}));
        return json({ kind, handle, firstName: r.data.firstName ?? null });
      }

      if (p === "/api/domain-check" && req.method === "POST") {
        const b = await readBody<{ query?: string }>(req);
        const q = str(b?.query, 120); if (!q) return json({ error: "invalid_request" }, 400);
        const r = await core(env, "POST", "/v1/checkout/domain-check", { query: q }, { "x-webx-buyer-ip": req.headers.get("cf-connecting-ip") ?? "" });
        return json(r.data, r.status);
      }

      // Pay: Core makes (or reuses) the checkout session for this key, then charges the card token.
      if (p === "/api/checkout" && req.method === "POST") {
        const b = await readBody<Record<string, unknown>>(req);
        const kind = (["direct", "affiliate", "rep"].includes(String(b?.kind)) ? b!.kind : "") as Kind | "";
        const key = str(b?.key, 40); const sourceId = str(b?.sourceId, 500);
        if (!kind || !enabled(env, kind) || !UUID.test(key) || !sourceId) return json({ ok: false, message: "Something's missing. Refresh the page and try again." }, 400);
        const handle = kind === "direct" ? undefined : str(b?.handle, 32).toLowerCase();
        if (kind !== "direct" && !HANDLE.test(handle ?? "")) return json({ ok: false, message: "This link isn't valid. Ask the person who sent it for a new one." }, 400);
        const c = (b?.customer ?? {}) as Record<string, unknown>; const d = (b?.details ?? {}) as Record<string, unknown>;
        const customer = { email: str(c.email, 254).toLowerCase(), name: str(c.name, 200) || undefined, timeZone: str(c.timeZone, 64) || "America/Los_Angeles" };
        const details = { phone: str(d.phone, 40) || undefined, stageName: str(d.stageName, 80) || undefined, genre: str(d.genre, 60) || undefined, design: str(d.design, 40) || undefined };
        const s = await core(env, "POST", "/v1/checkout/sessions", { offerId: OFFER[kind], linkHandle: handle, customer, details, paymentMode: "card" }, { "idempotency-key": key });
        if (s.status >= 400) return json({ ok: false, message: String(s.data.message ?? "We couldn't start your checkout. Please try again.") }, s.status === 422 ? 422 : 400);
        const terms = s.data.terms as { setup?: { amountCents?: number } } | undefined;
        if (Number(terms?.setup?.amountCents) !== PRICE[kind].setupCents) {
          return json({ ok: false, message: "Prices just changed. Refresh the page to see the current price. You were not charged." }, 409);
        }
        const pay = await core(env, "POST", `/v1/checkout/sessions/${s.data.checkoutSessionId}/pay`,
          { sourceId, verificationToken: str(b?.verificationToken, 2000) || undefined, details });
        if (pay.status >= 400 || pay.data.ok === false) return json({ ok: false, message: String(pay.data.message ?? "Your payment didn't go through. You were not charged.") }, 402);
        return json({ ok: true, firstChargeOn: pay.data.firstChargeOn ?? null, orderId: pay.data.orderId ?? null });
      }

      // After paying: their domain → Core saves it, makes their DJ Hub account and returns the setup link.
      if (p === "/api/details" && req.method === "POST") {
        const b = await readBody<Record<string, unknown>>(req);
        const key = str(b?.key, 40); const email = str(b?.email, 254).toLowerCase();
        if (!UUID.test(key) || !email) return json({ ok: false, message: "We couldn't find your purchase in this browser." }, 400);
        const d = (b?.details ?? {}) as Record<string, unknown>;
        const details = { domain: str(d.domain, 253).toLowerCase() || undefined, ownsDomain: d.ownsDomain === true, phone: str(d.phone, 40) || undefined, stageName: str(d.stageName, 80) || undefined };
        const r = await core(env, "POST", "/v1/checkout/details", { email, details }, { "idempotency-key": key });
        if (r.status >= 400) return json({ ok: false, message: String(r.data.message ?? "We couldn't save that. Please try again.") }, r.status);
        const setupUrl = typeof r.data.setupUrl === "string" && /^https:\/\/[a-z0-9.-]+\/auth\/setup\?/.test(r.data.setupUrl) ? r.data.setupUrl : null;
        return json({ ok: true, domain: r.data.domain ?? details.domain, setupUrl });
      }

      if (p.startsWith("/api/")) return json({ error: "not_found" }, 404);

      // Pages: real files first, then the app for every funnel path.
      if (/\.[a-z0-9]{2,5}$/i.test(p)) {
        const r = await env.ASSETS.fetch(req);
        if (r.status !== 404) {
          const out = withSecurity(r);
          if (p.startsWith("/assets/")) out.headers.set("cache-control", "public, max-age=31536000, immutable");
          return out;
        }
      }
      if (p === "/" || /^\/(a|r)\/[^/]+\/?$/.test(p) || p === "/privacy" || p === "/terms") {
        // Ask for "/" (not "/index.html": Cloudflare redirects that to "/", which would loop).
        const r = await env.ASSETS.fetch(new Request(new URL("/", url), { method: "GET", headers: req.headers }));
        if (r.status >= 300 && r.status < 400) return withSecurity(new Response("Page unavailable", { status: 502 })); // never pass a redirect on
        const out = withSecurity(r); out.headers.set("cache-control", "no-cache"); return out;
      }
      return withSecurity(new Response("Not found", { status: 404 }));
    } catch (e) {
      console.error("funnel error", p, (e as Error).message);
      return json({ ok: false, message: "Something went wrong on our side. You were not charged. Please try again in a minute." }, 500);
    }
  },
};

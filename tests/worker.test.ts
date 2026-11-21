import assert from "node:assert/strict";
import { test } from "node:test";
import worker, { type Env } from "../src/worker";

// A fake Core that records calls, so we can check what the funnel sends and refuses.
function env(over: Partial<Env> = {}, answers: Record<string, [number, unknown]> = {}) {
  const calls: { url: string; init: RequestInit }[] = [];
  const e = {
    ASSETS: { fetch: async () => new Response("<html>app</html>", { headers: { "content-type": "text/html" } }) },
    CORE: { fetch: async (url: string, init: RequestInit) => { calls.push({ url, init }); const k = Object.keys(answers).find((p) => url.includes(p));
      const [s, b] = k ? answers[k]! : [404, {}]; return new Response(JSON.stringify(b), { status: s }); } },
    CORE_URL: "https://core.test", ENVIRONMENT: "test", SQUARE_LOCATION_ID: "L1", AFFILIATE_FUNNEL: "on", REP_FUNNEL: "off", ...over,
  } as unknown as Env;
  return { e, calls };
}
const post = (path: string, body: unknown) => new Request(`https://f.test${path}`, { method: "POST", body: JSON.stringify(body) });
const KEY = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("health and pages", async () => {
  const { e } = env();
  assert.equal((await worker.fetch(new Request("https://f.test/health"), e)).status, 200);
  for (const p of ["/", "/a/kayla", "/r/104", "/privacy"]) {
    const r = await worker.fetch(new Request(`https://f.test${p}`), e);
    assert.equal(r.status, 200, p); assert.match(r.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  }
  assert.equal((await worker.fetch(new Request("https://f.test/nope"), e)).status, 404);
});

test("switched-off funnels refuse their links", async () => {
  const { e, calls } = env({}, { "/links/rep/104": [200, { firstName: "Sam" }] });
  assert.equal((await worker.fetch(new Request("https://f.test/api/link/rep/104"), e)).status, 404);
  assert.equal(calls.length, 0, "Core not even asked");
});

test("checkout stops before charging if Core's price differs", async () => {
  const { e, calls } = env({}, { "/v1/checkout/sessions": [201, { checkoutSessionId: "s1", terms: { setup: { amountCents: 12300 } } }] });
  const r = await worker.fetch(post("/api/checkout", { kind: "direct", key: KEY, sourceId: "cnon:x", customer: { email: "a@b.co" } }), e);
  assert.equal(r.status, 409);
  assert.ok(!calls.some((c) => c.url.endsWith("/pay")), "never paid");
});

test("affiliate checkout sends the handle and the right offer", async () => {
  const { e, calls } = env({}, { "/v1/checkout/sessions/s1/pay": [200, { ok: true, firstChargeOn: "2026-12-01" }], "/v1/checkout/sessions": [201, { checkoutSessionId: "s1", terms: { setup: { amountCents: 14900 } } }] });
  const r = await worker.fetch(post("/api/checkout", { kind: "affiliate", handle: "Kayla", key: KEY, sourceId: "cnon:x", customer: { email: "A@B.co" } }), e);
  assert.equal(r.status, 200);
  const s = JSON.parse(String(calls[0]!.init.body));
  assert.equal(s.offerId, "dj-affiliate"); assert.equal(s.linkHandle, "kayla"); assert.equal(s.customer.email, "a@b.co");
});

test("details only passes through a DJ Hub setup link", async () => {
  const { e } = env({}, { "/v1/checkout/details": [200, { ok: true, domain: "x.com", setupUrl: "https://evil.example/phish" }] });
  const r = await worker.fetch(post("/api/details", { key: KEY, email: "a@b.co", details: { domain: "x.com" } }), e);
  assert.equal((await r.json() as { setupUrl: unknown }).setupUrl, null);
});

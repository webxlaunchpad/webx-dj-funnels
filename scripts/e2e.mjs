// End-to-end check of the TEST funnels (webx-dj-funnels-test → webx-core-test → Square sandbox →
// DJ Hub test). Never touches live. Uses Square's sandbox test card token.
import { chromium } from "playwright";
const F = "https://webx-dj-funnels-test.webxlaunchpad.workers.dev";
const results = []; let failed = false;
const ok = (name, cond, info = "") => { results.push(`${cond ? "PASS" : "FAIL"}  ${name}${info ? `  (${info})` : ""}`); if (!cond) failed = true; };
const j = async (path, body) => { const r = await fetch(F + path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined); return { status: r.status, data: await r.json().catch(() => ({})), headers: r.headers }; };

// 1. Pages, health, config
for (const p of ["/", "/a/test-dj", "/r/test-dj", "/privacy", "/terms"]) { const r = await fetch(F + p); ok(`page ${p}`, r.status === 200 && (await r.text()).includes('id="root"'), String(r.status)); }
const h = await j("/health"); ok("health", h.data.ok === true && h.data.environment === "test");
const cfg = await j("/api/config");
ok("Square sandbox configured", cfg.data.square?.applicationId?.startsWith("sandbox-") && cfg.data.square?.sdk?.includes("sandbox"), cfg.data.square ? "app id set" : "missing SQUARE_APPLICATION_ID_TEST");
ok("prices", cfg.data.prices?.direct?.setupCents === 9900 && cfg.data.prices?.affiliate?.setupCents === 14900);
const sec = (await fetch(F + "/")).headers.get("content-security-policy") ?? ""; ok("security headers", sec.includes("frame-ancestors 'none'"));

// 2. Links
const a = await j("/api/link/affiliate/test-dj"); ok("affiliate link found", a.status === 200, JSON.stringify(a.data));
const r = await j("/api/link/rep/test-dj"); ok("rep link found", r.status === 200, JSON.stringify(r.data));
const bad = await j("/api/link/affiliate/nobody-here-xyz"); ok("unknown link refused", bad.status === 404);

// 3. Domain check through Core (Hostinger key stays in Core)
const dc = await j("/api/domain-check", { query: "DJ Nova" }); ok("domain check answers", dc.status === 200 && dc.data.domain === "djnova.com", JSON.stringify(dc.data).slice(0, 160));

// 4. Card form actually loads in a real browser and walks to checkout
const browser = await chromium.launch(); const page = await browser.newPage();
const errors = []; page.on("pageerror", (e) => errors.push(e.message));
await page.goto(F + "/a/test-dj"); await page.getByText("See your DJ website").click();
await page.fill("input", "DJ Nova"); await page.getByRole("button", { name: /Use / }).click();
await page.getByText("Continue to checkout").click();
const frame = await page.waitForSelector("#card iframe", { timeout: 20000 }).catch(() => null);
ok("Square card form loads", !!frame); ok("no page errors", errors.length === 0, errors.join(" | "));
await page.screenshot({ path: "e2e-checkout.png" }); await browser.close();

// 5. Purchases through the funnel (sandbox token), then domain → DJ Hub link
for (const [kind, handle] of [["direct", null], ["affiliate", "test-dj"], ["rep", "test-dj"]]) {
  const key = crypto.randomUUID(); const n = Date.now(); const email = `kg+funnel-${kind}-${n}@webxgroup.com`;
  const pay = await j("/api/checkout", { kind, handle, key, sourceId: "cnon:card-nonce-ok", customer: { name: "Funnel Test", email, timeZone: "America/New_York" }, details: { phone: "5555550100", stageName: "DJ Funnel", design: "volta" } });
  ok(`${kind}: paid`, pay.status === 200 && pay.data.ok === true, JSON.stringify(pay.data).slice(0, 160));
  const again = await j("/api/checkout", { kind, handle, key, sourceId: "cnon:card-nonce-ok", customer: { name: "Funnel Test", email }, details: {} });
  ok(`${kind}: second press doesn't charge twice`, again.data.ok !== true || again.data.orderId === pay.data.orderId, JSON.stringify(again.data).slice(0, 120));
  const d = await j("/api/details", { key, email, details: { domain: `funnel-${kind}-${n}.com`, ownsDomain: true, phone: "5555550100" } });
  ok(`${kind}: domain saved + Open my DJ Hub`, d.status === 200 && d.data.ok === true && /\/auth\/setup\?/.test(d.data.setupUrl ?? ""), JSON.stringify({ ...d.data, setupUrl: d.data.setupUrl ? "(link)" : null }));
  if (d.data.setupUrl) { const s = await fetch(d.data.setupUrl); ok(`${kind}: setup page opens`, s.status === 200); }
  console.log(`ORDER ${kind} ${email}`);
}

// 6. Refusals
const declined = await j("/api/checkout", { kind: "direct", key: crypto.randomUUID(), sourceId: "cnon:card-nonce-declined", customer: { email: `kg+declined-${Date.now()}@webxgroup.com` }, details: {} });
ok("declined card shows a message, not charged", declined.data.ok === false && declined.status >= 400, JSON.stringify(declined.data).slice(0, 140));
const noKey = await j("/api/checkout", { kind: "direct", key: "nope", sourceId: "x", customer: { email: "a@b.co" } }); ok("bad request refused", noKey.status === 400);

console.log("\n" + results.join("\n"));
process.exit(failed ? 1 : 0);

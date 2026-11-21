import { useEffect, useRef, useState } from "react";
import { checkout, money, uuid, type Config } from "../api";
import { DESIGNS, type DesignId } from "../designs";
import { Back, Check, Lock } from "../icons";
import type { Referrer } from "../main";
import { Screen, Top } from "./Shell";

export type Buyer = { name: string; email: string; phone: string; key: string; stageName: string; firstChargeOn: string | null };

type Card = { attach(sel: string): Promise<void>; tokenize(): Promise<{ status: string; token?: string; errors?: { message: string }[] }>; destroy(): Promise<void> };
type Payments = { card(o?: unknown): Promise<Card>; verifyBuyer?(token: string, d: unknown): Promise<{ token?: string }> };
declare global { interface Window { Square?: { payments(appId: string, locationId: string): Payments } } }

const INCLUDED = [
  "Your DJ website on your own domain (domain included)",
  "QR landing page that grows your fan list",
  "booking@yourdomain inbox inside DJ Hub",
  "Hosting, security and updates handled for you",
  "DJ Hub: edit anytime, switch designs, see your stats",
];

function loadSdk(src: string): Promise<void> {
  return new Promise((ok, fail) => {
    if (window.Square) return ok();
    const s = document.createElement("script"); s.src = src; s.async = true;
    s.onload = () => ok(); s.onerror = () => fail(new Error("sdk")); document.head.appendChild(s);
  });
}

const nextFirst = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1).toLocaleDateString(undefined, { month: "long", day: "numeric" }); };

export function Checkout(p: { cfg: Config | null; referrer: Referrer; stageName: string; design: DesignId; onBack: () => void; onPaid: (b: Buyer) => void }) {
  const price = p.cfg?.prices[p.referrer.kind] ?? { setupCents: p.referrer.kind === "direct" ? 9900 : 14900, monthlyCents: 4900 };
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "paying" | "unavailable">("loading");
  const [error, setError] = useState("");
  const payments = useRef<Payments | null>(null);
  // One key per checkout attempt in this tab: a retry after a hiccup can never charge twice.
  const key = useRef<string>(sessionStorage.getItem("webx.funnel.key") ?? (() => { const k = uuid(); sessionStorage.setItem("webx.funnel.key", k); return k; })());

  useEffect(() => {
    if (!p.cfg) return;
    if (!p.cfg.square) { setState("unavailable"); return; }
    let c: Card | null = null; let gone = false;
    loadSdk(p.cfg.square.sdk).then(async () => {
      payments.current = window.Square!.payments(p.cfg!.square!.applicationId, p.cfg!.square!.locationId);
      c = await payments.current.card({ style: { input: { color: "#f4f1ec", fontSize: "16px" }, "input::placeholder": { color: "#8c8780" },
        ".input-container": { borderColor: "rgba(255,255,255,.18)", borderRadius: "12px" }, ".input-container.is-focus": { borderColor: "#ff7a1a" },
        ".message-text": { color: "#b9b3ab" }, ".message-icon": { color: "#b9b3ab" } } });
      if (gone) return c.destroy();
      await c.attach("#card"); setCard(c); setState("ready");
    }).catch(() => setState("unavailable"));
    return () => { gone = true; c?.destroy().catch(() => {}); };
  }, [p.cfg]);

  const valid = name.trim().length > 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) && phone.replace(/\D/g, "").length >= 7 && agree;

  async function pay() {
    setError("");
    if (!valid) { setError(!agree ? "Please agree to the terms to continue." : "Fill in your name, email and phone."); return; }
    if (!card || state !== "ready") return;
    setState("paying");
    try {
      const t = await card.tokenize();
      if (t.status !== "OK" || !t.token) { setError(t.errors?.[0]?.message ?? "Check your card details."); setState("ready"); return; }
      let verificationToken: string | undefined;
      try {
        const v = await payments.current?.verifyBuyer?.(t.token, { amount: (price.setupCents / 100).toFixed(2), currencyCode: "USD", intent: "CHARGE",
          billingContact: { givenName: name.trim().split(" ")[0], familyName: name.trim().split(" ").slice(1).join(" "), email: email.trim(), phone: phone.trim() } });
        verificationToken = v?.token;
      } catch { /* not every card needs it */ }
      const r = await checkout({ kind: p.referrer.kind, handle: p.referrer.handle, key: key.current, sourceId: t.token, verificationToken,
        customer: { name: name.trim(), email: email.trim(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        details: { phone: phone.trim(), stageName: p.stageName.trim(), design: p.design } });
      if (!r.data.ok) { setError(r.data.message ?? "Your payment didn't go through. You were not charged."); setState("ready"); return; }
      sessionStorage.removeItem("webx.funnel.key");
      p.onPaid({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), key: key.current, stageName: p.stageName.trim(), firstChargeOn: r.data.firstChargeOn ?? null });
    } catch {
      setError("We couldn't reach checkout. Check your connection and try again. You were not charged."); setState("ready");
    }
  }

  const d = DESIGNS.find((x) => x.id === p.design)!;
  return (
    <Screen bg="booth" className="checkout">
      <Top at={1} referrer={p.referrer} />
      <section className="co-grid">
        <div className="glass co-sum rise">
          <p className="kick">Your order</p>
          <div className="co-item"><img src={d.phone} alt="" /><div><b>WebX DJ website</b><span>{p.stageName || "Your DJ name"} · {d.name} design</span></div></div>
          <ul className="incl">{INCLUDED.map((x) => <li key={x}><Check />{x}</li>)}</ul>
          <div className="co-lines">
            <div><span>Setup today</span><b>{money(price.setupCents)}</b></div>
            <div><span>Then monthly, from {nextFirst()}</span><b>{money(price.monthlyCents)}/mo</b></div>
          </div>
          <p className="tiny">Cancel anytime. The monthly charge starts on the 1st of next month.</p>
        </div>
        <form className="glass co-form rise" style={{ ["--i" as string]: 1 }} onSubmit={(e) => { e.preventDefault(); void pay(); }}>
          <p className="kick">Step 2</p>
          <h1 className="h2">Checkout</h1>
          <label className="field"><span>Full name</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} /></label>
          <label className="field"><span>Email</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" maxLength={200} /><em>Your DJ Hub sign-in and receipts go here.</em></label>
          <label className="field"><span>Phone</span><input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={30} /></label>
          <div className="field"><span>Card</span>
            <div id="card" className="card-box" data-state={state} />
            {state === "loading" ? <em>Loading secure card form…</em> : state === "unavailable" ? <em className="err">Payments aren't available right now. Please try again in a few minutes.</em> : null}
          </div>
          <label className="agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">terms</a> and to {money(price.setupCents)} today, then {money(price.monthlyCents)}/month until I cancel.</span></label>
          {error ? <p className="err box" role="alert">{error}</p> : null}
          <div className="row">
            <button type="button" className="btn ghost" onClick={p.onBack} disabled={state === "paying"}><Back /> Back</button>
            <button type="submit" className="btn acc grow" disabled={state !== "ready"}>{state === "paying" ? <><span className="spin" /> Processing…</> : <><Lock /> Pay {money(price.setupCents)}</>}</button>
          </div>
          <p className="secure"><Lock /> Secured by Square. We never see or store your card.</p>
        </form>
      </section>
    </Screen>
  );
}

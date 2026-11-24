import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { getConfig, getLink, type Config, type Kind } from "./api";
import { type DesignId } from "./designs";
import { Welcome } from "./screens/Welcome";
import { PickDesign } from "./screens/PickDesign";
import { System } from "./screens/System";
import { Checkout, type Buyer } from "./screens/Checkout";
import { Setup } from "./screens/Setup";
import { Legal } from "./screens/Legal";
import { startPixels, track } from "./pixels";

// Which funnel: / (automated), /a/<name> (affiliate), /r/<name or number> (rep).
function route(): { kind: Kind; handle: string | null; legal: "privacy" | "terms" | null } {
  const p = location.pathname.replace(/\/+$/, "");
  const m = p.match(/^\/(a|r)\/([^/]+)$/);
  if (m) return { kind: m[1] === "a" ? "affiliate" : "rep", handle: decodeURIComponent(m[2]!).toLowerCase(), legal: null };
  return { kind: "direct", handle: null, legal: p === "/privacy" ? "privacy" : p === "/terms" ? "terms" : null };
}

export type Referrer = { kind: Kind; handle: string | null; firstName: string | null; state: "none" | "checking" | "ok" | "missing" };
const SAVED = "webx.funnel.paid.v1";
type Step = "welcome" | "design" | "system" | "checkout" | "setup";

function App() {
  const r = useMemo(route, []);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [ref, setRef] = useState<Referrer>({ kind: r.kind, handle: r.handle, firstName: null, state: r.kind === "direct" ? "none" : "checking" });
  const [step, setStep] = useState<Step>("welcome");
  const [stageName, setStageName] = useState("");
  const [design, setDesign] = useState<DesignId>("nocturne");
  const [buyer, setBuyer] = useState<Buyer | null>(null);

  useEffect(() => { getConfig().then((c) => { setCfg(c); startPixels(c); }).catch(() => setCfg(null)); }, []);
  useEffect(() => { if (step === "system") track("ViewContent"); if (step === "checkout") track("InitiateCheckout"); }, [step, cfg]);
  useEffect(() => {
    if (r.kind === "direct" || !r.handle) return;
    getLink(r.kind, r.handle).then((l) => setRef((x) => ({ ...x, firstName: l?.firstName ?? null, state: l ? "ok" : "missing" })));
  }, [r]);
  // Paid already in this browser (refresh, closed tab): straight back to choosing the domain.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(SAVED) ?? "null") as { buyer: Buyer; at: number; path: string } | null;
      if (v && v.path === location.pathname && Date.now() - v.at < 7 * 864e5) { setBuyer(v.buyer); setStageName(v.buyer.stageName); setStep("setup"); }
    } catch { /* private mode */ }
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);
  useEffect(() => {
    const t = { welcome: "Your DJ website", design: "Pick your design", system: "How it works", checkout: "Checkout", setup: "Set up your site" }[step];
    document.title = `${r.legal ? (r.legal === "privacy" ? "Privacy" : "Terms") : t} | WebX DJ`;
  }, [step, r.legal]);

  if (r.legal) return <Legal which={r.legal} />;
  if (ref.state === "missing") return <Missing kind={r.kind} />;
  const go = (s: Step) => () => setStep(s);

  return step === "welcome" ? <Welcome referrer={ref} onStart={go("design")} />
    : step === "design" ? <PickDesign stageName={stageName} onStageName={setStageName} design={design} onDesign={setDesign} onBack={go("welcome")} onNext={go("system")} />
    : step === "system" ? <System referrer={ref} onBack={go("design")} onNext={go("checkout")} />
    : step === "checkout" ? <Checkout cfg={cfg} referrer={ref} stageName={stageName} design={design} onBack={go("system")}
        onPaid={(b) => { track("Purchase", { value: (cfg?.prices[ref.kind]?.setupCents ?? (ref.kind === "direct" ? 9900 : 14900)) / 100, eventId: `webx-${b.key}` }); setBuyer(b); try { localStorage.setItem(SAVED, JSON.stringify({ buyer: b, at: Date.now(), path: location.pathname })); } catch { /* ignore */ } setStep("setup"); }} />
    : <Setup buyer={buyer} stageName={stageName} />;
}

function Missing({ kind }: { kind: Kind }) {
  const who = kind === "rep" ? "your WebX rep" : "the person who sent it";
  return (
    <main className="shell center"><div className="bg bg-stage" aria-hidden="true" />
      <section className="card narrow rise">
        <p className="kick">Link not active</p>
        <h1 className="h2">We couldn't find that link.</h1>
        <p className="muted">Double-check it with {who}, or ask them for a new one.</p>
        <a className="btn ghost" href="/">See WebX DJ</a>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

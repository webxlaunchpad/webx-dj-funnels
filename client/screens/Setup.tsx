import { useEffect, useRef, useState } from "react";
import { checkDomain, saveDetails, type DomainCheck } from "../api";
import { Arrow, Check, Globe } from "../icons";
import type { Buyer } from "./Checkout";
import { Screen, Top } from "./Shell";

const suggest = (n: string) => `${n.toLowerCase().replace(/[^a-z0-9]/g, "") || "yourname"}.com`;
const DOMAIN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/;

export function Setup({ buyer, stageName }: { buyer: Buyer | null; stageName: string }) {
  const [query, setQuery] = useState(stageName ? suggest(stageName) : "");
  const [owns, setOwns] = useState(false);
  const [result, setResult] = useState<DomainCheck | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ domain: string; setupUrl: string | null } | null>(null);
  const ran = useRef(false);

  async function run(q = query) {
    const v = q.trim(); if (!v || busy) return;
    setBusy(true); setPicked(null); setError("");
    const r = await checkDomain(v).catch(() => null);
    setBusy(false);
    if (!r || r.status === 429) { setError(r?.data.message ?? "Couldn't check right now. Try again."); return; }
    setResult(r.data);
    if (r.data.available) setPicked(r.data.domain);
  }
  useEffect(() => { if (!ran.current && query) { ran.current = true; void run(query); } }, []); // first suggestion

  async function submit() {
    setError("");
    if (!buyer) { setError("We couldn't find your purchase in this browser. Reply to your receipt email with the domain you want and we'll set it up."); return; }
    const domain = (owns ? query : picked ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    if (!domain) { setError(owns ? "Type the domain you own, like djnova.com." : "Check a domain and choose one first."); return; }
    if (!DOMAIN.test(domain)) { setError("That doesn't look like a domain. Use the form djnova.com."); return; }
    setSending(true);
    const r = await saveDetails({ key: buyer.key, email: buyer.email, details: { domain, ownsDomain: owns, phone: buyer.phone, stageName: buyer.stageName || stageName } }).catch(() => null);
    setSending(false);
    if (!r?.data.ok) { setError(r?.data.message ?? "We couldn't save that. Please try again."); return; }
    setDone({ domain: r.data.domain ?? domain, setupUrl: r.data.setupUrl ?? null });
  }

  const list = result && !result.reason ? [{ domain: result.domain, available: result.available }, ...result.alternatives.filter((a) => a.domain !== result.domain)] : [];

  return (
    <Screen bg="stage" className="setup">
      <Top at={2} />
      <section className="setup-grid">
        <div className="setup-intro rise">
          <p className="kick">Payment complete <Check /></p>
          <h1>Your platform <em>starts here.</em></h1>
          <p className="lead">Choose your domain and your DJ Hub opens right away, so you can start building your site while we set everything up.</p>
        </div>
        {done ? (
          <div className="glass setup-card rise">
            <p className="kick">You're all set</p>
            {done.setupUrl ? <>
              <h2 className="h3">Your DJ Hub is ready</h2>
              <p>Create your password and start building your site while we set up <b>{done.domain}</b>.</p>
              <a className="btn acc big" href={done.setupUrl}>Open my DJ Hub <Arrow /></a>
            </> : <>
              <h2 className="h3">We're on it</h2>
              <p>We're setting up <b>{done.domain}</b> and your DJ website now. We'll email <b>{buyer?.email}</b> with your DJ Hub sign-in shortly.</p>
            </>}
            <ol className="next">
              <li><b>Payment clears</b><span>Usually 1–2 business days. Nothing is bought before this.</span></li>
              <li><b>{owns ? "We connect your domain" : "We secure your domain"}</b><span>{owns ? "Check your email for a one-click link to connect it." : "Registered in your name."}</span></li>
              <li><b>Booking email</b><span>booking@{done.domain} lands in your DJ Hub inbox.</span></li>
              <li><b>Your site goes live</b><span>We'll email you and show it in DJ Hub. Please allow up to a week.</span></li>
            </ol>
          </div>
        ) : (
          <form className="glass setup-card rise" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
            <p className="kick">Step 3</p>
            <h2 className="h3">Choose your domain</h2>
            <p className="muted">It's included. We register it in your name.</p>
            <div className="domrow">
              <span className="dom"><Globe /><input value={query} onChange={(e) => { setQuery(e.target.value); setResult(null); setPicked(null); }} placeholder="djnova.com" aria-label="Domain" maxLength={120}
                onKeyDown={(e) => { if (e.key === "Enter" && !owns) { e.preventDefault(); void run(); } }} /></span>
              {!owns ? <button type="button" className="btn ghost" onClick={() => void run()} disabled={busy}>{busy ? <span className="spin" /> : "Check"}</button> : null}
            </div>
            <label className="agree"><input type="checkbox" checked={owns} onChange={(e) => { setOwns(e.target.checked); setPicked(null); }} /><span>I already own this domain</span></label>
            {!owns && list.length ? (
              <ul className="doms">{list.map((c) => {
                const taken = c.available === false;
                return <li key={c.domain} data-on={picked === c.domain}>
                  <div><b data-taken={taken}>{c.domain}</b><span data-s={c.available ? "free" : taken ? "taken" : "unknown"}>{c.available ? "Available" : taken ? "Taken" : "We'll confirm before buying"}</span></div>
                  <button type="button" disabled={taken} onClick={() => setPicked(c.domain)}>{picked === c.domain ? <><Check /> Chosen</> : taken ? "Taken" : "Choose"}</button>
                </li>; })}</ul>
            ) : null}
            {!owns && result?.reason ? <p className="err">{result.reason}</p> : null}
            {owns ? <p className="muted sm">After this, we'll email you a one-click link to connect it. Nothing to change in your DNS by hand.</p> : null}
            {error ? <p className="err box" role="alert">{error}</p> : null}
            <button type="submit" className="btn acc big" disabled={sending}>{sending ? <><span className="spin" /> Saving…</> : <>Continue <Arrow /></>}</button>
            <p className="tiny">Signed in as {buyer?.email ?? "…"}. Your DJ Hub uses this email.</p>
          </form>
        )}
      </section>
    </Screen>
  );
}

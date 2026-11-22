import { useEffect, useState } from "react";
import { DESIGNS } from "../designs";
import { Arrow } from "../icons";
import type { Referrer } from "../main";
import { Foot, Screen, Top } from "./Shell";

// Slide 1: the platform in four pillars (the same story as the Lovable funnel), drawn in the new look.
const VIBES: Record<string, string> = { noctis: "DJ Artist", nocturne: "Club DJ", volta: "Festival DJ", "august-vale": "Event DJ" };

function BrandArt() {
  const [on, setOn] = useState(0);
  useEffect(() => { const t = setInterval(() => setOn((x) => (x + 1) % DESIGNS.length), 2200); return () => clearInterval(t); }, []);
  return (
    <div className="art art-brand" aria-hidden="true">
      {DESIGNS.map((d, i) => {
        const pos = (i - on + DESIGNS.length) % DESIGNS.length; // 0 = front
        return <img key={d.id} src={d.phone} alt="" data-pos={pos} loading="lazy" />;
      })}
      <span className="chip">{VIBES[DESIGNS[on]!.id]}</span>
    </div>
  );
}

// A QR-style pattern (decorative; not a working code) with a scan sweep and new fans dropping in.
const QR = Array.from({ length: 13 * 13 }, (_, i) => {
  const x = i % 13, y = Math.floor(i / 13);
  const finder = (a: number, b: number) => x >= a && x < a + 4 && y >= b && y < b + 4;
  if (finder(0, 0) || finder(9, 0) || finder(0, 9)) return false;
  return ((x * 7 + y * 11 + x * y) % 5) < 2;
});
function QrArt() {
  const [fans, setFans] = useState(126);
  useEffect(() => { const t = setInterval(() => setFans((f) => f + 1), 1800); return () => clearInterval(t); }, []);
  return (
    <div className="art art-qr" aria-hidden="true">
      <div className="qr">
        <svg viewBox="0 0 13 13">{QR.map((v, i) => (v ? <rect key={i} x={i % 13} y={Math.floor(i / 13)} width="1" height="1" rx=".18" /> : null))}
          {[[0, 0], [9, 0], [0, 9]].map(([a, b]) => <g key={`${a}${b}`}><rect x={a! + .35} y={b! + .35} width="3.3" height="3.3" rx=".6" className="fo" /><rect x={a! + 1.25} y={b! + 1.25} width="1.5" height="1.5" rx=".3" /></g>)}
        </svg>
        <i className="sweep" />
      </div>
      <span className="chip pop" key={fans}>+1 fan</span>
      <span className="count"><b>{fans}</b> on your list</span>
    </div>
  );
}

function GrowArt() {
  return (
    <div className="art art-grow" aria-hidden="true">
      <svg viewBox="0 0 200 100" preserveAspectRatio="none">
        <defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7a1a" stopOpacity=".45" /><stop offset="1" stopColor="#ff7a1a" stopOpacity="0" /></linearGradient></defs>
        {[20, 45, 70].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} className="grid" />)}
        <path className="area" d="M0 92 C30 88 45 84 60 78 S95 70 110 58 S145 40 160 30 S190 12 200 8 L200 100 L0 100Z" fill="url(#gr)" />
        <path className="line" d="M0 92 C30 88 45 84 60 78 S95 70 110 58 S145 40 160 30 S190 12 200 8" />
        <circle cx="200" cy="8" r="3.5" className="dot" />
      </svg>
      <span className="chip">♫ Automated playlist</span>
    </div>
  );
}

function BookArt() {
  return (
    <div className="art art-book" aria-hidden="true">
      <div className="req">
        <small>New booking request</small>
        <b>Rooftop party</b>
        <span>Saturday · 10 PM · 4 hrs</span>
        <em>Reply</em>
      </div>
      <div className="tix"><span>Tickets</span><b>Send to your list</b></div>
    </div>
  );
}

const PILLARS = [
  { n: "01", title: "Build your brand", text: "A pro DJ website on your own domain. Pick your vibe from four designs.", Art: BrandArt },
  { n: "02", title: "Own your audience", text: "Fans scan your QR at the gig and join your list.", Art: QrArt },
  { n: "03", title: "Grow your audience", text: "Grow between sets with automated playlisting.", badge: "Coming Q1 2027", Art: GrowArt },
  { n: "04", title: "Monetize", text: "Bookings land in your inbox, and one message fills the room.", Art: BookArt },
];

export function Welcome({ referrer, onStart }: { referrer: Referrer; onStart: () => void }) {
  const name = referrer.firstName;
  const intro = referrer.kind === "rep" && referrer.state === "ok"
    ? `${name ?? "Your WebX rep"} will walk you through it. It takes about five minutes, and your DJ Hub opens the moment you're done.`
    : referrer.kind === "affiliate" && referrer.state === "ok"
      ? `${name ?? "A fellow DJ"} uses WebX DJ and thinks you'd love it. Pick your look, check out, and your DJ Hub opens right away.`
      : "Whether you play backyard parties or bigger stages, get the platform that helps you get there.";
  return (
    <Screen bg="stage" className="welcome">
      <Top referrer={referrer} />
      <section className="hero rise">
        <h1>Your next stage <em>starts here.</em></h1>
        <p className="lead">{intro}</p>
        <div className="herorow">
          <button className="btn acc big" onClick={onStart}>Explore the platform <Arrow /></button>
          <p className="tiny">Pick your design first. No card needed until checkout.</p>
        </div>
      </section>
      <section className="pillars">
        {PILLARS.map((p, i) => (
          <article key={p.n} className="glass pillar rise" style={{ ["--i" as string]: i + 1 }}>
            <p.Art />
            <div className="ptext">
              <h3><span>{p.n}</span>{p.title}{p.badge ? <em className="badge">{p.badge}</em> : null}</h3>
              <p>{p.text}</p>
            </div>
          </article>
        ))}
      </section>
      <Foot />
    </Screen>
  );
}

import { useEffect, useState, type PointerEvent } from "react";
import { DESIGNS } from "../designs";
import { Arrow } from "../icons";
import { QR_PATH, QR_SIZE } from "../qr";
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

// The real QR (opens dj.webxlaunchpad.com), framed like a phone camera locking on; new fans pop into the list.
const FANS = ["Ava", "Leo", "Mia", "Kai", "Zoe", "Eli", "Nia", "Max"];
function QrArt() {
  const [fans, setFans] = useState(126);
  const [who, setWho] = useState(0);
  useEffect(() => { const t = setInterval(() => { setFans((f) => f + 1); setWho((w) => (w + 1) % FANS.length); }, 1900); return () => clearInterval(t); }, []);
  return (
    <div className="art art-qr" aria-hidden="true">
      <div className="qr">
        <svg viewBox={`-1 -1 ${QR_SIZE + 2} ${QR_SIZE + 2}`} shapeRendering="crispEdges"><path d={QR_PATH} /></svg>
        <i className="sweep" />
        <b className="lock tl" /><b className="lock tr" /><b className="lock bl" /><b className="lock br" />
      </div>
      <span className="chip pop" key={`f${fans}`}><i className="av">{FANS[who]![0]}</i>{FANS[who]} joined</span>
      <span className="count"><b key={`c${fans}`}>{fans}</b> on your list</span>
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
      <span className="eq">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ ["--d" as string]: `${i * 0.13}s` }} />)}</span>
      <span className="notes"><i>♪</i><i>♫</i><i>♪</i></span>
    </div>
  );
}

function BookArt() {
  const [phase, setPhase] = useState(0); // 0 new, 1 booked, 2 sent to list
  useEffect(() => { const t = setInterval(() => setPhase((x) => (x + 1) % 3), 2100); return () => clearInterval(t); }, []);
  return (
    <div className="art art-book" aria-hidden="true">
      <div className={`req ${phase >= 1 ? "won" : ""}`}>
        <small>{phase >= 1 ? "Booked" : "New booking request"}</small>
        <b>Rooftop party</b>
        <span>Saturday · 10 PM · 4 hrs</span>
        <em>{phase >= 1 ? "✓ Confirmed" : "Reply"}</em>
      </div>
      <div className={`tix ${phase === 2 ? "sent" : ""}`}><span>Tickets</span><b>{phase === 2 ? "✓ Sent to 128 fans" : "Send to your list"}</b><i className="fill" /></div>
    </div>
  );
}

const PILLARS = [
  { n: "01", title: "Build your brand", text: "A pro DJ website on your own domain. Pick your vibe from four designs.", Art: BrandArt },
  { n: "02", title: "Own your audience", text: "Fans scan your QR at the gig and join your list.", Art: QrArt },
  { n: "03", title: "Grow your audience", text: "Grow between sets with automated playlisting.", badge: "Coming Q1 2027", Art: GrowArt },
  { n: "04", title: "Monetize", text: "Bookings land in your inbox, and one message fills the room.", Art: BookArt },
];

/** Cards lean toward the pointer and a soft spotlight follows it (mouse only; skipped for reduced motion). */
const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse" || still()) return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", `${x * 100}%`); el.style.setProperty("--my", `${y * 100}%`);
  el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
}
function untilt(e: PointerEvent<HTMLElement>) { e.currentTarget.style.transform = ""; }

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
      <div className="beams" aria-hidden="true"><i /><i /><i /></div>
      <section className="hero">
        <h1 className="words"><span>Your</span> <span>next</span> <span>stage</span> <em><span>starts</span> <span>here.</span></em></h1>
        <p className="lead">{intro}</p>
        <div className="herorow">
          <button className="btn acc big" onClick={onStart}>Explore the platform <Arrow /></button>
          <p className="tiny">Pick your design first. No card needed until checkout.</p>
        </div>
      </section>
      <section className="pillars">
        {PILLARS.map((p, i) => (
          <article key={p.n} className="glass pillar rise" style={{ ["--i" as string]: i + 1 }} onPointerMove={tilt} onPointerLeave={untilt}>
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

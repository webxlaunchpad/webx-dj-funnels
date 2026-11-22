import { useEffect, useState, type PointerEvent } from "react";
import { DESIGNS } from "../designs";
import { Arrow } from "../icons";
import { QR_PATH, QR_SIZE } from "../qr";
import type { Referrer } from "../main";
import { Foot, Screen, Top } from "./Shell";

// Slide 1: the platform in four pillars (the same story as the Lovable funnel), drawn in the new look.

function BrandArt() {
  const [on, setOn] = useState(0);
  useEffect(() => { const t = setInterval(() => setOn((x) => (x + 1) % DESIGNS.length), 2200); return () => clearInterval(t); }, []);
  return (
    <div className="art art-brand" aria-hidden="true">
      {DESIGNS.map((d, i) => {
        const pos = (i - on + DESIGNS.length) % DESIGNS.length; // 0 = front
        return <img key={d.id} src={d.phone} alt="" data-pos={pos} loading="lazy" />;
      })}
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

const CURVE = "M0 86 C18 84 30 80 44 76 S70 70 84 62 S112 52 126 42 S154 28 168 20 S190 10 200 7";
function GrowArt() {
  return (
    <div className="art art-grow" aria-hidden="true">
      <div className="ghead"><span>Monthly listeners</span><span className="eq">{Array.from({ length: 5 }, (_, i) => <i key={i} style={{ ["--d" as string]: `${i * 0.15}s` }} />)}</span></div>
      <div className="plot">
      <svg viewBox="0 0 200 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8a33" stopOpacity=".38" /><stop offset=".7" stopColor="#ff8a33" stopOpacity=".06" /><stop offset="1" stopColor="#ff8a33" stopOpacity="0" /></linearGradient>
          <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffb27a" stopOpacity=".5" /><stop offset="1" stopColor="#ff7a1a" /></linearGradient>
        </defs>
        {[25, 50, 75].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} className="grid" />)}
        <path className="area" d={`${CURVE} L200 100 L0 100Z`} fill="url(#gr)" />
        <path className="glow" d={CURVE} />
        <path className="line" d={CURVE} stroke="url(#gl)" />
      </svg>
      <i className="pin"><b /></i>
      </div>
      <div className="xaxis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
    </div>
  );
}

function BookArt() {
  const [phase, setPhase] = useState(0); // 0 request, 1 booked, 2 tickets sent
  useEffect(() => { const t = setInterval(() => setPhase((x) => (x + 1) % 3), 2300); return () => clearInterval(t); }, []);
  return (
    <div className="art art-book" aria-hidden="true">
      <div className={`req ${phase >= 1 ? "won" : ""}`}>
        <div className="date"><small>SAT</small><b>14</b></div>
        <div className="rtext"><small>{phase >= 1 ? "Booked" : "Booking request"}</small><b>Rooftop party</b><span>10 PM · 4 hrs</span></div>
        <div className="fee"><b>$800</b><em>{phase >= 1 ? "✓ Booked" : "Accept"}</em></div>
        {phase === 1 ? <span className="burst">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ["--a" as string]: `${i * 45}deg` }} />)}</span> : null}
      </div>
      <div className={`tix ${phase === 2 ? "sent" : ""}`}>
        <span className="ticon">🎟</span>
        <div><small>Next show</small><b>{phase === 2 ? "Tickets sent to 128 fans" : "Send tickets to your list"}</b></div>
        <i className="fill" />
      </div>
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

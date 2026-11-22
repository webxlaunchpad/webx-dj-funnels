import { Arrow, Brush, Cash, Mail, Qr } from "../icons";
import type { Referrer } from "../main";
import { Foot, Screen, Top } from "./Shell";

const FEATURES = [
  { icon: Brush, title: "Build your brand", text: "A pro DJ website on your own domain, in one of four designs." },
  { icon: Qr, title: "Own your audience", text: "Fans scan your QR at the gig and join your list." },
  { icon: Mail, title: "Get booked", text: "Booking requests land in your own inbox at your domain." },
  { icon: Cash, title: "Grow and earn", text: "Bookings, fans and stats in one place: your DJ Hub." },
];

export function Welcome({ referrer, onStart }: { referrer: Referrer; onStart: () => void }) {
  const name = referrer.firstName;
  const intro = referrer.kind === "rep" && referrer.state === "ok"
    ? `${name ?? "Your WebX rep"} will walk you through it. It takes about five minutes, and your DJ Hub opens the moment you're done.`
    : referrer.kind === "affiliate" && referrer.state === "ok"
      ? `${name ?? "A fellow DJ"} uses WebX DJ and thinks you'd love it. Pick your look, check out, and your DJ Hub opens right away.`
      : "Whether you play backyard parties or bigger stages, get the website, fan list and booking inbox that take you there.";
  return (
    <Screen bg="stage" className="welcome">
      <Top referrer={referrer} />
      <section className="hero rise">
        <h1>Your next stage <em>starts here.</em></h1>
        <p className="lead">{intro}</p>
        <button className="btn acc big" onClick={onStart}>See your DJ website <Arrow /></button>
        <p className="tiny">Pick your design first. No card needed until checkout.</p>
      </section>
      <section className="features">
        {FEATURES.map((f, i) => (
          <article key={f.title} className="glass feat rise" style={{ ["--i" as string]: i + 1 }}>
            <span className="ico"><f.icon /></span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </article>
        ))}
      </section>
      <Foot />
    </Screen>
  );
}

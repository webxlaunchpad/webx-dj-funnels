import { Arrow, Back, Chart, Mail, Qr, Users } from "../icons";
import type { Referrer } from "../main";
import { Screen, Top } from "./Shell";

const PARTS = [
  { icon: Qr, kick: "Capture", title: "Every gig grows your list", text: "Your QR code goes on screen or on the booth. Fans scan it, land on your page and join your list in seconds." },
  { icon: Users, title: "Keep them coming back", kick: "Engage", text: "See who signed up, where, and when. Share new mixes and dates with the fans who already love your sets." },
  { icon: Mail, title: "Bookings, straight to you", kick: "Get booked", text: "A booking button on your site and booking@yourdomain.com that lands in your own DJ Hub inbox." },
  { icon: Chart, title: "See what's working", kick: "Grow", text: "Visits, scans and booking clicks in one simple dashboard, so you know which gigs pay off." },
];

export function System({ referrer, onBack, onNext }: { referrer: Referrer; onBack: () => void; onNext: () => void }) {
  return (
    <Screen bg="beams" className="system">
      <Top at={0} referrer={referrer} />
      <section className="sys rise">
        <p className="kick">The system</p>
        <h1 className="h2">More than a website.</h1>
        <p className="lead">Everything a working DJ needs, set up for you and run from one place: your DJ Hub.</p>
        <div className="parts">
          {PARTS.map((x, i) => (
            <article key={x.kick} className="glass part rise" style={{ ["--i" as string]: i + 1 }}>
              <span className="ico"><x.icon /></span>
              <p className="kick sm">{x.kick}</p>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
        <div className="row center">
          <button className="btn ghost" onClick={onBack}><Back /> Back</button>
          <button className="btn acc" onClick={onNext}>Continue to checkout <Arrow /></button>
        </div>
      </section>
    </Screen>
  );
}

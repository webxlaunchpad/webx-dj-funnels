import { Arrow, Back, Megaphone, Music, Qr, Ticket, Trend } from "../icons";
import type { Referrer } from "../main";
import { Screen, Top } from "./Shell";

const PARTS = [
  { icon: Qr, kick: "Capture", title: "Fans scan your QR and join your list.", text: "One scan turns someone in the crowd into someone you can reach again." },
  { icon: Music, kick: "Engage", title: "They unlock your mixes, videos and music.", text: "Move them from the moment to your latest set, and something worth coming back for." },
  { icon: Megaphone, kick: "Promote", title: "You send your next show to every fan.", text: "New mix? Another show? You already know who to reach." },
  { icon: Trend, kick: "Grow", title: "Grow between sets with automated playlisting.", text: "Your music keeps finding new listeners while you're off stage.", badge: "Coming Q1 2027" },
  { icon: Ticket, kick: "Monetize", title: "Your list turns into bookings and tickets sold.", text: "Booking requests land in your inbox. Tickets to sell? One message and your fans fill the room." },
];

export function System({ referrer, onBack, onNext }: { referrer: Referrer; onBack: () => void; onNext: () => void }) {
  return (
    <Screen bg="beams" className="system">
      <Top at={0} referrer={referrer} />
      <section className="sys rise">
        <p className="kick">The system</p>
        <h1 className="h2">Own your <em>audience.</em></h1>
        <p className="lead">Capture, engage, promote, grow and monetize, all run from one place: your DJ Hub.</p>
        <div className="parts">
          {PARTS.map((x, i) => (
            <article key={x.kick} className="glass part rise" style={{ ["--i" as string]: i + 1 }}>
              <span className="ico"><x.icon /></span>
              <p className="kick sm"><b className="pn">0{i + 1}</b>{x.kick}{x.badge ? <em className="badge">{x.badge}</em> : null}</p>
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

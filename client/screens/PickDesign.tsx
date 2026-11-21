import { useState } from "react";
import { DESIGNS, type DesignId } from "../designs";
import { Arrow, Back, Check, Desktop, Phone } from "../icons";
import { Screen, Top } from "./Shell";

export function PickDesign(p: { stageName: string; onStageName: (s: string) => void; design: DesignId; onDesign: (d: DesignId) => void; onBack: () => void; onNext: () => void }) {
  const [view, setView] = useState<"desktop" | "phone">(typeof window !== "undefined" && window.innerWidth < 760 ? "phone" : "desktop");
  const [tried, setTried] = useState(false);
  const cur = DESIGNS.find((d) => d.id === p.design)!;
  const ok = p.stageName.trim().length >= 2;
  return (
    <Screen bg="stage" className="pick">
      <Top at={0} />
      <section className="pick-grid">
        <div className="pick-side rise">
          <p className="kick">Step 1</p>
          <h1 className="h2">Make it yours</h1>
          <label className="field">
            <span>Your DJ / stage name</span>
            <input value={p.stageName} onChange={(e) => p.onStageName(e.target.value)} placeholder="DJ Nova" maxLength={60} autoComplete="nickname" aria-invalid={tried && !ok} />
            {tried && !ok ? <em className="err">Add your DJ name. You can change it later.</em> : <em>Shown on your website. You can change it anytime.</em>}
          </label>
          <p className="label">Pick your design</p>
          <div className="designs" role="radiogroup" aria-label="Design">
            {DESIGNS.map((d) => (
              <button key={d.id} role="radio" aria-checked={p.design === d.id} className="dcard" data-on={p.design === d.id} onClick={() => p.onDesign(d.id)}>
                <img src={d.phone} alt="" loading="lazy" />
                <span className="dname">{d.name}{p.design === d.id ? <Check /> : null}</span>
                <span className="dvibe">{d.vibe}</span>
              </button>
            ))}
          </div>
          <p className="tiny">You can switch designs anytime in DJ Hub.</p>
          <div className="row">
            <button className="btn ghost" onClick={p.onBack}><Back /> Back</button>
            <button className="btn acc" onClick={() => (ok ? p.onNext() : setTried(true))}>Use {cur.name} <Arrow /></button>
          </div>
        </div>
        <div className="preview rise" style={{ ["--i" as string]: 1 }}>
          <div className="seg" role="tablist" aria-label="Preview size">
            <button role="tab" aria-selected={view === "desktop"} onClick={() => setView("desktop")}><Desktop /> Desktop</button>
            <button role="tab" aria-selected={view === "phone"} onClick={() => setView("phone")}><Phone /> Phone</button>
          </div>
          {view === "desktop"
            ? <div className="browser"><div className="bar"><i /><i /><i /><span>{(p.stageName.trim() || "yourname").toLowerCase().replace(/[^a-z0-9]/g, "") || "yourname"}.com</span></div><img src={cur.desktop} alt={`${cur.name} design on a computer`} /></div>
            : <div className="device"><img src={cur.phone} alt={`${cur.name} design on a phone`} /></div>}
          <p className="cap">{cur.name}: shown with sample photos. Yours uses your name, photos and music.</p>
        </div>
      </section>
    </Screen>
  );
}

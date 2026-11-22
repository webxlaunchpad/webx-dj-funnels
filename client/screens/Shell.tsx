import type { ReactNode } from "react";
import { Check } from "../icons";
import logo from "../img/webx-logo.png";
import type { Referrer } from "../main";

export function Logo() {
  return <a className="logo" href="/" aria-label="WebX home"><img src={logo} alt="WebX" width={82} height={34} /></a>;
}

const STEPS = ["Your site", "Checkout", "Setup"] as const;
export function Top({ at, referrer }: { at?: 0 | 1 | 2; referrer?: Referrer }) {
  return (
    <header className="top">
      <Logo />
      {at !== undefined ? (
        <ol className="progress" aria-label="Progress">
          {STEPS.map((s, i) => <li key={s} data-state={i < at ? "done" : i === at ? "now" : "next"}><span>{i < at ? <Check /> : i + 1}</span>{s}</li>)}
        </ol>
      ) : null}
      {referrer ? <RefPill r={referrer} /> : <span />}
    </header>
  );
}

export function RefPill({ r }: { r: Referrer }) {
  if (r.state !== "ok") return <span />;
  const name = r.firstName ?? (r.kind === "rep" ? "Your rep" : "A friend");
  return <span className="refpill">{r.kind === "rep" ? <>Your WebX rep: <b>{name}</b></> : <>Recommended by <b>{name}</b></>}</span>;
}

export function Screen({ bg, children, className = "" }: { bg: "stage" | "booth" | "beams"; children: ReactNode; className?: string }) {
  return <main className={`shell ${className}`}><div className={`bg bg-${bg}`} aria-hidden="true" />{children}</main>;
}

export function Foot() {
  return <footer className="foot"><span>© {new Date().getFullYear()} WebX</span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>;
}

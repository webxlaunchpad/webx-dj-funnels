// The "I'm a person" check (Cloudflare Turnstile). Usually ticks itself in a second; nothing to click.
// siteKey null/undefined = Turnstile is off: no widget, ready immediately.
import { useCallback, useEffect, useRef, useState } from "react";

type TS = { render(el: HTMLElement, o: Record<string, unknown>): string; reset(id: string): void; remove(id: string): void };
declare global { interface Window { turnstile?: TS } }

let loader: Promise<void> | null = null;
function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  return (loader ??= new Promise<void>((ok, fail) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true;
    s.onload = () => ok(); s.onerror = () => { loader = null; fail(new Error("turnstile")); };
    document.head.appendChild(s);
  }));
}

export function useTurnstile(siteKey: string | null | undefined) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!siteKey || !box.current) return;
    let gone = false;
    load().then(() => {
      if (gone || !box.current || !window.turnstile) return;
      id.current = window.turnstile.render(box.current, {
        sitekey: siteKey, size: "flexible", appearance: "interaction-only",
        callback: (t: string) => { setToken(t); setFailed(false); },
        "expired-callback": () => setToken(null),
        "error-callback": () => { setToken(null); setFailed(true); },
      });
    }).catch(() => setFailed(true));
    return () => { gone = true; if (id.current && window.turnstile) window.turnstile.remove(id.current); id.current = null; };
  }, [siteKey]);
  /** Tokens work once: call after every submit, pass or fail. */
  const latest = useRef<string | null>(null); latest.current = token;
  /** The token, waiting a few seconds if the check is still running. Null = not a person / didn't load. */
  const getToken = useCallback(async (ms = 8000): Promise<string | null | undefined> => {
    if (!siteKey) return undefined;
    const until = Date.now() + ms;
    while (!latest.current && Date.now() < until) await new Promise((r) => setTimeout(r, 120));
    return latest.current;
  }, [siteKey]);
  const reset = useCallback(() => { setToken(null); if (id.current && window.turnstile) window.turnstile.reset(id.current); }, []);
  const on = !!siteKey;
  return {
    widget: on ? <div ref={box} className="turnstile" /> : null,
    token: on ? token : undefined,
    ready: !on || !!token,
    failed: on && failed,
    getToken,
    reset,
  };
}

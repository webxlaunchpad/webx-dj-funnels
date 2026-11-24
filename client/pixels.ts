// Ad pixels (Meta + TikTok). IDs come from /api/config (live only), so test checkouts never pollute ad data.
// Loaded from our own code (the page's CSP forbids inline scripts). Events, in funnel order:
//   PageView (every visit) → ViewContent (picked a design) → InitiateCheckout (reached checkout) → Purchase (paid).
// Purchase carries the setup fee and a stable event id, so a refresh after paying is never counted twice.
type Fn = ((...a: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
type W = Window & { fbq?: Fn; _fbq?: Fn; ttq?: Record<string, unknown> & unknown[]; TiktokAnalyticsObject?: string };

let ready = false;

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true; s.src = src;
  document.head.appendChild(s);
}

function meta(id: string) {
  const w = window as W;
  if (w.fbq) return;
  const n: Fn = function (...a: unknown[]) { if (n.callMethod) n.callMethod(...a); else n.queue!.push(a); } as Fn;
  w.fbq = n; w._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
  loadScript("https://connect.facebook.net/en_US/fbevents.js");
  n("init", id);
}

function tiktok(id: string) {
  const w = window as W;
  if (w.ttq) return;
  w.TiktokAnalyticsObject = "ttq";
  const q = [] as unknown as Record<string, unknown> & unknown[];
  const methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
  for (const m of methods) q[m] = (...a: unknown[]) => { q.push([m, ...a]); };
  w.ttq = q;
  loadScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
}

export function startPixels(cfg: { pixels?: { meta?: string | null; tiktok?: string | null } | null } | null) {
  if (ready || !cfg?.pixels) return;
  const { meta: m, tiktok: t } = cfg.pixels;
  if (m && /^\d{10,20}$/.test(m)) meta(m);
  if (t && /^[A-Z0-9]{10,30}$/i.test(t)) tiktok(t);
  ready = true;
  track("PageView");
}

const TIKTOK_NAME: Record<string, string> = { ViewContent: "ViewContent", InitiateCheckout: "InitiateCheckout", Purchase: "CompletePayment" };

export function track(event: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase", data: { value?: number; eventId?: string } = {}) {
  if (!ready) return;
  const w = window as W;
  const props = data.value !== undefined ? { value: data.value, currency: "USD", content_name: "WebX DJ website" } : { content_name: "WebX DJ website" };
  try {
    if (w.fbq) {
      if (event === "PageView") w.fbq("track", "PageView");
      else w.fbq("track", event, props, data.eventId ? { eventID: data.eventId } : undefined);
    }
    const tt = w.ttq as unknown as { page?: () => void; track?: (e: string, p?: unknown, o?: unknown) => void } | undefined;
    if (tt) {
      if (event === "PageView") tt.page?.();
      else tt.track?.(TIKTOK_NAME[event]!, { ...props, content_type: "product", content_id: "webx-dj-website" }, data.eventId ? { event_id: data.eventId } : undefined);
    }
  } catch { /* ads never break checkout */ }
}

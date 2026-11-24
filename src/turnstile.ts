// Cloudflare Turnstile: proves a person (not a bot) filled in a form.
// OFF until BOTH exist: TURNSTILE_SITE_KEY (a public var in wrangler.jsonc) and TURNSTILE_SECRET
// (a Worker secret, pushed by the Deploy workflow from GitHub: TURNSTILE_SECRET_TEST / TURNSTILE_SECRET_LIVE).
// Test and live use different widgets, so they never share keys.
export interface TurnstileEnv { TURNSTILE_SITE_KEY?: string; TURNSTILE_SECRET?: string }

export const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
export const turnstileOn = (env: TurnstileEnv): boolean => !!env.TURNSTILE_SITE_KEY && !!env.TURNSTILE_SECRET;
/** What the browser needs: the public site key, or null when Turnstile is off. */
export const turnstileSiteKey = (env: TurnstileEnv): string | null => (turnstileOn(env) ? env.TURNSTILE_SITE_KEY! : null);

/** True when the form may go ahead. Cloudflare unreachable → let it through (logged): we never lock
 *  real people out because of an outage; rate limits still apply. */
export async function turnstilePass(env: TurnstileEnv, token: unknown, ip?: string | null, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  if (!turnstileOn(env)) return true;
  if (typeof token !== "string" || token.length < 10 || token.length > 4096) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET!); form.append("response", token);
  if (ip) form.append("remoteip", ip);
  try {
    const r = await fetchImpl(`${TURNSTILE_ORIGIN}/turnstile/v0/siteverify`, { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!j.success) console.warn(JSON.stringify({ level: "warn", msg: "turnstile refused", codes: j["error-codes"] ?? [] }));
    return j.success === true;
  } catch (e) {
    console.error(JSON.stringify({ level: "error", msg: "turnstile unreachable; allowing", error: String(e) }));
    return true;
  }
}

export const TURNSTILE_MESSAGE = "Please finish the quick security check, then try again.";

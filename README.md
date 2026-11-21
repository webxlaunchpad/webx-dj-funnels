# WebX DJ funnels

One Cloudflare Worker, three ways to buy a WebX DJ website. Same screens, worded for who's buying:

| Path | Who | Core offer | Price | Switch |
|---|---|---|---|---|
| `/` | Automated: the DJ checks out on their own | `dj-direct` | $99 + $49/mo | always on |
| `/a/<name>` | Affiliate's link (social media) | `dj-affiliate` | $149 + $49/mo | `AFFILIATE_FUNNEL` |
| `/r/<name or number>` | WebX rep's link (they guide the DJ) | `dj-rep` | $149 + $49/mo | `REP_FUNNEL` |

Screens: Welcome → Pick your design (real screenshots of the four designs) → The system → Checkout → Choose your domain → **Open my DJ Hub**.

## How it's wired

- **No secrets here.** Everything goes to WebX Core over a private service binding (`CORE`):
  checkout sessions, card payment, the domain check, saving the domain, the DJ Hub setup link.
  The Hostinger and Square secret keys stay in Core only.
- Square's card form runs in the buyer's browser and hands us a one-time card token.
- Affiliate/rep links: the name after `/a/` or `/r/` is looked up in Core
  (`/v1/checkout/links/:kind/:handle`). Core credits the sale to that affiliate or rep. Unknown or
  switched-off links show "Link not active".
- Safety: if Core's price ever differs from what the page shows, checkout stops before charging.
  Each checkout uses one idempotency key, so a retry can never charge twice. After paying, the
  setup screen survives a refresh (this browser, 7 days).

## Deploy

- `main` → CI → **test** deploys automatically (`webx-dj-funnels-test`, Core test, Square sandbox).
- **Live**: Actions → Deploy → Run workflow → `live`, type `DEPLOY LIVE`.
- Repository secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
  `SQUARE_APPLICATION_ID_TEST` (sandbox, `sandbox-sq0idb-…`), `SQUARE_APPLICATION_ID_LIVE` (`sq0idp-…`).
- Turning on affiliate/rep funnels on live: set `AFFILIATE_FUNNEL` / `REP_FUNNEL` to `"on"` in
  `wrangler.jsonc` (live section) and deploy.

## Not yet carried over from the Lovable funnel

TikTok/Meta pixels and server events, Apple Pay / Google Pay, funnel step analytics. Each needs its
own IDs/tokens and a privacy-consent decision; add them here when wanted.

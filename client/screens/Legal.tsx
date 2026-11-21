import { Foot, Screen, Top } from "./Shell";

// Plain-language versions. Have these reviewed before relying on them for anything legal.
export function Legal({ which }: { which: "privacy" | "terms" }) {
  return (
    <Screen bg="stage" className="legal">
      <Top />
      <article className="glass doc">
        {which === "privacy" ? <>
          <h1 className="h2">Privacy</h1>
          <p className="muted">WebX DJ is operated by WebX. This page explains what we collect and why.</p>
          <h2 className="h4">What we collect</h2>
          <ul>
            <li>What you give us: your DJ name, design choice, name, email, phone and domain choice.</li>
            <li>Payments are processed by Square. We never see or store your card number.</li>
          </ul>
          <h2 className="h4">How we use it</h2>
          <ul>
            <li>To build and run the website, landing page and inbox you bought.</li>
            <li>To send receipts, renewal notices and service updates.</li>
            <li>If someone referred you (an affiliate or a WebX rep), to credit them for the sale.</li>
          </ul>
          <p>We don't sell your personal information. To get a copy of your data, correct it or delete it, reply to any email from us.</p>
        </> : <>
          <h1 className="h2">Terms</h1>
          <p className="muted">The short version of what you're signing up for.</p>
          <ul>
            <li>A one-time setup fee today, then a monthly subscription starting on the 1st of next month, billed until you cancel.</li>
            <li>Your plan includes your DJ website, domain (registered in your name), hosting, QR landing page, booking inbox and DJ Hub.</li>
            <li>Cancel anytime by replying to any email from us. Cancelling stops future monthly charges.</li>
            <li>The domain registered for you is yours. If you leave, we'll help you move it.</li>
            <li>Don't use the service for anything illegal or for content you don't have the rights to.</li>
          </ul>
        </>}
        <a className="btn ghost" href="/">Back to WebX DJ</a>
      </article>
      <Foot />
    </Screen>
  );
}

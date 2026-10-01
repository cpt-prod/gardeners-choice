"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProviders } from "@/app/providers";
import { PREMIUM_TOKENS_GRANT, PREMIUM_DURATION_MS } from "@/lib/tokens";
import { formatTokens } from "@/lib/format";

function SubscribeInner() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/marketplace";
  const { session, tokens } = useProviders();

  const handleConfirm = () => {
    if (session.status !== "authed-free") return;
    tokens.upgradeToPremium();
    router.push(next);
  };

  if (session.status === "loading") {
    return (
      <section>
        <div className="container">
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  if (session.status === "anon") {
    return (
      <section>
        <div className="container">
          <h1>Premium</h1>
          <p>You need an account first.</p>
          <Link
            className="btn btn-primary"
            href={`/account?next=${encodeURIComponent(`/account/subscribe?next=${encodeURIComponent(next)}`)}`}
          >
            Create an account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <h1>Premium tier</h1>
        <div className="demo-banner" role="status">
          <strong>Demo subscription.</strong> No real money. We grant you tokens so
          you can try the barter flow.
        </div>

        <div className="card account-card" style={{ marginTop: "1rem" }}>
          <h2>Premium</h2>
          <ul style={{ paddingLeft: "1.2rem", lineHeight: 1.8 }}>
            <li>{formatTokens(PREMIUM_TOKENS_GRANT)} granted on upgrade</li>
            <li>Valid for 30 days ({Math.round(PREMIUM_DURATION_MS / (1000 * 60 * 60 * 24))} days)</li>
            <li>Make offers and counter-offers in any open thread</li>
            <li>Each offer/counter costs 1 token</li>
            <li>Accepted offers transfer tokens to the vendor&rsquo;s ledger</li>
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={session.status !== "authed-free"}
          >
            {session.status === "authed-free" ? "Confirm — start premium" : "Already premium"}
          </button>
          <p style={{ marginTop: "0.75rem", color: "var(--c-ink-soft)", fontSize: "0.9rem" }}>
            This is a demo. No card required, no charge, no real money.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<section><div className="container"><p>Loading…</p></div></section>}>
      <SubscribeInner />
    </Suspense>
  );
}

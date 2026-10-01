"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import EmptyState from "@/components/EmptyState";
import { useProviders } from "@/app/providers";
import { formatTokens, formatRelativeTime } from "@/lib/format";
import { isPremium } from "@/lib/tokens";

function AccountInner() {
  const params = useSearchParams();
  const next = params.get("next") || "/marketplace";
  const { session, tokens } = useProviders();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || session.status === "loading") {
    return (
      <section>
        <div className="container">
          <p style={{ color: "var(--c-ink-soft)" }}>Loading…</p>
        </div>
      </section>
    );
  }

  if (session.status === "anon") {
    return (
      <section>
        <div className="container">
          <h1>Account</h1>
          <div className="demo-banner" role="status">
            <strong>Toy demo account.</strong> Credentials are stored only in this
            browser&rsquo;s localStorage. Not for real use.
          </div>
          <AuthForm next={next} />
        </div>
      </section>
    );
  }

  const u = session.user!;
  const premium = isPremium(u);
  return (
    <section>
      <div className="container">
        <h1>Hi, {u.displayName}</h1>
        <div className="card account-card" style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-food">@{u.username}</span>
            {premium ? (
              <span className="badge badge-premium">Premium</span>
            ) : (
              <span className="badge">Free tier</span>
            )}
            {u.hasOpenedFirstThread && (
              <span className="badge badge-ghost" style={{ fontSize: "0.7rem" }}>🌱 Community Seed</span>
            )}
          </div>
          <p style={{ marginTop: "1rem", marginBottom: 0 }}>
            Token balance: <span className="token-pill">{u.tokens}</span>
            {u.lastDailyBonus && (
              <span style={{ marginLeft: "0.75rem", color: "var(--c-ink-soft)", fontSize: "0.9rem" }}>
                (last daily bonus {formatRelativeTime(u.lastDailyBonus)})
              </span>
            )}
          </p>
          {premium && u.tierExpiresAt && (
            <p style={{ marginTop: "0.4rem", color: "var(--c-ink-soft)", fontSize: "0.9rem" }}>
              Premium renews {formatRelativeTime(u.tierExpiresAt)} ({new Date(u.tierExpiresAt).toLocaleDateString()})
            </p>
          )}
        </div>

        <div className="card account-card" style={{ marginTop: "1rem" }}>
          <h3>Barter threads</h3>
          <p>
            <Link href="/account/offers">View your open threads →</Link>
          </p>
        </div>

        <div className="card account-card" style={{ marginTop: "1rem" }}>
          <h3>Subscription</h3>
          {premium ? (
            <p>You&rsquo;re on the Premium tier. Renews automatically (mock).</p>
          ) : (
            <>
              <p style={{ color: "var(--c-ink-soft)" }}>
                Upgrade to Premium for 50 tokens / 30 days. Make offers, counter, and
                accept — back and forth in chat.
              </p>
              <Link
                href={`/account/subscribe?next=${encodeURIComponent(next)}`}
                className="btn btn-primary"
              >
                Upgrade to Premium
              </Link>
            </>
          )}
        </div>

        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => session.logout()}
          >
            Sign out
          </button>
          <Link href="/marketplace" className="btn btn-ghost">
            Back to marketplace
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<section><div className="container"><p>Loading…</p></div></section>}>
      <AccountInner />
    </Suspense>
  );
}

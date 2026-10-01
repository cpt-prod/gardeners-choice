"use client";

import Link from "next/link";
import { useProviders } from "@/app/providers";
import { isPremium } from "@/lib/tokens";
import { formatTokens } from "@/lib/format";

export default function TokenBadge() {
  const { session } = useProviders();

  if (session.status === "loading") {
    return <span className="token-pill" aria-hidden>—</span>;
  }
  if (session.status === "anon") {
    return (
      <Link href="/account" className="btn btn-ghost" style={{ padding: "0.4rem 0.85rem", fontSize: "0.9rem" }}>
        Sign in
      </Link>
    );
  }

  const u = session.user!;
  const premium = isPremium(u);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      {premium ? (
        <span className="badge badge-premium">Premium</span>
      ) : (
        <Link href="/account/subscribe" className="badge badge-premium" title="Upgrade to Premium">
          Free
        </Link>
      )}
      <span className="token-pill" title="Token balance">
        {u.tokens}
      </span>
    </span>
  );
}

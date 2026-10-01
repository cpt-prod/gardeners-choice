"use client";

import Link from "next/link";
import { useProviders } from "@/app/providers";

export default function NavAuthMenu() {
  const { session, threads } = useProviders();

  if (session.status === "loading") return null;
  if (session.status === "anon") return null; // TokenBadge handles sign-in CTA

  const u = session.user!;
  const myThreads = threads.forUser();

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginLeft: "0.4rem" }}>
      <Link
        href="/account/offers"
        className="btn btn-ghost"
        style={{ padding: "0.4rem 0.85rem", fontSize: "0.9rem" }}
        title={`${myThreads.length} thread${myThreads.length === 1 ? "" : "s"}`}
      >
        Threads
        {u.unreadOffers > 0 && (
          <span
            className="token-pill"
            style={{ marginLeft: "0.4rem", background: "var(--c-rust)" }}
            aria-label={`${u.unreadOffers} unread replies`}
          >
            {u.unreadOffers}
          </span>
        )}
      </Link>
      <Link
        href="/account"
        className="btn btn-ghost"
        style={{ padding: "0.4rem 0.85rem", fontSize: "0.9rem" }}
      >
        {u.displayName}
      </Link>
    </span>
  );
}

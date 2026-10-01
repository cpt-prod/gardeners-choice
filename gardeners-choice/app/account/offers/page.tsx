"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProviders } from "@/app/providers";
import { sites } from "@/lib/data";
import EmptyState from "@/components/EmptyState";
import { formatRelativeTime } from "@/lib/format";

export default function OffersPage() {
  const { session, threads } = useProviders();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || session.status === "loading") {
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
          <h1>Barter threads</h1>
          <p>You need an account to view your threads.</p>
          <Link href="/account?next=/account/offers" className="btn btn-primary">
            Sign in or sign up
          </Link>
        </div>
      </section>
    );
  }

  const list = threads.forUser();

  if (list.length === 0) {
    return (
      <section>
        <div className="container">
          <h1>Barter threads</h1>
          <EmptyState
            title="No threads yet"
            body="Open a marketplace listing and start a negotiation — your threads will appear here."
            cta={{ href: "/marketplace", label: "Browse marketplace" }}
          />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <h1>Barter threads</h1>
        <div className="grid" style={{ marginTop: "1rem" }}>
          {list.map((t) => {
            const site = sites.find((s) => s.id === t.siteId);
            const food = site?.foods?.find((f) => f.id === t.foodId);
            const last = t.messages[t.messages.length - 1];
            return (
              <Link
                key={t.id}
                href={`/account/offers/${t.id}`}
                className="card"
                style={{ display: "block", color: "inherit" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    className={`badge ${
                      t.status === "open" ? "badge-food" : t.status === "accepted" ? "badge-premium" : ""
                    }`}
                  >
                    {t.status}
                  </span>
                  <span style={{ color: "var(--c-ink-soft)", fontSize: "0.85rem" }}>
                    {formatRelativeTime(t.updatedAt)}
                  </span>
                </div>
                <h3 style={{ margin: "0.5rem 0 0.25rem" }}>{food?.name ?? "Listing"}</h3>
                <p style={{ color: "var(--c-ink-soft)", margin: 0, fontSize: "0.9rem" }}>
                  with {site?.name ?? "vendor"}
                </p>
                {last && (
                  <p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.9rem" }}>
                    <strong>{last.from === "buyer" ? "You" : "Vendor"}:</strong>{" "}
                    {last.text ?? (last.kind === "offer" ? `offered ${last.amountTokens} tokens` : last.kind)}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

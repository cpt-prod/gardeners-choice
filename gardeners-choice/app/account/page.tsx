"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/useAccount";

type Listing = {
  id: string;
  title: string;
  category: string;
  status: "available" | "claimed";
  claimedByName: string | null;
  createdAt: number;
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAccount();
  const [mine, setMine] = useState<Listing[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);

  const loadMine = useCallback(async () => {
    const res = await fetch("/api/listings?mine=1", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMine(data.listings ?? []);
    }
    setLoadingMine(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) loadMine();
  }, [user, loadMine]);

  if (loading || !user) {
    return (
      <section>
        <div className="container">
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>My account</h1>

        <div className="card" style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginTop: 0 }}>{user.displayName}</h3>
          <p style={{ color: "var(--c-ink-soft)", margin: "0 0 0.75rem" }}>
            @{user.username} · member since{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a className="btn btn-primary" href="/marketplace">Go to marketplace</a>
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Log out
            </button>
          </div>
        </div>

        <h2>My listings</h2>
        {loadingMine ? (
          <p>Loading…</p>
        ) : mine.length === 0 ? (
          <div className="card">
            <p style={{ margin: 0 }}>
              You haven't posted anything yet.{" "}
              <a href="/marketplace">Share some surplus food →</a>
            </p>
          </div>
        ) : (
          <div className="grid">
            {mine.map((l) => (
              <div className="card" key={l.id}>
                <span
                  className={`badge ${
                    l.status === "available" ? "badge-food" : "badge-harvest"
                  }`}
                >
                  {l.status === "available" ? "Available" : "Claimed"}
                </span>
                <h3 style={{ marginTop: "0.5rem" }}>{l.title}</h3>
                {l.status === "claimed" && l.claimedByName && (
                  <p style={{ fontSize: "0.9rem", color: "var(--c-ink-soft)", margin: 0 }}>
                    Claimed by {l.claimedByName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

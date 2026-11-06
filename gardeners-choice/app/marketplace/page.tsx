"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "@/lib/useAccount";

type Listing = {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  location: string;
  status: "available" | "claimed";
  claimedBy: string | null;
  claimedByName: string | null;
  createdAt: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  produce: "Produce",
  pantry: "Pantry",
  prepared: "Prepared",
  other: "Other",
};

type Filter = "all" | "produce" | "pantry" | "prepared" | "other";

export default function MarketplacePage() {
  const { user } = useAccount();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/listings", { cache: "no-store" });
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function claim(id: string, action: "claim" | "release") {
    setBusyId(id);
    const res = await fetch(`/api/listings/${id}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      alert(data.error ?? "Something went wrong.");
    }
    await load();
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: listings.length };
    for (const l of listings) c[l.category] = (c[l.category] ?? 0) + 1;
    return c;
  }, [listings]);

  const available = listings.filter((l) => l.status === "available").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (filter === "all" || l.category === filter) &&
        (!availableOnly || l.status === "available") &&
        (!q ||
          `${l.title} ${l.description} ${l.location}`.toLowerCase().includes(q))
    );
  }, [listings, filter, availableOnly, query]);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="page-head glass-panel">
            <div className="page-head-row">
              <div>
                <p className="kicker">Give · Claim · Share</p>
                <h1>Community Marketplace</h1>
                <p className="lede">
                  Share your surplus harvest and pantry goods &mdash; all free.
                  Claim what you need and coordinate a pickup with a neighbor.
                </p>
              </div>
              <div className="head-stats">
                <div className="head-stat">
                  <b>{loading ? "–" : listings.length}</b>
                  <span>Total listings</span>
                </div>
                <div className="head-stat">
                  <b>{loading ? "–" : available}</b>
                  <span>Available now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: "1rem" }}>
        <div className="container">
          {/* Filter pills — same component as the map's filter bar */}
          <div className="filter-bar glass-panel">
            {(["all", "produce", "pantry", "prepared", "other"] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-pill${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : CATEGORY_LABELS[f]} ({counts[f] ?? 0})
              </button>
            ))}
            <button
              className={`filter-pill${availableOnly ? " active" : ""}`}
              onClick={() => setAvailableOnly((v) => !v)}
            >
              Available only
            </button>
            <span className="fb-spacer" />
            <input
              className="fb-search"
              type="search"
              placeholder="Search lemons, beans, downtown…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search listings"
            />
          </div>

          <div className="split">
            <div>
              {loading ? (
                <div className="card empty"><p style={{ margin: 0 }}>Loading listings…</p></div>
              ) : visible.length === 0 ? (
                <div className="card empty">
                  <span className="empty-icon">🧺</span>
                  <h3>{listings.length === 0 ? "No listings yet" : "Nothing matches"}</h3>
                  <p style={{ margin: 0 }}>
                    {listings.length === 0
                      ? user
                        ? "Be the first to share — use the panel to post."
                        : "Sign in to post the first one."
                      : "Try a different filter or search."}
                  </p>
                </div>
              ) : (
                <div className="grid">
                  {visible.map((l) => {
                    const mine = user && l.ownerId === user.id;
                    const claimedByMe = user && l.claimedBy === user.id;
                    return (
                      <div className="card" key={l.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "center" }}>
                          <span className="badge badge-harvest">
                            {CATEGORY_LABELS[l.category] ?? "Other"}
                          </span>
                          <span className={`badge ${l.status === "available" ? "badge-food" : "badge-muted"}`}>
                            {l.status === "available" ? "● Available" : "Claimed"}
                          </span>
                        </div>
                        <h3 style={{ marginTop: "0.7rem" }}>{l.title}</h3>
                        {l.description && <p>{l.description}</p>}
                        <div className="msp-detail" style={{ animation: "none" }}>
                          {l.quantity && (
                            <div className="d-section" style={{ margin: "0.5rem 0" }}>
                              <p className="d-label">Quantity</p>
                              <p className="d-value">{l.quantity}</p>
                            </div>
                          )}
                          {l.location && (
                            <div className="d-section" style={{ margin: "0.5rem 0" }}>
                              <p className="d-label">Pickup</p>
                              <p className="d-value">{l.location}</p>
                            </div>
                          )}
                          <p className="d-value" style={{ fontSize: "0.82rem", marginTop: "0.6rem" }}>
                            Shared by {mine ? "you" : l.ownerName}
                            {l.status === "claimed" && l.claimedByName && (
                              <> · claimed by {claimedByMe ? "you" : l.claimedByName}</>
                            )}
                          </p>
                        </div>

                        <div className="popup-actions" style={{ marginTop: "0.9rem" }}>
                          {!user ? (
                            <a className="btn btn-ghost" href="/signin">Sign in to claim</a>
                          ) : mine ? (
                            <span className="badge badge-muted">Your listing</span>
                          ) : l.status === "available" ? (
                            <button className="btn btn-primary" disabled={busyId === l.id} onClick={() => claim(l.id, "claim")}>
                              {busyId === l.id ? "…" : "Claim"}
                            </button>
                          ) : claimedByMe ? (
                            <button className="btn btn-ghost" disabled={busyId === l.id} onClick={() => claim(l.id, "release")}>
                              {busyId === l.id ? "…" : "Release claim"}
                            </button>
                          ) : (
                            <span className="badge badge-muted">Already claimed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Side panel — mirrors the map's discovery/detail panel */}
            <aside className="side glass-panel">
              {user ? (
                <PostForm onPosted={load} />
              ) : (
                <>
                  <div className="msp-header">
                    <h2 className="msp-title">Share your surplus</h2>
                    <p className="msp-sub">Free accounts take 30 seconds</p>
                  </div>
                  <div className="msp-body msp-detail">
                    <div className="d-section" style={{ marginTop: 0 }}>
                      <p className="d-label">1 · Post</p>
                      <p className="d-value">List extra lemons, zucchini, or pantry goods.</p>
                    </div>
                    <div className="d-section">
                      <p className="d-label">2 · Claim</p>
                      <p className="d-value">A neighbor reserves it so nobody double-books.</p>
                    </div>
                    <div className="d-section">
                      <p className="d-label">3 · Pick up</p>
                      <p className="d-value">Meet at the pickup spot. No money changes hands.</p>
                    </div>
                    <div className="msp-actions">
                      <a className="btn-glass primary" href="/signin">Sign in to post</a>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

function PostForm({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("produce");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [posted, setPosted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPosted(false);
    setBusy(true);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, quantity, location }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not post listing.");
      return;
    }
    setTitle("");
    setDescription("");
    setQuantity("");
    setLocation("");
    setPosted(true);
    onPosted();
  }

  return (
    <>
      <div className="msp-header">
        <h2 className="msp-title">Post surplus food</h2>
        <p className="msp-sub">It shows up in the marketplace instantly</p>
      </div>
      <div className="msp-body">
        <form className="form" onSubmit={submit}>
          <div>
            <label htmlFor="t">What are you sharing?</label>
            <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="c">Category</label>
            <select
              id="c"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "0.65rem 0.8rem", font: "inherit" }}
            >
              <option value="produce">Produce (fruit, veg, herbs)</option>
              <option value="pantry">Pantry (canned, dry goods)</option>
              <option value="prepared">Prepared / baked</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="q">Quantity (optional)</label>
            <input id="q" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 2 bags of lemons" />
          </div>
          <div>
            <label htmlFor="loc">Pickup location (optional)</label>
            <input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Downtown Hayward" />
          </div>
          <div>
            <label htmlFor="d">Details (optional)</label>
            <textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: 90 }} />
          </div>
          {error && <p className="form-error">{error}</p>}
          {posted && <p style={{ color: "var(--nm-forest-bright)", fontWeight: 600, margin: 0 }}>✓ Posted!</p>}
          <div>
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
              {busy ? "Posting…" : "Post listing"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAccount();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Community Marketplace</h1>
          <p className="lede">
            Share your surplus harvest and pantry goods — all free. Claim what you
            need and coordinate a pickup with a neighbor.
          </p>
          <div className="hero-actions">
            {user ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowForm((s) => !s)}
              >
                {showForm ? "Close form" : "+ Post surplus food"}
              </button>
            ) : (
              <a className="btn btn-primary" href="/signin">
                Sign in to post
              </a>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          {showForm && user && (
            <PostForm
              onPosted={() => {
                setShowForm(false);
                load();
              }}
            />
          )}

          {loading ? (
            <p>Loading listings…</p>
          ) : listings.length === 0 ? (
            <div className="card">
              <p style={{ margin: 0 }}>
                No listings yet.{" "}
                {user ? "Be the first to share!" : "Sign in to post the first one."}
              </p>
            </div>
          ) : (
            <div className="grid">
              {listings.map((l) => {
                const mine = user && l.ownerId === user.id;
                const claimedByMe = user && l.claimedBy === user.id;
                return (
                  <div className="card" key={l.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        alignItems: "center",
                      }}
                    >
                      <span className="badge badge-harvest">
                        {CATEGORY_LABELS[l.category] ?? "Other"}
                      </span>
                      <span
                        className={`badge ${
                          l.status === "available" ? "badge-food" : "badge-harvest"
                        }`}
                      >
                        {l.status === "available" ? "Available" : "Claimed"}
                      </span>
                    </div>
                    <h3 style={{ marginTop: "0.6rem" }}>{l.title}</h3>
                    {l.description && <p>{l.description}</p>}
                    <p style={{ fontSize: "0.9rem", color: "var(--c-ink-soft)", margin: "0.3rem 0" }}>
                      {l.quantity && <>Qty: {l.quantity}<br /></>}
                      {l.location && <>Pickup: {l.location}<br /></>}
                      Shared by {mine ? "you" : l.ownerName}
                      {l.status === "claimed" && l.claimedByName && (
                        <>
                          <br />
                          Claimed by {claimedByMe ? "you" : l.claimedByName}
                        </>
                      )}
                    </p>

                    <div className="popup-actions">
                      {!user ? (
                        <a className="btn btn-ghost" href="/signin">
                          Sign in to claim
                        </a>
                      ) : mine ? (
                        <span style={{ fontSize: "0.85rem", color: "var(--c-ink-soft)" }}>
                          Your listing
                        </span>
                      ) : l.status === "available" ? (
                        <button
                          className="btn btn-primary"
                          disabled={busyId === l.id}
                          onClick={() => claim(l.id, "claim")}
                        >
                          {busyId === l.id ? "…" : "Claim"}
                        </button>
                      ) : claimedByMe ? (
                        <button
                          className="btn btn-ghost"
                          disabled={busyId === l.id}
                          onClick={() => claim(l.id, "release")}
                        >
                          {busyId === l.id ? "…" : "Release claim"}
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--c-ink-soft)" }}>
                          Already claimed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
    onPosted();
  }

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <h3>Post surplus food</h3>
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
            style={{
              width: "100%",
              padding: "0.65rem 0.8rem",
              border: "1px solid var(--c-line)",
              borderRadius: 8,
              background: "var(--c-surface)",
              color: "var(--c-ink)",
              font: "inherit",
            }}
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
          <textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {error && <p style={{ color: "var(--c-rust)", fontWeight: 600, margin: 0 }}>{error}</p>}
        <div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Posting…" : "Post listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

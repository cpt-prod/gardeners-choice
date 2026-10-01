"use client";

import Link from "next/link";
import type { Food, Site } from "@/lib/types";
import { useCtxSession } from "@/app/providers";
import { formatTokens } from "@/lib/format";

export default function FoodCard({ site, food }: { site: Site; food: Food }) {
  const session = useCtxSession();
  const ctaHref =
    session.status === "loading"
      ? "#"
      : session.status === "anon"
        ? "/account?next=" + encodeURIComponent(`/marketplace/${site.id}/${food.id}`)
        : session.status === "authed-free"
          ? "/account/subscribe?next=" + encodeURIComponent(`/marketplace/${site.id}/${food.id}`)
          : `/marketplace/${site.id}/${food.id}`;

  // Calculate harvest time relative to now
  const harvestTime = food.harvestDate ? (() => {
    const diff = Date.now() - new Date(food.harvestDate).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  })() : null;

  return (
    <article className="card food-card">
      <div className="food-image" aria-hidden="true" />
      <div className="food-card-body">
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
          <span className="badge badge-food">{categoryLabel(food.category)}</span>
          {food.inSeason && <span className="badge badge-inseason">In season</span>}
          {food.tags?.map(tag => (
            <span key={tag} className="badge badge-ghost" style={{ fontSize: "0.7rem", textTransform: "capitalize" }}>
              {tag.replace("-", " ")}
            </span>
          ))}
          {site.isVerified && <span className="badge badge-premium" style={{ fontSize: "0.7rem" }}>Verified</span>}
        </div>
        <h3 style={{ marginBottom: "0.25rem" }}>{food.name}</h3>
        <p style={{ color: "var(--c-ink-soft)", fontSize: "0.9rem", margin: "0 0 0.75rem" }}>
          {food.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="food-price" title={formatTokens(food.priceTokens)}>
            <span className="token-pill">{food.priceTokens}</span>
            <span style={{ marginLeft: "0.5rem", color: "var(--c-ink-soft)", fontSize: "0.9rem" }}>
              {food.unit}
            </span>
          </span>
          <Link
            href={ctaHref}
            className={`btn ${session.status === "authed-premium" ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}
          >
            Make offer
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--c-ink-soft)" }}>
          <span>at <Link href={`/marketplace/${site.id}`}>{site.name}</Link></span>
          {harvestTime && <span>{harvestTime}</span>}
        </div>
        {food.quantity !== undefined && (
          <div style={{ marginTop: "0.25rem", fontSize: "0.75rem", fontWeight: "bold", color: food.quantity <= 3 ? "var(--c-accent)" : "var(--c-ink-soft)" }}>
            {food.quantity <= 3 ? `Only ${food.quantity} left!` : `${food.quantity} available`}
          </div>
        )}
      </div>
    </article>
  );
}

function categoryLabel(c: Food["category"]): string {
  switch (c) {
    case "produce":
      return "Produce";
    case "csa":
      return "CSA box";
    case "prepared":
      return "Prepared";
    case "pantry":
      return "Pantry";
    case "surprise-bag":
      return "Surprise Bag";
  }
}

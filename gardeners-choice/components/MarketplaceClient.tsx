"use client";

import { useMemo, useState } from "react";
import type { Site, Food, FoodCategory } from "@/lib/types";
import FoodCard from "./FoodCard";
import { useCtxSession } from "@/app/providers";

type VendorFilter = "all" | string; // site id or "all"
type CategoryFilter = "all" | FoodCategory;
type SeasonFilter = "all" | "in-season";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "produce", label: "Produce" },
  { id: "csa", label: "CSA" },
  { id: "prepared", label: "Prepared" },
  { id: "pantry", label: "Pantry" },
  { id: "surprise-bag", label: "Surprise Bags" },
];

export default function MarketplaceClient({ sites }: { sites: Site[] }) {
  const session = useCtxSession();
  const vendors = useMemo(
    () => sites.filter((s) => s.foods && s.foods.length > 0),
    [sites],
  );

  const [vendor, setVendor] = useState<VendorFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [season, setSeason] = useState<SeasonFilter>("all");

  const filteredFoods = useMemo(() => {
    const out: { site: Site; food: Food }[] = [];
    for (const s of vendors) {
      if (vendor !== "all" && s.id !== vendor) continue;
      for (const f of s.foods ?? []) {
        if (category !== "all" && f.category !== category) continue;
        if (season === "in-season" && !f.inSeason) continue;
        out.push({ site: s, food: f });
      }
    }

    // Premium Priority: Sort Surprise Bags and High-Quantity items to the top for Premium users
    if (session.status === "authed-premium") {
      return out.sort((a, b) => {
        if (a.food.category === "surprise-bag" && b.food.category !== "surprise-bag") return -1;
        if (b.food.category === "surprise-bag" && a.food.category !== "surprise-bag") return 1;
        return 0;
      });
    }

    return out;
  }, [vendors, vendor, category, season, session.status]);

  return (
    <>
      <div className="marketplace-toolbar" role="region" aria-label="Marketplace filters">
        <div className="toolbar-row">
          <strong style={{ marginRight: "0.5rem" }}>Vendor:</strong>
          <button
            type="button"
            className="chip"
            aria-pressed={vendor === "all"}
            onClick={() => setVendor("all")}
          >
            All ({vendors.length})
          </button>
          {vendors.map((s) => (
            <button
              key={s.id}
              type="button"
              className="chip"
              aria-pressed={vendor === s.id}
              onClick={() => setVendor(s.id)}
              title={s.name}
            >
              {shortName(s.name)}
            </button>
          ))}
        </div>
        <div className="toolbar-row">
          <strong style={{ marginRight: "0.5rem" }}>Category:</strong>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="toolbar-row">
          <strong style={{ marginRight: "0.5rem" }}>When:</strong>
          <button
            type="button"
            className="chip"
            aria-pressed={season === "all"}
            onClick={() => setSeason("all")}
          >
            Any time
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={season === "in-season"}
            onClick={() => setSeason("in-season")}
          >
            In season now
          </button>
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem", marginTop: "1.5rem" }}>
          <p style={{ margin: 0, color: "var(--c-ink-soft)" }}>
            No foods match those filters yet.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: "1.5rem" }}>
          {filteredFoods.map(({ site, food }) => (
            <FoodCard key={`${site.id}:${food.id}`} site={site} food={food} />
          ))}
        </div>
      )}
    </>
  );
}

function shortName(name: string): string {
  if (name.length <= 22) return name;
  return name.slice(0, 21).trimEnd() + "…";
}

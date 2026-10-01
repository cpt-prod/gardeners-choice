"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import type { Site, Food } from "@/lib/types";
import { useProviders } from "@/app/providers";
import { OFFER_COST_TOKENS } from "@/lib/tokens";
import { formatTokens } from "@/lib/format";

export default function FoodDetailPage({
  params,
}: {
  params: { siteId: string; foodId: string };
}) {
  const router = useRouter();
  const { session, tokens, threads } = useProviders();
  const [mounted, setMounted] = useState(false);
  const [site, setSite] = useState<Site | null>(null);
  const [food, setFood] = useState<Food | null>(null);
  const [offer, setOffer] = useState<number>(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Lazy-load seed data — keep this client component side effect free on server.
    import("@/lib/data").then(({ sites }) => {
      const s = sites.find((x) => x.id === params.siteId) ?? null;
      const f = s?.foods?.find((x) => x.id === params.foodId) ?? null;
      if (!s || !f) {
        notFound();
        return;
      }
      setSite(s);
      setFood(f);
      setOffer(Math.round(f.priceTokens * 0.9));
    });
  }, [params.siteId, params.foodId]);

  if (!mounted || !site || !food) {
    return (
      <section>
        <div className="container">
          <p style={{ color: "var(--c-ink-soft)" }}>Loading…</p>
        </div>
      </section>
    );
  }

  const handleMakeOffer = () => {
    if (session.status !== "authed-premium") return;
    if (!Number.isFinite(offer) || offer < 1) return;
    if (tokens.balance == null || tokens.balance < OFFER_COST_TOKENS) return;
    setBusy(true);
    const thread = threads.openThread(site, food);
    threads.sendMessage(thread.id, site, food, {
      from: "buyer",
      kind: "offer",
      amountTokens: offer,
      text: `I'd like to offer ${offer} tokens for ${food.name}.`,
    });
    router.push(`/account/offers/${thread.id}`);
  };

  const ctaDisabled =
    session.status !== "authed-premium" ||
    tokens.balance == null ||
    tokens.balance < OFFER_COST_TOKENS ||
    busy ||
    offer < 1;

  let ctaLabel = "Make offer";
  if (session.status === "loading") ctaLabel = "Loading…";
  else if (session.status === "anon") ctaLabel = "Sign in to make an offer";
  else if (session.status === "authed-free") ctaLabel = "Upgrade to premium";
  else if (tokens.balance != null && tokens.balance < OFFER_COST_TOKENS)
    ctaLabel = "Not enough tokens";

  return (
    <>
      <section className="hero" style={{ padding: "2.5rem 0 1.5rem" }}>
        <div className="container">
          <p style={{ marginBottom: "0.25rem" }}>
            <Link href={`/marketplace/${site.id}`}>← {site.name}</Link>
          </p>
          <h1 style={{ marginBottom: "0.25rem" }}>{food.name}</h1>
          <p className="lede" style={{ marginBottom: "0.25rem" }}>
            {food.description}
          </p>
          <p style={{ color: "var(--c-ink-soft)" }}>
            <span className="token-pill">{food.priceTokens}</span>{" "}
            <span style={{ marginLeft: "0.5rem" }}>{food.unit}</span> ·{" "}
            <span className="badge badge-food">{food.category}</span>{" "}
            {food.inSeason && (
              <span className="badge badge-inseason" style={{ marginLeft: "0.4rem" }}>
                In season
              </span>
            )}
          </p>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <div className="card" style={{ maxWidth: 560 }}>
            <h2>Open a barter thread</h2>
            <p style={{ color: "var(--c-ink-soft)" }}>
              Premium subscribers can open a negotiation thread with {site.name}.
              Each <strong>offer</strong> or <strong>counter-offer</strong> costs 1
              token. If the vendor accepts, the agreed amount transfers from your
              balance to the vendor&rsquo;s ledger.
            </p>

            <div style={{ marginTop: "1rem" }}>
              <label htmlFor="offer" style={{ fontWeight: 600 }}>
                Your offer (tokens)
              </label>
              <input
                id="offer"
                type="number"
                min={1}
                max={food.priceTokens}
                value={offer}
                onChange={(e) => setOffer(parseInt(e.target.value, 10) || 0)}
                className="form"
                style={{ width: "100%", marginTop: "0.4rem" }}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--c-ink-soft)" }}>
                List price is {formatTokens(food.priceTokens)}. The vendor will
                counter offers more than 20% below list.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {session.status === "anon" && (
                <Link
                  href={`/account?next=${encodeURIComponent(`/marketplace/${site.id}/${food.id}`)}`}
                  className="btn btn-primary"
                >
                  Sign in to make an offer
                </Link>
              )}
              {session.status === "authed-free" && (
                <Link
                  href={`/account/subscribe?next=${encodeURIComponent(`/marketplace/${site.id}/${food.id}`)}`}
                  className="btn btn-primary"
                >
                  Upgrade to premium
                </Link>
              )}
              {session.status === "authed-premium" && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleMakeOffer}
                  disabled={ctaDisabled}
                >
                  {ctaLabel} · costs {OFFER_COST_TOKENS} token
                </button>
              )}
            </div>

            {session.status === "authed-premium" && tokens.balance != null && (
              <p style={{ marginTop: "0.75rem", color: "var(--c-ink-soft)" }}>
                Your balance: {formatTokens(tokens.balance)}
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Food, OfferThread, OfferMessage, Site } from "@/lib/types";
import { useProviders } from "@/app/providers";
import OfferMessageView from "./OfferMessage";
import { formatTokens } from "@/lib/format";

export default function OfferThreadView({
  thread,
  site,
  food,
}: {
  thread: OfferThread;
  site: Site;
  food: Food;
}) {
  const { session, tokens, threads } = useProviders();
  const [draft, setDraft] = useState("");
  const [counterAmount, setCounterAmount] = useState<number>(
    Math.max(1, Math.round(food.priceTokens * 0.85)),
  );
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.messages.length]);

  // Clear unread when opening this thread
  useEffect(() => {
    if (session.user && session.user.unreadOffers > 0) {
      tokens.clearUnread();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const premium = session.status === "authed-premium";
  const isOpen = thread.status === "open";

  const sendBuyerMessage = (
    kind: OfferMessage["kind"],
    amountTokens?: number,
    textOverride?: string,
  ) => {
    if (!premium || !isOpen) return;
    const payload: Omit<OfferMessage, "id" | "ts"> = {
      from: "buyer",
      kind,
      amountTokens,
      text: (textOverride ?? draft.trim()) || undefined,
    };
    threads.sendMessage(thread.id, site, food, payload);
    setDraft("");
  };

  return (
    <section>
      <div className="container">
        <p style={{ marginBottom: "0.25rem" }}>
          <Link href="/account/offers">← All threads</Link>{" "}
          <span style={{ color: "var(--c-ink-soft)" }}>·</span>{" "}
          <Link href={`/marketplace/${site.id}`}>{site.name}</Link>
        </p>
        <h1 style={{ marginBottom: "0.25rem" }}>{food.name}</h1>
        <p className="lede" style={{ marginBottom: "1rem" }}>
          List price {formatTokens(food.priceTokens)} ·{" "}
          <span
            className={`badge ${isOpen ? "badge-food" : thread.status === "accepted" ? "badge-premium" : ""}`}
          >
            {thread.status}
          </span>
        </p>

        <div className="card" style={{ padding: "1rem", marginBottom: "1rem", backgroundColor: "var(--c-bg-soft)", border: "1px solid var(--c-line)" }}>
          <strong style={{ fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>🛡️ Community Safety Tip</strong>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--c-ink-soft)", lineHeight: "1.4" }}>
            When meeting for a pickup, choose a public place (like a library or coffee shop).
            Always share your location with a friend and trust your instincts.
          </p>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="thread" ref={listRef}>
            <div className="thread-list">
              {thread.messages.map((m) => (
                <OfferMessageView key={m.id} msg={m} />
              ))}
            </div>
          </div>

          {isOpen && (
            <div style={{ padding: "1rem", borderTop: "1px solid var(--c-line)" }}>
              {!premium && (
                <div className="demo-banner" style={{ marginBottom: "0.75rem" }}>
                  You need <strong>Premium</strong> to send messages in this thread.
                  <div style={{ marginTop: "0.5rem" }}>
                    <Link
                      href={`/account/subscribe?next=${encodeURIComponent(`/account/offers/${thread.id}`)}`}
                      className="btn btn-primary"
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.9rem" }}
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                </div>
              )}
              {premium && (
                <>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => sendBuyerMessage("counter", counterAmount, `Counter: ${counterAmount} tokens`)}
                      disabled={tokens.balance == null || tokens.balance < 1}
                    >
                      Counter {counterAmount} tokens (−1)
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={food.priceTokens}
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(parseInt(e.target.value, 10) || 0)}
                      style={{ width: 100 }}
                      aria-label="Counter amount"
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => sendBuyerMessage("accept", thread.messages[thread.messages.length - 1]?.amountTokens ?? food.priceTokens, "Accepted.")}
                      disabled={
                        tokens.balance == null ||
                        (thread.messages[thread.messages.length - 1]?.amountTokens ?? 0) > tokens.balance
                      }
                    >
                      Accept vendor&rsquo;s last offer
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => sendBuyerMessage("decline", undefined, "Withdrew my offer.")}
                    >
                      Withdraw
                    </button>
                  </div>

                  <form
                    style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!draft.trim()) return;
                      sendBuyerMessage("message");
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a message to the vendor…"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
                      Send
                    </button>
                  </form>
                  <p style={{ marginTop: "0.5rem", color: "var(--c-ink-soft)", fontSize: "0.85rem" }}>
                    Your balance: {formatTokens(tokens.balance ?? 0)}. Counters cost 1
                    token. The vendor replies within a few seconds.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

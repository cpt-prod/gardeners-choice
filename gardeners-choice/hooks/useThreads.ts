"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { OfferThread, OfferMessage, Food, Site } from "@/lib/types";
import { readThreads, writeThreads, subscribe } from "@/lib/storage";
import { useSession } from "./useSession";
import { useTokens } from "./useTokens";
import { OFFER_COST_TOKENS, COUNTER_COST_TOKENS } from "@/lib/tokens";
import { scheduleVendorReply } from "@/lib/vendorBot";

export interface UseThreads {
  threads: OfferThread[];
  get: (id: string) => OfferThread | null;
  forUser: () => OfferThread[];
  openThread: (site: Site, food: Food) => OfferThread;
  sendMessage: (
    threadId: string,
    site: Site,
    food: Food,
    msg: Omit<OfferMessage, "id" | "ts">,
  ) => OfferThread | null;
  markRead: (id: string) => void;
}

function bump(thread: OfferThread, message: OfferMessage): OfferThread {
  return {
    ...thread,
    messages: [...thread.messages, message],
    updatedAt: Date.now(),
  };
}

export function useThreads(): UseThreads {
  const { user } = useSession();
  const tokens = useTokens();
  const [threads, setThreads] = useState<OfferThread[]>([]);

  const reload = useCallback(() => {
    setThreads(readThreads());
  }, []);

  useEffect(() => {
    reload();
    const unsub = subscribe((key) => {
      if (key === "gc:threads") reload();
    });
    return () => {
      unsub();
    };
  }, [reload]);

  const persist = useCallback((next: OfferThread[]) => {
    writeThreads(next);
    setThreads(next);
  }, []);

  const get = useCallback(
    (id: string) => threads.find((t) => t.id === id) ?? null,
    [threads],
  );

  const forUser = useCallback(() => {
    if (!user) return [];
    return threads
      .filter((t) => t.userId === user.id)
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [threads, user]);

  const openThread = useCallback(
    (site: Site, food: Food): OfferThread => {
      if (!user) throw new Error("Not signed in");
      // Reuse existing open thread for this (user, food)
      const existing = threads.find(
        (t) => t.userId === user.id && t.foodId === food.id && t.status === "open",
      );
      if (existing) return existing;

      const firstMsg: OfferMessage = {
        id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        from: "buyer",
        kind: "message",
        text: `Hi! I'd like to make an offer on ${food.name}.`,
        ts: Date.now(),
      };
      const thread: OfferThread = {
        id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        userId: user.id,
        siteId: site.id,
        foodId: food.id,
        status: "open",
        messages: [firstMsg],
        updatedAt: Date.now(),
        vendorTokenLedger: 0,
      };
      persist([...threads, thread]);
      tokens.markFirstThreadOpened();
      return thread;
    },
    [user, threads, persist, tokens],
  );

  const sendMessage = useCallback(
    (
      threadId: string,
      site: Site,
      food: Food,
      partial: Omit<OfferMessage, "id" | "ts">,
    ): OfferThread | null => {
      if (!user) return null;
      const t = threads.find((x) => x.id === threadId);
      if (!t || t.status !== "open") return t ?? null;

      // Cost enforcement for buyer
      if (partial.from === "buyer") {
        if (partial.kind === "offer") tokens.spend(OFFER_COST_TOKENS, "Make offer");
        if (partial.kind === "counter") tokens.spend(COUNTER_COST_TOKENS, "Counter-offer");
        if (partial.kind === "accept") {
          if (partial.amountTokens != null) {
            tokens.spend(partial.amountTokens, "Accept vendor's offer");
          }
        }
      }

      const message: OfferMessage = {
        ...partial,
        id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        ts: Date.now(),
      };

      let nextThread: OfferThread = bump(t, message);

      // Apply terminal kinds
      if (partial.from === "buyer" && partial.kind === "accept") {
        nextThread = { ...nextThread, status: "accepted" };
        if (partial.amountTokens != null) {
          nextThread = {
            ...nextThread,
            vendorTokenLedger: nextThread.vendorTokenLedger + partial.amountTokens,
          };
        }
      }
      if (partial.from === "buyer" && partial.kind === "decline") {
        nextThread = { ...nextThread, status: "declined" };
      }
      if (partial.from === "vendor" && partial.kind === "accept") {
        nextThread = { ...nextThread, status: "accepted" };
      }
      if (partial.from === "vendor" && partial.kind === "decline") {
        nextThread = { ...nextThread, status: "declined" };
      }

      persist(threads.map((x) => (x.id === threadId ? nextThread : x)));

      // Schedule vendor reply for buyer offers/counters (not for accept/decline/message)
      if (
        partial.from === "buyer" &&
        (partial.kind === "offer" || partial.kind === "counter" || partial.kind === "message")
      ) {
        scheduleVendorReply({
          site,
          food,
          thread: nextThread,
          buyerMessage: message,
          onResolve: (reply) => {
            const cur = readThreads().find((x) => x.id === threadId);
            if (!cur || cur.status !== "open") return;
            let updated = bump(cur, reply);
            if (reply.kind === "accept") updated = { ...updated, status: "accepted" };
            if (reply.kind === "decline") updated = { ...updated, status: "declined" };
            writeThreads(readThreads().map((x) => (x.id === threadId ? updated : x)));
            tokens.markUnread(1);
          },
        });
      }

      return nextThread;
    },
    [user, threads, persist, tokens],
  );

  const markRead = useCallback(
    (id: string) => {
      tokens.clearUnread();
    },
    [tokens],
  );

  return useMemo(
    () => ({ threads, get, forUser, openThread, sendMessage, markRead }),
    [threads, get, forUser, openThread, sendMessage, markRead],
  );
}

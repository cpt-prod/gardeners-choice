"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "./useSession";
import {
  spendTokens as libSpend,
  earnTokens as libEarn,
  upgradeToPremium as libUpgrade,
  markFirstThreadOpened as libMarkFirst,
  markUnread as libMarkUnread,
  clearUnread as libClearUnread,
  refreshDailyBonus,
} from "@/lib/tokens";
import type { User } from "@/lib/types";

export interface UseTokens {
  balance: number | null;
  spend: (n: number, reason: string) => User;
  earn: (n: number) => User;
  upgradeToPremium: () => User;
  markFirstThreadOpened: () => User;
  markUnread: (n: number) => User;
  clearUnread: () => User;
}

export function useTokens(): UseTokens {
  const { user, refresh } = useSession();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (user) {
      const { user: refreshed } = refreshDailyBonus(user);
      if (refreshed.tokens !== user.tokens) refresh();
    }
    setTick((t) => t + 1);
  }, [user, refresh]);

  const spend = useCallback(
    (n: number, reason: string) => {
      if (!user) throw new Error("Not signed in");
      const u = libSpend(user, n, reason);
      refresh();
      return u;
    },
    [user, refresh],
  );

  const earn = useCallback(
    (n: number) => {
      if (!user) throw new Error("Not signed in");
      const u = libEarn(user, n);
      refresh();
      return u;
    },
    [user, refresh],
  );

  const upgradeToPremium = useCallback(() => {
    if (!user) throw new Error("Not signed in");
    const u = libUpgrade(user);
    refresh();
    return u;
  }, [user, refresh]);

  const markFirstThreadOpened = useCallback(() => {
    if (!user) throw new Error("Not signed in");
    const u = libMarkFirst(user);
    refresh();
    return u;
  }, [user, refresh]);

  const markUnread = useCallback(
    (n: number) => {
      if (!user) throw new Error("Not signed in");
      const u = libMarkUnread(user, n);
      refresh();
      return u;
    },
    [user, refresh],
  );

  const clearUnread = useCallback(() => {
    if (!user) return user!;
    const u = libClearUnread(user);
    refresh();
    return u;
  }, [user, refresh]);

  return {
    balance: user ? user.tokens : null,
    spend,
    earn,
    upgradeToPremium,
    markFirstThreadOpened,
    markUnread,
    clearUnread,
  };
}

// tick is referenced to silence unused-var warnings in callers that want to
// force-rerender after an implicit refresh.
export function useTokensTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return tick;
}

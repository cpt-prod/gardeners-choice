"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { SessionStatus, User } from "@/lib/types";
import {
  getCurrentUserId,
  getUserById,
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
} from "@/lib/auth";
import { subscribe } from "@/lib/storage";
import { isPremium, refreshDailyBonus } from "@/lib/tokens";

export interface UseSession {
  status: SessionStatus;
  user: User | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    username: string,
    password: string,
    displayName: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refresh: () => void;
}

export function useSession(): UseSession {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const refresh = useCallback(() => {
    const u = getUserById(getCurrentUserId());
    if (!u) {
      setUser(null);
      setStatus("anon");
      return;
    }
    // Apply daily bonus if eligible
    const { user: refreshed } = refreshDailyBonus(u);
    setUser(refreshed);
    setStatus(isPremium(refreshed) ? "authed-premium" : "authed-free");
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribe((key) => {
      if (key === "gc:users" || key === "gc:session") refresh();
    });
    return () => {
      unsub();
    };
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await authLogin(username, password);
      if (res.ok) refresh();
      return res.ok ? { ok: true } : { ok: false, error: res.error };
    },
    [refresh],
  );

  const signup = useCallback(
    async (username: string, password: string, displayName: string) => {
      const res = await authSignup(username, password, displayName);
      if (res.ok) refresh();
      return res.ok ? { ok: true } : { ok: false, error: res.error };
    },
    [refresh],
  );

  const logout = useCallback(() => {
    authLogout();
    refresh();
  }, [refresh]);

  return useMemo(
    () => ({ status, user, login, signup, logout, refresh }),
    [status, user, login, signup, logout, refresh],
  );
}

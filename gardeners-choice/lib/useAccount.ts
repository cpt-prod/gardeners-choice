"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuestionnaireAnswers } from "@/lib/questionnaire";

export type Account = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  createdAt: number;
};

type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Session-aware account hook. The session token lives in an httpOnly cookie,
 * so it is never held in JS — we only cache the public user object for display
 * and always re-probe on mount.
 */
export function useAccount() {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signup = useCallback(
    async (
      username: string,
      password: string,
      displayName: string,
      answers: QuestionnaireAnswers
    ): Promise<AuthResult> => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          username,
          password,
          displayName,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Sign-up failed." };
      setUser(data.user);
      return { ok: true };
    },
    []
  );

  const login = useCallback(
    async (username: string, password: string): Promise<AuthResult> => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Login failed." };
      setUser(data.user);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
  }, []);

  return { user, loading, signup, login, logout, refresh };
}

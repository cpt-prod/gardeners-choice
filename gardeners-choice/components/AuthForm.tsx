"use client";

import { useState } from "react";
import Link from "next/link";
import { useProviders } from "@/app/providers";

type Mode = "login" | "signup";

export default function AuthForm({ next }: { next: string }) {
  const { session } = useProviders();
  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === "signup"
        ? await session.signup(username, password, displayName)
        : await session.login(username, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong");
      return;
    }
    if (mode === "signup") {
      // Send new signups through subscribe page so they pick up premium easily.
      window.location.href = `/account/subscribe?next=${encodeURIComponent(next)}`;
    } else {
      window.location.href = next;
    }
  };

  return (
    <div className="card account-card" style={{ marginTop: "1.5rem", maxWidth: 480 }}>
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          className="auth-tab"
          aria-pressed={mode === "signup"}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
        <button
          type="button"
          className="auth-tab"
          aria-pressed={mode === "login"}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
      </div>

      <form className="form" onSubmit={submit} style={{ marginTop: "1rem" }}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        {mode === "signup" && (
          <div>
            <label htmlFor="displayName">Display name (optional)</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="nickname"
            />
          </div>
        )}
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
        </div>
        {error && (
          <p style={{ color: "var(--c-rust)", margin: 0 }}>{error}</p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Working…" : mode === "signup" ? "Create account" : "Log in"}
        </button>
        <p className="form-note">
          By {mode === "signup" ? "signing up" : "logging in"} you agree this is a
          demo account.{" "}
          <Link href="/about">Read the principles.</Link>
        </p>
      </form>
    </div>
  );
}

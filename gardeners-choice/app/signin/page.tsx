"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/lib/useAccount";
import QrSignIn from "@/components/QrSignIn";
import Questionnaire from "@/components/Questionnaire";
import {
  DEFAULT_ANSWERS,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire";

export default function SignInPage() {
  const router = useRouter();
  const { user, loading, login, signup, logout } = useAccount();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [authMode, setAuthMode] = useState<"password" | "qr">("password");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(DEFAULT_ANSWERS);
  const [qErrors, setQErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setQErrors({});
    setBusy(true);
    const result =
      mode === "login"
        ? await login(username, password)
        : await signup(username, password, displayName, answers);
    setBusy(false);
    if (result.ok) {
      router.push("/account");
    } else {
      setError(result.error);
    }
  }

  if (!loading && user) {
    return (
      <section>
        <div className="container" style={{ maxWidth: 520 }}>
          <h1>You're signed in</h1>
          <div className="card page-head">
            <p>
              Signed in as <strong>{user.displayName}</strong> (@{user.username}).
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="/account">My account</a>
              <a className="btn btn-ghost" href="/marketplace">Browse marketplace</a>
              <button className="btn btn-ghost" onClick={() => logout()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="page-head glass-panel">
        <p className="kicker">{mode === "login" ? "Welcome back" : "Join the community"}</p>
        <h1>{mode === "login" ? "Sign in" : "Create an account"}</h1>
        <p style={{ color: "var(--c-ink-soft)", maxWidth: "52ch" }}>
          {mode === "login"
            ? "Sign in to post surplus food and claim listings from neighbors."
            : "Join Hayward Harvest to share your surplus harvest and reserve food from others nearby."}
        </p>

        <div className="qr-tabs">
          <button
            className={authMode === "password" ? "active" : ""}
            onClick={() => setAuthMode("password")}
          >
            Password
          </button>
          <button
            className={authMode === "qr" ? "active" : ""}
            onClick={() => setAuthMode("qr")}
          >
            QR sign-in
          </button>
        </div>

        {authMode === "qr" ? (
          <QrSignIn />
        ) : (
          <>
          <form className="form" onSubmit={onSubmit} style={{ maxWidth: "none" }}>
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
                placeholder="How neighbors see you"
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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
            {mode === "signup" && (
              <p className="form-note">At least 8 characters.</p>
            )}
          </div>

          {mode === "signup" && (
            <Questionnaire
              value={answers}
              onChange={(v) => {
                setAnswers(v);
                setQErrors({});
              }}
              errors={qErrors}
            />
          )}

          {error && (
            <p style={{ color: "var(--c-rust)", fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          )}

          <div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: "1.25rem" }}>
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--c-forest)",
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
            }}
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
          </>
        )}
        </div>
      </div>
    </section>
  );
}

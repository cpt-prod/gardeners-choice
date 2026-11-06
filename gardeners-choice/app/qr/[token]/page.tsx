"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "@/lib/useAccount";

type Phase = "idle" | "working" | "done" | "error";

/**
 * Phone side of QR sign-in. The phone opens this after scanning the desktop's QR.
 * If the phone isn't signed in yet, it shows a compact sign-in / sign-up form
 * first; once authenticated, the visitor approves and the waiting desktop logs in.
 */
export default function QrApprovePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const { user, loading, login, signup } = useAccount();

  // auth form state (only used when the phone isn't signed in)
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // approval state
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    const result =
      mode === "login"
        ? await login(username, password)
        : await signup(username, password, displayName);
    setAuthBusy(false);
    if (!result.ok) setAuthError(result.error);
    // on success the hook updates `user` and the approve panel appears
  }

  async function approve() {
    setPhase("working");
    setError(null);
    try {
      const res = await fetch("/api/auth/qr/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not approve.");
        setPhase("error");
        return;
      }
      setPhase("done");
    } catch {
      setError("Network error. Try again.");
      setPhase("error");
    }
  }

  return (
    <section>
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="page-head glass-panel">
          <p className="kicker">QR sign-in</p>

          {!token ? (
            <>
              <h1>Invalid link</h1>
              <p style={{ color: "var(--nm-mist)" }}>
                This sign-in link is missing its code. Generate a new QR code on
                your computer and scan it again.
              </p>
            </>
          ) : phase === "done" ? (
            <>
              <h1>✓ Approved</h1>
              <p style={{ color: "var(--nm-mist)" }}>
                You can return to your computer &mdash; it&rsquo;s signing in now.
                You can close this tab.
              </p>
            </>
          ) : loading ? (
            <p style={{ color: "var(--nm-mist)" }}>Loading…</p>
          ) : user ? (
            /* ---------- authenticated: approve ---------- */
            <>
              <h1>Approve sign-in?</h1>
              <p style={{ color: "var(--nm-mist)" }}>
                Approve signing in to Hayward Harvest as{" "}
                <strong>{user.displayName}</strong> (@{user.username}) on the
                device that showed this code.
              </p>
              {error && <p className="form-error">{error}</p>}
              <div className="msp-actions" style={{ marginTop: "1.25rem" }}>
                <button
                  className="btn-glass primary"
                  onClick={approve}
                  disabled={phase === "working"}
                >
                  {phase === "working" ? "Approving…" : "Approve sign-in"}
                </button>
                <Link className="btn-glass" href="/account">
                  Cancel
                </Link>
              </div>
              <p className="form-note" style={{ marginTop: "1rem" }}>
                Only approve if you just scanned this code yourself.
              </p>
            </>
          ) : (
            /* ---------- not signed in: sign in first ---------- */
            <>
              <h1>{mode === "login" ? "Sign in to approve" : "Create an account"}</h1>
              <p style={{ color: "var(--nm-mist)" }}>
                {mode === "login"
                  ? "Sign in on your phone, then approve the computer waiting for this code."
                  : "Make an account, then approve the computer waiting for this code."}
              </p>
              <form className="form" onSubmit={onAuth} style={{ maxWidth: "none" }}>
                <div>
                  <label htmlFor="u">Username</label>
                  <input
                    id="u"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                {mode === "signup" && (
                  <div>
                    <label htmlFor="dn">Display name (optional)</label>
                    <input
                      id="dn"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How neighbors see you"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="pw">Password</label>
                  <input
                    id="pw"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                  />
                  {mode === "signup" && <p className="form-note">At least 8 characters.</p>}
                </div>
                {authError && <p className="form-error">{authError}</p>}
                <div>
                  <button className="btn btn-primary" type="submit" disabled={authBusy} style={{ width: "100%" }}>
                    {authBusy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                  </button>
                </div>
              </form>
              <p style={{ marginTop: "1rem" }}>
                {mode === "login" ? "New here? " : "Already have an account? "}
                <button
                  className="link-btn"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setAuthError(null);
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

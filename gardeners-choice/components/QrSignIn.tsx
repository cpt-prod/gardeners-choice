"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useAccount } from "@/lib/useAccount";

type Phase = "loading" | "ready" | "approved" | "expired" | "error";

/**
 * Desktop side of QR sign-in. Requests a one-time token, renders it as a QR code
 * pointing at /qr/<token>, and polls until a phone approves it — at which point
 * the poll response sets our session cookie and we land on /account.
 */
export default function QrSignIn() {
  const router = useRouter();
  const { refresh } = useAccount();
  const [phase, setPhase] = useState<Phase>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
  }, []);

  const start = useCallback(async () => {
    clearTimers();
    setPhase("loading");
    setQrDataUrl("");
    try {
      const res = await fetch("/api/auth/qr/start", { method: "POST" });
      if (!res.ok) throw new Error("start failed");
      const { token, expiresAt } = await res.json();

      const url = `${window.location.origin}/qr/${token}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        color: { dark: "#10140f", light: "#f4f1e8" },
      });
      setQrDataUrl(dataUrl);
      setPhase("ready");

      // countdown
      const updateLeft = () => {
        const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        setSecondsLeft(left);
        if (left <= 0) {
          clearTimers();
          setPhase("expired");
        }
      };
      updateLeft();
      tickRef.current = setInterval(updateLeft, 1000);

      // poll for approval
      pollRef.current = setInterval(async () => {
        try {
          const s = await fetch(
            `/api/auth/qr/status?token=${encodeURIComponent(token)}`,
            { cache: "no-store" }
          );
          const data = await s.json();
          if (data.status === "approved") {
            clearTimers();
            setPhase("approved");
            await refresh();
            router.push("/account");
          } else if (data.status === "expired") {
            clearTimers();
            setPhase("expired");
          }
        } catch {
          /* transient — keep polling */
        }
      }, 2000);
    } catch {
      setPhase("error");
    }
  }, [clearTimers, refresh, router]);

  useEffect(() => {
    start();
    return clearTimers;
  }, [start, clearTimers]);

  return (
    <div className="qr-signin">
      <div className="qr-frame">
        {phase === "ready" && qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Sign-in QR code" width={240} height={240} />
        ) : phase === "loading" ? (
          <div className="qr-placeholder">Generating code…</div>
        ) : phase === "approved" ? (
          <div className="qr-placeholder qr-ok">✓ Approved<br />Signing you in…</div>
        ) : phase === "expired" ? (
          <div className="qr-placeholder">
            Code expired
            <button className="btn btn-primary" style={{ marginTop: "0.9rem" }} onClick={start}>
              Generate new code
            </button>
          </div>
        ) : (
          <div className="qr-placeholder">
            Couldn&rsquo;t load code
            <button className="btn btn-ghost" style={{ marginTop: "0.9rem" }} onClick={start}>
              Try again
            </button>
          </div>
        )}
      </div>

      <ol className="qr-steps">
        <li>Open your phone&rsquo;s camera and point it at this code.</li>
        <li>Tap the link &mdash; it opens Hayward Harvest.</li>
        <li>Sign in on your phone (or approve if already signed in).</li>
      </ol>

      {phase === "ready" && (
        <p className="qr-expiry">
          Code refreshes in <strong>{secondsLeft}s</strong>
        </p>
      )}
    </div>
  );
}

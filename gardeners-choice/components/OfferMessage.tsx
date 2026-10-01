"use client";

import type { OfferMessage } from "@/lib/types";
import { formatTokens, formatRelativeTime } from "@/lib/format";

export default function OfferMessageView({ msg }: { msg: OfferMessage }) {
  const cls = [
    "thread-msg",
    `from-${msg.from}`,
    msg.kind !== "message" ? `kind-${msg.kind}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  let body: React.ReactNode = null;
  if (msg.kind === "offer" || msg.kind === "counter") {
    body = (
      <>
        {msg.text && <div>{msg.text}</div>}
        {msg.amountTokens != null && (
          <div style={{ marginTop: "0.4rem" }}>
            Amount: <span className="token-pill">{msg.amountTokens}</span>
          </div>
        )}
      </>
    );
  } else if (msg.kind === "accept") {
    body = (
      <>
        <div>
          <strong>Accepted</strong> at{" "}
          {msg.amountTokens != null ? formatTokens(msg.amountTokens) : "agreed price"}.
        </div>
        {msg.text && <div style={{ marginTop: "0.25rem" }}>{msg.text}</div>}
      </>
    );
  } else if (msg.kind === "decline") {
    body = (
      <>
        <div>
          <strong>Declined</strong>.
        </div>
        {msg.text && <div style={{ marginTop: "0.25rem" }}>{msg.text}</div>}
      </>
    );
  } else {
    body = <div>{msg.text}</div>;
  }

  return (
    <div className={cls}>
      <div style={{ fontSize: "0.75rem", opacity: 0.75, marginBottom: "0.2rem" }}>
        {msg.from === "buyer" ? "You" : "Vendor"} · {formatRelativeTime(msg.ts)}
      </div>
      {body}
    </div>
  );
}

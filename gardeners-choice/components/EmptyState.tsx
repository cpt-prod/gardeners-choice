import Link from "next/link";

export default function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>{title}</h3>
      {body && <p style={{ color: "var(--c-ink-soft)" }}>{body}</p>}
      {cta && (
        <Link href={cta.href} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <header
      className="glass-panel"
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        padding: "0.5rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        minWidth: "max-content"
      }}
    >
      <Link href="/" className="brand" style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 800, color: "var(--c-forest-dark)", fontSize: "1.1rem", textDecoration: "none" }}>
        <span className="brand-mark" style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, var(--c-forest) 0%, var(--c-gold) 100%)", display: "inline-block" }} />
        Gardener&rsquo;s Choice
      </Link>

      <nav>
        <ul className="nav-links" style={{ display: "flex", gap: "1.5rem", listStyle: "none", margin: 0, padding: 0 }}>
          <li><Link href="/" style={{ color: "var(--c-ink-soft)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>Home</Link></li>
          <li><Link href="/map" style={{ color: "var(--c-ink-soft)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>Map</Link></li>
          <li><Link href="/about" style={{ color: "var(--c-ink-soft)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>About</Link></li>
          <li>
            <a
              href="https://example.com/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
            >
              Support Bianca
            </a>
          </li>
          <li><Link href="/contact" style={{ color: "var(--c-ink-soft)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "@/lib/useAccount";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Map" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/videos", label: "Videos" },
  { href: "/about", label: "About" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];

/** Floating glass nav — same visual language as the Living Map overlay. */
export default function Nav() {
  const { user, loading } = useAccount();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Hayward Harvest home">
          <span className="brand-mark" aria-hidden="true" />
          Hayward Harvest
        </Link>
        <nav>
          <ul className="nav-links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={isActive(l.href) ? "active" : undefined}
                  aria-current={isActive(l.href) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              {loading ? (
                <span className="nav-donate" style={{ opacity: 0.5 }}>…</span>
              ) : user ? (
                <Link href="/account" className="btn btn-primary nav-donate">
                  {user.displayName}
                </Link>
              ) : (
                <Link href="/signin" className="btn btn-primary nav-donate">
                  Sign in
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

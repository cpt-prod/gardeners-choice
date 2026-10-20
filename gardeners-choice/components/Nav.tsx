"use client";

import Link from "next/link";
import { useAccount } from "@/lib/useAccount";

export default function Nav() {
  const { user, loading } = useAccount();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Hayward Harvest home">
          <span className="brand-mark" aria-hidden="true" />
          Hayward Harvest
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/map">Map</Link></li>
            <li><Link href="/marketplace">Marketplace</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
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

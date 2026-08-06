import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand" aria-label="Gardener's Choice home">
          <span className="brand-mark" aria-hidden="true" />
          Gardener&rsquo;s Choice
        </Link>
        <nav>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/map">Map</Link></li>
            <li><Link href="/about">About</Link></li>
            <li>
              <a
                href="https://example.com/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary nav-donate"
              >
                Support Bianca
              </a>
            </li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="brand-mark" aria-hidden="true" style={{ width: 20, height: 20, borderRadius: 6 }} />
            Hayward Harvest
          </strong>
          <div style={{ fontSize: "0.9rem", marginTop: "0.3rem" }}>
            A community project. No one should go hungry.
          </div>
        </div>
        <div>
          <a href="/map">Find food near you</a>
          {" · "}
          <a href="/marketplace">Marketplace</a>
          {" · "}
          <a href="/videos">Videos</a>
          {" · "}
          <a href="/donate">Donate</a>
          {" · "}
          <a href="/about">About</a>
          {" · "}
          <a href="/contact">Contact</a>
        </div>
        <div>
          <a
            href="https://example.com/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Support Bianca&rsquo;s project &rarr;
          </a>
          <div style={{ opacity: 0.7, fontSize: "0.8rem", marginTop: "0.5rem" }}>
            100% of donations go to keeping Hayward Harvest free and growing.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>Gardener&rsquo;s Choice</strong>
          <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>
            A community project. No one should go hungry.
          </div>
        </div>
        <div>
          <a href="/map">Find food near you</a>
          {" · "}
          <a href="/donate">Donate</a>
          {" · "}
          <a href="/about">About</a>
          {" · "}
          <a href="/contact">Contact</a>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <a
            href="https://example.com/donate"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Support Bianca&rsquo;s project &rarr;
          </a>
          <div style={{ opacity: 0.7, fontSize: "0.8rem", marginTop: "0.5rem" }}>
            100% of donations go to keeping Gardener&rsquo;s Choice free and growing.
          </div>
        </div>
      </div>
    </footer>
  );
}

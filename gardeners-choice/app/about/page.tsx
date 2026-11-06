import Link from "next/link";

export const metadata = { title: "About — Hayward Harvest" };

const PRINCIPLES = [
  { icon: "🌾", gold: false, title: "Free, always", body: "No paywalls, no premium tiers, no data collection. The map is a public good." },
  { icon: "🤝", gold: true, title: "Dignity first", body: "We design for people having a hard day. Clear language, no signups to find food, no screenshots of pay stubs." },
  { icon: "🏡", gold: false, title: "Community-owned", body: "Site listings are added and updated by the people who use them most. See something off? Tell us." },
  { icon: "📂", gold: true, title: "Open data", body: "Our site directory is a plain data file. Anyone can fork it, host a version for their city, and contribute back." },
];

export default function About() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="page-head glass-panel">
            <p className="kicker">Our story</p>
            <h1>About Hayward Harvest</h1>
            <p className="lede">
              Hayward Harvest started with a simple frustration: knowing where to
              get food shouldn&rsquo;t be one. We&rsquo;re building an open,
              community-maintained map that puts the closest pantry, the ripest
              fig tree, and the right person to call for help &mdash; all in one
              place.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <p className="kicker">What we stand for</p>
          <h2>Our principles</h2>
          <div className="grid">
            {PRINCIPLES.map((p) => (
              <div className="card" key={p.title}>
                <div className={`card-icon${p.gold ? " gold" : ""}`}>{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="split">
            <div className="card" style={{ padding: "1.75rem 2rem" }}>
              <p className="kicker">Under the hood</p>
              <h2>How the map works</h2>
              <p>
                Every pin on the map is one of two things: a{" "}
                <span className="badge badge-food">Food bank</span> or pantry
                where you can get groceries and meals, or a{" "}
                <span className="badge badge-harvest">Harvest site</span> where
                you can pick free, in-season food from a community garden,
                orchard, or edible park. Click any pin for hours, address, and
                direct contact info.
              </p>
              <p style={{ marginBottom: 0 }}>
                The map is built on OpenStreetMap &mdash; free and open &mdash;
                so we never have to charge you, sell your location, or ask for a
                credit card.
              </p>
            </div>
            <aside className="side glass-panel">
              <div className="msp-header">
                <h2 className="msp-title">Jump in</h2>
                <p className="msp-sub">Three ways to use Hayward Harvest</p>
              </div>
              <div className="msp-body">
                <Link href="/map" className="site-card" style={{ textDecoration: "none" }}>
                  <span className="type-badge food">Find</span>
                  <h4>Open the living map</h4>
                  <p className="sc-meta">Food banks &amp; harvest sites near you</p>
                </Link>
                <Link href="/marketplace" className="site-card" style={{ textDecoration: "none" }}>
                  <span className="type-badge harvest">Share</span>
                  <h4>Post surplus food</h4>
                  <p className="sc-meta">Give away extra harvest to neighbors</p>
                </Link>
                <Link href="/contact" className="site-card" style={{ textDecoration: "none", marginBottom: 0 }}>
                  <span className="type-badge food">Contribute</span>
                  <h4>Add or fix a listing</h4>
                  <p className="sc-meta">Help keep the map accurate</p>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

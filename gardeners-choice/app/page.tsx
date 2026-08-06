import Link from "next/link";
import { sites } from "@/lib/data";

export default function Home() {
  const foodBanks = sites.filter((s) => s.type === "food-bank").length;
  const harvestSites = sites.filter((s) => s.type === "harvest").length;

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Find food. Share harvest. Look out for each other.</h1>
          <p className="lede">
            Gardener&rsquo;s Choice is a free community map of food banks, pantries, and
            harvesting sites. Whether you need a meal tonight or you have a tree
            full of fruit to share, this is where we find each other.
          </p>
          <div className="hero-actions">
            <Link href="/map" className="btn btn-primary">
              Open the map
            </Link>
            <Link href="/donate" className="btn btn-ghost">
              Donate
            </Link>
            <Link href="/about" className="btn btn-ghost">
              Learn how it works
            </Link>
          </div>

          <div className="stat-row">
            <div className="stat">
              <div className="stat-num">{foodBanks}</div>
              <div className="stat-lbl">Food banks &amp; pantries</div>
            </div>
            <div className="stat">
              <div className="stat-num">{harvestSites}</div>
              <div className="stat-lbl">Free harvest sites</div>
            </div>
            <div className="stat">
              <div className="stat-num">100%</div>
              <div className="stat-lbl">Free, no signup</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>What you&rsquo;ll find here</h2>
          <div className="grid">
            <div className="card">
              <span className="badge badge-food">Food bank</span>
              <h3 style={{ marginTop: "0.5rem" }}>Pantry &amp; meal programs</h3>
              <p>
                Walk-in pantries, hot meal services, and emergency boxes. Most
                don&rsquo;t require ID or proof of need.
              </p>
            </div>
            <div className="card">
              <span className="badge badge-harvest">Harvest site</span>
              <h3 style={{ marginTop: "0.5rem" }}>Free produce in season</h3>
              <p>
                Community gardens, fruit orchards, and edible parks where you can
                pick fresh, free food for your family.
              </p>
            </div>
            <div className="card">
              <span className="badge badge-food">Resources</span>
              <h3 style={{ marginTop: "0.5rem" }}>More than food</h3>
              <p>
                Many sites also help with SNAP/CalFresh sign-up, WIC, baby
                formula, hygiene kits, and case management.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <div className="card" style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2>Run a site? Get listed.</h2>
              <p>
                If you operate a food pantry, community garden, or free harvest
                site, we&rsquo;d love to add you to the map. It&rsquo;s free
                and takes about five minutes.
              </p>
            </div>
            <Link href="/contact" className="btn btn-primary">
              Add a site
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

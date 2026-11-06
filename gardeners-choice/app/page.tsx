import Link from "next/link";
import { sites } from "@/lib/data";
import GardenBackdrop from "@/components/GardenBackdrop";
import DailyTip from "@/components/DailyTip";

const cardLink = { color: "inherit", textDecoration: "none" } as const;

export default function Home() {
  const foodBanks = sites.filter((s) => s.type === "food-bank").length;
  const harvestSites = sites.filter((s) => s.type === "harvest").length;

  return (
    <>
      <section className="hero hero-video">
        <GardenBackdrop />
        <div className="container hero-content">
          <p className="kicker">Hayward, CA · Community food network</p>
          <h1>
            Find food. Share harvest.{" "}
            <span className="text-gradient">Look out for each other.</span>
          </h1>
          <p className="lede">
            Hayward Harvest is a free community map of food banks, pantries, and
            harvesting sites. Whether you need a meal tonight or you have a tree
            full of fruit to share, this is where we find each other.
          </p>
          <div className="hero-actions">
            <Link href="/map" className="btn btn-primary">
              Open the living map →
            </Link>
            <Link href="/marketplace" className="btn btn-ghost">
              Browse marketplace
            </Link>
            <Link href="/videos" className="btn btn-ghost">
              Watch garden videos
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
              <div className="stat-lbl">Free to use</div>
            </div>
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <DailyTip />
        </div>
      </section>

      <section>
        <div className="container">
          <p className="kicker">What you&rsquo;ll find here</p>
          <h2>More than a map</h2>
          <div className="grid">
            <Link href="/map" className="card" style={cardLink}>
              <div className="card-icon">🥫</div>
              <span className="badge badge-food">Food bank</span>
              <h3 style={{ marginTop: "0.5rem" }}>Pantry &amp; meal programs</h3>
              <p>
                Walk-in pantries, hot meal services, and emergency boxes. Most
                don&rsquo;t require ID or proof of need.
              </p>
            </Link>
            <Link href="/map" className="card" style={cardLink}>
              <div className="card-icon gold">🍋</div>
              <span className="badge badge-harvest">Harvest site</span>
              <h3 style={{ marginTop: "0.5rem" }}>Free produce in season</h3>
              <p>
                Community gardens, fruit orchards, and edible parks where you can
                pick fresh, free food for your family.
              </p>
            </Link>
            <Link href="/marketplace" className="card" style={cardLink}>
              <div className="card-icon gold">🧺</div>
              <span className="badge badge-harvest">Marketplace</span>
              <h3 style={{ marginTop: "0.5rem" }}>Neighbor-to-neighbor</h3>
              <p>
                Post your surplus harvest or pantry goods for free, and claim
                what you need from people nearby.
              </p>
            </Link>
            <Link href="/videos" className="card" style={cardLink}>
              <div className="card-icon">🎬</div>
              <span className="badge badge-food">Videos</span>
              <h3 style={{ marginTop: "0.5rem" }}>Learn to grow</h3>
              <p>
                Short how-to clips and harvest tours shared by local gardeners.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <div className="card cta-band">
            <div>
              <p className="kicker">For organizers</p>
              <h2>Run a site? Get listed.</h2>
              <p>
                If you operate a food pantry, community garden, or free harvest
                site, we&rsquo;d love to add you to the map. It&rsquo;s free
                and takes about five minutes.
              </p>
            </div>
            <Link href="/contact" className="btn btn-gold">
              Add a site →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

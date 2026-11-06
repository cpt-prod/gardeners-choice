export const metadata = {
  title: "Donate — Hayward Harvest",
  description:
    "Donate to a California food bank. Every dollar helps a neighbor eat. 100% goes to food distribution.",
};

const PARTNERS = [
  {
    name: "California Association of Food Banks",
    blurb:
      "The statewide network of 42 food banks serving every California county. Donations fund food sourcing, distribution, and advocacy.",
    url: "https://www.cafoodbanks.org/donate",
    cta: "Donate to CAFB",
    region: "Statewide",
  },
  {
    name: "Feeding America (national network)",
    blurb:
      "The largest hunger-relief organization in the U.S. Routes food and funds through more than 200 regional food banks, including most in California.",
    url: "https://www.feedingamerica.org/take-action/donate",
    cta: "Donate to Feeding America",
    region: "National",
  },
  {
    name: "Second Harvest of Silicon Valley",
    blurb:
      "Serves Santa Clara and San Mateo counties. One in four residents gets food assistance here — among the highest need in the state.",
    url: "https://www.shfb.org/donate",
    cta: "Donate to Second Harvest SV",
    region: "Bay Area",
  },
  {
    name: "Los Angeles Regional Food Bank",
    blurb:
      "Distributes food across LA County through 600+ partner agencies. One of the largest food banks in the country.",
    url: "https://www.lafoodbank.org/donate",
    cta: "Donate to LA Food Bank",
    region: "Southern CA",
  },
  {
    name: "Feeding San Diego",
    blurb:
      "San Diego County's leading hunger-relief organization. Distributes food through 300+ partner sites.",
    url: "https://feedingsandiego.org/donate/",
    cta: "Donate to Feeding San Diego",
    region: "Southern CA",
  },
  {
    name: "Sacramento Food Bank & Family Services",
    blurb:
      "Sacramento County's largest food bank. Runs the region's biggest free-produce program.",
    url: "https://www.sacramentofoodbank.org/donate",
    cta: "Donate to Sacramento Food Bank",
    region: "Central Valley",
  },
];

export default function Donate() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="page-head glass-panel">
            <div className="page-head-row">
              <div>
                <p className="kicker">Feed a neighbor</p>
                <h1>Donate.</h1>
                <p className="lede">
                  Every dollar buys more food than you can imagine &mdash; most
                  California food banks turn $1 into 4&ndash;7 meals. Pick a
                  partner below.
                </p>
              </div>
              <div className="head-stats">
                <div className="head-stat">
                  <b>$1 → 4–7</b>
                  <span>Meals per dollar</span>
                </div>
                <div className="head-stat">
                  <b>42</b>
                  <span>CA food banks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: "1rem" }}>
        <div className="container">
          <div className="card cta-band" style={{ marginBottom: "2.5rem" }}>
            <div>
              <span className="badge badge-harvest">★ Recommended</span>
              <h2 style={{ marginTop: "0.6rem" }}>California Association of Food Banks</h2>
              <p>
                The easiest way to make sure your donation reaches every corner
                of the state. CAFB coordinates food sourcing and distribution
                across all 42 member food banks &mdash; one donation, the whole
                network.
              </p>
            </div>
            <a
              href="https://www.cafoodbanks.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Donate to CAFB &rarr;
            </a>
          </div>

          <p className="kicker">Give locally</p>
          <h2>Or give directly to a regional food bank</h2>
          <p style={{ maxWidth: "60ch", color: "var(--nm-mist)" }}>
            Want your donation to stay local? Every organization below is a
            registered 501(c)(3). Donations are tax-deductible.
          </p>

          <div className="grid">
            {PARTNERS.slice(1).map((p) => (
              <div className="card" key={p.name} style={{ display: "flex", flexDirection: "column" }}>
                <span className="type-badge food" style={{ alignSelf: "flex-start" }}>{p.region}</span>
                <h3 style={{ marginTop: "0.6rem" }}>{p.name}</h3>
                <p style={{ flex: 1 }}>{p.blurb}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ alignSelf: "flex-start" }}
                >
                  {p.cta} &rarr;
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <div className="card" style={{ padding: "1.75rem 2rem" }}>
            <p className="kicker">Beyond dollars</p>
            <h3>Other ways to help</h3>
            <ul className="glass-list">
              <li>
                <strong>Volunteer</strong> at a food bank or community garden.
                Most have weekend shifts that don&rsquo;t require a long-term
                commitment.
              </li>
              <li>
                <strong>Donate food</strong> &mdash; non-perishables, baby
                formula, diapers, and hygiene products are the highest-need
                items at most pantries.
              </li>
              <li>
                <strong>Advocate</strong> for CalFresh and WIC expansion. Policy
                changes feed more people than any single donation.
              </li>
              <li>
                <strong>Add a site</strong> to this map if you know of one
                that&rsquo;s missing. <a href="/contact">Submit a listing</a>.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

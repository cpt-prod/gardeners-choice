export const metadata = {
  title: "Donate — Gardener's Choice",
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
  },
  {
    name: "Feeding America (national network)",
    blurb:
      "The largest hunger-relief organization in the U.S. Routes food and funds through more than 200 regional food banks, including most in California.",
    url: "https://www.feedingamerica.org/take-action/donate",
    cta: "Donate to Feeding America",
  },
  {
    name: "Second Harvest of Silicon Valley",
    blurb:
      "Serves Santa Clara and San Mateo counties. One in four residents gets food assistance here — among the highest need in the state.",
    url: "https://www.shfb.org/donate",
    cta: "Donate to Second Harvest SV",
  },
  {
    name: "Los Angeles Regional Food Bank",
    blurb:
      "Distributes food across LA County through 600+ partner agencies. One of the largest food banks in the country.",
    url: "https://www.lafoodbank.org/donate",
    cta: "Donate to LA Food Bank",
  },
  {
    name: "Feeding San Diego",
    blurb:
      "San Diego County's leading hunger-relief organization. Distributes food through 300+ partner sites.",
    url: "https://feedingsandiego.org/donate/",
    cta: "Donate to Feeding San Diego",
  },
  {
    name: "Sacramento Food Bank & Family Services",
    blurb:
      "Sacramento County's largest food bank. Runs the region's biggest free-produce program.",
    url: "https://www.sacramentofoodbank.org/donate",
    cta: "Donate to Sacramento Food Bank",
  },
];

export default function Donate() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Donate.</h1>
          <p className="lede">
            Every dollar buys more food than you can imagine — most California
            food banks turn $1 into 4&ndash;7 meals. 100% of your donation goes
            to food distribution. Pick a partner below.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="card" style={{ marginBottom: "2rem" }}>
            <span className="badge badge-food">Recommended</span>
            <h2 style={{ marginTop: "0.5rem" }}>California Association of Food Banks</h2>
            <p>
              The easiest way to make sure your donation reaches every corner of
              the state. CAFB coordinates food sourcing and distribution across
              all 42 member food banks &mdash; one donation, the whole network.
            </p>
            <a
              href="https://www.cafoodbanks.org/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Donate to CAFB &rarr;
            </a>
          </div>

          <h2>Or give directly to a regional food bank</h2>
          <p style={{ maxWidth: "60ch", color: "var(--c-ink-soft)" }}>
            Want your donation to stay local? Every organization below is a
            registered 501(c)(3). Donations are tax-deductible.
          </p>

          <div className="grid">
            {PARTNERS.slice(1).map((p) => (
              <div className="card" key={p.name}>
                <h3>{p.name}</h3>
                <p>{p.blurb}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
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
          <div className="card">
            <h3>Other ways to help</h3>
            <ul style={{ paddingLeft: "1.2rem", lineHeight: 1.8 }}>
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
                <strong>Add a site</strong> to this map if you know of one that&rsquo;s
                missing. <a href="/contact">Submit a listing</a>.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

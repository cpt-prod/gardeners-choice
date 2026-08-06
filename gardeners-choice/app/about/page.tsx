export const metadata = { title: "About — Gardener's Choice" };

export default function About() {
  return (
    <>
      <section>
        <div className="container">
          <h1>About Gardener&rsquo;s Choice</h1>
          <p style={{ fontSize: "1.1rem", maxWidth: "65ch" }}>
            Gardener&rsquo;s Choice started with a simple frustration: knowing where to
            get food shouldn&rsquo;t be one. We&rsquo;re building an open,
            community-maintained map that puts the closest pantry, the ripest
            fig tree, and the right person to call for help &mdash; all in one
            place.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>Our principles</h2>
          <div className="grid">
            <div className="card">
              <h3>Free, always</h3>
              <p>
                No paywalls, no premium tiers, no data collection. The map is a
                public good.
              </p>
            </div>
            <div className="card">
              <h3>Dignity first</h3>
              <p>
                We design for people having a hard day. Clear language, no
                signups, no screenshots of pay stubs.
              </p>
            </div>
            <div className="card">
              <h3>Community-owned</h3>
              <p>
                Site listings are added and updated by the people who use them
                most. See something off? Tell us.
              </p>
            </div>
            <div className="card">
              <h3>Open data</h3>
              <p>
                Our site directory is a plain JSON file. Anyone can fork it,
                host a version for their city, and contribute back.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <h2>How the map works</h2>
          <p style={{ maxWidth: "65ch" }}>
            Every pin on the map is one of two things: a <strong>food bank</strong>
            {" "}or pantry where you can get groceries and meals, or a {" "}
            <strong>harvest site</strong> where you can pick free, in-season food
            from a community garden, orchard, or edible park. Click any pin for
            hours, address, and direct contact info.
          </p>
          <p style={{ maxWidth: "65ch" }}>
            The map is built on OpenStreetMap &mdash; free and open &mdash; so we
            never have to charge you, sell your location, or ask for a credit
            card.
          </p>
        </div>
      </section>
    </>
  );
}

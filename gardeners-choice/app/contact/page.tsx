export const metadata = { title: "Contact — Hayward Harvest" };

export default function Contact() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="page-head glass-panel">
            <p className="kicker">Say hello</p>
            <h1>Get in touch</h1>
            <p className="lede">
              Have a site to add, a listing to fix, or a partnership idea? Send
              us a note. We read every message.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="split">
            <div className="card" style={{ padding: "1.75rem 2rem" }}>
              <form
                className="form"
                action="mailto:hello@gardenerschoice.org"
                method="post"
                encType="text/plain"
                style={{ maxWidth: "none" }}
              >
                <div>
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" type="text" required />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required />
                </div>
                <div>
                  <label htmlFor="topic">What&rsquo;s this about?</label>
                  <select
                    id="topic"
                    name="topic"
                    style={{ width: "100%", padding: "0.65rem 0.8rem", font: "inherit" }}
                  >
                    <option>Add a new site to the map</option>
                    <option>Update an existing listing</option>
                    <option>Partnership / press</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" required />
                </div>
                <div>
                  <button type="submit" className="btn btn-primary">
                    Send message
                  </button>
                </div>
                <p className="form-note" style={{ margin: 0 }}>
                  This form opens your mail app. If it doesn&rsquo;t open, email
                  us directly at{" "}
                  <a href="mailto:hello@gardenerschoice.org">hello@gardenerschoice.org</a>.
                </p>
              </form>
            </div>

            <aside className="side glass-panel">
              <div className="msp-header">
                <h2 className="msp-title">Before you write</h2>
                <p className="msp-sub">Helpful details for faster replies</p>
              </div>
              <div className="msp-body msp-detail">
                <div className="d-section" style={{ marginTop: 0 }}>
                  <p className="d-label">Adding a site</p>
                  <p className="d-value">
                    Include the name, address, hours, and what&rsquo;s available
                    (produce, hot meals, CalFresh help…).
                  </p>
                </div>
                <div className="d-section">
                  <p className="d-label">Fixing a listing</p>
                  <p className="d-value">
                    Tell us which site and what changed &mdash; we usually update
                    within a few days.
                  </p>
                </div>
                <div className="d-section" style={{ marginBottom: 0 }}>
                  <p className="d-label">Email</p>
                  <p className="d-value">
                    <a href="mailto:hello@gardenerschoice.org">hello@gardenerschoice.org</a>
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

export const metadata = { title: "Contact — Gardener's Choice" };

export default function Contact() {
  return (
    <section>
      <div className="container">
        <h1>Get in touch</h1>
        <p style={{ maxWidth: "60ch" }}>
          Have a site to add, a listing to fix, or a partnership idea? Send us a
          note. We read every message.
        </p>

        <form
          className="form"
          action="mailto:hello@gardenerschoice.org"
          method="post"
          encType="text/plain"
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
              style={{
                width: "100%",
                padding: "0.65rem 0.8rem",
                border: "1px solid var(--c-line)",
                borderRadius: 8,
                background: "var(--c-surface)",
                color: "var(--c-ink)",
                font: "inherit",
              }}
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
              Send
            </button>
          </div>
          <p className="form-note">
            This form opens your mail app. If it doesn&rsquo;t open, email us
            directly at{" "}
            <a href="mailto:hello@gardenerschoice.org">hello@gardenerschoice.org</a>.
          </p>
        </form>
      </div>
    </section>
  );
}

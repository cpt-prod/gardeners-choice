import { sites } from "@/lib/data";
import MarketplaceClient from "@/components/MarketplaceClient";

export const metadata = {
  title: "Marketplace — Gardener's Choice",
  description:
    "Browse foods available at community vendors — CSA boxes, fresh produce, and pantry staples. Premium subscribers can barter and negotiate prices.",
};

export default function MarketplacePage() {
  return (
    <>
      <section className="hero" style={{ padding: "3rem 0 2rem" }}>
        <div className="container">
          <h1>Marketplace</h1>
          <p className="lede">
            Foods available at community vendors — CSA boxes, fresh produce, pantry
            staples, and prepared goods. Most listings on Gardener&rsquo;s Choice are
            still <strong>free</strong> at our partner food banks and harvest sites;
            the marketplace is a separate, optional layer where vendors sell at-cost
            goods to fund their programs.
          </p>
          <p style={{ color: "var(--c-ink-soft)", maxWidth: "65ch" }}>
            <strong>Premium subscribers</strong> can spend tokens to open a barter
            thread with a vendor and negotiate a price — back and forth, until you
            agree.
          </p>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <MarketplaceClient sites={sites} />
        </div>
      </section>
    </>
  );
}

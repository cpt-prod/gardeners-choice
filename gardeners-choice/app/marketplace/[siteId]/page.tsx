import Link from "next/link";
import { notFound } from "next/navigation";
import { sites } from "@/lib/data";
import FoodCard from "@/components/FoodCard";
import EmptyState from "@/components/EmptyState";

export function generateMetadata({ params }: { params: { siteId: string } }) {
  const site = sites.find((s) => s.id === params.siteId);
  return {
    title: site ? `${site.name} — Marketplace` : "Marketplace — Gardener's Choice",
  };
}

export default function VendorPage({ params }: { params: { siteId: string } }) {
  const site = sites.find((s) => s.id === params.siteId);
  if (!site || !site.foods || site.foods.length === 0) notFound();

  return (
    <>
      <section className="hero" style={{ padding: "2.5rem 0 1.5rem" }}>
        <div className="container">
          <p style={{ marginBottom: "0.25rem" }}>
            <Link href="/marketplace">← All vendors</Link>
          </p>
          <h1 style={{ marginBottom: "0.25rem" }}>{site.name}</h1>
          <p className="lede">
            {site.address}, {site.city}, {site.state} {site.zip} ·{" "}
            <a href={`tel:${site.phone}`}>{site.phone}</a>
          </p>
          <p style={{ maxWidth: "65ch", color: "var(--c-ink-soft)" }}>{site.description}</p>
        </div>
      </section>

      <section className="tight">
        <div className="container">
          <h2 style={{ marginBottom: "1rem" }}>Foods available here</h2>
          {site.foods.length === 0 ? (
            <EmptyState
              title="No foods listed yet"
              body="This site shows up on the map but hasn't listed any marketplace items."
            />
          ) : (
            <div className="grid">
              {site.foods.map((f) => (
                <FoodCard key={f.id} site={site} food={f} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

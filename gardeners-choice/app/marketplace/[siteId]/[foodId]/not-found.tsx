import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <div className="container">
        <h1>Food not found</h1>
        <p>We couldn&rsquo;t find that listing.</p>
        <Link href="/marketplace" className="btn btn-primary">
          Back to marketplace
        </Link>
      </div>
    </section>
  );
}

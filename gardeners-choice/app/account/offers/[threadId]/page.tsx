"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProviders } from "@/app/providers";
import { sites } from "@/lib/data";
import OfferThread from "@/components/OfferThread";

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  const { session, threads } = useProviders();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || session.status === "loading") {
    return (
      <section>
        <div className="container">
          <p>Loading…</p>
        </div>
      </section>
    );
  }

  if (session.status === "anon") {
    return (
      <section>
        <div className="container">
          <p>Sign in to view this thread.</p>
          <Link href="/account" className="btn btn-primary">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  const thread = threads.get(params.threadId);
  if (!thread || thread.userId !== session.user!.id) {
    return (
      <section>
        <div className="container">
          <h1>Thread not found</h1>
          <p>It may have been removed, or it belongs to a different account.</p>
          <Link href="/account/offers" className="btn btn-primary">
            Back to threads
          </Link>
        </div>
      </section>
    );
  }

  const site = sites.find((s) => s.id === thread.siteId)!;
  const food = site.foods!.find((f) => f.id === thread.foodId)!;

  return <OfferThread thread={thread} site={site} food={food} />;
}
